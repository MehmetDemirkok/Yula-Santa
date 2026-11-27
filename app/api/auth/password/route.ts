import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rateLimit";
import { cleanName, normalizeEmail, passwordError } from "@/lib/auth/credentials";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { findUserById, isUserStoreConfigured, setVerifiedPassword, updatePassword } from "@/lib/auth/userStore";

/**
 * Sets or changes the password.
 *
 * - Google session with a verified e-mail: adds (or replaces) a password for that
 *   e-mail, so they can also sign in with e-mail + password. Signing in with
 *   Google is what proves they own the address.
 * - E-mail + password session: changes the password; the current one is required.
 */
export async function POST(request: Request) {
    if (!rateLimit(request, "auth-password").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!isUserStoreConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    let body: { password?: unknown; currentPassword?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const problem = passwordError(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const newHash = () => hashPassword(body.password as string);

    try {
        if (session.provider === "credentials") {
            const user = session.accountId ? await findUserById(session.accountId) : null;
            if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
            const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
            if (!(await verifyPassword(current, user.passwordHash))) {
                return NextResponse.json({ error: "wrong_password" }, { status: 400 });
            }
            await updatePassword(user.id, await newHash());
            return NextResponse.json({ ok: true });
        }

        const email = normalizeEmail(session.user.email);
        if (session.emailVerified !== true || !email) {
            return NextResponse.json({ error: "google_required" }, { status: 403 });
        }
        await setVerifiedPassword({
            email,
            name: cleanName(session.user.name) || email.split("@")[0],
            passwordHash: await newHash(),
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("set password failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
