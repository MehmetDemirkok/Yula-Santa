
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import StoryViewerClient from './StoryViewerClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/instagram-story-viewer',
        translationKey: 'tools.instagramStoryMeta'
    });
}

export default function Page() {
    return <StoryViewerClient />;
}
