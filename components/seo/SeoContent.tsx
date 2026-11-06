import { ChevronDown } from 'lucide-react';
import RelatedLinks, { type RelatedLinkItem } from '@/components/seo/RelatedLinks';

interface Props {
    locale: string;
    title: string;
    paragraphs: string[];
    readMore: string;
    featuresTitle?: string;
    features?: { title: string; desc: string }[];
    howToTitle: string;
    steps: string[];
    faqTitle: string;
    faq: { q: string; a: string }[];
    relatedTitle: string;
    related: RelatedLinkItem[];
}

/**
 * Compact SEO copy for tool pages. Everything inside <details> stays in the
 * server-rendered HTML, so it can still be indexed while the page stays short.
 */
export default function SeoContent({
    locale,
    title,
    paragraphs,
    readMore,
    featuresTitle,
    features = [],
    howToTitle,
    steps,
    faqTitle,
    faq,
    relatedTitle,
    related,
}: Props) {
    const [firstParagraph, ...otherParagraphs] = paragraphs;
    const subheadingClass = 'font-heading text-base font-bold text-[var(--text-primary)] mb-2';

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{firstParagraph}</p>

            {/* Named groups: a plain `group` would also trigger the nested FAQ icons when this opens. */}
            <details className="group/seo mt-1">
                <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-santa-red [&::-webkit-details-marker]:hidden">
                    {readMore}
                    <ChevronDown className="h-4 w-4 transition-transform group-open/seo:rotate-180" aria-hidden="true" />
                </summary>

                <div className="space-y-5 pb-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {otherParagraphs.length > 0 && (
                        <div className="space-y-3">
                            {otherParagraphs.map((p) => (
                                <p key={p}>{p}</p>
                            ))}
                        </div>
                    )}

                    <div>
                        <h3 className={subheadingClass}>{howToTitle}</h3>
                        <ol className="space-y-2">
                            {steps.map((step, i) => (
                                <li key={step} className="flex gap-2.5">
                                    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-santa-red/10 text-[11px] font-bold text-santa-red">
                                        {i + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {features.length > 0 && (
                        <div>
                            {featuresTitle && <h3 className={subheadingClass}>{featuresTitle}</h3>}
                            <ul className="space-y-1.5">
                                {features.map((feature) => (
                                    <li key={feature.title} className="flex items-start gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-santa-red" />
                                        <span>
                                            <strong className="font-semibold text-[var(--text-primary)]">{feature.title}:</strong>{' '}
                                            {feature.desc}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {faq.length > 0 && (
                        <div>
                            <h3 className={subheadingClass}>{faqTitle}</h3>
                            <div className="space-y-2">
                                {faq.map((item) => (
                                    <details
                                        key={item.q}
                                        className="group/faq rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] px-4"
                                    >
                                        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 py-2 font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                                            {item.q}
                                            <span
                                                className="shrink-0 text-[var(--text-muted)] transition-transform group-open/faq:rotate-45"
                                                aria-hidden="true"
                                            >
                                                +
                                            </span>
                                        </summary>
                                        <p className="pb-3">{item.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </details>

            <RelatedLinks locale={locale} title={relatedTitle} items={related} />
        </div>
    );
}
