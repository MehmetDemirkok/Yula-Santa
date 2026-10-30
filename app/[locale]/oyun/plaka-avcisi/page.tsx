import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { SITE_URL } from '@/lib/constants';
import { getSEOMetadata, viewport } from '@/lib/seo';
import PlakaAvcisiClient from './PlakaAvcisiClient';

export { viewport };

type Props = {
    params: Promise<{ locale: string }>;
};

const PATH = '/oyun/plaka-avcisi';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: PATH,
        translationKey: 'tools.plakaAvcisiMeta',
    });
}

function getJsonLd(locale: string) {
    const prefix = locale === 'tr' ? '' : `/${locale}`;
    const pageUrl = `${SITE_URL}${prefix}${PATH}`;
    const home = locale === 'tr' ? 'Ana Sayfa' : 'Home';
    const tools = locale === 'tr' ? 'Araçlar' : 'Tools';

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebApplication',
                '@id': `${pageUrl}#game`,
                name: 'Plaka Avcısı',
                url: pageUrl,
                applicationCategory: 'GameApplication',
                operatingSystem: 'Web',
                inLanguage: 'tr-TR',
                description:
                    'Türkiye’nin 81 ilinin plaka kodlarını öğreten dört modlu bilgi yarışması: plakadan şehri bul, şehirden plakayı bul, zamana karşı ve ipuçlarından şehri bul.',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
                isAccessibleForFree: true,
                publisher: {
                    '@type': 'Organization',
                    name: 'YulaSanta',
                    url: SITE_URL,
                },
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${pageUrl}#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        item: { '@id': `${SITE_URL}${prefix}`, name: home },
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        item: { '@id': `${SITE_URL}${prefix}/tools`, name: tools },
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        item: { '@id': pageUrl, name: 'Plaka Avcısı' },
                    },
                ],
            },
        ],
    };
}

export default async function PlakaAvcisiPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const jsonLd = getJsonLd(locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PlakaAvcisiClient locale={locale} />
        </>
    );
}
