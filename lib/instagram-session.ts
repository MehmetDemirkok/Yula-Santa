/**
 * Instagram Session Manager
 *
 * Öncelik sırası:
 *   1. INSTAGRAM_COOKIES env → tam cookie string (en güvenilir)
 *   2. INSTAGRAM_SESSION_ID env → sadece sessionid cookie
 *   3. Dosya önbelleği (.ig-session-cache)
 *   4. Otomatik giriş (INSTAGRAM_USERNAME + INSTAGRAM_PASSWORD)
 *
 * NOT: Instagram sunucu tarafı isteklerde tam cookie set'i gerektirir.
 * En güvenilir yöntem: tarayıcıdan kopyalanan INSTAGRAM_COOKIES kullanmak.
 */

import fs from 'fs';
import path from 'path';

const WEB_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const SESSION_MAX_AGE_MS = 80 * 24 * 60 * 60 * 1000;
const SESSION_FILE = path.join(process.cwd(), '.ig-session-cache');

let memCache: { cookieString: string; savedAt: number } | null = null;

function parseCookies(res: Response): Record<string, string> {
    const result: Record<string, string> = {};
    const all: string[] =
        typeof (res.headers as any).getSetCookie === 'function'
            ? (res.headers as any).getSetCookie()
            : (res.headers.get('set-cookie') ?? '').split(/,(?=\s*[\w-]+=)/);

    for (const cookie of all) {
        const pair = cookie.split(';')[0].trim();
        const idx = pair.indexOf('=');
        if (idx > 0) {
            result[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
        }
    }
    return result;
}

function saveToFile(cookieString: string): void {
    try {
        fs.writeFileSync(
            SESSION_FILE,
            JSON.stringify({ cookieString, savedAt: Date.now() }),
            'utf-8'
        );
    } catch { /* salt okunur ortamlarda sorun yok */ }
}

function loadFromFile(): string | null {
    try {
        const raw = fs.readFileSync(SESSION_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as { cookieString?: string; sessionId?: string; savedAt: number };
        if (Date.now() - parsed.savedAt >= SESSION_MAX_AGE_MS) return null;
        // Eski format (sadece sessionId) ile geriye dönük uyumluluk
        if (parsed.cookieString) return parsed.cookieString;
        if (parsed.sessionId) return `sessionid=${parsed.sessionId}`;
    } catch { /* dosya yok veya geçersiz */ }
    return null;
}

async function loginInstagram(): Promise<string> {
    const username = process.env.INSTAGRAM_USERNAME;
    const password = process.env.INSTAGRAM_PASSWORD;

    if (!username || !password) {
        throw new Error(
            'Instagram oturumu bulunamadı. ' +
            '.env.local dosyasına INSTAGRAM_COOKIES ekleyin ' +
            '(tarayıcıdan kopyalanan tam cookie string).'
        );
    }

    console.log('[Instagram] Otomatik giriş başlatılıyor...');

    const homeRes = await fetch('https://www.instagram.com/', {
        headers: {
            'User-Agent': WEB_UA,
            'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        cache: 'no-store',
    });

    const homeCookies = parseCookies(homeRes);
    const csrfToken = homeCookies['csrftoken'] ?? '';
    const mid = homeCookies['mid'] ?? '';

    if (!csrfToken) throw new Error('Instagram CSRF token alınamadı.');

    const timestamp = Math.floor(Date.now() / 1000);
    const encPassword = `#PWD_INSTAGRAM_BROWSER:0:${timestamp}:${password}`;

    const loginRes = await fetch(
        'https://www.instagram.com/api/v1/web/accounts/login/ajax/',
        {
            method: 'POST',
            headers: {
                'User-Agent': WEB_UA,
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'X-Instagram-AJAX': '1',
                'Referer': 'https://www.instagram.com/',
                'Origin': 'https://www.instagram.com',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': `csrftoken=${csrfToken}${mid ? `; mid=${mid}` : ''}`,
            },
            body: new URLSearchParams({
                username,
                enc_password: encPassword,
                queryParams: '{}',
                optIntoOneTap: 'false',
                trustedDeviceRecords: '{}',
            }),
            cache: 'no-store',
            redirect: 'manual',
        }
    );

    const loginCookies = parseCookies(loginRes);
    const sessionId = loginCookies['sessionid'];

    if (!sessionId) {
        let errorMsg = 'Instagram girişi başarısız.';
        try {
            const body = await loginRes.json() as Record<string, any>;
            if (body.checkpoint_url) {
                errorMsg = 'Hesap güvenlik kontrolü gerektiriyor. 2FA kapalı bir hesap kullanın.';
            } else if (body.message === 'feedback_required') {
                errorMsg = 'Instagram hesabı geçici olarak kısıtlandı. Biraz bekleyin.';
            } else if (body.message) {
                errorMsg = `Instagram: ${body.message}`;
            }
        } catch { /* json parse hatası */ }
        throw new Error(errorMsg);
    }

    // Giriş sonrası tüm cookie'leri birleştir
    const allCookies: Record<string, string> = { ...homeCookies, ...loginCookies };
    const cookieString = Object.entries(allCookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');

    console.log('[Instagram] Giriş başarılı');
    return cookieString;
}

/**
 * Geçerli bir Instagram cookie string döndürür.
 * Gerekirse otomatik giriş yapar.
 */
export async function getInstagramCookies(): Promise<string> {
    if (memCache && Date.now() - memCache.savedAt < SESSION_MAX_AGE_MS) {
        return memCache.cookieString;
    }

    // 1. Tam cookie string (en güvenilir)
    const envCookies = process.env.INSTAGRAM_COOKIES;
    if (envCookies) {
        memCache = { cookieString: envCookies, savedAt: Date.now() };
        return envCookies;
    }

    // 2. Sadece session ID (eski yöntem, daha az güvenilir)
    const envSession = process.env.INSTAGRAM_SESSION_ID;
    if (envSession) {
        // URL-encoded olabilir (%3A → :), decode et
        const decoded = decodeURIComponent(envSession);
        const cookieString = `sessionid=${decoded}`;
        memCache = { cookieString, savedAt: Date.now() };
        return cookieString;
    }

    // 3. Dosya önbelleği
    const fileCookies = loadFromFile();
    if (fileCookies) {
        memCache = { cookieString: fileCookies, savedAt: Date.now() };
        return fileCookies;
    }

    // 4. Otomatik giriş
    const cookieString = await loginInstagram();
    memCache = { cookieString, savedAt: Date.now() };
    saveToFile(cookieString);
    return cookieString;
}

/** Geriye dönük uyumluluk için — sessionid'yi cookie string'den çıkarır */
export async function getInstagramSession(): Promise<string> {
    const cookies = await getInstagramCookies();
    const match = cookies.match(/(?:^|;\s*)sessionid=([^;]+)/);
    return match?.[1] ?? cookies;
}

export function invalidateInstagramSession(): void {
    memCache = null;
    try { fs.unlinkSync(SESSION_FILE); } catch { /* dosya yoksa sorun yok */ }
    console.log('[Instagram] Session geçersiz kılındı, bir sonraki istekte yeniden giriş yapılacak');
}
