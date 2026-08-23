import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import {
    attachPaytrToken,
    createPendingEntitlement,
    isLedgerConfigured,
} from '@/lib/tiktok/ledger';
import { createRequestId, isLikelyTikTokUrl, logTikTokEvent, normalizeTikTokPostUrl } from '@/lib/tiktok/server';
import { isValidEmail, normalizeEmail } from '@/lib/tiktok/email';
import {
    clientIpFromRequest,
    createTikTokPaymentToken,
    isPaytrConfigured,
    originFromRequest,
} from '@/lib/tiktok/paytrCheckout';

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

    if (!isPaytrConfigured()) {
        logTikTokEvent('checkout_paytr_missing', { requestId });
        return NextResponse.json(
            {
                error: 'Payments are not enabled yet',
                code: 'PAYMENTS_UNAVAILABLE',
                requestId,
            },
            { status: 503 }
        );
    }

    // PayTR's merchant_oid must be alphanumeric, so the ledger id (used as the
    // order id) is a dash-free UUID rather than createRequestId()'s default format.
    const entitlementId = requestId.replace(/-/g, '');
    const entitlement = await createPendingEntitlement({
        id: entitlementId,
        email,
        postUrl: normalizeTikTokPostUrl(postLink),
        locale,
    });

    const origin = originFromRequest(req);
    const localePrefix = locale === 'tr' ? '' : `/${locale}`;
    const successUrl = `${origin}${localePrefix}/tiktok?paid=1&oid=${entitlement.id}`;
    const failUrl = `${origin}${localePrefix}/tiktok?paid=0`;

    try {
        const payment = await createTikTokPaymentToken({
            merchantOid: entitlement.id,
            email,
            userIp: clientIpFromRequest(req),
            locale,
            successUrl,
            failUrl,
        });
        await attachPaytrToken(entitlement.id, payment.token);

        logTikTokEvent('checkout_created', { requestId, entitlementId: entitlement.id });
        return NextResponse.json({ url: payment.url, entitlementId: entitlement.id, requestId });
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
