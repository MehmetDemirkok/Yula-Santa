import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Next.js Configuration with next-intl
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This configuration enables:
 * - Internationalization with next-intl
 * - Static generation for all locales
 * - Proper routing for /[locale]/ paths
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
