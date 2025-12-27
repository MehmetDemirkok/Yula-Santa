/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Advanced Multi-Language Sitemap Generator - SEO Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Generates a comprehensive SEO-optimized sitemap with:
 * - Separate URLs for each locale (/tr, /en, /de, etc.)
 * - Proper hreflang alternates for multi-language SEO
 * - All Tools pages included
 * - Correct priorities based on page importance
 * - Proper change frequencies
 * 
 * HOW IT WORKS:
 * - Each route gets a URL for every supported locale
 * - Google sees /tr/youtube and /en/youtube as separate pages
 * - Tools pages are included for better indexing
 * 
 * GOOGLE SEARCH CONSOLE:
 * - Submit sitemap.xml to GSC
 * - Google will index each language version separately
 * - Tools will appear in search results for relevant queries
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { SITE_URL } from '@/lib/constants';

// Main locale-based routes (under /[locale]/)
const localeRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/youtube', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/instagram', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/twitter', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/tiktok', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/legal', priority: 0.3, changeFrequency: 'monthly' as const },
    // Tools routes (now localized)
    { path: '/tools/dice', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/tools/coin-flip', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/tools/random-number', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/tools/short-straw', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/tools/instagram-story-viewer', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/tools/instagram-profile-picture', priority: 0.85, changeFrequency: 'weekly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemap: MetadataRoute.Sitemap = [];
    const now = new Date();

    // Generate URLs for each locale route
    localeRoutes.forEach(route => {
        locales.forEach(locale => {
            // Build alternates object for hreflang
            const alternates: { languages: Record<string, string> } = {
                languages: {}
            };

            locales.forEach(altLocale => {
                alternates.languages[altLocale] = `${SITE_URL}/${altLocale}${route.path}`;
            });

            // Add x-default (generic URL that redirects based on locale)
            alternates.languages['x-default'] = `${SITE_URL}/${defaultLocale}${route.path}`;

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
