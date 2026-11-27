"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { BookmarkCheck, BookmarkPlus, History, Loader2, LogIn } from "lucide-react";
import { localePath } from "@/lib/localePath";
import { loginHref } from "@/lib/auth/redirect";
import { trackAction } from "@/lib/analytics/client";
import { parkPendingDraw, postDraw } from "@/lib/drawHistory/client";
import type { DrawRecord } from "@/lib/drawHistory/types";

type Props = {
    /** Changes with every new draw, so the button returns to "save" for it. */
    drawKey: string;
    /** Read when pressed, so late updates (e.g. follower checks) are included. */
    getRecord: () => DrawRecord | null;
    /** "dark" sits on a coloured result panel (wheel sheet). */
    tone?: "light" | "dark";
    className?: string;
};

type State = "idle" | "saving" | "saved" | "error";

/**
 * "Save to my history" under a draw result. Signed-in users save with one tap.
 * Guests see "Sign in and save": the result is parked in this browser, and
 * /account/draws saves it after sign-in. Drawing never requires an account.
 */
export function SaveDrawButton({ drawKey, getRecord, tone = "light", className = "" }: Props) {
    const t = useTranslations("drawHistory");
    const locale = useLocale();
    const router = useRouter();
    const { status } = useSession();
    const [state, setState] = useState<State>("idle");

    useEffect(() => {
        setState("idle"); // eslint-disable-line react-hooks/set-state-in-effect
    }, [drawKey]);

    const historyHref = localePath(locale, "/account/draws");
    const dark = tone === "dark";
    const base = "inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:opacity-60";
    const look = dark
        ? "border border-white/25 bg-white/10 text-white hover:bg-white/20"
        : "border-2 border-dashed border-indigo-300 bg-indigo-50 text-indigo-700 hover:border-indigo-500 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200";
    const hintClass = dark ? "text-white/70" : "text-[var(--text-muted)]";

    if (status === "loading") return <div aria-hidden className={`h-[48px] w-full rounded-xl ${dark ? "bg-white/10" : "bg-[var(--surface-2)]"} ${className}`} />;

    const save = async () => {
        const record = getRecord();
        if (!record) return;
        if (status !== "authenticated") {
            parkPendingDraw(record);
            router.push(loginHref(localePath(locale, "/login"), historyHref));
            return;
        }
        setState("saving");
        const result = await postDraw(record);
        if (result.ok) {
            setState("saved");
            trackAction("draw_saved", record.tool);
        } else if (result.error === "unauthorized") {
            parkPendingDraw(record);
            router.push(loginHref(localePath(locale, "/login"), historyHref));
        } else {
            setState("error");
        }
    };

    if (state === "saved") {
        return (
            <div className={`flex flex-col gap-1.5 sm:flex-row sm:items-center ${className}`} role="status">
                <span className={`${base} ${dark ? "bg-white/15 text-white" : "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"}`}>
                    <BookmarkCheck className="h-4 w-4 shrink-0" aria-hidden /> {t("saved")}
                </span>
                <NextLink href={historyHref} className={`${base} ${look} sm:w-auto sm:shrink-0`}>
                    <History className="h-4 w-4 shrink-0" aria-hidden /> {t("viewHistory")}
                </NextLink>
            </div>
        );
    }

    const guest = status !== "authenticated";
    return (
        <div className={`space-y-1.5 ${className}`}>
            <button type="button" onClick={save} disabled={state === "saving"} className={`${base} ${look}`}>
                {state === "saving" ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : guest ? (
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                    <BookmarkPlus className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {state === "saving" ? t("saving") : guest ? t("guestButton") : t("saveButton")}
            </button>
            {state === "error" ? (
                <p role="alert" className="text-center text-xs font-medium text-red-600 dark:text-red-300">{t("saveError")}</p>
            ) : guest ? (
                <p className={`text-center text-xs ${hintClass}`}>{t("guestHint")}</p>
            ) : null}
        </div>
    );
}
