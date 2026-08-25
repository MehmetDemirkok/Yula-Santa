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
});
