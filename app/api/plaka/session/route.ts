import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getPlayerIdentity, sanitizeNickname } from '@/lib/plaka/player';
import { isPlakaLevel, isPlakaMode } from '@/lib/plaka/game';
import { isOffensiveNickname, NICKNAME_REJECTED_MESSAGE } from '@/lib/plaka/nickname';
import { PlakaStoreError, startSession } from '@/lib/plaka/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(code: string, message: string, status: number) {
    return NextResponse.json({ error: code, message }, { status });
}

export async function POST(request: Request) {
    const limit = rateLimit(request, 'plaka-session');
    if (!limit.allowed) {
        return fail('rate_limited', 'Çok hızlı oyun başlatıyorsun, biraz bekle.', 429);
    }

    let body: Record<string, unknown>;
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return fail('invalid_body', 'Geçersiz istek.', 400);
    }

    const mode = body.mode;
    const level = body.level;
    if (!isPlakaMode(mode) || !isPlakaLevel(level)) {
        return fail('invalid_input', 'Geçersiz oyun modu veya seviye.', 400);
    }

    // Tell the player instead of silently dropping the name they typed.
    if (typeof body.nickname === 'string' && isOffensiveNickname(body.nickname)) {
        return fail('nickname_rejected', NICKNAME_REJECTED_MESSAGE, 400);
    }

    try {
        const player = await getPlayerIdentity();
        const result = await startSession({
            playerId: player.playerId,
            displayName: sanitizeNickname(body.nickname),
            mode,
            level,
            daily: body.daily === true,
        });

        return NextResponse.json(
            { ...result, playerKind: player.kind },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        if (error instanceof PlakaStoreError) {
            const status = error.code === 'store_unavailable' ? 503 : 400;
            return fail(error.code, error.message, status);
        }
        console.error('[plaka/session]', error);
        return fail('server_error', 'Oyun başlatılamadı. Lütfen tekrar dene.', 500);
    }
}
