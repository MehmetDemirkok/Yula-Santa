import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        if (!process.env.APIFY_API_TOKEN) {
            return NextResponse.json({ error: 'API token eksik' }, { status: 500 });
        }

        const { username } = await req.json();

        if (!username) {
            return NextResponse.json({ error: 'Kullanıcı adı gerekli' }, { status: 400 });
        }

        const clean = username.replace(/^@/, '').trim();
        const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

        const run = await client.actor("apify/instagram-story-scraper").call({
            usernames: [clean],
            resultsLimit: 30,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const stories = items
            .filter((item: Record<string, unknown>) => item.url)
            .map((item: Record<string, unknown>) => ({
                id: (item.id as string) || String(Math.random()),
                url: item.url as string,
                type: (item.type as string) || 'photo',
                timestamp: item.timestamp as string | null,
                expiringAt: item.expiringAt as string | null,
                username: (item.username as string) || clean,
            }));

        return NextResponse.json({ stories, username: clean });

    } catch (error) {
        console.error('Story fetch error:', error);
        const msg = error instanceof Error ? error.message : 'Hikayeler çekilemedi';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
