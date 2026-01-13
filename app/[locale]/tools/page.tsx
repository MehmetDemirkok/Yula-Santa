/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Tools Index Page - All Tools Overview
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This page lists all available tools and redirects visitors to specific tools.
 * Fixes 404 errors for /[locale]/tools URLs.
 */

import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import {
    Dice5, Coins, Hash, Wand2, Eye, UserCircle,
    Aperture, Users, Gift, Wrench
} from 'lucide-react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';

export { viewport };

type Props = {
    params: Promise<{ locale: string }>;
};

// Generate static paths for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools',
        translationKey: 'tools.meta'
    });
}

export default async function ToolsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'tools' });

    const tools = [
        {
            name: t('dice'),
            description: t('diceContent.subtitle'),
            icon: Dice5,
            href: `/${locale}/tools/dice`,
            color: 'bg-indigo-500',
            gradient: 'from-indigo-500 to-purple-600'
        },
        {
            name: t('coinFlip'),
            description: t('coinFlipContent.subtitle'),
            icon: Coins,
            href: `/${locale}/tools/coin-flip`,
            color: 'bg-amber-500',
            gradient: 'from-amber-500 to-orange-600'
        },
        {
            name: t('randomNumber'),
            description: t('randomNumberContent.subtitle'),
            icon: Hash,
            href: `/${locale}/tools/random-number`,
            color: 'bg-emerald-500',
            gradient: 'from-emerald-500 to-teal-600'
        },
        {
            name: t('shortStraw'),
            description: t('shortStrawContent.subtitle'),
            icon: Wand2,
            href: `/${locale}/tools/short-straw`,
            color: 'bg-rose-500',
            gradient: 'from-rose-500 to-pink-600'
        },
        {
            name: t('instagramStoryViewer'),
            description: t('instagramStoryContent.subtitle'),
            icon: Eye,
            href: `/${locale}/tools/instagram-story-viewer`,
            color: 'bg-blue-500',
            gradient: 'from-blue-500 to-cyan-600'
        },
        {
            name: t('instagramProfilePicture'),
            description: t('instagramProfileContent.subtitle'),
            icon: UserCircle,
            href: `/${locale}/tools/instagram-profile-picture`,
            color: 'bg-cyan-500',
            gradient: 'from-cyan-500 to-blue-600'
        },
        {
            name: t('wheelOfFortune'),
            description: t('wheelOfFortuneContent.subtitle'),
            icon: Aperture,
            href: `/${locale}/tools/wheel-of-fortune`,
            color: 'bg-pink-500',
            gradient: 'from-pink-500 to-rose-600'
        },
        {
            name: t('teamGenerator'),
            description: t('teamGeneratorContent.subtitle'),
            icon: Users,
            href: `/${locale}/tools/team-generator`,
            color: 'bg-purple-500',
            gradient: 'from-purple-500 to-indigo-600'
        },
        {
            name: t('giftSuggestions'),
            description: t('giftSuggestionsContent.subtitle'),
            icon: Gift,
            href: `/${locale}/tools/gift-suggestions`,
            color: 'bg-red-500',
            gradient: 'from-red-500 to-pink-600'
        },
    ];

    return (
        <main className="min-h-screen py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-[#FFF5F5] to-white dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-santa-red to-red-600 rounded-2xl mb-6 shadow-lg">
                        <Wrench className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('meta.description')}
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool, index) => (
                        <Link
                            key={index}
                            href={tool.href}
                            className="group relative bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 dark:border-white/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${tool.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                    <tool.icon className="w-7 h-7 text-white" />
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-santa-red dark:group-hover:text-gold transition-colors">
                                    {tool.name}
                                </h2>

                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {tool.description}
                                </p>

                                {/* Arrow indicator */}
                                <div className="mt-4 flex items-center text-santa-red dark:text-gold font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="mr-2">{locale === 'tr' ? 'Kullan' : 'Use'}</span>
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
