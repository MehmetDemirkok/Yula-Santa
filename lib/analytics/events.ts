/**
 * Validation for the public analytics endpoint. Pure and client-safe.
 *
 * The payload is an allowlist on purpose: event names and tools come from fixed
 * lists and every other field is a clamped number or a sanitized path. There is
 * no free-text field, so participant names cannot reach the database.
 */

export const EVENT_NAMES = ["page_view", "draw_completed", "draw_shared", "consent"] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export const TOOLS = [
    "secret_santa",
    "raffle",
    "youtube",
    "tiktok",
    "tiktok_extension",
    "wheel",
    "team_generator",
    "short_straw",
    "coin_flip",
    "dice",
    "random_number",
] as const;
export type ToolName = (typeof TOOLS)[number];

export const CONSENT_STATES = ["accepted", "declined", "unset"] as const;
export type ConsentState = (typeof CONSENT_STATES)[number];

export const MAX_EVENTS_PER_REQUEST = 20;
export const MAX_BODY_BYTES = 16_384;
const MAX_COUNT = 1_000_000;

export type ClientEvent = {
    name: EventName;
    path: string;
    tool?: ToolName;
    participants?: number;
    winners?: number;
    referrer?: string;
};

export type CleanEvent = {
    name: EventName;
    path: string;
    tool: ToolName | null;
    participants: number | null;
    winners: number | null;
    referrerHost: string | null;
};

export type CleanPayload = {
    consent: ConsentState;
    /** Only present when the visitor accepted cookies. */
    visitorId: string | null;
    browserLanguage: string | null;
    events: CleanEvent[];
};

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
    typeof value === "string" && (list as readonly string[]).includes(value);

/** Keeps only the pathname. Query strings can hold draw results, such as /proof?d=... */
export function cleanPath(value: unknown): string | null {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
    const path = value.split(/[?#]/)[0];
    if (path.length > 200 || !/^[\w\-./~%]*$/.test(path)) return null;
    return path;
}

export function cleanReferrerHost(value: unknown): string | null {
    if (typeof value !== "string" || !value || value.length > 2048) return null;
    try {
        const url = new URL(value);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url.hostname.toLowerCase().replace(/^www\./, "").slice(0, 100) || null;
    } catch {
        return null;
    }
}

function cleanCount(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return Math.min(Math.max(Math.round(value), 0), MAX_COUNT);
}

function cleanLanguage(value: unknown): string | null {
    if (typeof value !== "string" || !/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(value)) return null;
    return value.split("-")[0].toLowerCase();
}

function cleanVisitorId(value: unknown): string | null {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        ? value.toLowerCase()
        : null;
}

export function parseCollectPayload(input: unknown): CleanPayload | null {
    if (!input || typeof input !== "object") return null;
    const body = input as Record<string, unknown>;
    if (!Array.isArray(body.events) || body.events.length === 0 || body.events.length > MAX_EVENTS_PER_REQUEST) return null;

    const consent = includes(CONSENT_STATES, body.consent) ? body.consent : "unset";
    const events: CleanEvent[] = [];

    for (const raw of body.events) {
        if (!raw || typeof raw !== "object") continue;
        const event = raw as Record<string, unknown>;
        const path = cleanPath(event.path);
        if (!includes(EVENT_NAMES, event.name) || path === null) continue;
        events.push({
            name: event.name,
            path,
            tool: includes(TOOLS, event.tool) ? event.tool : null,
            participants: cleanCount(event.participants),
            winners: cleanCount(event.winners),
            referrerHost: cleanReferrerHost(event.referrer),
        });
    }

    if (events.length === 0) return null;
    return {
        consent,
        visitorId: consent === "accepted" ? cleanVisitorId(body.visitorId) : null,
        browserLanguage: cleanLanguage(body.browserLanguage),
        events,
    };
}

export function isBotUserAgent(userAgent: string | null): boolean {
    if (!userAgent) return true;
    return /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|embedly|preview|curl|wget|python|node-fetch|axios|go-http/i.test(userAgent);
}

export function parseDevice(userAgent: string): "Mobil" | "Tablet" | "Masaüstü" {
    if (/ipad|tablet|android(?!.*mobile)/i.test(userAgent)) return "Tablet";
    if (/mobi|iphone|ipod|android/i.test(userAgent)) return "Mobil";
    return "Masaüstü";
}

export function parseBrowser(userAgent: string): string {
    if (/samsungbrowser/i.test(userAgent)) return "Samsung Internet";
    if (/edg(e|a|ios)?\//i.test(userAgent)) return "Edge";
    if (/opr\/|opera/i.test(userAgent)) return "Opera";
    if (/firefox|fxios/i.test(userAgent)) return "Firefox";
    if (/chrome|crios/i.test(userAgent)) return "Chrome";
    if (/safari/i.test(userAgent)) return "Safari";
    return "Diğer";
}
