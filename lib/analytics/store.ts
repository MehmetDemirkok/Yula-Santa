/**
 * Server-only analytics storage on Neon. Never import from a client component.
 * Rows are tagged with the deployment environment, so localhost traffic stays
 * apart from production even when both use the same database.
 */
import { createHmac, randomBytes } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { locales } from "@/i18n/config";
import type { AccessRow, AdminData, LiveEvent, NamedCount, RangeKey, TrendPoint } from "@/lib/admin/types";
import { TOOLS, type CleanPayload, type EventName, type ToolName } from "./events";

const TIME_ZONE = "Europe/Istanbul";
/** Turkey has been on fixed UTC+3 since 2016. */
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;
const RETENTION_DAYS = 90;
const TOOL_PATH_REGEX = "^(/[a-z]{2})?/(secret-santa|raffle|youtube|tiktok|tools/[a-z-]+)(/|$)";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;
let fallbackSecret: string | null = null;

function getSql() {
    if (sql) return sql;
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL missing");
    sql = neon(url);
    return sql;
}

export function isAnalyticsConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export function analyticsEnv(): string {
    return process.env.VERCEL_ENV || "development";
}

async function ensureSchema() {
    if (!schemaReady) {
        const db = getSql();
        schemaReady = (async () => {
            await db`
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id BIGSERIAL PRIMARY KEY,
                    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    env TEXT NOT NULL,
                    name TEXT NOT NULL,
                    path TEXT NOT NULL,
                    locale TEXT NOT NULL,
                    tool TEXT,
                    participants INT,
                    winners INT,
                    visitor_key TEXT NOT NULL,
                    consent TEXT NOT NULL,
                    user_email TEXT,
                    country TEXT,
                    device TEXT,
                    browser TEXT,
                    browser_language TEXT,
                    referrer_host TEXT
                )
            `;
            await db`CREATE INDEX IF NOT EXISTS analytics_events_env_time ON analytics_events (env, occurred_at DESC)`;
            await db`CREATE INDEX IF NOT EXISTS analytics_events_env_name_time ON analytics_events (env, name, occurred_at DESC)`;
            await db`
                CREATE TABLE IF NOT EXISTS admin_audit_log (
                    id BIGSERIAL PRIMARY KEY,
                    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    env TEXT NOT NULL,
                    outcome TEXT NOT NULL,
                    event TEXT NOT NULL,
                    account TEXT NOT NULL,
                    country TEXT,
                    browser TEXT
                )
            `;
            await db`CREATE INDEX IF NOT EXISTS admin_audit_log_env_time ON admin_audit_log (env, occurred_at DESC)`;
        })().catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    return schemaReady;
}

function secret(): string {
    const configured = process.env.AUTH_SECRET || process.env.PLAKA_SECRET;
    if (configured) return configured;
    fallbackSecret ??= randomBytes(32).toString("hex");
    return fallbackSecret;
}

const hmac = (value: string) => createHmac("sha256", secret()).update(value).digest("hex").slice(0, 24);

/**
 * Raw IP addresses and user agents are not stored. Without consent the key
 * changes every day, so a visitor cannot be followed across days. With consent
 * it comes from the random ID in the visitor's browser.
 */
export function visitorKeyFor(visitorId: string | null, ip: string, userAgent: string): string {
    if (visitorId) return `v_${hmac(`visitor|${visitorId}`)}`;
    const day = new Date(Date.now() + ISTANBUL_OFFSET_MS).toISOString().slice(0, 10);
    return `d_${hmac(`daily|${day}|${ip}|${userAgent}`)}`;
}

function localeFromPath(path: string): string {
    const first = path.split("/")[1];
    return (locales as readonly string[]).includes(first) ? first : "tr";
}

export async function insertEvents(
    payload: CleanPayload,
    context: { visitorKey: string; email: string | null; country: string | null; device: string; browser: string; ownHost: string | null },
) {
    await ensureSchema();
    const db = getSql();
    const rows = payload.events.map((event) => ({
        env: analyticsEnv(),
        name: event.name,
        path: event.path,
        locale: localeFromPath(event.path),
        tool: event.tool,
        participants: event.participants,
        winners: event.winners,
        visitor_key: context.visitorKey,
        consent: payload.consent,
        user_email: context.email,
        country: context.country,
        device: context.device,
        browser: context.browser,
        browser_language: payload.browserLanguage,
        referrer_host: event.referrerHost === context.ownHost ? null : event.referrerHost,
    }));

    await db.query(
        `INSERT INTO analytics_events (env, name, path, locale, tool, participants, winners, visitor_key, consent, user_email, country, device, browser, browser_language, referrer_host)
         SELECT env, name, path, locale, tool, participants, winners, visitor_key, consent, user_email, country, device, browser, browser_language, referrer_host
         FROM jsonb_to_recordset($1::jsonb) AS x(env text, name text, path text, locale text, tool text, participants int, winners int, visitor_key text, consent text, user_email text, country text, device text, browser text, browser_language text, referrer_host text)`,
        [JSON.stringify(rows)],
    );

    // Vercel cron is not set up in this project, so writes also enforce retention now and then.
    if (Math.random() < 0.01) await purgeExpired();
}

export async function purgeExpired() {
    await ensureSchema();
    const db = getSql();
    await db.query(`DELETE FROM analytics_events WHERE occurred_at < now() - make_interval(days => $1)`, [RETENTION_DAYS]);
    await db.query(`DELETE FROM admin_audit_log WHERE occurred_at < now() - make_interval(days => $1)`, [RETENTION_DAYS]);
}

export async function recordAdminAccess(entry: {
    outcome: "allowed" | "denied";
    event: string;
    account: string;
    country: string | null;
    browser: string;
}) {
    await ensureSchema();
    // A panel reload is not a new sign-in, so allowed entries are limited to one per 30 minutes.
    await getSql().query(
        `INSERT INTO admin_audit_log (env, outcome, event, account, country, browser)
         SELECT $1, $2, $3, $4, $5, $6
         WHERE $2 <> 'allowed' OR NOT EXISTS (
             SELECT 1 FROM admin_audit_log
             WHERE env = $1 AND outcome = 'allowed' AND occurred_at > now() - interval '30 minutes'
         )`,
        [analyticsEnv(), entry.outcome, entry.event, entry.account, entry.country, entry.browser],
    );
}

const TOOL_LABELS: Record<ToolName, string> = {
    secret_santa: "Secret Santa",
    raffle: "İsim çekilişi",
    youtube: "YouTube çekilişi",
    tiktok: "TikTok çekilişi",
    tiktok_extension: "TikTok eklentisi",
    wheel: "Çarkıfelek",
    team_generator: "Takım oluşturucu",
    short_straw: "Kısa çöp",
    coin_flip: "Yazı tura",
    dice: "Zar",
    random_number: "Rastgele sayı",
};

const countryNames = new Intl.DisplayNames("tr", { type: "region" });
const languageNames = new Intl.DisplayNames("tr", { type: "language" });
const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase("tr-TR") + value.slice(1);
const countryName = (code: string | null) => (code ? (countryNames.of(code) ?? code) : "Bilinmiyor");
const languageName = (code: string) => capitalize(languageNames.of(code) ?? code);

function sourceName(host: string | null): string {
    if (!host) return "Doğrudan";
    if (/(^|\.)google\./.test(host)) return "Google";
    if (/(^|\.)bing\.com$/.test(host)) return "Bing";
    if (/(^|\.)yandex\./.test(host)) return "Yandex";
    if (/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return "YouTube";
    if (/(^|\.)tiktok\.com$/.test(host)) return "TikTok";
    if (/(^|\.)instagram\.com$/.test(host)) return "Instagram";
    if (/(^|\.)(facebook\.com|fb\.com)$/.test(host)) return "Facebook";
    if (/(^|\.)(x\.com|t\.co|twitter\.com)$/.test(host)) return "X";
    return host;
}

/** Merges rows that map to the same label, sorts them and folds the tail into "Diğer". */
function topRows(rows: NamedCount[], limit: number): NamedCount[] {
    const merged = new Map<string, number>();
    rows.forEach((row) => merged.set(row.name, (merged.get(row.name) ?? 0) + row.count));
    const sorted = [...merged.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    if (sorted.length <= limit) return sorted;
    const rest = sorted.slice(limit - 1).reduce((acc, row) => acc + row.count, 0);
    return [...sorted.slice(0, limit - 1), { name: "Diğer", count: rest }];
}

function percentChange(current: number | null, previous: number | null): number | null {
    if (current === null || previous === null || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
}

const num = (value: unknown) => Number(value ?? 0);
const numOrNull = (value: unknown) => (value === null || value === undefined ? null : Number(value));

export function rangeWindow(key: RangeKey, now: Date) {
    const localNow = now.getTime() + ISTANBUL_OFFSET_MS;
    const todayStart = Math.floor(localNow / DAY_MS) * DAY_MS - ISTANBUL_OFFSET_MS;
    const days = key === "today" ? 1 : key === "7d" ? 7 : key === "30d" ? 30 : 90;
    const from = todayStart - (days - 1) * DAY_MS;
    const length = now.getTime() - from;
    return { from: new Date(from), to: now, prevFrom: new Date(from - length), prevTo: new Date(from), days };
}

function emptySeries(key: RangeKey, now: Date, from: Date): Map<string, TrendPoint> {
    const series = new Map<string, TrendPoint>();
    const point = (label: string, fullLabel: string): TrendPoint => ({ label, fullLabel, visitors: 0, pageviews: 0, draws: 0 });

    if (key === "today") {
        const hours = Math.floor((now.getTime() - from.getTime()) / 3_600_000) + 1;
        const day = new Date(from.getTime() + ISTANBUL_OFFSET_MS).toISOString().slice(0, 10);
        for (let hour = 0; hour < Math.max(hours, 2); hour += 1) {
            const stamp = String(hour).padStart(2, "0");
            series.set(`${day}T${stamp}`, point(`${stamp}:00`, `Bugün ${stamp}:00`));
        }
        return series;
    }

    const short = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: TIME_ZONE });
    const long = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: TIME_ZONE });
    for (let time = from.getTime(); time <= now.getTime(); time += DAY_MS) {
        const date = new Date(time);
        series.set(new Date(time + ISTANBUL_OFFSET_MS).toISOString().slice(0, 10), point(short.format(date), long.format(date)));
    }
    return series;
}

async function existingTableCount(query: string, params: unknown[]): Promise<number> {
    try {
        const rows = (await getSql().query(query, params)) as Record<string, unknown>[];
        return num(rows[0]?.count);
    } catch {
        // The table is created by its own feature and may not exist yet.
        return 0;
    }
}

function minutesSince(value: unknown, now: Date): number {
    return Math.max(Math.floor((now.getTime() - new Date(String(value)).getTime()) / 60_000), 0);
}

function describeEvent(row: Record<string, unknown>): { title: string; detail: string } {
    const name = row.name as EventName;
    const toolLabel = row.tool ? (TOOL_LABELS[row.tool as ToolName] ?? String(row.tool)) : null;
    const participants = numOrNull(row.participants);
    const winners = numOrNull(row.winners);

    if (name === "page_view") return { title: "Sayfa görüntüleme", detail: String(row.path) };
    if (name === "consent") {
        const label = row.consent === "accepted" ? "Çerezler kabul edildi" : "Çerezler reddedildi";
        return { title: "Çerez tercihi", detail: label };
    }
    if (name === "draw_shared") return { title: "Sonuç paylaşıldı", detail: toolLabel ?? String(row.path) };

    const parts = [
        participants !== null ? `${participants.toLocaleString("tr-TR")} katılımcı` : null,
        winners !== null ? `${winners.toLocaleString("tr-TR")} sonuç` : null,
    ].filter(Boolean);
    return { title: toolLabel ?? "Çekiliş", detail: parts.join(", ") || "Tamamlandı" };
}

export async function getAdminData(key: RangeKey, now = new Date()): Promise<AdminData> {
    await ensureSchema();
    const db = getSql();
    const env = analyticsEnv();
    const { from, to, prevFrom, prevTo } = rangeWindow(key, now);
    const window = [env, from.toISOString(), to.toISOString()];
    const scope = "env = $1 AND occurred_at >= $2::timestamptz AND occurred_at < $3::timestamptz";
    const bucket = key === "today" ? "HH24" : null;
    const bucketSql = bucket
        ? `to_char(occurred_at AT TIME ZONE '${TIME_ZONE}', 'YYYY-MM-DD"T"HH24')`
        : `to_char(occurred_at AT TIME ZONE '${TIME_ZONE}', 'YYYY-MM-DD')`;

    const totalsSql = `
        SELECT
            count(DISTINCT visitor_key) FILTER (WHERE name = 'page_view') AS visitors,
            count(*) FILTER (WHERE name = 'page_view') AS pageviews,
            count(*) FILTER (WHERE name = 'draw_completed') AS draws,
            count(DISTINCT visitor_key) FILTER (WHERE name = 'draw_completed') AS drawers,
            count(DISTINCT visitor_key) FILTER (WHERE name = 'draw_shared') AS sharers,
            count(DISTINCT visitor_key) FILTER (WHERE name = 'page_view' AND path ~ '${TOOL_PATH_REGEX}') AS tool_visitors,
            round(avg(participants) FILTER (WHERE name = 'draw_completed')) AS avg_participants
        FROM analytics_events WHERE ${scope}`;

    const dimension = (column: string, label: string) => `
        SELECT '${label}' AS dim, ${column}::text AS value, count(DISTINCT visitor_key) AS count
        FROM analytics_events WHERE ${scope} AND name = 'page_view' GROUP BY ${column}`;

    const [buckets, totals, prevTotals, toolRows, dimensions, pageRows, visitorRows, eventRows, auditRows, plakaGames, plakaPrev, extension, extensionPrev] = await Promise.all([
        db.query(
            `SELECT ${bucketSql} AS bucket,
                    count(DISTINCT visitor_key) FILTER (WHERE name = 'page_view') AS visitors,
                    count(*) FILTER (WHERE name = 'page_view') AS pageviews,
                    count(*) FILTER (WHERE name = 'draw_completed') AS draws
             FROM analytics_events WHERE ${scope} GROUP BY 1`,
            window,
        ),
        db.query(totalsSql, window),
        db.query(totalsSql, [env, prevFrom.toISOString(), prevTo.toISOString()]),
        db.query(
            `SELECT tool,
                    count(*) FILTER (WHERE occurred_at >= $2::timestamptz AND occurred_at < $3::timestamptz) AS draws,
                    count(*) FILTER (WHERE occurred_at >= $4::timestamptz AND occurred_at < $2::timestamptz) AS previous,
                    round(avg(participants) FILTER (WHERE occurred_at >= $2::timestamptz AND occurred_at < $3::timestamptz)) AS avg_participants
             FROM analytics_events
             WHERE env = $1 AND name = 'draw_completed' AND occurred_at >= $4::timestamptz AND occurred_at < $3::timestamptz AND tool IS NOT NULL
             GROUP BY tool`,
            [...window, prevFrom.toISOString()],
        ),
        db.query(
            [
                dimension("country", "country"),
                dimension("locale", "language"),
                dimension("referrer_host", "source"),
                dimension("browser", "browser"),
                dimension("device", "device"),
            ].join(" UNION ALL "),
            window,
        ),
        db.query(`SELECT path AS value, count(*) AS count FROM analytics_events WHERE ${scope} AND name = 'page_view' GROUP BY path ORDER BY count DESC LIMIT 25`, window),
        db.query(
            `WITH visitors AS (
                 SELECT visitor_key,
                        (array_agg(consent ORDER BY occurred_at DESC))[1] AS last_consent,
                        count(DISTINCT (occurred_at AT TIME ZONE '${TIME_ZONE}')::date) AS active_days
                 FROM analytics_events WHERE ${scope} GROUP BY visitor_key
             )
             SELECT
                 count(*) FILTER (WHERE last_consent = 'accepted') AS accepted,
                 count(*) FILTER (WHERE last_consent = 'declined') AS declined,
                 count(*) FILTER (WHERE last_consent = 'unset') AS unset,
                 count(*) FILTER (WHERE visitor_key LIKE 'v\\_%' AND active_days > 1) AS returning_visitors,
                 count(*) FILTER (WHERE visitor_key LIKE 'v\\_%' AND active_days <= 1) AS new_visitors,
                 count(*) FILTER (WHERE visitor_key NOT LIKE 'v\\_%') AS unknown_visitors
             FROM visitors`,
            window,
        ),
        db.query(
            `SELECT id, occurred_at, name, path, locale, tool, participants, winners, visitor_key, consent, user_email, country, device
             FROM analytics_events WHERE env = $1 ORDER BY occurred_at DESC LIMIT 50`,
            [env],
        ),
        db.query(`SELECT id, occurred_at, outcome, event, account, country, browser FROM admin_audit_log WHERE env = $1 ORDER BY occurred_at DESC LIMIT 25`, [env]),
        existingTableCount(`SELECT count(*) AS count FROM plaka_sessions WHERE started_at >= $1::timestamptz AND started_at < $2::timestamptz`, [from.toISOString(), to.toISOString()]),
        existingTableCount(`SELECT count(*) AS count FROM plaka_sessions WHERE started_at >= $1::timestamptz AND started_at < $2::timestamptz`, [prevFrom.toISOString(), prevTo.toISOString()]),
        existingTableCount(`SELECT count(*) AS count FROM tiktok_giveaways WHERE drawn_at >= $1::timestamptz AND drawn_at < $2::timestamptz`, [from.toISOString(), to.toISOString()]),
        existingTableCount(`SELECT count(*) AS count FROM tiktok_giveaways WHERE drawn_at >= $1::timestamptz AND drawn_at < $2::timestamptz`, [prevFrom.toISOString(), prevTo.toISOString()]),
    ]);

    const series = emptySeries(key, now, from);
    (buckets as Record<string, unknown>[]).forEach((row) => {
        const point = series.get(String(row.bucket));
        if (!point) return;
        point.visitors = num(row.visitors);
        point.pageviews = num(row.pageviews);
        point.draws = num(row.draws);
    });

    const current = (totals as Record<string, unknown>[])[0] ?? {};
    const previous = (prevTotals as Record<string, unknown>[])[0] ?? {};
    const visitors = num(current.visitors);
    const prevVisitors = num(previous.visitors);
    const drawers = num(current.drawers);
    const prevDrawers = num(previous.drawers);
    const sharers = num(current.sharers);
    const prevSharers = num(previous.sharers);

    const toolMap = new Map((toolRows as Record<string, unknown>[]).map((row) => [String(row.tool), row]));
    const tools = TOOLS.map((tool) => {
        const row = toolMap.get(tool);
        return {
            name: TOOL_LABELS[tool],
            draws: num(row?.draws),
            avgParticipants: numOrNull(row?.avg_participants),
            delta: percentChange(num(row?.draws), num(row?.previous)),
        };
    }).sort((a, b) => b.draws - a.draws);

    const dimensionRows = (dim: string, label: (value: string | null) => string): NamedCount[] =>
        (dimensions as Record<string, unknown>[])
            .filter((row) => row.dim === dim)
            .map((row) => ({ name: label(row.value === null ? null : String(row.value)), count: num(row.count) }));

    const deviceRows = dimensionRows("device", (value) => value ?? "Bilinmiyor");
    const devices = ["Mobil", "Masaüstü", "Tablet"].map((name) => ({
        name,
        count: deviceRows.find((row) => row.name === name)?.count ?? 0,
    }));

    const visitorState = (visitorRows as Record<string, unknown>[])[0] ?? {};

    const events: LiveEvent[] = (eventRows as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        minutesAgo: minutesSince(row.occurred_at, now),
        type: row.name as LiveEvent["type"],
        ...describeEvent(row),
        visitor: row.user_email ? String(row.user_email) : `Ziyaretçi #${String(row.visitor_key).slice(-4)}`,
        country: countryName(row.country ? String(row.country) : null),
        language: languageName(String(row.locale)),
        device: String(row.device ?? "Bilinmiyor"),
    }));

    const whenFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
    const access: AccessRow[] = (auditRows as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        when: whenFormat.format(new Date(String(row.occurred_at))),
        outcome: row.outcome === "allowed" ? "allowed" : "denied",
        event: String(row.event),
        account: String(row.account),
        origin: `${countryName(row.country ? String(row.country) : null)}, ${String(row.browser ?? "Bilinmiyor")}`,
    }));

    const rate = (part: number, whole: number) => (whole > 0 ? part / whole : null);

    return {
        range: {
            series: [...series.values()],
            totals: {
                visitors,
                pageviews: num(current.pageviews),
                draws: num(current.draws),
                drawers,
                sharers,
                avgParticipants: numOrNull(current.avg_participants),
                plakaGames,
                extensionGiveaways: extension,
            },
            deltas: {
                visitors: percentChange(visitors, prevVisitors),
                pageviews: percentChange(num(current.pageviews), num(previous.pageviews)),
                draws: percentChange(num(current.draws), num(previous.draws)),
                conversion: percentChange(rate(drawers, visitors), rate(prevDrawers, prevVisitors)),
                avgParticipants: percentChange(numOrNull(current.avg_participants), numOrNull(previous.avg_participants)),
                shareRate: percentChange(rate(sharers, drawers), rate(prevSharers, prevDrawers)),
                plakaGames: percentChange(plakaGames, plakaPrev),
                extensionGiveaways: percentChange(extension, extensionPrev),
            },
            tools,
            funnel: [
                { name: "Siteye giren", count: visitors },
                { name: "Araç sayfası açan", count: num(current.tool_visitors) },
                { name: "Çekiliş yapan", count: drawers },
                { name: "Sonucu paylaşan", count: sharers },
            ],
            countries: topRows(dimensionRows("country", countryName), 7),
            languages: topRows(dimensionRows("language", (value) => languageName(value ?? "tr")), 7),
            sources: topRows(dimensionRows("source", sourceName), 7),
            browsers: topRows(dimensionRows("browser", (value) => value ?? "Diğer"), 6),
            pages: topRows((pageRows as Record<string, unknown>[]).map((row) => ({ name: String(row.value), count: num(row.count) })), 9),
            devices,
            visitorTypes: [
                { name: "Yeni", count: num(visitorState.new_visitors) },
                { name: "Geri dönen", count: num(visitorState.returning_visitors) },
                { name: "Bilinmiyor (onay yok)", count: num(visitorState.unknown_visitors) },
            ],
            consent: [
                { name: "Kabul eden", count: num(visitorState.accepted) },
                { name: "Reddeden", count: num(visitorState.declined) },
                { name: "Yanıt vermeyen", count: num(visitorState.unset) },
            ],
        },
        events,
        access,
    };
}
