/**
 * Browser storage for the Secret Santa setup and the last draw. Everything
 * stays in this browser's localStorage; nothing here talks to the server.
 */

import { cleanEvent, type SantaEvent } from "./link";
import type { Exclusion, SantaGroup } from "./draw";

export type DrawMode = "secret" | "pairs";

export type SantaSetup = {
    exclusions: Exclusion[];
    /** "Same group must not draw each other" sets, members keyed by `nameKey`. */
    groups: SantaGroup[];
    /** Hints keyed by `nameKey(name)`. */
    hints: Record<string, string>;
    event: SantaEvent;
};

export type SantaDraw = {
    v: 2;
    mode: DrawMode;
    assignments: Record<string, string>;
    hints: Record<string, string>;
    event?: SantaEvent;
    createdAt: string;
    /** Givers who already opened their result on this device (shared-screen mode). */
    seen: string[];
    /** Givers whose link the organizer has sent or copied. */
    sent: string[];
};

export const KEYS = {
    participants: "participants_draft",
    mode: "draw_mode",
    setup: "secret_santa_setup_v2",
    draw: "secret_santa_draw_v2",
    /** Pre-v2 draw result; read once for migration, then removed. */
    legacyAssignments: "secret_santa_assignments",
} as const;

function read<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function write(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Private mode or full storage: the page still works for this visit.
    }
}

export function loadSetup(): SantaSetup {
    const data = read<Partial<SantaSetup>>(KEYS.setup);
    return {
        exclusions: Array.isArray(data?.exclusions)
            ? data.exclusions.filter((e): e is Exclusion => Array.isArray(e) && e.length === 2 && e.every((x) => typeof x === "string"))
            : [],
        groups: Array.isArray(data?.groups)
            ? data.groups.filter(
                  (g): g is SantaGroup =>
                      Boolean(g) && typeof g.id === "string" && typeof g.name === "string" && Array.isArray(g.members)
              )
            : [],
        hints: data?.hints && typeof data.hints === "object" ? (data.hints as Record<string, string>) : {},
        event: data?.event && typeof data.event === "object" ? data.event : {},
    };
}

export function saveSetup(setup: SantaSetup): void {
    write(KEYS.setup, setup);
}

export function loadParticipants(): string[] {
    const data = read<unknown>(KEYS.participants);
    return Array.isArray(data) ? data.filter((x): x is string => typeof x === "string") : [];
}

export function saveParticipants(names: string[]): void {
    write(KEYS.participants, names);
}

export function loadMode(): DrawMode {
    try {
        return localStorage.getItem(KEYS.mode) === "pairs" ? "pairs" : "secret";
    } catch {
        return "secret";
    }
}

export function saveMode(mode: DrawMode): void {
    try {
        localStorage.setItem(KEYS.mode, mode);
    } catch {
        // ignore
    }
}

export function saveDraw(draw: Omit<SantaDraw, "v" | "createdAt" | "seen" | "sent">): SantaDraw {
    const full: SantaDraw = { ...draw, event: cleanEvent(draw.event), v: 2, createdAt: new Date().toISOString(), seen: [], sent: [] };
    write(KEYS.draw, full);
    try {
        localStorage.removeItem(KEYS.legacyAssignments);
    } catch {
        // ignore
    }
    return full;
}

export function updateDraw(draw: SantaDraw): void {
    write(KEYS.draw, draw);
}

export function loadDraw(): SantaDraw | null {
    const data = read<SantaDraw>(KEYS.draw);
    if (data?.v === 2 && data.assignments && typeof data.assignments === "object") {
        return {
            ...data,
            hints: data.hints ?? {},
            seen: Array.isArray(data.seen) ? data.seen : [],
            sent: Array.isArray(data.sent) ? data.sent : [],
        };
    }
    // A draw made before this version: keep it working on the result page.
    const legacy = read<Record<string, string>>(KEYS.legacyAssignments);
    if (legacy && typeof legacy === "object" && Object.keys(legacy).length) {
        return { v: 2, mode: loadMode(), assignments: legacy, hints: {}, createdAt: new Date().toISOString(), seen: [], sent: [] };
    }
    return null;
}
