/**
 * Shareable draw proof without a database.
 * Encodes a compact JSON payload into a URL-safe token for /proof?d=...
 */

import { SITE_HOST } from "@/lib/constants";

export type DrawProof = {
    v: 1;
    platform: "instagram" | "youtube" | "tiktok" | "raffle";
    title: string;
    at: string; // ISO
    seed: string;
    total: number;
    eligible: number;
    keyword?: string;
    countUserOnce: boolean;
    winners: { name: string; comment?: string }[];
    backups: { name: string }[];
};

function toBase64Url(bytes: Uint8Array): string {
    let bin = "";
    bytes.forEach((b) => {
        bin += String.fromCharCode(b);
    });
    const b64 = typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bytes).toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): Uint8Array {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const b64 = padded + pad;
    const bin = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

/** Cryptographically strong hex seed for display / audit trail. */
export function createDrawSeed(): string {
    const buf = new Uint8Array(16);
    if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(buf);
    } else {
        for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildDrawProof(input: Omit<DrawProof, "v" | "at" | "seed"> & { seed?: string; at?: string }): DrawProof {
    return {
        v: 1,
        at: input.at ?? new Date().toISOString(),
        seed: input.seed ?? createDrawSeed(),
        platform: input.platform,
        title: input.title,
        total: input.total,
        eligible: input.eligible,
        keyword: input.keyword?.trim() || undefined,
        countUserOnce: input.countUserOnce,
        winners: input.winners.map((w) => ({ name: w.name, comment: w.comment })),
        backups: input.backups.map((b) => ({ name: b.name })),
    };
}

export function encodeProofToken(proof: DrawProof): string {
    const json = JSON.stringify(proof);
    const bytes = new TextEncoder().encode(json);
    return toBase64Url(bytes);
}

export function decodeProofToken(token: string): DrawProof | null {
    try {
        const bytes = fromBase64Url(token.trim());
        const json = new TextDecoder().decode(bytes);
        const data = JSON.parse(json) as DrawProof;
        if (data?.v !== 1 || !Array.isArray(data.winners) || !data.seed || !data.at) return null;
        return data;
    } catch {
        return null;
    }
}

export function proofPath(locale: string, token: string): string {
    // default locale (tr) is unprefixed with as-needed
    const prefix = locale === "tr" ? "" : `/${locale}`;
    return `${prefix}/proof?d=${encodeURIComponent(token)}`;
}

export function formatProofText(proof: DrawProof, site = SITE_HOST): string {
    const when = new Date(proof.at).toLocaleString();
    const winners = proof.winners.map((w, i) => `${i + 1}. @${w.name}`).join("\n");
    const backups =
        proof.backups.length > 0
            ? `\n\nYedekler / Backups:\n${proof.backups.map((b, i) => `${i + 1}. @${b.name}`).join("\n")}`
            : "";
    const keyword = proof.keyword ? `\nKeyword: "${proof.keyword}"` : "";
    return [
        `🎲 YulaSanta Draw Proof`,
        proof.title,
        `Drawn: ${when}`,
        `Platform: ${proof.platform}`,
        `Entries: ${proof.eligible} eligible / ${proof.total} total`,
        `Dedupe: ${proof.countUserOnce ? "on" : "off"}${keyword}`,
        `Seed: ${proof.seed}`,
        `Algorithm: crypto Fisher–Yates (secureShuffle)`,
        "",
        `Winners:`,
        winners + backups,
        "",
        `Verify: https://${site}/proof?d=…`,
        site,
    ].join("\n");
}
