
import { Metadata } from 'next';
import { locales, defaultLocale, Locale } from '@/i18n/config';
import { SITE_URL } from '@/lib/constants';

interface SEOProps {
    locale: string;
    path: string; // e.g., '', '/youtube', '/instagram'
    translationKey?: string; // Key in messages.json
    titleOverride?: string;
    descriptionOverride?: string;
}

export async function getSEOMetadata({ locale, path, translationKey, titleOverride, descriptionOverride }: SEOProps): Promise<Metadata> {
    // Dynamically import messages for the locale
    let messages;
    try {
        messages = (await import(`@/messages/${locale}.json`)).default;
    } catch (error) {
        messages = (await import(`@/messages/${defaultLocale}.json`)).default;
    }

    let title, description;

    if (titleOverride) {
        title = titleOverride;
        description = descriptionOverride;
    } else if (translationKey) {
        const t = messages[translationKey];
        title = t?.meta?.title || t?.title || 'YulaSanta';
        description = t?.meta?.description || t?.description || 'Best Secret Santa App';
    } else {
        // Fallback to meta global
        title = messages.meta?.title || 'YulaSanta';
        description = messages.meta?.description || 'Best Secret Santa App';
    }

    // Construct alternates
    const languages: Record<string, string> = {};
    locales.forEach((loc) => {
        languages[loc] = `${SITE_URL}/${loc}${path}`;
    });

    // x-default: usually points to the root of the content (generic URL) 
    // or the default locale version.
    // For consistency with sitemap (which I will also fix), let's point to the default locale version 
    // OR just use the site url + path if we assume auto-redirect.
    // Google recommends x-default to be the auto-redirecting page.
    // Since our middleware redirects /youtube -> /tr/youtube, 
    // x-default should be https://www.yulasanta.com.tr/youtube

    languages['x-default'] = `${SITE_URL}${path}`;

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/${locale}${path}`,
            languages,
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}${path}`,
            locale: locale,
            // Images usually cascade from layout, but can be overridden
        },
        twitter: {
            title,
            description,
        }
    };
}
