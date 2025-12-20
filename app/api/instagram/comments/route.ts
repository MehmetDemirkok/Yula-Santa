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
        } catch (e) {
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
        // Note: Apify Free plan or Instagram limits might restrict the number of comments.
        const run = await client.actor("apify/instagram-comment-scraper").call({
            directUrls: [postLink],
            resultsLimit: 1000,
            // Some actors use 'limit' or 'maxItems'
            limit: 1000,
        });

        if (!run) {
            console.error('Apify actor run failed to start');
            return NextResponse.json({ error: 'Failed to start Instagram scraper' }, { status: 500 });
        }

        // Fetch results from the run's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Extract usernames
        const participants = items.map((item: any) => item.ownerUsername || item.owner?.username).filter(Boolean);

        // Remove duplicates
        const uniqueParticipants = [...new Set(participants)];

        return NextResponse.json({ participants: uniqueParticipants });

    } catch (error: any) {
        console.error('Error fetching Instagram comments:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 });
    }
}
