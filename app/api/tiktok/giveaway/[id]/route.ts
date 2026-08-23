import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { createRequestId, logTikTokEvent } from '@/lib/tiktok/logging';
import { isValidGiveawayId } from '@/lib/tiktok/giveawayId';
import { requireOwnership, updateGiveawaySettings, isGiveawayStoreConfigured } from '@/lib/tiktok/giveawayStore';

function ownerTokenFrom(req: NextRequest): string {
    return req.headers.get('x-owner-token') || req.nextUrl.searchParams.get('ownerToken') || '';
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
    const requestId = createRequestId();
    const rl = rateLimit(req, 'tiktok-giveaway-import');
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

    const ownerToken = ownerTokenFrom(req);
    const giveaway = await requireOwnership(id, ownerToken);
    if (!giveaway) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', requestId }, { status: 403 });
    }

    return NextResponse.json({
        giveawayId: giveaway.id,
        videoUrl: giveaway.videoUrl,
        status: giveaway.status,
        participantCount: giveaway.participantCount,
        settings: giveaway.settings,
        result: giveaway.result,
        createdAt: giveaway.createdAt,
        drawnAt: giveaway.drawnAt,
        requestId,
    });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const requestId = createRequestId();
    const rl = rateLimit(req, 'tiktok-giveaway-import');
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

    let body: {
        ownerToken?: string;
        countUserOnce?: boolean;
        keyword?: string;
        excludeNames?: string[];
        winnerCount?: number;
        backupCount?: number;
    } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON', code: 'MALFORMED_PAYLOAD', requestId }, { status: 400 });
    }

    const ownerToken = ownerTokenFrom(req) || String(body.ownerToken ?? '');
    const existing = await requireOwnership(id, ownerToken);
    if (!existing) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', requestId }, { status: 403 });
    }
    if (existing.status === 'drawn') {
        return NextResponse.json({ error: 'Already drawn', code: 'ALREADY_DRAWN', requestId }, { status: 409 });
    }

    const patch: Partial<{
        countUserOnce: boolean;
        keyword: string;
        excludeNames: string[];
        winnerCount: number;
        backupCount: number;
    }> = {};
    if (typeof body.countUserOnce === 'boolean') patch.countUserOnce = body.countUserOnce;
    if (typeof body.keyword === 'string') patch.keyword = body.keyword.slice(0, 200);
    if (Array.isArray(body.excludeNames)) {
        patch.excludeNames = body.excludeNames.filter((n): n is string => typeof n === 'string').slice(0, 50);
    }
    if (typeof body.winnerCount === 'number' && Number.isFinite(body.winnerCount)) {
        patch.winnerCount = Math.min(1000, Math.max(1, Math.floor(body.winnerCount)));
    }
    if (typeof body.backupCount === 'number' && Number.isFinite(body.backupCount)) {
        patch.backupCount = Math.min(1000, Math.max(0, Math.floor(body.backupCount)));
    }

    const updated = await updateGiveawaySettings(id, patch);
    logTikTokEvent('giveaway_settings_updated', { requestId, giveawayId: id });

    return NextResponse.json({
        settings: updated?.settings ?? existing.settings,
        requestId,
    });
}
