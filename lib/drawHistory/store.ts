/**
 * Saved draws of signed-in users on Neon (server-only; never import from a
 * client component).
 *
 * Rows are keyed by `owner`, a SHA-256 of the account key (lib/auth/accountKey.ts),
 * so the table holds no e-mail address. The record itself (names, winners,
 * Secret Santa matches) is stored as the user saved it, because showing it back
 * is the point; it is deleted with the account or by the user at any time.
 *
 * Local dev and production share one database, so DDL must only ever add things.
 */
import { createHash, randomUUID } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { accountKey, type SessionLike } from "@/lib/auth/accountKey";
import { LIMITS, winnerPreview, type DrawRecord, type HistoryTool, type SavedDraw, type SavedDrawSummary } from "./types";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function getSql() {
    if (sql) return sql;
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL missing");
    sql = neon(url);
    return sql;
}

export function isDrawHistoryConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

/** The owner id for a session, or null when nobody is signed in. */
export function drawOwner(session: SessionLike): string | null {
    const key = accountKey(session);
    return key ? `acct_${createHash("sha256").update(`draw-history:${key}`).digest("hex")}` : null;
}

async function ensureSchema() {
    if (!schemaReady) {
        const db = getSql();
        schemaReady = (async () => {
            await db`
                CREATE TABLE IF NOT EXISTS user_draws (
                    id TEXT PRIMARY KEY,
                    owner TEXT NOT NULL,
                    tool TEXT NOT NULL,
                    title TEXT,
                    participant_count INTEGER NOT NULL DEFAULT 0,
                    winner_preview JSONB NOT NULL DEFAULT '[]'::jsonb,
                    record JSONB NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
            `;
            await db`CREATE INDEX IF NOT EXISTS user_draws_owner_created ON user_draws (owner, created_at DESC)`;
        })().catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    return schemaReady;
}

type SummaryRow = {
    id: string;
    tool: string;
    title: string | null;
    participant_count: number;
    winner_preview: unknown;
    created_at: string | Date;
};

const iso = (value: string | Date) => (value instanceof Date ? value.toISOString() : new Date(value).toISOString());

const toSummary = (row: SummaryRow): SavedDrawSummary => ({
    id: row.id,
    tool: row.tool as HistoryTool,
    title: row.title,
    participantCount: Number(row.participant_count) || 0,
    winnerPreview: Array.isArray(row.winner_preview) ? row.winner_preview.filter((n): n is string => typeof n === "string") : [],
    createdAt: iso(row.created_at),
});

/** Saves a cleaned record and drops the owner's oldest rows beyond the cap. */
export async function saveDraw(owner: string, record: DrawRecord): Promise<SavedDrawSummary> {
    await ensureSchema();
    const db = getSql();
    const id = randomUUID();
    const rows = (await db`
        INSERT INTO user_draws (id, owner, tool, title, participant_count, winner_preview, record)
        VALUES (${id}, ${owner}, ${record.tool}, ${record.title ?? null}, ${record.participantCount},
                ${JSON.stringify(winnerPreview(record))}::jsonb, ${JSON.stringify(record)}::jsonb)
        RETURNING id, tool, title, participant_count, winner_preview, created_at
    `) as SummaryRow[];
    await db`
        DELETE FROM user_draws
        WHERE owner = ${owner}
          AND id NOT IN (SELECT id FROM user_draws WHERE owner = ${owner} ORDER BY created_at DESC LIMIT ${LIMITS.perAccount})
    `;
    return toSummary(rows[0]);
}

export async function listDraws(owner: string, limit = LIMITS.perAccount): Promise<SavedDrawSummary[]> {
    await ensureSchema();
    const rows = (await getSql()`
        SELECT id, tool, title, participant_count, winner_preview, created_at
        FROM user_draws WHERE owner = ${owner}
        ORDER BY created_at DESC LIMIT ${limit}
    `) as SummaryRow[];
    return rows.map(toSummary);
}

export async function getDraw(owner: string, id: string): Promise<SavedDraw | null> {
    await ensureSchema();
    const rows = (await getSql()`
        SELECT id, record, created_at FROM user_draws WHERE owner = ${owner} AND id = ${id}
    `) as { id: string; record: DrawRecord; created_at: string | Date }[];
    const row = rows[0];
    return row ? { ...row.record, id: row.id, createdAt: iso(row.created_at) } : null;
}

export async function deleteDraw(owner: string, id: string): Promise<boolean> {
    await ensureSchema();
    const rows = (await getSql()`DELETE FROM user_draws WHERE owner = ${owner} AND id = ${id} RETURNING id`) as { id: string }[];
    return rows.length > 0;
}

/** Used by "clear history" and by account deletion. */
export async function deleteAllDraws(owner: string): Promise<number> {
    await ensureSchema();
    const rows = (await getSql()`DELETE FROM user_draws WHERE owner = ${owner} RETURNING id`) as { id: string }[];
    return rows.length;
}
