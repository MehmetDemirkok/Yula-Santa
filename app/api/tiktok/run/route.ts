import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 90;
import { rateLimit } from '@/lib/rateLimit';
import { createRequestId, logTikTokEvent } from '@/lib/tiktok/server';
import { runPaidTikTokFetch } from '@/lib/tiktok/paidFetch';
import { COMMENTS_PER_FETCH, FETCH_PRICE_TRY } from '@/lib/tiktok/pricing';
import { originFromRequest } from '@/lib/tiktok/paytrCheckout';
import { TikTokProviderError } from '@/lib/tiktok/types';

export async function POST(req: NextRequest) {
    const requestId = createRequestId();
    const started = Date.now();
    const rl = rateLimit(req, 'tiktok');
    if (!rl.allowed) {
        return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMIT', requestId }, { status: 429 });
    }

    let body: { orderId?: string; creditToken?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON', code: 'MALFORMED_PAYLOAD', requestId }, { status: 400 });
    }

    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const creditToken = typeof body.creditToken === 'string' ? body.creditToken.trim() : '';
    if (!orderId && !creditToken) {
        return NextResponse.json(
            { error: 'Payment or credit required', code: 'ENTITLEMENT_REQUIRED', requestId },
            { status: 401 }
        );
    }

    try {
        const result = await runPaidTikTokFetch({
            orderId: orderId || undefined,
            creditToken: creditToken || undefined,
            requestId,
            origin: originFromRequest(req),
        });

        if (result.ok) {
            return NextResponse.json({
                participants: result.participants,
                meta: result.meta,
                requestId,
                product: { priceTry: FETCH_PRICE_TRY, commentCap: COMMENTS_PER_FETCH },
            });
        }

        return NextResponse.json(
            {
                error: result.error,
                code: result.code,
                requestId,
                creditGranted: true,
                creditToken: result.creditToken,
                analysis: result.analysis,
                emailSent: result.emailSent,
                refunded: false,
            },
            { status: 422 }
        );
    } catch (error) {
        const code = error instanceof TikTokProviderError ? error.code : 'UNKNOWN';
        logTikTokEvent('run_error', {
            requestId,
            durationMs: Date.now() - started,
            code,
            errors: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
        });
        const status = code === 'MALFORMED_PAYLOAD' || code === 'PAYMENT_PENDING' ? 400 : 500;
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Run failed',
                code,
                requestId,
            },
            { status }
        );
    }
}
