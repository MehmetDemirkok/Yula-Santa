"use client";

/**
 * Browser side of analytics. Callers pass tool names and counts only, never names.
 * Tracking must never break a tool, so every failure here is silent.
 */

import type { ClientEvent, ConsentState, EventName, ToolName } from "./events";

const CONSENT_KEY = "yulasanta_cookie_consent_v2";
const VISITOR_KEY = "yulasanta_vid";
const ENDPOINT = "/api/analytics/collect";
const FLUSH_DELAY_MS = 2000;
const MAX_QUEUE = 20;

let queue: ClientEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let pageHideBound = false;

function readStorage(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function getConsent(): ConsentState {
    const value = readStorage(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : "unset";
}

function flush() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    if (queue.length === 0) return;

    const events = queue.slice(0, MAX_QUEUE);
    queue = queue.slice(MAX_QUEUE);
    const consent = getConsent();
    const body = JSON.stringify({
        consent,
        visitorId: consent === "accepted" ? readStorage(VISITOR_KEY) : null,
        browserLanguage: navigator.language,
        events,
    });

    try {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    } catch {
        // Losing a statistic is fine; the tool keeps working.
    }
    if (queue.length > 0) flush();
}

function push(event: ClientEvent) {
    if (typeof window === "undefined") return;
    queue.push(event);
    if (!pageHideBound) {
        pageHideBound = true;
        // Phones often skip pagehide when a tab is swiped away, so both are needed.
        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") flush();
        });
    }
    if (!timer) timer = setTimeout(flush, FLUSH_DELAY_MS);
}

/**
 * For events that matter: send while the page is still alive. A beacon fired
 * while a page is closing can be lost, and people often leave right after a draw.
 */
function pushNow(item: ClientEvent) {
    push(item);
    flush();
}

const event = (name: EventName, extra: Partial<ClientEvent> = {}): ClientEvent => ({
    name,
    path: window.location.pathname,
    ...extra,
});

export function trackPageView() {
    if (typeof window === "undefined") return;
    push(event("page_view", { referrer: document.referrer || undefined }));
}

export function trackDraw(tool: ToolName, counts: { participants?: number; winners?: number } = {}) {
    if (typeof window === "undefined") return;
    pushNow(event("draw_completed", { tool, ...counts }));
}

export function trackShare(tool?: ToolName) {
    if (typeof window === "undefined") return;
    pushNow(event("draw_shared", { tool }));
}

/** The visitor ID exists only while consent is accepted, and declining deletes it. */
export function setConsent(value: "accepted" | "declined") {
    try {
        localStorage.setItem(CONSENT_KEY, value);
        if (value === "accepted") {
            if (!localStorage.getItem(VISITOR_KEY)) localStorage.setItem(VISITOR_KEY, crypto.randomUUID());
        } else {
            localStorage.removeItem(VISITOR_KEY);
        }
    } catch {
        // Storage may be blocked; the visitor then counts as "unset".
    }
    pushNow(event("consent"));
}
