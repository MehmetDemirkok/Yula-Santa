/**
 * ═══════════════════════════════════════════════════════════════════════════
 * About Page - Hakkımızda
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Users, Shield, Zap, Heart, Globe } from 'lucide-react';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';

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
        path: '/about',
        translationKey: 'about.meta'
    });
}

export default async function AboutPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'about' });

    const features = [
        { icon: Gift, titleKey: 'features.free.title', descKey: 'features.free.desc', color: 'text-santa-red bg-red-50 dark:bg-red-500/10' },
        { icon: Shield, titleKey: 'features.secure.title', descKey: 'features.secure.desc', color: 'text-green-600 bg-green-50 dark:bg-green-500/10' },
        { icon: Zap, titleKey: 'features.fast.title', descKey: 'features.fast.desc', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
        { icon: Users, titleKey: 'features.easy.title', descKey: 'features.easy.desc', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
        { icon: Globe, titleKey: 'features.global.title', descKey: 'features.global.desc', color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' },
        { icon: Heart, titleKey: 'features.passion.title', descKey: 'features.passion.desc', color: 'text-pink-600 bg-pink-50 dark:bg-pink-500/10' },
    ];

    return (
        <main className="ys-page-shell py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-[var(--card-bg)] rounded-2xl mb-6 shadow-lg border border-[var(--border-light)]">
                        <img src="/icon.png" alt="YulaSanta Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Story Section */}
                <section className="mb-12 sm:mb-16">
                    <div className="ys-card p-6 sm:p-8 md:p-10">
                        <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-santa-red rounded-full"></span>
                            {t('story.title')}
                        </h2>
                        <div className="max-w-none space-y-4">
                            <p className="text-body-md text-[var(--text-secondary)]">
                                {t('story.p1')}
                            </p>
                            <p className="text-body-md text-[var(--text-secondary)]">
                                {t('story.p2')}
                            </p>
                            <p className="text-body-md text-[var(--text-secondary)]">
                                {t('story.p3')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="mb-12 sm:mb-16">
                    <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-8 text-center">
                        {t('whyUs.title')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="ys-card p-6 hover:-translate-y-1"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                                    {t(feature.titleKey)}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    {t(feature.descKey)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mission Section */}
                <section className="mb-12 sm:mb-16">
                    <div className="bg-gradient-to-br from-santa-red to-red-600 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl">
                        <h2 className="font-heading text-headline-md mb-6">
                            {t('mission.title')}
                        </h2>
                        <p className="text-body-lg opacity-95">
                            {t('mission.desc')}
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center">
                    <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-6">
                        {t('cta.title')}
                    </h2>
                    <p className="text-body-md text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
                        {t('cta.desc')}
                    </p>
                    <Link
                        href={locale === 'tr' ? '/' : `/${locale}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-santa-red text-white font-bold text-lg rounded-lg shadow-[0_4px_16px_rgba(182,23,34,0.25)] hover:shadow-[0_8px_24px_rgba(182,23,34,0.32)] hover:brightness-110 transition-all"
                    >
                        <Gift className="w-5 h-5" />
                        {t('cta.button')}
                    </Link>
                </section>
            </div>
        </main>
    );
}
