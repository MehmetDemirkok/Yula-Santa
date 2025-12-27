/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Edge Middleware - Locale Detection & Routing
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This middleware runs on the Vercel Edge network for ultra-fast locale detection.
 * 
 * DETECTION PRIORITY:
 * 1. URL path (/en, /tr, /de, etc.)
 * 2. Cookie (NEXT_LOCALE)
 * 3. Accept-Language header (browser preference)
 * 4. Default locale (tr)
 * 
 * SEO BENEFITS:
 * - Clean URL-based routing (/en/youtube, /tr/instagram)
 * - No query parameters
 * - Proper redirects (301 for SEO)
 * - No duplicate content issues
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
    // Supported locales
    locales,

    // Default locale when none is detected
    defaultLocale,

    // Prefix the default locale in the URL
    // 'always' = /tr/page, /en/page
    // 'as-needed' = /page (for tr), /en/page
    localePrefix: 'always',

    // Cookie name for persisting locale preference
    localeCookie: {
        name: 'NEXT_LOCALE'
    },

    // Detect locale from Accept-Language header
    localeDetection: true,
});

export const config = {
    // Match all pathnames except:
    // - API routes (/api/...)
    // - Static files (_next/static, favicon.ico, etc.)
    // - Tools (standalone pages without locale prefix)
    matcher: [
        // Match all pathnames except those starting with:
        // - api (API routes)
        // - _next (Next.js internals)
        // - _vercel (Vercel internals)
        // - tools (standalone tools pages)
        // - favicon.ico, sitemap.xml, robots.txt (static files)
        '/((?!api|_next|_vercel|.*\\.png|.*\\.ico|.*\\.json|.*\\.txt|sitemap\\.xml|robots\\.txt).*)',
    ]
};
