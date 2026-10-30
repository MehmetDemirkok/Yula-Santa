import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getPlayerIdentity } from '@/lib/plaka/player';
import { finishSession, PlakaStoreError } from '@/lib/plaka/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const limit = rateLimit(request, 'plaka-finish');
    if (!limit.allowed) {
        return NextResponse.json(
            { error: 'rate_limited', message: 'Çok fazla istek gönderdin.' },
            { status: 429 }
        );
    }

    let body: Record<string, unknown>;
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    if (!sessionId) {
        return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    }

    try {
        const player = await getPlayerIdentity();
        const summary = await finishSession(player.playerId, sessionId);
        return NextResponse.json(summary, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        if (error instanceof PlakaStoreError) {
            const status = error.code === 'store_unavailable' ? 503 : error.code === 'not_found' ? 404 : 400;
            return NextResponse.json({ error: error.code, message: error.message }, { status });
        }
        console.error('[plaka/finish]', error);
        return NextResponse.json(
            { error: 'server_error', message: 'Sonuç kaydedilemedi.' },
            { status: 500 }
        );
    }
}
