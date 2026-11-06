import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ADMIN_SESSION_MAX_SECONDS, isAdminSession } from "../../lib/admin/access";
import {
    MAX_EVENTS_PER_REQUEST,
    cleanPath,
    cleanReferrerHost,
    isBotUserAgent,
    parseBrowser,
    parseCollectPayload,
    parseDevice,
} from "../../lib/analytics/events";

const NOW = 1_800_000_000;
const ADMIN = { email: "admin@example.com", emailVerified: true, authAt: NOW - 60 };

describe("isAdminSession", () => {
    it("accepts a verified allowlisted account, ignoring case and spaces", () => {
        assert.equal(isAdminSession(ADMIN, "admin@example.com", NOW), true);
        assert.equal(isAdminSession({ ...ADMIN, email: "ADMIN@example.com" }, " other@x.com , admin@example.com ", NOW), true);
    });

    it("rejects when there is no session", () => {
        assert.equal(isAdminSession(null, "admin@example.com", NOW), false);
    });

    it("fails closed on an empty or missing allowlist", () => {
        assert.equal(isAdminSession(ADMIN, "", NOW), false);
        assert.equal(isAdminSession(ADMIN, " , ", NOW), false);
        assert.equal(isAdminSession(ADMIN, undefined, NOW), false);
    });

    it("rejects another Google account", () => {
        assert.equal(isAdminSession({ ...ADMIN, email: "someone@example.com" }, "admin@example.com", NOW), false);
    });

    it("rejects an unverified or unknown email status", () => {
        assert.equal(isAdminSession({ ...ADMIN, emailVerified: false }, "admin@example.com", NOW), false);
        assert.equal(isAdminSession({ email: ADMIN.email, authAt: ADMIN.authAt }, "admin@example.com", NOW), false);
    });

    it("rejects sessions older than 12 hours and sessions without a sign-in time", () => {
        assert.equal(isAdminSession({ ...ADMIN, authAt: NOW - ADMIN_SESSION_MAX_SECONDS }, "admin@example.com", NOW), true);
        assert.equal(isAdminSession({ ...ADMIN, authAt: NOW - ADMIN_SESSION_MAX_SECONDS - 1 }, "admin@example.com", NOW), false);
        assert.equal(isAdminSession({ email: ADMIN.email, emailVerified: true }, "admin@example.com", NOW), false);
        assert.equal(isAdminSession({ ...ADMIN, authAt: NOW + 600 }, "admin@example.com", NOW), false);
    });
});

describe("parseCollectPayload", () => {
    const uuid = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b";

    it("keeps valid events and counts", () => {
        const parsed = parseCollectPayload({
            consent: "accepted",
            visitorId: uuid,
            browserLanguage: "de-DE",
            events: [{ name: "draw_completed", path: "/en/raffle", tool: "raffle", participants: 48, winners: 2 }],
        });
        assert.deepEqual(parsed, {
            consent: "accepted",
            visitorId: uuid,
            browserLanguage: "de",
            events: [{ name: "draw_completed", path: "/en/raffle", tool: "raffle", participants: 48, winners: 2, referrerHost: null }],
        });
    });

    it("never stores unknown fields such as participant names", () => {
        const parsed = parseCollectPayload({
            events: [{ name: "draw_completed", path: "/raffle", tool: "raffle", names: ["Ayşe", "Mehmet"], winner: "Ayşe", participants: "Ayşe" }],
        });
        const serialized = JSON.stringify(parsed);
        assert.equal(serialized.includes("Ayşe"), false);
        assert.equal(parsed?.events[0].participants, null);
    });

    it("drops the visitor ID unless cookies were accepted", () => {
        for (const consent of ["declined", "unset", "something-else"]) {
            const parsed = parseCollectPayload({ consent, visitorId: uuid, events: [{ name: "page_view", path: "/" }] });
            assert.equal(parsed?.visitorId, null);
        }
    });

    it("rejects a malformed visitor ID", () => {
        const parsed = parseCollectPayload({ consent: "accepted", visitorId: "<script>", events: [{ name: "page_view", path: "/" }] });
        assert.equal(parsed?.visitorId, null);
    });

    it("rejects unknown events, unknown tools and oversized batches", () => {
        assert.equal(parseCollectPayload({ events: [{ name: "drop_table", path: "/" }] }), null);
        assert.equal(parseCollectPayload({ events: [] }), null);
        assert.equal(parseCollectPayload(null), null);
        const tooMany = Array.from({ length: MAX_EVENTS_PER_REQUEST + 1 }, () => ({ name: "page_view", path: "/" }));
        assert.equal(parseCollectPayload({ events: tooMany }), null);
        const parsed = parseCollectPayload({ events: [{ name: "draw_completed", path: "/", tool: "'; DROP TABLE x" }] });
        assert.equal(parsed?.events[0].tool, null);
    });

    it("clamps counts", () => {
        const parsed = parseCollectPayload({ events: [{ name: "draw_completed", path: "/", participants: 1e12, winners: -4 }] });
        assert.equal(parsed?.events[0].participants, 1_000_000);
        assert.equal(parsed?.events[0].winners, 0);
    });
});

describe("cleanPath and cleanReferrerHost", () => {
    it("strips query strings that can hold draw results", () => {
        assert.equal(cleanPath("/proof?d=eyJ3aW5uZXJzIjpbXX0"), "/proof");
        assert.equal(cleanPath("/raffle#top"), "/raffle");
    });

    it("rejects paths that could carry markup or point elsewhere", () => {
        assert.equal(cleanPath("<script>alert(1)</script>"), null);
        assert.equal(cleanPath("/x<script>"), null);
        assert.equal(cleanPath("//evil.example"), null);
        assert.equal(cleanPath("/" + "a".repeat(300)), null);
    });

    it("keeps only the referrer host", () => {
        assert.equal(cleanReferrerHost("https://www.google.com/search?q=secret"), "google.com");
        assert.equal(cleanReferrerHost("javascript:alert(1)"), null);
        assert.equal(cleanReferrerHost("not a url"), null);
    });
});

describe("user agent parsing", () => {
    const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    const windowsChrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    const edge = `${windowsChrome} Edg/130.0.0.0`;
    const androidTablet = "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Safari/537.36";

    it("detects device and browser", () => {
        assert.equal(parseDevice(iphone), "Mobil");
        assert.equal(parseBrowser(iphone), "Safari");
        assert.equal(parseDevice(windowsChrome), "Masaüstü");
        assert.equal(parseBrowser(windowsChrome), "Chrome");
        assert.equal(parseBrowser(edge), "Edge");
        assert.equal(parseDevice(androidTablet), "Tablet");
        assert.equal(parseBrowser(androidTablet), "Samsung Internet");
    });

    it("filters bots but not people", () => {
        assert.equal(isBotUserAgent(null), true);
        assert.equal(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), true);
        assert.equal(isBotUserAgent("curl/8.4.0"), true);
        assert.equal(isBotUserAgent(`${windowsChrome.replace("Chrome/", "HeadlessChrome/")}`), true);
        assert.equal(isBotUserAgent(iphone), false);
        assert.equal(isBotUserAgent(windowsChrome), false);
    });
});
