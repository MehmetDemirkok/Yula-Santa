interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 dakika
const MAX_REQUESTS: Record<string, number> = {
    default: 10,
    instagram: 5,
    youtube: 8,
    tiktok: 5,
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
