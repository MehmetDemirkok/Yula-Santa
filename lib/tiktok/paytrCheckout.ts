import { createHmac, timingSafeEqual } from 'node:crypto';
import { FETCH_PRICE_TRY } from './pricing';
import { SITE_URL } from '@/lib/constants';

const PAYTR_TOKEN_URL = 'https://www.paytr.com/odeme/api/get-token';
const PAYTR_PAYMENT_BASE = 'https://www.paytr.com/odeme/guvenli';

function merchantId(): string {
    const id = process.env.PAYTR_MERCHANT_ID;
    if (!id) throw new Error('PAYTR_MERCHANT_ID missing');
    return id;
}

function merchantKey(): string {
    const key = process.env.PAYTR_MERCHANT_KEY;
    if (!key) throw new Error('PAYTR_MERCHANT_KEY missing');
    return key;
}

function merchantSalt(): string {
    const salt = process.env.PAYTR_MERCHANT_SALT;
    if (!salt) throw new Error('PAYTR_MERCHANT_SALT missing');
    return salt;
}

export function isPaytrConfigured(): boolean {
    return Boolean(
        process.env.PAYTR_MERCHANT_ID && process.env.PAYTR_MERCHANT_KEY && process.env.PAYTR_MERCHANT_SALT
    );
}

function isTestMode(): boolean {
    return process.env.PAYTR_TEST_MODE === '1';
}

export function clientIpFromRequest(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    return forwarded || req.headers.get('x-real-ip') || '127.0.0.1';
}

export function originFromRequest(req: Request): string {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`;
    return SITE_URL;
}

export type PaytrPaymentToken = {
    token: string;
    url: string;
};

export async function createTikTokPaymentToken(input: {
    merchantOid: string;
    email: string;
    userIp: string;
    locale: string;
    successUrl: string;
    failUrl: string;
}): Promise<PaytrPaymentToken> {
    const merchant_id = merchantId();
    const payment_amount = String(FETCH_PRICE_TRY * 100);
    const no_installment = '1';
    const max_installment = '0';
    const currency = 'TL';
    const test_mode = isTestMode() ? '1' : '0';

    const user_basket = Buffer.from(
        JSON.stringify([['TikTok yorum çekimi', FETCH_PRICE_TRY.toFixed(2), 1]]),
        'utf8'
    ).toString('base64');

    const hashStr =
        merchant_id +
        input.userIp +
        input.merchantOid +
        input.email +
        payment_amount +
        user_basket +
        no_installment +
        max_installment +
        currency +
        test_mode;

    const paytr_token = createHmac('sha256', merchantKey())
        .update(hashStr + merchantSalt())
        .digest('base64');

    const body = new URLSearchParams({
        merchant_id,
        user_ip: input.userIp,
        merchant_oid: input.merchantOid,
        email: input.email,
        payment_amount,
        paytr_token,
        user_basket,
        no_installment,
        max_installment,
        currency,
        test_mode,
        debug_on: test_mode,
        lang: input.locale.startsWith('tr') ? 'tr' : 'en',
        merchant_ok_url: input.successUrl,
        merchant_fail_url: input.failUrl,
    });

    const res = await fetch(PAYTR_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    const data = (await res.json().catch(() => ({}))) as { status?: string; token?: string; reason?: string };

    if (!res.ok || data.status !== 'success' || !data.token) {
        throw new Error(data.reason || `PayTR token request failed (${res.status})`);
    }

    return {
        token: data.token,
        url: `${PAYTR_PAYMENT_BASE}/${data.token}`,
    };
}

export type PaytrNotification = {
    merchant_oid: string;
    status: string;
    total_amount: string;
    hash: string;
};

export function verifyPaytrNotification(fields: PaytrNotification): boolean {
    const expected = createHmac('sha256', merchantKey())
        .update(fields.merchant_oid + merchantSalt() + fields.status + fields.total_amount)
        .digest('base64');

    const a = Buffer.from(fields.hash);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}
