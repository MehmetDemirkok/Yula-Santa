import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { rateLimit } from '@/lib/rateLimit';
import { createRequestId, logTikTokEvent } from '@/lib/tiktok/server';

export const maxDuration = 60;

interface FollowerCheckRequest {
    channelUsername: string;
    usernames: string[];
}

export async function POST(req: NextRequest) {
    const requestId = createRequestId();
    const started = Date.now();

    const rl = rateLimit(req, 'tiktok');
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Too many requests', code: 'RATE_LIMIT', requestId },
            {
                status: 429,
                headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
            }
        );
    }

    if (!process.env.APIFY_API_TOKEN) {
        return NextResponse.json(
            { error: 'Takip doğrulama yapılandırılmamış (APIFY_API_TOKEN yok).', code: 'NO_APIFY_TOKEN', requestId },
            { status: 503 }
        );
    }

    let body: Partial<FollowerCheckRequest> = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON', code: 'MALFORMED_PAYLOAD', requestId }, { status: 400 });
    }

    const channelUsername = typeof body.channelUsername === 'string' ? body.channelUsername.trim() : '';
    const usernames = Array.isArray(body.usernames) ? body.usernames : [];
    if (!channelUsername || usernames.length === 0) {
        return NextResponse.json(
            { error: 'Channel username and usernames are required', code: 'MALFORMED_PAYLOAD', requestId },
            { status: 400 }
        );
    }

    try {
        const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

        // Use TikTok Followers Scraper to get the followers of the channel
        // We'll check if the winner usernames are in the follower list
        const run = await client.actor('clockworks/tiktok-scraper').call({
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

        logTikTokEvent('followers_success', {
            requestId,
            durationMs: Date.now() - started,
            followerCount: followerUsernames.size,
            checkedCount: usernames.length,
        });

        return NextResponse.json({
            results,
            followerCount: followerUsernames.size,
            requestId,
        });
    } catch (error) {
        logTikTokEvent('followers_error', {
            requestId,
            durationMs: Date.now() - started,
            errors: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
        });
        // Return unknown status for all users if the check fails
        return NextResponse.json(
            {
                error: 'Could not verify follower status. This feature may not be available for all accounts.',
                code: 'SCRAPER_UNAVAILABLE',
                requestId,
            },
            { status: 500 }
        );
    }
}
