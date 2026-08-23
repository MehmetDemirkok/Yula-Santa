import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { PaidFetchAnalysis } from './failureAnalysis';

export type EntitlementStatus = 'pending' | 'paid' | 'consumed' | 'credit';

export type Entitlement = {
    id: string;
    email: string;
    postUrl: string;
    paytrToken: string | null;
    status: EntitlementStatus;
    failureCode: string | null;
    failureReason: string | null;
    locale: string;
    createdAt: string;
    creditToken: string | null;
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

export function isLedgerConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

async function ensureSchema() {
    if (schemaReady) return schemaReady;
    const db = getSql();
    schemaReady = (async () => {
        await db`
            CREATE TABLE IF NOT EXISTS tiktok_entitlements (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                post_url TEXT NOT NULL,
                paytr_token TEXT,
                status TEXT NOT NULL,
                failure_code TEXT,
                failure_reason TEXT,
                analysis JSONB,
                credit_token TEXT,
                locale TEXT,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                paid_at TIMESTAMPTZ,
                consumed_at TIMESTAMPTZ,
                credited_at TIMESTAMPTZ
            )
        `;
        // Forward-compatible migration in case the table already exists from the old Stripe-backed schema.
        await db`ALTER TABLE tiktok_entitlements ADD COLUMN IF NOT EXISTS paytr_token TEXT`;
        await db`ALTER TABLE tiktok_entitlements DROP COLUMN IF EXISTS stripe_session_id`;
        await db`CREATE INDEX IF NOT EXISTS tiktok_entitlements_email_status ON tiktok_entitlements (email, status)`;
    })();
    return schemaReady;
}

function mapRow(row: Record<string, unknown>): Entitlement {
    return {
        id: String(row.id),
        email: String(row.email),
        postUrl: String(row.post_url),
        paytrToken: row.paytr_token ? String(row.paytr_token) : null,
        status: row.status as EntitlementStatus,
        failureCode: row.failure_code ? String(row.failure_code) : null,
        failureReason: row.failure_reason ? String(row.failure_reason) : null,
        locale: String(row.locale || 'tr'),
        createdAt: String(row.created_at ?? ''),
        creditToken: row.credit_token ? String(row.credit_token) : null,
    };
}

export async function createPendingEntitlement(input: {
    id: string;
    email: string;
    postUrl: string;
    locale: string;
}): Promise<Entitlement> {
    await ensureSchema();
    const db = getSql();
    const rows = await db`
        INSERT INTO tiktok_entitlements (id, email, post_url, status, locale)
        VALUES (${input.id}, ${input.email}, ${input.postUrl}, 'pending', ${input.locale})
        RETURNING *
    `;
    return mapRow(rows[0] as Record<string, unknown>);
}

export async function attachPaytrToken(id: string, token: string): Promise<void> {
    await ensureSchema();
    const db = getSql();
    await db`
        UPDATE tiktok_entitlements
        SET paytr_token = ${token}, updated_at = now()
        WHERE id = ${id}
    `;
}

export async function markPaid(id: string): Promise<Entitlement | null> {
    await ensureSchema();
    const db = getSql();
    const rows = await db`
        UPDATE tiktok_entitlements
        SET status = CASE WHEN status IN ('pending', 'paid') THEN 'paid' ELSE status END,
            paid_at = COALESCE(paid_at, now()),
            updated_at = now()
        WHERE id = ${id}
        RETURNING *
    `;
    return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function markConsumed(id: string): Promise<void> {
    await ensureSchema();
    const db = getSql();
    await db`
        UPDATE tiktok_entitlements
        SET status = 'consumed', consumed_at = now(), updated_at = now()
        WHERE id = ${id} AND status IN ('paid', 'credit')
    `;
}

export async function grantCredit(
    id: string,
    analysis: PaidFetchAnalysis,
    creditToken: string
): Promise<Entitlement | null> {
    await ensureSchema();
    const db = getSql();
    const rows = await db`
        UPDATE tiktok_entitlements
        SET status = 'credit',
            failure_code = ${analysis.code},
            failure_reason = ${analysis.reason},
            analysis = ${JSON.stringify(analysis)}::jsonb,
            credit_token = ${creditToken},
            credited_at = now(),
            updated_at = now()
        WHERE id = ${id} AND status IN ('paid', 'credit')
        RETURNING *
    `;
    return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getById(id: string): Promise<Entitlement | null> {
    await ensureSchema();
    const db = getSql();
    const rows = await db`SELECT * FROM tiktok_entitlements WHERE id = ${id} LIMIT 1`;
    return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getUsableById(id: string): Promise<Entitlement | null> {
    const row = await getById(id);
    if (!row) return null;
    if (row.status === 'paid' || row.status === 'credit') return row;
    return null;
}
