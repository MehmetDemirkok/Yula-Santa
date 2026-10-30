import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { peekPlayerIdentity } from '@/lib/plaka/player';
import { isPlakaMode, type PlakaMode } from '@/lib/plaka/game';
import { getLeaderboard, PlakaStoreError } from '@/lib/plaka/store';
import type { LeaderboardPeriod } from '@/lib/plaka/contracts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PERIODS: LeaderboardPeriod[] = ['daily', 'weekly', 'all'];

export async function GET(request: Request) {
    const limit = rateLimit(request, 'plaka-leaderboard');
    if (!limit.allowed) {
        return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    const url = new URL(request.url);
    const periodParam = url.searchParams.get('period') ?? 'daily';
    const modeParam = url.searchParams.get('mode') ?? 'all';

    const period = (PERIODS as string[]).includes(periodParam)
        ? (periodParam as LeaderboardPeriod)
        : 'daily';
    const mode: PlakaMode | 'all' = isPlakaMode(modeParam) ? modeParam : 'all';

    try {
        const player = await peekPlayerIdentity();
        const board = await getLeaderboard({
            period,
            mode,
            playerId: player?.playerId ?? null,
        });
        return NextResponse.json(board, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        if (error instanceof PlakaStoreError && error.code === 'store_unavailable') {
            return NextResponse.json(
                { error: 'store_unavailable', message: 'Liderlik tablosu şu anda kullanılamıyor.' },
                { status: 503 }
            );
        }
        console.error('[plaka/leaderboard]', error);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }
}
