import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const url = req.nextUrl.searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        // Only allow Instagram CDN URLs for security
        const allowedHosts = [
            'instagram.com',
            'cdninstagram.com',
            'fbcdn.net',
            'instagram.fist1-1.fna.fbcdn.net',
            'fbsbx.com' // Facebook/Instagram static content
        ];

        const isAllowed = allowedHosts.some(host =>
            parsedUrl.hostname.includes(host)
        );

        if (!isAllowed) {
            console.warn(`Proxy Image blocked: Hostname ${parsedUrl.hostname} not allowed`);
            return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
        }

        // Fetch the image
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': 'https://www.instagram.com/',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch image' },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const imageBuffer = await response.arrayBuffer();

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Proxy Image Error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy image' },
            { status: 500 }
        );
    }
}
