/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FAQ Page — Sıkça Sorulan Sorular
 * ═══════════════════════════════════════════════════════════════════════════
 * Mevcut `meta.faq` çevirilerini (12 dil) kullanır + Google için FAQPage
 * JSON-LD yapısal verisi ekler (zengin sonuç / SEO).
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Home } from 'lucide-react';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';

export { viewport };

type Props = { params: Promise<{ locale: string }> };

const PAGE_TITLE: Record<string, string> = {
    tr: 'Sıkça Sorulan Sorular', en: 'Frequently Asked Questions', de: 'Häufig gestellte Fragen',
    fr: 'Questions fréquentes', es: 'Preguntas frecuentes', it: 'Domande frequenti',
    pt: 'Perguntas frequentes', ru: 'Часто задаваемые вопросы', ar: 'الأسئلة الشائعة',
    ja: 'よくある質問', ko: '자주 묻는 질문', zh: '常见问题',
};

const PAGE_SUBTITLE: Record<string, string> = {
    tr: 'YulaSanta hakkında merak edilenler', en: 'Everything you want to know about YulaSanta',
    de: 'Alles über YulaSanta', fr: 'Tout ce que vous voulez savoir sur YulaSanta',
    es: 'Todo lo que quieres saber sobre YulaSanta', it: 'Tutto su YulaSanta',
    pt: 'Tudo sobre o YulaSanta', ru: 'Всё о YulaSanta', ar: 'كل ما تريد معرفته عن YulaSanta',
    ja: 'YulaSantaについて', ko: 'YulaSanta에 대한 모든 것', zh: '关于 YulaSanta 的一切',
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({ locale, path: '/faq', translationKey: 'meta.faq' });
}

export default async function FaqPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'meta.faq' });

    // meta.faq içinde q1..q4 / a1..a4 mevcut (tüm diller)
    const items = [1, 2, 3, 4].map((i) => ({ q: t(`q${i}`), a: t(`a${i}`) }));
    const title = PAGE_TITLE[locale] || PAGE_TITLE.en;
    const subtitle = PAGE_SUBTITLE[locale] || PAGE_SUBTITLE.en;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((it) => ({
            '@type': 'Question',
            name: it.q,
            acceptedAnswer: { '@type': 'Answer', text: it.a },
        })),
    };

    return (
        <main className="ys-page-shell py-16 sm:py-20 md:py-24 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/15 text-santa-red mb-5 shadow-sm">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] mb-3">
                        {title}
                    </h1>
                    <p className="text-body-lg text-[var(--text-secondary)]">{subtitle}</p>
                </div>

                {/* FAQ Accordion (native details/summary — JS gerektirmez) */}
                <div className="space-y-3">
                    {items.map((it, i) => (
                        <details
                            key={i}
                            className="group ys-card overflow-hidden"
                            {...(i === 0 ? { open: true } : {})}
                        >
                            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 sm:p-6 font-heading text-headline-md text-[var(--text-primary)]">
                                <span>{it.q}</span>
                                <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] transition-transform group-open:rotate-45">
                                    +
                                </span>
                            </summary>
                            <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1 text-body-md text-[var(--text-secondary)]">
                                {it.a}
                            </div>
                        </details>
                    ))}
                </div>

                {/* CTA back home */}
                <div className="text-center mt-12">
                    <Link
                        href={locale === 'tr' ? '/' : `/${locale}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-santa-red text-white font-bold rounded-lg shadow-[0_4px_16px_rgba(182,23,34,0.25)] hover:shadow-[0_8px_24px_rgba(182,23,34,0.32)] hover:brightness-110 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        {title === PAGE_TITLE.tr ? 'Ana Sayfa' : 'Home'}
                    </Link>
                </div>
            </div>
        </main>
    );
}
