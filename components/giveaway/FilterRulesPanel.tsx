"use client";

import { Filter, Users } from "lucide-react";

type EligiblePerson = {
    name: string;
    comment?: string;
};

type Props = {
    keyword: string;
    onKeywordChange: (value: string) => void;
    total: number;
    eligible: number;
    eligibleList: EligiblePerson[];
    excludeOwner: boolean;
    onExcludeOwnerChange: (value: boolean) => void;
    ownerUsername?: string;
    onOwnerUsernameChange?: (value: string) => void;
    showExcludeOwner?: boolean;
    accentClass?: string;
    toggleOnClass?: string;
    inputFocusClass?: string;
    labels: {
        keywordLabel: string;
        keywordPlaceholder: string;
        preview: string;
        previewHint: string;
        excludeOwner: string;
        eligibleWillEnter: string;
        eligibleListTitle: string;
        eligibleEmpty: string;
        ownerUsernamePlaceholder?: string;
    };
};

export function FilterRulesPanel({
    keyword,
    onKeywordChange,
    total,
    eligible,
    eligibleList,
    excludeOwner,
    onExcludeOwnerChange,
    ownerUsername,
    onOwnerUsernameChange,
    showExcludeOwner = true,
    accentClass = "text-[#E1306C]",
    toggleOnClass = "bg-[#E1306C]",
    inputFocusClass = "focus:border-[#E1306C] focus:ring-pink-500/10",
    labels,
}: Props) {
    return (
        <div className="space-y-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
            <label className={`flex items-center gap-2 text-sm font-semibold ${accentClass}`}>
                <Filter className="h-4 w-4" />
                {labels.keywordLabel}
            </label>
            <input
                type="text"
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                placeholder={labels.keywordPlaceholder}
                className={`w-full rounded-xl border border-[var(--border-medium)] bg-white px-4 py-3 text-sm outline-none transition focus:ring-4 dark:bg-white/5 ${inputFocusClass}`}
                aria-describedby="filter-preview"
            />

            {showExcludeOwner && (
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => onExcludeOwnerChange(!excludeOwner)}
                        className="flex w-full items-center justify-between rounded-xl border border-[var(--border-light)] bg-white px-3 py-2.5 text-left transition hover:border-black/10 dark:bg-white/5"
                    >
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{labels.excludeOwner}</span>
                        <span className={`relative h-7 w-12 rounded-full transition-colors ${excludeOwner ? toggleOnClass : "bg-[var(--text-muted)]"}`}>
                            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${excludeOwner ? "right-1" : "left-1"}`} />
                        </span>
                    </button>
                    {excludeOwner && onOwnerUsernameChange && (
                        <input
                            type="text"
                            value={ownerUsername ?? ""}
                            onChange={(e) => onOwnerUsernameChange(e.target.value.replace(/^@/, ""))}
                            placeholder={labels.ownerUsernamePlaceholder || "@username"}
                            className={`w-full rounded-xl border border-[var(--border-medium)] bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-4 dark:bg-white/5 ${inputFocusClass}`}
                        />
                    )}
                </div>
            )}

            <div id="filter-preview" className="rounded-xl border border-[var(--border-light)] bg-white/80 p-3 dark:bg-white/5">
                <p className={`text-sm font-bold ${accentClass}`}>
                    {labels.eligibleWillEnter.replace("{count}", String(eligible))}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {labels.preview.replace("{eligible}", String(eligible)).replace("{total}", String(total))}
                    {" · "}
                    {labels.previewHint}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    <Users className="h-3.5 w-3.5" />
                    {labels.eligibleListTitle}
                </div>

                <div className="custom-scrollbar mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                    {eligibleList.length === 0 ? (
                        <p className="py-4 text-center text-xs text-[var(--text-muted)]">{labels.eligibleEmpty}</p>
                    ) : (
                        eligibleList.slice(0, 100).map((p, i) => (
                            <div key={`${p.name}-${i}`} className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5">
                                <p className="truncate text-xs font-medium text-[var(--text-secondary)]">
                                    {i + 1}. @{p.name.replace(/^@/, "")}
                                </p>
                                {p.comment && <p className="mt-0.5 line-clamp-1 text-[10px] text-[var(--text-muted)]">{p.comment}</p>}
                            </div>
                        ))
                    )}
                    {eligibleList.length > 100 && (
                        <p className="pt-1 text-center text-[10px] text-[var(--text-muted)]">+{eligibleList.length - 100}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
