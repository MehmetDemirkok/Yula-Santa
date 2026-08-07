import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import {
    createDefaultTikTokProvider,
    createRequestId,
    friendlyTikTokError,
    isLikelyTikTokUrl,
    logTikTokEvent,
    mapProviderErrorToCode,
    normalizeTikTokPostUrl,
    TikTokProviderError,
} from '@/lib/tiktok/server';

export async function POST(req: NextRequest) {
    const requestId = createRequestId();
    const started = Date.now();

    const rl = rateLimit(req, 'tiktok');
    if (!rl.allowed) {
        logTikTokEvent('rate_limited', { requestId, durationMs: Date.now() - started });
        return NextResponse.json(
            {
                error: friendlyTikTokError('RATE_LIMIT'),
                code: 'RATE_LIMIT',
                requestId,
            },
            {
                status: 429,
                headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
            }
        );
    }

    if (!process.env.APIFY_API_TOKEN) {
        return NextResponse.json(
            {
                error: friendlyTikTokError('NO_APIFY_TOKEN'),
                code: 'NO_APIFY_TOKEN',
                requestId,
            },
            { status: 503 }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            {
                error: friendlyTikTokError('MALFORMED_PAYLOAD'),
                code: 'MALFORMED_PAYLOAD',
                requestId,
            },
            { status: 400 }
        );
    }

    const postLink =
        typeof body === 'object' && body && 'postLink' in body
            ? String((body as { postLink?: unknown }).postLink ?? '')
            : '';

    if (!postLink.trim() || !isLikelyTikTokUrl(postLink)) {
        return NextResponse.json(
            {
                error: friendlyTikTokError('INVALID_URL'),
                code: 'INVALID_URL',
                requestId,
            },
            { status: 400 }
        );
    }

    const normalizedUrl = normalizeTikTokPostUrl(postLink);

    try {
        const provider = createDefaultTikTokProvider({ requestId });
        const result = await provider.fetchComments(normalizedUrl);

        logTikTokEvent('api_success', {
            requestId,
            provider: result.meta.provider,
            durationMs: Date.now() - started,
            fetchedComments: result.meta.fetchedComments,
            returnedParticipants: result.participants.length,
            retryCount: result.meta.retryCount,
            pageCount: result.meta.pageCount,
        });

        return NextResponse.json({
            participants: result.participants,
            meta: result.meta,
            requestId,
        });
    } catch (error) {
        const code =
            error instanceof TikTokProviderError
                ? error.code
                : mapProviderErrorToCode(error);

        logTikTokEvent('api_error', {
            requestId,
            durationMs: Date.now() - started,
            code,
            errors: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
        });

        const status =
            code === 'INVALID_URL' || code === 'MALFORMED_PAYLOAD'
                ? 400
                : code === 'RATE_LIMIT'
                  ? 429
                  : code === 'NO_APIFY_TOKEN' || code === 'SCRAPER_UNAVAILABLE'
                    ? 503
                    : code === 'TIMEOUT'
                      ? 504
                      : code === 'EMPTY_RESULT' || code === 'PRIVATE_VIDEO' || code === 'DELETED_VIDEO'
                        ? 422
                        : 500;

        return NextResponse.json(
            {
                error: friendlyTikTokError(code),
                code,
                requestId,
            },
            { status }
        );
    }
}
