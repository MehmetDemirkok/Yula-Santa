"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, Scale, FileText, AlertTriangle, Copyright, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LegalClient() {
    const t = useTranslations('legal');
    const common = useTranslations('common');
    const params = useParams();
    const locale = params.locale as string;

    const sections = [
        {
            icon: FileText,
            title: t('usageTitle'),
            content: t('usageDesc'),
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            icon: AlertTriangle,
            title: t('liabilityTitle'),
            content: t('liabilityDesc'),
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        },
        {
            icon: Copyright,
            title: t('contentTitle'),
            content: t('contentDesc'),
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            icon: HelpCircle,
            title: t('contactTitle'),
            content: t('contactDesc'),
            color: 'text-red-500',
            bg: 'bg-red-50'
        },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#FFF5F5] to-white dark:from-gray-900 dark:to-gray-950 pb-20 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 pt-32 sm:pt-40 text-center sm:text-left">
                {/* Back Link */}
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-santa-red dark:hover:text-red-400 mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {common('cancel') || 'Back'}
                </Link>

                {/* Header Card */}
                <div className="relative mb-16">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-100/30 dark:bg-green-900/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative flex flex-col items-center sm:items-start text-center sm:text-left space-y-8">
                        {/* Logo and Badge */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-20 h-20 p-3 bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-2xl border border-gray-50 dark:border-gray-700 flex items-center justify-center transform hover:-rotate-6 transition-transform">
                                <img src="/icon.png" alt="YulaSanta Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="space-y-2">
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 text-[10px] font-black tracking-widest text-christmas-green dark:text-green-400 uppercase border border-green-100/50 dark:border-green-500/20">
                                    <Scale className="w-3 h-3 mr-2" />
                                    {t('title')}
                                </div>
                                <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Yula<span className="text-christmas-green">Legal</span>
                                </h1>
                            </div>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-xl font-medium leading-relaxed">
                            {t('intro')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-xs font-bold text-christmas-green dark:text-green-400 border border-green-100 dark:border-green-500/20">
                                <div className="w-2 h-2 rounded-full bg-christmas-green dark:bg-green-500 animate-pulse" />
                                {t('lastUpdated')}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700">
                                <Scale className="w-3.5 h-3.5" />
                                Official Terms
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="group p-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-2xl border border-white dark:border-gray-700 hover:border-green-100 dark:hover:border-green-600/30 transition-all duration-300 hover:shadow-[0_30px_60px_rgba(34,197,94,0.05)] dark:hover:shadow-green-500/10 hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 ${section.bg} dark:bg-opacity-10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                                <section.icon className={`w-7 h-7 ${section.color}`} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                                {section.title}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed font-medium">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
