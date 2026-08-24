import { Suspense } from 'react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import ClientPage from './ClientPage';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_URL, TIKTOK_CHROME_EXTENSION_URL } from '@/lib/constants';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tiktok/extension',
        translationKey: 'giveaway.meta.tiktokExtension',
    });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const localePath = locale === 'tr' ? '' : `/${locale}`;
    const pageUrl = `${SITE_URL}${localePath}/tiktok/extension`;

    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'YulaSanta — TikTok Çekiliş Yardımcısı',
        applicationCategory: 'BrowserApplication',
        operatingSystem: 'Chrome',
        url: pageUrl,
        installUrl: TIKTOK_CHROME_EXTENSION_URL,
        downloadUrl: TIKTOK_CHROME_EXTENSION_URL,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: locale === 'tr' ? 'Ana Sayfa' : 'Home',
                item: locale === 'tr' ? SITE_URL : `${SITE_URL}/${locale}`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: locale === 'tr' ? 'TikTok Çekilişi' : 'TikTok Giveaway',
                item: `${SITE_URL}${localePath}/tiktok`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: 'Chrome Extension',
                item: pageUrl,
            },
        ],
    };

    return (
        <Suspense fallback={<div className="min-h-[60vh]" />}>
            <JsonLd data={softwareSchema} />
            <JsonLd data={breadcrumbJsonLd} />
            <ClientPage />
        </Suspense>
    );
}
