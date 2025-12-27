
import { Metadata } from "next";
import Script from "next/script";
import { SITE_URL } from "@/lib/constants";
import { getSEOMetadata, viewport } from '@/lib/seo';

export { viewport };

// Generate dynamic metadata with locale support
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools',
        translationKey: 'tools.meta'
    });
}

// JSON-LD Structured Data for Tools
function getToolsJsonLd(locale: string) {
    // Get locale-specific text
    const homeText: Record<string, string> = {
        'tr': 'Ana Sayfa',
        'en': 'Home',
        'de': 'Startseite',
        'fr': 'Accueil',
        'es': 'Inicio',
        'it': 'Home',
        'pt': 'Início',
        'ru': 'Главная',
        'ar': 'الرئيسية',
        'ja': 'ホーム',
        'ko': '홈',
        'zh': '首页'
    };

    const toolsText: Record<string, string> = {
        'tr': 'Araçlar',
        'en': 'Tools',
        'de': 'Werkzeuge',
        'fr': 'Outils',
        'es': 'Herramientas',
        'it': 'Strumenti',
        'pt': 'Ferramentas',
        'ru': 'Инструменты',
        'ar': 'أدوات',
        'ja': 'ツール',
        'ko': '도구',
        'zh': '工具'
    };

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                "url": SITE_URL,
                "name": "YulaSanta",
                "inLanguage": ["tr", "en", "de", "fr", "es", "it", "pt", "ru", "ar", "ja", "ko", "zh"]
            },
            {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                "name": "YulaSanta",
                "url": SITE_URL,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${SITE_URL}/icon-512.png`,
                    "width": 512,
                    "height": 512
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}/${locale}/tools#breadcrumb`,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@id": `${SITE_URL}/${locale}`,
                            "name": homeText[locale] || homeText['en']
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "item": {
                            "@id": `${SITE_URL}/${locale}/tools`,
                            "name": toolsText[locale] || toolsText['en']
                        }
                    }
                ]
            }
        ]
    };
}

export default async function ToolsLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const jsonLd = getToolsJsonLd(locale);

    return (
        <>
            <Script
                id="tools-json-ld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="min-h-screen">
                {children}
            </div>
        </>
    );
}
