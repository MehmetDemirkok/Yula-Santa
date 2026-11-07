"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { OperatorInfo } from '@/components/legal/OperatorInfo';
import { getPrivacyNotice } from '@/lib/legal/privacyNotice';
import { localePath } from '@/lib/localePath';

export default function PrivacyClient() {
    const t = useTranslations('privacy');
    const common = useTranslations('common');
    const params = useParams();
    const locale = params.locale as string;
    const notice = getPrivacyNotice(locale);

    return (
        <main className="ys-page-shell pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-32 sm:pt-40">
                <Link
                    href={localePath(locale)}
                    className="inline-flex items-center text-sm font-bold text-[var(--text-muted)] hover:text-santa-red mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {common('cancel') || 'Back'}
                </Link>

                <header className="mb-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 p-3 bg-[var(--card-bg)] rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-[var(--border-light)] flex items-center justify-center">
                            <img src="/icon.png" alt="" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">
                            {t('title')}
                        </h1>
                    </div>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-3xl font-medium">{notice.intro}</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="ys-chip-success inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            {notice.labels.effective}: {notice.effectiveDate}
                        </span>
                        {notice.governingNote ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] rounded-xl text-xs font-bold text-[var(--text-muted)] border border-[var(--border-light)]">
                                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                                {notice.governingNote}
                            </span>
                        ) : null}
                    </div>
                </header>

                <div className="space-y-6">
                    {notice.sections.map((section) => (
                        <section
                            key={section.id}
                            id={section.id}
                            className="ys-card p-6 sm:p-8 scroll-mt-28"
                            aria-labelledby={`privacy-${section.id}`}
                        >
                            <h2
                                id={`privacy-${section.id}`}
                                className="font-heading text-headline-md text-[var(--text-primary)] mb-4 tracking-tight"
                            >
                                {section.title}
                            </h2>
                            {section.paragraphs?.map((paragraph) => (
                                <p key={paragraph} className="text-body-md text-[var(--text-secondary)] mb-3">
                                    {paragraph}
                                </p>
                            ))}
                            {section.id === 'controller' || section.id === 'apply' ? (
                                <div className="mt-2">
                                    <OperatorInfo labels={notice.labels} />
                                </div>
                            ) : null}
                            {section.items ? (
                                <ul className="list-disc ps-5 space-y-2 text-body-md text-[var(--text-secondary)]">
                                    {section.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : null}
                            {section.links ? (
                                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-body-md font-semibold text-indigo-accent hover:underline"
                                            >
                                                {link.label}
                                                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
