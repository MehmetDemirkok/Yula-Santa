import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { videoId } = await request.json();

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID gerekli' }, { status: 400 });
        }

        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API anahtarı bulunamadı' }, { status: 500 });
        }

        let allParticipants: string[] = [];
        let nextPageToken = '';
        let pageCount = 0;
        const MAX_PAGES = 100; // ~10,000 top-level comments + their replies

        do {
            // Request 'snippet' for top-level and 'replies' for nested comments
            const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=100&key=${apiKey}&textFormat=plainText${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

            const response = await fetch(apiUrl);

            if (!response.ok) {
                const data = await response.json();
                console.error('YouTube API Error:', data);
                // If we have some comments, return them instead of failing completely, or throw?
                // For now, if it fails on the first page, return error. If later, maybe break?
                if (pageCount === 0) {
                    return NextResponse.json({ error: data.error?.message || 'YouTube API hatası' }, { status: response.status });
                }
                break;
            }

            const data = await response.json();

            // Extract authors from top-level comments and their replies
            const pageParticipants: string[] = [];

            for (const item of data.items) {
                // Top level comment
                const topLevelSnippet = item.snippet.topLevelComment.snippet;
                if (topLevelSnippet) {
                    pageParticipants.push(topLevelSnippet.authorDisplayName);
                }

                // Replies (if any)
                if (item.replies && item.replies.comments) {
                    for (const reply of item.replies.comments) {
                        if (reply.snippet) {
                            pageParticipants.push(reply.snippet.authorDisplayName);
                        }
                    }
                }
            }

            allParticipants = [...allParticipants, ...pageParticipants];
            nextPageToken = data.nextPageToken;
            pageCount++;

        } while (nextPageToken && pageCount < MAX_PAGES);

        // Remove duplicates
        const uniqueParticipants = [...new Set(allParticipants)];

        return NextResponse.json({
            participants: uniqueParticipants,
            count: uniqueParticipants.length,
            totalFetched: allParticipants.length
        });
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 });
    }
}
