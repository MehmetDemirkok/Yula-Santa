/**
 * Client-side giveaway entry filters.
 * Applied before the fair shuffle so rules actually change who can win.
 */

export type GiveawayEntry = {
    name: string;
    comment?: string;
    channelId?: string;
};

export type GiveawayFilterOptions = {
    /** If true, keep only the first entry per username (case-insensitive, @ stripped). */
    countUserOnce: boolean;
    /** Comment must contain this text (case-insensitive). Empty = no keyword filter. */
    keyword?: string;
    /** Usernames to exclude (owner, blocked). Normalized the same way as names. */
    excludeNames?: string[];
    /** Channel / platform IDs to exclude (YouTube owner, etc.). */
    excludeChannelIds?: string[];
};

export type FilterStats = {
    total: number;
    afterKeyword: number;
    afterDedupe: number;
    afterExclude: number;
    eligible: number;
};

export function normalizeGiveawayName(name: string): string {
    return name.trim().replace(/^@+/, "").toLocaleLowerCase("tr-TR");
}

/** Best-effort owner handle from Instagram / TikTok URLs. */
export function extractOwnerFromSocialUrl(url: string): string | null {
    const raw = url.trim();
    if (!raw) return null;

    const tiktok = raw.match(/tiktok\.com\/@([^/?#]+)/i);
    if (tiktok?.[1]) return normalizeGiveawayName(decodeURIComponent(tiktok[1]));

    const igUserPath = raw.match(/instagram\.com\/([^/?#]+)\/(?:p|reel|reels|tv)\//i);
    if (igUserPath?.[1] && !["p", "reel", "reels", "tv", "stories", "explore"].includes(igUserPath[1].toLowerCase())) {
        return normalizeGiveawayName(decodeURIComponent(igUserPath[1]));
    }

    return null;
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
            const key = normalizeGiveawayName(e.name);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    const afterDedupe = list.length;

    const excludeNames = new Set((options.excludeNames ?? []).map(normalizeGiveawayName).filter(Boolean));
    const excludeChannels = new Set(
        (options.excludeChannelIds ?? []).map((id) => id.trim()).filter(Boolean)
    );

    if (excludeNames.size > 0 || excludeChannels.size > 0) {
        list = list.filter((e) => {
            if (excludeNames.has(normalizeGiveawayName(e.name))) return false;
            if (e.channelId && excludeChannels.has(e.channelId)) return false;
            return true;
        });
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
