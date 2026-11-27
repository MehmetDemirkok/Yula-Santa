import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rateLimit";
import { normalizeEmail } from "@/lib/auth/credentials";
import { verifyPassword } from "@/lib/auth/password";
import { deleteUserById, deleteVerifiedUserByEmail, findUserById, isUserStoreConfigured } from "@/lib/auth/userStore";
import { isDeleteConfirmed, isFreshSignIn } from "@/lib/auth/deletion";
import { pickLocale } from "@/lib/auth/emailLinks";
import { peekPlayerIdentity } from "@/lib/plaka/player";
import { deletePlayerData } from "@/lib/plaka/store";
import { forgetEmail, isAnalyticsConfigured } from "@/lib/analytics/store";

/**
 * Deletes the signed-in account: the password account (if any), every Plaka
 * Avcısı game, score and badge, and the e-mail link on usage events. The client
 * signs out afterwards.
 *
 * E-mail + password accounts must give their password; Google accounts must have
 * signed in within the last 15 minutes (lib/auth/deletion.ts).
 */
export async function DELETE(request: Request) {
    if (!rateLimit(request, "auth-account").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    let body: { confirm?: unknown; password?: unknown; locale?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    if (!isDeleteConfirmed(body.confirm, pickLocale(body.locale))) return NextResponse.json({ error: "confirm" }, { status: 400 });

    const isPassword = session.provider === "credentials";
    try {
        if (isPassword) {
            if (!isUserStoreConfigured() || !session.accountId) return NextResponse.json({ error: "unavailable" }, { status: 503 });
            const user = await findUserById(session.accountId);
            if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
            const password = typeof body.password === "string" ? body.password : "";
            if (!(await verifyPassword(password, user.passwordHash))) {
                return NextResponse.json({ error: "wrong_password" }, { status: 400 });
            }
        } else if (!isFreshSignIn(session.authAt, Math.floor(Date.now() / 1000))) {
            return NextResponse.json({ error: "reauth" }, { status: 403 });
        }

        // Plaka first: the player id comes from this session.
        const player = await peekPlayerIdentity();
        if (player?.kind === "user") await deletePlayerData(player.playerId);

        const email = normalizeEmail(session.user.email);
        const emailTrusted = !isPassword ? session.emailVerified === true : session.emailProven === true;
        if (isPassword && session.accountId) await deleteUserById(session.accountId);
        if (!isPassword && email && isUserStoreConfigured()) await deleteVerifiedUserByEmail(email);
        if (emailTrusted && email && isAnalyticsConfigured()) await forgetEmail(email);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("delete account failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
