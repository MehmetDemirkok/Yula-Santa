import { test } from "node:test";
import assert from "node:assert/strict";
import {
    PUBLIC_STATS_MIN_TOTAL,
    PUBLIC_STATS_START,
    istanbulDay,
    shouldShowDrawStats,
    summarizeDrawStats,
} from "../../lib/analytics/publicStats";

test("summarizeDrawStats groups tools and counts today", () => {
    const stats = summarizeDrawStats(
        [
            { tool: "youtube", day: "2026-11-17", draws: 4 },
            { tool: "youtube", day: "2026-11-18", draws: 2 },
            { tool: "tiktok", day: "2026-11-18", draws: 3 },
            { tool: "tiktok_extension", day: "2026-11-18", draws: 1 },
            { tool: "secret_santa", day: "2026-11-18", draws: 5 },
            { tool: "raffle", day: "2026-11-17", draws: 7 },
        ],
        "2026-11-18",
    );
    assert.deepEqual(stats, { since: PUBLIC_STATS_START, total: 22, today: 11, youtube: 6, tiktok: 4, secretSanta: 5 });
});

test("summarizeDrawStats ignores dice-like tools, old days and bad numbers", () => {
    const stats = summarizeDrawStats(
        [
            { tool: "dice", day: "2026-11-18", draws: 500 },
            { tool: "coin_flip", day: "2026-11-18", draws: 50 },
            { tool: "random_number", day: "2026-11-18", draws: 50 },
            { tool: "gift_suggestions", day: "2026-11-18", draws: 50 },
            { tool: "youtube", day: "2026-11-16", draws: 9 },
            { tool: "youtube", day: "2026-11-18", draws: -3 },
            { tool: "youtube", day: "2026-11-18", draws: Number.NaN },
        ],
        "2026-11-18",
    );
    assert.equal(stats.total, 0);
    assert.equal(stats.youtube, 0);
});

test("shouldShowDrawStats hides small totals outside development", () => {
    const small = summarizeDrawStats([{ tool: "raffle", day: PUBLIC_STATS_START, draws: PUBLIC_STATS_MIN_TOTAL - 1 }], PUBLIC_STATS_START);
    const enough = summarizeDrawStats([{ tool: "raffle", day: PUBLIC_STATS_START, draws: PUBLIC_STATS_MIN_TOTAL }], PUBLIC_STATS_START);
    assert.equal(shouldShowDrawStats(null, true), false);
    assert.equal(shouldShowDrawStats(small, false), false);
    assert.equal(shouldShowDrawStats(small, true), true);
    assert.equal(shouldShowDrawStats(enough, false), true);
});

test("istanbulDay uses UTC+3", () => {
    assert.equal(istanbulDay(new Date("2026-11-17T20:59:00Z")), "2026-11-17");
    assert.equal(istanbulDay(new Date("2026-11-17T21:00:00Z")), "2026-11-18");
});
