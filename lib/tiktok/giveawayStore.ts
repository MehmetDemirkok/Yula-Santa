/**
 * Persistence for the extension-collected TikTok giveaway flow.
 * Same Neon Postgres instance as lib/tiktok/ledger.ts, separate tables —
 * the paid Apify/PayTR flow never touches these and is unaffected.
 */
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createGiveawayId } from './giveawayId';

export type GiveawayStatus = 'collecting' | 'drawn';

export type GiveawaySettings = {
    countUserOnce: boolean;
    keyword: string;
    excludeNames: string[];
    winnerCount: number;
    backupCount: number;
};

export type GiveawayResultWinner = { name: string; comment?: string };

export type GiveawayResult = {
    winners: GiveawayResultWinner[];
    backups: { name: string }[];
    total: number;
    eligible: number;
    seed: string;
    at: string;
};

export type Giveaway = {
    id: string;
    videoUrl: string;
    status: GiveawayStatus;
    settings: GiveawaySettings;
    participantCount: number;
    result: GiveawayResult | null;
    locale: string;
    createdAt: string;
    drawnAt: string | null;
};

export type GiveawayComment = {
    username: string;
    displayName: string;
    comment: string;
    commentId: string | null;
    commentedAt: string | null;
};

export type IncomingComment = {
    username: string;
    displayName: string;
    comment: string;
    commentId?: string | null;
    commentedAt?: string | null;
};

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function getSql() {
    if (sql) return sql;
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error('DATABASE_URL missing');
    sql = neon(url);
    return sql;
}

export function isGiveawayStoreConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

async function ensureSchema() {
    if (schemaReady) return schemaReady;
    const db = getSql();
    schemaReady = (async () => {
        await db`
            CREATE TABLE IF NOT EXISTS tiktok_giveaways (
                id TEXT PRIMARY KEY,
                owner_token TEXT NOT NULL,
                video_url TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'collecting',
                count_user_once BOOLEAN NOT NULL DEFAULT true,
                keyword TEXT,
                exclude_names JSONB NOT NULL DEFAULT '[]'::jsonb,
                participant_count INT NOT NULL DEFAULT 0,
                winner_count INT NOT NULL DEFAULT 1,
                backup_count INT NOT NULL DEFAULT 0,
                result JSONB,
                locale TEXT DEFAULT 'tr',
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                drawn_at TIMESTAMPTZ
            )
        `;
        await db`
            CREATE TABLE IF NOT EXISTS tiktok_giveaway_comments (
                id BIGSERIAL PRIMARY KEY,
                giveaway_id TEXT NOT NULL REFERENCES tiktok_giveaways(id) ON DELETE CASCADE,
                username TEXT NOT NULL,
                display_name TEXT NOT NULL,
                comment TEXT NOT NULL,
                comment_id TEXT,
                commented_at TIMESTAMPTZ,
                dedupe_key TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now(),
                UNIQUE (giveaway_id, dedupe_key)
            )
        `;
        await db`CREATE INDEX IF NOT EXISTS tiktok_giveaway_comments_gid ON tiktok_giveaway_comments (giveaway_id)`;
    })();
    return schemaReady;
}

function mapGiveawayRow(row: Record<string, unknown>): Giveaway {
    return {
        id: String(row.id),
        videoUrl: String(row.video_url),
        status: row.status as GiveawayStatus,
        settings: {
            countUserOnce: Boolean(row.count_user_once),
            keyword: row.keyword ? String(row.keyword) : '',
            excludeNames: Array.isArray(row.exclude_names) ? (row.exclude_names as unknown[]).map(String) : [],
            winnerCount: Number(row.winner_count) || 1,
            backupCount: Number(row.backup_count) || 0,
        },
        participantCount: Number(row.participant_count) || 0,
        result: (row.result as GiveawayResult | null) ?? null,
        locale: String(row.locale || 'tr'),
        createdAt: String(row.created_at ?? ''),
        drawnAt: row.drawn_at ? String(row.drawn_at) : null,
    };
}

/** 48 hex chars, cryptographically random — never exposed after creation except to the creator. */
export function createOwnerToken(): string {
    return randomBytes(24).toString('hex');
}

export function timingSafeTokenEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length === 0 || bufB.length === 0 || bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
}

/**
 * Priority 1: TikTok's own commentId. Priority 2 (extension couldn't read an id):
 * username + comment + timestamp. See spec §6.
 */
export function computeDedupeKey(c: {
    username: string;
    comment: string;
    commentId?: string | null;
    commentedAt?: string | null;
}): string {
    const commentId = c.commentId?.trim();
    if (commentId) return `id:${commentId}`;
    return `u:${c.username}|c:${c.comment}|t:${c.commentedAt ?? ''}`;
}

export async function createGiveaway(input: {
    videoUrl: string;
    locale: string;
}): Promise<{ giveaway: Giveaway; ownerToken: string }> {
    await ensureSchema();
    const db = getSql();
    const ownerToken = createOwnerToken();

    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt++) {
        const id = createGiveawayId();
        try {
            const rows = await db`
                INSERT INTO tiktok_giveaways (id, owner_token, video_url, locale)
                VALUES (${id}, ${ownerToken}, ${input.videoUrl}, ${input.locale})
                RETURNING *
            `;
            return { giveaway: mapGiveawayRow(rows[0] as Record<string, unknown>), ownerToken };
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError instanceof Error ? lastError : new Error('Failed to create giveaway');
}

type GiveawayRowWithOwner = Giveaway & { ownerToken: string };

async function getGiveawayRow(id: string): Promise<GiveawayRowWithOwner | null> {
    await ensureSchema();
    const db = getSql();
    const rows = await db`SELECT * FROM tiktok_giveaways WHERE id = ${id} LIMIT 1`;
    if (!rows[0]) return null;
    const row = rows[0] as Record<string, unknown>;
    return { ...mapGiveawayRow(row), ownerToken: String(row.owner_token) };
}

export async function getGiveaway(id: string): Promise<Giveaway | null> {
    const row = await getGiveawayRow(id);
    if (!row) return null;
    const { ownerToken: _drop, ...rest } = row;
    void _drop;
    return rest;
}

/** Returns the giveaway only if the supplied owner token matches (constant-time compare). */
export async function requireOwnership(id: string, ownerToken: string): Promise<Giveaway | null> {
    const row = await getGiveawayRow(id);
    if (!row) return null;
    if (!timingSafeTokenEquals(row.ownerToken, ownerToken)) return null;
    const { ownerToken: _drop, ...rest } = row;
    void _drop;
    return rest;
}

export async function updateGiveawaySettings(
    id: string,
    patch: Partial<GiveawaySettings>
): Promise<Giveaway | null> {
    await ensureSchema();
    const current = await getGiveaway(id);
    if (!current) return null;
    const next: GiveawaySettings = { ...current.settings, ...patch };

    const db = getSql();
    const rows = await db`
        UPDATE tiktok_giveaways
        SET count_user_once = ${next.countUserOnce},
            keyword = ${next.keyword.trim() || null},
            exclude_names = ${JSON.stringify(next.excludeNames)}::jsonb,
            winner_count = ${Math.max(1, next.winnerCount)},
            backup_count = ${Math.max(0, next.backupCount)},
            updated_at = now()
        WHERE id = ${id}
        RETURNING *
    `;
    return rows[0] ? mapGiveawayRow(rows[0] as Record<string, unknown>) : null;
}

/**
 * Batch-insert extension-collected comments. Duplicate detection is atomic and
 * concurrency-safe via the (giveaway_id, dedupe_key) unique index — concurrent
 * batches from the same or retried requests can never double-count.
 */
export async function importComments(
    id: string,
    comments: readonly IncomingComment[]
): Promise<{ inserted: number; duplicates: number; totalParticipants: number }> {
    await ensureSchema();
    const db = getSql();

    let inserted = 0;
    for (const c of comments) {
        const dedupeKey = computeDedupeKey(c);
        const rows = await db`
            INSERT INTO tiktok_giveaway_comments
                (giveaway_id, username, display_name, comment, comment_id, commented_at, dedupe_key)
            VALUES
                (${id}, ${c.username}, ${c.displayName}, ${c.comment}, ${c.commentId ?? null}, ${c.commentedAt ?? null}, ${dedupeKey})
            ON CONFLICT (giveaway_id, dedupe_key) DO NOTHING
            RETURNING id
        `;
        if (rows.length > 0) inserted++;
    }

    const countRows = await db`
        SELECT COUNT(*)::int AS c FROM tiktok_giveaway_comments WHERE giveaway_id = ${id}
    `;
    const totalParticipants = Number((countRows[0] as { c: number } | undefined)?.c ?? 0);

    await db`
        UPDATE tiktok_giveaways SET participant_count = ${totalParticipants}, updated_at = now() WHERE id = ${id}
    `;

    return { inserted, duplicates: comments.length - inserted, totalParticipants };
}

export async function listGiveawayComments(id: string): Promise<GiveawayComment[]> {
    await ensureSchema();
    const db = getSql();
    const rows = await db`
        SELECT username, display_name, comment, comment_id, commented_at
        FROM tiktok_giveaway_comments
        WHERE giveaway_id = ${id}
        ORDER BY id ASC
    `;
    return (rows as Record<string, unknown>[]).map((r) => ({
        username: String(r.username),
        displayName: String(r.display_name),
        comment: String(r.comment),
        commentId: r.comment_id ? String(r.comment_id) : null,
        commentedAt: r.commented_at ? String(r.commented_at) : null,
    }));
}

/** Guarded by `status = 'collecting'` so a giveaway can only ever be drawn once. */
export async function markDrawn(id: string, result: GiveawayResult): Promise<Giveaway | null> {
    await ensureSchema();
    const db = getSql();
    const rows = await db`
        UPDATE tiktok_giveaways
        SET status = 'drawn', result = ${JSON.stringify(result)}::jsonb, drawn_at = now(), updated_at = now()
        WHERE id = ${id} AND status = 'collecting'
        RETURNING *
    `;
    return rows[0] ? mapGiveawayRow(rows[0] as Record<string, unknown>) : null;
}
