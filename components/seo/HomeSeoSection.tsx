import { getTranslations } from 'next-intl/server';
import { ChevronDown } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/constants';

interface Props {
    locale: string;
}

export default async function HomeSeoSection({ locale }: Props) {
    const t = await getTranslations({ locale, namespace: 'home.seo' });

    if (!t.has('title')) return null;

    const paragraphs = t.raw('paragraphs') as string[];
    const features = t.raw('features') as string[];

    const appSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#application`,
        name: 'YulaSanta',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        url: SITE_URL,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock',
        },
        description: t('title'),
        featureList: [
            'YouTube comment giveaway',
            'TikTok comment giveaway',
            'Secret Santa',
            'Name picker',
            'Wheel of fortune',
            'Random number generator',
            'Turkey plate code quiz game',
        ],
    };

    const [firstParagraph, ...otherParagraphs] = paragraphs;

    // The rest stays in the server-rendered HTML inside <details>, so it can still be indexed.
    return (
        <section className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <JsonLd data={appSchema} />
            <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                    {t('title')}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{firstParagraph}</p>
                <details className="group mt-1">
                    <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-santa-red [&::-webkit-details-marker]:hidden">
                        {t('readMore')}
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="space-y-3 pb-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {otherParagraphs.map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                        <h3 className="font-heading text-base font-bold text-[var(--text-primary)]">
                            {t('featuresTitle')}
                        </h3>
                        <ul className="space-y-1.5">
                            {features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-santa-red shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            </div>
        </section>
    );
}
