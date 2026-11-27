import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rateLimit";
import { deleteDraw, drawOwner, getDraw, isDrawHistoryConfigured } from "@/lib/drawHistory/store";

/** One saved draw of the signed-in user. Another user's id answers 404, same as a missing one. */
type Context = { params: Promise<{ id: string }> };

const isId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function GET(request: Request, { params }: Context) {
    if (!rateLimit(request, "draws-list").allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const owner = drawOwner(await auth());
    if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!isDrawHistoryConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const { id } = await params;
    if (!isId(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
    try {
        const draw = await getDraw(owner, id);
        if (!draw) return NextResponse.json({ error: "not_found" }, { status: 404 });
        return NextResponse.json({ draw }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("get draw failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}

export async function DELETE(request: Request, { params }: Context) {
    if (!rateLimit(request, "draws-delete").allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const owner = drawOwner(await auth());
    if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!isDrawHistoryConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const { id } = await params;
    if (!isId(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
    try {
        const deleted = await deleteDraw(owner, id);
        return deleted ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
    } catch (error) {
        console.error("delete draw failed", error);
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
