"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import type { DrawProof } from "@/lib/giveawayProof";
import { encodeProofToken, formatProofText, proofPath } from "@/lib/giveawayProof";
import { SITE_HOST, SITE_URL } from "@/lib/constants";

type Props = {
    proof: DrawProof;
    locale: string;
    accentClass?: string;
    buttonClass?: string;
    labels: {
        title: string;
        seed: string;
        drawnAt: string;
        eligible: string;
        algorithm: string;
        copy: string;
        copied: string;
        openLink: string;
        keyword: string;
        dedupeOn: string;
        dedupeOff: string;
    };
    onToast?: (msg: string) => void;
};

export function DrawProofPanel({
    proof,
    locale,
    accentClass = "text-[#E1306C]",
    buttonClass = "bg-[#E1306C] hover:bg-[#c4275c]",
    labels,
    onToast,
}: Props) {
    const [copied, setCopied] = useState(false);
    const token = encodeProofToken(proof);
    const path = proofPath(locale, token);
    const absoluteUrl = `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

    const copyProof = async () => {
        const text = formatProofText(proof, SITE_HOST);
        await navigator.clipboard.writeText(`${text}\n\n${absoluteUrl}`);
        setCopied(true);
        onToast?.(labels.copied);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className={`h-5 w-5 ${accentClass}`} />
                <h3 className="font-semibold tracking-tight">{labels.title}</h3>
            </div>
            <dl className="grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
                <div>
                    <dt className="text-xs text-[var(--text-muted)]">{labels.drawnAt}</dt>
                    <dd className="font-medium">{new Date(proof.at).toLocaleString()}</dd>
                </div>
                <div>
                    <dt className="text-xs text-[var(--text-muted)]">{labels.eligible}</dt>
                    <dd className="font-medium">
                        {proof.eligible} / {proof.total}
                    </dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-xs text-[var(--text-muted)]">{labels.seed}</dt>
                    <dd className="break-all font-mono text-xs">{proof.seed}</dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-xs text-[var(--text-muted)]">{labels.algorithm}</dt>
                    <dd className="text-xs">
                        crypto Fisher–Yates · {proof.countUserOnce ? labels.dedupeOn : labels.dedupeOff}
                        {proof.keyword ? ` · ${labels.keyword}: “${proof.keyword}”` : ""}
                    </dd>
                </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={copyProof}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition ${buttonClass}`}
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? labels.copied : labels.copy}
                </button>
                <a
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)] dark:bg-white/5"
                >
                    <ExternalLink className="h-4 w-4" />
                    {labels.openLink}
                </a>
            </div>
        </div>
    );
}
