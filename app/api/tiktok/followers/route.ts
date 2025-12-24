
import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

interface FollowerCheckRequest {
    channelUsername: string;
    usernames: string[];
}

export async function POST(req: NextRequest) {
    try {
        const { channelUsername, usernames }: FollowerCheckRequest = await req.json();

        if (!channelUsername || !usernames || usernames.length === 0) {
            return NextResponse.json({ error: 'Channel username and usernames are required' }, { status: 400 });
        }

        const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        // Use TikTok Followers Scraper to get the followers of the channel
        // We'll check if the winner usernames are in the follower list
        const run = await client.actor("clockworks/tiktok-scraper").call({
            profiles: [channelUsername],
            resultsPerPage: 1000, // Get up to 1000 followers
            scrapeFollowers: true,
            shouldDownloadCovers: false,
            shouldDownloadVideos: false,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Extract follower usernames from the results
        const followerUsernames = new Set<string>();

        items.forEach((item: Record<string, unknown>) => {
            // The structure depends on the actor, typically it returns followers array
            if (item.followers && Array.isArray(item.followers)) {
                (item.followers as Array<Record<string, unknown>>).forEach((follower) => {
                    const username = (follower.uniqueId as string) || (follower.username as string);
                    if (username) {
                        followerUsernames.add(username.toLowerCase());
                    }
                });
            }
            // Also check if the item itself is a follower entry
            const username = (item.uniqueId as string) || (item.username as string);
            if (username) {
                followerUsernames.add(username.toLowerCase());
            }
        });

        // Check each username against the follower list
        const results: Record<string, boolean | 'unknown'> = {};

        usernames.forEach((username) => {
            const cleanUsername = username.toLowerCase().replace(/^@/, '');
            if (followerUsernames.size === 0) {
                // If we couldn't get followers, mark as unknown
                results[username] = 'unknown';
            } else {
                results[username] = followerUsernames.has(cleanUsername);
            }
        });

        return NextResponse.json({
            results,
            followerCount: followerUsernames.size
        });

    } catch (error) {
        console.error('TikTok Follower Check Error:', error);
        // Return unknown status for all users if the check fails
        return NextResponse.json(
            { error: 'Could not verify follower status. This feature may not be available for all accounts.' },
            { status: 500 }
        );
    }
}
