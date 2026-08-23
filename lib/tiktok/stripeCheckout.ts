import { FETCH_CURRENCY, FETCH_PRICE_TRY } from './pricing';
import { SITE_URL } from '@/lib/constants';

const STRIPE_API = 'https://api.stripe.com/v1';

export function isStripeConfigured(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
}

function stripeAuth(): string {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY missing');
    return `Bearer ${key}`;
}

async function stripeForm<T>(path: string, params: Record<string, string>): Promise<T> {
    const body = new URLSearchParams(params);
    const res = await fetch(`${STRIPE_API}${path}`, {
        method: 'POST',
        headers: {
            Authorization: stripeAuth(),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });
    const data = (await res.json()) as T & { error?: { message?: string } };
    if (!res.ok) {
        throw new Error(data.error?.message || `Stripe ${res.status}`);
    }
    return data;
}

async function stripeGet<T>(path: string): Promise<T> {
    const res = await fetch(`${STRIPE_API}${path}`, {
        headers: { Authorization: stripeAuth() },
        cache: 'no-store',
    });
    const data = (await res.json()) as T & { error?: { message?: string } };
    if (!res.ok) {
        throw new Error(data.error?.message || `Stripe ${res.status}`);
    }
    return data;
}

export type StripeCheckoutSession = {
    id: string;
    url: string | null;
    payment_status: string;
    status: string;
    customer_email?: string | null;
    metadata?: Record<string, string>;
    client_reference_id?: string | null;
};

export async function createTikTokCheckoutSession(input: {
    email: string;
    entitlementId: string;
    postUrl: string;
    locale: string;
    successUrl: string;
    cancelUrl: string;
}): Promise<StripeCheckoutSession> {
    const amount = String(FETCH_PRICE_TRY * 100);
    return stripeForm<StripeCheckoutSession>('/checkout/sessions', {
        mode: 'payment',
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        customer_email: input.email,
        client_reference_id: input.entitlementId,
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': FETCH_CURRENCY.toLowerCase(),
        'line_items[0][price_data][unit_amount]': amount,
        'line_items[0][price_data][product_data][name]': 'TikTok yorum çekimi',
        'line_items[0][price_data][product_data][description]': 'En fazla 1000 yorum · üyelik yok',
        'metadata[entitlementId]': input.entitlementId,
        'metadata[email]': input.email,
        'metadata[postUrl]': input.postUrl,
        'metadata[locale]': input.locale,
        'payment_intent_data[metadata][entitlementId]': input.entitlementId,
        'payment_intent_data[metadata][no_refund]': 'credit_on_failure',
    });
}

export async function retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
    return stripeGet<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

export function checkoutPaid(session: StripeCheckoutSession): boolean {
    return session.payment_status === 'paid' || session.status === 'complete';
}

export function originFromRequest(req: Request): string {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`;
    return SITE_URL;
}
