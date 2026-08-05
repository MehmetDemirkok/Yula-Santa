/**
 * On-page SEO content for giveaway tool pages (Instagram, TikTok, etc.).
 * Rendered below the tool UI so crawlers get unique, keyword-rich body copy.
 */

import { getTranslations } from 'next-intl/server';

type Platform = 'instagram' | 'tiktok';

interface Props {
    locale: string;
    platform: Platform;
}

export default async function GiveawaySeoSection({ locale, platform }: Props) {
    const t = await getTranslations({ locale, namespace: `giveaway.seo.${platform}` });

    // Optional block — missing in a locale? Skip silently.
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
        <section className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)]">
            {faqJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}
            <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-10">
                <div>
                    <h2 className="font-heading text-headline-md sm:text-headline-lg text-[var(--text-primary)] mb-4">
                        {t('contentTitle')}
                    </h2>
                    <div className="space-y-4 text-body-md text-[var(--text-secondary)] leading-relaxed">
                        {paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">
                        {t('howToTitle')}
                    </h3>
                    <ol className="space-y-3">
                        {steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-body-md text-[var(--text-secondary)]">
                                <span className="shrink-0 w-7 h-7 rounded-full bg-santa-red/10 text-santa-red font-bold text-sm flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <span className="pt-0.5 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {Array.isArray(faq) && faq.length > 0 && (
                    <div>
                        <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">
                            {t('faqTitle')}
                        </h3>
                        <div className="space-y-3">
                            {faq.map((item, i) => (
                                <details
                                    key={i}
                                    className="group ys-card overflow-hidden"
                                    {...(i === 0 ? { open: true } : {})}
                                >
                                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-4 sm:p-5 font-heading text-base text-[var(--text-primary)]">
                                        <span>{item.q}</span>
                                        <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] transition-transform group-open:rotate-45">
                                            +
                                        </span>
                                    </summary>
                                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1 text-body-md text-[var(--text-secondary)]">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
