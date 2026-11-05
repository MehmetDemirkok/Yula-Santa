"use client";

import { useEffect, useRef } from "react";
import { Check, RefreshCw, Share2, Trash2, X } from "lucide-react";

type WinnerSheetProps = {
    winner: string;
    eyebrow: string;
    congrats: string;
    spinAgainLabel: string;
    removeLabel: string;
    shareLabel: string;
    copiedLabel: string;
    closeLabel: string;
    copied: boolean;
    canRemove: boolean;
    onSpinAgain: () => void;
    onRemove: () => void;
    onShare: () => void;
    onClose: () => void;
};

function winnerFontClass(name: string) {
    if (name.length > 36) return "text-2xl sm:text-3xl";
    if (name.length > 16) return "text-3xl sm:text-4xl";
    return "text-5xl sm:text-6xl";
}

/** Result dialog: a bottom sheet in thumb reach on phones, centred on larger screens. */
export function WinnerSheet({
    winner,
    eyebrow,
    congrats,
    spinAgainLabel,
    removeLabel,
    shareLabel,
    copiedLabel,
    closeLabel,
    copied,
    canRemove,
    onSpinAgain,
    onRemove,
    onShare,
    onClose,
}: WinnerSheetProps) {
    const primaryRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        primaryRef.current?.focus({ preventScroll: true });

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !dialogRef.current) return;
            const items = dialogRef.current.querySelectorAll<HTMLElement>("button");
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            previous?.focus?.({ preventScroll: true });
        };
    }, [onClose]);

    const secondaryClass =
        "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]";

    return (
        <div
            className="fixed inset-0 z-[95] flex items-end justify-center bg-black/30 animate-fade-in sm:items-center sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="wheel-winner-name"
                className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/15 bg-gradient-to-br from-[#B61722] to-[#3B34C7] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 text-center text-white shadow-[0_-12px_50px_rgba(20,10,60,0.5)] animate-sheet-up sm:rounded-3xl sm:pb-6 sm:pt-6 sm:shadow-[0_24px_70px_rgba(40,20,120,0.55)]"
            >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/35 sm:hidden" aria-hidden="true" />
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={closeLabel}
                    className="absolute end-2 top-2 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[#FFE08A]">{eyebrow}</p>
                <p className="mt-2 text-sm text-white/80">{congrats}</p>
                <p
                    id="wheel-winner-name"
                    className={`mt-2 mb-6 font-heading font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere] ${winnerFontClass(winner)}`}
                >
                    {winner}
                </p>

                <button
                    ref={primaryRef}
                    type="button"
                    onClick={onSpinAgain}
                    className="inline-flex h-[56px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-6 font-heading text-lg font-extrabold text-[#B61722] shadow-lg transition hover:bg-white/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 active:scale-[0.98]"
                >
                    <RefreshCw className="h-5 w-5" />
                    {spinAgainLabel}
                </button>

                <div className={`mt-3 grid gap-3 ${canRemove ? "grid-cols-2" : "grid-cols-1"}`}>
                    {canRemove && (
                        <button type="button" onClick={onRemove} className={secondaryClass}>
                            <Trash2 className="h-4 w-4 shrink-0" />
                            {removeLabel}
                        </button>
                    )}
                    <button type="button" onClick={onShare} className={secondaryClass}>
                        {copied ? <Check className="h-4 w-4 shrink-0" /> : <Share2 className="h-4 w-4 shrink-0" />}
                        <span aria-live="polite">{copied ? copiedLabel : shareLabel}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
