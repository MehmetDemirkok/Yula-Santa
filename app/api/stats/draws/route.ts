import { NextResponse } from "next/server";
import { getPublicDrawStats, isAnalyticsConfigured } from "@/lib/analytics/store";
import type { PublicDrawStats } from "@/lib/analytics/publicStats";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Public, read-only aggregate draw counts for the landing page. It returns
 * totals per tool only, never events or visitor data.
 */
const CACHE_MS = 60_000;
let cached: { at: number; stats: PublicDrawStats } | null = null;

export async function GET(request: Request) {
    if (!rateLimit(request, "public-stats").allowed) return new NextResponse(null, { status: 429 });
    if (!isAnalyticsConfigured()) return NextResponse.json({ stats: null });

    try {
        if (!cached || Date.now() - cached.at > CACHE_MS) {
            cached = { at: Date.now(), stats: await getPublicDrawStats() };
        }
        return NextResponse.json(
            { stats: cached.stats },
            { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
        );
    } catch (error) {
        console.error("[stats] read failed", error instanceof Error ? error.message : "unknown");
        return NextResponse.json({ stats: null }, { headers: { "Cache-Control": "no-store" } });
    }
}
