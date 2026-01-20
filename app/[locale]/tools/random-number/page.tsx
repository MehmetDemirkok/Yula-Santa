
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import RandomNumberClient from './RandomNumberClient';

// Generate static paths for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

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
