/**
 * Member list for /admin (server-only). Call only after requireAdmin().
 *
 * Who is a member comes from three places, merged by sign-in method:
 *  - auth_members: every sign-in since the member list was added (lib/auth/memberStore.ts),
 *  - auth_users: e-mail + password accounts, with their real sign-up date,
 *  - analytics_events: e-mails linked to usage before the member list existed
 *    (Google users who accepted cookies), so older members are not missing.
 *
 * Time on site is an estimate from analytics events linked to the member's
 * e-mail: consecutive events less than SESSION_GAP_MINUTES apart count as one
 * visit, and the gaps inside a visit are added up. It only exists for members
 * whose e-mail is linked to analytics, i.e. who accepted cookies and have a
 * verified address, and only for the 90 days analytics keeps.
 */
import { createHash } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { ensureMemberSchema } from "@/lib/auth/memberStore";
import { SESSION_GAP_MINUTES } from "./memberFormat";
import type { MemberRow, MembersData } from "./types";

let sql: NeonQueryFunction<false, false> | null = null;

function getSql() {
    if (sql) return sql;
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL missing");
    sql = neon(url);
    return sql;
}

const env = () => process.env.VERCEL_ENV || "development";
const num = (value: unknown) => (value === null || value === undefined ? 0 : Number(value) || 0);
const iso = (value: unknown) => (value ? new Date(value as string).toISOString() : null);

async function tableExists(name: string): Promise<boolean> {
    const rows = (await getSql().query(`SELECT to_regclass($1) IS NOT NULL AS ok`, [`public.${name}`])) as { ok: boolean }[];
    return rows[0]?.ok === true;
}

type Base = {
    key: string;
    provider: "google" | "credentials";
    email: string | null;
    name: string | null;
    joinedAt: string | null;
    lastSeenAt: string | null;
    signIns: number;
    emailVerified: boolean;
    accountId: string | null;
};

/** Same owner hash as lib/drawHistory/store.ts, from the same account key rule (lib/auth/accountKey.ts). */
function drawOwnerFor(member: Base): string | null {
    const key = member.provider === "credentials" && !member.emailVerified ? (member.accountId ? `credentials:${member.accountId}` : null) : member.email;
    return key ? `acct_${createHash("sha256").update(`draw-history:${key}`).digest("hex")}` : null;
}

export async function getMembersData(): Promise<MembersData> {
    await ensureMemberSchema();
    const db = getSql();
    const [hasUsers, hasEvents, hasDraws] = await Promise.all([tableExists("auth_users"), tableExists("analytics_events"), tableExists("user_draws")]);

    const members = new Map<string, Base>();

    const memberRows = (await db.query(
        `SELECT member_key, provider, email, name, first_seen, last_seen, sign_ins FROM auth_members`,
    )) as Record<string, unknown>[];
    for (const row of memberRows) {
        const key = String(row.member_key);
        members.set(key, {
            key,
            provider: row.provider === "credentials" ? "credentials" : "google",
            email: row.email ? String(row.email) : null,
            name: row.name ? String(row.name) : null,
            joinedAt: iso(row.first_seen),
            lastSeenAt: iso(row.last_seen),
            signIns: num(row.sign_ins),
            emailVerified: row.provider !== "credentials",
            accountId: key.startsWith("credentials:") ? key.slice("credentials:".length) : null,
        });
    }

    if (hasUsers) {
        const users = (await db.query(
            `SELECT id, email, name, email_verified, created_at, last_login_at FROM auth_users`,
        )) as Record<string, unknown>[];
        for (const row of users) {
            const key = `credentials:${row.id}`;
            const existing = members.get(key);
            const joined = iso(row.created_at);
            const lastLogin = iso(row.last_login_at);
            members.set(key, {
                key,
                provider: "credentials",
                email: String(row.email),
                name: existing?.name ?? (row.name ? String(row.name) : null),
                // The account row knows the real sign-up date, older than any member row.
                joinedAt: [joined, existing?.joinedAt].filter(Boolean).sort()[0] ?? null,
                lastSeenAt: [lastLogin, existing?.lastSeenAt].filter(Boolean).sort().reverse()[0] ?? null,
                signIns: existing?.signIns ?? 0,
                emailVerified: row.email_verified === true,
                accountId: String(row.id),
            });
        }
    }

    // Activity per e-mail from analytics (90 days at most, consent-linked e-mails only).
    const activity = new Map<string, { firstAt: string | null; lastAt: string | null; seconds: number; visits: number; pageviews: number; draws: number }>();
    if (hasEvents) {
        const rows = (await db.query(
            `WITH e AS (
                SELECT lower(user_email) AS email, name, occurred_at,
                       lag(occurred_at) OVER (PARTITION BY lower(user_email) ORDER BY occurred_at) AS prev
                FROM analytics_events
                WHERE env = $1 AND user_email IS NOT NULL
             )
             SELECT email,
                    min(occurred_at) AS first_at,
                    max(occurred_at) AS last_at,
                    count(*) FILTER (WHERE prev IS NULL OR occurred_at - prev > make_interval(mins => $2)) AS visits,
                    COALESCE(sum(EXTRACT(EPOCH FROM occurred_at - prev)) FILTER (WHERE occurred_at - prev <= make_interval(mins => $2)), 0) AS seconds,
                    count(*) FILTER (WHERE name = 'page_view') AS pageviews,
                    count(*) FILTER (WHERE name = 'draw_completed') AS draws
             FROM e GROUP BY email`,
            [env(), SESSION_GAP_MINUTES],
        )) as Record<string, unknown>[];
        for (const row of rows) {
            activity.set(String(row.email), {
                firstAt: iso(row.first_at),
                lastAt: iso(row.last_at),
                seconds: num(row.seconds),
                visits: num(row.visits),
                pageviews: num(row.pageviews),
                draws: num(row.draws),
            });
        }
        // Members from before the member list: e-mails linked to analytics but with no row yet.
        const known = new Set([...members.values()].map((m) => m.email?.toLowerCase()).filter(Boolean));
        for (const [email, a] of activity) {
            if (known.has(email)) continue;
            const key = `google:${email}`;
            members.set(key, { key, provider: "google", email, name: null, joinedAt: a.firstAt, lastSeenAt: a.lastAt, signIns: 0, emailVerified: true, accountId: null });
        }
    }

    const savedByOwner = new Map<string, number>();
    if (hasDraws) {
        const rows = (await db.query(`SELECT owner, count(*) AS n FROM user_draws GROUP BY owner`)) as Record<string, unknown>[];
        for (const row of rows) savedByOwner.set(String(row.owner), num(row.n));
    }

    const rows: MemberRow[] = [...members.values()].map((m) => {
        // Unverified password accounts are never linked to analytics, so their e-mail must not pick up someone else's activity.
        const a = m.email && m.emailVerified ? activity.get(m.email.toLowerCase()) : undefined;
        const joinedAt = [m.joinedAt, a?.firstAt].filter(Boolean).sort()[0] ?? null;
        const lastSeenAt = [m.lastSeenAt, a?.lastAt].filter(Boolean).sort().reverse()[0] ?? null;
        const owner = drawOwnerFor(m);
        return {
            key: m.key,
            provider: m.provider,
            name: m.name,
            email: m.email,
            emailVerified: m.emailVerified,
            joinedAt,
            lastSeenAt,
            signIns: m.signIns,
            seconds: a ? a.seconds : null,
            visits: a?.visits ?? 0,
            pageviews: a?.pageviews ?? 0,
            draws: a?.draws ?? 0,
            savedDraws: owner ? savedByOwner.get(owner) ?? 0 : 0,
        };
    });
    rows.sort((x, y) => (y.joinedAt ?? "").localeCompare(x.joinedAt ?? ""));
    return { members: rows };
}
