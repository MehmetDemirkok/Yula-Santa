"use client";

import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import styles from "./reveal.module.css";

export { styles as revealStyles };

const AVATAR_TONES = [
    "from-red-500 to-rose-700",
    "from-emerald-500 to-green-700",
    "from-amber-400 to-yellow-600",
    "from-indigo-500 to-violet-700",
];

export function Avatar({ name, index = 0, size = "md" }: { name: string; index?: number; size?: "md" | "lg" }) {
    const initial = name.trim().charAt(0).toLocaleUpperCase() || "?";
    const dim = size === "lg" ? "w-11 h-11 text-lg" : "w-8 h-8 text-xs";
    return (
        <span
            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_TONES[index % AVATAR_TONES.length]} text-white font-bold shrink-0 shadow-md ring-2 ring-white/50 dark:ring-white/10 ${dim}`}
            aria-hidden
        >
            {initial}
        </span>
    );
}

export function GiftBox({ open, onOpen }: { open: boolean; onOpen: () => void }) {
    const t = useTranslations("santa");
    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label={t("openGiftAria")}
            className={`${styles.giftButton} ${open ? styles.open : ""}`}
        >
            <span className={styles.glow} aria-hidden />
            <svg viewBox="0 0 220 220" className={styles.giftSvg} aria-hidden>
                <defs>
                    <linearGradient id="giftBody" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d1222e" />
                        <stop offset="100%" stopColor="#8f0f1a" />
                    </linearGradient>
                    <linearGradient id="giftLid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e84040" />
                        <stop offset="100%" stopColor="#a4101c" />
                    </linearGradient>
                    <linearGradient id="giftRibbon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F5C030" />
                        <stop offset="100%" stopColor="#E09600" />
                    </linearGradient>
                </defs>

                <rect x="45" y="100" width="130" height="98" rx="12" fill="url(#giftBody)" />
                <rect x="45" y="100" width="130" height="16" rx="8" fill="#ffffff" opacity="0.1" />
                <rect x="101" y="100" width="18" height="98" fill="url(#giftRibbon)" />

                <g className={styles.lid}>
                    <rect x="36" y="76" width="148" height="32" rx="9" fill="url(#giftLid)" />
                    <rect x="36" y="76" width="148" height="10" rx="5" fill="#ffffff" opacity="0.12" />
                    <rect x="101" y="76" width="18" height="32" fill="url(#giftRibbon)" />
                </g>

                <g className={styles.bow}>
                    <ellipse cx="88" cy="62" rx="26" ry="16" fill="url(#giftRibbon)" transform="rotate(-18 88 62)" />
                    <ellipse cx="132" cy="62" rx="26" ry="16" fill="url(#giftRibbon)" transform="rotate(18 132 62)" />
                    <circle cx="110" cy="68" r="12" fill="#F5C030" />
                    <circle cx="106" cy="64" r="4" fill="#ffffff" opacity="0.5" />
                </g>
            </svg>
        </button>
    );
}

export function WinnerCard({ label, name }: { label: string; name: string }) {
    return (
        <div>
            <p className="text-[var(--text-muted)] text-label-sm uppercase tracking-wider mb-2">{label}</p>
            <div className="ys-winner-reveal p-6 sm:p-8">
                <span className={styles.spark} aria-hidden />
                <span className={styles.spark} aria-hidden />
                <span className={styles.spark} aria-hidden />
                <span className={styles.spark} aria-hidden />
                <span className={styles.spark} aria-hidden />
                <Sparkles className="w-6 h-6 mx-auto mb-2 animate-float opacity-90" />
                <div className={`text-3xl sm:text-4xl font-black drop-shadow-sm break-words ${styles.winnerName}`}>{name}</div>
            </div>
        </div>
    );
}

type GiftSuggestion = { title: string; description: string };

/**
 * AI gift ideas for a Secret Santa recipient. Only the organizer's hint and
 * the budget text reach the API, never the recipient's or giver's name.
 */
export function GiftIdeas({
    locale,
    hint,
    budget,
    buttonLabel,
    compact = false,
}: {
    locale: string;
    hint?: string;
    budget?: string;
    buttonLabel?: string;
    compact?: boolean;
}) {
    const t = useTranslations("result");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ideas, setIdeas] = useState<GiftSuggestion[]>([]);

    const load = async () => {
        setOpen(true);
        setLoading(true);
        try {
            const res = await fetch("/api/suggest-gifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    occasion: "Secret Santa / New Year gift exchange",
                    relationship: "a Secret Santa recipient (friend, classmate, coworker or relative)",
                    budget: "medium",
                    notes: [hint, budget ? `Budget limit: ${budget}` : ""].filter(Boolean).join(". "),
                    locale,
                }),
            });
            const data = await res.json();
            setIdeas(Array.isArray(data.suggestions) ? data.suggestions : []);
        } catch {
            setIdeas([]);
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <Button
                onClick={load}
                variant={compact ? "ghost" : "secondary"}
                size={compact ? "sm" : "md"}
                className={compact ? "text-christmas-green" : "w-full shadow-lg shadow-red-200/50 dark:shadow-red-500/20"}
            >
                <Gift className="w-5 h-5 mr-2" /> {buttonLabel ?? t("seeGiftIdeas")}
            </Button>
        );
    }

    return (
        <div className="space-y-3 text-start" aria-live="polite">
            <h3 className="font-heading font-bold text-[var(--text-primary)] flex items-center">
                <Sparkles className="w-4 h-4 text-gold me-2" />
                {t("aiSuggestions")}
            </h3>
            {loading ? (
                <div className="space-y-3">
                    <div className="h-16 bg-[var(--surface-2)] rounded-xl animate-pulse" />
                    <div className="h-16 bg-[var(--surface-2)] rounded-xl animate-pulse" />
                    <div className="h-16 bg-[var(--surface-2)] rounded-xl animate-pulse" />
                </div>
            ) : ideas.length ? (
                <div className="space-y-3">
                    {ideas.map((idea, i) => (
                        <div key={i} className="ys-zebra-row bg-[var(--card-bg)] border border-[var(--border-light)] p-3 rounded-xl shadow-sm text-sm">
                            <span className="font-bold text-[var(--text-primary)] block mb-1">{idea.title}</span>
                            <span className="text-[var(--text-secondary)]">{idea.description}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[var(--text-secondary)] text-sm">{t("noSuggestions")}</p>
            )}
        </div>
    );
}
