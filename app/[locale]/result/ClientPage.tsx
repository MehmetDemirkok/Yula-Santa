"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Gift, User, ArrowLeftRight, Home, Link2, MonitorSmartphone, Copy, Check, Share2, EyeOff, Eye, ShieldAlert, RotateCcw, Printer, Mail, MessageSquare } from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import { Button } from "@/components/ui/Button";
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";
import { localePath } from "@/lib/localePath";
import { nameKey } from "@/lib/secretSanta/draw";
import { buildSantaLink, emailUrl, smsUrl, whatsappUrl } from "@/lib/secretSanta/link";
import { loadDraw, updateDraw, type SantaDraw } from "@/lib/secretSanta/storage";
import { Avatar, GiftBox, GiftIdeas, WinnerCard, revealStyles as styles } from "@/components/secretSanta/SantaReveal";
import { PrintCards } from "@/components/secretSanta/PrintCards";

type View = "choose" | "links" | "screen" | "print";

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.66L.62 23.25l5.65-1.48a11.3 11.3 0 0 0 5.78 1.47h.01c6.24 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z" />
        </svg>
    );
}

export default function ResultPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations("result");
    const ts = useTranslations("santa");
    const [draw, setDraw] = useState<SantaDraw | null>(null);
    const [view, setView] = useState<View>("choose");
    const [origin, setOrigin] = useState("");
    const [canShare, setCanShare] = useState(false);
    const [canSms, setCanSms] = useState(false);
    const [printHidden, setPrintHidden] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    // Shared-screen state
    const [selectedUser, setSelectedUser] = useState("");
    const [stage, setStage] = useState<"pick" | "gift" | "revealed">("pick");
    const [opening, setOpening] = useState(false);
    const [resetArmed, setResetArmed] = useState(false);

    useEffect(() => {
        const saved = loadDraw();
        if (!saved) {
            router.replace(localePath(locale, "/secret-santa"));
            return;
        }
        // Browser-only values (localStorage, origin, Web Share) are read once after mount.
        /* eslint-disable react-hooks/set-state-in-effect */
        setDraw(saved);
        setOrigin(window.location.origin);
        setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
        // sms: links only do something on phones and tablets.
        setCanSms(window.matchMedia("(pointer: coarse)").matches);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [router, locale]);

    useEffect(() => {
        if (draw?.mode === "pairs") celebrate();
        // Celebrate once when the pairs list first appears.
    }, [draw?.mode]);

    // The page renders empty until the draw loads, so the browser can keep the
    // scroll position of the long setup page. Start each view at the top.
    useEffect(() => {
        if (draw) window.scrollTo({ top: 0 });
    }, [view, Boolean(draw)]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!resetArmed) return;
        const timer = window.setTimeout(() => setResetArmed(false), 3000);
        return () => window.clearTimeout(timer);
    }, [resetArmed]);

    const givers = useMemo(
        () => (draw ? Object.keys(draw.assignments).sort((a, b) => a.localeCompare(b, locale)) : []),
        [draw, locale]
    );

    if (!draw) return null;

    const persist = (next: SantaDraw) => {
        setDraw(next);
        updateDraw(next);
    };

    const linkFor = (giver: string) =>
        buildSantaLink(origin, locale, {
            g: giver,
            r: draw.assignments[giver],
            h: draw.hints[nameKey(draw.assignments[giver])],
            e: draw.event,
        });

    const messageFor = (giver: string) => {
        const url = linkFor(giver);
        return draw.event?.name
            ? ts("whatsappMessageGroup", { name: giver, group: draw.event.name, url })
            : ts("whatsappMessage", { name: giver, url });
    };

    const subject = draw.event?.name ? ts("emailSubjectGroup", { group: draw.event.name }) : ts("emailSubject");

    const markSent = (giver: string) => {
        if (draw.sent.includes(giver)) return;
        persist({ ...draw, sent: [...draw.sent, giver] });
    };

    const copyLink = async (giver: string) => {
        try {
            await navigator.clipboard.writeText(messageFor(giver));
            setCopied(giver);
            window.setTimeout(() => setCopied((c) => (c === giver ? null : c)), 2000);
            markSent(giver);
        } catch {
            // Clipboard blocked: the WhatsApp and share buttons still work.
        }
    };

    const shareLink = async (giver: string) => {
        try {
            await navigator.share({ text: messageFor(giver) });
            markSent(giver);
        } catch {
            // The visitor closed the share sheet.
        }
    };

    const handleOpenGift = () => {
        if (opening) return;
        setOpening(true);
        celebrate();
        window.setTimeout(() => {
            setStage("revealed");
            setOpening(false);
            if (!draw.seen.includes(selectedUser)) persist({ ...draw, seen: [...draw.seen, selectedUser] });
        }, 900);
    };

    const hideAndPass = () => {
        setSelectedUser("");
        setStage("pick");
        setOpening(false);
        // The revealed view is taller; start the next person at the top, away from the old result.
        window.scrollTo({ top: 0 });
    };

    const goHome = () => router.push(localePath(locale, "/secret-santa"));

    const uniquePairs = Object.entries(draw.assignments).filter(([a, b]) => a.localeCompare(b) < 0);
    const unseen = givers.filter((g) => !draw.seen.includes(g));

    return (
        <main className="ys-page-shell flex flex-col items-center pt-24 sm:pt-32 px-3 relative overflow-x-hidden safe-area-inset-bottom transition-colors duration-300">
            <div className="absolute top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-red-100 dark:bg-red-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-green-100 dark:bg-green-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/3 translate-y-1/3"></div>

            <div className={`z-10 w-full ${view === "print" ? "max-w-3xl" : "max-w-lg"} space-y-4 sm:space-y-6 text-center flex-1 flex flex-col justify-center`}>
                {draw.mode === "pairs" && (
                    <>
                        <div className="space-y-2 animate-fade-in">
                            <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{t("matchList")}</h1>
                            <p className="text-[var(--text-secondary)] text-body-md sm:text-body-lg">{t("christmasMatches")}</p>
                        </div>
                        <div className="ys-card backdrop-blur-xl p-4 sm:p-6 md:p-8 space-y-4">
                            {uniquePairs.map(([p1, p2], idx) => (
                                <div key={p1} className="ys-zebra-row bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-3" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar name={p1} index={idx * 2} />
                                        <span className="font-bold text-[var(--text-primary)] truncate">{p1}</span>
                                        <div className="bg-red-50 dark:bg-red-500/20 p-1.5 rounded-full text-santa-red shrink-0">
                                            <ArrowLeftRight className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-[var(--text-primary)] truncate">{p2}</span>
                                        <Avatar name={p2} index={idx * 2 + 1} />
                                    </div>
                                    <GiftIdeas locale={locale} compact />
                                </div>
                            ))}
                            <AdWrapper position="inline">
                                <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                            </AdWrapper>
                            <Button onClick={goHome} variant="outline" className="w-full">{t("newDraw")}</Button>
                        </div>
                    </>
                )}

                {draw.mode === "secret" && view === "choose" && (
                    <>
                        <div className="space-y-2 animate-fade-in">
                            <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{ts("doneTitle")}</h1>
                            <p className="text-[var(--text-secondary)] text-body-md sm:text-body-lg">{ts("chooseHow")}</p>
                        </div>
                        <div className="grid gap-3">
                            <button
                                type="button"
                                onClick={() => setView("links")}
                                className="ys-card p-4 sm:p-5 flex items-start gap-3 text-start border-2 border-transparent hover:border-santa-red transition-colors"
                            >
                                <span className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/15 text-santa-red flex items-center justify-center shrink-0">
                                    <Link2 className="w-5 h-5" />
                                </span>
                                <span>
                                    <span className="block font-bold text-[var(--text-primary)]">{ts("tabLinks")}</span>
                                    <span className="block text-sm text-[var(--text-secondary)]">{ts("tabLinksDesc")}</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setView("screen")}
                                className="ys-card p-4 sm:p-5 flex items-start gap-3 text-start border-2 border-transparent hover:border-christmas-green transition-colors"
                            >
                                <span className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-500/15 text-christmas-green flex items-center justify-center shrink-0">
                                    <MonitorSmartphone className="w-5 h-5" />
                                </span>
                                <span>
                                    <span className="block font-bold text-[var(--text-primary)]">{ts("tabScreen")}</span>
                                    <span className="block text-sm text-[var(--text-secondary)]">{ts("tabScreenDesc")}</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setView("print")}
                                className="ys-card p-4 sm:p-5 flex items-start gap-3 text-start border-2 border-transparent hover:border-indigo-500 transition-colors"
                            >
                                <span className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                                    <Printer className="w-5 h-5" />
                                </span>
                                <span>
                                    <span className="block font-bold text-[var(--text-primary)]">{ts("tabPrint")}</span>
                                    <span className="block text-sm text-[var(--text-secondary)]">{ts("tabPrintDesc")}</span>
                                </span>
                            </button>
                        </div>
                        <Button onClick={goHome} variant="ghost" className="w-full text-[var(--text-muted)]">
                            <Home className="w-4 h-4 me-2" /> {t("backToHome")}
                        </Button>
                    </>
                )}

                {draw.mode === "secret" && view === "links" && (
                    <>
                        <div className="space-y-2 animate-fade-in">
                            <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{ts("tabLinks")}</h1>
                            <p className="text-[var(--text-secondary)] text-body-md">{ts("linksIntro")}</p>
                        </div>
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-start text-sm text-amber-800 dark:text-amber-300">
                            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{ts("organizerWarning")}</p>
                        </div>
                        <div className="ys-card p-3 sm:p-4 space-y-2">
                            <p className="text-xs font-bold text-[var(--text-muted)] text-end">
                                {ts("sentCount", { sent: draw.sent.length, total: givers.length })}
                            </p>
                            {givers.map((giver, i) => {
                                const sent = draw.sent.includes(giver);
                                return (
                                    <div key={giver} className="ys-zebra-row rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-2.5 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar name={giver} index={i} />
                                            <span className="min-w-0 flex-1 text-start font-semibold text-[var(--text-primary)] truncate">{giver}</span>
                                            {sent && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400 shrink-0">
                                                    <Check className="w-3 h-3" strokeWidth={3} /> {ts("sentMark")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <a
                                                href={whatsappUrl(messageFor(giver))}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => markSent(giver)}
                                                aria-label={ts("sendWhatsappTo", { name: giver })}
                                                className="h-[44px] flex-1 min-w-[120px] px-3 rounded-lg bg-[#25D366] text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 hover:brightness-95"
                                            >
                                                <WhatsAppIcon className="w-5 h-5" />
                                                {ts("sendWhatsapp")}
                                            </a>
                                            <a
                                                href={emailUrl(subject, messageFor(giver))}
                                                onClick={() => markSent(giver)}
                                                aria-label={ts("sendEmailTo", { name: giver })}
                                                title={ts("sendEmail")}
                                                className="h-[44px] px-3 rounded-lg border border-[var(--border-medium)] text-[var(--text-secondary)] text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                                            >
                                                <Mail className="w-4 h-4" />
                                                <span className="hidden min-[400px]:inline">{ts("sendEmail")}</span>
                                            </a>
                                            {canSms && (
                                                <a
                                                    href={smsUrl(messageFor(giver))}
                                                    onClick={() => markSent(giver)}
                                                    aria-label={ts("sendSmsTo", { name: giver })}
                                                    title={ts("sendSms")}
                                                    className="h-[44px] px-3 rounded-lg border border-[var(--border-medium)] text-[var(--text-secondary)] text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="hidden min-[400px]:inline">{ts("sendSms")}</span>
                                                </a>
                                            )}
                                            {canShare && (
                                                <button
                                                    type="button"
                                                    onClick={() => shareLink(giver)}
                                                    aria-label={ts("shareTo", { name: giver })}
                                                    title={ts("share")}
                                                    className="w-[44px] h-[44px] rounded-lg border border-[var(--border-medium)] text-[var(--text-secondary)] flex items-center justify-center"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => copyLink(giver)}
                                                aria-label={ts("copyLinkFor", { name: giver })}
                                                title={ts("copyLink")}
                                                className="w-[44px] h-[44px] rounded-lg border border-[var(--border-medium)] text-[var(--text-secondary)] flex items-center justify-center"
                                            >
                                                {copied === giver ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <p aria-live="polite" className="sr-only">{copied ? ts("copied") : ""}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setView("choose")} variant="ghost" className="flex-1 text-[var(--text-muted)]">{ts("back")}</Button>
                            <Button onClick={goHome} variant="outline" className="flex-1">{t("newDraw")}</Button>
                        </div>
                    </>
                )}

                {draw.mode === "secret" && view === "print" && (
                    <>
                        <div className="space-y-2 animate-fade-in">
                            <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{ts("tabPrint")}</h1>
                            <p className="text-[var(--text-secondary)] text-body-md">{ts("printIntro")}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button onClick={() => window.print()} className="flex-1 min-w-[160px]">
                                <Printer className="w-5 h-5 me-2" /> {ts("printButton")}
                            </Button>
                            <Button onClick={() => setPrintHidden((v) => !v)} variant="outline" className="flex-1 min-w-[160px]">
                                {printHidden ? <Eye className="w-4 h-4 me-2" /> : <EyeOff className="w-4 h-4 me-2" />}
                                {printHidden ? ts("printShowNames") : ts("printHideNames")}
                            </Button>
                        </div>
                        <div className="ys-card p-3 sm:p-4">
                            <PrintCards
                                locale={locale}
                                givers={givers}
                                assignments={draw.assignments}
                                hints={draw.hints}
                                event={draw.event}
                                hideOnScreen={printHidden}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setView("choose")} variant="ghost" className="flex-1 text-[var(--text-muted)]">{ts("back")}</Button>
                            <Button onClick={goHome} variant="outline" className="flex-1">{t("newDraw")}</Button>
                        </div>
                    </>
                )}

                {draw.mode === "secret" && view === "screen" && (
                    <>
                        {stage !== "revealed" && (
                            <div className="space-y-2 animate-fade-in">
                                <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{t("whoGetsGift")}</h1>
                                <p className="text-[var(--text-secondary)] text-body-md sm:text-body-lg">{t("selectName")}</p>
                            </div>
                        )}
                        <div className="ys-card backdrop-blur-xl p-4 sm:p-6 md:p-8 relative overflow-hidden">
                            {stage === "pick" && (
                                <div className="space-y-5">
                                    {unseen.length === 0 ? (
                                        <p className="font-bold text-[var(--text-primary)] py-4">{ts("allSeen")}</p>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <select
                                                    aria-label={t("selectYourName")}
                                                    className="w-full appearance-none bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--text-primary)] py-4 px-4 pe-10 rounded-lg leading-tight focus:outline-none focus:border-[var(--input-focus)]"
                                                    value={selectedUser}
                                                    onChange={(e) => setSelectedUser(e.target.value)}
                                                >
                                                    <option value="">{t("selectYourName")}</option>
                                                    {givers.map((name) => (
                                                        <option key={name} value={name} disabled={draw.seen.includes(name)}>
                                                            {draw.seen.includes(name) ? `${name} · ${ts("seenLabel")}` : name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-[var(--text-muted)]">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <Button onClick={() => selectedUser && setStage("gift")} disabled={!selectedUser} className="w-full py-4 text-lg rounded-full font-bold">
                                                <Gift className="w-5 h-5 me-2" /> {t("seeResult")}
                                            </Button>
                                        </>
                                    )}
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {ts("seenProgress", { seen: draw.seen.length, total: givers.length })}
                                    </p>
                                    <div className="flex flex-col gap-1 pt-2 border-t border-[var(--border-light)]">
                                        {draw.seen.length > 0 && (
                                            <Button
                                                onClick={() => {
                                                    if (!resetArmed) return setResetArmed(true);
                                                    persist({ ...draw, seen: [] });
                                                    setResetArmed(false);
                                                }}
                                                variant="ghost"
                                                size="sm"
                                                className="text-[var(--text-muted)]"
                                            >
                                                <RotateCcw className="w-4 h-4 me-2" /> {resetArmed ? ts("resetSeenConfirm") : ts("resetSeen")}
                                            </Button>
                                        )}
                                        <Button onClick={() => setView("choose")} variant="ghost" size="sm" className="text-[var(--text-muted)]">
                                            {ts("back")}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {stage === "gift" && (
                                <div className={styles.stage}>
                                    <p className="text-[var(--text-muted)] text-label-sm uppercase tracking-wider">{selectedUser}</p>
                                    <GiftBox open={opening} onOpen={handleOpenGift} />
                                    <p className={styles.hint}>{ts("tapToOpen")}</p>
                                    <Button onClick={hideAndPass} variant="ghost" size="sm" className="text-[var(--text-muted)]">
                                        {ts("back")}
                                    </Button>
                                </div>
                            )}

                            {stage === "revealed" && selectedUser && (
                                <div className="space-y-6">
                                    <WinnerCard label={t("giftRecipient")} name={draw.assignments[selectedUser]} />
                                    {draw.hints[nameKey(draw.assignments[selectedUser])] && (
                                        <p className="rounded-xl bg-[var(--surface-2)] p-3 text-sm text-start text-[var(--text-secondary)]">
                                            <span className="font-bold text-[var(--text-primary)]">
                                                💡 {ts("hintFor", { name: draw.assignments[selectedUser] })}:
                                            </span>{" "}
                                            {draw.hints[nameKey(draw.assignments[selectedUser])]}
                                        </p>
                                    )}
                                    <Button onClick={hideAndPass} className="w-full py-4 text-lg rounded-full font-bold">
                                        <EyeOff className="w-5 h-5 me-2" /> {ts("hideAndPass")}
                                    </Button>
                                    <p className="text-sm text-[var(--text-muted)]">{t("keepSecret")}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
