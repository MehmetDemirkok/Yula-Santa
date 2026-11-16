import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Gift, ShieldCheck } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
import { localePath } from '@/lib/localePath';
import type { SantaLandingCopy } from '@/lib/santaLandingCopy';
import JsonLd from '@/components/seo/JsonLd';
import RelatedLinks from '@/components/seo/RelatedLinks';
import printStyles from '@/components/secretSanta/print.module.css';

type Props = {
    locale: string;
    /** Path of this page without the locale prefix, e.g. '/secret-santa/office'. */
    path: string;
    copy: SantaLandingCopy;
    badgeIcon: LucideIcon;
    /** Icons for the "why" cards, used in order and repeated if needed. */
    whyIcons: LucideIcon[];
    /** Extra HowTo fields such as tool/supply. */
    howToExtras?: Record<string, unknown>;
};

/** Server-rendered audience landing page that sends visitors to the existing /secret-santa tool. */
export default function SantaLandingPage({ locale, path, copy, badgeIcon: BadgeIcon, whyIcons, howToExtras }: Props) {
    const abs = (p: string) => `${SITE_URL}${localePath(locale, p) === '/' ? '' : localePath(locale, p)}`;
    const toolHref = localePath(locale, '/secret-santa');

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: copy.faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    };
    const howToJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: copy.howToTitle,
        inLanguage: locale,
        ...howToExtras,
        step: copy.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text, url: `${abs(path)}#step-${i + 1}` })),
    };
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'YulaSanta', item: abs('/') },
            { '@type': 'ListItem', position: 2, name: 'Secret Santa', item: abs('/secret-santa') },
            { '@type': 'ListItem', position: 3, name: copy.breadcrumb, item: abs(path) },
        ],
    };

    const s = copy.sample;
    return (
        <main className="ys-page-shell px-4 pt-24 sm:pt-28 pb-12">
            <JsonLd data={faqJsonLd} />
            <JsonLd data={howToJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />

            <div className="mx-auto w-full max-w-3xl space-y-10">
                <header className="space-y-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <BadgeIcon className="h-3.5 w-3.5" /> {copy.breadcrumb}
                    </span>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{copy.h1}</h1>
                    <p className="mx-auto max-w-2xl text-body-lg text-[var(--text-secondary)]">{copy.intro}</p>
                    <Link
                        href={toolHref}
                        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-santa-red px-7 text-base font-bold text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30 hover:brightness-110"
                    >
                        <Gift className="h-5 w-5" /> {copy.cta}
                    </Link>
                </header>

                {s && (
                    <section aria-labelledby="sample-title" className="space-y-3">
                        <h2 id="sample-title" className="font-heading text-lg font-bold text-[var(--text-primary)] text-center">{copy.sampleTitle}</h2>
                        <div className="ys-card p-3 sm:p-4">
                            <div className={printStyles.sheet}>
                                <div className={printStyles.card}>
                                    <div className={printStyles.panel}>
                                        <span className={printStyles.brand}>{s.brand}</span>
                                        <span className={printStyles.name}>{s.giver}</span>
                                        <span className={printStyles.small}>{s.cardFor}</span>
                                        <span className={printStyles.siteMark}>yulasanta.com.tr</span>
                                    </div>
                                    <div className={printStyles.panel} style={{ background: 'repeating-linear-gradient(45deg,#2b2b2b 0 2.5px,#5b5b5b 2.5px 5px)' }}>
                                        <span className={printStyles.foldMark}>2</span>
                                        <span className={printStyles.patternLabel}>{s.pattern}</span>
                                    </div>
                                    <div className={printStyles.panel}>
                                        <span className={printStyles.foldMark}>1</span>
                                        <span className={printStyles.label}>{s.giftFor}</span>
                                        <span className={printStyles.name}>{s.receiver}</span>
                                        <span className={printStyles.small}>{s.hint}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section aria-labelledby="why-title" className="space-y-4">
                    <h2 id="why-title" className="font-heading text-xl font-bold text-[var(--text-primary)]">{copy.whyTitle}</h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {copy.why.map((item, i) => {
                            const Icon = whyIcons[i % whyIcons.length];
                            return (
                                <li key={item.title} className="ys-card flex items-start gap-3 p-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/15 text-santa-red">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="block font-bold text-[var(--text-primary)]">{item.title}</span>
                                        <span className="block text-sm text-[var(--text-secondary)]">{item.desc}</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section aria-labelledby="howto-title" className="space-y-4">
                    <h2 id="howto-title" className="font-heading text-xl font-bold text-[var(--text-primary)]">{copy.howToTitle}</h2>
                    <ol className="space-y-3">
                        {copy.steps.map((step, i) => (
                            <li key={step} id={`step-${i + 1}`} className="flex gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-santa-red text-sm font-bold text-white">{i + 1}</span>
                                <span className="pt-0.5 text-[var(--text-secondary)]">{step}</span>
                            </li>
                        ))}
                    </ol>
                    <Link href={toolHref} className="inline-flex h-[48px] items-center justify-center rounded-full border-2 border-santa-red px-6 font-bold text-santa-red hover:bg-red-50 dark:hover:bg-red-500/10">
                        {copy.cta} →
                    </Link>
                </section>

                {copy.privacy && copy.privacy.length > 0 && (
                    <section aria-labelledby="privacy-title" className="ys-card space-y-3 p-5">
                        <h2 id="privacy-title" className="flex items-center gap-2 font-heading text-lg font-bold text-[var(--text-primary)]">
                            <ShieldCheck className="h-5 w-5 text-success-green" aria-hidden /> {copy.privacyTitle}
                        </h2>
                        <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                            {copy.privacy.map((point) => (
                                <li key={point} className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success-green" aria-hidden />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href={localePath(locale, '/privacy')} className="inline-flex min-h-[44px] items-center text-sm font-bold text-santa-red hover:underline">
                            {locale === 'tr' ? 'Gizlilik politikasını oku →' : 'Read the privacy notice →'}
                        </Link>
                    </section>
                )}

                <section aria-labelledby="faq-title" className="space-y-3">
                    <h2 id="faq-title" className="font-heading text-xl font-bold text-[var(--text-primary)]">{copy.faqTitle}</h2>
                    <div className="space-y-2">
                        {copy.faq.map((item) => (
                            <details key={item.q} className="group ys-card px-4">
                                <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                                    {item.q}
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                                </summary>
                                <p className="pb-4 text-sm leading-relaxed text-[var(--text-secondary)]">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {copy.related && copy.related.length > 0 && (
                    <RelatedLinks locale={locale} title={copy.relatedTitle || ''} items={copy.related} />
                )}
            </div>
        </main>
    );
}
