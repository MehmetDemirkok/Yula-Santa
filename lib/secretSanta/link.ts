/**
 * Personal Secret Santa links, with no database.
 *
 * Each participant gets a link like `/s#<token>`. The token carries their own
 * match plus the event details. It sits after `#`, and browsers never send the
 * fragment to the server, so names stay out of our requests, logs and
 * analytics (which record `location.pathname` only).
 *
 * The token is base64url-encoded JSON, not encrypted: anyone holding a link can
 * read it, which is the point. The organizer creates every link, so the UI
 * says plainly that they could open someone else's.
 */

import { localePath } from "@/lib/localePath";

export type SantaEvent = {
    /** Group or event name, e.g. "Ofis 2027". */
    name?: string;
    /** Free-text budget, e.g. "500 TL". */
    budget?: string;
    /** Exchange date as YYYY-MM-DD. */
    date?: string;
    /** Organizer's note to everyone. */
    note?: string;
};

export type SantaLinkPayload = {
    v: 1;
    /** The person opening the link (the giver). */
    g: string;
    /** Who they buy a gift for. */
    r: string;
    /** Organizer's hint about the receiver's interests. */
    h?: string;
    e?: SantaEvent;
};

export const LIMITS = {
    name: 60,
    eventName: 60,
    budget: 30,
    note: 200,
    hint: 150,
} as const;

function clean(value: unknown, max: number): string | undefined {
    if (typeof value !== "string") return undefined;
    const out = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
    return out || undefined;
}

export function cleanDate(value: unknown): string | undefined {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const d = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? undefined : value;
}

export function cleanEvent(event: SantaEvent | undefined): SantaEvent | undefined {
    if (!event) return undefined;
    const out: SantaEvent = {
        name: clean(event.name, LIMITS.eventName),
        budget: clean(event.budget, LIMITS.budget),
        date: cleanDate(event.date),
        note: clean(event.note, LIMITS.note),
    };
    (Object.keys(out) as (keyof SantaEvent)[]).forEach((k) => out[k] === undefined && delete out[k]);
    return Object.keys(out).length ? out : undefined;
}

function toBase64Url(text: string): string {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    bytes.forEach((b) => {
        bin += String.fromCharCode(b);
    });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): string {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function encodeSantaLink(payload: Omit<SantaLinkPayload, "v">): string {
    const data: SantaLinkPayload = {
        v: 1,
        g: clean(payload.g, LIMITS.name) ?? "",
        r: clean(payload.r, LIMITS.name) ?? "",
    };
    const hint = clean(payload.h, LIMITS.hint);
    if (hint) data.h = hint;
    const event = cleanEvent(payload.e);
    if (event) data.e = event;
    return toBase64Url(JSON.stringify(data));
}

/** Returns null for anything that is not a valid v1 token. */
export function decodeSantaLink(token: string): SantaLinkPayload | null {
    try {
        const raw = token.replace(/^#/, "").trim();
        if (!raw || raw.length > 4000 || !/^[A-Za-z0-9_-]+$/.test(raw)) return null;
        const data = JSON.parse(fromBase64Url(raw)) as Record<string, unknown>;
        if (data?.v !== 1) return null;
        const g = clean(data.g, LIMITS.name);
        const r = clean(data.r, LIMITS.name);
        if (!g || !r) return null;
        const out: SantaLinkPayload = { v: 1, g, r };
        const h = clean(data.h, LIMITS.hint);
        if (h) out.h = h;
        const e = cleanEvent((data.e && typeof data.e === "object" ? data.e : undefined) as SantaEvent | undefined);
        if (e) out.e = e;
        return out;
    } catch {
        return null;
    }
}

/** Full personal link; `origin` is passed in so localhost links work during development. */
export function buildSantaLink(origin: string, locale: string, payload: Omit<SantaLinkPayload, "v">): string {
    return `${origin.replace(/\/$/, "")}${localePath(locale, "/s")}#${encodeSantaLink(payload)}`;
}

/** `https://wa.me/?text=…`: opens WhatsApp with the message typed in, no API or account needed. */
export function whatsappUrl(message: string): string {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Opens the visitor's mail app with the message filled in; they pick the recipient. */
export function emailUrl(subject: string, body: string): string {
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** `sms:?&body=` is the form both iOS and Android accept with no number. */
export function smsUrl(body: string): string {
    return `sms:?&body=${encodeURIComponent(body)}`;
}

/**
 * Whole days from `now` (in the visitor's own calendar) to the exchange date:
 * 0 on the day itself, negative once it has passed, null without a valid date.
 */
export function daysUntil(date: string | undefined, now: Date = new Date()): number | null {
    const valid = cleanDate(date);
    if (!valid) return null;
    const [y, m, d] = valid.split("-").map(Number);
    const target = Date.UTC(y, m - 1, d);
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target - today) / 86_400_000);
}

function icsEscape(text: string): string {
    return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/**
 * An all-day calendar event for the exchange date. It deliberately leaves out
 * the receiver's name: calendars sync and get shared, and the match should not.
 */
export function buildIcs(event: SantaEvent, fallbackTitle: string, now: Date = new Date()): string | null {
    const date = cleanDate(event.date);
    if (!date) return null;
    const start = date.replace(/-/g, "");
    const next = new Date(`${date}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const end = next.toISOString().slice(0, 10).replace(/-/g, "");
    const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const description = [event.budget, event.note].filter(Boolean).join("\n");
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//YulaSanta//Secret Santa//TR",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${start}-${Math.abs(hash(`${event.name ?? ""}${description}`))}@yulasanta`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${icsEscape(event.name || fallbackTitle)}`,
        ...(description ? [`DESCRIPTION:${icsEscape(description)}`] : []),
        "END:VEVENT",
        "END:VCALENDAR",
    ];
    return lines.join("\r\n") + "\r\n";
}

function hash(text: string): number {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    return h;
}
