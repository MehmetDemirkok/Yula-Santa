/**
 * Secret Santa matching. Pure and client-safe: the draw runs in the browser.
 *
 * - `drawSecretSanta`: everyone gives to someone else, nobody gives to a
 *   person they are excluded from, and exclusions apply both ways
 *   (a couple should not draw each other in either direction).
 * - `drawPairs`: direct match mode, people are split into mutual pairs.
 *
 * Fairness: we first try plain rejection sampling over uniform shuffles, which
 * picks uniformly among all valid assignments. Only when the rules are so tight
 * that random tries keep failing do we fall back to a randomized backtracking
 * search, which also proves when no valid assignment exists.
 */

import { secureShuffle } from "@/lib/random";

export type Exclusion = [string, string];

export type DrawResult =
    | { ok: true; assignments: Record<string, string> }
    | { ok: false; reason: "too_few" | "odd" | "impossible" | "duplicate" };

const REJECTION_TRIES = 2000;
/** Caps the backtracking search so pathological rule sets fail fast instead of freezing the tab. */
const MAX_SEARCH_STEPS = 200_000;

/** Case- and whitespace-insensitive identity for names, so "Ali" and " ali" are the same person. */
export function nameKey(name: string): string {
    return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr");
}

/** Removes empty and duplicate names (by `nameKey`), keeping the first spelling. */
export function dedupeNames(names: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of names) {
        const name = raw.trim().replace(/\s+/g, " ");
        const key = nameKey(name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(name);
    }
    return out;
}

/** Builds a lookup of forbidden giver→receiver index pairs (both directions). */
function forbiddenMatrix(names: readonly string[], exclusions: readonly Exclusion[]): boolean[][] {
    const index = new Map(names.map((n, i) => [nameKey(n), i]));
    const m = names.map((_, i) => names.map((__, j) => i === j));
    for (const [a, b] of exclusions) {
        const i = index.get(nameKey(a));
        const j = index.get(nameKey(b));
        if (i === undefined || j === undefined || i === j) continue;
        m[i][j] = true;
        m[j][i] = true;
    }
    return m;
}

function hasDuplicates(names: readonly string[]): boolean {
    return new Set(names.map(nameKey)).size !== names.length;
}

export function drawSecretSanta(names: readonly string[], exclusions: readonly Exclusion[] = []): DrawResult {
    if (names.length < 3) return { ok: false, reason: "too_few" };
    if (hasDuplicates(names)) return { ok: false, reason: "duplicate" };
    const n = names.length;
    const forbidden = forbiddenMatrix(names, exclusions);
    const indices = names.map((_, i) => i);

    const toResult = (receiverOf: number[]): DrawResult => {
        const assignments: Record<string, string> = {};
        receiverOf.forEach((r, g) => {
            assignments[names[g]] = names[r];
        });
        return { ok: true, assignments };
    };

    for (let t = 0; t < REJECTION_TRIES; t++) {
        const perm = secureShuffle(indices);
        if (perm.every((r, g) => !forbidden[g][r])) return toResult(perm);
    }

    // Randomized backtracking: visit givers with the fewest options first.
    const options = indices.map((g) => indices.filter((r) => !forbidden[g][r]));
    if (options.some((o) => o.length === 0)) return { ok: false, reason: "impossible" };
    const order = secureShuffle(indices).sort((a, b) => options[a].length - options[b].length);
    const receiverOf = new Array<number>(n).fill(-1);
    const taken = new Array<boolean>(n).fill(false);
    let steps = 0;

    const solve = (k: number): boolean => {
        if (k === n) return true;
        if (++steps > MAX_SEARCH_STEPS) return false;
        const g = order[k];
        for (const r of secureShuffle(options[g])) {
            if (taken[r]) continue;
            taken[r] = true;
            receiverOf[g] = r;
            if (solve(k + 1)) return true;
            taken[r] = false;
        }
        receiverOf[g] = -1;
        return false;
    };

    return solve(0) ? toResult(receiverOf) : { ok: false, reason: "impossible" };
}

export function drawPairs(names: readonly string[], exclusions: readonly Exclusion[] = []): DrawResult {
    if (names.length < 2) return { ok: false, reason: "too_few" };
    if (names.length % 2 !== 0) return { ok: false, reason: "odd" };
    if (hasDuplicates(names)) return { ok: false, reason: "duplicate" };
    // Shuffle first so the search order carries no bias toward the input order.
    const people = secureShuffle(names);
    const forbidden = forbiddenMatrix(people, exclusions);
    const partner = new Array<number>(people.length).fill(-1);
    let steps = 0;

    // Pair the first free person with a random allowed free partner; backtrack on dead ends.
    const solve = (): boolean => {
        const first = partner.indexOf(-1);
        if (first === -1) return true;
        if (++steps > MAX_SEARCH_STEPS) return false;
        const candidates = secureShuffle(
            people.map((_, j) => j).filter((j) => j !== first && partner[j] === -1 && !forbidden[first][j])
        );
        for (const j of candidates) {
            partner[first] = j;
            partner[j] = first;
            if (solve()) return true;
            partner[first] = -1;
            partner[j] = -1;
        }
        return false;
    };

    if (!solve()) return { ok: false, reason: "impossible" };
    const assignments: Record<string, string> = {};
    partner.forEach((p, i) => {
        assignments[people[i]] = people[p];
    });
    return { ok: true, assignments };
}

/** Exclusions whose names are both still in the list, deduplicated (order-insensitive). */
export function cleanExclusions(names: readonly string[], exclusions: readonly Exclusion[]): Exclusion[] {
    const keys = new Map(names.map((n) => [nameKey(n), n]));
    const seen = new Set<string>();
    const out: Exclusion[] = [];
    for (const [a, b] of exclusions) {
        const na = keys.get(nameKey(a));
        const nb = keys.get(nameKey(b));
        if (!na || !nb || nameKey(na) === nameKey(nb)) continue;
        const id = [nameKey(na), nameKey(nb)].sort().join("\u0000");
        if (seen.has(id)) continue;
        seen.add(id);
        out.push([na, nb]);
    }
    return out;
}

/** A named set of people who must not draw anyone else in the same set (a family, a team). */
export type SantaGroup = { id: string; name: string; members: string[] };

/** Turns groups into pairwise exclusions; members are matched by `nameKey`, unknown names are skipped. */
export function groupExclusions(names: readonly string[], groups: readonly SantaGroup[]): Exclusion[] {
    const byKey = new Map(names.map((n) => [nameKey(n), n]));
    const out: Exclusion[] = [];
    for (const group of groups) {
        const members = Array.from(new Set(group.members.map(nameKey)))
            .map((k) => byKey.get(k))
            .filter((n): n is string => Boolean(n));
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) out.push([members[i], members[j]]);
        }
    }
    return out;
}

/**
 * The first group that cannot work: its members need receivers outside the
 * group, so a group bigger than everyone else combined makes the draw impossible.
 */
export function oversizedGroup(names: readonly string[], groups: readonly SantaGroup[]): SantaGroup | null {
    const keys = new Set(names.map(nameKey));
    for (const group of groups) {
        const size = new Set(group.members.map(nameKey).filter((k) => keys.has(k))).size;
        if (size > names.length - size) return group;
    }
    return null;
}

/** Drops members who left the list and groups left with fewer than two people. */
export function cleanGroups(names: readonly string[], groups: readonly SantaGroup[], keepSmall = false): SantaGroup[] {
    const keys = new Set(names.map(nameKey));
    return groups
        .map((g) => ({ ...g, members: Array.from(new Set(g.members.map(nameKey))).filter((k) => keys.has(k)) }))
        .filter((g) => keepSmall || g.members.length >= 2);
}

/**
 * Splits pasted text (a WhatsApp list, an Excel column, "Ali, Veli; Can") into
 * names, dropping list numbering and bullets such as "1. ", "2) " or "- ".
 */
export function splitNameList(text: string): string[] {
    return text
        .split(/[\r\n,;\t]+/)
        .map((part) => part.replace(/^\s*(?:\d{1,3}\s*[.)\-:]\s*|[-•*·–]\s*)/, "").trim())
        .filter(Boolean);
}
