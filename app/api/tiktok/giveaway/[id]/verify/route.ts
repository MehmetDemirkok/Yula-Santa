import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { createRequestId } from '@/lib/tiktok/logging';
import { isValidGiveawayId } from '@/lib/tiktok/giveawayId';
import { getGiveaway, isGiveawayStoreConfigured } from '@/lib/tiktok/giveawayStore';

type RouteParams = { params: Promise<{ id: string }> };

/** Public, no owner token required — this is the whole point of a verification page (spec §12). */
export async function GET(req: NextRequest, { params }: RouteParams) {
    const requestId = createRequestId();
    const rl = rateLimit(req, 'default');
    if (!rl.allowed) {
        return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMIT', requestId }, { status: 429 });
    }
    if (!isGiveawayStoreConfigured()) {
        return NextResponse.json({ error: 'Store unavailable', code: 'STORE_UNAVAILABLE', requestId }, { status: 503 });
    }

    const { id } = await params;
    if (!isValidGiveawayId(id)) {
        return NextResponse.json({ error: 'Giveaway not found', code: 'GIVEAWAY_NOT_FOUND', requestId }, { status: 404 });
    }

    const giveaway = await getGiveaway(id);
    if (!giveaway || giveaway.status !== 'drawn' || !giveaway.result) {
        return NextResponse.json({ error: 'Giveaway not found', code: 'GIVEAWAY_NOT_FOUND', requestId }, { status: 404 });
    }

    return NextResponse.json({
        giveawayId: giveaway.id,
        platform: 'tiktok',
        videoUrl: giveaway.videoUrl,
        settings: giveaway.settings,
        result: giveaway.result,
        drawnAt: giveaway.drawnAt,
        requestId,
    });
}
