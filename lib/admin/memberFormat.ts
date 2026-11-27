/**
 * Pure helpers for the admin member list: the row key and how durations read.
 * Client-safe and tested (tests/admin/members.test.ts).
 */

export type MemberIdentity = {
    provider?: string | null;
    email?: string | null;
    name?: string | null;
    accountId?: string | null;
};

/**
 * One row per sign-in method. Google is keyed by its verified e-mail; e-mail +
 * password accounts by their id, because their address may be unverified.
 */
export function memberKey(identity: MemberIdentity): string | null {
    if (identity.provider === "credentials") return identity.accountId ? `credentials:${identity.accountId}` : null;
    const email = identity.email?.trim().toLowerCase();
    return email ? `google:${email}` : null;
}

/** How often an open session refreshes the member's "last seen". */
export const MEMBER_SEEN_REFRESH_SECONDS = 6 * 60 * 60;

/** Gap between two events that still counts as the same visit. */
export const SESSION_GAP_MINUTES = 30;

/** "2 sa 05 dk", "14 dk", "45 sn", or "–" for nothing measured. */
export function formatDuration(seconds: number | null): string {
    if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return "–";
    const total = Math.round(seconds);
    if (total < 60) return `${total} sn`;
    const minutes = Math.floor(total / 60);
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    return `${hours} sa ${String(minutes % 60).padStart(2, "0")} dk`;
}
