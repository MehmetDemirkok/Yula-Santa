import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { createRequestId, logTikTokEvent } from '@/lib/tiktok/logging';
import { isValidGiveawayId } from '@/lib/tiktok/giveawayId';
import {
    requireOwnership,
    listGiveawayComments,
    markDrawn,
    isGiveawayStoreConfigured,
} from '@/lib/tiktok/giveawayStore';
import { applyGiveawayFilters } from '@/lib/giveawayFilters';
import { pickWinners } from '@/lib/random';
import { createDrawSeed } from '@/lib/giveawayProof';

type RouteParams = { params: Promise<{ id: string }> };

/** Draws winners with the same crypto Fisher–Yates engine used by /youtube and /tiktok. */
export async function POST(req: NextRequest, { params }: RouteParams) {
    const requestId = createRequestId();
    const rl = rateLimit(req, 'tiktok-giveaway-create');
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

    let body: { ownerToken?: string } = {};
    try {
        body = await req.json();
    } catch {
        body = {};
    }
    const ownerToken = req.headers.get('x-owner-token') || String(body.ownerToken ?? '');
    const giveaway = await requireOwnership(id, ownerToken);
    if (!giveaway) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', requestId }, { status: 403 });
    }
    if (giveaway.status === 'drawn') {
        return NextResponse.json({ error: 'Already drawn', code: 'ALREADY_DRAWN', requestId }, { status: 409 });
    }

    const comments = await listGiveawayComments(id);
    if (comments.length === 0) {
        return NextResponse.json({ error: 'No participants', code: 'EMPTY_RESULT', requestId }, { status: 400 });
    }

    const entries = comments.map((c) => ({ name: c.username, comment: c.comment }));
    const { eligible, stats } = applyGiveawayFilters(entries, {
        countUserOnce: giveaway.settings.countUserOnce,
        keyword: giveaway.settings.keyword,
        excludeNames: giveaway.settings.excludeNames,
    });

    if (eligible.length === 0) {
        return NextResponse.json({ error: 'No eligible participants', code: 'EMPTY_RESULT', requestId }, { status: 400 });
    }

    const winnerCount = Math.min(giveaway.settings.winnerCount, eligible.length);
    const winners = pickWinners(eligible, winnerCount);
    const remaining = eligible.filter((e) => !winners.includes(e));
    const backups = pickWinners(remaining, Math.min(giveaway.settings.backupCount, remaining.length));

    const result = {
        winners: winners.map((w) => ({ name: w.name, comment: w.comment })),
        backups: backups.map((b) => ({ name: b.name })),
        total: stats.total,
        eligible: stats.eligible,
        seed: createDrawSeed(),
        at: new Date().toISOString(),
    };

    const updated = await markDrawn(id, result);
    if (!updated) {
        return NextResponse.json({ error: 'Already drawn', code: 'ALREADY_DRAWN', requestId }, { status: 409 });
    }

    logTikTokEvent('giveaway_drawn', { requestId, giveawayId: id, winners: winners.length });

    return NextResponse.json({ giveawayId: id, result, requestId });
}
