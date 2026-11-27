/**
 * What a signed-in visitor is keyed by in Plaka Avcısı. Pure, so it can be tested.
 *
 * Google keeps the e-mail (existing scores depend on it). E-mail + password
 * accounts use their account id instead: their e-mail is not verified, so keying
 * by it would let anyone sign up with someone else's Gmail address and take over
 * that person's scores and nickname.
 */
export type SessionLike = {
    provider?: string;
    accountId?: string;
    emailProven?: boolean;
    user?: { email?: string | null; name?: string | null } | null;
} | null | undefined;

export function accountKey(session: SessionLike): string | null {
    if (!session?.user) return null;
    if (session.provider === "credentials") {
        // A password added by the Google owner (verified e-mail) is the same person as that Google sign-in.
        if (session.emailProven) return session.user.email || null;
        return session.accountId ? `credentials:${session.accountId}` : null;
    }
    return session.user.email || session.user.name || null;
}
