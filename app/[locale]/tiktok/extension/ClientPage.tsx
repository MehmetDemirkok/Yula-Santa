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
    RefreshCcw,
    Download,
    Link2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FilterRulesPanel } from "@/components/giveaway/FilterRulesPanel";
import { downloadWinnerCard } from "@/lib/downloadWinnerCard";
import { useToast } from "@/lib/ToastContext";

type Step = "create" | "collect" | "countdown" | "result";

type DrawResult = {
    winners: { name: string; comment?: string }[];
    backups: { name: string }[];
    total: number;
    eligible: number;
    seed: string;
    at: string;
};

const OWNER_TOKEN_PREFIX = "ys_tt_ext_owner:";

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

export default function TikTokExtensionGiveaway() {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>("create");
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
    const [countdownValue, setCountdownValue] = useState<number | null>(null);
    const [result, setResult] = useState<DrawResult | null>(null);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // "Çekilişi Başlat" is at the bottom of a long settings card — without this,
    // the countdown/winner reveal render off-screen above the user's scroll
    // position and the footer shows instead (the bug being fixed here).
    useEffect(() => {
        // Instant, not smooth — an in-flight smooth scroll gets cut short by the
        // body-scroll lock effect below (overflow:hidden freezes it mid-animation).
        if (step === "countdown" || step === "result") {
            window.scrollTo(0, 0);
        }
    }, [step]);

    // The countdown is a fixed full-screen overlay (see below), but a locked
    // body scroll keeps the page from jumping under it while it's up.
    useEffect(() => {
        if (step !== "countdown") return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [step]);

    // Restore an in-progress giveaway from ?g=ID + localStorage (owner-token) on load/reload.
    useEffect(() => {
        const fromQuery = searchParams.get("g");
        if (!fromQuery) return;
        const stored = typeof window !== "undefined" ? window.localStorage.getItem(ownerTokenStorageKey(fromQuery)) : null;
        if (stored) {
            setGiveawayId(fromQuery);
            setOwnerToken(stored);
            setStep("collect");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (step !== "collect" || !giveawayId || !ownerToken) return;

        let cancelled = false;
        const poll = async () => {
            try {
                const data = await apiFetch<{ participantCount: number; status: string }>(
                    `/api/tiktok/giveaway/${giveawayId}?ownerToken=${encodeURIComponent(ownerToken)}`
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
            setStep("collect");
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
        setStep("countdown");

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
            setStep("result");
        } catch (err) {
            setDrawError(err instanceof Error ? err.message : "Çekiliş yapılamadı");
            setStep("collect");
        } finally {
            setDrawing(false);
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

    return (
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-santa-red/10 text-santa-red">
                    <Chrome className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">TikTok Chrome Extension Çekilişi</h1>
                <p className="mt-2 text-[var(--text-secondary)]">
                    Yorumları kendi tarayıcınızda toplayın — tamamen ücretsiz, kayıt yok.
                </p>
            </div>

            {step === "create" && (
                <div className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:bg-[var(--card-bg)] sm:p-8">
                    <label className="mb-2 block text-sm font-semibold">TikTok Video URL</label>
                    <Input
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.tiktok.com/@kullanici/video/..."
                        inputMode="url"
                    />
                    {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
                    <Button className="mt-4 w-full" onClick={createGiveaway} disabled={creating || !videoUrl.trim()}>
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Çekilişi Oluştur"}
                    </Button>
                </div>
            )}

            {step === "collect" && giveawayId && ownerToken && (
                <div className="space-y-6">
                    <div className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:bg-[var(--card-bg)] sm:p-8">
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
                                İçe Aktarma Kodu otomatik algılanır, kopyala/yapıştır gerekmez.
                            </li>
                            <li>3. &quot;Yorumları Topla&quot;ya, ardından &quot;YulaSanta&apos;ya Gönder&quot;e basın.</li>
                            <li>4. Toplanan yorumlar otomatik olarak bu çekilişe aktarılacaktır.</li>
                        </ol>

                        <div className="flex items-center justify-between rounded-xl border border-dashed border-[var(--border-light)] px-4 py-3">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4 text-santa-red" /> Toplanan yorum
                            </span>
                            <span className="text-xl font-bold">{participantCount.toLocaleString("tr-TR")}</span>
                        </div>
                    </div>

                    <div className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:bg-[var(--card-bg)] sm:p-8">
                        <h2 className="mb-4 font-semibold">Çekiliş Ayarları</h2>

                        <button
                            type="button"
                            onClick={() => setCountUserOnce(!countUserOnce)}
                            className="mb-4 flex w-full min-h-[48px] items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-left"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Filter className="h-4 w-4 text-santa-red" /> Bir kullanıcı = bir katılım
                            </span>
                            <span
                                className={`relative h-7 w-12 rounded-full transition-colors ${countUserOnce ? "bg-santa-red" : "bg-[var(--text-muted)]"}`}
                            >
                                <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? "right-1" : "left-1"}`}
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

                        {drawError && <p className="mt-3 text-sm text-red-600">{drawError}</p>}

                        <Button
                            className="mt-6 w-full"
                            size="lg"
                            onClick={runDraw}
                            disabled={drawing || participantCount === 0}
                        >
                            <Trophy className="h-4 w-4" /> Çekilişi Başlat
                        </Button>
                        {participantCount === 0 && (
                            <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
                                Çekilişi başlatmak için önce extension ile yorum toplayın.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {step === "countdown" && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)]"
                    role="status"
                    aria-live="polite"
                >
                    <p className="mb-6 text-lg text-[var(--text-secondary)]">Hazır mısın?</p>
                    <div className="text-8xl font-black text-santa-red sm:text-9xl">
                        {countdownValue && countdownValue > 0 ? countdownValue : "🎉"}
                    </div>
                </div>
            )}

            {step === "result" && result && giveawayId && (
                <div className="space-y-6">
                    <div className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 text-center shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:bg-[var(--card-bg)] sm:p-8">
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
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() =>
                                    downloadWinnerCard({
                                        giveawayName: videoUrl || "TikTok Çekilişi",
                                        winners: result.winners,
                                        backups: result.backups,
                                        platform: "tiktok",
                                    })
                                }
                            >
                                <Download className="h-4 w-4" /> Sonucu İndir
                            </Button>
                            <Link
                                href={`/verify/${giveawayId}`}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-current px-5 py-2.5 text-sm font-bold text-santa-red hover:bg-santa-red hover:text-white"
                            >
                                <ShieldCheck className="h-4 w-4" /> Çekilişi Doğrula
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <Link2 className="h-4 w-4" /> /verify/{giveawayId}
                        </span>
                        <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                            setStep("create");
                            setVideoUrl("");
                            setGiveawayId(null);
                            setOwnerToken(null);
                            setResult(null);
                            router.replace("/tiktok/extension");
                        }}
                    >
                        <RefreshCcw className="h-4 w-4" /> Yeni Çekiliş
                    </Button>
                </div>
            )}
        </main>
    );
}
