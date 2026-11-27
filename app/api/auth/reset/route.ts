import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { passwordError } from "@/lib/auth/credentials";
import { hashPassword } from "@/lib/auth/password";
import { consumeToken, isUserStoreConfigured, markEmailVerified, revokeTokens, updatePassword } from "@/lib/auth/userStore";

/**
 * Sets a new password from an e-mailed reset link. The link proves the address,
 * so the account is marked verified as well. Every other open link dies.
 */
export async function POST(request: Request) {
    if (!rateLimit(request, "auth-token").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (!isUserStoreConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    let body: { token?: unknown; password?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const problem = passwordError(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    try {
        const userId = await consumeToken(String(body.token ?? ""), "reset");
        if (!userId) return NextResponse.json({ error: "invalid_token" }, { status: 400 });
        await updatePassword(userId, await hashPassword(body.password as string));
        await markEmailVerified(userId);
        await revokeTokens(userId);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("reset password failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
