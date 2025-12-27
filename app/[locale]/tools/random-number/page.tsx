
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import RandomNumberClient from './RandomNumberClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/random-number',
        translationKey: 'tools.randomNumberMeta'
    });
}

export default function Page() {
    return <RandomNumberClient />;
}
