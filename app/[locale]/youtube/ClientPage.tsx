"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
    Youtube,
    MessageCircle,
    Plus,
    Minus,
    Users,
    AtSign,
    Play,
    Home,
    Trash2,
    Bell,
    Loader2,
    Trophy,
    X,
    ChevronDown,
    ChevronUp,
    Check,
    Shield,
    Zap,
    Filter,
    UserCheck,
    Download,
    Share2,
    Link2,
    ClipboardPaste,
    ArrowRight,
    Sparkles,
    Clock,
    BadgeCheck,
    Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ShareModal from "@/components/ShareModal";
import { useToast } from "@/lib/ToastContext";
import { downloadWinnerCard } from "@/lib/downloadWinnerCard";
import { secureShuffle, secureRandomInt } from "@/lib/random";
import { applyGiveawayFilters } from "@/lib/giveawayFilters";
import { buildDrawProof, type DrawProof } from "@/lib/giveawayProof";
import { FilterRulesPanel } from "@/components/giveaway/FilterRulesPanel";
import { DrawProofPanel } from "@/components/giveaway/DrawProofPanel";
import { SITE_SHARE_SUFFIX } from "@/lib/constants";
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";
import { Reveal } from "@/components/Reveal";

type Phase = "input" | "configure" | "results";
type DrawType = "comments" | "likes" | "subscribers";
type EntryMode = "auto" | "manual";

interface Participant {
    name: string;
    comment: string;
    channelId?: string;
    profileImageUrl?: string;
    isSubscribed?: boolean | null | "private";
}

const YT_PRIMARY = "bg-[#FF0000] hover:bg-[#e60000]";
const YT_SOFT = "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/5";

const FEATURE_ICONS = [MessageCircle, Filter, Users, UserCheck, MessageCircle, Youtube, Download, Clock] as const;
const TRUST_ICONS = [Shield, Zap, Filter, Users, BadgeCheck] as const;

export default function YouTubeGiveaway() {
    const router = useRouter();
    const locale = useLocale();
    const { t } = useLanguage();
    const tl = useTranslations("giveaway.landing.youtube");
    const tg = useTranslations("giveaway");
    const { toast } = useToast();

    const [phase, setPhase] = useState<Phase>("input");
    const [entryMode, setEntryMode] = useState<EntryMode>("auto");
    const [manualPaste, setManualPaste] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [isShortsVideo, setIsShortsVideo] = useState(false);
    const [drawType, setDrawType] = useState<DrawType>("comments");

    const [giveawayName, setGiveawayName] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(0);
    const [requireSubscription, setRequireSubscription] = useState(true);
    const [requireNotification, setRequireNotification] = useState(false);
    const [countUserOnce, setCountUserOnce] = useState(true);
    const [keywordFilter, setKeywordFilter] = useState("");
    const [excludeOwner, setExcludeOwner] = useState(true);
    const [drawProof, setDrawProof] = useState<DrawProof | null>(null);
    const [videoOwnerChannelId, setVideoOwnerChannelId] = useState<string | null>(null);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newParticipant, setNewParticipant] = useState("");
    const [bulkInput, setBulkInput] = useState("");
    const [showManualEntry, setShowManualEntry] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const toolRef = useRef<HTMLDivElement>(null);
    const configureRef = useRef<HTMLDivElement>(null);

    const [isRolling, setIsRolling] = useState(false);
    const [rollingParticipant, setRollingParticipant] = useState<Participant | null>(null);
    const [winners, setWinners] = useState<Participant[]>([]);
    const [backups, setBackups] = useState<Participant[]>([]);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowManualEntry(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (videoLink.trim()) {
            setIsShortsVideo(detectShortsVideo(videoLink));
        } else {
            setIsShortsVideo(false);
        }
    }, [videoLink]);

    const scrollToTool = () => {
        toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const goToConfigure = () => {
        setPhase("configure");
        requestAnimationFrame(() => {
            configureRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    const { eligible: eligibleParticipants, stats: filterStats } = useMemo(
        () =>
            applyGiveawayFilters(participants, {
                countUserOnce,
                keyword: keywordFilter,
                excludeChannelIds: excludeOwner && videoOwnerChannelId ? [videoOwnerChannelId] : [],
            }),
        [participants, countUserOnce, keywordFilter, excludeOwner, videoOwnerChannelId]
    );

    const filterLabels = {
        keywordLabel: tg("keywordLabel"),
        keywordPlaceholder: tg("keywordPlaceholder"),
        preview: tg.raw("preview") as string,
        previewHint: tg("previewHint"),
        excludeOwner: tg("excludeOwner"),
        eligibleWillEnter: tg.raw("eligibleWillEnter") as string,
        eligibleListTitle: tg("eligibleListTitle"),
        eligibleEmpty: tg("eligibleEmpty"),
        ownerUsernamePlaceholder: tg("ownerUsernamePlaceholder"),
    };

    const proofLabels = {
        title: tg("proofTitle"),
        seed: tg("proofSeed"),
        drawnAt: tg("proofDrawnAt"),
        eligible: tg("proofEligible"),
        algorithm: tg("proofAlgorithm"),
        copy: tg("proofCopy"),
        copied: tg("proofCopied"),
        openLink: tg("proofOpenLink"),
        keyword: tg("proofKeyword"),
        dedupeOn: tg("proofDedupeOn"),
        dedupeOff: tg("proofDedupeOff"),
    };

    const extractVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[8].length === 11 ? match[8] : null;
    };

    const detectShortsVideo = (url: string) => {
        return /youtube\.com\/shorts\/|youtu\.be\/shorts\//.test(url);
    };

    const verifyParticipantSubscription = async (participant: Participant): Promise<boolean | null | "private"> => {
        if (!participant.channelId || !videoOwnerChannelId) return null;
        try {
            const res = await fetch("/api/youtube/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channelId: participant.channelId,
                    videoOwnerChannelId: videoOwnerChannelId,
                }),
            });
            const data = await res.json();
            return data.isSubscribed;
        } catch (e) {
            console.error("Verification failed", e);
            return null;
        }
    };

    const addParticipant = () => {
        if (!newParticipant.trim()) return;
        const name = newParticipant.trim().replace(/^@/, "");
        if (participants.some((p) => p.name === name)) {
            toast.warning(t.home.nameExists);
            return;
        }
        setParticipants([...participants, { name, comment: "" }]);
        setNewParticipant("");
        toast.success(tl("toasts.added", { name }));
    };

    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const handleBulkAdd = () => {
        if (!bulkInput.trim()) return;
        const names = bulkInput
            .split(/[\n,;]+/)
            .map((n) => n.trim().replace(/^@/, ""))
            .filter((n) => n.length > 0);

        const existingNames = new Set(participants.map((p) => p.name));
        const unique = [...participants];

        names.forEach((name) => {
            if (!existingNames.has(name)) {
                unique.push({ name, comment: "" });
                existingNames.add(name);
            }
        });

        setParticipants(unique);
        setBulkInput("");
        setShowManualEntry(false);
    };

    const handleManualParse = () => {
        if (!manualPaste.trim()) return;

        const lines = manualPaste.split("\n");
        const extracted: Participant[] = [];

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            let possibleName = trimmed.split(":")[0].trim();
            possibleName = possibleName.replace(/^@/, "");

            if (possibleName.length > 0 && possibleName.length <= 50) {
                extracted.push({
                    name: possibleName,
                    comment: trimmed.substring(possibleName.length + 1).trim() || "",
                });
            }
        });

        const existingNames = new Set(participants.map((p) => p.name));
        const unique = [...participants];

        extracted.forEach((p) => {
            if (!existingNames.has(p.name)) {
                unique.push(p);
                existingNames.add(p.name);
            }
        });

        setParticipants(unique);
        setManualPaste("");
        toast.success(tl("toasts.participantsAdded", { count: extracted.length }));
        goToConfigure();
    };

    const fetchComments = async () => {
        setError(null);
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            toast.error(tl("errors.invalidLink"));
            return;
        }

        setLoading(true);
        const steps = tl.raw("loadingSteps") as string[];
        let stepIdx = 0;
        setLoadingStep(steps[0]);
        const stepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            setLoadingStep(steps[stepIdx]);
        }, 5000);

        try {
            const response = await fetch("/api/youtube/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t.giveaway.fetchError);
            }

            const newParticipants = data.participants as Participant[];
            setVideoOwnerChannelId(data.videoOwnerChannelId);

            const existingNames = new Set(participants.map((p) => p.name));
            const unique = [...participants];

            newParticipants.forEach((p) => {
                if (!existingNames.has(p.name)) {
                    unique.push(p);
                    existingNames.add(p.name);
                }
            });

            setParticipants(unique);
            toast.success(tl("toasts.participantsAdded", { count: newParticipants.length }));
            goToConfigure();
        } catch (err) {
            const raw = err instanceof Error ? err.message : String(err);
            const friendly =
                raw.includes("API key") || raw.includes("quota")
                    ? tl("errors.quota")
                    : raw.includes("disabled") || raw.includes("403")
                      ? tl("errors.commentsDisabled")
                      : raw.includes("not found") || raw.includes("404")
                        ? tl("errors.notFound")
                        : tl("errors.generic");
            setError(friendly);
            toast.error(friendly);
        } finally {
            clearInterval(stepInterval);
            setLoading(false);
            setLoadingStep("");
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ["#FF0000", "#FFFFFF", "#282828", "#FF4444"];

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors,
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors,
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

    const startGiveaway = () => {
        if (eligibleParticipants.length < winnerCount + backupCount) {
            toast.warning(t.giveaway.notEnoughEligible || t.home.notEnoughPeople);
            return;
        }

        setIsRolling(true);
        setPhase("results");
        setDrawProof(null);

        const interval = setInterval(() => {
            const randomIndex = secureRandomInt(eligibleParticipants.length);
            setRollingParticipant(eligibleParticipants[randomIndex]);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);

            const shuffled = secureShuffle(eligibleParticipants);
            const selectedWinners = shuffled.slice(0, winnerCount);
            const selectedBackups = shuffled.slice(winnerCount, winnerCount + backupCount);

            setWinners(selectedWinners);
            setBackups(selectedBackups);
            setIsRolling(false);
            setDrawProof(
                buildDrawProof({
                    platform: "youtube",
                    title: giveawayName || t.giveaway.youtubeTitle,
                    total: filterStats.total,
                    eligible: filterStats.eligible,
                    keyword: keywordFilter,
                    countUserOnce,
                    winners: selectedWinners,
                    backups: selectedBackups,
                })
            );
            triggerConfetti();

            if (videoOwnerChannelId) {
                selectedWinners.forEach(async (winner, index) => {
                    if (winner.channelId) {
                        const isSubbed = await verifyParticipantSubscription(winner);
                        setWinners((prev) => {
                            const newWinners = [...prev];
                            if (newWinners[index] && newWinners[index].name === winner.name) {
                                newWinners[index] = { ...newWinners[index], isSubscribed: isSubbed };
                            }
                            return newWinners;
                        });
                    }
                });
            }
        }, 3000);
    };

    const resetGiveaway = () => {
        setWinners([]);
        setBackups([]);
        setDrawProof(null);
        setPhase("input");
        setIsRolling(false);
        scrollToTool();
    };

    const copyResults = () => {
        const text = `🎉 ${giveawayName || t.giveaway.youtubeTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. ${w.name} - "${w.comment}"`).join("\n")}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. ${b.name}`).join("\n")}` : ""}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(tl("toasts.copied"));
        setTimeout(() => setCopied(false), 2000);
    };

    const getShareText = () => {
        return `🎉 ${giveawayName || t.giveaway.youtubeTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. ${w.name}`).join("\n")}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. ${b.name}`).join("\n")}` : ""}\n\n${SITE_SHARE_SUFFIX}`;
    };

    const trustBadgeLabels = tl.raw("trustBadges") as string[];
    const metrics = tl.raw("metrics") as Array<{ value: string; label: string }>;
    const featuresData = tl.raw("features") as Array<{ title: string; desc: string }>;
    const howSteps = tl.raw("howSteps") as Array<{ title: string; desc: string }>;
    const faqItems = tl.raw("faq") as Array<{ q: string; a: string }>;

    const progressSteps = [
        { n: 1, label: tl("steps.paste") },
        { n: 2, label: tl("steps.load") },
        { n: 3, label: tl("steps.rules") },
        { n: 4, label: tl("steps.draw") },
    ];

    const stepIndex = phase === "input" ? 1 : phase === "configure" ? 3 : 4;

    return (
        <main className="yt-page relative min-h-screen bg-[#fafafa] dark:bg-[var(--background)] text-[var(--text-primary)] overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.12),transparent_70%)]" />
                <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
                <div className="absolute top-80 -right-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
            </div>

            <section ref={toolRef} className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32 lg:pb-24">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#FF0000] shadow-sm backdrop-blur dark:border-red-500/20 dark:bg-white/5">
                        <Youtube className="h-3.5 w-3.5" strokeWidth={2} />
                        {tl("badge")}
                    </div>

                    <h1 className="font-heading text-[2.25rem] leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-[3.5rem]">
                        {locale === "tr"
                            ? "YouTube yorum çekilişi"
                            : locale === "en"
                              ? "YouTube comment giveaway"
                              : `${tl("heroTitle")} ${tl("heroHighlight")}`}
                    </h1>

                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                        {tl("heroSubtitle")}
                    </p>
                </div>

                <nav aria-label="Giveaway steps" className="mx-auto mt-10 max-w-3xl">
                    <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                        {progressSteps.map((s, i) => {
                            const active = stepIndex >= s.n || (phase === "configure" && s.n <= 3) || (phase === "results" && s.n <= 4);
                            const current =
                                (phase === "input" && s.n === 1) ||
                                (phase === "configure" && s.n === 3) ||
                                (phase === "results" && s.n === 4);
                            return (
                                <li key={s.n} className="flex items-center gap-2 sm:gap-3">
                                    {i > 0 && <div className={`hidden h-px w-6 sm:block ${active ? "bg-[#FF0000]/40" : "bg-[var(--border-medium)]"}`} />}
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                                            current
                                                ? "bg-[#FF0000] text-white shadow-md"
                                                : active
                                                  ? "bg-red-50 text-[#FF0000] dark:bg-red-500/10"
                                                  : "bg-white text-[var(--text-muted)] ring-1 ring-[var(--border-light)] dark:bg-white/5"
                                        }`}
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px] sm:h-6 sm:w-6 sm:text-xs">
                                            {active && !current ? <Check className="h-3 w-3" strokeWidth={3} /> : s.n}
                                        </span>
                                        <span>{s.label}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                <div className="mx-auto mt-8 max-w-3xl">
                    <div className="overflow-hidden rounded-[20px] border border-[var(--border-light)] bg-white shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:border-white/10 dark:bg-[var(--card-bg)]">
                        {isRolling && (
                            <div className="flex flex-col items-center justify-center space-y-6 px-6 py-16">
                                <p className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">{tl("selecting")}</p>
                                <div className="text-4xl font-black tracking-tight text-[#FF0000] sm:text-5xl">{rollingParticipant?.name}</div>
                                <p className="max-w-sm truncate px-4 text-sm text-[var(--text-muted)]">{rollingParticipant?.comment}</p>
                                <Loader2 className="h-8 w-8 animate-spin text-[#FF0000]" />
                            </div>
                        )}

                        {!isRolling && phase === "results" && (
                            <div className="space-y-6 p-5 sm:p-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="text-center space-y-3">
                                    <div className={`mx-auto inline-flex rounded-2xl p-3 ${YT_PRIMARY} shadow-lg`}>
                                        <Trophy className="h-8 w-8 text-white" strokeWidth={1.75} />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                        {giveawayName || t.giveaway.youtubeTitle} {t.giveaway.results}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {winners.map((winner, i) => (
                                        <div
                                            key={`${winner.name}-${i}`}
                                            className={`rounded-2xl border border-red-200/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-red-500/20 ${YT_SOFT}`}
                                            style={{ animationDelay: `${i * 80}ms` }}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${YT_PRIMARY}`}>
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="text-lg font-bold">{winner.name}</p>
                                                        {winner.comment && (
                                                            <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text-secondary)]">&quot;{winner.comment}&quot;</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 self-start">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white/90 px-3 py-1 text-xs font-semibold text-[#FF0000] dark:border-red-500/30 dark:bg-white/5">
                                                        <Trophy className="h-3.5 w-3.5" /> {tl("winner")}
                                                    </span>
                                                    {videoOwnerChannelId && (
                                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-white px-3 py-1 text-xs font-bold shadow-sm dark:bg-white/5">
                                                            {winner.isSubscribed === true && (
                                                                <>
                                                                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                                                    <span className="text-green-600">{t.giveaway.subscribed}</span>
                                                                </>
                                                            )}
                                                            {winner.isSubscribed === false && (
                                                                <>
                                                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                                                    <span className="text-red-500">{t.giveaway.notSubscribed}</span>
                                                                </>
                                                            )}
                                                            {winner.isSubscribed === "private" && (
                                                                <>
                                                                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                                                    <span className="text-yellow-600">{t.giveaway.subscribedPrivate}</span>
                                                                </>
                                                            )}
                                                            {(winner.isSubscribed === undefined || winner.isSubscribed === null) && (
                                                                <>
                                                                    <Loader2 className="h-3 w-3 animate-spin text-[var(--text-muted)]" />
                                                                    <span className="text-[var(--text-muted)]">{t.giveaway.checkingSubscription}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {backups.length > 0 && (
                                    <div className="space-y-3 border-t border-[var(--border-light)] pt-4">
                                        <h3 className="flex items-center gap-2 font-semibold text-[var(--text-muted)]">
                                            <Users className="h-5 w-5" /> {t.giveaway.backups}
                                        </h3>
                                        {backups.map((backup, i) => (
                                            <div key={`${backup.name}-b-${i}`} className="rounded-xl bg-[var(--surface-2)] px-4 py-3">
                                                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                                    <span>
                                                        {i + 1}. {backup.name}
                                                    </span>
                                                    <span className="rounded bg-white/80 px-2 py-0.5 text-xs text-[var(--text-muted)] dark:bg-white/5">{tl("backup")}</span>
                                                </div>
                                                {backup.comment && <p className="mt-1 truncate pl-4 text-xs text-[var(--text-muted)]">&quot;{backup.comment}&quot;</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {drawProof && (
                                    <DrawProofPanel
                                        proof={drawProof}
                                        locale={locale}
                                        accentClass="text-[#FF0000]"
                                        buttonClass="bg-[#FF0000] hover:bg-[#cc0000]"
                                        labels={proofLabels}
                                        onToast={(msg) => toast.success(msg)}
                                    />
                                )}

                                <AdWrapper position="inline">
                                    <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                                </AdWrapper>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button onClick={copyResults} variant="secondary" className="min-w-[120px] flex-1 rounded-2xl">
                                        {copied ? t.giveaway.copied : t.giveaway.copyResults}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            downloadWinnerCard({
                                                giveawayName: giveawayName || t.giveaway.youtubeTitle,
                                                winners,
                                                backups,
                                                platform: "youtube",
                                            });
                                            toast.success(tl("toasts.cardDownloaded"));
                                        }}
                                        variant="secondary"
                                        className="min-w-[120px] flex-1 rounded-2xl border-red-200 text-[#FF0000] hover:bg-red-50"
                                    >
                                        <Download className="mr-1.5 h-4 w-4" /> {tl("pngDownload")}
                                    </Button>
                                    <Button
                                        onClick={() => setShowShareModal(true)}
                                        className={`min-w-[120px] flex-1 rounded-2xl text-white shadow-lg ${YT_PRIMARY}`}
                                    >
                                        <Share2 className="mr-2 h-4 w-4" /> {t.giveaway.shareResults}
                                    </Button>
                                    <Button onClick={resetGiveaway} className={`min-w-[120px] flex-1 rounded-2xl text-white ${YT_PRIMARY}`}>
                                        {t.giveaway.newGiveaway}
                                    </Button>
                                </div>

                                <ShareModal
                                    isOpen={showShareModal}
                                    onClose={() => setShowShareModal(false)}
                                    shareText={getShareText()}
                                    t={{
                                        shareResults: t.giveaway.copyLink,
                                        shareTitle: t.giveaway.shareTitle,
                                        shareDesc: t.giveaway.shareDesc,
                                        close: t.giveaway.shareCopied || t.giveaway.copied,
                                    }}
                                />
                            </div>
                        )}

                        {!isRolling && phase === "input" && (
                            <div className="p-5 sm:p-8">
                                <div className="mb-6 flex gap-2 rounded-2xl bg-[var(--surface-2)] p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setEntryMode("auto")}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            entryMode === "auto"
                                                ? "bg-white text-[var(--text-primary)] shadow-sm dark:bg-white/10"
                                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                        }`}
                                    >
                                        <Link2 className="h-4 w-4" /> {tl("automatic")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEntryMode("manual")}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            entryMode === "manual"
                                                ? "bg-white text-[var(--text-primary)] shadow-sm dark:bg-white/10"
                                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                        }`}
                                    >
                                        <ClipboardPaste className="h-4 w-4" /> {tl("manual")}
                                    </button>
                                </div>

                                {entryMode === "auto" ? (
                                    <div className="space-y-5">
                                        <div>
                                            <label htmlFor="yt-url" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                                                {tl("step1Url")}
                                            </label>
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-4 py-3.5 transition focus-within:border-[#FF0000] focus-within:ring-4 focus-within:ring-red-500/10">
                                                    <Youtube className="h-5 w-5 shrink-0 text-[#FF0000]" strokeWidth={1.75} />
                                                    <input
                                                        id="yt-url"
                                                        type="url"
                                                        inputMode="url"
                                                        autoComplete="url"
                                                        placeholder={tl("urlPlaceholder")}
                                                        value={videoLink}
                                                        onChange={(e) => setVideoLink(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && fetchComments()}
                                                        className="w-full bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
                                                        aria-describedby="yt-url-hint"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={fetchComments}
                                                    disabled={loading}
                                                    className={`group relative inline-flex min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-2xl px-7 text-base font-bold text-white shadow-[0_8px_24px_rgba(255,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${YT_PRIMARY}`}
                                                >
                                                    <span className="absolute inset-0 -translate-x-full bg-white/20 transition group-hover:translate-x-0" aria-hidden />
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="h-5 w-5 animate-spin" /> {tl("fetching")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-5 w-5" /> {tl("fetchCta")}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <p id="yt-url-hint" className="text-xs text-[var(--text-muted)]">
                                                    {tl("urlHint")}
                                                </p>
                                                {isShortsVideo && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-[#FF0000] dark:bg-red-500/15 dark:text-red-300">
                                                        <span className="text-lg">📹</span>
                                                        {tl("shortsDetected")}
                                                    </span>
                                                )}
                                            </div>
                                            {isShortsVideo && (
                                                <div className="mt-3 rounded-xl border border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-amber-50/30 p-3.5 dark:border-orange-500/20 dark:from-orange-500/5 dark:to-amber-500/5">
                                                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                                                        <span className="font-semibold text-orange-700 dark:text-orange-300">💡 Shorts da desteklenmektedir:</span> YouTube Shorts videolarındaki tüm yorumlardan da çekiliş yapabilirsiniz. Süreci aynı — linki yapıştır, katılımcıları getir, kazananları seç!
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {loading && (
                                            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 dark:border-red-500/20 dark:bg-red-500/10" role="status" aria-live="polite">
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#FF0000]" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#FF0000]">{loadingStep}</p>
                                                        <p className="text-xs text-red-500/80">{tl("loadingWait")}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-red-100 dark:bg-red-500/20">
                                                    <div className="h-full w-1/2 animate-pulse rounded-full bg-[#FF0000]" />
                                                </div>
                                            </div>
                                        )}

                                        {error && !loading && (
                                            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">
                                                <X className="mt-0.5 h-4 w-4 shrink-0" />
                                                <div>
                                                    <p>{error}</p>
                                                    <button type="button" onClick={() => setEntryMode("manual")} className="mt-2 font-semibold underline-offset-2 hover:underline">
                                                        {tl("switchManual")}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setDrawType("comments")}
                                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                                                    drawType === "comments"
                                                        ? "bg-red-100 text-[#FF0000] ring-1 ring-red-300 dark:bg-red-500/15"
                                                        : "bg-white text-[var(--text-secondary)] ring-1 ring-[var(--border-medium)] dark:bg-white/5"
                                                }`}
                                            >
                                                <MessageCircle className="h-4 w-4" /> {t.giveaway.comments}
                                            </button>
                                        </div>

                                        {participants.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={goToConfigure}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text-primary)] px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                                            >
                                                {tl("continueWith", { count: participants.length })} <ArrowRight className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label htmlFor="yt-manual" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                                            {tl("step1Manual")}
                                        </label>
                                        <textarea
                                            id="yt-manual"
                                            value={manualPaste}
                                            onChange={(e) => setManualPaste(e.target.value)}
                                            placeholder={t.giveaway.pasteComments}
                                            className="h-48 w-full resize-none rounded-2xl border border-dashed border-[var(--border-medium)] bg-[var(--surface-2)] p-4 outline-none transition focus:border-[#FF0000] focus:ring-4 focus:ring-red-500/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleManualParse}
                                            disabled={!manualPaste.trim()}
                                            className={`inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 ${YT_PRIMARY}`}
                                        >
                                            {t.giveaway.parse} <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isRolling && phase === "configure" && (
                            <div ref={configureRef} className="space-y-8 p-5 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#FF0000]">{tl("step3Subtitle")}</p>
                                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{tl("step3Title")}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPhase("input")}
                                        className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    >
                                        {tl("backToUrl")}
                                    </button>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold">{t.giveaway.giveawayName}</label>
                                            <input
                                                type="text"
                                                placeholder={t.giveaway.youtubeTitle}
                                                value={giveawayName}
                                                onChange={(e) => setGiveawayName(e.target.value)}
                                                className="w-full rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-4 py-3 outline-none transition focus:border-[#FF0000] focus:ring-4 focus:ring-red-500/10"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                                <label className="mb-3 block text-center text-sm font-semibold">{t.giveaway.winnerCount}</label>
                                                <div className="flex items-center justify-center gap-3">
                                                    <button type="button" aria-label="Decrease winners" onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-[#FF0000]">
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-10 text-center text-xl font-bold">{winnerCount}</span>
                                                    <button type="button" aria-label="Increase winners" onClick={() => setWinnerCount(winnerCount + 1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-[#FF0000]">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                                <label className="mb-3 block text-center text-sm font-semibold">{t.giveaway.backupCount}</label>
                                                <div className="flex items-center justify-center gap-3">
                                                    <button type="button" aria-label="Decrease backups" onClick={() => setBackupCount(Math.max(0, backupCount - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--text-secondary)] dark:bg-white/10">
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-10 text-center text-xl font-bold">{backupCount}</span>
                                                    <button type="button" aria-label="Increase backups" onClick={() => setBackupCount(backupCount + 1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--text-secondary)] dark:bg-white/10">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => setRequireSubscription(!requireSubscription)}
                                                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-left transition hover:border-red-200"
                                            >
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <UserCheck className="h-4 w-4 text-[#FF0000]" /> {t.giveaway.requireSubscription}
                                                </span>
                                                <span className={`relative h-7 w-12 rounded-full transition-colors ${requireSubscription ? "bg-[#FF0000]" : "bg-[var(--text-muted)]"}`}>
                                                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${requireSubscription ? "right-1" : "left-1"}`} />
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRequireNotification(!requireNotification)}
                                                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-left transition hover:border-red-200"
                                            >
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <Bell className="h-4 w-4 text-[#FF0000]" /> {t.giveaway.requireNotification}
                                                </span>
                                                <span className={`relative h-7 w-12 rounded-full transition-colors ${requireNotification ? "bg-[#FF0000]" : "bg-[var(--text-muted)]"}`}>
                                                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${requireNotification ? "right-1" : "left-1"}`} />
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCountUserOnce(!countUserOnce)}
                                                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-left transition hover:border-red-200"
                                            >
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <Filter className="h-4 w-4 text-[#FF0000]" /> {t.giveaway.countUserOnce}
                                                </span>
                                                <span className={`relative h-7 w-12 rounded-full transition-colors ${countUserOnce ? "bg-[#FF0000]" : "bg-[var(--text-muted)]"}`}>
                                                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? "right-1" : "left-1"}`} />
                                                </span>
                                            </button>
                                            <FilterRulesPanel
                                                keyword={keywordFilter}
                                                onKeywordChange={setKeywordFilter}
                                                total={filterStats.total}
                                                eligible={filterStats.eligible}
                                                eligibleList={eligibleParticipants}
                                                excludeOwner={excludeOwner}
                                                onExcludeOwnerChange={setExcludeOwner}
                                                showExcludeOwner={Boolean(videoOwnerChannelId)}
                                                accentClass="text-[#FF0000]"
                                                toggleOnClass="bg-[#FF0000]"
                                                inputFocusClass="focus:border-[#FF0000] focus:ring-red-500/10"
                                                labels={filterLabels}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-bold">
                                                {t.giveaway.participants}{" "}
                                                <span className="rounded-full bg-[#FF0000] px-2 py-0.5 text-xs text-white">{participants.length}</span>
                                            </h3>
                                            <div className="relative flex items-center gap-2" ref={dropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowManualEntry(!showManualEntry)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-[#FF0000] transition hover:bg-red-100 dark:bg-red-500/10"
                                                >
                                                    <Plus className="h-3.5 w-3.5" /> {tl("add")}
                                                    {showManualEntry ? <X className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                </button>
                                                {participants.length > 0 && (
                                                    <button type="button" onClick={() => setParticipants([])} className="text-xs font-medium text-[var(--text-muted)] hover:text-red-500">
                                                        {t.giveaway.clearAll}
                                                    </button>
                                                )}

                                                {showManualEntry && (
                                                    <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-[var(--border-light)] bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 dark:bg-[var(--card-bg)]">
                                                        <div className="space-y-3">
                                                            <div className="flex gap-2">
                                                                <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-2">
                                                                    <AtSign className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        placeholder={t.giveaway.channelUsername}
                                                                        value={newParticipant}
                                                                        onChange={(e) => setNewParticipant(e.target.value)}
                                                                        onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                                                                        className="w-full bg-transparent py-2 text-sm outline-none"
                                                                    />
                                                                </div>
                                                                <Button onClick={addParticipant} size="sm" className="h-9 w-9 rounded-xl bg-[#FF0000] p-0 hover:bg-[#e60000]">
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <textarea
                                                                placeholder={"User1\nUser2\nUser3"}
                                                                value={bulkInput}
                                                                onChange={(e) => setBulkInput(e.target.value)}
                                                                className="h-24 w-full resize-none rounded-xl border border-[var(--border-medium)] bg-[var(--surface-2)] p-3 text-sm outline-none"
                                                            />
                                                            <Button onClick={handleBulkAdd} variant="secondary" size="sm" className="w-full rounded-xl text-xs">
                                                                {t.giveaway.bulkAdd}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="custom-scrollbar min-h-[220px] max-h-[320px] flex-1 space-y-2 overflow-y-auto pr-1">
                                            {participants.length === 0 ? (
                                                <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center text-[var(--text-muted)]">
                                                    <Users className="h-10 w-10 text-red-200" />
                                                    <p className="text-sm font-semibold">{t.giveaway.noParticipantsYet}</p>
                                                    <p className="max-w-[200px] text-xs">{t.giveaway.youtubeNoParticipantsHint}</p>
                                                    <button type="button" onClick={() => setPhase("input")} className="rounded-xl bg-[#FF0000] px-4 py-2 text-xs font-bold text-white">
                                                        {t.giveaway.fetchFromVideo}
                                                    </button>
                                                </div>
                                            ) : (
                                                participants.map((p, i) => (
                                                    <div key={`${p.name}-${i}`} className="group flex items-start justify-between gap-2 rounded-xl border border-transparent bg-white p-3 shadow-sm transition hover:border-red-200 dark:bg-white/5">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">{p.name}</p>
                                                            {p.comment && <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">{p.comment}</p>}
                                                        </div>
                                                        <button type="button" aria-label={`Remove ${p.name}`} onClick={() => removeParticipant(i)} className="rounded-lg p-1 text-[var(--text-muted)] opacity-100 transition hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="sticky bottom-4 z-20 space-y-3 rounded-2xl border border-[var(--border-light)] bg-white/95 p-4 shadow-lg backdrop-blur dark:bg-[var(--card-bg)]/95">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#FF0000]">{tl("step4Label")}</p>
                                    <button
                                        type="button"
                                        onClick={startGiveaway}
                                        disabled={eligibleParticipants.length < winnerCount + backupCount}
                                        className={`inline-flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl px-6 text-lg font-bold text-white shadow-[0_10px_30px_rgba(255,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(255,0,0,0.45)] disabled:pointer-events-none disabled:opacity-50 ${YT_PRIMARY}`}
                                    >
                                        <Play className="h-5 w-5 fill-current" /> {t.giveaway.startGiveaway}
                                    </button>
                                    {eligibleParticipants.length < winnerCount + backupCount && (
                                        <p className="text-center text-sm font-medium text-red-500">{t.giveaway.notEnoughEligible || t.home.notEnoughPeople}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {phase === "input" && (
                    <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3">
                        {trustBadgeLabels.map((label, i) => {
                            const Icon = TRUST_ICONS[i] ?? BadgeCheck;
                            return (
                                <li
                                    key={label}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-sm dark:bg-white/5"
                                >
                                    <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
                                    <Icon className="hidden h-3.5 w-3.5 text-[#FF0000] sm:block" strokeWidth={2} />
                                    {label}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section className="relative z-10 border-y border-[var(--border-light)] bg-white/70 py-14 dark:bg-white/[0.02]">
                <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:gap-8 sm:px-6">
                    {metrics.map((m) => (
                        <Reveal key={m.label}>
                            <div className="text-center">
                                <p className="text-3xl font-black tracking-tight text-[#FF0000] sm:text-4xl">{m.value}</p>
                                <p className="mt-2 text-sm text-[var(--text-muted)]">{m.label}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
                <Reveal>
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-[2rem]">{tl("featuresTitle")}</h2>
                        <p className="mt-3 text-base text-[var(--text-secondary)]">{tl("featuresSubtitle")}</p>
                    </div>
                </Reveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featuresData.map((f, i) => {
                        const Icon = FEATURE_ICONS[i] ?? MessageCircle;
                        return (
                            <Reveal key={f.title}>
                                <article className="group h-full rounded-[18px] border border-[var(--border-light)] bg-gradient-to-b from-white to-[#fafafa] p-5 shadow-[0_4px_20px_rgba(17,24,39,0.04)] transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(17,24,39,0.08)] dark:from-[var(--card-bg)] dark:to-[var(--card-bg)] dark:border-white/10">
                                    <div className={`mb-4 inline-flex rounded-2xl p-3 text-white shadow-md ${YT_PRIMARY}`}>
                                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                                    </div>
                                    <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{f.desc}</p>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            <section className="relative z-10 border-t border-[var(--border-light)] bg-white py-16 dark:bg-white/[0.02] sm:py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <Reveal>
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-[2rem]">{tl("howTitle")}</h2>
                            <p className="mt-3 text-base text-[var(--text-secondary)]">{tl("howSubtitle")}</p>
                        </div>
                    </Reveal>
                    <ol className="relative space-y-0">
                        {howSteps.map((s, i) => (
                            <Reveal key={s.title} delay={i * 60}>
                                <li className="relative flex gap-4 pb-10 last:pb-0">
                                    {i < howSteps.length - 1 && (
                                        <div className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-gradient-to-b from-[#FF0000]/50 to-transparent" aria-hidden />
                                    )}
                                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${YT_PRIMARY}`}>
                                        {i + 1}
                                    </div>
                                    <div className="rounded-2xl border border-[var(--border-light)] bg-[#fafafa] p-4 pt-2 dark:bg-white/5 sm:flex-1">
                                        <h3 className="text-lg font-semibold">{s.title}</h3>
                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{s.desc}</p>
                                    </div>
                                </li>
                            </Reveal>
                        ))}
                    </ol>
                    <div className="mt-10 text-center">
                        <button
                            type="button"
                            onClick={scrollToTool}
                            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 ${YT_PRIMARY}`}
                        >
                            <Shuffle className="h-4 w-4" /> {tl("startCta")}
                        </button>
                    </div>
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
                <Reveal>
                    <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-[2rem]">{tl("faqTitle")}</h2>
                </Reveal>
                <div className="space-y-3">
                    {faqItems.map((item, i) => {
                        const open = openFaq === i;
                        return (
                            <Reveal key={item.q} delay={i * 40}>
                                <div className="overflow-hidden rounded-[18px] border border-[var(--border-light)] bg-white shadow-sm dark:bg-[var(--card-bg)] dark:border-white/10">
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                    >
                                        <span className="font-heading text-base font-semibold sm:text-lg">{item.q}</span>
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] transition ${open ? "rotate-180" : ""}`}>
                                            <ChevronUp className="h-4 w-4" />
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                        <div className="overflow-hidden">
                                            <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">{item.a}</p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            <div className="relative z-10 pb-12 text-center">
                <Button onClick={() => router.push("/")} variant="ghost" className="rounded-2xl text-[var(--text-muted)]">
                    <Home className="mr-2 h-4 w-4" /> {t.result.backToHome}
                </Button>
            </div>
        </main>
    );
}
