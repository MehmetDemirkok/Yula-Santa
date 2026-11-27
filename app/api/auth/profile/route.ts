import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rateLimit";
import { cleanName } from "@/lib/auth/credentials";
import { isUserStoreConfigured, updateName } from "@/lib/auth/userStore";

/**
 * Renames an e-mail + password account. Google accounts take their name from
 * Google. The client then calls useSession().update(), and the jwt callback in
 * auth.ts reads the new name back from the database.
 */
export async function PATCH(request: Request) {
    if (!rateLimit(request, "auth-account").allowed) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    const session = await auth();
    if (session?.provider !== "credentials" || !session.accountId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!isUserStoreConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    let body: { name?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const name = cleanName(body.name);
    if (!name) return NextResponse.json({ error: "nameRequired" }, { status: 400 });

    try {
        await updateName(session.accountId, name);
        return NextResponse.json({ ok: true, name });
    } catch (error) {
        console.error("rename failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
