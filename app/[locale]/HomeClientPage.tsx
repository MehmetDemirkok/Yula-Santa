"use client";

import { useRouter, useParams } from "next/navigation";
import {
    Instagram,
    Youtube,
    Twitter,
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
    Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CountdownBanner } from "@/components/NewYearTheme/CountdownBanner";

export default function HomeClientPage() {
    const router = useRouter();
    const { locale } = useParams();
    const t = useTranslations();

    const giveaways = [
        {
            title: "Instagram",
            desc: t('giveaway.instagramDesc'),
            icon: Instagram,
            href: `/${locale}/instagram`,
            color: "from-purple-500 via-pink-500 to-orange-500",
            shadow: "shadow-pink-200"
        },
        {
            title: "YouTube",
            desc: t('giveaway.youtubeDesc'),
            icon: Youtube,
            href: `/${locale}/youtube`,
            color: "from-red-600 to-red-500",
            shadow: "shadow-red-200"
        },
        {
            title: "Twitter / X",
            desc: t('giveaway.twitterDesc'),
            icon: Twitter,
            href: `/${locale}/twitter`,
            color: "from-gray-900 to-gray-700",
            shadow: "shadow-gray-200"
        },
        {
            title: "TikTok",
            desc: t('giveaway.tiktokDesc'),
            icon: ({ className }: { className?: string }) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor">
                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
                </svg>
            ),
            href: `/${locale}/tiktok`,
            color: "from-black to-gray-800",
            shadow: "shadow-cyan-100"
        },
        {
            title: t('home.secretDraw').replace(' 🤫', ''),
            desc: t('meta.description').split('.')[0],
            icon: Gift,
            href: `/${locale}/secret-santa`,
            color: "from-santa-red to-red-500",
            shadow: "shadow-red-200"
        }
    ];

    const tools = [
        { name: t('tools.dice'), icon: Dice5, href: `/${locale}/tools/dice`, color: "bg-indigo-500", desc: "Zar atın" },
        { name: t('tools.coinFlip'), icon: Coins, href: `/${locale}/tools/coin-flip`, color: "bg-amber-500", desc: "Yazı tura" },
        { name: t('tools.randomNumber'), icon: Hash, href: `/${locale}/tools/random-number`, color: "bg-emerald-500", desc: "Sayı seç" },
        { name: t('tools.shortStraw'), icon: Sparkles, href: `/${locale}/tools/short-straw`, color: "bg-rose-500", desc: "Şansını dene" },
    ];

    return (
        <main className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-100/50 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-santa-red text-sm font-bold mb-8 animate-bounce">
                        <Sparkles className="w-4 h-4" />
                        <span>{t('home.happyNewYear')}</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
                        {t('meta.title').split('|')[0]}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-500 mb-8 leading-relaxed font-medium">
                        {t('meta.description')}
                    </p>

                    <div className="flex justify-center mb-10">
                        <CountdownBanner />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={() => router.push(`/${locale}/secret-santa`)}
                            className="w-full sm:w-auto text-lg py-7 px-10 rounded-2xl shadow-xl shadow-red-200 hover:scale-105 transition-all text-white font-bold"
                        >
                            {t('home.startDraw')} <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => document.getElementById('draws')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto text-lg py-7 px-10 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-700 font-bold"
                        >
                            {t('home.socialMediaGiveaways')}
                        </Button>
                    </div>

                    {/* Stats or Features */}
                    <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-3">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{t('home.secure')}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                                <Zap className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{t('home.fast')}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{t('home.noPassword')}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{t('home.noRegistration')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Media Giveaways Section */}
            <section id="draws" className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">{t('home.socialMediaGiveaways')}</h2>
                        <p className="text-gray-500 font-medium">{t('home.socialDesc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {giveaways.map((item) => (
                            <div
                                key={item.title}
                                className="group relative bg-white rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-start text-left"
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform",
                                    item.color
                                )}>
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed line-clamp-2">{item.desc}</p>
                                <Button
                                    onClick={() => router.push(item.href)}
                                    className={cn("mt-auto w-full py-6 rounded-2xl font-bold transition-all", item.color, "text-white opacity-90 hover:opacity-100 hover:shadow-lg", item.shadow)}
                                >
                                    {t('home.startNow')} <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tools Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl text-left">
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">{t('tools.title')}</h2>
                            <p className="text-gray-500 font-medium">{t('home.toolsDesc')}</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/${locale}/tools/dice`)}
                            className="bg-gray-100 hover:bg-gray-200 rounded-full font-bold px-6"
                        >
                            {t('home.viewAll')}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {tools.map((tool) => (
                            <button
                                key={tool.name}
                                onClick={() => router.push(tool.href)}
                                className="group flex flex-col items-center p-8 bg-white rounded-[32px] border border-gray-100 hover:border-indigo-100 hover:bg-gray-50/50 hover:shadow-xl transition-all"
                            >
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform", tool.color)}>
                                    <tool.icon className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-black text-gray-900">{tool.name}</h4>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
