"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { localePath } from "@/lib/localePath";
import {
    Dice1,
    Coins,
    Hash,
    Youtube,
    Trophy,
    Gift,
    Shuffle,
    Aperture,
    Users,
    PartyPopper
} from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
        </svg>
    );
}

export function Footer() {
    const t = useTranslations("footer");
    const tTools = useTranslations("tools");
    const tHome = useTranslations("home");
    const params = useParams();
    const locale = params.locale as string;

    const tools = [
        {
            key: "namePicker",
            label: t("namePicker"),
            href: localePath(locale, "/raffle"),
            icon: Trophy,
            iconBg: "bg-amber-500",
            hoverBorder: "hover:border-amber-200 dark:hover:border-amber-500/30",
        },
        {
            key: "dice",
            label: tTools("dice"),
            href: localePath(locale, "/tools/dice"),
            icon: Dice1,
            iconBg: "bg-blue-500",
            hoverBorder: "hover:border-blue-200 dark:hover:border-blue-500/30",
        },
        {
            key: "coinFlip",
            label: tTools("coinFlip"),
            href: localePath(locale, "/tools/coin-flip"),
            icon: Coins,
            iconBg: "bg-amber-500",
            hoverBorder: "hover:border-amber-200 dark:hover:border-amber-500/30",
        },
        {
            key: "randomNumber",
            label: tTools("randomNumber"),
            href: localePath(locale, "/tools/random-number"),
            icon: Hash,
            iconBg: "bg-teal-500",
            hoverBorder: "hover:border-teal-200 dark:hover:border-teal-500/30",
        },
        {
            key: "shortStraw",
            label: tTools("shortStraw"),
            href: localePath(locale, "/tools/short-straw"),
            icon: Shuffle,
            iconBg: "bg-indigo-500",
            hoverBorder: "hover:border-indigo-200 dark:hover:border-indigo-500/30",
        },
        {
            key: "wheelOfFortune",
            label: tTools("wheelOfFortune"),
            href: localePath(locale, "/tools/wheel-of-fortune"),
            icon: Aperture,
            iconBg: "bg-pink-500",
            hoverBorder: "hover:border-pink-200 dark:hover:border-pink-500/30",
        },
        {
            key: "teamGenerator",
            label: tTools("teamGenerator"),
            href: localePath(locale, "/tools/team-generator"),
            icon: Users,
            iconBg: "bg-sky-500",
            hoverBorder: "hover:border-sky-200 dark:hover:border-sky-500/30",
        },
        {
            key: "giftSuggestions",
            label: tTools("giftSuggestions"),
            href: localePath(locale, "/tools/gift-suggestions"),
            icon: PartyPopper,
            iconBg: "bg-fuchsia-500",
            hoverBorder: "hover:border-fuchsia-200 dark:hover:border-fuchsia-500/30",
        },
    ];

    const giveaways = [
        {
            label: tHome("youtubeGiveaway"),
            href: localePath(locale, "/youtube"),
            icon: Youtube,
            iconBg: "bg-red-600",
            hoverBorder: "hover:border-red-200 dark:hover:border-red-500/30",
        },
        {
            label: tHome("tiktokGiveaway"),
            href: localePath(locale, "/tiktok"),
            icon: TikTokIcon,
            iconBg: "bg-black",
            hoverBorder: "hover:border-gray-300 dark:hover:border-white/20",
        },
        {
            label: t("secretSanta"),
            href: localePath(locale, "/secret-santa"),
            icon: Gift,
            iconBg: "bg-santa-red",
            hoverBorder: "hover:border-red-200 dark:hover:border-red-500/30",
        },
        {
            label: t("namePicker"),
            href: localePath(locale, "/raffle"),
            icon: Trophy,
            iconBg: "bg-foreground",
            hoverBorder: "hover:border-gray-300 dark:hover:border-white/20",
        },
    ];

    return (
        <footer className="w-full mt-auto relative overflow-hidden bg-[var(--background)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--border-medium)] to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10">
                <div className="flex flex-col items-center space-y-8 sm:space-y-12">
                    <div className="w-full flex justify-center">
                        <Link href={localePath(locale)} className="group flex items-center gap-3 sm:gap-4 transition-transform hover:scale-105 active:scale-95 duration-200">
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
                                    YouTube · TikTok · Secret Santa
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="ys-card p-4 sm:p-6 md:p-8">
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-santa-red rounded-full" />
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-wide">
                                        {tTools("title")}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {tools.map((tool) => (
                                        <Link
                                            key={tool.href}
                                            href={tool.href}
                                            className={`group flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] dark:border-white/5 ${tool.hoverBorder} hover:shadow-lg transition-all duration-300`}
                                        >
                                            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${tool.iconBg} shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <span className="text-sm sm:text-base text-[var(--text-secondary)] group-hover:text-foreground font-medium transition-colors truncate">
                                                {tool.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="ys-card p-4 sm:p-6 md:p-8">
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-santa-red rounded-full" />
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-wide">
                                        {t("socialGiveaways")}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {giveaways.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`group flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] dark:border-white/5 ${item.hoverBorder} hover:shadow-lg transition-all duration-300`}
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

                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                        <nav className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4">
                            <Link
                                href={localePath(locale, "/about")}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t("about")}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={localePath(locale, "/contact")}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t("contact")}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={localePath(locale, "/privacy")}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t("privacyPolicy")}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={localePath(locale, "/legal")}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {t("legalInfo")}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--border-medium)]" />
                            <Link
                                href={localePath(locale, "/faq")}
                                className="group relative text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                            >
                                {locale === "tr" ? "SSS" : "FAQ"}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-santa-red transition-all group-hover:w-full rounded-full" />
                            </Link>
                        </nav>
                    </div>

                    <div className="w-full max-w-3xl border-t border-[var(--border-light)] dark:border-white/10 pt-6 sm:pt-8 flex flex-col items-center space-y-4 sm:space-y-6">
                        <p className="text-[var(--text-muted)] text-[10px] sm:text-xs font-bold tracking-wide text-center">
                            {t("copyright")}
                        </p>
                        <p className="text-[9px] sm:text-[10px] leading-relaxed text-[var(--text-muted)] text-center max-w-2xl font-medium opacity-60 px-4 uppercase tracking-[0.03em] sm:tracking-[0.05em]">
                            {t("cookieDisclaimer")}
                        </p>
                    </div>

                    <div className="pt-2 sm:pt-4 flex flex-col items-center">
                        <div className="relative mb-6 group cursor-pointer">
                            <div className="absolute -inset-4 bg-red-100 dark:bg-red-500/10 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full animate-pulse" />
                            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[var(--surface-2)] via-[var(--card-bg)] to-[var(--surface-2)] dark:from-gray-900/80 dark:via-gray-950/90 dark:to-black/80 shadow-xl dark:shadow-none border border-[var(--border-medium)] dark:border-white/5 overflow-hidden backdrop-blur-sm">
                                <div className="absolute inset-0 bg-gradient-to-t from-santa-red/5 to-transparent pointer-events-none" />
                                <img
                                    src="/yula-mascot.png"
                                    alt="Yula the Cat"
                                    className="w-36 sm:w-44 md:w-52 h-auto object-contain relative z-10 animate-float drop-shadow-lg"
                                />
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
