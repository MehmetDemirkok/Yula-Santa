import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

interface ProfileResponse {
    username: string;
    fullName: string;
    biography: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
    profilePicUrl: string;
    profilePicUrlHD: string;
    isPrivate: boolean;
    isVerified: boolean;
}

export async function POST(req: NextRequest) {
    try {
        // Validate API Token
        if (!process.env.APIFY_API_TOKEN) {
            console.error('APIFY_API_TOKEN is not defined in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error: Apify API Token missing' },
                { status: 500 }
            );
        }

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

        // Clean the username (remove @ if present)
        const cleanUsername = username.replace(/^@/, '').trim();

        if (!cleanUsername) {
            return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
        }

        const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        // Use the Instagram Profile Scraper actor
        const run = await client.actor("apify/instagram-profile-scraper").call({
            usernames: [cleanUsername],
            resultsLimit: 1,
        });

        if (!run) {
            console.error('Apify actor run failed to start');
            return NextResponse.json(
                { error: 'Failed to start Instagram scraper' },
                { status: 500 }
            );
        }

        // Fetch results from the run's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'Profile not found or account is private' },
                { status: 404 }
            );
        }

        const profile = items[0] as Record<string, unknown>;

        // Check if profile data exists
        if (!profile.profilePicUrl && !profile.profilePicUrlHD) {
            return NextResponse.json(
                { error: 'Could not fetch profile picture' },
                { status: 404 }
            );
        }

        const response: ProfileResponse = {
            username: (profile.username as string) || cleanUsername,
            fullName: (profile.fullName as string) || '',
            biography: (profile.biography as string) || '',
            followersCount: (profile.followersCount as number) || 0,
            followsCount: (profile.followsCount as number) || 0,
            postsCount: (profile.postsCount as number) || 0,
            profilePicUrl: (profile.profilePicUrl as string) || '',
            profilePicUrlHD: (profile.profilePicUrlHD as string) || (profile.profilePicUrl as string) || '',
            isPrivate: (profile.private as boolean) || false,
            isVerified: (profile.verified as boolean) || false,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Instagram Profile Fetch Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}
