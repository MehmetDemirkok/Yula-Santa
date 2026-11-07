import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';
import LeaderboardClient from './LeaderboardClient';

export { viewport };

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tablo?: string | string[] }>;
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/oyun/plaka-avcisi/liderlik',
        translationKey: 'tools.plakaAvcisiMeta',
        // Live rankings add no unique indexable content — keep it out of search.
        noIndex: true,
    });
}

export default async function PlakaLeaderboardPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { tablo } = await searchParams;
    setRequestLocale(locale);
    return (
        <LeaderboardClient
            locale={locale}
            initialPeriod={tablo === 'meydan' ? 'challenge' : 'daily'}
        />
    );
}
