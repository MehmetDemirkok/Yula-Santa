/**
 * On-page SEO content for the homepage — keyword-rich body copy for crawlers.
 */

import { getTranslations } from 'next-intl/server';

interface Props {
    locale: string;
}

export default async function HomeSeoSection({ locale }: Props) {
    const t = await getTranslations({ locale, namespace: 'home.seo' });

    if (!t.has('title')) return null;

    const paragraphs = t.raw('paragraphs') as string[];
    const features = t.raw('features') as string[];

    return (
        <section className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
                <h2 className="font-heading text-headline-md sm:text-headline-lg text-[var(--text-primary)] mb-4">
                    {t('title')}
                </h2>
                <div className="space-y-4 text-body-md text-[var(--text-secondary)] leading-relaxed mb-8">
                    {paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
                <h3 className="font-heading text-base font-bold text-[var(--text-primary)] mb-3">
                    {t('featuresTitle')}
                </h3>
                <ul className="space-y-2">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-body-md text-[var(--text-secondary)]">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-santa-red shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
