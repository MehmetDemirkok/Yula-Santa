import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanExclusions, dedupeNames, drawPairs, drawSecretSanta, nameKey, type Exclusion } from "../../lib/secretSanta/draw";
import { buildIcs, buildSantaLink, cleanDate, decodeSantaLink, encodeSantaLink, whatsappUrl } from "../../lib/secretSanta/link";

const NAMES = ["Ayşe", "Mehmet", "Zeynep", "Can", "Elif", "Burak"];

function assertValidSecret(names: string[], assignments: Record<string, string>, exclusions: Exclusion[] = []) {
    assert.deepEqual(Object.keys(assignments).sort(), [...names].sort());
    assert.deepEqual(Object.values(assignments).sort(), [...names].sort(), "everyone receives exactly once");
    for (const [g, r] of Object.entries(assignments)) {
        assert.notEqual(g, r, "nobody draws themselves");
        for (const [a, b] of exclusions) {
            assert.ok(!((g === a && r === b) || (g === b && r === a)), `${g} must not draw ${r}`);
        }
    }
}

test("secret draw: valid permutation without self matches", () => {
    for (let i = 0; i < 200; i++) {
        const res = drawSecretSanta(NAMES);
        assert.ok(res.ok);
        if (res.ok) assertValidSecret(NAMES, res.assignments);
    }
});

test("secret draw: exclusions are honored in both directions", () => {
    const ex: Exclusion[] = [["Ayşe", "Mehmet"], ["Zeynep", "Can"], ["Elif", "Burak"]];
    for (let i = 0; i < 200; i++) {
        const res = drawSecretSanta(NAMES, ex);
        assert.ok(res.ok);
        if (res.ok) assertValidSecret(NAMES, res.assignments, ex);
    }
});

test("secret draw: exclusions match names case-insensitively", () => {
    const ex: Exclusion[] = [["ayşe", "MEHMET"]];
    for (let i = 0; i < 100; i++) {
        const res = drawSecretSanta(NAMES, ex);
        assert.ok(res.ok);
        if (res.ok) assertValidSecret(NAMES, res.assignments, [["Ayşe", "Mehmet"]]);
    }
});

test("secret draw: tight rules fall back to search and still succeed", () => {
    // Everyone except a fixed cycle is excluded: only one valid assignment exists (A→B→C→D→A or reverse).
    const names = ["A", "B", "C", "D"];
    const ex: Exclusion[] = [["A", "C"], ["B", "D"]];
    const res = drawSecretSanta(names, ex);
    assert.ok(res.ok);
    if (res.ok) assertValidSecret(names, res.assignments, ex);
});

test("secret draw: reports impossible rule sets", () => {
    const res = drawSecretSanta(["A", "B", "C"], [["A", "B"], ["A", "C"]]);
    assert.deepEqual(res, { ok: false, reason: "impossible" });
    // Hall violation that no single person reveals: three people may only give to one shared person.
    const hall = drawSecretSanta(["A", "B", "C", "D"], [["A", "B"], ["A", "C"], ["B", "C"]]);
    assert.deepEqual(hall, { ok: false, reason: "impossible" });
});

test("secret draw: too few and duplicate names", () => {
    assert.deepEqual(drawSecretSanta(["A", "B"]), { ok: false, reason: "too_few" });
    assert.deepEqual(drawSecretSanta(["Ali", "ali ", "Veli"]), { ok: false, reason: "duplicate" });
});

test("secret draw: roughly uniform over who Ayşe draws", () => {
    const counts: Record<string, number> = {};
    const runs = 6000;
    for (let i = 0; i < runs; i++) {
        const res = drawSecretSanta(NAMES);
        if (res.ok) counts[res.assignments["Ayşe"]] = (counts[res.assignments["Ayşe"]] ?? 0) + 1;
    }
    const expected = runs / (NAMES.length - 1);
    for (const name of NAMES.slice(1)) {
        assert.ok(Math.abs((counts[name] ?? 0) - expected) < expected * 0.15, `${name}: ${counts[name]}`);
    }
});

test("pairs: mutual pairs, exclusions honored, odd and impossible detected", () => {
    const ex: Exclusion[] = [["Ayşe", "Mehmet"]];
    for (let i = 0; i < 200; i++) {
        const res = drawPairs(NAMES, ex);
        assert.ok(res.ok);
        if (!res.ok) continue;
        for (const [a, b] of Object.entries(res.assignments)) {
            assert.equal(res.assignments[b], a);
            assert.notEqual(a, b);
            assert.ok(!(a === "Ayşe" && b === "Mehmet") && !(a === "Mehmet" && b === "Ayşe"));
        }
    }
    assert.deepEqual(drawPairs(["A", "B", "C"]), { ok: false, reason: "odd" });
    assert.deepEqual(drawPairs(["A", "B"], [["A", "B"]]), { ok: false, reason: "impossible" });
});

test("name helpers: dedupe and exclusion cleanup", () => {
    assert.deepEqual(dedupeNames(["Ali", " ali", "Veli  Can", "veli can", "", "İrem", "irem"]), ["Ali", "Veli Can", "İrem"]);
    assert.equal(nameKey("  İREM  "), "irem");
    assert.deepEqual(
        cleanExclusions(["Ali", "Veli", "Can"], [["Ali", "Veli"], ["veli", "ali"], ["Ali", "Gone"], ["Can", "can"]]),
        [["Ali", "Veli"]]
    );
});

test("link: round trip keeps unicode and event details", () => {
    const token = encodeSantaLink({
        g: "Çağrı",
        r: "Şükrü Öztürk",
        h: "Kahve ve kitap sever ☕",
        e: { name: "Ofis 2027", budget: "500 TL", date: "2026-12-31", note: "El yapımı olursa süper" },
    });
    assert.match(token, /^[A-Za-z0-9_-]+$/);
    const back = decodeSantaLink(token);
    assert.deepEqual(back, {
        v: 1,
        g: "Çağrı",
        r: "Şükrü Öztürk",
        h: "Kahve ve kitap sever ☕",
        e: { name: "Ofis 2027", budget: "500 TL", date: "2026-12-31", note: "El yapımı olursa süper" },
    });
    assert.deepEqual(decodeSantaLink(`#${token}`), back);
});

test("link: rejects garbage and trims oversized fields", () => {
    assert.equal(decodeSantaLink(""), null);
    assert.equal(decodeSantaLink("not base64 !!"), null);
    assert.equal(decodeSantaLink(encodeSantaLink({ g: "", r: "X" })), null);
    const long = decodeSantaLink(encodeSantaLink({ g: "A", r: "B", h: "x".repeat(500), e: { date: "2026-02-30" } }));
    assert.equal(long?.h?.length, 150);
    assert.equal(long?.e, undefined, "invalid date is dropped");
});

test("link: builds locale-aware URLs with the token in the fragment", () => {
    const tr = buildSantaLink("https://www.yulasanta.com.tr/", "tr", { g: "A", r: "B" });
    assert.match(tr, /^https:\/\/www\.yulasanta\.com\.tr\/s#[A-Za-z0-9_-]+$/);
    const en = buildSantaLink("http://localhost:3000", "en", { g: "A", r: "B" });
    assert.match(en, /^http:\/\/localhost:3000\/en\/s#/);
    assert.equal(whatsappUrl("Merhaba & selam"), "https://wa.me/?text=Merhaba%20%26%20selam");
});

test("ics: all-day event without the receiver's name", () => {
    assert.equal(cleanDate("2026-12-31"), "2026-12-31");
    assert.equal(cleanDate("31.12.2026"), undefined);
    const ics = buildIcs({ name: "Ofis; 2027", budget: "500 TL", date: "2026-12-31" }, "Secret Santa", new Date("2026-11-09T10:00:00Z"));
    assert.ok(ics);
    assert.match(ics!, /DTSTART;VALUE=DATE:20261231/);
    assert.match(ics!, /DTEND;VALUE=DATE:20270101/);
    assert.match(ics!, /SUMMARY:Ofis\\; 2027/);
    assert.equal(buildIcs({ name: "x" }, "y"), null);
});

test("groups: members of a group never draw each other", async () => {
    const { groupExclusions, oversizedGroup, cleanGroups } = await import("../../lib/secretSanta/draw");
    const names = ["Ayşe", "Mehmet", "Zeynep", "Can", "Elif", "Burak", "Deniz"];
    const groups = [
        { id: "1", name: "Yılmazlar", members: ["ayşe", "mehmet", "zeynep"] },
        { id: "2", name: "Ekip", members: ["Can", "Elif", "Gone"] },
    ];
    const ex = groupExclusions(names, groups);
    assert.equal(ex.length, 3 + 1);
    for (let i = 0; i < 200; i++) {
        const res = drawSecretSanta(names, ex);
        assert.ok(res.ok);
        if (!res.ok) continue;
        assertValidSecret(names, res.assignments, ex);
    }
    assert.equal(oversizedGroup(names, groups), null);
    const big = [{ id: "3", name: "Büyük", members: ["Ayşe", "Mehmet", "Zeynep", "Can"] }];
    assert.equal(oversizedGroup(names, big)?.name, "Büyük");
    assert.deepEqual(drawSecretSanta(names, groupExclusions(names, big)), { ok: false, reason: "impossible" });
    assert.deepEqual(cleanGroups(["Can", "Elif"], groups), [{ id: "2", name: "Ekip", members: ["can", "elif"] }]);
    assert.equal(cleanGroups(["Can"], groups, true).length, 2);
});

test("link helpers: countdown, e-mail and SMS URLs", async () => {
    const { daysUntil, emailUrl, smsUrl } = await import("../../lib/secretSanta/link");
    const now = new Date(2026, 11, 20, 23, 30); // local time, late evening
    assert.equal(daysUntil("2026-12-31", now), 11);
    assert.equal(daysUntil("2026-12-20", now), 0);
    assert.equal(daysUntil("2026-12-19", now), -1);
    assert.equal(daysUntil("2027-01-01", now), 12);
    assert.equal(daysUntil(undefined, now), null);
    assert.equal(emailUrl("Sonuç & hediye", "Merhaba\nlink"), "mailto:?subject=Sonu%C3%A7%20%26%20hediye&body=Merhaba%0Alink");
    assert.equal(smsUrl("a b"), "sms:?&body=a%20b");
});

test("splitNameList: pasted lists with numbering and bullets", async () => {
    const { splitNameList } = await import("../../lib/secretSanta/draw");
    assert.deepEqual(splitNameList("1. Ayşe\n2) Mehmet\r\n- Zeynep\n• Can\n\n"), ["Ayşe", "Mehmet", "Zeynep", "Can"]);
    assert.deepEqual(splitNameList("Ali, Veli; Can\tElif"), ["Ali", "Veli", "Can", "Elif"]);
    assert.deepEqual(splitNameList("Ayşe Yılmaz"), ["Ayşe Yılmaz"]);
    assert.deepEqual(splitNameList("10A Sınıfı"), ["10A Sınıfı"], "a leading number without a separator stays");
});
