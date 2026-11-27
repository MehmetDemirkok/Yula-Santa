import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDuration, memberKey } from "../../lib/admin/memberFormat";

test("member key: Google by e-mail, password accounts by id", () => {
    assert.equal(memberKey({ provider: "google", email: " Ali@Gmail.com " }), "google:ali@gmail.com");
    // Old sessions have no provider; they are all Google.
    assert.equal(memberKey({ email: "a@b.co" }), "google:a@b.co");
    assert.equal(memberKey({ provider: "credentials", accountId: "42", email: "a@b.co" }), "credentials:42");
    // An unverified password account must not share the Google row of the same address.
    assert.notEqual(memberKey({ provider: "credentials", accountId: "42", email: "a@b.co" }), memberKey({ provider: "google", email: "a@b.co" }));
    assert.equal(memberKey({ provider: "credentials", email: "a@b.co" }), null);
    assert.equal(memberKey({ provider: "google", email: "" }), null);
});

test("durations read in Turkish units", () => {
    assert.equal(formatDuration(null), "–");
    assert.equal(formatDuration(0), "–");
    assert.equal(formatDuration(45), "45 sn");
    assert.equal(formatDuration(14 * 60 + 20), "14 dk");
    assert.equal(formatDuration(2 * 3600 + 5 * 60), "2 sa 05 dk");
});
