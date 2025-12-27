"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, Shield, CheckCircle, Lock, Eye, Globe } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

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
        <main className="min-h-screen bg-gradient-to-b from-[#FFF5F5] to-white pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-32 sm:pt-40 text-center sm:text-left">
                {/* Back Link */}
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-santa-red mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {common('cancel') || 'Back'}
                </Link>

                {/* Header Card */}
                <div className="relative mb-16">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100/30 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-100/20 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative flex flex-col items-center sm:items-start text-center sm:text-left space-y-8">
                        {/* Logo and Badge */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-20 h-20 p-3 bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-50 flex items-center justify-center transform hover:rotate-6 transition-transform">
                                <img src="/icon.png" alt="YulaSanta Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="space-y-2">
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-[10px] font-black tracking-widest text-santa-red uppercase border border-red-100/50">
                                    <Shield className="w-3 h-3 mr-2" />
                                    {t('title')}
                                </div>
                                <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
                                    Yula<span className="text-santa-red">Privacy</span>
                                </h1>
                            </div>
                        </div>

                        <p className="text-gray-500 max-w-2xl text-xl font-medium leading-relaxed">
                            {t('intro')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-600 border border-emerald-100">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t('lastUpdated')}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-400 border border-gray-100">
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
                            className="group p-10 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white hover:border-red-100 transition-all duration-300 hover:shadow-[0_30px_60px_rgba(239,68,68,0.05)] hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 ${section.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <section.icon className={`w-7 h-7 ${section.color}`} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                                {section.title}
                            </h2>
                            <p className="text-gray-500 text-base leading-relaxed font-medium">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
