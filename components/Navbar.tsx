"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import {
    Youtube,
    Gift,
    ChevronDown,
    Menu,
    X,
    Dice5,
    Coins,
    Hash,
    Gamepad2,
    Trophy,
    Wand2,
    Aperture,
    Users,
    PartyPopper,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/localePath";

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
        </svg>
    );
}

export function Navbar() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const locale = params.locale as string;
    const t = useTranslations();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const toolLinks = [
        {
            name: t("tools.dice"),
            description: t("tools.diceContent.subtitle"),
            icon: Dice5,
            href: localePath(locale, "/tools/dice"),
            color: "bg-indigo-500",
        },
        {
            name: t("tools.coinFlip"),
            description: t("tools.coinFlipContent.subtitle"),
            icon: Coins,
            href: localePath(locale, "/tools/coin-flip"),
            color: "bg-amber-500",
        },
        {
            name: t("tools.randomNumber"),
            description: t("tools.randomNumberContent.subtitle"),
            icon: Hash,
            href: localePath(locale, "/tools/random-number"),
            color: "bg-emerald-500",
        },
        {
            name: t("tools.shortStraw"),
            description: t("tools.shortStrawContent.subtitle"),
            icon: Wand2,
            href: localePath(locale, "/tools/short-straw"),
            color: "bg-rose-500",
        },
        {
            name: t("tools.wheelOfFortune"),
            description: t("tools.wheelOfFortuneContent.subtitle"),
            icon: Aperture,
            href: localePath(locale, "/tools/wheel-of-fortune"),
            color: "bg-pink-500",
        },
        {
            name: t("tools.teamGenerator"),
            description: t("tools.teamGeneratorContent.subtitle"),
            icon: Users,
            href: localePath(locale, "/tools/team-generator"),
            color: "bg-purple-500",
        },
    ];

    const primaryLinks = [
        {
            name: t("home.youtubeGiveaway"),
            href: localePath(locale, "/youtube"),
            icon: Youtube,
            active: pathname?.includes("/youtube"),
        },
        {
            name: t("home.tiktokGiveaway"),
            href: localePath(locale, "/tiktok"),
            icon: TikTokIcon,
            active: pathname?.includes("/tiktok"),
        },
        {
            name: t("home.secretDraw").replace(" 🤫", ""),
            href: localePath(locale, "/secret-santa"),
            icon: Gift,
            active: pathname?.includes("/secret-santa"),
        },
        {
            name: t("footer.namePicker"),
            href: localePath(locale, "/raffle"),
            icon: Trophy,
            active: pathname?.includes("/raffle"),
        },
        {
            name: t("tools.giftSuggestions"),
            href: localePath(locale, "/tools/gift-suggestions"),
            icon: PartyPopper,
            active: pathname?.includes("/tools/gift-suggestions"),
        },
    ];

    const toolsActive = pathname?.includes("/tools") && !pathname?.includes("/tools/gift-suggestions");

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-[100] transition-[padding] duration-300",
                    scrolled ? "py-2.5" : "py-4 sm:py-5"
                )}
            >
                {/* Background layer — kept separate from the gradient rule below so the
                    festive underline reads crisply against the blur regardless of scroll state. */}
                <div
                    aria-hidden
                    className={cn(
                        "absolute inset-0 transition-all duration-300",
                        scrolled
                            ? "bg-[var(--card-bg)]/85 backdrop-blur-xl border-b border-[var(--card-border)] shadow-[0_8px_28px_rgba(17,24,39,0.06)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.4)]"
                            : "bg-transparent"
                    )}
                />
                <div
                    aria-hidden
                    className={cn(
                        "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-santa-red via-gold to-indigo-accent transition-opacity duration-500",
                        scrolled ? "opacity-70" : "opacity-0"
                    )}
                />

                <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center justify-between gap-3">
                        <button
                            onClick={() => router.push(localePath(locale))}
                            className="flex items-center gap-2.5 sm:gap-3 group relative z-10 shrink-0"
                        >
                            <span className="relative flex">
                                <span
                                    aria-hidden
                                    className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-santa-red to-gold opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
                                />
                                <span className="relative flex p-1.5 bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--card-border)] group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300">
                                    <img src="/icon.png" alt="YulaSanta Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
                                </span>
                            </span>
                            <span className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                                Yula<span className="text-santa-red">Santa</span>
                            </span>
                        </button>

                        <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-[var(--surface-2)]/70 border border-[var(--border-light)] dark:border-white/5 backdrop-blur-sm">
                            {primaryLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => router.push(link.href)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3.5 py-2 text-[13px] xl:text-sm font-bold rounded-full transition-all duration-200 whitespace-nowrap",
                                        link.active
                                            ? "bg-santa-red text-white shadow-[0_3px_12px_rgba(182,23,34,0.35)]"
                                            : "text-[var(--text-secondary)] hover:text-foreground hover:bg-[var(--card-bg)]"
                                    )}
                                >
                                    <link.icon className="w-4 h-4 shrink-0" />
                                    {link.name}
                                </button>
                            ))}

                            <div className="relative group/dropdown">
                                <button
                                    className={cn(
                                        "flex items-center gap-1.5 px-3.5 py-2 text-[13px] xl:text-sm font-bold rounded-full transition-all duration-200 whitespace-nowrap",
                                        toolsActive
                                            ? "bg-santa-red text-white shadow-[0_3px_12px_rgba(182,23,34,0.35)]"
                                            : "text-[var(--text-secondary)] hover:text-foreground hover:bg-[var(--card-bg)] group-hover/dropdown:text-foreground group-hover/dropdown:bg-[var(--card-bg)]"
                                    )}
                                >
                                    <Gamepad2 className="w-4 h-4 shrink-0" />
                                    {t("tools.title")}
                                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/dropdown:rotate-180" />
                                </button>

                                <div className="absolute top-full right-0 mt-3 w-max min-w-[380px] max-w-[min(92vw,440px)] bg-[var(--card-bg)] backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(17,24,39,0.14)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[var(--card-border)] opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-250 translate-y-3 group-hover/dropdown:translate-y-0 overflow-hidden">
                                    <div className="h-1 bg-gradient-to-r from-santa-red via-gold to-indigo-accent" />
                                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                                        <Gamepad2 className="w-3.5 h-3.5 text-santa-red" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                            {t("tools.title")}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-2.5">
                                        {toolLinks.map((link) => (
                                            <button
                                                key={link.href}
                                                onClick={() => router.push(link.href)}
                                                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-[var(--surface-2)] dark:hover:bg-white/10 transition-all text-left group/item"
                                            >
                                                <div className={cn("w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-md group-hover/item:scale-105 transition-transform", link.color)}>
                                                    <link.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col flex-1 pr-2">
                                                    <span className="text-sm font-bold text-foreground group-hover/item:text-santa-red transition-colors whitespace-nowrap">
                                                        {link.name}
                                                    </span>
                                                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                                                        {link.description}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>
                            <div className="hidden sm:block">
                                <LanguageSwitcher />
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden relative w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--surface-2)] dark:bg-white/10 text-[var(--text-secondary)] hover:bg-[var(--border-medium)] dark:hover:bg-white/20 transition-colors border border-[var(--border-light)] dark:border-white/10"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMenuOpen}
                            >
                                <Menu className={cn("w-6 h-6 absolute transition-all duration-300", isMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100")} />
                                <X className={cn("w-6 h-6 absolute transition-all duration-300", isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50")} />
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            <div
                className={cn(
                    "fixed inset-0 top-0 pt-24 bg-[var(--background)] z-[90] lg:hidden transition-all duration-300 ease-in-out overflow-y-auto pb-20",
                    isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
                )}
            >
                <div className="p-5 space-y-8">
                    <div className="sm:hidden pb-6 border-b border-[var(--border-light)] dark:border-white/10 space-y-4">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-2">
                            {t("languageSwitcher.label")}
                        </p>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {primaryLinks.map((link, i) => (
                            <button
                                key={link.href}
                                onClick={() => router.push(link.href)}
                                style={isMenuOpen ? { animationDelay: `${i * 40}ms` } : undefined}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-2xl border active:scale-[0.98] transition-all",
                                    isMenuOpen && "animate-slide-up opacity-0",
                                    link.active
                                        ? "bg-santa-red/10 border-santa-red/20"
                                        : "bg-[var(--surface-2)] dark:bg-white/5 border-[var(--border-light)] dark:border-white/5"
                                )}
                            >
                                <div className={cn("w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-md", link.active ? "bg-santa-red" : "bg-santa-red/90")}>
                                    <link.icon className="w-6 h-6" />
                                </div>
                                <span className={cn("font-extrabold text-left", link.active ? "text-santa-red" : "text-foreground")}>{link.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-santa-red px-2">
                            <Gamepad2 className="w-5 h-5" />
                            <h3 className="font-black text-xl tracking-tight">{t("tools.title")}</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            {toolLinks.map((link, i) => (
                                <button
                                    key={link.href}
                                    onClick={() => router.push(link.href)}
                                    style={isMenuOpen ? { animationDelay: `${(primaryLinks.length + i) * 40}ms` } : undefined}
                                    className={cn(
                                        "flex items-center gap-4 p-4 bg-[var(--surface-2)] dark:bg-white/5 rounded-2xl border border-[var(--border-light)] dark:border-white/5 active:scale-[0.98] transition-all",
                                        isMenuOpen && "animate-slide-up opacity-0"
                                    )}
                                >
                                    <div className={cn("w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-md", link.color)}>
                                        <link.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col text-left min-w-0">
                                        <span className="font-extrabold text-foreground leading-none mb-1.5">{link.name}</span>
                                        <span className="text-[11px] font-medium text-[var(--text-muted)] line-clamp-1">{link.description}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
