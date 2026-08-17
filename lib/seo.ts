
import { Metadata, Viewport } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { SITE_URL } from '@/lib/constants';

// Standard viewport for all pages
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#EF4444',
};

/** Open Graph locale tags (language_TERRITORY) */
export const OG_LOCALES: Record<string, string> = {
    tr: 'tr_TR',
    en: 'en_US',
    de: 'de_DE',
    fr: 'fr_FR',
    es: 'es_ES',
    it: 'it_IT',
    pt: 'pt_BR',
    ru: 'ru_RU',
    ar: 'ar_SA',
    ja: 'ja_JP',
    ko: 'ko_KR',
    zh: 'zh_CN',
};

interface SEOProps {
    locale: string;
    path: string; // e.g., '', '/youtube', '/tiktok'
    translationKey?: string; // Key in messages.json (e.g., 'giveaway.meta.youtube')
    titleOverride?: string;
    descriptionOverride?: string;
    keywordsOverride?: string[];
    noIndex?: boolean;
}

export async function getSEOMetadata({
    locale,
    path,
    translationKey,
    titleOverride,
    descriptionOverride,
    keywordsOverride,
    noIndex = false
}: SEOProps): Promise<Metadata> {
    // Dynamically import messages for the locale
    let messages;
    try {
        messages = (await import(`@/messages/${locale}.json`)).default;
    } catch {
        messages = (await import(`@/messages/${defaultLocale}.json`)).default;
    }

    let title, description, keywords;

    if (titleOverride) {
        title = titleOverride;
        description = descriptionOverride;
        keywords = keywordsOverride;
    } else if (translationKey) {
        // Support nested keys like 'giveaway.meta.youtube'
        const keys = translationKey.split('.');
        let current = messages;
        for (const key of keys) {
            current = current?.[key];
        }

        title = current?.title || messages.meta?.title || 'YulaSanta';
        description = current?.description || messages.meta?.description || 'YouTube & TikTok comment giveaways, Secret Santa and free tools';
        keywords = current?.keywords || messages.meta?.keywords || [];
    } else {
        // Fallback to meta global
        title = messages.meta?.title || 'YulaSanta';
        description = messages.meta?.description || 'YouTube & TikTok comment giveaways, Secret Santa and free tools';
        keywords = messages.meta?.keywords || [];
    }

    // Construct alternates
    const languages: Record<string, string> = {};
    locales.forEach((loc) => {
        languages[loc] = loc === defaultLocale
            ? `${SITE_URL}${path}`
            : `${SITE_URL}/${loc}${path}`;
    });

    languages['x-default'] = `${SITE_URL}${path}`;

    const canonicalUrl = locale === defaultLocale
        ? `${SITE_URL}${path}`
        : `${SITE_URL}/${locale}${path}`;

    return {
        title,
        description,
        keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
        robots: noIndex ? 'noindex, nofollow' : {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: canonicalUrl,
            languages,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            locale: OG_LOCALES[locale] || locale,
            siteName: 'YulaSanta',
            type: 'website',
            images: [
                {
                    url: `${SITE_URL}/opengraph-image.png`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${SITE_URL}/opengraph-image.png`],
            creator: '@yulasanta',
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
    };
}
