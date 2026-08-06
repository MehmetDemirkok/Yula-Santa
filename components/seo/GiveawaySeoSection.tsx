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

    const isIg = platform === 'instagram';
    const accent = isIg ? 'bg-gradient-to-r from-[#FCAF45] via-[#E1306C] to-[#833AB4] text-white' : 'bg-santa-red/10 text-santa-red';
    const accentNum = isIg ? 'text-white' : '';

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
        <section className={`border-t border-[var(--border-light)] ${isIg ? 'bg-[#fafafa] dark:bg-[var(--background)]' : 'bg-[var(--surface-1)]'}`}>
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
                                <span
                                    className={`shrink-0 w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shadow-sm ${accent} ${accentNum}`}
                                >
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
                        <div className="space-y-3">
                            {faq.map((item, i) => (
                                <details
                                    key={i}
                                    className="group overflow-hidden rounded-[18px] border border-[var(--border-light)] bg-white shadow-sm dark:bg-[var(--card-bg)] dark:border-white/10"
                                    {...(i === 0 ? { open: true } : {})}
                                >
                                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 font-heading text-base sm:text-lg text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                                        <span>{item.q}</span>
                                        <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] transition-transform duration-300 group-open:rotate-45">
                                            +
                                        </span>
                                    </summary>
                                    <div className="px-5 pb-5 -mt-1 text-base text-[var(--text-secondary)] leading-relaxed animate-in fade-in duration-300">
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
