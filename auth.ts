/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Auth.js (NextAuth v5) Configuration — Google and e-mail + password
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * JWT sessions. Google sign-ins are not stored anywhere but the session cookie.
 * E-mail + password accounts live in `auth_users` (lib/auth/userStore.ts); their
 * e-mail is not verified, so `emailVerified` stays false and code that trusts an
 * e-mail (admin gate, analytics link, Plaka identity) must key them by `accountId`.
 * A Google user can add a password at /account; that row is marked verified and
 * the session gets `emailProven`, so Plaka treats it as the same person. The
 * admin gate still accepts only Google sign-ins.
 *
 * Required env vars (see .env.local):
 *   AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL
 * ═══════════════════════════════════════════════════════════════════════════
 */

import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { emailError, normalizeEmail, passwordError } from "@/lib/auth/credentials";
import { isAdminSession } from "@/lib/admin/access";

declare module "next-auth" {
    interface Session {
        emailVerified?: boolean;
        authAt?: number;
        /** "google" or "credentials"; missing on sessions from before e-mail sign-in existed (all Google). */
        provider?: string;
        /** `auth_users.id` for e-mail + password accounts. */
        accountId?: string;
        /**
         * True when an e-mail + password account was set up by its Google owner
         * (/account), so it is the same person as that Google sign-in.
         */
        emailProven?: boolean;
        /** Same rule as the admin gate (lib/admin/access.ts); used only to show the admin link. */
        isAdmin?: boolean;
    }
}

/** Shown on the login form as "too many attempts" (`code` reaches the client). */
class TooManyAttempts extends CredentialsSignin {
    code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            id: "credentials",
            credentials: { email: {}, password: {} },
            async authorize(credentials, request) {
                // Loaded here so the Node-only modules stay out of anything that only reads the session.
                const { rateLimit, rateLimitKey } = await import("@/lib/rateLimit");
                const email = normalizeEmail(credentials?.email);
                const password = credentials?.password;
                if (emailError(email) || passwordError(password) === "passwordRequired" || typeof password !== "string") return null;

                if (!rateLimit(request, "auth-login").allowed || !rateLimitKey(email, "auth-login-email")) {
                    throw new TooManyAttempts();
                }

                const { findUserByEmail, isUserStoreConfigured, recordLogin } = await import("@/lib/auth/userStore");
                const { getDummyHash, verifyPassword } = await import("@/lib/auth/password");
                if (!isUserStoreConfigured()) return null;

                const user = await findUserByEmail(email);
                // Unknown e-mails still run a real check, so timing does not reveal which accounts exist.
                const ok = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
                if (!user || !ok) return null;

                await recordLogin(user.id).catch(() => undefined);
                return { id: user.id, email: user.email, name: user.name, emailProven: user.emailVerified };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    // Our own pages instead of Auth.js's default screens; errors arrive as ?error=… on /login.
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        // Claims the admin gate needs. They are set only at sign-in, so older
        // sessions lack them and fail the admin check.
        async jwt({ token, account, profile, user, trigger }) {
            // useSession().update() after a name change: read the name back from the
            // database instead of trusting what the browser sent.
            if (trigger === "update" && token.provider === "credentials" && typeof token.accountId === "string") {
                const { findUserById } = await import("@/lib/auth/userStore");
                const fresh = await findUserById(token.accountId).catch(() => null);
                if (fresh) {
                    token.name = fresh.name;
                    token.emailProven = fresh.emailVerified;
                }
            }
            if (account) {
                token.provider = account.provider;
                token.authAt = Math.floor(Date.now() / 1000);
                if (account.provider === "credentials") {
                    token.emailVerified = false;
                    token.accountId = user?.id;
                    token.emailProven = (user as { emailProven?: boolean } | undefined)?.emailProven === true;
                } else if (profile) {
                    token.emailVerified = profile.email_verified === true;
                }
            }
            return token;
        },
        session({ session, token }) {
            session.emailVerified = token.emailVerified === true;
            session.authAt = typeof token.authAt === "number" ? token.authAt : undefined;
            session.provider = typeof token.provider === "string" ? token.provider : undefined;
            session.accountId = typeof token.accountId === "string" ? token.accountId : undefined;
            session.emailProven = token.emailProven === true;
            // Only decides whether the account menu shows the admin link; /admin still runs requireAdmin().
            session.isAdmin = isAdminSession(
                { email: session.user?.email, emailVerified: session.emailVerified, authAt: session.authAt },
                process.env.ADMIN_EMAILS,
                Math.floor(Date.now() / 1000),
            );
            return session;
        },
    },
});
