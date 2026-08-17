import { getTranslations } from 'next-intl/server';
import JsonLd from '@/components/seo/JsonLd';
import RelatedLinks from '@/components/seo/RelatedLinks';
import { SITE_URL } from '@/lib/constants';

interface Props {
    locale: string;
}

export default async function HomeSeoSection({ locale }: Props) {
    const t = await getTranslations({ locale, namespace: 'home.seo' });
    const tHome = await getTranslations({ locale, namespace: 'home' });
    const tFooter = await getTranslations({ locale, namespace: 'footer' });
    const tTools = await getTranslations({ locale, namespace: 'tools' });

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
        ],
    };

    const related = [
        { path: '/youtube', label: tHome('youtubeGiveaway') },
        { path: '/tiktok', label: tHome('tiktokGiveaway') },
        { path: '/raffle', label: tFooter('namePicker') },
        { path: '/secret-santa', label: tFooter('secretSanta') },
        { path: '/tools/wheel-of-fortune', label: tTools('wheelOfFortune') },
        { path: '/tools/random-number', label: tTools('randomNumber') },
        { path: '/tools/team-generator', label: tTools('teamGenerator') },
        { path: '/tools/coin-flip', label: tTools('coinFlip') },
    ];

    return (
        <section className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <JsonLd data={appSchema} />
            <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
                <h2 className="font-heading text-headline-md sm:text-headline-lg text-[var(--text-primary)] mb-4">
                    {t('title')}
                </h2>
                <div className="space-y-4 text-body-md text-[var(--text-secondary)] leading-relaxed mb-8">
                    {paragraphs.map((p) => (
                        <p key={p}>{p}</p>
                    ))}
                </div>
                <h3 className="font-heading text-base font-bold text-[var(--text-primary)] mb-3">
                    {t('featuresTitle')}
                </h3>
                <ul className="space-y-2 mb-10">
                    {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-body-md text-[var(--text-secondary)]">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-santa-red shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <RelatedLinks
                    locale={locale}
                    title={locale === 'tr' ? 'Çekiliş araçları' : 'Giveaway tools'}
                    items={related}
                />
            </div>
        </section>
    );
}
