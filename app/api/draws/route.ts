import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rateLimit";
import { cleanDrawRecord, LIMITS } from "@/lib/drawHistory/types";
import { deleteAllDraws, drawOwner, isDrawHistoryConfigured, listDraws, saveDraw } from "@/lib/drawHistory/store";

/**
 * Saved draws of the signed-in user. Guests get 401: their draws stay in the
 * browser and are never stored here.
 *
 * GET lists the user's saved draws (newest first), POST saves one result the
 * user chose to keep, DELETE clears the whole history.
 */
async function currentOwner() {
    return drawOwner(await auth());
}

export async function GET(request: Request) {
    if (!rateLimit(request, "draws-list").allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const owner = await currentOwner();
    if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!isDrawHistoryConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    try {
        return NextResponse.json({ draws: await listDraws(owner) }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("list draws failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}

export async function POST(request: Request) {
    if (!rateLimit(request, "draws-save").allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const owner = await currentOwner();
    if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!isDrawHistoryConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    const raw = await request.text();
    if (raw.length > LIMITS.bodyBytes) return NextResponse.json({ error: "too_large" }, { status: 413 });
    let body: unknown;
    try {
        body = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const record = cleanDrawRecord(body);
    if (!record) return NextResponse.json({ error: "invalid" }, { status: 400 });

    try {
        return NextResponse.json({ draw: await saveDraw(owner, record) }, { status: 201 });
    } catch (error) {
        console.error("save draw failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}

export async function DELETE(request: Request) {
    if (!rateLimit(request, "draws-delete").allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const owner = await currentOwner();
    if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!isDrawHistoryConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    try {
        return NextResponse.json({ deleted: await deleteAllDraws(owner) });
    } catch (error) {
        console.error("clear draws failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
