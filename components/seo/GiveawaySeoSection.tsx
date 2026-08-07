/**
 * On-page SEO content for giveaway tool pages (YouTube, TikTok).
 * Rendered below the tool UI so crawlers get unique, keyword-rich body copy.
 */

import { getTranslations } from 'next-intl/server';

type Platform = 'tiktok' | 'youtube';

interface Props {
    locale: string;
    platform: Platform;
}

export default async function GiveawaySeoSection({ locale, platform }: Props) {
    const t = await getTranslations({ locale, namespace: `giveaway.seo.${platform}` });

    if (!t.has('contentTitle')) return null;

    const paragraphs = t.raw('contentParagraphs') as string[];
    const steps = t.raw('howToSteps') as string[];
    const faq = t.raw('faq') as Array<{ q: string; a: string }>;

    const faqJsonLd =
        Array.isArray(faq) && faq.length > 0
            ? {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faq.map((item) => ({
                      '@type': 'Question',
                      name: item.q,
                      acceptedAnswer: { '@type': 'Answer', text: item.a },
                  })),
              }
            : null;

    return (
        <section className="border-t border-[var(--border-light)] bg-[var(--surface-1)]">
            {faqJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}
            <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 space-y-12">
                <div>
                    <h2 className="font-heading text-3xl tracking-tight text-[var(--text-primary)] mb-5 sm:text-[2rem]">
                        {t('contentTitle')}
                    </h2>
                    <div className="space-y-4 text-base text-[var(--text-secondary)] leading-relaxed">
                        {paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-heading text-2xl tracking-tight text-[var(--text-primary)] mb-5">
                        {t('howToTitle')}
                    </h3>
                    <ol className="space-y-4">
                        {steps.map((step, i) => (
                            <li key={i} className="flex gap-4 text-base text-[var(--text-secondary)]">
                                <span className="shrink-0 w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shadow-sm bg-santa-red/10 text-santa-red">
                                    {i + 1}
                                </span>
                                <span className="pt-1.5 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {Array.isArray(faq) && faq.length > 0 && (
                    <div>
                        <h3 className="font-heading text-2xl tracking-tight text-[var(--text-primary)] mb-5">
                            {t('faqTitle')}
                        </h3>
                        <div className="space-y-4">
                            {faq.map((item, i) => (
                                <details
                                    key={i}
                                    className="group rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] px-5 py-4"
                                >
                                    <summary className="cursor-pointer list-none font-bold text-[var(--text-primary)] pr-6 relative">
                                        {item.q}
                                        <span className="absolute right-0 top-0 text-[var(--text-muted)] group-open:rotate-45 transition-transform">+</span>
                                    </summary>
                                    <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
