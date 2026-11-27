/**
 * E-mail + password accounts on Neon (server-only; never import from a client
 * component). Google sign-ins are not stored here: they stay JWT-only.
 *
 * Local dev and production share one database, so DDL must only ever add things.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/** `emailVerified`: the password was set by the Google owner of this e-mail (see setVerifiedPassword). */
export type AuthUser = { id: string; email: string; name: string; passwordHash: string; emailVerified: boolean };

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function getSql() {
    if (sql) return sql;
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL missing");
    sql = neon(url);
    return sql;
}

export function isUserStoreConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

async function ensureSchema() {
    if (!schemaReady) {
        const db = getSql();
        schemaReady = (async () => {
            await db`
                CREATE TABLE IF NOT EXISTS auth_users (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    email_verified BOOLEAN NOT NULL DEFAULT false,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    last_login_at TIMESTAMPTZ
                )
            `;
            // Tables created before a column existed don't get it from CREATE TABLE IF NOT EXISTS.
            // Keep every later column here as an additive ALTER (the database is shared with production).
            await db`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false`;
            // One-time links (password reset, e-mail verification). Only a SHA-256 of
            // the token is stored, so a database leak does not hand out working links.
            await db`
                CREATE TABLE IF NOT EXISTS auth_tokens (
                    token_hash TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    purpose TEXT NOT NULL,
                    expires_at TIMESTAMPTZ NOT NULL,
                    used_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
            `;
        })().catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    return schemaReady;
}

type Row = { id: string; email: string; name: string; password_hash: string; email_verified: boolean };
const toUser = (row: Row): AuthUser => ({
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    emailVerified: row.email_verified === true,
});

/** `email` must already be normalized (lib/auth/credentials.ts). Returns null when it is taken. */
export async function createUser(input: { email: string; name: string; passwordHash: string }): Promise<AuthUser | null> {
    await ensureSchema();
    const rows = (await getSql()`
        INSERT INTO auth_users (id, email, name, password_hash)
        VALUES (${randomUUID()}, ${input.email}, ${input.name}, ${input.passwordHash})
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, name, password_hash, email_verified
    `) as Row[];
    return rows[0] ? toUser(rows[0]) : null;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
    await ensureSchema();
    const rows = (await getSql()`
        SELECT id, email, name, password_hash, email_verified FROM auth_users WHERE email = ${email} LIMIT 1
    `) as Row[];
    return rows[0] ? toUser(rows[0]) : null;
}

/**
 * Sets a password for a Google-verified e-mail. If someone had already signed up
 * with this e-mail (unverified), the real owner takes the address over: the row
 * gets a fresh id and the old password stops working.
 */
export async function setVerifiedPassword(input: { email: string; name: string; passwordHash: string }): Promise<void> {
    await ensureSchema();
    await getSql()`
        INSERT INTO auth_users (id, email, name, password_hash, email_verified)
        VALUES (${randomUUID()}, ${input.email}, ${input.name}, ${input.passwordHash}, true)
        ON CONFLICT (email) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            id = CASE WHEN auth_users.email_verified THEN auth_users.id ELSE EXCLUDED.id END,
            name = CASE WHEN auth_users.email_verified THEN auth_users.name ELSE EXCLUDED.name END,
            email_verified = true
    `;
}

export async function findUserById(id: string): Promise<AuthUser | null> {
    await ensureSchema();
    const rows = (await getSql()`
        SELECT id, email, name, password_hash, email_verified FROM auth_users WHERE id = ${id} LIMIT 1
    `) as Row[];
    return rows[0] ? toUser(rows[0]) : null;
}

export async function updatePassword(id: string, passwordHash: string): Promise<void> {
    await getSql()`UPDATE auth_users SET password_hash = ${passwordHash} WHERE id = ${id}`;
}

export async function updateName(id: string, name: string): Promise<void> {
    await getSql()`UPDATE auth_users SET name = ${name} WHERE id = ${id}`;
}

export async function deleteUserById(id: string): Promise<void> {
    await ensureSchema();
    await getSql()`DELETE FROM auth_users WHERE id = ${id}`;
}

/** Removes the password a Google user added for their verified e-mail (an unverified sign-up by someone else stays). */
export async function deleteVerifiedUserByEmail(email: string): Promise<void> {
    await ensureSchema();
    await getSql()`DELETE FROM auth_users WHERE email = ${email} AND email_verified = true`;
}

export async function recordLogin(id: string): Promise<void> {
    await getSql()`UPDATE auth_users SET last_login_at = now() WHERE id = ${id}`;
}

/** Clicking a link we e-mailed proves the address belongs to this account. */
export async function markEmailVerified(id: string): Promise<void> {
    await getSql()`UPDATE auth_users SET email_verified = true WHERE id = ${id}`;
}

export type TokenPurpose = "reset" | "verify";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Issues a one-time link token. Older unused tokens of the same purpose for this
 * user stop working, and expired tokens are cleaned up on the way.
 */
export async function createToken(userId: string, purpose: TokenPurpose, ttlMinutes: number): Promise<string> {
    await ensureSchema();
    const db = getSql();
    const token = randomBytes(32).toString("base64url");
    await db`DELETE FROM auth_tokens WHERE expires_at < now() - interval '1 day'`;
    await db`UPDATE auth_tokens SET used_at = now() WHERE user_id = ${userId} AND purpose = ${purpose} AND used_at IS NULL`;
    await db`
        INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at)
        VALUES (${hashToken(token)}, ${userId}, ${purpose}, now() + make_interval(mins => ${ttlMinutes}))
    `;
    return token;
}

/** Uses up a token in one statement (so it can't be used twice) and returns its user, or null. */
export async function consumeToken(token: string, purpose: TokenPurpose): Promise<string | null> {
    if (typeof token !== "string" || token.length < 20 || token.length > 100) return null;
    await ensureSchema();
    const rows = (await getSql()`
        UPDATE auth_tokens SET used_at = now()
        WHERE token_hash = ${hashToken(token)} AND purpose = ${purpose} AND used_at IS NULL AND expires_at > now()
        RETURNING user_id
    `) as { user_id: string }[];
    return rows[0]?.user_id ?? null;
}

/** Signing out everywhere is not possible with JWT sessions, but old reset links must die with the password. */
export async function revokeTokens(userId: string): Promise<void> {
    await getSql()`UPDATE auth_tokens SET used_at = now() WHERE user_id = ${userId} AND used_at IS NULL`;
}
