/**
 * Client-side giveaway entry filters.
 * Applied before the fair shuffle so rules actually change who can win.
 */

export type GiveawayEntry = {
    name: string;
    comment?: string;
};

export type GiveawayFilterOptions = {
    /** If true, keep only the first entry per username (case-insensitive, @ stripped). */
    countUserOnce: boolean;
    /** Comment must contain this text (case-insensitive). Empty = no keyword filter. */
    keyword?: string;
    /** Usernames to exclude (owner, blocked). Normalized the same way as names. */
    excludeNames?: string[];
};

export type FilterStats = {
    total: number;
    afterKeyword: number;
    afterDedupe: number;
    afterExclude: number;
    eligible: number;
};

function normalizeName(name: string): string {
    return name.trim().replace(/^@+/, "").toLocaleLowerCase("tr-TR");
}

export function applyGiveawayFilters<T extends GiveawayEntry>(
    entries: readonly T[],
    options: GiveawayFilterOptions
): { eligible: T[]; stats: FilterStats } {
    const total = entries.length;
    const keyword = options.keyword?.trim() ?? "";
    const keywordLower = keyword.toLocaleLowerCase("tr-TR");

    let list = entries.slice();

    if (keywordLower) {
        list = list.filter((e) => (e.comment ?? "").toLocaleLowerCase("tr-TR").includes(keywordLower));
    }
    const afterKeyword = list.length;

    if (options.countUserOnce) {
        const seen = new Set<string>();
        list = list.filter((e) => {
            const key = normalizeName(e.name);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    const afterDedupe = list.length;

    const exclude = new Set((options.excludeNames ?? []).map(normalizeName).filter(Boolean));
    if (exclude.size > 0) {
        list = list.filter((e) => !exclude.has(normalizeName(e.name)));
    }
    const afterExclude = list.length;

    return {
        eligible: list,
        stats: {
            total,
            afterKeyword,
            afterDedupe,
            afterExclude,
            eligible: list.length,
        },
    };
}
