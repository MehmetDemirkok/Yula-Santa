
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import ShortStrawClient from './ShortStrawClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/short-straw',
        translationKey: 'tools.shortStrawMeta'
    });
}

export default function Page() {
    return <ShortStrawClient />;
}
