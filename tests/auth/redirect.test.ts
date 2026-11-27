import { test } from "node:test";
import assert from "node:assert/strict";
import { loginHref, safeRedirect } from "../../lib/auth/redirect";

test("safeRedirect keeps same-site paths", () => {
    assert.equal(safeRedirect("/raffle", "/"), "/raffle");
    assert.equal(safeRedirect("/en/youtube?x=1#top", "/"), "/en/youtube?x=1#top");
});

test("safeRedirect rejects other sites and junk", () => {
    for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "raffle", "", null, undefined, "/a\nb"]) {
        assert.equal(safeRedirect(bad, "/home"), "/home", String(bad));
    }
});

test("safeRedirect never returns to the sign-in pages", () => {
    for (const loop of ["/login", "/register", "/en/login", "/de/register/", "/login?callbackUrl=/x"]) {
        assert.equal(safeRedirect(loop, "/"), "/", loop);
    }
    assert.equal(safeRedirect("/logins", "/"), "/logins");
});

test("loginHref adds a return path only when it is useful", () => {
    assert.equal(loginHref("/login", "/raffle"), "/login?callbackUrl=%2Fraffle");
    assert.equal(loginHref("/en/login", "/"), "/en/login");
    assert.equal(loginHref("/login", "/login"), "/login");
    assert.equal(loginHref("/login", "//evil.com"), "/login");
});
