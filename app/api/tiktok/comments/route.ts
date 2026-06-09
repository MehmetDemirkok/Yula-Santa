import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    const rl = rateLimit(req, 'tiktok');
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Çok fazla istek. Lütfen 1 dakika bekleyin.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    if (!process.env.APIFY_API_TOKEN) {
        return NextResponse.json(
            {
                error: 'TikTok otomatik yorum çekme yapılandırılmamış. Lütfen yorumları "Manuel Ekle" ile yapıştırın veya yöneticiye APIFY_API_TOKEN eklemesini söyleyin.',
                code: 'NO_APIFY_TOKEN',
            },
            { status: 503 }
        );
    }

    try {
        const { postLink } = await req.json();

        if (!postLink) {
            return NextResponse.json({ error: 'Link is required' }, { status: 400 });
        }

        const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        // Using 'clockworks/tiktok-comments-scraper' as seen in the user's screenshot
        const run = await client.actor("clockworks/tiktok-comments-scraper").call({
            postURLs: [postLink],
            commentsPerPost: 500,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Map the Apify results to our Participant format
        // The structure of items depends on the specific actor, but usually contains text and uniqueId/nickname
        const participants = items.map((item: Record<string, unknown>) => ({
            name: (item.uniqueId as string) || (item.nickname as string) || 'Unknown',
            comment: (item.text as string) || (item.comment as string) || '',
        })).filter((p: { name: string; comment: string }) => p.name && p.comment);

        return NextResponse.json({ participants });

    } catch (error) {
        console.error('TikTok Fetch Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments. Please make sure the link is correct and your API token is valid.' },
            { status: 500 }
        );
    }
}
