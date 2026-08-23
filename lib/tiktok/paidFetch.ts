import { createRequestId, logTikTokEvent } from './logging';
import { createDefaultTikTokProvider } from './apifyProvider';
import { mapProviderErrorToCode, friendlyTikTokError } from './errors';
import { TikTokProviderError, type TikTokErrorCode, type TikTokFetchResult } from './types';
import { analyzePaidFetchFailure, type PaidFetchAnalysis } from './failureAnalysis';
import { createCreditToken, verifyCreditToken } from './entitlement';
import {
    getById,
    getUsableById,
    grantCredit,
    isLedgerConfigured,
    markConsumed,
    type Entitlement,
} from './ledger';
import { sendCreditEmail } from './creditEmail';
import { SITE_URL } from '@/lib/constants';

export type PaidRunResult =
    | {
          ok: true;
          entitlementId: string;
          participants: TikTokFetchResult['participants'];
          meta: TikTokFetchResult['meta'];
      }
    | {
          ok: false;
          entitlementId: string;
          code: TikTokErrorCode;
          error: string;
          creditGranted: true;
          creditToken: string;
          analysis: PaidFetchAnalysis;
          emailSent: boolean;
      };

async function resolveEntitlement(input: {
    orderId?: string;
    creditToken?: string;
}): Promise<Entitlement> {
    if (!isLedgerConfigured()) {
        throw new TikTokProviderError('UNKNOWN', 'Ledger not configured', { retryable: true });
    }

    if (input.creditToken) {
        const payload = verifyCreditToken(input.creditToken);
        if (!payload) {
            throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Invalid credit token', { retryable: false });
        }
        const row = await getUsableById(payload.id);
        if (!row || row.email !== payload.email || row.status !== 'credit') {
            throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Credit already used', { retryable: false });
        }
        return row;
    }

    if (input.orderId) {
        const row = await getById(input.orderId);
        if (!row) {
            throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Unknown order', { retryable: false });
        }
        // PayTR confirms payment via an async server-to-server notification, not the
        // browser redirect. If the user lands back before that notification arrives,
        // the entitlement is still 'pending' — ask the client to retry shortly.
        if (row.status === 'pending') {
            throw new TikTokProviderError('PAYMENT_PENDING', 'Payment not confirmed yet', { retryable: true });
        }
        return row;
    }

    throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Payment required', { retryable: false });
}

export async function runPaidTikTokFetch(input: {
    orderId?: string;
    creditToken?: string;
    requestId?: string;
    origin?: string;
}): Promise<PaidRunResult> {
    const requestId = input.requestId || createRequestId();
    const started = Date.now();
    const entitlement = await resolveEntitlement(input);

    if (entitlement.status === 'consumed') {
        throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Already used', { retryable: false });
    }

    try {
        const provider = createDefaultTikTokProvider({ requestId });
        const result = await provider.fetchComments(entitlement.postUrl);
        await markConsumed(entitlement.id);
        logTikTokEvent('paid_fetch_success', {
            requestId,
            entitlementId: entitlement.id,
            durationMs: Date.now() - started,
            returnedParticipants: result.participants.length,
        });
        return {
            ok: true,
            entitlementId: entitlement.id,
            participants: result.participants,
            meta: result.meta,
        };
    } catch (error) {
        const code =
            error instanceof TikTokProviderError ? error.code : mapProviderErrorToCode(error);
        const analysis = analyzePaidFetchFailure(code);
        const creditToken = createCreditToken(entitlement.id, entitlement.email);
        await grantCredit(entitlement.id, analysis, creditToken);

        const origin = input.origin || SITE_URL;
        const locale = entitlement.locale || 'tr';
        const creditUrl = `${origin}${locale === 'tr' ? '' : `/${locale}`}/tiktok?credit=${encodeURIComponent(creditToken)}`;
        const email = await sendCreditEmail({
            email: entitlement.email,
            creditUrl,
            reason: analysis.reason,
            locale,
        }).catch(() => ({ sent: false }));

        logTikTokEvent('paid_fetch_credit', {
            requestId,
            entitlementId: entitlement.id,
            durationMs: Date.now() - started,
            code,
            category: analysis.category,
            refund: false,
            emailSent: email.sent,
        });

        return {
            ok: false,
            entitlementId: entitlement.id,
            code,
            error: friendlyTikTokError(code, locale),
            creditGranted: true,
            creditToken,
            analysis,
            emailSent: email.sent,
        };
    }
}
