import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Next.js Configuration with next-intl
 * ═══════════════════════════════════════════════════════════════════════════
 */

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
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
      { source: '/plaka-avcisi', destination: '/oyun/plaka-avcisi', permanent: true },
      { source: `/${locale}/plaka-avcisi`, destination: '/:locale/oyun/plaka-avcisi', permanent: true },
      { source: '/mesafeli-satis-sozlesmesi', destination: '/legal', permanent: true },
      { source: `/${locale}/mesafeli-satis-sozlesmesi`, destination: '/:locale/legal', permanent: true },
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
