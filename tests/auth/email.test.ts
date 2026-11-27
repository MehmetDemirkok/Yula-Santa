import { test } from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { accountLink, appOrigin, pickLocale } from "../../lib/auth/emailLinks";
import { renderAccountEmail } from "../../lib/email/templates";
import { isAdminSession } from "../../lib/admin/access";

test("e-mailed links use the real site in production, never the Host header", () => {
    assert.equal(appOrigin("https://evil.example/api/auth/forgot", "production"), "https://www.yulasanta.com.tr");
    assert.equal(appOrigin("http://localhost:3000/api/auth/forgot", undefined), "http://localhost:3000");
    assert.equal(accountLink("https://www.yulasanta.com.tr", "tr", "/reset-password", "a b"), "https://www.yulasanta.com.tr/reset-password?token=a%20b");
    assert.equal(accountLink("https://www.yulasanta.com.tr", "en", "/verify-email", "x"), "https://www.yulasanta.com.tr/en/verify-email?token=x");
    assert.equal(pickLocale("xx"), "tr");
});

test("account e-mails carry the link in HTML and text, in every language", () => {
    for (const locale of ["tr", "en", "de", "fr", "es", "it", "pt", "ru", "ar", "ja", "ko", "zh"]) {
        const messages = JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8"));
        for (const kind of ["reset", "verify"] as const) {
            const copy = messages.auth.mail[kind];
            assert.ok(copy?.subject && copy.button, `${locale}.${kind}`);
            const mail = renderAccountEmail(copy, locale, "https://www.yulasanta.com.tr/x?token=abc&y=1");
            assert.equal(mail.subject, copy.subject);
            assert.ok(mail.text.includes("token=abc&y=1"));
            assert.ok(mail.html.includes('href="https://www.yulasanta.com.tr/x?token=abc&amp;y=1"'), "the link is escaped inside HTML");
            assert.ok(mail.html.includes(locale === "ar" ? 'dir="rtl"' : 'dir="ltr"'));
        }
    }
});

test("an e-mail + password session can never open the admin panel, even with the admin's address", () => {
    const now = 1_000_000;
    const allowlist = "admin@example.com";
    // Password sessions always carry emailVerified = false (auth.ts), whatever the address.
    assert.equal(isAdminSession({ email: "admin@example.com", emailVerified: false, authAt: now }, allowlist, now), false);
    assert.equal(isAdminSession({ email: "admin@example.com", emailVerified: true, authAt: now }, allowlist, now), true);
    assert.equal(isAdminSession({ email: "someone@example.com", emailVerified: true, authAt: now }, allowlist, now), false);
});
