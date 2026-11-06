"use client";

import type { FilterStats } from "@/lib/giveawayFilters";

type Props = {
    filterStats: FilterStats;
    ownerRemoved?: number;
    locale?: string;
};

export function TikTokFetchStats({ filterStats, ownerRemoved = 0, locale = "tr" }: Props) {
    const isTr = locale.startsWith("tr");
    const duplicatesRemoved = Math.max(0, filterStats.afterKeyword - filterStats.afterDedupe);

    const items: { label: string; value: string | number }[] = [
        { label: isTr ? "Uygun katılımcı" : "Eligible", value: filterStats.eligible },
        { label: isTr ? "Tekrar silinen" : "Duplicates removed", value: duplicatesRemoved },
        { label: isTr ? "Sahip hariç" : "Owner removed", value: ownerRemoved },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-2xl border border-cyan-100 dark:border-cyan-500/20 bg-cyan-50/60 dark:bg-cyan-500/10 p-3">
            {items.map((item) => (
                <div key={item.label} className="rounded-xl bg-white/70 dark:bg-white/5 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
                    <p className="text-sm font-black text-[var(--text-primary)] tabular-nums">{item.value}</p>
                </div>
            ))}
        </div>
    );
}
