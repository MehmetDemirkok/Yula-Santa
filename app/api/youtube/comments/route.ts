import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Validation for API Key
        if (!process.env.YOUTUBE_API_KEY) {
            console.error('YOUTUBE_API_KEY is not defined in environment variables');
            return NextResponse.json({ error: 'Server configuration error: YouTube API Key missing' }, { status: 500 });
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { videoId } = body;

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID gerekli' }, { status: 400 });
        }

        const apiKey = process.env.YOUTUBE_API_KEY;

        let allParticipants: { name: string, comment: string }[] = [];
        let nextPageToken = '';
        let pageCount = 0;
        const MAX_PAGES = 100; // Limit pages to avoid timeouts

        do {
            // Request 'snippet' for top-level and 'replies' for nested comments
            const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=100&key=${apiKey}&textFormat=plainText${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

            const response = await fetch(apiUrl);

            if (!response.ok) {
                const data = await response.json();
                console.error('YouTube API Error:', JSON.stringify(data, null, 2));

                // Detailed error message
                const errorMessage = data.error?.message || 'YouTube API hatası';

                if (pageCount === 0) {
                    return NextResponse.json({ error: errorMessage }, { status: response.status });
                }
                break;
            }

            const data = await response.json();

            // Extract authors and comments
            const pageParticipants: { name: string, comment: string }[] = [];

            if (data.items) {
                for (const item of data.items) {
                    // Top level comment
                    const topLevelSnippet = item.snippet?.topLevelComment?.snippet;
                    if (topLevelSnippet) {
                        pageParticipants.push({
                            name: topLevelSnippet.authorDisplayName,
                            comment: topLevelSnippet.textDisplay
                        });
                    }

                    // Replies
                    if (item.replies && item.replies.comments) {
                        for (const reply of item.replies.comments) {
                            if (reply.snippet) {
                                pageParticipants.push({
                                    name: reply.snippet.authorDisplayName,
                                    comment: reply.snippet.textDisplay
                                });
                            }
                        }
                    }
                }
            }

            allParticipants = [...allParticipants, ...pageParticipants];
            nextPageToken = data.nextPageToken;
            pageCount++;

        } while (nextPageToken && pageCount < MAX_PAGES);

        // Remove duplicates based on name
        const uniqueParticipants = allParticipants.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

        return NextResponse.json({
            participants: uniqueParticipants,
            count: uniqueParticipants.length,
            totalFetched: allParticipants.length
        });
    } catch (error) {
        console.error('Server Error in YouTube route:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 });
    }
}
