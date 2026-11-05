"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
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
    Aperture,
    Play,
    Car,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CountdownBanner } from "@/components/NewYearTheme/CountdownBanner";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";
import { FestiveMascot, GiftBow, HeroDecor, SnowCap } from "@/components/NewYearTheme/HomeDecor";
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
    const { locale } = useParams();
    const t = useTranslations();
    const seasonal = isNewYearThemeActive();

    const trustPoints = [
        { label: t("home.secure"), icon: ShieldCheck, color: "text-success-green" },
        { label: t("home.fast"), icon: Zap, color: "text-indigo-accent" },
        { label: t("home.noPassword"), icon: CheckCircle2, color: "text-santa-red" },
        { label: t("home.noRegistration"), icon: Users, color: "text-foreground" },
    ];

    // Every tool appears exactly once on the page: the main draws first, the rest below.
    const mainDraws = [
        {
            title: t("home.youtubeGiveaway"),
            desc: t("giveaway.youtubeDesc"),
            icon: Youtube,
            href: localePath(locale, "/youtube"),
            iconBg: "bg-red-600 text-white",
            highlight: false,
        },
        {
            title: t("home.tiktokGiveaway"),
            desc: t("giveaway.tiktokDesc"),
            icon: TikTokIcon,
            href: localePath(locale, "/tiktok"),
            iconBg: "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
            highlight: false,
        },
        {
            title: t("home.secretDraw").replace(" 🎄", ""),
            desc: t("home.subtitle"),
            icon: Gift,
            href: localePath(locale, "/secret-santa"),
            iconBg: "bg-santa-red text-white",
            highlight: seasonal,
        },
        {
            title: t("footer.namePicker"),
            desc: t("home.namePickerDesc"),
            icon: Trophy,
            href: localePath(locale, "/raffle"),
            iconBg: "bg-amber-500 text-white",
            highlight: false,
        },
    ];

    const quickTools = [
        { name: t("tools.wheelOfFortune"), icon: Aperture, href: localePath(locale, "/tools/wheel-of-fortune"), color: "bg-pink-500" },
        { name: t("tools.dice"), icon: Dice5, href: localePath(locale, "/tools/dice"), color: "bg-indigo-500" },
        { name: t("tools.coinFlip"), icon: Coins, href: localePath(locale, "/tools/coin-flip"), color: "bg-amber-500" },
        { name: t("tools.randomNumber"), icon: Hash, href: localePath(locale, "/tools/random-number"), color: "bg-emerald-500" },
        { name: t("tools.shortStraw"), icon: Sparkles, href: localePath(locale, "/tools/short-straw"), color: "bg-rose-500" },
        { name: t("tools.teamGenerator"), icon: Users, href: localePath(locale, "/tools/team-generator"), color: "bg-purple-500" },
        { name: t("tools.giftSuggestions"), icon: Gift, href: localePath(locale, "/tools/gift-suggestions"), color: "bg-fuchsia-500" },
    ];

    return (
        <main className="ys-page-shell overflow-hidden !min-h-0 transition-colors duration-300">
            <section className={cn("relative overflow-hidden pb-6 lg:pb-10", seasonal ? "pt-[56px]" : "pt-[36px]")}>
                {seasonal && <HeroDecor />}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-8%] right-[-8%] w-[420px] h-[420px] bg-red-100/40 dark:bg-red-500/15 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-5%] left-[-8%] w-[380px] h-[380px] bg-cyan-100/30 dark:bg-cyan-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-4 px-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-x-12">
                    <Reveal>
                        {seasonal && (
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--santa-red)_10%,transparent)] px-3 py-1 text-xs font-bold tracking-wide text-santa-red lg:mb-4">
                                <span className="text-gold" aria-hidden>✦</span>
                                <span>{t("home.happyNewYear")}</span>
                            </div>
                        )}
                        <h1 className="font-heading text-[26px] font-extrabold leading-tight tracking-tight text-foreground sm:text-headline-lg lg:text-4xl xl:text-display-lg">
                            {t("home.heroTitle")}
                        </h1>
                    </Reveal>

                    <Reveal delay={120} className="lg:row-span-2">
                        <div className="relative aspect-square w-[116px] sm:w-[170px] lg:w-[360px]">
                            <div className="absolute inset-0 scale-90 rounded-full bg-santa-red/5 blur-3xl" />
                            {seasonal ? (
                                <FestiveMascot />
                            ) : (
                                <img
                                    alt="YulaSanta Mascot"
                                    className="relative z-10 h-full w-full object-contain drop-shadow-2xl animate-float"
                                    src="/yula-mascot.png"
                                />
                            )}
                        </div>
                    </Reveal>

                    <Reveal className="col-span-2 lg:col-span-1">
                        <p className="mb-4 max-w-xl text-sm font-medium leading-relaxed text-[var(--text-secondary)] sm:text-base lg:text-lg">
                            {t("home.heroSubtitle")}
                        </p>

                        {seasonal && (
                            <div className="mb-4 max-w-md">
                                <CountdownBanner compact />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                            <Link
                                href={localePath(locale, "/youtube")}
                                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-red-600 px-2 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-red-200/70 transition-all hover:bg-red-500 dark:shadow-red-500/20 sm:px-6 lg:text-base"
                            >
                                <Youtube className="h-5 w-5 shrink-0" />
                                {t("home.youtubeGiveaway")}
                            </Link>
                            <Link
                                href={localePath(locale, "/tiktok")}
                                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] px-2 text-center text-sm font-bold leading-tight text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] sm:px-6 lg:text-base"
                            >
                                <TikTokIcon className="h-5 w-5 shrink-0" />
                                {t("home.tiktokGiveaway")}
                            </Link>
                        </div>

                        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                            {trustPoints.map((point) => (
                                <li key={point.label} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] lg:text-sm">
                                    <point.icon className={cn("h-4 w-4 shrink-0", point.color)} aria-hidden="true" />
                                    {point.label}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </div>
            </section>

            <section id="draws" className="pb-6 lg:pb-10">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="mb-3 font-heading text-xl font-bold tracking-tight text-foreground lg:mb-4 lg:text-2xl">
                        {t("tools.title")}
                    </h2>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                        {mainDraws.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl border bg-[var(--card-bg)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-4 lg:p-5",
                                    seasonal && "pt-4 sm:pt-5 lg:pt-6",
                                    item.highlight
                                        ? "border-[color-mix(in_srgb,var(--gold)_55%,transparent)]"
                                        : "border-[var(--card-border)]"
                                )}
                            >
                                {seasonal && <SnowCap />}
                                {item.highlight && <GiftBow />}
                                <div className="flex items-center justify-between">
                                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl lg:h-12 lg:w-12", item.iconBg)}>
                                        <item.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
                                </div>
                                <h3 className="font-heading text-sm font-bold leading-tight text-foreground sm:text-base lg:text-lg">
                                    {item.title}
                                </h3>
                                <p className="hidden text-sm leading-relaxed text-[var(--text-secondary)] lg:block">{item.desc}</p>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3 lg:grid-cols-4">
                        {quickTools.map((tool) => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group flex min-h-[52px] items-center gap-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-2.5 py-1.5 transition-colors hover:border-santa-red/30"
                            >
                                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white", tool.color)}>
                                    <tool.icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 text-sm font-semibold leading-tight text-foreground">{tool.name}</span>
                            </Link>
                        ))}
                        <Link
                            href={localePath(locale, "/tools")}
                            className="flex min-h-[52px] items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border-medium)] px-2.5 py-1.5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-foreground"
                        >
                            {t("tools.title")}
                            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="pb-8 lg:pb-12">
                <div className="mx-auto max-w-6xl px-4">
                    <Link
                        href={localePath(locale, "/oyun/plaka-avcisi")}
                        className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-3 shadow-md transition-shadow hover:shadow-xl sm:gap-4 sm:p-4"
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                            <Car className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                                <span className="font-heading text-base font-extrabold text-white sm:text-lg">{t("tools.plakaAvcisi")}</span>
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                    {t("tools.new")}
                                </span>
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-emerald-50/90 sm:text-sm">
                                {t("tools.plakaAvcisiShort")}
                            </span>
                        </span>
                        <span className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-sm font-black text-emerald-800 transition-transform group-hover:scale-[1.03] sm:px-5">
                            <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                            {t("tools.play")}
                        </span>
                    </Link>
                </div>
            </section>
        </main>
    );
}
