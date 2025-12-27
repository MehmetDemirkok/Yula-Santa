"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Globe,
    ExternalLink
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Footer() {
    const t = useTranslations('footer');
    const params = useParams();
    const locale = params.locale as string;

    return (
        <footer className="w-full mt-auto relative overflow-hidden bg-white/50 backdrop-blur-md">
            {/* Soft background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
                <div className="flex flex-col items-center space-y-12">

                    {/* Brand & Language Selector */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Logo Wrapper with hover effect */}
                        <Link href={`/${locale}`} className="group flex items-center gap-4 transition-transform hover:scale-105 active:scale-95 duration-200">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-100 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" />
                                <div className="relative w-12 h-12 p-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-center">
                                    <img src="/icon.png" alt="YulaSanta Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                                    Yula<span className="text-santa-red">Santa</span>
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 pr-6">
                                    Premium Raffle
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="h-8 w-px bg-gray-100 hidden md:block" />
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Navigation Center */}
                    <div className="flex flex-col items-center space-y-6">
                        <nav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                            <Link
                                href={`/${locale}/privacy`}
                                className="group relative text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {t('privacyPolicy')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <Link
                                href={`/${locale}/legal`}
                                className="group relative text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {t('legalInfo')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                        </nav>
                    </div>

                    {/* Copyright and Cookie Disclaimer */}
                    <div className="w-full max-w-3xl border-t border-gray-50 pt-8 flex flex-col items-center space-y-6">
                        <div className="flex flex-col items-center space-y-2">
                            <p className="text-gray-400 text-xs font-bold tracking-wide">
                                {t('copyright')}
                            </p>
                        </div>

                        <p className="text-[10px] leading-relaxed text-gray-400 text-center max-w-2xl font-medium opacity-60 px-4 uppercase tracking-[0.05em]">
                            {t('cookieDisclaimer')}
                        </p>
                    </div>

                    {/* Signature Badge */}
                    <div className="pt-4">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50/80 border border-gray-100 shadow-sm backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-santa-red animate-pulse mr-2.5" />
                            <span className="text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase">
                                Crafted with passion by YulaSanta
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
