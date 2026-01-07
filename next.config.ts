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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'instagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.instagram.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
