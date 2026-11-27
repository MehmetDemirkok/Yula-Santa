import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { cleanName, normalizeEmail, registrationError } from "@/lib/auth/credentials";
import { hashPassword } from "@/lib/auth/password";
import { createUser, isUserStoreConfigured } from "@/lib/auth/userStore";
import { sendVerificationEmail } from "@/lib/auth/accountEmails";
import { pickLocale } from "@/lib/auth/emailLinks";

/**
 * Creates an e-mail + password account. The client signs in right after with
 * signIn("credentials"). This static route takes precedence over the Auth.js
 * catch-all at /api/auth/[...nextauth].
 */
export async function POST(request: Request) {
    if (!rateLimit(request, "auth-register").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (!isUserStoreConfigured()) {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    let body: { name?: unknown; email?: unknown; password?: unknown; locale?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const problem = registrationError({ name: body.name, email: body.email, password: body.password });
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    try {
        const user = await createUser({
            email: normalizeEmail(body.email),
            name: cleanName(body.name),
            passwordHash: await hashPassword(body.password as string),
        });
        if (!user) return NextResponse.json({ error: "email_taken" }, { status: 409 });
        // The account works right away; the mail only proves the address. A failed send is not fatal.
        const verificationSent = await sendVerificationEmail(user, pickLocale(body.locale), request.url).catch(() => false);
        return NextResponse.json({ ok: true, verificationSent }, { status: 201 });
    } catch (error) {
        console.error("register failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
