"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { CalendarPlus, Wallet, CalendarDays, StickyNote, Sparkles, Link2Off } from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import { localePath } from "@/lib/localePath";
import { buildIcs, daysUntil, decodeSantaLink, type SantaLinkPayload } from "@/lib/secretSanta/link";
import { GiftBox, GiftIdeas, WinnerCard, revealStyles as styles } from "@/components/secretSanta/SantaReveal";
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";

type State = { status: "loading" } | { status: "invalid" } | { status: "ok"; data: SantaLinkPayload };

function formatDate(date: string, locale: string): string {
    try {
        return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
            new Date(`${date}T00:00:00Z`)
        );
    } catch {
        return date;
    }
}

export default function PersonalLinkPage() {
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations("santa");
    const tr = useTranslations("result");
    const [state, setState] = useState<State>({ status: "loading" });
    const [stage, setStage] = useState<"intro" | "revealed">("intro");
    const [opening, setOpening] = useState(false);

    useEffect(() => {
        const read = () => {
            const data = decodeSantaLink(window.location.hash);
            setState(data ? { status: "ok", data } : { status: "invalid" });
        };
        read();
        window.addEventListener("hashchange", read);
        return () => window.removeEventListener("hashchange", read);
    }, []);

    if (state.status === "loading") {
        return <main className="ys-page-shell min-h-[60vh]" />;
    }

    if (state.status === "invalid") {
        return (
            <main className="ys-page-shell flex flex-col items-center pt-24 sm:pt-32 px-4">
                <div className="ys-card w-full max-w-md p-6 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-santa-red flex items-center justify-center">
                        <Link2Off className="w-6 h-6" />
                    </div>
                    <h1 className="font-heading text-headline-md text-[var(--text-primary)]">{t("invalidLink")}</h1>
                    <p className="text-[var(--text-secondary)]">{t("invalidLinkDesc")}</p>
                    <Link href={localePath(locale, "/secret-santa")} className="inline-flex h-[48px] items-center justify-center rounded-full bg-santa-red px-6 font-bold text-white">
                        {t("createOwn")}
                    </Link>
                </div>
            </main>
        );
    }

    const { data } = state;
    const event = data.e;

    const open = () => {
        if (opening) return;
        setOpening(true);
        celebrate();
        window.setTimeout(() => {
            setStage("revealed");
            setOpening(false);
        }, 900);
    };

    const downloadIcs = () => {
        if (!event) return;
        const ics = buildIcs(event, t("calendarTitle"));
        if (!ics) return;
        const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "yulasanta.ics";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const hasDetails = Boolean(event?.budget || event?.date || event?.note);
    const days = daysUntil(event?.date);

    return (
        <main className="ys-page-shell flex flex-col items-center pt-24 sm:pt-32 px-3 relative overflow-x-hidden safe-area-inset-bottom">
            <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-red-100 dark:bg-red-500/20 rounded-full blur-[80px] opacity-40 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-green-100 dark:bg-green-500/20 rounded-full blur-[80px] opacity-40 -translate-x-1/3 translate-y-1/3" />

            <div className="z-10 w-full max-w-md space-y-4 text-center">
                <div className="space-y-2">
                    {event?.name && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                            <Sparkles className="w-3 h-3 text-gold" /> {event.name}
                        </span>
                    )}
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight break-words">
                        {t("linkHello", { name: data.g })}
                    </h1>
                    {days !== null && days >= 0 && (
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/15 px-3 py-1 text-sm font-bold text-santa-red" aria-live="polite">
                            {days === 0 ? t("countdownToday") : t("countdownDays", { count: days })}
                        </p>
                    )}
                    {stage === "intro" && <p className="text-[var(--text-secondary)] text-body-md">{t("linkIntro")}</p>}
                </div>

                <div className="ys-card backdrop-blur-xl p-4 sm:p-6 space-y-5">
                    {stage === "intro" ? (
                        <div className={styles.stage}>
                            <GiftBox open={opening} onOpen={open} />
                            <p className={styles.hint}>{t("tapToOpen")}</p>
                            <p className="text-xs text-[var(--text-muted)]">{t("notYou", { name: data.g })}</p>
                        </div>
                    ) : (
                        <>
                            <WinnerCard label={tr("giftRecipient")} name={data.r} />
                            {data.h && (
                                <p className="rounded-xl bg-[var(--surface-2)] p-3 text-sm text-start text-[var(--text-secondary)] break-words">
                                    <span className="font-bold text-[var(--text-primary)]">💡 {t("hintFor", { name: data.r })}:</span> {data.h}
                                </p>
                            )}
                            <p className="text-sm text-[var(--text-muted)]">{tr("keepSecret")}</p>
                        </>
                    )}

                    {hasDetails && (
                        <dl className="grid gap-2 text-start text-sm border-t border-[var(--border-light)] pt-4">
                            {event?.budget && (
                                <div className="flex items-start gap-2">
                                    <Wallet className="w-4 h-4 mt-0.5 text-christmas-green shrink-0" />
                                    <dt className="font-bold text-[var(--text-primary)]">{t("budget")}:</dt>
                                    <dd className="text-[var(--text-secondary)] break-words min-w-0">{event.budget}</dd>
                                </div>
                            )}
                            {event?.date && (
                                <div className="flex items-start gap-2">
                                    <CalendarDays className="w-4 h-4 mt-0.5 text-christmas-green shrink-0" />
                                    <dt className="font-bold text-[var(--text-primary)]">{t("date")}:</dt>
                                    <dd className="text-[var(--text-secondary)]">{formatDate(event.date, locale)}</dd>
                                </div>
                            )}
                            {event?.note && (
                                <div className="flex items-start gap-2">
                                    <StickyNote className="w-4 h-4 mt-0.5 text-christmas-green shrink-0" />
                                    <dt className="font-bold text-[var(--text-primary)]">{t("note")}:</dt>
                                    <dd className="text-[var(--text-secondary)] break-words min-w-0">{event.note}</dd>
                                </div>
                            )}
                            {event?.date && (
                                <button
                                    type="button"
                                    onClick={downloadIcs}
                                    className="mt-1 inline-flex h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--border-medium)] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                                >
                                    <CalendarPlus className="w-4 h-4" /> {t("addToCalendar")}
                                </button>
                            )}
                        </dl>
                    )}

                    {stage === "revealed" && (
                        <GiftIdeas locale={locale} hint={data.h} budget={event?.budget} buttonLabel={t("giftIdeasFor", { name: data.r })} />
                    )}
                </div>

                {stage === "revealed" && (
                    <AdWrapper position="inline">
                        <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                    </AdWrapper>
                )}

                <Link
                    href={localePath(locale, "/secret-santa")}
                    className="inline-flex h-[44px] items-center justify-center text-sm font-semibold text-[var(--text-secondary)] hover:text-santa-red"
                >
                    {t("createOwn")} →
                </Link>
            </div>
        </main>
    );
}
