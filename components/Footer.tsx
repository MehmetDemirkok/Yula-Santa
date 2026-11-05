"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { localePath } from "@/lib/localePath";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";

export function Footer() {
    const t = useTranslations("footer");
    const tTools = useTranslations("tools");
    const tHome = useTranslations("home");
    const params = useParams();
    const locale = params.locale as string;

    const tools = [
        { label: tTools("wheelOfFortune"), href: "/tools/wheel-of-fortune" },
        { label: tTools("dice"), href: "/tools/dice" },
        { label: tTools("coinFlip"), href: "/tools/coin-flip" },
        { label: tTools("randomNumber"), href: "/tools/random-number" },
        { label: tTools("shortStraw"), href: "/tools/short-straw" },
        { label: tTools("teamGenerator"), href: "/tools/team-generator" },
        { label: tTools("giftSuggestions"), href: "/tools/gift-suggestions" },
    ];

    const giveaways = [
        { label: tHome("youtubeGiveaway"), href: "/youtube" },
        { label: tHome("tiktokGiveaway"), href: "/tiktok" },
        { label: t("secretSanta"), href: "/secret-santa" },
        { label: t("namePicker"), href: "/raffle" },
    ];

    const siteLinks = [
        { label: t("about"), href: "/about" },
        { label: t("contact"), href: "/contact" },
        { label: t("privacyPolicy"), href: "/privacy" },
        { label: t("legalInfo"), href: "/legal" },
        { label: t("salesTerms"), href: "/mesafeli-satis-sozlesmesi" },
        { label: locale === "tr" ? "SSS" : "FAQ", href: "/faq" },
    ];

    const columnLink =
        "inline-flex min-h-[36px] items-center text-sm text-[var(--text-secondary)] transition-colors hover:text-foreground";

    return (
        <footer className="relative mt-auto w-full bg-[var(--background)]">
            <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--border-medium)] to-transparent" />

            <div className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6 sm:pt-8">
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
                    <div className="col-span-2 lg:col-span-1">
                        <Link href={localePath(locale)} className="inline-flex items-center gap-2.5">
                            <img src="/icon.png" alt="YulaSanta Logo" className="h-9 w-9 rounded-lg object-contain" />
                            <span className="font-heading text-lg font-extrabold leading-none tracking-tight text-foreground">
                                Yula<span className="text-santa-red">Santa</span>
                            </span>
                        </Link>
                        <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">YouTube · TikTok · Secret Santa</p>
                    </div>

                    <nav aria-label={tTools("title")}>
                        <h3 className="mb-1 text-sm font-bold text-foreground">{tTools("title")}</h3>
                        <ul>
                            {tools.map((item) => (
                                <li key={item.href}>
                                    <Link href={localePath(locale, item.href)} className={columnLink}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label={t("socialGiveaways")}>
                        <h3 className="mb-1 text-sm font-bold text-foreground">{t("socialGiveaways")}</h3>
                        <ul>
                            {giveaways.map((item) => (
                                <li key={item.href}>
                                    <Link href={localePath(locale, item.href)} className={columnLink}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="YulaSanta" className="col-span-2 lg:col-span-1">
                        <h3 className="mb-1 hidden text-sm font-bold text-foreground lg:block">YulaSanta</h3>
                        <ul className="flex flex-wrap gap-x-4 lg:block">
                            {siteLinks.map((item) => (
                                <li key={item.href}>
                                    <Link href={localePath(locale, item.href)} className={columnLink}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="mt-5 border-t border-[var(--border-light)] pt-4 text-center dark:border-white/10">
                    <p className="text-xs font-semibold text-[var(--text-muted)]">{t("copyright")}</p>
                    <p className="mx-auto mt-2 max-w-3xl text-[10px] leading-relaxed text-[var(--text-muted)] opacity-70">
                        {t("cookieDisclaimer")}
                    </p>
                </div>

                <div className="mt-6 flex justify-center">
                    <div className="relative overflow-hidden rounded-3xl border border-[var(--border-medium)] bg-gradient-to-br from-[var(--surface-2)] via-[var(--card-bg)] to-[var(--surface-2)] p-6 shadow-xl backdrop-blur-sm dark:border-white/5 dark:from-gray-900/80 dark:via-gray-950/90 dark:to-black/80 dark:shadow-none">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-santa-red/5 to-transparent" />
                        <img
                            src={isNewYearThemeActive() ? "/yula-mascot-santa.png" : "/yula-mascot.png"}
                            alt="Yula the Cat"
                            className="relative z-10 h-auto w-36 object-contain drop-shadow-lg animate-float sm:w-44 md:w-52"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}
