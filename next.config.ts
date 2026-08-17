import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Next.js Configuration with next-intl
 * ═══════════════════════════════════════════════════════════════════════════
 */

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    const locale = ':locale(en|de|fr|es|it|pt|ru|ar|ja|ko|zh)';
    return [
      { source: '/isim-cekilisi', destination: '/raffle', permanent: true },
      { source: `/${locale}/isim-cekilisi`, destination: '/:locale/raffle', permanent: true },
      { source: '/online-kura', destination: '/raffle', permanent: true },
      { source: `/${locale}/online-kura`, destination: '/:locale/raffle', permanent: true },
      { source: '/youtube-cekilis', destination: '/youtube', permanent: true },
      { source: `/${locale}/youtube-cekilis`, destination: '/:locale/youtube', permanent: true },
      { source: '/tiktok-cekilis', destination: '/tiktok', permanent: true },
      { source: `/${locale}/tiktok-cekilis`, destination: '/:locale/tiktok', permanent: true },
      { source: '/yilbasi-cekilisi', destination: '/secret-santa', permanent: true },
      { source: `/${locale}/yilbasi-cekilisi`, destination: '/:locale/secret-santa', permanent: true },
    ];
  },
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
