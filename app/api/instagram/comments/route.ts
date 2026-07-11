/**
 * Instagram Comments API — Apify üzerinden çalışır.
 *
 * Neden Apify'a taşındı?
 *   Önceki sürüm Instagram'ın özel web API'sini kullanıcı adı/şifre ile
 *   sunucu tarafında login olup elde edilen session cookie'siyle çağırıyordu.
 *   Vercel'in datacenter IP'sinden gelen bu login'ler Instagram tarafından
 *   sık sık şüpheli/bot girişi olarak işaretlenip checkpoint'e düşüyordu,
 *   ayrıca session cookie'leri ~90 günde bir elle yenilenmesi gerekiyordu.
 *   Apify, IP/oturum riskini kendi tarafında yönetiyor; hesap ban riski yok.
 *
 * Endpoint: POST /api/instagram/comments
 * Body: { postLink: string }
 */

import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { rateLimit } from '@/lib/rateLimit';

export const maxDuration = 60;

const MAX_COMMENT_RESULTS = 1000;

function isValidInstagramPostLink(postLink: string): boolean {
    return /instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/[A-Za-z0-9_-]+/i.test(postLink);
}

type ApifyCommentItem = {
    message?: string;
    text?: string;
    user?: { username?: string };
};

export async function POST(request: Request) {
    const rl = rateLimit(request, 'instagram');
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Çok fazla istek. Lütfen 1 dakika bekleyin.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    if (!process.env.APIFY_API_TOKEN) {
        return NextResponse.json(
            {
                error: 'Instagram otomatik yorum çekme yapılandırılmamış. Lütfen yorumları "Manuel Ekle" ile yapıştırın veya yöneticiye APIFY_API_TOKEN eklemesini söyleyin.',
                code: 'NO_APIFY_TOKEN',
            },
            { status: 503 }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
    }

    const { postLink } = body as { postLink?: string };
    if (!postLink || !isValidInstagramPostLink(postLink)) {
        return NextResponse.json({ error: 'Geçerli bir Instagram post linki girin (instagram.com/p/...)' }, { status: 400 });
    }

    try {
        const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

        const run = await client.actor('apidojo/instagram-comments-scraper').call({
            startUrls: [postLink],
            maxItems: MAX_COMMENT_RESULTS,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const participants = (items as ApifyCommentItem[])
            .map((item) => ({
                name: item.user?.username ?? '',
                comment: item.message ?? item.text ?? '',
            }))
            .filter((p) => p.name);

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
        console.error('Instagram yorum hatası (Apify):', error);
        return NextResponse.json(
            { error: 'Instagram yorumları alınamadı. Linki kontrol edip tekrar deneyin.' },
            { status: 500 }
        );
    }
}
