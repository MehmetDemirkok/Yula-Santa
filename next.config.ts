import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Next.js Configuration with next-intl
 * ═══════════════════════════════════════════════════════════════════════════
 */

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn-us.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
