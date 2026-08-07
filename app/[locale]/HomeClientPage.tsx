"use client";

import { useRouter, useParams } from "next/navigation";
import {
    Youtube,
    Gift,
    Dice5,
    Coins,
    Hash,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Zap,
    Users,
    Trophy,
    Sparkles,
    Aperture
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CountdownBanner } from "@/components/NewYearTheme/CountdownBanner";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";
import { Reveal } from "@/components/Reveal";
import { localePath } from "@/lib/localePath";

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
        </svg>
    );
}

export default function HomeClientPage() {
    const router = useRouter();
    const { locale } = useParams();
    const t = useTranslations();

    const giveaways = [
        {
            title: t("home.youtubeGiveaway"),
            desc: t("giveaway.youtubeDesc"),
            icon: Youtube,
            href: localePath(locale, "/youtube"),
            color: "from-red-600 to-red-500",
            button: "bg-red-600 hover:bg-red-500 shadow-red-200/60 dark:shadow-red-500/20",
            iconWrap: "bg-gradient-to-br from-red-600 to-red-500",
        },
        {
            title: t("home.tiktokGiveaway"),
            desc: t("giveaway.tiktokDesc"),
            icon: TikTokIcon,
            href: localePath(locale, "/tiktok"),
            color: "from-zinc-900 to-zinc-700",
            button: "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-zinc-200/50 dark:shadow-white/10",
            iconWrap: "bg-gradient-to-br from-zinc-900 to-zinc-700",
        },
    ];

    const features = [
        { label: t("home.secure"), icon: ShieldCheck, color: "bg-success-green/10 text-success-green" },
        { label: t("home.fast"), icon: Zap, color: "bg-indigo-accent/10 text-indigo-accent" },
        { label: t("home.noPassword"), icon: CheckCircle2, color: "bg-santa-red/10 text-santa-red" },
        { label: t("home.noRegistration"), icon: Users, color: "bg-foreground/5 dark:bg-foreground/10 text-foreground" },
    ];

    const raffleTools = [
        {
            title: t("home.secretDraw").replace(" 🤫", ""),
            desc: t("home.subtitle"),
            icon: Gift,
            href: localePath(locale, "/secret-santa"),
            iconBg: "bg-santa-red text-white",
            accent: "text-santa-red",
        },
        {
            title: t("footer.namePicker"),
            desc: t("home.namePickerDesc"),
            icon: Trophy,
            href: localePath(locale, "/raffle"),
            iconBg: "bg-foreground text-background",
            accent: "text-foreground",
        },
    ];

    const tools = [
        { name: t("footer.namePicker"), icon: Trophy, href: localePath(locale, "/raffle"), color: "bg-amber-500" },
        { name: t("tools.dice"), icon: Dice5, href: localePath(locale, "/tools/dice"), color: "bg-indigo-500" },
        { name: t("tools.coinFlip"), icon: Coins, href: localePath(locale, "/tools/coin-flip"), color: "bg-amber-500" },
        { name: t("tools.randomNumber"), icon: Hash, href: localePath(locale, "/tools/random-number"), color: "bg-emerald-500" },
        { name: t("tools.shortStraw"), icon: Sparkles, href: localePath(locale, "/tools/short-straw"), color: "bg-rose-500" },
        { name: t("tools.wheelOfFortune"), icon: Aperture, href: localePath(locale, "/tools/wheel-of-fortune"), color: "bg-pink-500" },
        { name: t("tools.teamGenerator"), icon: Users, href: localePath(locale, "/tools/team-generator"), color: "bg-purple-500" },
    ];

    return (
        <main className="ys-page-shell overflow-hidden transition-colors duration-300">
            <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-8%] right-[-8%] w-[420px] h-[420px] bg-red-100/40 dark:bg-red-500/15 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-5%] left-[-8%] w-[380px] h-[380px] bg-cyan-100/30 dark:bg-cyan-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                        <Reveal className="order-1 text-center lg:text-left">
                            {isNewYearThemeActive() && (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--santa-red)_10%,transparent)] text-santa-red text-xs sm:text-sm font-bold mb-6 tracking-wide">
                                    <span className="text-gold" aria-hidden>✦</span>
                                    <span>{t("home.happyNewYear")}</span>
                                </div>
                            )}

                            <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg lg:text-display-lg text-foreground tracking-tight mb-5">
                                {t("home.heroTitle")}
                            </h1>
                            <p className="max-w-xl mx-auto lg:mx-0 text-base lg:text-lg text-[var(--text-secondary)] mb-8 leading-relaxed font-medium">
                                {t("home.heroSubtitle")}
                            </p>

                            {isNewYearThemeActive() && (
                                <div className="flex justify-center lg:justify-start mb-8">
                                    <CountdownBanner />
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                <Button
                                    onClick={() => router.push(localePath(locale, "/youtube"))}
                                    className="w-full sm:w-auto text-sm lg:text-base py-5 px-8 rounded-2xl shadow-xl shadow-red-200/70 dark:shadow-red-500/20 hover:scale-[1.02] transition-all text-white font-bold bg-red-600 hover:bg-red-500"
                                >
                                    <Youtube className="mr-2 w-5 h-5" />
                                    {t("home.youtubeGiveaway")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push(localePath(locale, "/tiktok"))}
                                    className="w-full sm:w-auto text-sm lg:text-base py-5 px-8 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] font-bold"
                                >
                                    <TikTokIcon className="mr-2 w-5 h-5" />
                                    {t("home.tiktokGiveaway")}
                                </Button>
                            </div>
                        </Reveal>

                        <Reveal delay={120} className="order-2 flex justify-center lg:justify-end">
                            <div className="relative w-64 sm:w-80 lg:w-full lg:max-w-md xl:max-w-lg aspect-square">
                                <div className="absolute inset-0 bg-santa-red/5 rounded-full blur-3xl scale-90" />
                                <img
                                    alt="YulaSanta Mascot"
                                    className="relative z-10 w-full h-full object-contain animate-float drop-shadow-2xl"
                                    src="/yula-mascot.png"
                                />
                            </div>
                        </Reveal>
                    </div>

                    <div className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        {features.map((feature, i) => (
                            <Reveal key={feature.label} delay={i * 70}>
                                <div className="flex flex-col items-center text-center gap-2.5 bg-[var(--card-bg)]/70 p-4 lg:p-5 rounded-2xl border border-[var(--card-border)] h-full">
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

            <section id="draws" className="py-16 lg:py-24 bg-[var(--surface-2)]">
                <div className="max-w-5xl mx-auto px-4">
                    <Reveal className="text-center mb-10 lg:mb-14">
                        <h2 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-foreground mb-3">
                            {t("home.socialMediaGiveaways")}
                        </h2>
                        <p className="text-[var(--text-secondary)] font-medium max-w-xl mx-auto">{t("home.socialDesc")}</p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {giveaways.map((item, i) => (
                            <Reveal key={item.href} delay={i * 100}>
                                <div className="group relative bg-[var(--card-bg)] rounded-[1.75rem] p-7 lg:p-9 border border-[var(--card-border)] shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col h-full text-left min-h-[280px]">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-105 transition-transform",
                                        item.iconWrap
                                    )}>
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-heading text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                                    <p className="text-[var(--text-secondary)] mb-8 leading-relaxed flex-grow">{item.desc}</p>
                                    <Button
                                        onClick={() => router.push(item.href)}
                                        className={cn("mt-auto w-full py-4 rounded-xl font-bold text-white transition-all hover:shadow-lg", item.button)}
                                    >
                                        {t("home.startNow")} <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 mt-6 lg:mt-8">
                        {raffleTools.map((item, i) => (
                            <Reveal key={item.href} delay={i * 90}>
                                <div className="group bg-[var(--card-bg)] p-5 lg:p-6 rounded-3xl border border-[var(--card-border)] shadow-sm hover:shadow-xl transition-shadow duration-300 flex items-center gap-4 sm:gap-5 h-full">
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
                                            {t("home.startNow")} <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 lg:py-24 bg-[var(--background)]">
                <div className="max-w-5xl mx-auto px-4">
                    <Reveal className="text-center mb-10 lg:mb-12">
                        <h2 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-foreground mb-3">{t("tools.title")}</h2>
                        <p className="text-[var(--text-secondary)] font-medium max-w-xl mx-auto">{t("home.toolsDesc")}</p>
                    </Reveal>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                        {tools.map((tool, i) => (
                            <Reveal key={tool.href} delay={i * 60}>
                                <button
                                    onClick={() => router.push(tool.href)}
                                    className="group flex flex-col items-center text-center gap-3 p-5 lg:p-6 w-full bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] hover:border-santa-red/25 hover:shadow-lg transition-all"
                                >
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform", tool.color)}>
                                        <tool.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm lg:text-base font-bold text-foreground">{tool.name}</h4>
                                </button>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
