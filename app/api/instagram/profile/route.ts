/**
 * Instagram Profile API — Apify'sız, ücretsiz
 *
 * Instagram'ın kendi web API'sini kullanır.
 * Herkese açık (public) hesaplar için oturum gerekmez.
 * INSTAGRAM_SESSION_ID env varı varsa daha güvenilir çalışır.
 *
 * Endpoint: POST /api/instagram/profile
 * Body: { username: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInstagramSession } from '@/lib/instagram-session';

const IG_APP_ID = '936619743392459';
const WEB_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export const maxDuration = 30;

function buildHeaders(sessionId?: string): Record<string, string> {
    const headers: Record<string, string> = {
        'User-Agent': WEB_UA,
        'x-ig-app-id': IG_APP_ID,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.instagram.com/',
        'Origin': 'https://www.instagram.com',
    };
    if (sessionId) {
        headers['Cookie'] = `sessionid=${sessionId}`;
    }
    return headers;
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { username } = body;
        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const clean = username.replace(/^@/, '').trim().toLowerCase();
        if (!clean) {
            return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
        }

        // Oturumlu istek daha güvenilir (HD profil fotoğrafı vs.)
        let sessionId: string | undefined;
        try {
            sessionId = await getInstagramSession();
        } catch {
            // Session alınamazsa anonim olarak dene
        }

        const res = await fetch(
            `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`,
            { headers: buildHeaders(sessionId), cache: 'no-store', redirect: 'manual' }
        );

        if (res.status === 404) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 3xx = Instagram login sayfasına yönlendiriyor = geçersiz oturum
        // Session hatalıysa anonim olarak yeniden dene
        if (res.status === 401 || res.status === 403 || (res.status >= 300 && res.status < 400)) {
            const retry = await fetch(
                `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`,
                { headers: buildHeaders(), cache: 'no-store', redirect: 'manual' }
            );
            if (!retry.ok || (retry.status >= 300 && retry.status < 400)) {
                return NextResponse.json(
                    { error: 'Instagram erişim reddetti. Biraz bekleyip tekrar deneyin.' },
                    { status: retry.status }
                );
            }
            const retryData = await retry.json();
            return NextResponse.json(parseUser(retryData, clean));
        }

        if (!res.ok) {
            return NextResponse.json(
                { error: `Instagram API hatası: ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(parseUser(data, clean));

    } catch (error) {
        console.error('Instagram Profile Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Profil yüklenemedi' },
            { status: 500 }
        );
    }
}

function parseUser(data: Record<string, any>, fallbackUsername: string) {
    const u = data?.data?.user;
    if (!u) throw new Error('Profile not found');

    return {
        username: u.username ?? fallbackUsername,
        fullName: u.full_name ?? '',
        biography: u.biography ?? '',
        followersCount: u.edge_followed_by?.count ?? 0,
        followsCount: u.edge_follow?.count ?? 0,
        postsCount: u.edge_owner_to_timeline_media?.count ?? 0,
        profilePicUrl: u.profile_pic_url ?? '',
        profilePicUrlHD: u.profile_pic_url_hd ?? u.profile_pic_url ?? '',
        isPrivate: u.is_private ?? false,
        isVerified: u.is_verified ?? false,
        id: u.id ?? null,
    };
}
