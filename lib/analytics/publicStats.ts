/**
 * Public draw counters shown on the landing page. Pure and client-safe.
 *
 * Only per-day, per-tool totals are kept (lib/analytics/store.ts, table
 * draw_stats_daily). They hold no visitor key, path or name, so they are kept
 * after the 90-day event retention and the running total never shrinks.
 */
import type { ToolName } from "./events";

/** Counting starts on this Europe/Istanbul date. */
export const PUBLIC_STATS_START = "2026-11-17";

/**
 * The section stays hidden until this many draws exist, so a fresh counter
 * never shows "3 draws" to visitors. Development always shows it.
 */
export const PUBLIC_STATS_MIN_TOTAL = 20;

/**
 * Tools that count as a "draw". Dice, coin flip, random number and gift ideas
 * are left out: one visitor can roll a die hundreds of times.
 */
export const PUBLIC_DRAW_TOOLS: readonly ToolName[] = [
    "secret_santa",
    "raffle",
    "youtube",
    "tiktok",
    "tiktok_extension",
    "wheel",
    "team_generator",
    "short_straw",
];

export type PublicDrawStats = {
    since: string;
    total: number;
    today: number;
    youtube: number;
    tiktok: number;
    secretSanta: number;
};

export type DrawCountRow = { tool: string; day: string; draws: number };

export function summarizeDrawStats(rows: DrawCountRow[], today: string, since = PUBLIC_STATS_START): PublicDrawStats {
    const stats: PublicDrawStats = { since, total: 0, today: 0, youtube: 0, tiktok: 0, secretSanta: 0 };
    for (const row of rows) {
        if (row.day < since || !(PUBLIC_DRAW_TOOLS as readonly string[]).includes(row.tool)) continue;
        const draws = Math.max(Math.floor(Number(row.draws) || 0), 0);
        stats.total += draws;
        if (row.day === today) stats.today += draws;
        if (row.tool === "youtube") stats.youtube += draws;
        else if (row.tool === "tiktok" || row.tool === "tiktok_extension") stats.tiktok += draws;
        else if (row.tool === "secret_santa") stats.secretSanta += draws;
    }
    return stats;
}

export function shouldShowDrawStats(stats: PublicDrawStats | null, isDev: boolean): stats is PublicDrawStats {
    if (!stats) return false;
    return isDev || stats.total >= PUBLIC_STATS_MIN_TOTAL;
}

/** Europe/Istanbul calendar date (fixed UTC+3 since 2016) as YYYY-MM-DD. */
export function istanbulDay(now: Date): string {
    return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
