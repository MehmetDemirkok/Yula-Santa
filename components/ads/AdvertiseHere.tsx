"use client";

import { Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface AdvertiseHereProps {
    className?: string;
}

/**
 * Fallback shown in ad slots when no ad network is configured
 * (ADS_ENABLED === false), so the area stays useful instead of empty.
 */
export function AdvertiseHere({ className = "" }: AdvertiseHereProps) {
    const t = useTranslations("ads");

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-dashed border-[var(--border-medium)] bg-[var(--surface-2)]/60 px-5 py-4 sm:px-6 ${className}`}
        >
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-santa-red/10 text-santa-red">
                        <Megaphone className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            {t("advertiseTitle")}
                        </p>
                        <p className="text-sm font-semibold text-[var(--text-secondary)]">
                            {t("advertiseText")}
                        </p>
                    </div>
                </div>
                <Link
                    href="/contact"
                    className="shrink-0 rounded-xl border border-[var(--border-medium)] bg-[var(--card-bg)] px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-[var(--surface-2)]"
                >
                    {t("advertiseCta")}
                </Link>
            </div>
        </div>
    );
}
