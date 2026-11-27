import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanDrawRecord, HISTORY_TOOLS, LIMITS, winnerPreview } from "../../lib/drawHistory/types";
import { TOOLS } from "../../lib/analytics/events";
import { accountKey } from "../../lib/auth/accountKey";

test("history tools are all known analytics tools", () => {
    for (const tool of HISTORY_TOOLS) assert.ok((TOOLS as readonly string[]).includes(tool), tool);
});

test("rejects unknown tools and records without a result", () => {
    assert.equal(cleanDrawRecord(null), null);
    assert.equal(cleanDrawRecord({ tool: "dice", winners: ["6"] }), null);
    assert.equal(cleanDrawRecord({ tool: "raffle", winners: [] }), null);
    assert.equal(cleanDrawRecord({ tool: "secret_santa", winners: [] }), null);
});

test("raffle: trims names, keeps notes, counts participants", () => {
    const record = cleanDrawRecord({
        tool: "raffle",
        title: "  Ofis   çekilişi ",
        participants: ["Ali", " ", "Veli\n", 42, "Ayşe"],
        winners: [{ name: " Ali ", note: "  tebrikler " }, "Veli"],
        backups: [{ name: "" }, { name: "Ayşe" }],
        participantCount: 1,
    });
    assert.ok(record);
    assert.equal(record.title, "Ofis çekilişi");
    assert.deepEqual(record.participants, ["Ali", "Veli", "Ayşe"]);
    assert.deepEqual(record.winners, [{ name: "Ali", note: "tebrikler" }, { name: "Veli" }]);
    assert.deepEqual(record.backups, [{ name: "Ayşe" }]);
    // The declared count can never be lower than the list we actually have.
    assert.equal(record.participantCount, 3);
    assert.deepEqual(winnerPreview(record), ["Ali", "Veli"]);
});

test("caps long strings and lists", () => {
    const many = Array.from({ length: LIMITS.participants + 50 }, (_, i) => `kişi ${i}`);
    const record = cleanDrawRecord({ tool: "wheel", participants: many, winners: ["x".repeat(500)] });
    assert.ok(record);
    assert.equal(record.participants?.length, LIMITS.participants);
    assert.equal(record.winners[0].name.length, LIMITS.name);
});

test("teams count as a result", () => {
    const record = cleanDrawRecord({ tool: "team_generator", winners: [], teams: [["A", "B"], [], ["C"]] });
    assert.ok(record);
    assert.deepEqual(record.teams, [["A", "B"], ["C"]]);
    assert.equal(record.participantCount, 3);
});

test("secret santa keeps assignments, hints and a cleaned event", () => {
    const record = cleanDrawRecord({
        tool: "secret_santa",
        winners: [],
        santa: {
            mode: "secret",
            assignments: { Ali: "Veli", Veli: "Ayşe", Ayşe: "Ali", "": "x" },
            hints: { veli: "kitap sever", ayşe: "" },
            event: { name: "Ofis 2027", date: "2027-02-30", budget: "500 TL" },
        },
    });
    assert.ok(record?.santa);
    assert.equal(Object.keys(record.santa.assignments).length, 3);
    assert.deepEqual(record.santa.hints, { veli: "kitap sever" });
    assert.deepEqual(record.santa.event, { name: "Ofis 2027", budget: "500 TL" });
    assert.equal(record.participantCount, 3);
});

test("links must be same-site proof/verify paths and https video URLs", () => {
    const base = { tool: "youtube", winners: ["Ali"] };
    assert.equal(cleanDrawRecord({ ...base, proofPath: "/proof?d=abc_-1" })?.proofPath, "/proof?d=abc_-1");
    assert.equal(cleanDrawRecord({ ...base, proofPath: "/en/verify/0b1c" })?.proofPath, "/en/verify/0b1c");
    assert.equal(cleanDrawRecord({ ...base, proofPath: "//evil.com/proof?d=a" })?.proofPath, undefined);
    assert.equal(cleanDrawRecord({ ...base, proofPath: "javascript:alert(1)" })?.proofPath, undefined);
    assert.equal(cleanDrawRecord({ ...base, sourceUrl: "https://www.youtube.com/watch?v=x" })?.sourceUrl, "https://www.youtube.com/watch?v=x");
    assert.equal(cleanDrawRecord({ ...base, sourceUrl: "http://www.youtube.com/watch?v=x" })?.sourceUrl, undefined);
    assert.equal(cleanDrawRecord({ ...base, sourceUrl: "https://evil-youtube.com/x" })?.sourceUrl, undefined);
    assert.equal(cleanDrawRecord({ ...base, sourceUrl: "https://vm.tiktok.com/abc" })?.sourceUrl, "https://vm.tiktok.com/abc");
});

test("a password account with an unproven e-mail never shares a Google user's history", () => {
    const google = accountKey({ provider: "google", user: { email: "a@gmail.com" } });
    const squatter = accountKey({ provider: "credentials", accountId: "123", user: { email: "a@gmail.com" } });
    const proven = accountKey({ provider: "credentials", accountId: "123", emailProven: true, user: { email: "a@gmail.com" } });
    assert.notEqual(google, squatter);
    assert.equal(google, proven);
});
