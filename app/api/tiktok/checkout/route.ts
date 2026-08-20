import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import {
    attachStripeSession,
    createPendingEntitlement,
    isLedgerConfigured,
} from '@/lib/tiktok/ledger';
import { createRequestId, isLikelyTikTokUrl, logTikTokEvent, normalizeTikTokPostUrl } from '@/lib/tiktok/server';
import { isValidEmail, normalizeEmail } from '@/lib/tiktok/email';
import {
    createTikTokCheckoutSession,
    isStripeConfigured,
    originFromRequest,
} from '@/lib/tiktok/stripeCheckout';

export async function POST(req: NextRequest) {
    const requestId = createRequestId();
    const rl = rateLimit(req, 'tiktok');
    if (!rl.allowed) {
        return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMIT', requestId }, { status: 429 });
    }

    if (!isLedgerConfigured()) {
        return NextResponse.json(
            { error: 'Ledger unavailable', code: 'PAYMENTS_UNAVAILABLE', requestId },
            { status: 503 }
        );
    }

    let body: { email?: string; postLink?: string; locale?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON', code: 'MALFORMED_PAYLOAD', requestId }, { status: 400 });
    }

    const email = normalizeEmail(String(body.email ?? ''));
    const postLink = String(body.postLink ?? '');
    const locale = String(body.locale ?? 'tr').slice(0, 8);

    if (!isValidEmail(email)) {
        return NextResponse.json({ error: 'Invalid email', code: 'INVALID_EMAIL', requestId }, { status: 400 });
    }
    if (!postLink.trim() || !isLikelyTikTokUrl(postLink)) {
        return NextResponse.json({ error: 'Invalid TikTok URL', code: 'INVALID_URL', requestId }, { status: 400 });
    }

    if (!isStripeConfigured()) {
        logTikTokEvent('checkout_stripe_missing', { requestId });
        return NextResponse.json(
            {
                error: 'Payments are not enabled yet',
                code: 'PAYMENTS_UNAVAILABLE',
                requestId,
            },
            { status: 503 }
        );
    }

    const entitlement = await createPendingEntitlement({
        id: requestId,
        email,
        postUrl: normalizeTikTokPostUrl(postLink),
        locale,
    });

    const origin = originFromRequest(req);
    const localePrefix = locale === 'tr' ? '' : `/${locale}`;
    const successUrl = `${origin}${localePrefix}/tiktok?paid=1&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}${localePrefix}/tiktok?paid=0`;

    try {
        const session = await createTikTokCheckoutSession({
            email,
            entitlementId: entitlement.id,
            postUrl: entitlement.postUrl,
            locale,
            successUrl,
            cancelUrl,
        });
        await attachStripeSession(entitlement.id, session.id);

        logTikTokEvent('checkout_created', { requestId, entitlementId: entitlement.id });
        return NextResponse.json({ url: session.url, entitlementId: entitlement.id, requestId });
    } catch (error) {
        logTikTokEvent('checkout_error', {
            requestId,
            errors: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
        });
        return NextResponse.json(
            { error: 'Checkout failed', code: 'PAYMENTS_UNAVAILABLE', requestId },
            { status: 503 }
        );
    }
}
