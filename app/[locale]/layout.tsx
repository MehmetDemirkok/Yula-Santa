/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Root Layout for Localized Pages
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This layout wraps all pages under /[locale]/ and provides:
 * - Localized metadata (title, description)
 * - Correct HTML lang attribute
 * - RTL support for Arabic
 * - next-intl provider
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from "next/script";
import "../globals.css";
import { locales, getDirection, type Locale } from '@/i18n/config';

import { SITE_URL } from "@/lib/constants";
import { ClientLayout } from "./ClientLayout";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1407870205867199";

// Generate static params for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

// Generate metadata for each locale
export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params;

    // Load messages for metadata
    let messages;
    try {
        messages = (await import(`@/messages/${locale}.json`)).default;
    } catch {
        messages = (await import(`@/messages/tr.json`)).default;
    }

    const meta = messages.meta;



    return {
        metadataBase: new URL(SITE_URL),
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,

        manifest: '/manifest.json',
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

        openGraph: {
            type: "website",
            locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
            url: `${SITE_URL}/${locale}`,
            title: meta.title,
            description: meta.description,
            siteName: "YulaSanta",
            images: [
                {
                    url: '/opengraph-image.png',
                    width: 1200,
                    height: 630,
                    alt: meta.title,
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: meta.title,
            description: meta.description,
            images: ['/twitter-image.png'],
        },
    };
}

// JSON-LD structured data
function getJsonLd(locale: string, messages: Record<string, any>) {
    const organizationSchema = {
        "@type": "Organization",
        "name": "YulaSanta",
        "url": SITE_URL,
        "logo": `${SITE_URL}/icon-512.png`,
    };

    const appSchema = {
        "@type": "SoftwareApplication",
        "name": "YulaSanta",
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "Any",
        "inLanguage": locale,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": messages.meta.description,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1250"
        },
        "featureList": [
            "Secret Santa Generator",
            "Instagram Comment Picker",
            "YouTube Comment Picker",
            "TikTok Comment Picker",
            "Twitter Giveaway Tool",
            "No Login Required",
            "Free to use"
        ]
    };

    return {
        "@context": "https://schema.org",
        "@graph": [
            organizationSchema,
            appSchema
        ]
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Get messages for this locale
    const messages = await getMessages();

    // Get text direction
    const dir = getDirection(locale as Locale);

    // Get JSON-LD
    const jsonLd = getJsonLd(locale, messages);

    return (
        <html lang={locale} dir={dir} suppressHydrationWarning>
            <head>
                {/* Schema.org Structured Data */}
                <Script
                    id="json-ld"
                    type="application/ld+json"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

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
                <NextIntlClientProvider messages={messages}>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
