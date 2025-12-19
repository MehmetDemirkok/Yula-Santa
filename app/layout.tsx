import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://yulasanta.com";

// AdSense Publisher ID - Replace with your actual ID after AdSense approval
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX";

export const metadata: Metadata = {
  title: "YulaSanta - Online Secret Santa Draw | Yılbaşı Çekilişi",
  description: "Create free, ad-free online Secret Santa draws with friends, family, or colleagues in seconds! Arkadaşlarınızla ücretsiz yılbaşı çekilişi yapın!",
  keywords: [
    // Turkish
    "yılbaşı çekilişi", "secret santa", "hediye çekilişi", "online çekiliş", "yılbaşı hediyesi",
    // English
    "secret santa generator", "gift exchange", "christmas draw", "holiday gift swap",
    // German
    "wichteln online", "geschenkaustausch", "weihnachtsziehung",
    // Spanish
    "amigo invisible", "intercambio de regalos",
    // French
    "père noël secret", "échange de cadeaux"
  ],
  authors: [{ name: "YulaSanta Team" }],
  creator: "YulaSanta Team",
  publisher: "YulaSanta",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'tr': `${SITE_URL}?lang=tr`,
      'en': `${SITE_URL}?lang=en`,
      'de': `${SITE_URL}?lang=de`,
      'fr': `${SITE_URL}?lang=fr`,
      'es': `${SITE_URL}?lang=es`,
      'it': `${SITE_URL}?lang=it`,
      'pt': `${SITE_URL}?lang=pt`,
      'ru': `${SITE_URL}?lang=ru`,
      'ar': `${SITE_URL}?lang=ar`,
      'ja': `${SITE_URL}?lang=ja`,
      'ko': `${SITE_URL}?lang=ko`,
      'zh': `${SITE_URL}?lang=zh`,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US", "de_DE", "fr_FR", "es_ES", "it_IT", "pt_PT", "ru_RU", "ar_SA", "ja_JP", "ko_KR", "zh_CN"],
    url: SITE_URL,
    title: "YulaSanta - Online Secret Santa Draw",
    description: "Create free Secret Santa draws with friends, family, or colleagues in seconds!",
    siteName: "YulaSanta",
  },
  twitter: {
    card: "summary_large_image",
    title: "YulaSanta - Online Secret Santa Draw",
    description: "Create free Secret Santa draws with friends, family, or colleagues in seconds!",
  },
  // Verification for AdSense
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE", // Add your verification code here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Hreflang tags for SEO - helps Google show correct language based on user location */}
        <link rel="alternate" hrefLang="tr" href={`${SITE_URL}?lang=tr`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}?lang=en`} />
        <link rel="alternate" hrefLang="de" href={`${SITE_URL}?lang=de`} />
        <link rel="alternate" hrefLang="fr" href={`${SITE_URL}?lang=fr`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}?lang=es`} />
        <link rel="alternate" hrefLang="it" href={`${SITE_URL}?lang=it`} />
        <link rel="alternate" hrefLang="pt" href={`${SITE_URL}?lang=pt`} />
        <link rel="alternate" hrefLang="ru" href={`${SITE_URL}?lang=ru`} />
        <link rel="alternate" hrefLang="ar" href={`${SITE_URL}?lang=ar`} />
        <link rel="alternate" hrefLang="ja" href={`${SITE_URL}?lang=ja`} />
        <link rel="alternate" hrefLang="ko" href={`${SITE_URL}?lang=ko`} />
        <link rel="alternate" hrefLang="zh" href={`${SITE_URL}?lang=zh`} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

        {/* Google AdSense Script */}
        <Script
          id="google-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
