
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import ProfilePictureClient from './ProfilePictureClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/instagram-profile-picture',
        translationKey: 'tools.instagramProfileMeta'
    });
}

export default function Page() {
    return <ProfilePictureClient />;
}
