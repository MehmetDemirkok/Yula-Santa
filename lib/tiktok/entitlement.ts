import { createHmac, timingSafeEqual } from 'node:crypto';

export type CreditTokenPayload = {
    id: string;
    email: string;
    exp: number;
};

function secret(): string {
    return (
        process.env.TIKTOK_LEDGER_SECRET ||
        process.env.POSTGRES_PASSWORD ||
        process.env.DATABASE_URL ||
        ''
    );
}

function sign(value: string): string {
    const key = secret();
    if (!key) throw new Error('LEDGER_SECRET_MISSING');
    return createHmac('sha256', key).update(value).digest('base64url');
}

export function createCreditToken(id: string, email: string, ttlMs = 1000 * 60 * 60 * 24 * 90): string {
    const payload: CreditTokenPayload = {
        id,
        email: email.trim().toLowerCase(),
        exp: Date.now() + ttlMs,
    };
    const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    return `ttc1.${body}.${sign(body)}`;
}

export function verifyCreditToken(token: string): CreditTokenPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'ttc1') return null;
    const [, body, mac] = parts;
    try {
        const expected = sign(body);
        const a = Buffer.from(mac);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as CreditTokenPayload;
        if (!payload?.id || !payload?.email || typeof payload.exp !== 'number') return null;
        if (payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}
