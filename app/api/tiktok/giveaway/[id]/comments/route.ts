import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { createRequestId, logTikTokEvent } from '@/lib/tiktok/logging';
import { isValidGiveawayId } from '@/lib/tiktok/giveawayId';
import { requireOwnership, importComments, isGiveawayStoreConfigured } from '@/lib/tiktok/giveawayStore';
import { validateImportBatch, MAX_IMPORT_BATCH, type RawImportComment } from '@/lib/tiktok/giveawayImport';

type RouteParams = { params: Promise<{ id: string }> };

/** Batch import endpoint for the Chrome Extension (spec §7/§14 — max 1000 comments per request). */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    let body: { ownerToken?: string; comments?: RawImportComment[] } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON', code: 'MALFORMED_PAYLOAD', requestId }, { status: 400 });
    }

    const ownerToken = req.headers.get('x-owner-token') || String(body.ownerToken ?? '');
    const giveaway = await requireOwnership(id, ownerToken);
    if (!giveaway) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', requestId }, { status: 403 });
    }
    if (giveaway.status === 'drawn') {
        return NextResponse.json({ error: 'Already drawn', code: 'ALREADY_DRAWN', requestId }, { status: 409 });
    }

    const rawComments = Array.isArray(body.comments) ? body.comments : [];
    if (rawComments.length === 0) {
        return NextResponse.json({ error: 'Invalid payload', code: 'MALFORMED_PAYLOAD', requestId }, { status: 400 });
    }
    if (rawComments.length > MAX_IMPORT_BATCH) {
        return NextResponse.json(
            { error: 'Batch too large', code: 'PAYLOAD_TOO_LARGE', requestId },
            { status: 413 }
        );
    }

    const { valid, invalidUsername, emptyComment } = validateImportBatch(rawComments);

    if (valid.length === 0) {
        return NextResponse.json({
            received: rawComments.length,
            inserted: 0,
            duplicates: 0,
            invalidUsername,
            emptyComment,
            totalParticipants: giveaway.participantCount,
            requestId,
        });
    }

    const { inserted, duplicates, totalParticipants } = await importComments(id, valid);

    logTikTokEvent('giveaway_comments_imported', {
        requestId,
        giveawayId: id,
        received: rawComments.length,
        inserted,
    });

    return NextResponse.json({
        received: rawComments.length,
        inserted,
        duplicates,
        invalidUsername,
        emptyComment,
        totalParticipants,
        requestId,
    });
}
