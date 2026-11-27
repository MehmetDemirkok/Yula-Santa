import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit, rateLimitKey } from "@/lib/rateLimit";
import { consumeToken, findUserById, isUserStoreConfigured, markEmailVerified } from "@/lib/auth/userStore";
import { sendVerificationEmail } from "@/lib/auth/accountEmails";
import { pickLocale } from "@/lib/auth/emailLinks";
import { isEmailConfigured } from "@/lib/email/send";

/** Confirms an e-mail address from the link we mailed at sign-up. */
export async function POST(request: Request) {
    if (!rateLimit(request, "auth-token").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (!isUserStoreConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    let body: { token?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    try {
        const userId = await consumeToken(String(body.token ?? ""), "verify");
        if (!userId) return NextResponse.json({ error: "invalid_token" }, { status: 400 });
        await markEmailVerified(userId);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("verify email failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}

/** Sends the verification e-mail again (signed-in e-mail + password accounts only). */
export async function PUT(request: Request) {
    if (!rateLimit(request, "auth-verify-resend").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    const session = await auth();
    if (session?.provider !== "credentials" || !session.accountId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!isUserStoreConfigured() || !isEmailConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    if (!rateLimitKey(session.accountId, "auth-verify-resend")) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    let body: { locale?: unknown } = {};
    try {
        body = await request.json();
    } catch {
        // locale is optional
    }
    try {
        const user = await findUserById(session.accountId);
        if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });
        const sent = await sendVerificationEmail(user, pickLocale(body.locale), request.url);
        return sent ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "unavailable" }, { status: 503 });
    } catch (error) {
        console.error("resend verification failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
