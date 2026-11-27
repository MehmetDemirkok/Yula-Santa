/**
 * Password hashing with Node's scrypt (server-only; never import from a client
 * component). Stored as `scrypt$N$r$p$salt$hash`, so the cost can be raised later
 * without breaking existing hashes.
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEM = 64 * 1024 * 1024;

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
    return new Promise((resolve, reject) =>
        scryptCb(password.normalize("NFKC"), salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key))),
    );
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: MAX_MEM });
    return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [, n, r, p, saltText, keyText] = parts;
    const expected = Buffer.from(keyText, "base64url");
    if (expected.length === 0) return false;
    try {
        const key = await scrypt(password, Buffer.from(saltText, "base64url"), expected.length, {
            N: Number(n),
            r: Number(r),
            p: Number(p),
            maxmem: MAX_MEM,
        });
        return timingSafeEqual(key, expected);
    } catch {
        return false;
    }
}

/** A real hash of a random password, checked when the e-mail is unknown so both cases take as long. */
let dummyHash: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
    dummyHash ??= hashPassword(randomBytes(18).toString("base64url"));
    return dummyHash;
}
