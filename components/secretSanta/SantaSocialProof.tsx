"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Gift } from "lucide-react";
import { PUBLIC_STATS_MIN_TOTAL, type PublicDrawStats } from "@/lib/analytics/publicStats";

/**
 * One line under the /secret-santa hero with the real Secret Santa draw count
 * from /api/stats/draws. Hidden until that count reaches PUBLIC_STATS_MIN_TOTAL
 * (always shown under `next dev`), so a fresh counter never shows "3 draws".
 */
export function SantaSocialProof() {
    const t = useTranslations("santa");
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

    if (!stats) return null;
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev && stats.secretSanta < PUBLIC_STATS_MIN_TOTAL) return null;

    const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: "UTC" }).format(
        new Date(`${stats.since}T12:00:00Z`),
    );

    return (
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--card-bg)]/80 px-3 py-1.5 text-[13px] font-semibold text-[var(--text-secondary)] ring-1 ring-[var(--border-light)]">
            <Gift className="h-4 w-4 shrink-0 text-santa-red" aria-hidden />
            <span>
                {t.rich("socialProof", {
                    date,
                    count: stats.secretSanta,
                    formatted: new Intl.NumberFormat(locale).format(stats.secretSanta),
                    strong: (chunks) => <strong className="font-extrabold tabular-nums text-[var(--text-primary)]">{chunks}</strong>,
                })}
            </span>
        </p>
    );
}
