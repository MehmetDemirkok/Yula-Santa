/** Admin allowlist rules. Pure, so every failure case can be tested without a session. */

export const ADMIN_SESSION_MAX_SECONDS = 12 * 60 * 60;

export type AdminCandidate = {
    email?: string | null;
    emailVerified?: boolean;
    /** Unix seconds of the Google sign-in. */
    authAt?: number;
};

export function parseAllowlist(raw: string | undefined): string[] {
    return (raw ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

/** Fails closed: an empty allowlist or any missing claim means no access. */
export function isAdminSession(candidate: AdminCandidate | null | undefined, allowlistRaw: string | undefined, nowSeconds: number): boolean {
    const allowlist = parseAllowlist(allowlistRaw);
    if (allowlist.length === 0 || !candidate?.email) return false;
    if (candidate.emailVerified !== true) return false;
    if (typeof candidate.authAt !== "number") return false;

    const age = nowSeconds - candidate.authAt;
    if (age < 0 || age > ADMIN_SESSION_MAX_SECONDS) return false;

    return allowlist.includes(candidate.email.trim().toLowerCase());
}
