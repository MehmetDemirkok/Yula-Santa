/**
 * Saved draw history for signed-in users. Pure and client-safe: the save button,
 * the history page and the API route all use these types and this validation.
 *
 * Only signed-in users can save, and only when they press "save" on a result.
 * Guests keep drawing as before; nothing of theirs reaches the server.
 */

import { cleanEvent, type SantaEvent } from "@/lib/secretSanta/link";

/** Tools whose results can be saved. Dice, coin flip and random number have nothing worth keeping. */
export const HISTORY_TOOLS = [
    "secret_santa",
    "raffle",
    "youtube",
    "tiktok",
    "tiktok_extension",
    "wheel",
    "team_generator",
    "short_straw",
] as const;
export type HistoryTool = (typeof HISTORY_TOOLS)[number];

export const LIMITS = {
    title: 120,
    name: 100,
    note: 300,
    hint: 300,
    participants: 1000,
    winners: 100,
    backups: 100,
    teams: 50,
    pairs: 500,
    link: 4000,
    sourceUrl: 300,
    /** Saved draws kept per account; the oldest are dropped beyond this. */
    perAccount: 200,
    /** Request body cap for POST /api/draws. */
    bodyBytes: 256_000,
} as const;

export type SavedPerson = { name: string; note?: string };

export type SantaSnapshot = {
    mode: "secret" | "pairs";
    /** giver → receiver, exactly as lib/secretSanta/storage.ts keeps it. */
    assignments: Record<string, string>;
    /** Hints keyed by nameKey(receiver). */
    hints: Record<string, string>;
    event?: SantaEvent;
};

/** What the client sends and what the history page shows. */
export type DrawRecord = {
    tool: HistoryTool;
    title?: string;
    participantCount: number;
    /** The full list, for tools where it is short and typed by the user. Not for comment pickers. */
    participants?: string[];
    winners: SavedPerson[];
    backups: SavedPerson[];
    teams?: string[][];
    santa?: SantaSnapshot;
    /** Same-site link that proves or replays the result: "/proof?d=…" or "/verify/<id>". */
    proofPath?: string;
    /** The video the comments came from (YouTube/TikTok). */
    sourceUrl?: string;
};

export type SavedDraw = DrawRecord & { id: string; createdAt: string };

/** One row of the history list: enough to render a card without the full record. */
export type SavedDrawSummary = {
    id: string;
    tool: HistoryTool;
    title: string | null;
    participantCount: number;
    winnerPreview: string[];
    createdAt: string;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

function text(value: unknown, max: number): string | undefined {
    if (typeof value !== "string") return undefined;
    // Drop control characters, collapse whitespace.
    const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    return clean ? clean.slice(0, max) : undefined;
}

function names(value: unknown, max: number): string[] {
    if (!Array.isArray(value)) return [];
    const out: string[] = [];
    for (const item of value) {
        const name = text(item, LIMITS.name);
        if (name) out.push(name);
        if (out.length >= max) break;
    }
    return out;
}

function people(value: unknown, max: number): SavedPerson[] {
    if (!Array.isArray(value)) return [];
    const out: SavedPerson[] = [];
    for (const item of value) {
        const name = text(typeof item === "string" ? item : isObject(item) ? item.name : undefined, LIMITS.name);
        if (!name) continue;
        const note = isObject(item) ? text(item.note, LIMITS.note) : undefined;
        out.push(note ? { name, note } : { name });
        if (out.length >= max) break;
    }
    return out;
}

function santa(value: unknown): SantaSnapshot | undefined {
    if (!isObject(value) || !isObject(value.assignments)) return undefined;
    const assignments: Record<string, string> = {};
    let count = 0;
    for (const [giver, receiver] of Object.entries(value.assignments)) {
        const g = text(giver, LIMITS.name);
        const r = text(receiver, LIMITS.name);
        if (!g || !r) continue;
        assignments[g] = r;
        if (++count >= LIMITS.pairs) break;
    }
    if (count === 0) return undefined;
    const hints: Record<string, string> = {};
    if (isObject(value.hints)) {
        let n = 0;
        for (const [key, hint] of Object.entries(value.hints)) {
            const k = text(key, LIMITS.name);
            const h = text(hint, LIMITS.hint);
            if (!k || !h) continue;
            hints[k] = h;
            if (++n >= LIMITS.pairs) break;
        }
    }
    const event = isObject(value.event) ? cleanEvent(value.event as SantaEvent) : undefined;
    return { mode: value.mode === "pairs" ? "pairs" : "secret", assignments, hints, ...(event ? { event } : {}) };
}

/** Same-site, path-only links to the proof and verify pages. */
function proofPath(value: unknown): string | undefined {
    if (typeof value !== "string" || value.length > LIMITS.link) return undefined;
    return /^(?:\/[a-z]{2})?\/(?:proof\?d=[A-Za-z0-9_-]+|verify\/[A-Za-z0-9_-]+)$/.test(value) ? value : undefined;
}

function sourceUrl(value: unknown): string | undefined {
    if (typeof value !== "string" || value.length > LIMITS.sourceUrl) return undefined;
    try {
        const url = new URL(value);
        if (url.protocol !== "https:") return undefined;
        return /(^|\.)(youtube\.com|youtu\.be|tiktok\.com)$/.test(url.hostname) ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}

const isHistoryTool = (value: unknown): value is HistoryTool =>
    typeof value === "string" && (HISTORY_TOOLS as readonly string[]).includes(value);

/**
 * Cleans an untrusted record. Returns null when it has no tool or no result.
 * Strings are trimmed and capped, lists are capped, links must be same-site.
 */
export function cleanDrawRecord(input: unknown): DrawRecord | null {
    if (!isObject(input) || !isHistoryTool(input.tool)) return null;
    const tool = input.tool;

    const record: DrawRecord = {
        tool,
        participantCount: 0,
        winners: people(input.winners, LIMITS.winners),
        backups: people(input.backups, LIMITS.backups),
    };
    const title = text(input.title, LIMITS.title);
    if (title) record.title = title;

    const participants = names(input.participants, LIMITS.participants);
    if (participants.length) record.participants = participants;

    if (Array.isArray(input.teams)) {
        const teams = input.teams.slice(0, LIMITS.teams).map((team) => names(team, LIMITS.participants)).filter((team) => team.length);
        if (teams.length) record.teams = teams;
    }

    if (tool === "secret_santa") {
        const snapshot = santa(input.santa);
        if (!snapshot) return null;
        record.santa = snapshot;
    }

    const proof = proofPath(input.proofPath);
    if (proof) record.proofPath = proof;
    const source = sourceUrl(input.sourceUrl);
    if (source) record.sourceUrl = source;

    const declared = typeof input.participantCount === "number" && Number.isFinite(input.participantCount) ? Math.floor(input.participantCount) : 0;
    const known = Math.max(
        participants.length,
        record.santa ? Object.keys(record.santa.assignments).length : 0,
        record.teams ? record.teams.reduce((sum, team) => sum + team.length, 0) : 0,
    );
    record.participantCount = Math.min(Math.max(declared, known, 0), 10_000_000);

    const hasResult = record.winners.length > 0 || Boolean(record.teams?.length) || Boolean(record.santa);
    return hasResult ? record : null;
}

/** Names shown on the history card before it is opened. */
export function winnerPreview(record: DrawRecord): string[] {
    return record.winners.slice(0, 3).map((w) => w.name);
}
