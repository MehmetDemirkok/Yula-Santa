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
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from "next/script";
import "../globals.css";
import { locales, localeNames, getDirection, type Locale } from '@/i18n/config';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const SITE_URL = "https://yulasanta.com";
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

    // Build alternate language URLs
    const languages: Record<string, string> = {};
    locales.forEach((loc) => {
        languages[loc] = `${SITE_URL}/${loc}`;
    });
    languages['x-default'] = `${SITE_URL}/tr`;

    return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        icons: {
            icon: '/icon.png',
            apple: '/icon.png',
        },
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
            canonical: `${SITE_URL}/${locale}`,
            languages,
        },
        openGraph: {
            type: "website",
            locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
            url: `${SITE_URL}/${locale}`,
            title: meta.title,
            description: meta.description,
            siteName: "YulaSanta",
        },
        twitter: {
            card: "summary_large_image",
            title: meta.title,
            description: meta.description,
        },
    };
}

// JSON-LD structured data
function getJsonLd(locale: string, messages: any) {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "YulaSanta",
        "applicationCategory": "Utility",
        "operatingSystem": "Browser",
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
            "Secret Santa generator",
            "Instagram Giveaway",
            "YouTube Giveaway",
            "Twitter Giveaway",
            "Free to use"
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

                {/* Hreflang tags for SEO */}
                {locales.map((loc) => (
                    <link
                        key={loc}
                        rel="alternate"
                        hrefLang={loc}
                        href={`${SITE_URL}/${loc}`}
                    />
                ))}
                <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/tr`} />

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
                    {children}
                </NextIntlClientProvider>
                <Analytics />
            </body>
        </html>
    );
}
