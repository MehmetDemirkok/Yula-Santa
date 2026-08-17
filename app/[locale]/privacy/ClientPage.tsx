"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, Shield, CheckCircle, Lock, Eye, Globe } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PrivacyClient() {
    const t = useTranslations('privacy');
    const common = useTranslations('common');
    const params = useParams();
    const locale = params.locale as string;

    const sections = [
        {
            icon: Lock,
            title: t('dataTitle'),
            content: t('dataDesc'),
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            icon: Eye,
            title: t('cookiesTitle'),
            content: t('cookiesDesc'),
            color: 'text-purple-500',
            bg: 'bg-purple-50'
        },
        {
            icon: Shield,
            title: t('securityTitle'),
            content: t('securityDesc'),
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            icon: Globe,
            title: t('thirdPartyTitle'),
            content: t('thirdPartyDesc'),
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        },
    ];

    return (
        <main className="ys-page-shell pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-32 sm:pt-40 text-center sm:text-left">
                {/* Back Link */}
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center text-sm font-bold text-[var(--text-muted)] hover:text-santa-red mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {common('cancel') || 'Back'}
                </Link>

                {/* Header Card */}
                <div className="relative mb-16">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100/30 dark:bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-100/20 dark:bg-emerald-900/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative flex flex-col items-center sm:items-start text-center sm:text-left space-y-8">
                        {/* Logo and Badge */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-20 h-20 p-3 bg-[var(--card-bg)] rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-2xl border border-[var(--border-light)] flex items-center justify-center transform hover:rotate-6 transition-transform">
                                <img src="/icon.png" alt="YulaSanta Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="space-y-2">
                                <div className="ys-chip inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-[10px] font-black tracking-widest text-santa-red uppercase border border-red-100/50 dark:border-red-500/20">
                                    <Shield className="w-3 h-3 mr-2" />
                                    {t('title')}
                                </div>
                                <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">
                                    {t('title')}
                                </h1>
                            </div>
                        </div>

                        <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl font-medium">
                            {t('intro')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="ys-chip-success flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t('lastUpdated')}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] rounded-xl text-xs font-bold text-[var(--text-muted)] border border-[var(--border-light)]">
                                <Shield className="w-3.5 h-3.5" />
                                100% User-Focused
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="group ys-card p-10 hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 ${section.bg} dark:bg-opacity-10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <section.icon className={`w-7 h-7 ${section.color}`} />
                            </div>
                            <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-4 tracking-tight">
                                {section.title}
                            </h2>
                            <p className="text-body-md text-[var(--text-secondary)] font-medium">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
