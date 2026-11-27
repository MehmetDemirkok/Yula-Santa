import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanName, emailError, normalizeEmail, passwordError, registrationError } from "../../lib/auth/credentials";
import { hashPassword, verifyPassword } from "../../lib/auth/password";
import { accountKey } from "../../lib/auth/accountKey";

test("e-mails are normalized and checked", () => {
    assert.equal(normalizeEmail("  Ali@Example.COM "), "ali@example.com");
    assert.equal(normalizeEmail(42), "");
    assert.equal(emailError(""), "emailRequired");
    assert.equal(emailError("ali@example"), "emailInvalid");
    assert.equal(emailError("ali example@x.com"), "emailInvalid");
    assert.equal(emailError("ali@example.com"), null);
});

test("passwords need 8 to 128 characters", () => {
    assert.equal(passwordError(""), "passwordRequired");
    assert.equal(passwordError(undefined), "passwordRequired");
    assert.equal(passwordError("1234567"), "passwordMin");
    assert.equal(passwordError("12345678"), null);
    assert.equal(passwordError("x".repeat(129)), "passwordMax");
});

test("registration reports the first problem", () => {
    assert.equal(registrationError({ name: "  ", email: "a@b.co", password: "12345678" }), "nameRequired");
    assert.equal(registrationError({ name: "Ali", email: "nope", password: "12345678" }), "emailInvalid");
    assert.equal(registrationError({ name: "Ali", email: "a@b.co", password: "short" }), "passwordMin");
    assert.equal(registrationError({ name: "Ali", email: "a@b.co", password: "12345678" }), null);
    assert.equal(cleanName("  Ali \n  Veli "), "Ali Veli");
});

test("password hashes verify only the right password", async () => {
    const hash = await hashPassword("çok gizli şifre");
    assert.match(hash, /^scrypt\$16384\$8\$1\$/);
    assert.notEqual(hash, await hashPassword("çok gizli şifre"), "salted");
    assert.equal(await verifyPassword("çok gizli şifre", hash), true);
    assert.equal(await verifyPassword("çok gizli şifrE", hash), false);
    assert.equal(await verifyPassword("anything", "garbage"), false);
});

test("e-mail + password accounts never share a Plaka identity with a Google e-mail", () => {
    const google = { provider: "google", user: { email: "ali@gmail.com" } };
    const impostor = { provider: "credentials", accountId: "u1", user: { email: "ali@gmail.com" } };
    assert.equal(accountKey(google), "ali@gmail.com");
    assert.equal(accountKey(impostor), "credentials:u1");
    assert.notEqual(accountKey(google), accountKey(impostor));
    assert.equal(accountKey({ provider: "credentials", user: { email: "x@y.co" } }), null);
    assert.equal(accountKey({ user: { email: "old@gmail.com" } }), "old@gmail.com", "pre-existing Google sessions keep their key");
    assert.equal(accountKey(null), null);
    const linked = { provider: "credentials", accountId: "u2", emailProven: true, user: { email: "ali@gmail.com" } };
    assert.equal(accountKey(linked), accountKey(google), "a password set by the Google owner shares their identity");
});
