"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
    Instagram,
    ImageIcon,
    Gift,
    Dice1,
    Coins,
    Hash,
    Shuffle
} from 'lucide-react';

export function Footer() {
    const t = useTranslations('footer');
    const tTools = useTranslations('tools');
    const params = useParams();
    const pathname = usePathname();
    const locale = params.locale as string;

    // Check if we are on the home page
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

    const tools = [
        {
            key: 'instagramStoryViewer',
            href: `/${locale}/tools/instagram-story-viewer`,
            icon: Instagram,
            iconBg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
            hoverBorder: 'hover:border-pink-200',
            hoverShadow: 'hover:shadow-pink-100/50'
        },
        {
            key: 'instagramProfilePicture',
            href: `/${locale}/tools/instagram-profile-picture`,
            icon: ImageIcon,
            iconBg: 'bg-emerald-500',
            hoverBorder: 'hover:border-emerald-200',
            hoverShadow: 'hover:shadow-emerald-100/50'
        },
        {
            key: 'onlineGiveaway',
            href: `/${locale}`,
            icon: Gift,
            iconBg: 'bg-red-500',
            hoverBorder: 'hover:border-red-200',
            hoverShadow: 'hover:shadow-red-100/50'
        },
        {
            key: 'dice',
            href: `/${locale}/tools/dice`,
            icon: Dice1,
            iconBg: 'bg-blue-500',
            hoverBorder: 'hover:border-blue-200',
            hoverShadow: 'hover:shadow-blue-100/50'
        },
        {
            key: 'coinFlip',
            href: `/${locale}/tools/coin-flip`,
            icon: Coins,
            iconBg: 'bg-amber-500',
            hoverBorder: 'hover:border-amber-200',
            hoverShadow: 'hover:shadow-amber-100/50'
        },
        {
            key: 'randomNumber',
            href: `/${locale}/tools/random-number`,
            icon: Hash,
            iconBg: 'bg-teal-500',
            hoverBorder: 'hover:border-teal-200',
            hoverShadow: 'hover:shadow-teal-100/50'
        },
        {
            key: 'shortStraw',
            href: `/${locale}/tools/short-straw`,
            icon: Shuffle,
            iconBg: 'bg-indigo-500',
            hoverBorder: 'hover:border-indigo-200',
            hoverShadow: 'hover:shadow-indigo-100/50'
        },
    ];

    return (
        <footer className="w-full mt-auto relative overflow-hidden bg-gradient-to-b from-white to-gray-50/80">
            {/* Soft top border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10">
                <div className="flex flex-col items-center space-y-8 sm:space-y-12">

                    {/* Brand Logo */}
                    <div className="w-full flex justify-center">
                        <Link href={`/${locale}`} className="group flex items-center gap-3 sm:gap-4 transition-transform hover:scale-105 active:scale-95 duration-200">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-100 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" />
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 p-1.5 sm:p-2 bg-white rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-center">
                                    <img src="/icon.png" alt="YulaSanta Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                                    Yula<span className="text-santa-red">Santa</span>
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5 sm:mt-1">
                                    Premium Raffle
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {/* Tools Section - Hide on Home Page to avoid duplication */}
                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {!isHomePage && (
                        <div className="w-full">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-xl">
                                {/* Section Title */}
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-santa-red rounded-full" />
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 tracking-wide">
                                        {tTools('title')}
                                    </h3>
                                </div>

                                {/* Tools Grid - 2 columns */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {tools.map((tool) => (
                                        <Link
                                            key={tool.key}
                                            href={tool.href}
                                            title={`${tTools(tool.key as keyof typeof tool)} - Online Ücretsiz Araç`}
                                            className={`group flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-100 ${tool.hoverBorder} hover:shadow-lg ${tool.hoverShadow} transition-all duration-300`}
                                        >
                                            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${tool.iconBg} shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <span className="text-sm sm:text-base text-gray-600 group-hover:text-gray-900 font-medium transition-colors truncate">
                                                {tTools(tool.key as keyof typeof tool)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                        <nav className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4">
                            <Link
                                href={`/${locale}/privacy`}
                                className="group relative text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {t('privacyPolicy')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-200" />
                            <Link
                                href={`/${locale}/legal`}
                                className="group relative text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {t('legalInfo')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                        </nav>
                    </div>

                    {/* Copyright and Cookie Disclaimer */}
                    <div className="w-full max-w-3xl border-t border-gray-100 pt-6 sm:pt-8 flex flex-col items-center space-y-4 sm:space-y-6">
                        <p className="text-gray-400 text-[10px] sm:text-xs font-bold tracking-wide text-center">
                            {t('copyright')}
                        </p>

                        <p className="text-[9px] sm:text-[10px] leading-relaxed text-gray-400 text-center max-w-2xl font-medium opacity-60 px-4 uppercase tracking-[0.03em] sm:tracking-[0.05em]">
                            {t('cookieDisclaimer')}
                        </p>
                    </div>

                    {/* Signature Badge */}
                    <div className="pt-2 sm:pt-4">
                        <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-50/80 border border-gray-100 shadow-sm backdrop-blur-sm">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-santa-red animate-pulse mr-2 sm:mr-2.5" />
                            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.15em] text-gray-400 uppercase">
                                Crafted with passion by YulaSanta
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
