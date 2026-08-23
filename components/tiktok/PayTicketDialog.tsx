"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Loader2, Mail, X } from "lucide-react";

type PayTicketDialogProps = {
    open: boolean;
    onClose: () => void;
    priceLabel: string;
    email: string;
    onEmailChange: (value: string) => void;
    onPay: () => void;
    onUseCredit?: () => void;
    hasCredit?: boolean;
    paying?: boolean;
    error?: string | null;
    onManual: () => void;
    salesContractHref: string;
    labels: {
        title: string;
        subtitle: string;
        emailLabel: string;
        emailPlaceholder: string;
        emailHint: string;
        cta: string;
        processing: string;
        noMembership: string;
        serviceName: string;
        cap: string;
        feeLine: string;
        noRefund: string;
        useCredit: string;
        switchManual: string;
        salesContractLink: string;
    };
};

export function PayTicketDialog({
    open,
    onClose,
    priceLabel,
    email,
    onEmailChange,
    onPay,
    onUseCredit,
    hasCredit,
    paying,
    error,
    onManual,
    salesContractHref,
    labels,
}: PayTicketDialogProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !paying) onClose();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, paying, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-[#191C1D]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !paying) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="pay-ticket-title"
                className="relative w-full max-w-[28rem] overflow-hidden rounded-t-2xl border border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-primary)] shadow-[0_24px_80px_rgba(17,24,39,0.18)] sm:rounded-2xl"
            >
                <div className="h-[3px] w-full bg-[var(--santa-red)]" aria-hidden />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={paying}
                    className="absolute right-3 top-4 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] disabled:opacity-40"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="px-5 pb-6 pt-6 sm:px-7 sm:pt-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        {labels.noMembership}
                    </p>
                    <h2 id="pay-ticket-title" className="mt-1.5 font-heading text-2xl font-bold tracking-tight">
                        {labels.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{labels.subtitle}</p>

                    <dl className="mt-5 divide-y divide-[var(--border-light)] rounded-xl border border-[var(--border-light)] bg-white dark:bg-white/5">
                        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                            <dt className="text-sm text-[var(--text-secondary)]">{labels.serviceName}</dt>
                            <dd className="font-heading text-base font-bold tabular-nums">{priceLabel}</dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                            <dt className="text-sm text-[var(--text-muted)]">{labels.feeLine}</dt>
                            <dd className="text-sm text-[var(--text-muted)]">{labels.cap}</dd>
                        </div>
                    </dl>

                    <label htmlFor="tt-pay-email" className="mt-5 mb-2 block text-sm font-semibold">
                        {labels.emailLabel}
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3.5 focus-within:border-[var(--santa-red)] focus-within:ring-4 focus-within:ring-[var(--santa-red)]/10">
                        <Mail className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
                        <input
                            id="tt-pay-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            autoFocus
                            placeholder={labels.emailPlaceholder}
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onPay()}
                            className="w-full bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">{labels.emailHint}</p>

                    {error && (
                        <p className="mt-3 rounded-xl bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]" role="alert">
                            {error}
                        </p>
                    )}

                    {hasCredit && onUseCredit ? (
                        <button
                            type="button"
                            onClick={onUseCredit}
                            disabled={paying}
                            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--navy)] px-5 text-base font-bold text-white disabled:opacity-60"
                        >
                            {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                            {labels.useCredit}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onPay}
                            disabled={paying}
                            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--santa-red)] px-5 text-base font-bold text-white shadow-[0_4px_16px_rgba(182,23,34,0.25)] hover:bg-[var(--santa-red-hover)] disabled:opacity-60"
                        >
                            {paying ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" /> {labels.processing}
                                </>
                            ) : (
                                labels.cta
                            )}
                        </button>
                    )}

                    <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
                        {labels.noRefund}{" "}
                        <Link href={salesContractHref} target="_blank" className="font-semibold underline underline-offset-2 hover:text-[var(--text-secondary)]">
                            {labels.salesContractLink}
                        </Link>
                    </p>

                    <button
                        type="button"
                        onClick={onManual}
                        className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        {labels.switchManual}
                    </button>
                </div>
            </div>
        </div>
    );
}
