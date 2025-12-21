import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

export async function POST(request: Request) {
    try {
        // Validation for API Token
        if (!process.env.APIFY_API_TOKEN) {
            console.error('APIFY_API_TOKEN is not defined in environment variables');
            return NextResponse.json({ error: 'Server configuration error: Apify API Token missing' }, { status: 500 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { postLink } = body;

        if (!postLink) {
            return NextResponse.json({ error: 'Post link is required' }, { status: 400 });
        }

        const apiToken = process.env.APIFY_API_TOKEN;
        const client = new ApifyClient({
            token: apiToken,
        });

        // Using the 'apify/instagram-comment-scraper' actor
        const run = await client.actor("apify/instagram-comment-scraper").call({
            directUrls: [postLink],
            resultsLimit: 1000,
            limit: 1000,
        });

        if (!run) {
            console.error('Apify actor run failed to start');
            return NextResponse.json({ error: 'Failed to start Instagram scraper' }, { status: 500 });
        }

        // Fetch results from the run's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Extract usernames and comments
        const participants = items.map((item: Record<string, any>) => ({
            name: item.ownerUsername || item.owner?.username,
            comment: item.text || item.caption || item.textDisplay || ''
        })).filter((p: any) => p.name);

        // Remove duplicates based on name
        const uniqueParticipants = participants.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.name === v.name) === i);

        return NextResponse.json({ participants: uniqueParticipants });

    } catch (error) {
        console.error('Error fetching Instagram comments:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch comments' }, { status: 500 });
    }
}
