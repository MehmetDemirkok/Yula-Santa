import { notFound } from 'next/navigation';
import { BookOpen, ChevronDown, Gift } from 'lucide-react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { localePath } from '@/lib/localePath';
import { LANDING_LOCALES } from '@/lib/officeUniversitySeoCopy';
import { WHAT_IS_COPY } from '@/lib/whatIsSecretSantaCopy';
import JsonLd from '@/components/seo/JsonLd';
import RelatedLinks from '@/components/seo/RelatedLinks';
import { TrackedLink } from '@/components/analytics/TrackedLink';
export { viewport };

const PATH = '/secret-santa/what-is';

// Only Turkish, English and Russian copy exists (LANDING_LOCALES).
export const dynamicParams = false;

export function generateStaticParams() {
    return LANDING_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = WHAT_IS_COPY[locale];
    if (!copy) return {};
    return getSEOMetadata({
        locale,
        path: PATH,
        titleOverride: copy.metaTitle,
        descriptionOverride: copy.metaDescription,
        keywordsOverride: copy.keywords,
        alternateLocales: LANDING_LOCALES,
        ogImage: { path: locale === 'tr' ? '/og-secret-santa-tr.jpg' : '/og-secret-santa-en.jpg', width: 1200, height: 630 },
    });
}

/** Explainer article: what Secret Santa is, the rules and practical tips. */
export default async function WhatIsSecretSantaPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = WHAT_IS_COPY[locale];
    if (!copy) notFound();

    const abs = (p: string) => `${SITE_URL}${localePath(locale, p) === '/' ? '' : localePath(locale, p)}`;
    const toolHref = localePath(locale, '/secret-santa');

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: copy.h1,
        description: copy.metaDescription,
        inLanguage: locale,
        mainEntityOfPage: abs(PATH),
        author: { '@type': 'Organization', name: 'YulaSanta', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'YulaSanta', url: SITE_URL },
    };
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: copy.faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
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

    return (
        <main className="ys-page-shell px-4 pt-24 sm:pt-28 pb-12">
            <JsonLd data={articleJsonLd} />
            <JsonLd data={faqJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />

            <article className="mx-auto w-full max-w-2xl space-y-8">
                <header className="space-y-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden /> {copy.breadcrumb}
                    </span>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{copy.h1}</h1>
                    <p className="text-body-lg leading-relaxed text-[var(--text-secondary)]">{copy.lead}</p>
                </header>

                {copy.sections.map((section) => (
                    <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-[96px] space-y-3">
                        <h2 id={`${section.id}-title`} className="font-heading text-xl font-bold text-[var(--text-primary)]">{section.title}</h2>
                        {section.paragraphs?.map((p) => (
                            <p key={p} className="leading-relaxed text-[var(--text-secondary)]">{p}</p>
                        ))}
                        {section.items && (
                            <ul className="space-y-2">
                                {section.items.map((item) => (
                                    <li key={item} className="flex items-start gap-2.5 text-[var(--text-secondary)]">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-santa-red" aria-hidden />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}

                <aside className="ys-card space-y-3 p-5 text-center sm:p-6">
                    <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">{copy.ctaTitle}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{copy.ctaText}</p>
                    <TrackedLink
                        tool="secret_santa"
                        href={toolHref}
                        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-santa-red px-7 text-base font-bold text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30 hover:brightness-110"
                    >
                        <Gift className="h-5 w-5" aria-hidden /> {copy.cta}
                    </TrackedLink>
                </aside>

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

                <RelatedLinks locale={locale} title={copy.relatedTitle} items={copy.related} />
            </article>
        </main>
    );
}
