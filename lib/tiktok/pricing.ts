/** Paid TikTok auto-fetch product rules. Safe for client + server. */

export const COMMENTS_PER_FETCH = 1000;
export const FETCH_PRICE_TRY = 200;
export const FETCH_CURRENCY = "TRY";

export function formatFetchPrice(locale = "tr"): string {
    try {
        return new Intl.NumberFormat(locale.startsWith("tr") ? "tr-TR" : "en-US", {
            style: "currency",
            currency: FETCH_CURRENCY,
            maximumFractionDigits: 0,
        }).format(FETCH_PRICE_TRY);
    } catch {
        return `${FETCH_PRICE_TRY} TL`;
    }
}

export function capFetchedParticipants<T>(items: readonly T[]): T[] {
    if (items.length <= COMMENTS_PER_FETCH) return [...items];
    return items.slice(0, COMMENTS_PER_FETCH);
}
