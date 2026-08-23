import { NextRequest } from 'next/server';
import { createRequestId, logTikTokEvent } from '@/lib/tiktok/server';
import { isPaytrConfigured, verifyPaytrNotification } from '@/lib/tiktok/paytrCheckout';
import { isLedgerConfigured, markPaid } from '@/lib/tiktok/ledger';

// PayTR calls this server-to-server after a payment attempt finishes. It is the
// only trusted source of "payment succeeded" — the browser's redirect back to
// merchant_ok_url carries no verifiable proof on its own. Must respond with the
// literal text "OK", or PayTR will keep retrying the notification.
export async function POST(req: NextRequest) {
    const requestId = createRequestId();

    if (!isPaytrConfigured() || !isLedgerConfigured()) {
        logTikTokEvent('paytr_notify_unconfigured', { requestId });
        return new Response('NOT CONFIGURED', { status: 503 });
    }

    let form: URLSearchParams;
    try {
        const raw = await req.text();
        form = new URLSearchParams(raw);
    } catch {
        return new Response('BAD REQUEST', { status: 400 });
    }

    const merchant_oid = form.get('merchant_oid') ?? '';
    const status = form.get('status') ?? '';
    const total_amount = form.get('total_amount') ?? '';
    const hash = form.get('hash') ?? '';

    if (!merchant_oid || !status || !total_amount || !hash) {
        logTikTokEvent('paytr_notify_malformed', { requestId });
        return new Response('BAD REQUEST', { status: 400 });
    }

    const valid = verifyPaytrNotification({ merchant_oid, status, total_amount, hash });
    if (!valid) {
        logTikTokEvent('paytr_notify_bad_hash', { requestId, entitlementId: merchant_oid });
        // Do not acknowledge with "OK" — an invalid hash is either tampering or a
        // bug, and PayTR's retries give us another chance once it's fixed.
        return new Response('BAD HASH', { status: 400 });
    }

    if (status === 'success') {
        const paid = await markPaid(merchant_oid);
        logTikTokEvent('paytr_notify_success', {
            requestId,
            entitlementId: merchant_oid,
            found: Boolean(paid),
        });
    } else {
        logTikTokEvent('paytr_notify_failed', { requestId, entitlementId: merchant_oid });
    }

    // Acknowledge regardless of "success"/"failed" — we've durably recorded the
    // outcome either way, so no retry is needed from PayTR's side.
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
}
