/**
 * Browser side of the draw history: saving a record and the "sign in to save"
 * hand-off. Client-only, no Node imports.
 *
 * A guest who presses "save" gets the record parked in localStorage, signs in,
 * and lands on /account/draws, which saves it and clears the slot. The slot
 * expires after two hours, so an abandoned sign-in leaves nothing behind for long.
 */
import type { DrawRecord, SavedDrawSummary } from "./types";

const PENDING_KEY = "yulasanta_pending_draw_v1";
const PENDING_TTL_MS = 2 * 60 * 60 * 1000;

export type SaveResult = { ok: true; draw: SavedDrawSummary } | { ok: false; error: "unauthorized" | "failed" };

export async function postDraw(record: DrawRecord): Promise<SaveResult> {
    try {
        const response = await fetch("/api/draws", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
        });
        if (response.status === 401) return { ok: false, error: "unauthorized" };
        if (!response.ok) return { ok: false, error: "failed" };
        const data = (await response.json()) as { draw: SavedDrawSummary };
        return { ok: true, draw: data.draw };
    } catch {
        return { ok: false, error: "failed" };
    }
}

export function parkPendingDraw(record: DrawRecord): void {
    try {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ at: Date.now(), record }));
    } catch {
        // Private mode: the user can still sign in and save the next draw.
    }
}

/** Returns the parked record (if fresh) and removes it either way. */
export function takePendingDraw(now = Date.now()): DrawRecord | null {
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) return null;
        localStorage.removeItem(PENDING_KEY);
        const parsed = JSON.parse(raw) as { at?: unknown; record?: unknown };
        if (typeof parsed.at !== "number" || now - parsed.at > PENDING_TTL_MS) return null;
        return parsed.record && typeof parsed.record === "object" ? (parsed.record as DrawRecord) : null;
    } catch {
        return null;
    }
}

/** True while a guest's record waits for sign-in. */
export function hasPendingDraw(): boolean {
    try {
        return Boolean(localStorage.getItem(PENDING_KEY));
    } catch {
        return false;
    }
}
