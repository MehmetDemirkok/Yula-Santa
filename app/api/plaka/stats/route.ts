import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getPlayerIdentity } from '@/lib/plaka/player';
import { getPlayerOverview, PlakaStoreError } from '@/lib/plaka/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const limit = rateLimit(request, 'plaka-stats');
    if (!limit.allowed) {
        return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    try {
        // Player page needs a stable identity even before the first game,
        // so the guest cookie is issued here as well.
        const player = await getPlayerIdentity();
        const overview = await getPlayerOverview(player.playerId);
        return NextResponse.json(
            { ...overview, playerKind: player.kind },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        if (error instanceof PlakaStoreError && error.code === 'store_unavailable') {
            return NextResponse.json(
                { error: 'store_unavailable', message: 'İstatistikler şu anda kullanılamıyor.' },
                { status: 503 }
            );
        }
        console.error('[plaka/stats]', error);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }
}
