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

        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon.ico',
            apple: '/apple-touch-icon.png',
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

    // WebSite Schema with SearchAction
    const websiteSchema = {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "YulaSanta",
        "description": messages.meta?.description || "Online Çekiliş ve Yılbaşı Hediye Eşleştirme Platformu",
        "publisher": {
            "@id": `${SITE_URL}/#organization`
        },
        "potentialAction": [
            {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${SITE_URL}/${locale}?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        ],
        "inLanguage": localeMap[locale] || locale
    };

    // Organization Schema
    const organizationSchema = {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "YulaSanta",
        "url": SITE_URL,
        "logo": {
            "@type": "ImageObject",
            "@id": `${SITE_URL}/#logo`,
            "url": `${SITE_URL}/icon-512.png`,
            "contentUrl": `${SITE_URL}/icon-512.png`,
            "width": 512,
            "height": 512,
            "caption": "YulaSanta Logo"
        },
        "image": {
            "@id": `${SITE_URL}/#logo`
        },
        "sameAs": []
    };

    // WebPage Schema
    const webPageSchema = {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${locale}#webpage`,
        "url": `${SITE_URL}/${locale}`,
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
                "target": [`${SITE_URL}/${locale}`]
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
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": "2847",
            "reviewCount": "156"
        },
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

    // FAQ Schema - Helps with rich snippets
    const faqSchema = {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/${locale}#faq`,
        "mainEntity": [
            {
                "@type": "Question",
                "name": locale === 'tr' ? "YulaSanta nedir?" : "What is YulaSanta?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'tr'
                        ? "YulaSanta, ücretsiz online çekiliş ve yılbaşı hediye eşleştirme platformudur. Instagram, YouTube, TikTok ve Twitter çekilişleri yapabilir, Secret Santa organizasyonları düzenleyebilirsiniz."
                        : "YulaSanta is a free online giveaway and Secret Santa platform. You can run Instagram, YouTube, TikTok, and Twitter giveaways, and organize Secret Santa gift exchanges."
                }
            },
            {
                "@type": "Question",
                "name": locale === 'tr' ? "YulaSanta ücretsiz mi?" : "Is YulaSanta free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'tr'
                        ? "Evet, YulaSanta tamamen ücretsizdir. Kayıt olmadan, giriş yapmadan tüm özellikleri kullanabilirsiniz."
                        : "Yes, YulaSanta is completely free. You can use all features without registration or login."
                }
            },
            {
                "@type": "Question",
                "name": locale === 'tr' ? "Hangi sosyal medya platformlarını destekliyorsunuz?" : "Which social media platforms do you support?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'tr'
                        ? "Instagram, YouTube, TikTok ve Twitter (X) platformlarından yorum ve beğeni çekilişleri yapabilirsiniz."
                        : "You can run giveaways from Instagram, YouTube, TikTok, and Twitter (X) platforms using comments and likes."
                }
            },
            {
                "@type": "Question",
                "name": locale === 'tr' ? "Secret Santa nasıl çalışır?" : "How does Secret Santa work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'tr'
                        ? "Katılımcı isimlerini ekleyin, çekilişi başlatın. Her kişi rastgele birini çeker ve sadece kendi eşleşmesini görebilir. Gizlilik korunur!"
                        : "Add participant names, start the draw. Each person randomly picks someone and can only see their own match. Privacy is protected!"
                }
            }
        ]
    };

    // BreadcrumbList Schema
    const breadcrumbSchema = {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/${locale}#breadcrumb`,
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@id": `${SITE_URL}/${locale}`,
                    "name": locale === 'tr' ? "Ana Sayfa" : "Home"
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
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
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
