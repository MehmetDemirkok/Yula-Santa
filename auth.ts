/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Auth.js (NextAuth v5) Configuration — Google Sign-In
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * JWT-only sessions (no database adapter) — the app has no users table yet,
 * so signing in with Google just establishes a session cookie for now.
 *
 * Required env vars (see .env.local):
 *   AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * ═══════════════════════════════════════════════════════════════════════════
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
    interface Session {
        emailVerified?: boolean;
        authAt?: number;
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        // Claims the admin gate needs. They are set only at Google sign-in, so
        // older sessions lack them and fail the admin check.
        jwt({ token, account, profile }) {
            if (account && profile) {
                token.emailVerified = profile.email_verified === true;
                token.authAt = Math.floor(Date.now() / 1000);
            }
            return token;
        },
        session({ session, token }) {
            session.emailVerified = token.emailVerified === true;
            session.authAt = typeof token.authAt === "number" ? token.authAt : undefined;
            return session;
        },
    },
});
