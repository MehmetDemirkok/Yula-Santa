/**
 * Instagram Comments API — Instagram'ın özel (private) web v1 API'sini kullanır.
 *
 * Neden yeniden yazıldı?
 *   Eski sürüm Instagram'ın artık KAPATTIĞI uçlara (`?__a=1`, GraphQL `query_hash`)
 *   dayanıyordu ve hep "yorum verisi bulunamadı" hatası veriyordu.
 *
 * Yeni yaklaşım (profil ucuyla aynı, çalışan yöntem):
 *   1. Post linkinden shortcode çıkar
 *   2. shortcode'u media_id'ye çevir (base64 + BigInt)
 *   3. https://www.instagram.com/api/v1/media/{mediaId}/comments/ ucundan
 *      `x-ig-app-id` başlığı + oturum çerezi ile yorumları çek (sayfalı).
 *
 * Endpoint: POST /api/instagram/comments
 * Body: { postLink: string }
 */

import { NextResponse } from 'next/server';
import { getInstagramCookies, getInstagramSession, invalidateInstagramSession } from '@/lib/instagram-session';
import { rateLimit } from '@/lib/rateLimit';

const IG_APP_ID = '936619743392459';
const WEB_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MAX_COMMENT_RESULTS = 1000;
const MAX_PAGES = 30;

export const maxDuration = 60;

type InstagramLinkInfo = { type: 'p' | 'reel' | 'tv'; shortcode: string };

function extractInstagramLinkInfo(postLink: string): InstagramLinkInfo | null {
    const match = postLink.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
    if (!match) return null;
    const rawType = match[1].toLowerCase();
    const type = (rawType === 'reels' ? 'reel' : rawType) as InstagramLinkInfo['type'];
    return { type, shortcode: match[2] };
}

/**
 * Instagram shortcode → media_id (pk) dönüşümü.
 * Shortcode, media id'nin URL-safe base64 kodlamasıdır.
 */
function shortcodeToMediaId(shortcode: string): string | null {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const SIXTY_FOUR = BigInt(64);
    let id = BigInt(0);
    for (const ch of shortcode) {
        const idx = alphabet.indexOf(ch);
        if (idx < 0) return null;
        id = id * SIXTY_FOUR + BigInt(idx);
    }
    return id.toString();
}

function buildHeaders(cookie: string, shortcode: string): Record<string, string> {
    // Bu uç, yalnızca sessionid çerezi ile yetinmez; aşağıdaki başlıklar olmadan
    // login sayfasına 302 yönlendirir. X-CSRFToken çerezden okunur.
    const csrf = cookie.match(/csrftoken=([^;]+)/)?.[1] ?? '';
    return {
        'User-Agent': WEB_UA,
        'x-ig-app-id': IG_APP_ID,
        'X-IG-WWW-Claim': '0',
        'X-CSRFToken': csrf,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': `https://www.instagram.com/p/${shortcode}/`,
        'Origin': 'https://www.instagram.com',
        'Cookie': cookie,
    };
}

type CommentNode = { user?: { username?: string }; text?: string };

async function fetchCommentsPage(mediaId: string, shortcode: string, cookie: string, minId: string | null) {
    let url = `https://www.instagram.com/api/v1/media/${mediaId}/comments/?can_support_threading=true&permalink_enabled=false`;
    if (minId) url += `&min_id=${encodeURIComponent(minId)}`;

    const res = await fetch(url, { headers: buildHeaders(cookie, shortcode), cache: 'no-store', redirect: 'manual' });

    // 3xx = login'e yönlendiriyor (geçersiz oturum), 401/403 = erişim reddi
    if (res.status === 401 || res.status === 403 || (res.status >= 300 && res.status < 400)) {
        const err = new Error(`Instagram access denied (${res.status})`);
        (err as Error & { code?: number }).code = res.status;
        throw err;
    }
    if (res.status === 404) {
        const err = new Error('not found');
        (err as Error & { code?: number }).code = 404;
        throw err;
    }
    if (!res.ok) {
        throw new Error(`Instagram API error ${res.status}`);
    }

    return res.json() as Promise<{
        comments?: CommentNode[];
        next_min_id?: string;
        has_more_comments?: boolean;
    }>;
}

export async function POST(request: Request) {
    const rl = rateLimit(request, 'instagram');
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Çok fazla istek. Lütfen 1 dakika bekleyin.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
    }

    const { postLink } = body as { postLink?: string };
    if (!postLink) {
        return NextResponse.json({ error: 'Post linki gerekli' }, { status: 400 });
    }

    const linkInfo = extractInstagramLinkInfo(postLink);
    if (!linkInfo) {
        return NextResponse.json({ error: 'Geçerli bir Instagram post linki girin (instagram.com/p/...)' }, { status: 400 });
    }

    const mediaId = shortcodeToMediaId(linkInfo.shortcode);
    if (!mediaId) {
        return NextResponse.json({ error: 'Gönderi kimliği çözümlenemedi' }, { status: 400 });
    }

    let cookieString: string;
    try {
        cookieString = await getInstagramCookies();
    } catch (error) {
        console.error('Instagram cookie alınamadı:', error);
        return NextResponse.json(
            { error: 'Instagram oturumu yapılandırılmamış. Lütfen manuel ekleme yöntemini kullanın.' },
            { status: 503 }
        );
    }

    const collect = async (cookie: string) => {
        const participants: Array<{ name: string; comment: string }> = [];
        const seen = new Set<string>();
        let minId: string | null = null;
        let page = 0;
        let emptyStreak = 0;

        do {
            const data = await fetchCommentsPage(mediaId, linkInfo.shortcode, cookie, minId);
            const comments = data.comments ?? [];
            let added = 0;
            for (const c of comments) {
                const username = c.user?.username;
                if (username && !seen.has(username)) {
                    seen.add(username);
                    participants.push({ name: username, comment: c.text ?? '' });
                    added++;
                }
            }
            // Yeni kullanıcı gelmiyorsa (token döngüsü) erken çık
            emptyStreak = added === 0 ? emptyStreak + 1 : 0;
            minId = data.next_min_id ?? null;
            page++;
        } while (minId && emptyStreak < 3 && participants.length < MAX_COMMENT_RESULTS && page < MAX_PAGES);

        return participants;
    };

    try {
        let participants: Array<{ name: string; comment: string }>;
        try {
            participants = await collect(cookieString);
        } catch (error) {
            // Oturum geçersizse bir kez yenileyip tekrar dene
            const code = (error as Error & { code?: number }).code;
            if (code === 401 || code === 403 || (code && code >= 300 && code < 400)) {
                invalidateInstagramSession();
                const fresh = await getInstagramSession();
                participants = await collect(`sessionid=${fresh}`);
            } else {
                throw error;
            }
        }

        // Aynı kullanıcıyı bir kez say
        const unique = participants
            .filter((item, idx, arr) => arr.findIndex((x) => x.name === item.name) === idx)
            .slice(0, MAX_COMMENT_RESULTS);

        if (unique.length === 0) {
            return NextResponse.json(
                { error: 'Bu gönderide yorum bulunamadı veya yorumlar kapalı.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ participants: unique });
    } catch (error) {
        const code = (error as Error & { code?: number }).code;
        const message = error instanceof Error ? error.message : 'Instagram yorumları alınamadı';
        console.error('Instagram yorum hatası:', message);

        if (code === 404) {
            return NextResponse.json({ error: 'Gönderi bulunamadı. Hesap gizli olabilir veya link hatalı.' }, { status: 404 });
        }
        if (code === 401 || code === 403 || (code && code >= 300 && code < 400)) {
            return NextResponse.json(
                { error: 'Instagram erişimi reddetti. Oturum süresi dolmuş olabilir; biraz bekleyip tekrar deneyin.' },
                { status: 403 }
            );
        }
        return NextResponse.json({ error: 'Instagram yorumları alınamadı. Lütfen tekrar deneyin.' }, { status: 500 });
    }
}
