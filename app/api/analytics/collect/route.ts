import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { MAX_BODY_BYTES, isBotUserAgent, parseBrowser, parseCollectPayload, parseDevice } from "@/lib/analytics/events";
import { insertEvents, isAnalyticsConfigured, visitorKeyFor } from "@/lib/analytics/store";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Write-only endpoint: it never returns stored data. A failure here must not
 * affect the site, so everything except a bad request answers 204.
 */
const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin) {
        let originHost: string | null = null;
        try {
            originHost = new URL(origin).host;
        } catch {
            // Falls through to the rejection below.
        }
        if (originHost !== host) return new NextResponse(null, { status: 403 });
    }

    if (!rateLimit(request, "analytics-collect").allowed) return new NextResponse(null, { status: 429 });
    if (!isAnalyticsConfigured()) return noContent();

    const userAgent = request.headers.get("user-agent");
    if (isBotUserAgent(userAgent) || !userAgent) return noContent();

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });

    let parsed;
    try {
        parsed = parseCollectPayload(JSON.parse(text));
    } catch {
        parsed = null;
    }
    if (!parsed) return new NextResponse(null, { status: 400 });

    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
        const countryHeader = request.headers.get("x-vercel-ip-country");
        const country = countryHeader && /^[A-Z]{2}$/.test(countryHeader) && countryHeader !== "XX" ? countryHeader : null;

        // The e-mail is linked only after consent. The session is not even read otherwise.
        const email = parsed.consent === "accepted" ? ((await auth())?.user?.email ?? null) : null;

        await insertEvents(parsed, {
            visitorKey: visitorKeyFor(parsed.visitorId, ip, userAgent),
            email,
            country,
            device: parseDevice(userAgent),
            browser: parseBrowser(userAgent),
            ownHost: host?.split(":")[0].replace(/^www\./, "") ?? null,
        });
    } catch (error) {
        console.error("[analytics] insert failed", error instanceof Error ? error.message : "unknown");
    }
    return noContent();
}
