import { createRequestId, logTikTokEvent } from './logging';
import { createDefaultTikTokProvider } from './apifyProvider';
import { mapProviderErrorToCode, friendlyTikTokError } from './errors';
import { TikTokProviderError, type TikTokErrorCode, type TikTokFetchResult } from './types';
import { analyzePaidFetchFailure, type PaidFetchAnalysis } from './failureAnalysis';
import { createCreditToken, verifyCreditToken } from './entitlement';
import {
    attachStripeSession,
    getById,
    getByStripeSession,
    getUsableById,
    grantCredit,
    isLedgerConfigured,
    markConsumed,
    markPaid,
    type Entitlement,
} from './ledger';
import { checkoutPaid, isStripeConfigured, retrieveCheckoutSession } from './stripeCheckout';
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
    sessionId?: string;
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

    if (input.sessionId) {
        if (!isStripeConfigured()) {
            throw new TikTokProviderError('UNKNOWN', 'Payments unavailable', { retryable: true });
        }
        const session = await retrieveCheckoutSession(input.sessionId);
        if (!checkoutPaid(session)) {
            throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Payment incomplete', { retryable: true });
        }
        const entitlementId = session.client_reference_id || session.metadata?.entitlementId;
        if (!entitlementId) {
            throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Missing entitlement', { retryable: false });
        }
        await attachStripeSession(entitlementId, session.id);
        const paid = await markPaid(entitlementId);
        if (!paid) {
            throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Entitlement missing', { retryable: false });
        }
        if (paid.status === 'consumed') {
            throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Already used', { retryable: false });
        }
        return paid;
    }

    throw new TikTokProviderError('MALFORMED_PAYLOAD', 'Payment required', { retryable: false });
}

export async function runPaidTikTokFetch(input: {
    sessionId?: string;
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

export async function peekEntitlement(id: string) {
    return getById(id);
}

export async function peekBySession(sessionId: string) {
    return getByStripeSession(sessionId);
}
