import { test } from "node:test";
import assert from "node:assert/strict";
import { readDeviceDraws } from "../../lib/account/deviceDraws";
import { readFileSync } from "node:fs";
import { DELETE_REAUTH_SECONDS, DELETE_WORDS, isDeleteConfirmed, isFreshSignIn } from "../../lib/auth/deletion";

const storage = (entries: Record<string, unknown>) => (key: string) =>
    key in entries ? (typeof entries[key] === "string" ? (entries[key] as string) : JSON.stringify(entries[key])) : null;

test("device draws: counts only, from each tool's own key", () => {
    const draws = readDeviceDraws(
        storage({
            secret_santa_draw_v2: { v: 2, assignments: { Ali: "Veli", Veli: "Ayşe", Ayşe: "Ali" }, createdAt: "2026-11-20T10:00:00Z" },
            participants_draft: ["Ali", "Veli", " "],
            generic_raffle_draft: ["A", "B", "C", "D"],
            yulasanta_wheel_v1: { segments: ["x", "y"], isSample: false, history: [{ id: 1, name: "x", at: 1700000000000 }] },
        }),
    );
    assert.deepEqual(draws.map((d) => d.kind), ["santaResult", "santaDraft", "raffleDraft", "wheel"]);
    assert.equal(draws[0].kind === "santaResult" && draws[0].people, 3);
    assert.equal(draws[1].kind === "santaDraft" && draws[1].people, 2);
    assert.equal(draws[3].kind === "wheel" && draws[3].spins, 1);
    assert.ok(!JSON.stringify(draws).includes("Veli"), "no names leak into the summary");
});

test("device draws: empty, sample or broken storage lists nothing", () => {
    assert.deepEqual(readDeviceDraws(() => null), []);
    assert.deepEqual(
        readDeviceDraws(storage({ secret_santa_draw_v2: "{broken", yulasanta_wheel_v1: { segments: ["a"], isSample: true }, participants_draft: [] })),
        [],
    );
});

test("deleting an account needs the confirm word and a recent Google sign-in", () => {
    for (const ok of ["SİL", "sil", "Sil", "SIL", " sil "]) assert.equal(isDeleteConfirmed(ok, "tr"), true, ok);
    for (const bad of ["", "si", "delete", "SİLL", null]) assert.equal(isDeleteConfirmed(bad, "tr"), false, String(bad));
    assert.equal(isDeleteConfirmed("delete", "en"), true);
    assert.equal(isDeleteConfirmed("löschen", "de"), true);
    assert.equal(isDeleteConfirmed("SİL", "en"), false);
    assert.equal(isDeleteConfirmed("удалить", "ru"), true);
    const now = 1_000_000;
    assert.equal(isFreshSignIn(now - 60, now), true);
    assert.equal(isFreshSignIn(now - DELETE_REAUTH_SECONDS - 1, now), false);
    assert.equal(isFreshSignIn(undefined, now), false);
    assert.equal(isFreshSignIn(now + 100, now), false);
});

test("the confirm word shown in each language is the one the server accepts", () => {
    for (const [locale, word] of Object.entries(DELETE_WORDS)) {
        const messages = JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8"));
        assert.equal(messages.auth.accountPage.deleteWord, word, locale);
        assert.equal(isDeleteConfirmed(word, locale), true, locale);
    }
});
