"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackDraw, trackShare } from "@/lib/analytics/client";
import { useLocale, useTranslations } from "next-intl";
import {
    ArrowLeft,
    Edit3,
    History,
    List,
    Plus,
    Play,
    ShieldCheck,
    Shuffle,
    SortAsc,
    Trash2,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WheelStage, type WheelStageHandle } from "@/components/wheel/WheelStage";
import { WinnerSheet } from "@/components/wheel/WinnerSheet";
import { celebrate } from "@/lib/celebrate";
import { secureRandomInt, secureShuffle } from "@/lib/random";
import { useTheme } from "@/lib/ThemeContext";
import { createWheelAudio } from "@/lib/wheel/wheelAudio";
import { MAX_ENTRIES, WHEEL_COLORS, colorForSegment, parseEntries } from "@/lib/wheel/wheelMath";

const STORAGE_KEY = "yulasanta_wheel_v1";
const MAX_HISTORY = 50;
const REVEAL_DELAY_MS = 750;
const HAPTIC_INTERVAL_MS = 45;

type PanelTab = "options" | "history";
type HistoryEntry = { id: number; name: string; color: string; at: number };
type Winner = { index: number; name: string };

type SavedState = {
    segments: string[];
    isSample: boolean;
    soundOn: boolean;
    autoRemove: boolean;
    history: HistoryEntry[];
};

function loadSaved(): Partial<SavedState> | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Partial<SavedState>) : null;
    } catch {
        return null;
    }
}

export function WheelClient() {
    const t = useTranslations("tools.wheelOfFortuneContent");
    const locale = useLocale();
    const { resolvedTheme } = useTheme();

    const [segments, setSegments] = useState<string[]>(() => t.raw("sampleOptions") as string[]);
    const [isSample, setIsSample] = useState(true);
    const [soundOn, setSoundOn] = useState(true);
    const [autoRemove, setAutoRemove] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [restored, setRestored] = useState(false);

    const [newName, setNewName] = useState("");
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [tab, setTab] = useState<PanelTab>("options");
    const [undoList, setUndoList] = useState<string[] | null>(null);
    const [limitHit, setLimitHit] = useState(false);

    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<Winner | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [spinQueued, setSpinQueued] = useState(false);
    const [ctaVisible, setCtaVisible] = useState(true);

    const stageRef = useRef<WheelStageHandle>(null);
    const stageSectionRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLButtonElement>(null);
    const passRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const spinningRef = useRef(false);
    const lastHapticRef = useRef(0);
    const revealTimerRef = useRef(0);
    const copiedTimerRef = useRef(0);
    const [audio] = useState(createWheelAudio);

    const canSpin = segments.length >= 2 && !isSpinning;

    // Restore after mount so the server-rendered markup and first client render match.
    useEffect(() => {
        const saved = loadSaved();
        /* eslint-disable react-hooks/set-state-in-effect */
        if (saved) {
            if (Array.isArray(saved.segments)) {
                setSegments(saved.segments.filter((s) => typeof s === "string").slice(0, MAX_ENTRIES));
                setIsSample(saved.isSample === true);
            }
            if (typeof saved.soundOn === "boolean") setSoundOn(saved.soundOn);
            if (typeof saved.autoRemove === "boolean") setAutoRemove(saved.autoRemove);
            if (Array.isArray(saved.history)) setHistory(saved.history.slice(0, MAX_HISTORY));
        }
        setRestored(true);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []);

    useEffect(() => {
        if (!restored) return;
        try {
            const state: SavedState = { segments, isSample, soundOn, autoRemove, history };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            /* storage may be unavailable, for example in private browsing */
        }
    }, [restored, segments, isSample, soundOn, autoRemove, history]);

    useEffect(() => {
        return () => {
            clearTimeout(revealTimerRef.current);
            clearTimeout(copiedTimerRef.current);
            audio.dispose();
        };
    }, [audio]);

    // Shows the floating spin button once the main one has scrolled out of view.
    useEffect(() => {
        const cta = ctaRef.current;
        if (!cta) return;
        const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
        observer.observe(cta);
        return () => observer.disconnect();
    }, []);

    const dismissWinner = useCallback(() => {
        clearTimeout(revealTimerRef.current);
        setWinner(null);
        setSheetOpen(false);
        setCopied(false);
    }, []);

    const commitSegments = useCallback(
        (next: string[]) => {
            setSegments(next);
            setIsSample(false);
            setLimitHit(false);
            dismissWinner();
        },
        [dismissWinner]
    );

    // ── List management ─────────────────────────────────────────────────────
    const addEntries = (text: string) => {
        const entries = parseEntries(text);
        if (entries.length === 0) return;
        const base = isSample ? [] : segments;
        const room = MAX_ENTRIES - base.length;
        commitSegments([...base, ...entries.slice(0, Math.max(0, room))]);
        setLimitHit(entries.length > room);
        setUndoList(null);
        setNewName("");
    };

    const removeSegment = (index: number) => {
        commitSegments(segments.filter((_, i) => i !== index));
    };

    const clearList = () => {
        setUndoList(segments);
        commitSegments([]);
        inputRef.current?.focus({ preventScroll: true });
    };

    const undoClear = () => {
        if (!undoList) return;
        commitSegments(undoList);
        setUndoList(null);
    };

    const openBulk = () => {
        setBulkText(isSample ? "" : segments.join("\n"));
        setIsBulkMode(true);
    };

    const applyBulk = () => {
        const lines = bulkText
            .split(/\r?\n/)
            .flatMap((line) => parseEntries(`${line}\n`))
            .slice(0, MAX_ENTRIES);
        commitSegments(lines);
        setUndoList(null);
        setIsBulkMode(false);
    };

    // ── Spin ─────────────────────────────────────────────────────────────────
    const spin = useCallback(
        (power = 0.55) => {
            if (spinningRef.current || segments.length < 2) return;
            audio.unlock();
            dismissWinner();
            spinningRef.current = true;
            setIsSpinning(true);
            stageRef.current?.spin(secureRandomInt(segments.length), power);
        },
        [audio, dismissWinner, segments.length]
    );

    const handleTick = useCallback(
        (remaining: number) => {
            if (soundOn) audio.tick(0.35 + remaining * 0.65);
            const now = performance.now();
            if (remaining < 0.55 && now - lastHapticRef.current > HAPTIC_INTERVAL_MS && navigator.vibrate) {
                lastHapticRef.current = now;
                navigator.vibrate(6);
            }
        },
        [audio, soundOn]
    );

    const handlePass = useCallback(
        (index: number) => {
            if (passRef.current) passRef.current.textContent = segments[index] ?? "";
        },
        [segments]
    );

    const handleSpinEnd = useCallback(
        (index: number) => {
            spinningRef.current = false;
            const name = segments[index];
            setIsSpinning(false);
            setWinner({ index, name });
            trackDraw("wheel", { participants: segments.length, winners: 1 });
            setHistory((prev) =>
                [
                    { id: Date.now(), name, color: colorForSegment(index, segments.length), at: Date.now() },
                    ...prev,
                ].slice(0, MAX_HISTORY)
            );
            if (soundOn) audio.win();
            if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
            celebrate({ colors: [...WHEEL_COLORS, "#FFE08A"] });
            revealTimerRef.current = window.setTimeout(() => setSheetOpen(true), REVEAL_DELAY_MS);
        },
        [audio, segments, soundOn]
    );

    const removeWinner = useCallback(() => {
        if (!winner) return;
        setSegments((prev) => prev.filter((_, i) => i !== winner.index));
        setIsSample(false);
        dismissWinner();
    }, [dismissWinner, winner]);

    const closeSheet = useCallback(() => {
        if (autoRemove) removeWinner();
        else setSheetOpen(false);
    }, [autoRemove, removeWinner]);

    // A spin that follows a removal waits for the new list to reach the wheel.
    const requestSpin = useCallback(
        (power?: number) => {
            if (autoRemove && winner) {
                removeWinner();
                setSpinQueued(true);
            } else {
                spin(power);
            }
        },
        [autoRemove, removeWinner, spin, winner]
    );

    useEffect(() => {
        if (!spinQueued) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSpinQueued(false);
        spin();
    }, [spinQueued, spin]);

    const spinFromFloatingButton = () => {
        stageSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        requestSpin();
    };

    const shareResult = async () => {
        if (!winner) return;
        const text = `${t("congrats")} ${winner.name}`;
        trackShare("wheel");
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: t("title"), text, url });
            } catch {
                /* the person closed the share dialog */
            }
            return;
        }
        try {
            await navigator.clipboard.writeText(`${text}\n${url}`);
            setCopied(true);
            clearTimeout(copiedTimerRef.current);
            copiedTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard access was refused */
        }
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code !== "Space" || sheetOpen) return;
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
            e.preventDefault();
            requestSpin();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [sheetOpen, requestSpin]);

    const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
    const toolClass =
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-indigo-accent/40 hover:text-indigo-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-accent disabled:pointer-events-none disabled:opacity-50";
    const tabClass = (active: boolean) =>
        `flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-accent ${
            active
                ? "bg-[var(--card-bg)] text-indigo-accent shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`;

    return (
        <div className="ys-page-shell px-4 pb-24 pt-[28px] sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-2 flex items-center gap-1 sm:mb-5 sm:gap-3">
                    <Link
                        href="/tools"
                        aria-label={t("backToTools")}
                        title={t("backToTools")}
                        className="-ms-2 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-accent"
                    >
                        <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate font-heading text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-headline-lg">
                            {t("title")}
                        </h1>
                        <p className="hidden text-sm text-[var(--text-muted)] sm:block">{t("subtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSoundOn((on) => !on)}
                        aria-pressed={soundOn}
                        aria-label={soundOn ? t("soundOn") : t("soundOff")}
                        title={soundOn ? t("soundOn") : t("soundOff")}
                        className="flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-secondary)] transition hover:border-indigo-accent/30 hover:text-indigo-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-accent"
                    >
                        {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Wheel: always first, so a phone sees it and the spin button without scrolling. */}
                    <section
                        ref={stageSectionRef}
                        aria-label={t("title")}
                        className="relative -mx-4 scroll-mt-16 overflow-hidden bg-[#FBF6EA] px-3 dark:bg-[#0B0F1E] pb-4 pt-3 sm:mx-0 sm:rounded-3xl sm:border sm:border-[#E7DCC3] sm:px-6 sm:pb-6 sm:pt-5 sm:shadow-[0_18px_48px_rgba(120,80,30,0.14)] dark:sm:border-white/10 dark:sm:shadow-[0_24px_60px_rgba(11,15,30,0.28)]"
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,214,120,0.38)_0%,rgba(214,40,57,0.07)_46%,transparent_72%)] dark:bg-[radial-gradient(circle_at_50%_42%,rgba(79,70,229,0.34)_0%,rgba(182,23,34,0.12)_42%,transparent_72%)]"
                        />

                        <div className="relative flex min-h-9 items-center justify-center" aria-live="polite">
                            {isSpinning ? (
                                <span
                                    // Written directly on every tick, so React must never reuse this node.
                                    key="pass"
                                    ref={passRef}
                                    aria-hidden="true"
                                    className="max-w-full truncate rounded-full bg-[#14161F]/8 px-4 py-1.5 font-heading text-sm font-bold text-[#14161F] dark:bg-white/10 dark:text-white"
                                />
                            ) : winner ? (
                                <span
                                    key="winner"
                                    className="max-w-full truncate rounded-full bg-[#FFE08A] px-4 py-1.5 font-heading text-sm font-extrabold text-[#14161F]"
                                >
                                    {t("winner")} {winner.name}
                                </span>
                            ) : (
                                <span
                                    key="hint"
                                    className="px-4 py-1.5 text-center text-xs font-medium text-[#14161F]/70 sm:text-sm dark:text-white/65"
                                >
                                    {segments.length < 2 ? t("needMore") : t("tapOrSwipe")}
                                </span>
                            )}
                        </div>

                        {/* Phones held sideways have too little height to stack, so wheel and button sit side by side. */}
                        <div className="[@media(max-height:500px)]:flex [@media(max-height:500px)]:items-center [@media(max-height:500px)]:gap-6">
                        <div className="relative mx-auto mt-1 w-full max-w-[min(100%,max(260px,calc(100dvh-260px)))] sm:max-w-[min(100%,max(340px,calc(100dvh-334px)))] [@media(max-height:500px)]:mx-0 [@media(max-height:500px)]:w-[300px] [@media(max-height:500px)]:max-w-[300px]! [@media(max-height:500px)]:shrink-0">
                            <WheelStage
                                ref={stageRef}
                                segments={segments}
                                winnerIndex={winner?.index ?? null}
                                theme={resolvedTheme}
                                canSpin={canSpin}
                                hubLabel={t("spin")}
                                wheelLabel={t("subtitle")}
                                onRequestSpin={requestSpin}
                                onTick={handleTick}
                                onPass={handlePass}
                                onSpinEnd={handleSpinEnd}
                            />
                        </div>

                        <div className="relative mx-auto mt-3 flex max-w-md flex-col items-center gap-2.5 sm:mt-4 [@media(max-height:500px)]:mt-0! [@media(max-height:500px)]:flex-1">
                            <button
                                ref={ctaRef}
                                type="button"
                                onClick={() => requestSpin()}
                                disabled={!canSpin}
                                className="inline-flex h-[56px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#D62839] px-8 font-heading text-lg font-extrabold text-white shadow-[0_8px_26px_rgba(214,40,57,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#14161F]/40 active:scale-[0.98] disabled:cursor-default disabled:bg-[#14161F]/10 disabled:text-[#14161F]/45 disabled:shadow-none dark:focus-visible:ring-white/60 dark:disabled:bg-white/10 dark:disabled:text-white/50"
                            >
                                {isSpinning ? t("spinning") : t("spin")}
                            </button>
                            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[#14161F]/65 dark:text-white/60">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                {t("fairNote")}
                            </p>
                        </div>
                        </div>
                    </section>

                    {/* The list stays out of the height calculation on desktop so it matches the wheel. */}
                    <section className="relative min-h-[420px]">
                        <div className="ys-card flex flex-col p-4 hover:!bg-[var(--card-bg)] sm:p-5 lg:absolute lg:inset-0">
                            <div role="tablist" className="mb-4 flex rounded-lg bg-[var(--surface-2)] p-1">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === "options"}
                                    onClick={() => setTab("options")}
                                    className={tabClass(tab === "options")}
                                >
                                    <List className="h-4 w-4" />
                                    {t("options")}
                                    <span className="ys-chip ys-chip-indigo !px-2 !py-0">{segments.length}</span>
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === "history"}
                                    onClick={() => setTab("history")}
                                    className={tabClass(tab === "history")}
                                >
                                    <History className="h-4 w-4" />
                                    {t("history")}
                                    {history.length > 0 && (
                                        <span className="ys-chip ys-chip-indigo !px-2 !py-0">{history.length}</span>
                                    )}
                                </button>
                            </div>

                            {tab === "history" ? (
                                history.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-[var(--text-muted)]">
                                        {t("historyEmpty")}
                                    </p>
                                ) : (
                                    <>
                                        <ol className="min-h-0 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar lg:pe-1">
                                            {history.map((entry) => (
                                                <li
                                                    key={entry.id}
                                                    className="flex min-h-11 items-center gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm"
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    <span className="min-w-0 flex-1 truncate font-semibold text-[var(--text-primary)]">
                                                        {entry.name}
                                                    </span>
                                                    <time className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
                                                        {timeFormat.format(entry.at)}
                                                    </time>
                                                </li>
                                            ))}
                                        </ol>
                                        <button
                                            type="button"
                                            onClick={() => setHistory([])}
                                            className={`${toolClass} mt-4 w-full`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {t("clearHistory")}
                                        </button>
                                    </>
                                )
                            ) : isBulkMode ? (
                                <div className="flex min-h-0 flex-1 flex-col">
                                    <textarea
                                        value={bulkText}
                                        onChange={(e) => setBulkText(e.target.value)}
                                        placeholder={t("placeholder")}
                                        aria-label={t("bulkMode")}
                                        rows={8}
                                        autoFocus
                                        className="mb-3 min-h-48 w-full flex-1 resize-none rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-base leading-relaxed text-[var(--text-primary)] focus:border-indigo-accent focus:outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsBulkMode(false)}
                                            className={toolClass}
                                        >
                                            {t("cancel")}
                                        </button>
                                        <Button onClick={applyBulk} size="sm" className="w-full">
                                            {t("applyChanges")}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <form
                                        className="flex gap-2"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            addEntries(newName);
                                        }}
                                    >
                                        <Input
                                            ref={inputRef}
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onPaste={(e) => {
                                                const pasted = e.clipboardData.getData("text");
                                                if (parseEntries(pasted).length > 1) {
                                                    e.preventDefault();
                                                    addEntries(pasted);
                                                }
                                            }}
                                            placeholder={t("addName")}
                                            aria-label={t("addName")}
                                            enterKeyHint="done"
                                            autoComplete="off"
                                            maxLength={2000}
                                            disabled={isSpinning}
                                            className="h-[48px] flex-1 py-2 text-base focus:border-indigo-accent"
                                        />
                                        <button
                                            type="submit"
                                            // Keeps the phone keyboard open so several names can be typed in a row.
                                            onMouseDown={(e) => e.preventDefault()}
                                            disabled={isSpinning || !newName.trim()}
                                            aria-label={t("addName")}
                                            className="flex h-[48px] w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-lg bg-indigo-accent text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-accent focus-visible:ring-offset-2 active:scale-95 disabled:cursor-default disabled:opacity-40"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </form>
                                    <p className="mt-2 text-xs text-[var(--text-muted)]">{t("addHint")}</p>

                                    {isSample && (
                                        <p className="mt-3 rounded-lg bg-indigo-accent/10 px-3 py-2 text-xs font-medium leading-relaxed text-indigo-accent">
                                            {t("sampleNotice")}
                                        </p>
                                    )}
                                    {limitHit && (
                                        <p role="alert" className="mt-3 rounded-lg bg-santa-red/10 px-3 py-2 text-xs font-medium text-santa-red">
                                            {t("limitReached", { max: MAX_ENTRIES })}
                                        </p>
                                    )}
                                    {undoList && (
                                        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-2)] ps-3 text-sm text-[var(--text-secondary)]">
                                            <span role="status">{t("listCleared")}</span>
                                            <button
                                                type="button"
                                                onClick={undoClear}
                                                className="min-h-11 cursor-pointer rounded-lg px-3 font-bold text-indigo-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-accent"
                                            >
                                                {t("undo")}
                                            </button>
                                        </div>
                                    )}

                                    <ul className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar lg:pe-1">
                                        {segments.map((segment, idx) => (
                                            <li
                                                key={`${idx}-${segment}`}
                                                className="flex min-h-11 items-center gap-3 rounded-lg bg-[var(--surface-2)] ps-3 text-sm"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: colorForSegment(idx, segments.length) }}
                                                />
                                                <span className="min-w-0 flex-1 truncate font-medium text-[var(--text-primary)]">
                                                    {segment}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSegment(idx)}
                                                    disabled={isSpinning}
                                                    aria-label={t("removeItem", { name: segment })}
                                                    className="flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-santa-red/10 hover:text-santa-red focus:outline-none focus-visible:ring-2 focus-visible:ring-santa-red disabled:pointer-events-none disabled:opacity-40"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-between gap-3 border-t border-[var(--border-light)] pt-3 text-sm font-medium text-[var(--text-secondary)]">
                                        {t("autoRemove")}
                                        <input
                                            type="checkbox"
                                            checked={autoRemove}
                                            onChange={(e) => setAutoRemove(e.target.checked)}
                                            className="h-5 w-5 shrink-0 cursor-pointer accent-[#4F46E5]"
                                        />
                                    </label>

                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => commitSegments(secureShuffle(segments))}
                                            disabled={isSpinning || segments.length < 2}
                                            className={toolClass}
                                        >
                                            <Shuffle className="h-4 w-4 shrink-0" />
                                            {t("shuffle")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                commitSegments([...segments].sort((a, b) => a.localeCompare(b, locale)))
                                            }
                                            disabled={isSpinning || segments.length < 2}
                                            className={toolClass}
                                        >
                                            <SortAsc className="h-4 w-4 shrink-0" />
                                            {t("sort")}
                                        </button>
                                        <button type="button" onClick={openBulk} disabled={isSpinning} className={toolClass}>
                                            <Edit3 className="h-4 w-4 shrink-0" />
                                            {t("bulkMode")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearList}
                                            disabled={isSpinning || segments.length === 0}
                                            className={`${toolClass} hover:!border-santa-red/40 hover:!text-santa-red`}
                                        >
                                            <Trash2 className="h-4 w-4 shrink-0" />
                                            {t("clear")}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-2">
                    <div className="ys-card p-5 sm:p-8">
                        <h2 className="mb-4 font-heading text-xl font-bold text-[var(--text-primary)] sm:text-headline-md">
                            {t("howToTitle")}
                        </h2>
                        <ol className="space-y-3">
                            {(t.raw("howToText") as string[]).map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)]">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-accent/10 text-xs font-bold text-indigo-accent">
                                        {i + 1}
                                    </span>
                                    <span>{step.replace(/^\d+\.\s*/, "")}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="ys-card p-5 sm:p-8">
                        <h2 className="mb-4 font-heading text-xl font-bold text-[var(--text-primary)] sm:text-headline-md">
                            {t("aboutTitle")}
                        </h2>
                        <p className="leading-relaxed text-[var(--text-secondary)]">{t("aboutText")}</p>
                    </div>
                </div>
            </div>

            {/* Phone only: keeps spinning one tap away while editing a long list further down. */}
            {!ctaVisible && !sheetOpen && segments.length >= 2 && (
                <button
                    type="button"
                    onClick={spinFromFloatingButton}
                    disabled={isSpinning}
                    className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 right-[84px] z-40 inline-flex h-[56px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#D62839] font-heading text-base font-extrabold text-white shadow-[0_10px_30px_rgba(214,40,57,0.5)] transition active:scale-[0.98] disabled:opacity-60 sm:hidden"
                >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    {isSpinning ? t("spinning") : t("spin")}
                </button>
            )}

            {sheetOpen && winner && (
                <WinnerSheet
                    winner={winner.name}
                    eyebrow={t("winner")}
                    congrats={t("congrats")}
                    spinAgainLabel={t("spinAgain")}
                    removeLabel={t("removeWinner")}
                    shareLabel={t("share")}
                    copiedLabel={t("copied")}
                    closeLabel={t("close")}
                    copied={copied}
                    canRemove={!autoRemove}
                    onSpinAgain={() => requestSpin()}
                    onRemove={removeWinner}
                    onShare={shareResult}
                    onClose={closeSheet}
                />
            )}
        </div>
    );
}
