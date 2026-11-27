/**
 * Member list for the admin panel (server-only; never import from a client component).
 *
 * Google sign-ins used to live only in the session cookie, so the site had no
 * list of its members. Every sign-in (Google or e-mail + password) now upserts
 * one row here: name, e-mail, when they first and last signed in, how many
 * times. The jwt callback in auth.ts also refreshes `last_seen` at most every
 * few hours while a session is in use, which picks up members whose session
 * started before this table existed.
 *
 * Rows are removed with the account (DELETE /api/auth/account).
 * Local dev and production share one database, so DDL must only ever add things.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { MEMBER_SEEN_REFRESH_SECONDS, memberKey, type MemberIdentity } from "@/lib/admin/memberFormat";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;
/**
 * Per-instance throttle for the "still here" refresh. auth() in route handlers
 * cannot rewrite the session cookie, so the token's own timestamp may lag;
 * this keeps e.g. a Plaka game from writing a row on every answer.
 */
const lastRefresh = new Map<string, number>();

function getSql() {
    if (sql) return sql;
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL missing");
    sql = neon(url);
    return sql;
}

export function isMemberStoreConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export async function ensureMemberSchema() {
    if (!schemaReady) {
        const db = getSql();
        schemaReady = (async () => {
            await db`
                CREATE TABLE IF NOT EXISTS auth_members (
                    member_key TEXT PRIMARY KEY,
                    provider TEXT NOT NULL,
                    email TEXT,
                    name TEXT,
                    first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
                    last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
                    last_sign_in TIMESTAMPTZ,
                    sign_ins INTEGER NOT NULL DEFAULT 0
                )
            `;
            await db`CREATE INDEX IF NOT EXISTS auth_members_email ON auth_members (lower(email))`;
        })().catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    return schemaReady;
}

/**
 * Upserts a member. `signIn` is true on an actual sign-in (counts it and sets
 * `last_sign_in`); false for the periodic "still using the site" refresh.
 */
export async function recordMember(identity: MemberIdentity, signIn: boolean): Promise<void> {
    const key = memberKey(identity);
    if (!key) return;
    const now = Date.now();
    if (!signIn && now - (lastRefresh.get(key) ?? 0) < MEMBER_SEEN_REFRESH_SECONDS * 1000) return;
    lastRefresh.set(key, now);
    if (lastRefresh.size > 5000) lastRefresh.clear();
    await ensureMemberSchema();
    const email = identity.email?.trim().toLowerCase() || null;
    const name = identity.name?.trim().slice(0, 120) || null;
    const provider = identity.provider === "credentials" ? "credentials" : "google";
    await getSql()`
        INSERT INTO auth_members (member_key, provider, email, name, last_sign_in, sign_ins)
        VALUES (${key}, ${provider}, ${email}, ${name}, ${signIn ? new Date().toISOString() : null}, ${signIn ? 1 : 0})
        ON CONFLICT (member_key) DO UPDATE SET
            email = COALESCE(EXCLUDED.email, auth_members.email),
            name = COALESCE(EXCLUDED.name, auth_members.name),
            last_seen = now(),
            last_sign_in = COALESCE(EXCLUDED.last_sign_in, auth_members.last_sign_in),
            sign_ins = auth_members.sign_ins + EXCLUDED.sign_ins
    `;
}

/** Account deletion: removes this sign-in method's row and, for a trusted e-mail, the Google row of that address. */
export async function forgetMember(identity: MemberIdentity, trustedEmail: string | null): Promise<void> {
    await ensureMemberSchema();
    const key = memberKey(identity);
    if (key) await getSql()`DELETE FROM auth_members WHERE member_key = ${key}`;
    if (trustedEmail) await getSql()`DELETE FROM auth_members WHERE provider = 'google' AND lower(email) = ${trustedEmail.toLowerCase()}`;
}
