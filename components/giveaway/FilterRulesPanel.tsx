"use client";

import { Filter } from "lucide-react";

type Props = {
    keyword: string;
    onKeywordChange: (value: string) => void;
    total: number;
    eligible: number;
    accentClass?: string;
    inputFocusClass?: string;
    labels: {
        keywordLabel: string;
        keywordPlaceholder: string;
        preview: string;
        previewHint: string;
    };
};

export function FilterRulesPanel({
    keyword,
    onKeywordChange,
    total,
    eligible,
    accentClass = "text-[#E1306C]",
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
            <p id="filter-preview" className="text-sm text-[var(--text-secondary)]">
                <span className={`font-bold ${accentClass}`}>
                    {labels.preview.replace("{eligible}", String(eligible)).replace("{total}", String(total))}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{labels.previewHint}</span>
            </p>
        </div>
    );
}
