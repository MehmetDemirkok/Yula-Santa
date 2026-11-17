"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Gift, Youtube } from "lucide-react";
import { shouldShowDrawStats, type PublicDrawStats } from "@/lib/analytics/publicStats";

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
        </svg>
    );
}

/**
 * Real draw counts from /api/stats/draws. Renders nothing until the data is
 * in and the total is worth showing, so a failure never leaves an empty box.
 */
export default function DrawStats() {
    const t = useTranslations("home.stats");
    const locale = useLocale();
    const [stats, setStats] = useState<PublicDrawStats | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/stats/draws", { signal: controller.signal })
            .then((response) => (response.ok ? response.json() : null))
            .then((data: { stats?: PublicDrawStats | null } | null) => setStats(data?.stats ?? null))
            .catch(() => undefined);
        return () => controller.abort();
    }, []);

    if (!shouldShowDrawStats(stats, process.env.NODE_ENV === "development")) return null;

    const number = new Intl.NumberFormat(locale);
    const since = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(`${stats.since}T12:00:00Z`),
    );

    const items = [
        { label: t("youtube"), value: stats.youtube, icon: Youtube, iconClass: "bg-red-600 text-white" },
        { label: t("tiktok"), value: stats.tiktok, icon: TikTokIcon, iconClass: "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" },
        { label: t("secretSanta"), value: stats.secretSanta, icon: Gift, iconClass: "bg-santa-red text-white" },
    ];

    return (
        <section aria-labelledby="draw-stats-title" className="relative pb-8 lg:pb-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:p-5 lg:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-success-green">
                                <span className="relative flex h-2 w-2" aria-hidden="true">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-green opacity-60 motion-reduce:animate-none" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success-green" />
                                </span>
                                {t("live")}
                            </p>
                            <h2 id="draw-stats-title" className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                                {t.rich("title", {
                                    count: stats.total,
                                    formatted: number.format(stats.total),
                                    strong: (chunks) => <span className="text-santa-red tabular-nums">{chunks}</span>,
                                })}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("since", { date: since })}</p>
                        </div>
                        {stats.today > 0 && (
                            <p className="text-sm font-semibold text-[var(--text-secondary)]">
                                {t("today", { count: stats.today, formatted: number.format(stats.today) })}
                            </p>
                        )}
                    </div>

                    <ul className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                        {items.map((item) => (
                            <li key={item.label} className="flex flex-col items-start gap-2 rounded-xl bg-[var(--surface-2)] px-2.5 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${item.iconClass}`}>
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="font-heading text-xl font-extrabold sm:text-2xl leading-none tabular-nums text-foreground">
                                        {number.format(item.value)}
                                    </p>
                                    <p className="mt-1 text-sm font-medium leading-tight text-[var(--text-secondary)]">{item.label}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-3 text-xs text-[var(--text-muted)]">{t("note")}</p>
                </div>
            </div>
        </section>
    );
}
