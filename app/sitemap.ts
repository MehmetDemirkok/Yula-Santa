/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Multi-Language Sitemap Generator
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Generates an SEO-optimized sitemap with:
 * - Separate URLs for each locale (/tr, /en, /de, etc.)
 * - Proper hreflang alternates
 * - Correct priorities
 * 
 * HOW IT WORKS:
 * - Each route gets a URL for every supported locale
 * - Google sees /tr/youtube and /en/youtube as separate pages
 * - No more query parameter issues (?lang=)
 * 
 * GOOGLE SEARCH CONSOLE:
 * - Submit sitemap.xml to GSC
 * - Google will index each language version separately
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { SITE_URL } from '@/lib/constants';

// All routes in the app (without locale prefix)
const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/youtube', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/instagram', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/twitter', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemap: MetadataRoute.Sitemap = [];
    const now = new Date();

    // Generate URLs for each route and locale
    routes.forEach(route => {
        locales.forEach(locale => {
            // Build alternates object for hreflang
            const alternates: { languages: Record<string, string> } = {
                languages: {}
            };

            locales.forEach(altLocale => {
                alternates.languages[altLocale] = `${SITE_URL}/${altLocale}${route.path}`;
            });

            // Add x-default (generic URL that redirects based on locale)
            alternates.languages['x-default'] = `${SITE_URL}${route.path}`;

            sitemap.push({
                url: `${SITE_URL}/${locale}${route.path}`,
                lastModified: now,
                changeFrequency: route.changeFrequency,
                priority: locale === defaultLocale ? route.priority : route.priority * 0.9,
                alternates,
            });
        });
    });

    return sitemap;
}
