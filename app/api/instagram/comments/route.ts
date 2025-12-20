
import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

export async function POST(request: Request) {
    try {
        const { postLink } = await request.json();

        if (!postLink) {
            return NextResponse.json({ error: 'Post link is required' }, { status: 400 });
        }

        const apiToken = process.env.APIFY_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'APIFY_API_TOKEN is not configured' }, { status: 500 });
        }

        const client = new ApifyClient({
            token: apiToken,
        });

        // Using the 'apify/instagram-comment-scraper' actor
        // This is a common actor. We usually start the run and wait for results.
        const run = await client.actor("apify/instagram-comment-scraper").call({
            directUrls: [postLink],
            resultsLimit: 1000, // Limit to reasonable amount for free tier
        });

        // Fetch results from the run's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Extract usernames. The structure depends on the actor output.
        // Usually items have 'ownerUsername' or 'owner' object.
        const participants = items.map((item: any) => item.ownerUsername || item.owner?.username).filter(Boolean);

        // Remove duplicates
        const uniqueParticipants = [...new Set(participants)];

        return NextResponse.json({ participants: uniqueParticipants });

    } catch (error) {
        console.error('Error fetching Instagram comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}
