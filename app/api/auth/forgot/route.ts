import { NextResponse } from "next/server";
import { rateLimit, rateLimitKey } from "@/lib/rateLimit";
import { emailError, normalizeEmail } from "@/lib/auth/credentials";
import { findUserByEmail, isUserStoreConfigured } from "@/lib/auth/userStore";
import { sendResetEmail } from "@/lib/auth/accountEmails";
import { pickLocale } from "@/lib/auth/emailLinks";
import { isEmailConfigured } from "@/lib/email/send";

/**
 * "Forgot password": looks the address up and says plainly whether an e-mail +
 * password account exists. Sign-up already reveals a taken address, so hiding it
 * here would only confuse people (Google-only users in particular). Lookups are
 * rate limited per IP and per address.
 */
export async function POST(request: Request) {
    if (!rateLimit(request, "auth-forgot").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (!isUserStoreConfigured() || !isEmailConfigured()) {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    let body: { email?: unknown; locale?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const email = normalizeEmail(body.email);
    const problem = emailError(email);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    // Per-address limit too, so nobody can flood one inbox from many IPs.
    if (!rateLimitKey(email, "auth-forgot-email")) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) return NextResponse.json({ error: "no_account" }, { status: 404 });
        const sent = await sendResetEmail(user, pickLocale(body.locale), request.url);
        return sent ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "unavailable" }, { status: 503 });
    } catch (error) {
        console.error("forgot password failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
