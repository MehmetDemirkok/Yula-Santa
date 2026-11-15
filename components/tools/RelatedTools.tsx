"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Aperture, Coins, Dice5, Gift, Hash, Sparkles, Trophy, Users, Wand2, type LucideIcon } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { localePath } from "@/lib/localePath";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";

type Tool = { path: string; icon: LucideIcon; label: string };

const noSubscribe = () => () => {};

/**
 * Links to the other tools under each tool page. Most visitors arrive on one
 * tool from search and leave after a single page, so this gives them a next step.
 * In the New Year season a Secret Santa card leads the list.
 */
export function RelatedTools() {
    const locale = useLocale();
    const pathname = usePathname();
    const t = useTranslations("tools");
    const tFooter = useTranslations("footer");
    // The season depends on the visitor's date, so the server render leaves the card out.
    const season = useSyncExternalStore(noSubscribe, isNewYearThemeActive, () => false);

    // The tools index already lists everything.
    if (pathname === "/tools") return null;

    const tools: Tool[] = [
        { path: "/tools/wheel-of-fortune", icon: Aperture, label: t("wheelOfFortune") },
        { path: "/raffle", icon: Trophy, label: tFooter("namePicker") },
        { path: "/tools/team-generator", icon: Users, label: t("teamGenerator") },
        { path: "/tools/short-straw", icon: Wand2, label: t("shortStraw") },
        { path: "/tools/dice", icon: Dice5, label: t("dice") },
        { path: "/tools/coin-flip", icon: Coins, label: t("coinFlip") },
        { path: "/tools/random-number", icon: Hash, label: t("randomNumber") },
        { path: "/tools/gift-suggestions", icon: Gift, label: t("giftSuggestions") },
    ].filter((tool) => tool.path !== pathname);

    return (
        <section aria-labelledby="related-tools-title" className="px-4 pb-12 sm:pb-16">
            <div className="max-w-4xl mx-auto space-y-4">
                {season && (
                    <Link
                        href={localePath(locale, "/secret-santa")}
                        className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 rounded-2xl bg-gradient-to-br from-santa-red to-red-700 p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6" />
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block font-heading text-lg sm:text-xl font-extrabold">{t("related.santaTitle")}</span>
                            <span className="block text-sm text-white/85 mt-1">{t("related.santaDesc")}</span>
                        </span>
                        <span className="inline-flex items-center justify-center h-[48px] px-5 rounded-xl bg-white text-santa-red font-bold text-sm shrink-0 group-hover:bg-red-50 transition-colors">
                            {t("related.santaCta")}
                        </span>
                    </Link>
                )}

                <h2 id="related-tools-title" className="font-heading text-lg font-bold text-[var(--text-primary)]">
                    {t("related.title")}
                </h2>
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {tools.map(({ path, icon: Icon, label }) => (
                        <li key={path}>
                            <Link
                                href={localePath(locale, path)}
                                className="flex items-center gap-2.5 min-h-[56px] h-full rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-santa-red transition-colors"
                            >
                                <Icon className="w-5 h-5 text-santa-red shrink-0" aria-hidden />
                                <span className="min-w-0">{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
