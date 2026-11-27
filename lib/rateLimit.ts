interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 dakika
const MAX_REQUESTS: Record<string, number> = {
    default: 10,
    youtube: 8,
    tiktok: 5,
    'tiktok-giveaway-create': 5,
    'tiktok-giveaway-import': 30,
    'plaka-session': 10,
    'plaka-resume': 20,
    'suggest-gifts': 8,
    'plaka-answer': 80,
    'plaka-finish': 20,
    'plaka-leaderboard': 40,
    'plaka-stats': 40,
    'analytics-collect': 120,
    'public-stats': 30,
    'admin-denied': 5,
    'auth-register': 5,
    'auth-login': 15,
    'auth-login-email': 8,
    'auth-password': 5,
    'auth-account': 10,
    'auth-forgot': 5,
    'auth-forgot-email': 3,
    'auth-token': 20,
    'auth-verify-resend': 3,
    'draws-list': 60,
    'draws-save': 30,
    'draws-delete': 30,
};

function getKey(ip: string, route: string): string {
    return `${ip}:${route}`;
}

export function rateLimit(
    request: Request,
    route: keyof typeof MAX_REQUESTS = 'default'
): { allowed: boolean; remaining: number; resetAt: number } {
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const key = getKey(ip, route);
    const now = Date.now();
    const limit = MAX_REQUESTS[route] ?? MAX_REQUESTS.default;

    let entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        entry = { count: 1, resetAt: now + WINDOW_MS };
        store.set(key, entry);

        // Periyodik temizlik — büyük map'leri önlemek için
        if (store.size > 5000) {
            for (const [k, v] of store.entries()) {
                if (now > v.resetAt) store.delete(k);
            }
        }

        return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
    }

    entry.count++;

    if (entry.count > limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** Same window and limits, keyed by something other than the IP (e.g. an e-mail being tried). */
export function rateLimitKey(key: string, route: keyof typeof MAX_REQUESTS): boolean {
    const now = Date.now();
    const limit = MAX_REQUESTS[route] ?? MAX_REQUESTS.default;
    const storeKey = `key:${route}:${key}`;
    const entry = store.get(storeKey);
    if (!entry || now > entry.resetAt) {
        store.set(storeKey, { count: 1, resetAt: now + WINDOW_MS });
        return true;
    }
    entry.count++;
    return entry.count <= limit;
}
