"use client";

import { useRouter, useParams } from "next/navigation";
import {
    Instagram,
    Youtube,
    Gift,
    Sparkles,
    Dice5,
    Coins,
    Hash,
    Eye,
    UserCircle,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Zap,
    Users,
    Aperture,
    Trophy
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CountdownBanner } from "@/components/NewYearTheme/CountdownBanner";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";
import { Reveal } from "@/components/Reveal";
import { localePath } from '@/lib/localePath';

export default function HomeClientPage() {
    const router = useRouter();
    const { locale } = useParams();
    const t = useTranslations();

    const giveaways = [
        {
            title: "Instagram",
            desc: t('giveaway.instagramDesc'),
            icon: Instagram,
            href: localePath(locale, '/instagram'),
            color: "bg-purple-500 from-purple-500 via-pink-500 to-orange-500",
            shadow: "shadow-pink-200 dark:shadow-pink-500/20"
        },
        {
            title: "YouTube",
            desc: t('giveaway.youtubeDesc'),
            icon: Youtube,
            href: localePath(locale, '/youtube'),
            color: "bg-red-600 from-red-600 to-red-500",
            shadow: "shadow-red-200 dark:shadow-red-500/20"
        },
        {
            title: "TikTok",
            desc: t('giveaway.tiktokDesc'),
            icon: ({ className }: { className?: string }) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor">
                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
                </svg>
            ),
            href: localePath(locale, '/tiktok'),
            color: "bg-black from-black to-gray-800",
            shadow: "shadow-cyan-100 dark:shadow-cyan-500/20"
        },
        {
            title: "Twitter (X)",
            desc: t('giveaway.twitterDesc'),
            icon: ({ className }: { className?: string }) => (
                <svg viewBox="0 0 24 24" className={className} fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            href: localePath(locale, '/twitter'),
            color: "bg-sky-500 from-sky-500 to-blue-600",
            shadow: "shadow-sky-200 dark:shadow-sky-500/20"
        },
    ];

    const raffleTools = [
        {
            title: t('home.secretDraw').replace(' 🤫', ''),
            desc: t('meta.description').split('.')[0],
            icon: Gift,
            href: localePath(locale, '/secret-santa'),
            iconBg: "bg-santa-red text-white",
            accent: "text-santa-red"
        },
        {
            title: ({ tr: "İsim Çekilişi", en: "Name Picker" } as Record<string, string>)[locale as string] || "Name Picker",
            desc: ({ tr: "Listeden adil ve şeffaf kazanan seçin", en: "Pick fair winners from any list" } as Record<string, string>)[locale as string] || "Pick fair winners from any list",
            icon: Trophy,
            href: localePath(locale, '/raffle'),
            iconBg: "bg-foreground text-background",
            accent: "text-foreground"
        }
    ];

    const features = [
        { label: t('home.secure'), icon: ShieldCheck, color: "bg-success-green/10 text-success-green" },
        { label: t('home.fast'), icon: Zap, color: "bg-indigo-accent/10 text-indigo-accent" },
        { label: t('home.noPassword'), icon: CheckCircle2, color: "bg-santa-red/10 text-santa-red" },
        { label: t('home.noRegistration'), icon: Users, color: "bg-foreground/5 dark:bg-foreground/10 text-foreground" },
    ];

    const tools = [
        { name: t('tools.dice'), icon: Dice5, href: localePath(locale, '/tools/dice'), color: "bg-indigo-500", desc: "Zar atın" },
        { name: t('tools.coinFlip'), icon: Coins, href: localePath(locale, '/tools/coin-flip'), color: "bg-amber-500", desc: "Yazı tura" },
        { name: t('tools.randomNumber'), icon: Hash, href: localePath(locale, '/tools/random-number'), color: "bg-emerald-500", desc: "Sayı seç" },
        { name: t('tools.shortStraw'), icon: Sparkles, href: localePath(locale, '/tools/short-straw'), color: "bg-rose-500", desc: "Şansını dene" },
        { name: t('tools.wheelOfFortune'), icon: Aperture, href: localePath(locale, '/tools/wheel-of-fortune'), color: "bg-pink-500", desc: "Çarkıfelek" },
        { name: t('tools.teamGenerator'), icon: Users, href: localePath(locale, '/tools/team-generator'), color: "bg-blue-500", desc: "Takım kur" },
    ];

    return (
        <main className="ys-page-shell overflow-hidden transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative pt-20 pb-8 lg:pt-24 lg:pb-12 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-100/50 dark:bg-red-500/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/40 dark:bg-indigo-500/20 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Text Column */}
                        <Reveal className="order-1 text-center lg:text-left">
                            {isNewYearThemeActive() && (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--santa-red)_10%,transparent)] text-santa-red text-xs sm:text-sm font-bold mb-5 tracking-wide">
                                    <span className="text-gold" aria-hidden>✦</span>
                                    <span>{t('home.happyNewYear')}</span>
                                </div>
                            )}

                            <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg lg:text-display-lg text-foreground tracking-tight mb-4">
                                {t('meta.title').split('|')[0]}
                            </h1>
                            <p className="max-w-xl mx-auto lg:mx-0 text-base lg:text-lg text-[var(--text-secondary)] mb-6 leading-relaxed font-medium">
                                {t('meta.description')}
                            </p>

                            {isNewYearThemeActive() && (
                                <div className="flex justify-center lg:justify-start mb-8">
                                    <CountdownBanner />
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                <Button
                                    onClick={() => router.push(localePath(locale, '/secret-santa'))}
                                    className="w-full sm:w-auto text-sm lg:text-base py-5 px-8 rounded-2xl shadow-xl shadow-red-200 dark:shadow-red-500/20 hover:scale-105 transition-all text-white font-bold"
                                >
                                    {t('home.startDraw')} <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => document.getElementById('draws')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full sm:w-auto text-sm lg:text-base py-5 px-8 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] font-bold"
                                >
                                    {t('home.socialMediaGiveaways')}
                                </Button>
                            </div>
                        </Reveal>

                        {/* Mascot Column */}
                        <Reveal delay={150} className="order-2 flex justify-center items-center">
                            <div className="relative w-40 sm:w-56 lg:w-full lg:max-w-sm aspect-square">
                                <div className="absolute inset-0 bg-santa-red/5 rounded-full blur-3xl"></div>
                                <img
                                    alt="YulaSanta Mascot"
                                    className="relative z-10 w-full h-full object-contain animate-float drop-shadow-xl"
                                    src="/yula-mascot.png"
                                />
                            </div>
                        </Reveal>
                    </div>

                    {/* Feature Row */}
                    <div className="mt-8 lg:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
                        {features.map((feature, i) => (
                            <Reveal key={feature.label} delay={i * 80}>
                                <div className="bento-card flex flex-col items-center text-center gap-2.5 bg-[var(--card-bg)] p-4 lg:p-5 rounded-2xl border border-[var(--card-border)] shadow-sm h-full">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", feature.color)}>
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs lg:text-sm font-bold text-foreground">{feature.label}</span>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Media Giveaways Section */}
            <section id="draws" className="py-12 lg:py-14 bg-[var(--surface-2)]">
                <div className="max-w-6xl mx-auto px-4">
                    <Reveal className="text-center mb-8 lg:mb-10">
                        <h2 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-foreground mb-3">{t('home.socialMediaGiveaways')}</h2>
                        <p className="text-[var(--text-secondary)] font-medium">{t('home.socialDesc')}</p>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                        {giveaways.map((item, i) => (
                            <Reveal key={item.title} delay={i * 90}>
                                <div className="bento-card group relative bg-[var(--card-bg)] rounded-3xl p-5 lg:p-6 shadow-sm hover:shadow-2xl dark:hover:shadow-xl transition-shadow duration-300 border border-[var(--card-border)] flex flex-col h-full text-left">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform",
                                        item.color
                                    )}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed line-clamp-2 flex-grow">{item.desc}</p>
                                    <Button
                                        onClick={() => router.push(item.href)}
                                        className={cn("mt-auto w-full py-3.5 rounded-xl font-bold transition-all", item.color, "text-white opacity-90 hover:opacity-100 hover:shadow-lg", item.shadow)}
                                    >
                                        {t('home.startNow')} <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    {/* Raffle Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 mt-5 lg:mt-6">
                        {raffleTools.map((item, i) => (
                            <Reveal key={item.title} delay={i * 90}>
                                <div className="bento-card group bg-[var(--card-bg)] p-5 lg:p-6 rounded-3xl border border-[var(--card-border)] shadow-sm hover:shadow-2xl dark:hover:shadow-xl transition-shadow duration-300 flex items-center gap-4 sm:gap-5 h-full">
                                    <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center flex-shrink-0", item.iconBg)}>
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className={cn("font-heading text-lg font-bold mb-1.5", item.accent)}>{item.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">{item.desc}</p>
                                        <button
                                            onClick={() => router.push(item.href)}
                                            className={cn("font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all", item.accent)}
                                        >
                                            {t('home.startNow')} <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tools Section */}
            <section className="py-12 lg:py-14 bg-[var(--background)]">
                <div className="max-w-6xl mx-auto px-4">
                    <Reveal className="flex flex-col lg:flex-row items-end justify-between mb-6 lg:mb-8 gap-6">
                        <div className="max-w-xl text-left">
                            <h2 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-foreground mb-3">{t('tools.title')}</h2>
                            <p className="text-[var(--text-secondary)] font-medium">{t('home.toolsDesc')}</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(localePath(locale, '/tools/dice'))}
                            className="bg-[var(--surface-2)] hover:bg-[var(--border-medium)] rounded-full font-bold px-6 text-[var(--text-secondary)]"
                        >
                            {t('home.viewAll')}
                        </Button>
                    </Reveal>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-5">
                        {tools.map((tool, i) => (
                            <Reveal key={tool.name} delay={i * 60}>
                                <button
                                    onClick={() => router.push(tool.href)}
                                    className="bento-card group flex flex-col items-center text-center gap-2.5 p-4 w-full bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:shadow-xl transition-shadow"
                                >
                                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform", tool.color)}>
                                        <tool.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs lg:text-sm font-bold text-foreground">{tool.name}</h4>
                                </button>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
