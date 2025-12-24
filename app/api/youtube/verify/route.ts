import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        if (!process.env.YOUTUBE_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error: YouTube API Key missing' }, { status: 500 });
        }

        const body = await request.json();
        const { channelId, videoOwnerChannelId } = body;

        if (!channelId || !videoOwnerChannelId) {
            return NextResponse.json({ error: 'Missing channel IDs' }, { status: 400 });
        }

        const apiKey = process.env.YOUTUBE_API_KEY;

        // Cekilis yapan kanala (videoOwnerChannelId) oteki kanalin (channelId) abone olup olmadigini kontrol et
        // subscriptions endpointini kullaniyoruz
        // channelId = abonesini kontrol edecegimiz kisi
        // forChannelId = abone olunan kanal
        const apiUrl = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&channelId=${channelId}&forChannelId=${videoOwnerChannelId}&key=${apiKey}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const data = await response.json();

            // 403 Forbidden means the user's subscription list is private
            if (response.status === 403) {
                return NextResponse.json({ isSubscribed: 'private' });
            }

            console.error('YouTube Sub Check Error:', data);
            // Eger hata donerse (orn. 403 forbidden vs), false donelim ya da null
            return NextResponse.json({ isSubscribed: false, error: data.error?.message });
        }

        const data = await response.json();
        const isSubscribed = data.items && data.items.length > 0;

        return NextResponse.json({ isSubscribed });

    } catch (error) {
        console.error('Server Error in YouTube verify route:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 });
    }
}
