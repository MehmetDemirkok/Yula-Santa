"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import {
    Instagram,
    Youtube,
    Twitter,
    Gift,
    ChevronDown,
    Menu,
    X,
    Sparkles,
    Dice5,
    Coins,
    Hash,
    Eye,
    UserCircle,
    Gamepad2,
    Wand2
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function Navbar() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const locale = params.locale as string;
    const t = useTranslations();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const giveawayLinks = [
        {
            name: "Instagram",
            description: t('giveaway.instagramDesc'),
            icon: Instagram,
            href: `/${locale}/instagram`,
            color: "from-purple-500 via-pink-500 to-orange-400"
        },
        {
            name: "YouTube",
            description: t('giveaway.youtubeDesc'),
            icon: Youtube,
            href: `/${locale}/youtube`,
            color: "from-red-600 to-red-500"
        },
        {
            name: "TikTok",
            description: t('giveaway.tiktokDesc'),
            icon: ({ className }: { className?: string }) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor">
                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
                </svg>
            ),
            href: `/${locale}/tiktok`,
            color: "from-black to-gray-800"
        },
        {
            name: "Twitter / X",
            description: t('giveaway.twitterDesc'),
            icon: Twitter,
            href: `/${locale}/twitter`,
            color: "from-gray-900 to-gray-700"
        },
        {
            name: t('home.secretDraw').replace(' 🤫', ''),
            description: t('meta.description').split('.')[0],
            icon: Gift,
            href: `/${locale}/secret-santa`,
            color: "from-santa-red to-red-600"
        },
    ];

    const toolLinks = [
        { name: t('tools.dice'), description: t('tools.diceContent.subtitle'), icon: Dice5, href: `/${locale}/tools/dice`, color: "bg-indigo-500" },
        { name: t('tools.coinFlip'), description: t('tools.coinFlipContent.subtitle'), icon: Coins, href: `/${locale}/tools/coin-flip`, color: "bg-amber-500" },
        { name: t('tools.randomNumber'), description: t('tools.randomNumberContent.subtitle'), icon: Hash, href: `/${locale}/tools/random-number`, color: "bg-emerald-500" },
        { name: t('tools.shortStraw'), description: t('tools.shortStrawContent.subtitle'), icon: Wand2, href: `/${locale}/tools/short-straw`, color: "bg-rose-500" },
        { name: t('tools.instagramStoryViewer'), description: t('tools.instagramStoryContent.subtitle'), icon: Eye, href: `/${locale}/tools/instagram-story-viewer`, color: "bg-blue-500" },
        { name: t('tools.instagramProfilePicture'), description: t('tools.instagramProfileContent.subtitle'), icon: UserCircle, href: `/${locale}/tools/instagram-profile-picture`, color: "bg-cyan-500" },
    ];

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
                scrolled
                    ? "py-2 bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-b border-gray-100 dark:border-white/10"
                    : "py-4 bg-transparent"
            )}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={() => router.push(`/${locale}`)}
                        className="flex items-center gap-2 group relative z-10"
                    >
                        <div className="p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform duration-300 ring-1 ring-gray-100 dark:ring-gray-700">
                            <img src="/icon.png" alt="YulaSanta Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
                        </div>
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                            Yula<span className="text-santa-red">Santa</span>
                        </span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {/* Çekilişler Dropdown */}
                        <div className="relative group/dropdown">
                            <button className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-santa-red dark:hover:text-santa-red transition-all rounded-full hover:bg-gray-50/80 dark:hover:bg-white/10">
                                <Sparkles className="w-4 h-4" />
                                {t('home.socialMediaGiveaways')}
                                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/dropdown:rotate-180" />
                            </button>

                            <div className="absolute top-full left-0 mt-3 w-max min-w-[340px] lg:min-w-[480px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 translate-y-4 group-hover/dropdown:translate-y-0 p-3 ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
                                <div className="flex flex-col gap-2">
                                    {giveawayLinks.map((link) => (
                                        <button
                                            key={link.name}
                                            onClick={() => router.push(link.href)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-white/10 transition-all text-left group/item"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-lg group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300",
                                                link.color.includes('from') ? `bg-gradient-to-br ${link.color}` : link.color
                                            )}>
                                                <link.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col min-w-0 pr-12">
                                                <span className="text-base font-black text-gray-900 dark:text-white group-hover/item:text-santa-red transition-colors whitespace-nowrap">{link.name}</span>
                                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 leading-tight line-clamp-1">{link.description}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Araçlar Dropdown */}
                        <div className="relative group/dropdown">
                            <button className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all rounded-full hover:bg-gray-50/80 dark:hover:bg-white/10">
                                <Gamepad2 className="w-4 h-4" />
                                {t('tools.title')}
                                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/dropdown:rotate-180" />
                            </button>

                            <div className="absolute top-full right-0 mt-3 w-max min-w-[340px] lg:min-w-[480px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 translate-y-4 group-hover/dropdown:translate-y-0 p-3 ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
                                <div className="flex flex-col gap-2">
                                    {toolLinks.map((link) => (
                                        <button
                                            key={link.name}
                                            onClick={() => router.push(link.href)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-white/10 transition-all text-left group/item"
                                        >
                                            <div className={cn("w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-lg group-hover/item:scale-110 group-hover/item:-rotate-3 transition-all duration-300", link.color)}>
                                                <link.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col min-w-0 pr-12">
                                                <span className="text-base font-black text-gray-900 dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors whitespace-nowrap">{link.name}</span>
                                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 leading-tight line-clamp-1">{link.description}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Theme Toggle, Language & Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle - Desktop */}
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2.5 rounded-xl bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20 transition-colors border border-gray-100 dark:border-white/10"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={cn(
                "fixed inset-0 top-[70px] bg-white dark:bg-gray-900 z-[90] lg:hidden transition-all duration-300 ease-in-out overflow-y-auto pb-20",
                isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            )}>
                <div className="p-4 space-y-8">
                    {/* Mobile Theme Toggle & Language */}
                    <div className="sm:hidden pb-6 border-b border-gray-100 dark:border-white/10 space-y-4">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-2">{t('languageSwitcher.label')}</p>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Giveaways Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-santa-red px-2">
                            <Sparkles className="w-5 h-5" />
                            <h3 className="font-black text-xl italic tracking-tight">{t('home.socialMediaGiveaways')}</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            {giveawayLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => router.push(link.href)}
                                    className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-gray-100/50 dark:border-white/5 active:scale-[0.98]"
                                >
                                    <div className={cn("w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-md",
                                        link.color.includes('from') ? `bg-gradient-to-br ${link.color}` : link.color
                                    )}>
                                        <link.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col text-left min-w-0">
                                        <span className="font-extrabold text-gray-900 dark:text-white leading-none mb-1.5">{link.name}</span>
                                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1">{link.description}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tools Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 px-2">
                            <Gamepad2 className="w-5 h-5" />
                            <h3 className="font-black text-xl italic tracking-tight">{t('tools.title')}</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            {toolLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => router.push(link.href)}
                                    className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all border border-gray-100/50 dark:border-white/5 active:scale-[0.98]"
                                >
                                    <div className={cn("w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-md", link.color)}>
                                        <link.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col text-left min-w-0">
                                        <span className="font-extrabold text-gray-900 dark:text-white leading-none mb-1.5">{link.name}</span>
                                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1">{link.description}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
