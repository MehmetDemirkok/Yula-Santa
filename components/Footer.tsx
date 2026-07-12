"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
    Instagram,
    Gift,
    Dice1,
    Coins,
    Hash,
    Shuffle,
    Aperture,
    Users,
    PartyPopper,
    Youtube,
    Trophy
} from 'lucide-react';

// Custom brand icons (not available in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor">
            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
        </svg>
    );
}

function TwitterIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

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
            key: 'dice',
            href: `/${locale}/tools/dice`,
            icon: Dice1,
            iconBg: 'bg-blue-500',
            hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-500/30',
            hoverShadow: 'hover:shadow-blue-100/50 dark:hover:shadow-blue-500/20'
        },
        {
            key: 'coinFlip',
            href: `/${locale}/tools/coin-flip`,
            icon: Coins,
            iconBg: 'bg-amber-500',
            hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-500/30',
            hoverShadow: 'hover:shadow-amber-100/50 dark:hover:shadow-amber-500/20'
        },
        {
            key: 'randomNumber',
            href: `/${locale}/tools/random-number`,
            icon: Hash,
            iconBg: 'bg-teal-500',
            hoverBorder: 'hover:border-teal-200 dark:hover:border-teal-500/30',
            hoverShadow: 'hover:shadow-teal-100/50 dark:hover:shadow-teal-500/20'
        },
        {
            key: 'shortStraw',
            href: `/${locale}/tools/short-straw`,
            icon: Shuffle,
            iconBg: 'bg-indigo-500',
            hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-500/30',
            hoverShadow: 'hover:shadow-indigo-100/50 dark:hover:shadow-indigo-500/20'
        },
        {
            key: 'wheelOfFortune',
            href: `/${locale}/tools/wheel-of-fortune`,
            icon: Aperture,
            iconBg: 'bg-pink-500',
            hoverBorder: 'hover:border-pink-200 dark:hover:border-pink-500/30',
            hoverShadow: 'hover:shadow-pink-100/50 dark:hover:shadow-pink-500/20'
        },
        {
            key: 'teamGenerator',
            href: `/${locale}/tools/team-generator`,
            icon: Users,
            iconBg: 'bg-sky-500',
            hoverBorder: 'hover:border-sky-200 dark:hover:border-sky-500/30',
            hoverShadow: 'hover:shadow-sky-100/50 dark:hover:shadow-sky-500/20'
        },
        {
            key: 'giftSuggestions',
            href: `/${locale}/tools/gift-suggestions`,
            icon: PartyPopper,
            iconBg: 'bg-fuchsia-500',
            hoverBorder: 'hover:border-fuchsia-200 dark:hover:border-fuchsia-500/30',
            hoverShadow: 'hover:shadow-fuchsia-100/50 dark:hover:shadow-fuchsia-500/20'
        },
    ];

    // Social media giveaway tools (per-platform winner pickers)
    const giveaways = [
        {
            label: 'Instagram',
            href: `/${locale}/instagram`,
            icon: Instagram,
            iconBg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
            hoverBorder: 'hover:border-pink-200 dark:hover:border-pink-500/30',
            hoverShadow: 'hover:shadow-pink-100/50 dark:hover:shadow-pink-500/20'
        },
        {
            label: 'YouTube',
            href: `/${locale}/youtube`,
            icon: Youtube,
            iconBg: 'bg-red-600',
            hoverBorder: 'hover:border-red-200 dark:hover:border-red-500/30',
            hoverShadow: 'hover:shadow-red-100/50 dark:hover:shadow-red-500/20'
        },
        {
            label: 'TikTok',
            href: `/${locale}/tiktok`,
            icon: TikTokIcon,
            iconBg: 'bg-black',
            hoverBorder: 'hover:border-gray-300 dark:hover:border-white/20',
            hoverShadow: 'hover:shadow-gray-200/50 dark:hover:shadow-white/10'
        },
        {
            label: 'Twitter (X)',
            href: `/${locale}/twitter`,
            icon: TwitterIcon,
            iconBg: 'bg-black',
            hoverBorder: 'hover:border-gray-300 dark:hover:border-white/20',
            hoverShadow: 'hover:shadow-gray-200/50 dark:hover:shadow-white/10'
        },
        {
            label: t('secretSanta'),
            href: `/${locale}/secret-santa`,
            icon: Gift,
            iconBg: 'bg-santa-red',
            hoverBorder: 'hover:border-red-200 dark:hover:border-red-500/30',
            hoverShadow: 'hover:shadow-red-100/50 dark:hover:shadow-red-500/20'
        },
        {
            label: t('namePicker'),
            href: `/${locale}/raffle`,
            icon: Trophy,
            iconBg: 'bg-foreground',
            hoverBorder: 'hover:border-gray-300 dark:hover:border-white/20',
            hoverShadow: 'hover:shadow-gray-200/50 dark:hover:shadow-white/10'
        },
    ];

    return (
        <footer className="w-full mt-auto relative overflow-hidden bg-[var(--background)]">
            {/* Soft top border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--border-medium)] to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10">
                <div className="flex flex-col items-center space-y-8 sm:space-y-12">

                    {/* Brand Logo */}
                    <div className="w-full flex justify-center">
                        <Link href={`/${locale}`} className="group flex items-center gap-3 sm:gap-4 transition-transform hover:scale-105 active:scale-95 duration-200">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" />
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 p-1.5 sm:p-2 bg-[var(--card-bg)] rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-[var(--card-border)] flex items-center justify-center">
                                    <img src="/icon.png" alt="YulaSanta Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-heading text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-none">
                                    Yula<span className="text-santa-red">Santa</span>
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5 sm:mt-1">
                                    Premium Raffle
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {/* Tools + Giveaways Section - Hide on Home Page to avoid duplication */}
                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {!isHomePage && (
                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Tools */}
                            <div className="ys-card p-4 sm:p-6 md:p-8">
                                {/* Section Title */}
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-santa-red rounded-full" />
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-wide">
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
                                            className={`group flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] dark:border-white/5 ${tool.hoverBorder} hover:shadow-lg ${tool.hoverShadow} transition-all duration-300`}
                                        >
                                            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${tool.iconBg} shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <span className="text-sm sm:text-base text-[var(--text-secondary)] group-hover:text-foreground font-medium transition-colors truncate">
                                                {tTools(tool.key as keyof typeof tool)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Giveaways */}
                            <div className="ys-card p-4 sm:p-6 md:p-8">
                                {/* Section Title */}
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-santa-red rounded-full" />
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-wide">
                                        {t('socialGiveaways')}
                                    </h3>
                                </div>

                                {/* Giveaways Grid - 2 columns */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {giveaways.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            title={`${item.label} - YulaSanta`}
                                            className={`group flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] dark:border-white/5 ${item.hoverBorder} hover:shadow-lg ${item.hoverShadow} transition-all duration-300`}
                                        >
                                            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${item.iconBg} shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <span className="text-sm sm:text-base text-[var(--text-secondary)] group-hover:text-foreground font-medium transition-colors truncate">
                                                {item.label}
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
                                href={`/${locale}/about`}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t('about')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={`/${locale}/contact`}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t('contact')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={`/${locale}/privacy`}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t('privacyPolicy')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={`/${locale}/legal`}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t('legalInfo')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={`/${locale}/faq`}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {locale === 'tr' ? 'SSS' : 'FAQ'}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                        </nav>
                    </div>

                    {/* Copyright and Cookie Disclaimer */}
                    <div className="w-full max-w-3xl border-t border-[var(--border-light)] dark:border-white/10 pt-6 sm:pt-8 flex flex-col items-center space-y-4 sm:space-y-6">
                        <p className="text-[var(--text-muted)] text-[10px] sm:text-xs font-bold tracking-wide text-center">
                            {t('copyright')}
                        </p>

                        <p className="text-[9px] sm:text-[10px] leading-relaxed text-[var(--text-muted)] text-center max-w-2xl font-medium opacity-60 px-4 uppercase tracking-[0.03em] sm:tracking-[0.05em]">
                            {t('cookieDisclaimer')}
                        </p>
                    </div>

                    {/* Signature Badge */}
                    <div className="pt-2 sm:pt-4 flex flex-col items-center">
                        {/* Yula the Cat - Animated Mascot */}
                        <div className="relative mb-6 group cursor-pointer">
                            <div className="absolute -inset-4 bg-red-100 dark:bg-red-500/10 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full animate-pulse" />
                            {/* Container with adaptive background for transparent PNG */}
                            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[var(--surface-2)] via-[var(--card-bg)] to-[var(--surface-2)] dark:from-gray-900/80 dark:via-gray-950/90 dark:to-black/80 shadow-xl dark:shadow-none border border-[var(--border-medium)] dark:border-white/5 overflow-hidden backdrop-blur-sm">
                                {/* Subtle gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-santa-red/5 to-transparent dark:from-santa-red/5 dark:to-transparent pointer-events-none" />
                                {/* Decorative sparkles */}
                                <div className="absolute top-3 right-3 w-2 h-2 bg-gold rounded-full opacity-70 dark:opacity-40 animate-pulse" />
                                <div className="absolute top-5 right-6 w-1 h-1 bg-santa-red rounded-full opacity-50 dark:opacity-30 animate-pulse" style={{ animationDelay: '0.3s' }} />
                                <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-christmas-green rounded-full opacity-60 dark:opacity-30 animate-pulse" style={{ animationDelay: '0.6s' }} />
                                <div className="absolute bottom-5 left-6 w-1 h-1 bg-gold rounded-full opacity-40 dark:opacity-20 animate-pulse" style={{ animationDelay: '0.9s' }} />
                                <img
                                    src="/yula-mascot.png"
                                    alt="Yula the Cat"
                                    className="w-36 sm:w-44 md:w-52 h-auto object-contain relative z-10 animate-float drop-shadow-lg"
                                />
                            </div>
                            {/* Speech Bubble on Hover */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--card-bg)] px-4 py-2 rounded-2xl shadow-xl border border-[var(--card-border)] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-20">
                                <span className="text-xs font-bold text-foreground">
                                    {locale === 'tr' ? 'Miyav! 🐾' : 'Meow! 🐾'}
                                </span>
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--card-bg)] border-r border-b border-[var(--card-border)] rotate-45" />
                            </div>
                        </div>

                        <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--surface-2)] dark:bg-white/5 border border-[var(--border-light)] dark:border-white/10 shadow-sm backdrop-blur-sm">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-santa-red animate-pulse mr-2 sm:mr-2.5" />
                            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.15em] text-[var(--text-muted)] uppercase">
                                Crafted with passion by YulaSanta
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
