import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getPlayerIdentity } from '@/lib/plaka/player';
import { PlakaStoreError, submitAnswer } from '@/lib/plaka/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(code: string, message: string, status: number) {
    return NextResponse.json({ error: code, message }, { status });
}

export async function POST(request: Request) {
    const limit = rateLimit(request, 'plaka-answer');
    if (!limit.allowed) {
        return fail('rate_limited', 'Çok hızlı cevaplıyorsun, biraz bekle.', 429);
    }

    let body: Record<string, unknown>;
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return fail('invalid_body', 'Geçersiz istek.', 400);
    }

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    const position = Number(body.position);
    const optionIndex = Number(body.optionIndex);
    const responseMs = Number(body.responseMs);

    if (!sessionId || !Number.isInteger(position) || !Number.isInteger(optionIndex)) {
        return fail('invalid_input', 'Cevap verisi geçersiz.', 400);
    }

    try {
        const player = await getPlayerIdentity();
        const result = await submitAnswer({
            playerId: player.playerId,
            sessionId,
            position,
            optionIndex,
            responseMs: Number.isFinite(responseMs) ? responseMs : 0,
        });
        return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        if (error instanceof PlakaStoreError) {
            const status =
                error.code === 'store_unavailable'
                    ? 503
                    : error.code === 'not_found'
                      ? 404
                      : error.code === 'already_answered' || error.code === 'invalid_position'
                        ? 409
                        : 410;
            return fail(error.code, error.message, status);
        }
        console.error('[plaka/answer]', error);
        return fail('server_error', 'Cevap kaydedilemedi. Lütfen tekrar dene.', 500);
    }
}
