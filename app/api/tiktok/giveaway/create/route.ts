import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { isLikelyTikTokUrl, normalizeTikTokPostUrl } from '@/lib/tiktok/url';
import { createRequestId, logTikTokEvent } from '@/lib/tiktok/logging';
import { createGiveaway, isGiveawayStoreConfigured } from '@/lib/tiktok/giveawayStore';

export async function POST(req: NextRequest) {
    const requestId = createRequestId();
    const rl = rateLimit(req, 'tiktok-giveaway-create');
    if (!rl.allowed) {
        return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMIT', requestId }, { status: 429 });
    }

    if (!isGiveawayStoreConfigured()) {
        return NextResponse.json(
            { error: 'Store unavailable', code: 'STORE_UNAVAILABLE', requestId },
            { status: 503 }
        );
    }

    let body: { videoUrl?: string; locale?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON', code: 'MALFORMED_PAYLOAD', requestId }, { status: 400 });
    }

    const videoUrl = String(body.videoUrl ?? '').trim();
    const locale = String(body.locale ?? 'tr').slice(0, 8);

    if (!videoUrl || !isLikelyTikTokUrl(videoUrl)) {
        return NextResponse.json({ error: 'Invalid TikTok URL', code: 'INVALID_URL', requestId }, { status: 400 });
    }

    try {
        const { giveaway, ownerToken } = await createGiveaway({
            videoUrl: normalizeTikTokPostUrl(videoUrl),
            locale,
        });

        logTikTokEvent('giveaway_created', { requestId, giveawayId: giveaway.id });
        return NextResponse.json({
            giveawayId: giveaway.id,
            ownerToken,
            videoUrl: giveaway.videoUrl,
            status: giveaway.status,
            requestId,
        });
    } catch (error) {
        logTikTokEvent('giveaway_create_error', {
            requestId,
            errors: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
        });
        return NextResponse.json({ error: 'Create failed', code: 'STORE_UNAVAILABLE', requestId }, { status: 503 });
    }
}
