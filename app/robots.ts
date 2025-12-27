/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Robots.txt Configuration - SEO Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file generates an advanced robots.txt with:
 * - Clear crawl directives for all search engines
 * - Proper disallow rules for private/API routes
 * - Sitemap location for easy discovery
 * - Crawl delay recommendations
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/result',
                    '/_next/',
                    '/private/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/result'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/result'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
