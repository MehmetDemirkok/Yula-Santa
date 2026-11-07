import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { peekPlayerIdentity } from '@/lib/plaka/player';
import { PlakaStoreError, resumeSession } from '@/lib/plaka/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Returns an unfinished untimed run of this player, so a page reload doesn't lose it. */
export async function POST(request: Request) {
    const limit = rateLimit(request, 'plaka-resume');
    if (!limit.allowed) {
        return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    let body: Record<string, unknown>;
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
        return NextResponse.json({ status: 'none' }, { headers: { 'Cache-Control': 'no-store' } });
    }

    try {
        // Read-only identity: a visitor without a player cookie has nothing to resume.
        const player = await peekPlayerIdentity();
        const session = player ? await resumeSession(player.playerId, sessionId) : null;
        return NextResponse.json(session ?? { status: 'none' }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        if (error instanceof PlakaStoreError && error.code === 'store_unavailable') {
            return NextResponse.json({ error: 'store_unavailable' }, { status: 503 });
        }
        console.error('[plaka/resume]', error);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }
}
