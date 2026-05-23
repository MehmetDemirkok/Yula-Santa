/**
 * Instagram Stories API — Apify'sız, tamamen ücretsiz, otomatik oturum yenileme
 *
 * Oturum yönetimi lib/instagram-session.ts tarafından yapılır.
 * 401 alındığında session otomatik geçersiz kılınır ve yeniden giriş yapılır.
 *
 * Gerekli env değişkenleri (.env.local):
 *   INSTAGRAM_USERNAME=kullanici_adiniz
 *   INSTAGRAM_PASSWORD=sifreniz
 *
 * Opsiyonel (el ile override):
 *   INSTAGRAM_SESSION_ID=xxxx   ← varsa önce bu kullanılır
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInstagramCookies, invalidateInstagramSession } from '@/lib/instagram-session';

const IG_APP_ID = '936619743392459';
const WEB_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export const maxDuration = 30;

async function fetchStories(username: string, cookieString: string) {
    const webHeaders = {
        'User-Agent': WEB_UA,
        'x-ig-app-id': IG_APP_ID,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.instagram.com/',
        'Origin': 'https://www.instagram.com',
        'Cookie': cookieString,
    };

    // Adım 1: userId ve hesap durumunu al
    const profileRes = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
        { headers: webHeaders, cache: 'no-store', redirect: 'manual' }
    );

    if (profileRes.status === 401) throw { code: 'SESSION_EXPIRED', status: 401 };
    if (profileRes.status >= 300 && profileRes.status < 400) {
        throw { code: 'INSTAGRAM_BLOCKED', status: 403, message: 'Instagram sunucu erişimini engelledi.' };
    }
    if (!profileRes.ok) throw new Error(`Profil alınamadı: ${profileRes.status}`);

    const profileData = await profileRes.json();
    const userId: string | undefined = profileData.data?.user?.id;
    const isPrivate: boolean = profileData.data?.user?.is_private ?? false;

    if (!userId) throw new Error('Kullanıcı bulunamadı');
    if (isPrivate) {
        throw Object.assign(
            new Error('Bu hesap gizli. Hikayeleri görüntülemek için takip etmeniz gerekiyor.'),
            { code: 'PRIVATE_ACCOUNT', status: 403 }
        );
    }

    // Adım 2: Web reels_media endpoint'i (mobile API'den daha erişilebilir)
    const storyRes = await fetch(
        `https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=${userId}`,
        {
            headers: { ...webHeaders, 'Referer': `https://www.instagram.com/${username}/` },
            cache: 'no-store',
            redirect: 'manual',
        }
    );

    if (storyRes.status === 401) throw { code: 'SESSION_EXPIRED', status: 401 };
    if (storyRes.status >= 300 && storyRes.status < 400) {
        throw { code: 'INSTAGRAM_BLOCKED', status: 403, message: 'Instagram hikaye erişimini engelledi.' };
    }
    if (!storyRes.ok) return [];

    const data = await storyRes.json();
    const items: Record<string, any>[] = data.reels_media?.[0]?.items ?? [];

    return items
        .map((item) => {
            const isVideo = item.media_type === 2;
            const url = isVideo
                ? (item.video_versions?.[0]?.url ?? item.image_versions2?.candidates?.[0]?.url ?? '')
                : (item.image_versions2?.candidates?.[0]?.url ?? '');
            if (!url) return null;
            return {
                id: item.id as string,
                url,
                type: isVideo ? 'video' : 'photo',
                timestamp: item.taken_at ? new Date((item.taken_at as number) * 1000).toISOString() : null,
                expiringAt: item.expiring_at ? new Date((item.expiring_at as number) * 1000).toISOString() : null,
                username,
            };
        })
        .filter(Boolean);
}

export async function POST(req: NextRequest) {
    try {
        const { username } = await req.json();
        if (!username) {
            return NextResponse.json({ error: 'Kullanıcı adı gerekli' }, { status: 400 });
        }

        const clean = username.replace(/^@/, '').trim().toLowerCase();

        // Cookie'leri al — otomatik giriş yapar gerekirse
        let cookieString: string;
        try {
            cookieString = await getInstagramCookies();
        } catch (err) {
            return NextResponse.json(
                {
                    error: err instanceof Error ? err.message : 'Instagram oturumu alınamadı',
                    code: 'NO_SESSION',
                },
                { status: 503 }
            );
        }

        // İlk deneme
        try {
            const stories = await fetchStories(clean, cookieString);
            return NextResponse.json({ stories, username: clean });
        } catch (err: any) {
            if (err?.code !== 'SESSION_EXPIRED') {
                return NextResponse.json(
                    { error: err.message ?? 'Hikayeler çekilemedi', code: err.code },
                    { status: err.status ?? 500 }
                );
            }
        }

        // Session süresi dolmuş — geçersiz kıl ve yeniden dene
        invalidateInstagramSession();

        let newCookies: string;
        try {
            newCookies = await getInstagramCookies();
        } catch (err) {
            return NextResponse.json(
                {
                    error: err instanceof Error ? err.message : 'Session yenileme başarısız',
                    code: 'SESSION_REFRESH_FAILED',
                },
                { status: 503 }
            );
        }

        try {
            const stories = await fetchStories(clean, newCookies);
            return NextResponse.json({ stories, username: clean });
        } catch (err: any) {
            return NextResponse.json(
                { error: err.message ?? 'Hikayeler çekilemedi', code: err.code ?? 'UNKNOWN' },
                { status: err.status ?? 500 }
            );
        }

    } catch (error) {
        console.error('Instagram Stories Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Hikayeler çekilemedi' },
            { status: 500 }
        );
    }
}
