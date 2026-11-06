/**
 * Plaka Avcısı — player identity (server-only).
 *
 * Signed-in users are keyed by a hash of their Google account id/email.
 * Guests get an httpOnly, HMAC-signed anonymous cookie — no account needed,
 * but their scores can still be tracked and ranked.
 */

import { createHmac, createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { auth } from '@/auth';

const GUEST_COOKIE = 'plaka_player';
const GUEST_MAX_AGE = 60 * 60 * 24 * 365;

function signingSecret(): string {
    // Prefer an explicit secret; otherwise derive a stable, non-public key from
    // the server-only DATABASE_URL so guest cookies cannot be forged from source.
    // AUTH_SECRET comes after DATABASE_URL on purpose: live guest cookies are signed
    // with the derived key, and adding AUTH_SECRET must not reset guest identities.
    return (
        process.env.PLAKA_SECRET ||
        (process.env.DATABASE_URL
            ? createHash('sha256').update(`plaka-avcisi:${process.env.DATABASE_URL}`).digest('hex')
            : process.env.AUTH_SECRET ||
              process.env.NEXTAUTH_SECRET ||
              'plaka-avcisi-local-dev-secret')
    );
}

function sign(value: string): string {
    return createHmac('sha256', signingSecret()).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function parseGuestCookie(raw: string | undefined): string | null {
    if (!raw) return null;
    const separator = raw.lastIndexOf('.');
    if (separator <= 0) return null;
    const uuid = raw.slice(0, separator);
    const signature = raw.slice(separator + 1);
    if (!/^[0-9a-f-]{36}$/i.test(uuid)) return null;
    if (!safeEqual(signature, sign(uuid))) return null;
    return uuid;
}

export type PlayerIdentity = {
    playerId: string;
    kind: 'user' | 'guest';
    displayName: string | null;
    avatar: string | null;
    /** True when a fresh guest cookie was issued during this request. */
    issuedGuestCookie: boolean;
};

export const GUEST_AVATARS = ['🏎️', '🚗', '🚙', '🛻', '🏁', '🚦', '🛞', '⚡'];

export function defaultGuestAvatar(playerId: string): string {
    const hash = createHash('sha1').update(playerId).digest();
    return GUEST_AVATARS[hash[0] % GUEST_AVATARS.length];
}

export function sanitizeNickname(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const cleaned = value
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (cleaned.length < 2 || cleaned.length > 20) return null;
    return cleaned;
}

/**
 * Resolve the current player. Issues a signed guest cookie when needed.
 * Must only be called from route handlers / server actions (cookie writes).
 */
export async function getPlayerIdentity(): Promise<PlayerIdentity> {
    const session = await auth();
    const accountId = session?.user?.email || session?.user?.name;

    if (accountId) {
        const playerId = `user_${createHash('sha256').update(accountId).digest('hex').slice(0, 32)}`;
        return {
            playerId,
            kind: 'user',
            displayName: session?.user?.name ?? null,
            avatar: session?.user?.image ?? null,
            issuedGuestCookie: false,
        };
    }

    const jar = await cookies();
    const existing = parseGuestCookie(jar.get(GUEST_COOKIE)?.value);
    const uuid = existing ?? randomUUID();

    if (!existing) {
        jar.set(GUEST_COOKIE, `${uuid}.${sign(uuid)}`, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: GUEST_MAX_AGE,
        });
    }

    const playerId = `guest_${uuid}`;
    return {
        playerId,
        kind: 'guest',
        displayName: null,
        avatar: null,
        issuedGuestCookie: !existing,
    };
}

/** Read-only variant for routes that must not mutate cookies (GET/HEAD). */
export async function peekPlayerIdentity(): Promise<PlayerIdentity | null> {
    const session = await auth();
    const accountId = session?.user?.email || session?.user?.name;
    if (accountId) {
        return {
            playerId: `user_${createHash('sha256').update(accountId).digest('hex').slice(0, 32)}`,
            kind: 'user',
            displayName: session?.user?.name ?? null,
            avatar: session?.user?.image ?? null,
            issuedGuestCookie: false,
        };
    }

    const jar = await cookies();
    const uuid = parseGuestCookie(jar.get(GUEST_COOKIE)?.value);
    if (!uuid) return null;

    return {
        playerId: `guest_${uuid}`,
        kind: 'guest',
        displayName: null,
        avatar: null,
        issuedGuestCookie: false,
    };
}
