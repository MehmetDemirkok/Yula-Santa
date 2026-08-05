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
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from "next/script";
import "../globals.css";
import { locales, getDirection, type Locale } from '@/i18n/config';

import { SITE_URL } from "@/lib/constants";
import { ClientLayout } from "./ClientLayout";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-jakarta",
    subsets: ["latin"],
    weight: ["600", "700", "800"],
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

        icons: {
            icon: [
                { url: '/favicon.ico', sizes: 'any' },
                { url: '/icon.png', type: 'image/png', sizes: '512x512' },
                { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
            ],
            shortcut: '/favicon.ico',
            apple: [
                { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            ],
            other: [
                {
                    rel: 'mask-icon',
                    url: '/icon-512.png',
                },
            ],
        },
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
            locale: ({
                tr: 'tr_TR', en: 'en_US', de: 'de_DE', fr: 'fr_FR', es: 'es_ES',
                it: 'it_IT', pt: 'pt_BR', ru: 'ru_RU', ar: 'ar_SA', ja: 'ja_JP',
                ko: 'ko_KR', zh: 'zh_CN',
            } as Record<string, string>)[locale] || 'en_US',
            url: locale === 'tr' ? `${SITE_URL}` : `${SITE_URL}/${locale}`,
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
        alternates: {
            canonical: locale === 'tr' ? `${SITE_URL}` : `${SITE_URL}/${locale}`,
            languages: locales.reduce((acc, loc) => {
                acc[loc] = loc === 'tr' ? `${SITE_URL}` : `${SITE_URL}/${loc}`;
                return acc;
            }, { 'x-default': `${SITE_URL}` } as Record<string, string>),
        },
    };
}

// JSON-LD structured data - SEO Optimized
function getJsonLd(locale: string, messages: Record<string, any>) {
    const localeMap: Record<string, string> = {
        tr: 'tr-TR',
        en: 'en-US',
        de: 'de-DE',
        fr: 'fr-FR',
        es: 'es-ES',
        it: 'it-IT',
        pt: 'pt-BR',
        ru: 'ru-RU',
        ar: 'ar-SA',
        ja: 'ja-JP',
        ko: 'ko-KR',
        zh: 'zh-CN'
    };

    // WebSite Schema (without SearchAction since site doesn't have search functionality)
    const websiteSchema = {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "YulaSanta",
        "description": messages.meta?.description || "Online Çekiliş ve Yılbaşı Hediye Eşleştirme Platformu",
        "publisher": {
            "@id": `${SITE_URL}/#organization`
        },
        "inLanguage": localeMap[locale] || locale
    };

    // Organization Schema - Google Knowledge Panel için optimize edilmiş
    const organizationSchema = {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "YulaSanta",
        "alternateName": ["Yula Santa", "YulaSanta.com.tr"],
        "url": SITE_URL,
        "logo": {
            "@type": "ImageObject",
            "@id": `${SITE_URL}/#logo`,
            "inLanguage": "tr-TR",
            "url": `${SITE_URL}/icon-512.png`,
            "secureUrl": `${SITE_URL}/icon-512.png`,
            "contentUrl": `${SITE_URL}/icon-512.png`,
            "width": 512,
            "height": 512,
            "caption": "YulaSanta Logo",
            "encodingFormat": "image/png"
        },
        "image": [
            {
                "@type": "ImageObject",
                "@id": `${SITE_URL}/#primaryimage`,
                "url": `${SITE_URL}/icon-512.png`,
                "contentUrl": `${SITE_URL}/icon-512.png`,
                "width": 512,
                "height": 512,
                "encodingFormat": "image/png"
            },
            {
                "@type": "ImageObject",
                "url": `${SITE_URL}/opengraph-image.png`,
                "contentUrl": `${SITE_URL}/opengraph-image.png`,
                "width": 1200,
                "height": 630,
                "encodingFormat": "image/png"
            }
        ],
        "sameAs": [],
        "foundingDate": "2024",
        "description": messages.meta?.description || "YulaSanta - Ücretsiz Online Çekiliş ve Secret Santa Platformu"
    };

    // WebPage Schema
    const webPageSchema = {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${locale === 'tr' ? '' : locale + '/'}#webpage`,
        "url": locale === 'tr' ? `${SITE_URL}` : `${SITE_URL}/${locale}`,
        "name": messages.meta?.title || "YulaSanta",
        "isPartOf": {
            "@id": `${SITE_URL}/#website`
        },
        "about": {
            "@id": `${SITE_URL}/#organization`
        },
        "description": messages.meta?.description,
        "inLanguage": localeMap[locale] || locale,
        "potentialAction": [
            {
                "@type": "ReadAction",
                "target": [locale === 'tr' ? `${SITE_URL}` : `${SITE_URL}/${locale}`]
            }
        ]
    };

    // SoftwareApplication Schema
    const appSchema = {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#application`,
        "name": "YulaSanta",
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "Any",
        "inLanguage": localeMap[locale] || locale,
        "url": SITE_URL,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock"
        },
        "description": messages.meta?.description,
        "author": {
            "@id": `${SITE_URL}/#organization`
        },
        "featureList": [
            "Secret Santa Generator",
            "Instagram Comment Picker",
            "YouTube Comment Picker",
            "TikTok Comment Picker",
            "Twitter Giveaway Tool",
            "Dice Roller",
            "Coin Flip",
            "Random Number Generator",
            "Short Straw Game",
            "No Login Required",
            "Free to use",
            "Multi-language Support"
        ],
        "screenshot": `${SITE_URL}/opengraph-image.png`
    };

    // FAQ Schema - Helps with rich snippets (include every qN/aN pair present)
    const faq = messages.meta?.faq ?? {};
    const faqEntities = [];
    for (let i = 1; i <= 20; i++) {
        const q = faq[`q${i}`];
        const a = faq[`a${i}`];
        if (!q || !a) break;
        faqEntities.push({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a }
        });
    }
    const faqSchema = {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/${locale === 'tr' ? '' : locale + '/'}#faq`,
        "mainEntity": faqEntities
    };

    // BreadcrumbList Schema
    const breadcrumbSchema = {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/${locale === 'tr' ? '' : locale + '/'}#breadcrumb`,
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@id": locale === 'tr' ? `${SITE_URL}` : `${SITE_URL}/${locale}`,
                    "name": messages.meta?.faq?.breadcrumbHome ?? "Home"
                }
            }
        ]
    };

    return {
        "@context": "https://schema.org",
        "@graph": [
            websiteSchema,
            organizationSchema,
            webPageSchema,
            appSchema,
            faqSchema,
            breadcrumbSchema
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
                <script
                    id="json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* Google AdSense Account Verification */}
                <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />

                {/* Google AdSense Script */}
                <Script
                    async
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
            </head>
            <body
                className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
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
