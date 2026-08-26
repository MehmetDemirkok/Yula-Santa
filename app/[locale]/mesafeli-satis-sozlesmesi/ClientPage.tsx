"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, FileText, Mail, ScrollText, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Article = { title: string; body: string };

export default function SalesContractClient() {
    const t = useTranslations('salesContract');
    const common = useTranslations('common');
    const params = useParams();
    const locale = params.locale as string;

    const articles = t.raw('articles') as Article[];

    return (
        <main className="ys-page-shell pb-20 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-6 pt-32 sm:pt-40">
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center text-sm font-bold text-[var(--text-muted)] hover:text-santa-red dark:hover:text-red-400 mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {common('cancel') || 'Back'}
                </Link>

                <div className="mb-12 space-y-4">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-[10px] font-black tracking-widest text-santa-red uppercase border border-red-100/50 dark:border-red-500/20">
                        <ScrollText className="w-3 h-3 mr-2" />
                        {t('subtitle')}
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] dark:text-white tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed max-w-2xl">
                        {t('intro')}
                    </p>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
                        {t('lastUpdated')}
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="p-6 sm:p-8 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)]">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-santa-red" />
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('buyerTitle')}</h2>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{t('buyerBody')}</p>
                    </section>

                    {articles.map((article) => (
                        <section
                            key={article.title}
                            className="p-6 sm:p-8 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)]"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-santa-red" />
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">{article.title}</h2>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{article.body}</p>
                        </section>
                    ))}

                    <section className="p-6 sm:p-8 bg-[var(--surface-2)] rounded-3xl border border-[var(--border-light)] flex items-center gap-3">
                        <Mail className="w-5 h-5 text-santa-red shrink-0" />
                        <p className="text-sm font-semibold text-[var(--text-secondary)]">{t('contactNote')}</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
