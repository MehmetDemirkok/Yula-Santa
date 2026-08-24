"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import {
    Chrome,
    Copy,
    Check,
    Filter,
    Users,
    Trophy,
    Loader2,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    RefreshCcw,
    Download,
    Link2,
    Puzzle,
    ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FilterRulesPanel } from "@/components/giveaway/FilterRulesPanel";
import { downloadWinnerCard } from "@/lib/downloadWinnerCard";
import { useToast } from "@/lib/ToastContext";
import { cn } from "@/lib/utils";
import { TIKTOK_CHROME_EXTENSION_URL } from "@/lib/constants";

type Step = "link" | "comments" | "rules" | "result";

type DrawResult = {
    winners: { name: string; comment?: string }[];
    backups: { name: string }[];
    total: number;
    eligible: number;
    seed: string;
    at: string;
};

const OWNER_TOKEN_PREFIX = "ys_tt_ext_owner:";
const EXT_CTA =
    "bg-indigo-accent text-white shadow-[0_4px_16px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.32)] hover:brightness-110";

const STEPS: { n: 1 | 2 | 3 | 4; label: string }[] = [
    { n: 1, label: "Link" },
    { n: 2, label: "Yorumlar" },
    { n: 3, label: "Kurallar" },
    { n: 4, label: "Kura" },
];

function ownerTokenStorageKey(giveawayId: string) {
    return `${OWNER_TOKEN_PREFIX}${giveawayId}`;
}

async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = typeof data?.error === "string" ? data.error : "İstek başarısız";
        throw new Error(message);
    }
    return data as T;
}

function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
    return (
        <nav aria-label="Çekiliş adımları" className="mx-auto mb-8 max-w-lg px-2">
            <ol className="flex">
                {STEPS.map((s, i) => {
                    const state = s.n < current ? "done" : s.n === current ? "current" : "upcoming";
                    return (
                        <li key={s.n} className="relative flex flex-1 flex-col items-center">
                            {i > 0 && (
                                <span
                                    aria-hidden
                                    className={cn(
                                        "absolute left-0 right-1/2 top-[13px] h-px",
                                        state !== "upcoming" ? "bg-indigo-accent" : "bg-[var(--border-medium)]"
                                    )}
                                />
                            )}
                            {i < STEPS.length - 1 && (
                                <span
                                    aria-hidden
                                    className={cn(
                                        "absolute left-1/2 right-0 top-[13px] h-px",
                                        state === "done" ? "bg-indigo-accent" : "bg-[var(--border-medium)]"
                                    )}
                                />
                            )}
                            <span
                                className={cn(
                                    "relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold",
                                    state === "current" &&
                                        "bg-indigo-accent text-white shadow-[0_0_0_4px_rgba(79,70,229,0.14)]",
                                    state === "done" && "bg-indigo-accent text-white",
                                    state === "upcoming" &&
                                        "border border-[var(--border-medium)] bg-white text-[var(--text-muted)] dark:bg-[var(--card-bg)]"
                                )}
                                aria-current={state === "current" ? "step" : undefined}
                            >
                                {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.n}
                            </span>
                            <span
                                className={cn(
                                    "mt-2 text-[11px] font-semibold tracking-tight sm:text-xs",
                                    state === "upcoming" ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                                )}
                            >
                                {s.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:bg-[var(--card-bg)] sm:p-8",
                className
            )}
        >
            {children}
        </div>
    );
}

export default function TikTokExtensionGiveaway() {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>("link");
    const [videoUrl, setVideoUrl] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const [giveawayId, setGiveawayId] = useState<string | null>(null);
    const [ownerToken, setOwnerToken] = useState<string | null>(null);
    const [participantCount, setParticipantCount] = useState(0);
    const [copiedField, setCopiedField] = useState<"id" | "code" | null>(null);

    const [countUserOnce, setCountUserOnce] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [excludeOwner, setExcludeOwner] = useState(false);
    const [ownerUsername, setOwnerUsername] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(1);

    const [drawing, setDrawing] = useState(false);
    const [drawError, setDrawError] = useState<string | null>(null);
    const [countingDown, setCountingDown] = useState(false);
    const [countdownValue, setCountdownValue] = useState<number | null>(null);
    const [result, setResult] = useState<DrawResult | null>(null);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // "Çekilişi Başlat" can be scrolled far down a settings card — without this,
    // the countdown/winner reveal render off-screen above the user's scroll
    // position and the footer shows instead of the reveal.
    useEffect(() => {
        if (step === "result" || countingDown) {
            // Instant, not smooth — an in-flight smooth scroll gets cut short by
            // the body-scroll lock effect below (overflow:hidden freezes it mid-animation).
            window.scrollTo(0, 0);
        }
    }, [step, countingDown]);

    // The countdown is a fixed full-screen overlay (see below), but a locked
    // body scroll keeps the page from jumping under it while it's up.
    useEffect(() => {
        if (!countingDown) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [countingDown]);

    // Restore an in-progress giveaway from ?g=ID + localStorage (owner-token) on load/reload.
    useEffect(() => {
        const fromQuery = searchParams.get("g");
        if (!fromQuery) return;
        const stored = typeof window !== "undefined" ? window.localStorage.getItem(ownerTokenStorageKey(fromQuery)) : null;
        if (stored) {
            setGiveawayId(fromQuery);
            setOwnerToken(stored);
            setStep("comments");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const shouldPoll = (step === "comments" || step === "rules") && giveawayId && ownerToken;
        if (!shouldPoll) return;

        let cancelled = false;
        const poll = async () => {
            try {
                const data = await apiFetch<{ participantCount: number; status: string }>(
                    `/api/tiktok/giveaway/${giveawayId}?ownerToken=${encodeURIComponent(ownerToken!)}`
                );
                if (cancelled) return;
                setParticipantCount(data.participantCount);
            } catch {
                // Transient network hiccups are silent — the next tick retries.
            }
        };

        poll();
        pollRef.current = setInterval(poll, 2500);
        return () => {
            cancelled = true;
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [step, giveawayId, ownerToken]);

    const createGiveaway = useCallback(async () => {
        if (!videoUrl.trim()) return;
        setCreating(true);
        setCreateError(null);
        try {
            const data = await apiFetch<{ giveawayId: string; ownerToken: string }>(
                "/api/tiktok/giveaway/create",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ videoUrl: videoUrl.trim(), locale }),
                }
            );
            window.localStorage.setItem(ownerTokenStorageKey(data.giveawayId), data.ownerToken);
            setGiveawayId(data.giveawayId);
            setOwnerToken(data.ownerToken);
            setParticipantCount(0);
            setStep("comments");
            router.replace(`/tiktok/extension?g=${data.giveawayId}`);
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : "Çekiliş oluşturulamadı");
        } finally {
            setCreating(false);
        }
    }, [videoUrl, locale, router]);

    const copy = useCallback(
        (text: string, field: "id" | "code") => {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedField(field);
                toast.success("Kopyalandı!");
                setTimeout(() => setCopiedField(null), 1800);
            });
        },
        [toast]
    );

    const runDraw = useCallback(async () => {
        if (!giveawayId || !ownerToken) return;
        setDrawError(null);
        setDrawing(true);
        setStep("result");
        setCountingDown(true);

        try {
            await apiFetch(`/api/tiktok/giveaway/${giveawayId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ownerToken,
                    countUserOnce,
                    keyword,
                    excludeNames: excludeOwner && ownerUsername.trim() ? [ownerUsername.trim()] : [],
                    winnerCount,
                    backupCount,
                }),
            });

            for (const n of [3, 2, 1]) {
                setCountdownValue(n);
                await new Promise((r) => setTimeout(r, 700));
            }
            setCountdownValue(0);

            const data = await apiFetch<{ result: DrawResult }>(`/api/tiktok/giveaway/${giveawayId}/draw`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ownerToken }),
            });

            confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
            setResult(data.result);
        } catch (err) {
            setDrawError(err instanceof Error ? err.message : "Çekiliş yapılamadı");
            setStep("rules");
        } finally {
            setDrawing(false);
            setCountingDown(false);
            setCountdownValue(null);
        }
    }, [giveawayId, ownerToken, countUserOnce, keyword, excludeOwner, ownerUsername, winnerCount, backupCount]);

    const filterLabels = useMemo(
        () => ({
            keywordLabel: "Anahtar kelime",
            keywordPlaceholder: "Örn. YULASANTA",
            preview: "Önizleme",
            previewHint: "Bu ayarlar çekiliş anında uygulanır.",
            excludeOwner: "Hesap sahibini hariç tut",
            eligibleWillEnter: "{count} kişi çekilişe katılacak",
            eligibleListTitle: "Katılımcılar",
            eligibleEmpty: "Henüz katılımcı yok",
            ownerUsernamePlaceholder: "@kullaniciadi",
        }),
        []
    );

    const currentStepNumber: 1 | 2 | 3 | 4 =
        step === "link" ? 1 : step === "comments" ? 2 : step === "rules" ? 3 : 4;

    return (
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-accent/10 text-indigo-accent">
                    <Chrome className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">TikTok Chrome Extension Çekilişi</h1>
                <p className="mt-2 text-[var(--text-secondary)]">
                    Yorumları kendi tarayıcınızda toplayın — tamamen ücretsiz, kayıt yok.
                </p>
                <a
                    href={TIKTOK_CHROME_EXTENSION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-accent px-5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(79,70,229,0.25)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                    <Chrome className="h-4 w-4" /> Extension&apos;ı Chrome&apos;a Ekle
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Zaten yüklediyseniz aşağıdan çekilişinizi oluşturmaya devam edin.
                </p>
            </div>

            <Stepper current={currentStepNumber} />

            {step === "link" && (
                <Card>
                    <label htmlFor="ext-url" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                        TikTok video linki
                    </label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-4 py-3.5 transition focus-within:border-indigo-accent focus-within:ring-4 focus-within:ring-indigo-accent/10">
                            <Link2 className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
                            <input
                                id="ext-url"
                                type="url"
                                inputMode="url"
                                autoComplete="url"
                                placeholder="https://www.tiktok.com/@kullanici/video/..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && createGiveaway()}
                                className="w-full bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
                            />
                        </div>
                        {createError && (
                            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                {createError}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={createGiveaway}
                            disabled={creating || !videoUrl.trim()}
                            className={cn(
                                "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-base font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
                                EXT_CTA
                            )}
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" /> Oluşturuluyor…
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="h-5 w-5" /> Çekilişi Oluştur
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-muted)]">
                        <Puzzle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            Bir sonraki adımda size özel bir Çekiliş ID ve İçe Aktarma Kodu göstereceğiz — bunları
                            YulaSanta Chrome Extension&apos;a kaydedip yorumları toplayacaksınız.{" "}
                            <a
                                href={TIKTOK_CHROME_EXTENSION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-accent underline underline-offset-2 hover:text-indigo-accent/80"
                            >
                                Extension&apos;ı henüz yüklemediyseniz buradan ekleyin.
                            </a>
                        </p>
                    </div>
                </Card>
            )}

            {step === "comments" && giveawayId && ownerToken && (
                <Card>
                    <div className="mb-4 flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-4 py-3">
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">Çekiliş ID</p>
                            <p className="font-mono text-lg font-bold">{giveawayId}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => copy(giveawayId, "id")}
                            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--border-light)]"
                            aria-label="Çekiliş ID'yi kopyala"
                        >
                            {copiedField === "id" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="mb-6 flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-xs text-[var(--text-muted)]">İçe Aktarma Kodu (extension&apos;a yapıştırın)</p>
                            <p className="truncate font-mono text-xs">{ownerToken}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => copy(ownerToken, "code")}
                            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--border-light)]"
                            aria-label="İçe aktarma kodunu kopyala"
                        >
                            {copiedField === "code" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>

                    <ol className="mb-6 space-y-2 text-sm text-[var(--text-secondary)]">
                        <li>1. Bu sekmeyi açık bırakın, TikTok videosunu başka bir sekmede açın.</li>
                        <li>
                            2. YulaSanta Chrome Extension&apos;ı açın — bu sekme açık olduğu sürece Çekiliş ID ve
                            İçe Aktarma Kodu otomatik algılanır, kopyala/yapıştır gerekmez.{" "}
                            <a
                                href={TIKTOK_CHROME_EXTENSION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-accent underline underline-offset-2 hover:text-indigo-accent/80"
                            >
                                Extension yüklü değil mi?
                            </a>
                        </li>
                        <li>3. &quot;Yorumları Topla&quot;ya, ardından &quot;YulaSanta&apos;ya Gönder&quot;e basın.</li>
                    </ol>

                    <div className="flex items-center justify-between rounded-xl border border-indigo-accent/25 bg-indigo-accent/[0.06] px-4 py-3.5">
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-accent opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-accent" />
                            </span>
                            Toplanan yorum
                        </span>
                        <span className="text-2xl font-bold tabular-nums">{participantCount.toLocaleString("tr-TR")}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setStep("rules")}
                        disabled={participantCount === 0}
                        className={cn(
                            "mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-base font-bold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
                            EXT_CTA
                        )}
                    >
                        Devam Et <ArrowRight className="h-5 w-5" />
                    </button>
                    {participantCount === 0 && (
                        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
                            Devam etmek için önce extension ile en az bir yorum toplayın.
                        </p>
                    )}
                </Card>
            )}

            {step === "rules" && (
                <div className="space-y-6">
                    <Card>
                        <button
                            type="button"
                            onClick={() => setStep("comments")}
                            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        >
                            <ArrowLeft className="h-4 w-4" /> Yorumlar
                        </button>

                        <div className="mb-5 flex items-center justify-between rounded-xl border border-dashed border-[var(--border-light)] px-4 py-3">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4 text-indigo-accent" /> Toplanan yorum
                            </span>
                            <span className="text-xl font-bold tabular-nums">{participantCount.toLocaleString("tr-TR")}</span>
                        </div>

                        <h2 className="mb-4 font-semibold">Çekiliş Ayarları</h2>

                        <button
                            type="button"
                            onClick={() => setCountUserOnce(!countUserOnce)}
                            className="mb-4 flex w-full min-h-[48px] items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-left"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Filter className="h-4 w-4 text-indigo-accent" /> Bir kullanıcı = bir katılım
                            </span>
                            <span
                                className={cn(
                                    "relative h-7 w-12 rounded-full transition-colors",
                                    countUserOnce ? "bg-indigo-accent" : "bg-[var(--text-muted)]"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
                                        countUserOnce ? "right-1" : "left-1"
                                    )}
                                />
                            </span>
                        </button>

                        <FilterRulesPanel
                            keyword={keyword}
                            onKeywordChange={setKeyword}
                            total={participantCount}
                            eligible={participantCount}
                            eligibleList={[]}
                            excludeOwner={excludeOwner}
                            onExcludeOwnerChange={setExcludeOwner}
                            ownerUsername={ownerUsername}
                            onOwnerUsernameChange={setOwnerUsername}
                            accentClass="text-indigo-accent"
                            toggleOnClass="bg-indigo-accent"
                            inputFocusClass="focus:border-indigo-accent focus:ring-indigo-accent/10"
                            labels={filterLabels}
                        />

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Kazanan Sayısı</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={winnerCount}
                                    onChange={(e) => setWinnerCount(Math.max(1, Number(e.target.value) || 1))}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Yedek Sayısı</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={backupCount}
                                    onChange={(e) => setBackupCount(Math.max(0, Number(e.target.value) || 0))}
                                />
                            </div>
                        </div>

                        {drawError && (
                            <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                {drawError}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={runDraw}
                            disabled={drawing || participantCount === 0}
                            className={cn(
                                "mt-6 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl px-6 text-lg font-bold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
                                EXT_CTA
                            )}
                        >
                            <Trophy className="h-5 w-5" /> Çekilişi Başlat
                        </button>
                    </Card>
                </div>
            )}

            {countingDown && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)]"
                    role="status"
                    aria-live="polite"
                >
                    <p className="mb-6 text-lg text-[var(--text-secondary)]">Hazır mısın?</p>
                    <div className="text-8xl font-black text-indigo-accent sm:text-9xl">
                        {countdownValue && countdownValue > 0 ? countdownValue : "🎉"}
                    </div>
                </div>
            )}

            {step === "result" && !countingDown && result && giveawayId && (
                <div className="space-y-6">
                    <Card className="text-center">
                        <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-500" />
                        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Kazanan</p>
                        {result.winners.map((w, i) => (
                            <h2 key={`${w.name}-${i}`} className="mt-1 text-2xl font-bold">
                                @{w.name}
                            </h2>
                        ))}
                        <p className="mt-2 text-[var(--text-secondary)]">
                            {result.eligible.toLocaleString("tr-TR")} katılımcı arasından seçildi.
                        </p>

                        {result.backups.length > 0 && (
                            <div className="mt-4 space-y-1 text-sm text-[var(--text-secondary)]">
                                <p className="font-semibold">Yedekler</p>
                                {result.backups.map((b, i) => (
                                    <p key={`${b.name}-${i}`}>
                                        {i + 1}. @{b.name}
                                    </p>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    downloadWinnerCard({
                                        giveawayName: videoUrl || "TikTok Çekilişi",
                                        winners: result.winners,
                                        backups: result.backups,
                                        platform: "tiktok",
                                    })
                                }
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-accent/10 px-5 py-2.5 text-sm font-bold text-indigo-accent hover:bg-indigo-accent/15"
                            >
                                <Download className="h-4 w-4" /> Sonucu İndir
                            </button>
                            <Link
                                href={`/verify/${giveawayId}`}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-indigo-accent px-5 py-2.5 text-sm font-bold text-indigo-accent hover:bg-indigo-accent hover:text-white"
                            >
                                <ShieldCheck className="h-4 w-4" /> Çekilişi Doğrula
                            </Link>
                        </div>
                    </Card>

                    <div className="flex items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <Link2 className="h-4 w-4" /> /verify/{giveawayId}
                        </span>
                        <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setStep("link");
                            setVideoUrl("");
                            setGiveawayId(null);
                            setOwnerToken(null);
                            setResult(null);
                            router.replace("/tiktok/extension");
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                    >
                        <RefreshCcw className="h-4 w-4" /> Yeni Çekiliş
                    </button>
                </div>
            )}
        </main>
    );
}
