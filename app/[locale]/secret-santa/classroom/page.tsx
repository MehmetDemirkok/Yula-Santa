import Link from 'next/link';
import { Printer, Users, EyeOff, FileUp, Wallet, Gift, ChevronDown } from 'lucide-react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
import { SITE_URL } from '@/lib/constants';
import { localePath } from '@/lib/localePath';
import { getClassroomCopy } from '@/lib/classroomSeoCopy';
import JsonLd from '@/components/seo/JsonLd';
import printStyles from '@/components/secretSanta/print.module.css';
export { viewport };

const PATH = '/secret-santa/classroom';
const WHY_ICONS = [Printer, EyeOff, Users, FileUp, Wallet, Gift];

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = getClassroomCopy(locale);
    return getSEOMetadata({
        locale,
        path: PATH,
        titleOverride: copy.metaTitle,
        descriptionOverride: copy.metaDescription,
        keywordsOverride: copy.keywords,
        ogImage: { path: locale === 'tr' ? '/og-secret-santa-tr.jpg' : '/og-secret-santa-en.jpg', width: 1200, height: 630 },
    });
}

/** Landing page for teachers: what the printable cards look like and how to run a class draw. */
export default async function ClassroomPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = getClassroomCopy(locale);
    const abs = (path: string) => `${SITE_URL}${localePath(locale, path) === '/' ? '' : localePath(locale, path)}`;
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
        tool: [{ '@type': 'HowToTool', name: 'Printer' }],
        supply: [{ '@type': 'HowToSupply', name: 'A4 paper' }],
        step: copy.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text, url: `${abs(PATH)}#step-${i + 1}` })),
    };
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'YulaSanta', item: abs('/') },
            { '@type': 'ListItem', position: 2, name: 'Secret Santa', item: abs('/secret-santa') },
            { '@type': 'ListItem', position: 3, name: copy.breadcrumb, item: abs(PATH) },
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
                        <Printer className="h-3.5 w-3.5" /> {copy.breadcrumb}
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

                <section aria-labelledby="sample-title" className="space-y-3">
                    <h2 id="sample-title" className="font-heading text-lg font-bold text-[var(--text-primary)] text-center">{copy.sampleTitle}</h2>
                    <div className="ys-card p-3 sm:p-4">
                        <div className={printStyles.sheet}>
                            <div className={printStyles.card}>
                                <div className={printStyles.panel}>
                                    <span className={printStyles.brand}>{s.brand}</span>
                                    <span className={printStyles.name}>{s.giver}</span>
                                    <span className={printStyles.small}>{s.cardFor}</span>
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

                <section aria-labelledby="why-title" className="space-y-4">
                    <h2 id="why-title" className="font-heading text-xl font-bold text-[var(--text-primary)]">{copy.whyTitle}</h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {copy.why.map((item, i) => {
                            const Icon = WHY_ICONS[i % WHY_ICONS.length];
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
            </div>
        </main>
    );
}
