
import { Suspense } from 'react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import ClientPage from './ClientPage';
import GiveawaySeoSection from '@/components/seo/GiveawaySeoSection';

// Generate static paths for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return getSEOMetadata({
        locale,
        path: '/tiktok',
        translationKey: 'giveaway.meta.tiktok'
    });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <>
            <Suspense fallback={null}>
                <ClientPage key={locale} />
            </Suspense>
            <GiveawaySeoSection locale={locale} platform="tiktok" />
        </>
    );
}
