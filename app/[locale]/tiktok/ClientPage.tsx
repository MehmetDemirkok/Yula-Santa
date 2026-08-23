"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { localePath } from "@/lib/localePath";
import {
    MessageCircle,
    Plus,
    Minus,
    Users,
    AtSign,
    Play,
    Home,
    Trash2,
    Loader2,
    Trophy,
    X,
    ChevronDown,
    ChevronUp,
    Check,
    Shield,
    Filter,
    Download,
    Share2,
    Link2,
    ClipboardPaste,
    ArrowRight,
    BadgeCheck,
    Shuffle,
    UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ShareModal from "@/components/ShareModal";
import { useToast } from "@/lib/ToastContext";
import { downloadWinnerCard } from "@/lib/downloadWinnerCard";
import { secureShuffle, secureRandomInt } from "@/lib/random";
import { applyGiveawayFilters, extractOwnerFromSocialUrl } from "@/lib/giveawayFilters";
import { buildDrawProof, type DrawProof } from "@/lib/giveawayProof";
import { FilterRulesPanel } from "@/components/giveaway/FilterRulesPanel";
import { DrawProofPanel } from "@/components/giveaway/DrawProofPanel";
import { TikTokFetchStats } from "@/components/giveaway/TikTokFetchStats";
import { SITE_SHARE_SUFFIX } from "@/lib/constants";
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";
import { Reveal } from "@/components/Reveal";
import { PayTicketDialog } from "@/components/tiktok/PayTicketDialog";
import {
    applyManualImportPreview,
    COMMENTS_PER_FETCH,
    formatFetchPrice,
    isLikelyTikTokUrl,
    isValidEmail,
    parseManualImport,
    type ManualImportPreview,
    type TikTokErrorCode,
    type TikTokFetchMeta,
} from "@/lib/tiktok";

type Phase = "input" | "configure" | "results";
type EntryMode = "auto" | "manual";

interface Participant {
    name: string;
    comment: string;
    isFollowing?: boolean | "unknown" | "checking";
}

const TT_CTA = "bg-santa-red hover:bg-santa-red-hover";
const CREDIT_STORAGE_KEY = "ys_tiktok_credit";

const FEATURE_ICONS = [Link2, Filter, MessageCircle, Users, UserMinus, Shield, Download, BadgeCheck] as const;
const TRUST_ICONS = [Shield, ClipboardPaste, Filter, Users, BadgeCheck] as const;

const TikTokMark = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
        <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
    </svg>
);

function prefersReducedMotion() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function TikTokGiveaway() {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const tl = useTranslations("giveaway.landing.tiktok");
    const tg = useTranslations("giveaway");
    const { toast } = useToast();

    const [phase, setPhase] = useState<Phase>("input");
    const [entryMode, setEntryMode] = useState<EntryMode>("auto");
    const [manualPaste, setManualPaste] = useState("");
    const [postLink, setPostLink] = useState("");
    const [channelUsername, setChannelUsername] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [giveawayName, setGiveawayName] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(0);
    const [requireFollow, setRequireFollow] = useState(false);
    const [countUserOnce, setCountUserOnce] = useState(true);
    const [keywordFilter, setKeywordFilter] = useState("");
    const [excludeOwner, setExcludeOwner] = useState(true);
    const [ownerUsername, setOwnerUsername] = useState("");
    const [drawProof, setDrawProof] = useState<DrawProof | null>(null);

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
    const [fetchMeta, setFetchMeta] = useState<TikTokFetchMeta | null>(null);
    const [importPreview, setImportPreview] = useState<ManualImportPreview | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [payOpen, setPayOpen] = useState(false);
    const [payerEmail, setPayerEmail] = useState("");
    const [payError, setPayError] = useState<string | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [creditToken, setCreditToken] = useState<string | null>(null);
    const [creditNotice, setCreditNotice] = useState<{ reason: string; emailSent: boolean } | null>(null);

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
        const extracted = extractOwnerFromSocialUrl(postLink);
        if (extracted) {
            setOwnerUsername(extracted);
            if (!channelUsername) setChannelUsername(extracted);
        }
    }, [postLink, channelUsername]);

    const scrollToTool = () => {
        toolRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    };

    const goToConfigure = () => {
        setPhase("configure");
        requestAnimationFrame(() => {
            configureRef.current?.scrollIntoView({
                behavior: prefersReducedMotion() ? "auto" : "smooth",
                block: "start",
            });
        });
    };

    const { eligible: eligibleParticipants, stats: filterStats } = useMemo(
        () =>
            applyGiveawayFilters(participants, {
                countUserOnce,
                keyword: keywordFilter,
                excludeNames: excludeOwner && ownerUsername.trim() ? [ownerUsername] : [],
            }),
        [participants, countUserOnce, keywordFilter, excludeOwner, ownerUsername]
    );

    const ownerRemovedCount = Math.max(0, filterStats.afterDedupe - filterStats.afterExclude);

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
        const preview = parseManualImport(bulkInput, participants.map((p) => p.name));
        const added = applyManualImportPreview(preview);
        if (added.length === 0) {
            toast.warning(tl("toasts.noNewNames"));
            return;
        }
        setParticipants((prev) => [...prev, ...added]);
        setBulkInput("");
        setShowManualEntry(false);
        toast.success(tl("toasts.participantsAdded", { count: added.length }));
    };

    const handleManualParse = () => {
        if (!manualPaste.trim()) return;
        const preview = parseManualImport(manualPaste, participants.map((p) => p.name));
        setImportPreview(preview);
    };

    const confirmManualImport = () => {
        if (!importPreview) return;
        const added = applyManualImportPreview(importPreview);
        if (added.length === 0) {
            toast.warning(tl("toasts.noNewNames"));
            return;
        }
        setParticipants((prev) => [...prev, ...added]);
        setManualPaste("");
        setImportPreview(null);
        setFetchMeta(null);
        toast.success(tl("toasts.participantsAdded", { count: added.length }));
        goToConfigure();
    };

    const mapFetchError = (code: TikTokErrorCode): string => {
        if (code === "NO_APIFY_TOKEN" || code === "RATE_LIMIT") return tl("errors.quota");
        if (code === "SCRAPER_UNAVAILABLE" || code === "TIMEOUT") return tl("errors.unavailable");
        if (code === "EMPTY_RESULT") return tl("errors.empty");
        if (code === "INVALID_URL") return tl("errors.invalidLink");
        return tl("errors.generic");
    };

    const openPayFlow = () => {
        setError(null);
        setPayError(null);
        if (!postLink.trim()) {
            toast.warning(tl("errors.needLink"));
            return;
        }
        if (!isLikelyTikTokUrl(postLink)) {
            toast.error(tl("errors.invalidLink"));
            return;
        }
        setPayOpen(true);
    };

    const startCheckout = async () => {
        if (!isValidEmail(payerEmail)) {
            setPayError(tl("pay.invalidEmail"));
            return;
        }
        setCheckoutLoading(true);
        setPayError(null);
        try {
            const response = await fetch("/api/tiktok/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: payerEmail, postLink, locale }),
            });
            const data = (await response.json().catch(() => ({}))) as { url?: string; code?: string; error?: string };
            if (!response.ok) {
                setPayError(data.code === "PAYMENTS_UNAVAILABLE" ? tl("pay.paymentsDown") : tl("errors.generic"));
                return;
            }
            if (data.url) {
                window.location.assign(data.url);
                return;
            }
            setPayError(tl("pay.paymentsDown"));
        } catch {
            setPayError(tl("errors.generic"));
        } finally {
            setCheckoutLoading(false);
        }
    };

    const PAYMENT_PENDING_RETRY_MS = 2500;
    const PAYMENT_PENDING_MAX_ATTEMPTS = 6;

    const runEntitledFetch = async (opts: { orderId?: string; token?: string }, attempt = 0) => {
        setPayOpen(false);
        setError(null);
        setCreditNotice(null);
        setLoading(true);
        setFetchMeta(null);
        const steps = tl.raw("loadingSteps") as string[];
        let stepIdx = 0;
        setLoadingStep(steps[0]);
        const stepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            setLoadingStep(steps[stepIdx]);
        }, 5000);

        let retrying = false;
        try {
            const response = await fetch("/api/tiktok/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: opts.orderId,
                    creditToken: opts.token,
                }),
            });
            const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

            if (data.creditGranted) {
                const token = typeof data.creditToken === "string" ? data.creditToken : null;
                if (token) {
                    setCreditToken(token);
                    try {
                        localStorage.setItem(CREDIT_STORAGE_KEY, token);
                    } catch {
                        /* ignore */
                    }
                }
                const analysis = data.analysis as { reason?: string } | undefined;
                setCreditNotice({
                    reason: analysis?.reason || (typeof data.error === "string" ? data.error : tl("pay.creditBody")),
                    emailSent: Boolean(data.emailSent),
                });
                const message = typeof data.error === "string" ? data.error : tl("errors.unavailable");
                setError(message);
                toast.warning(tl("pay.creditTitle"));
                setEntryMode("manual");
                return;
            }

            if (!response.ok) {
                const code = (data.code as TikTokErrorCode | undefined) ?? "UNKNOWN";

                // PayTR confirms payment via an async server-to-server notification.
                // If we land back before it arrives, poll briefly instead of giving up.
                if (code === "PAYMENT_PENDING" && attempt < PAYMENT_PENDING_MAX_ATTEMPTS) {
                    retrying = true;
                    setLoadingStep(tl("pay.confirming"));
                    setTimeout(() => {
                        void runEntitledFetch(opts, attempt + 1);
                    }, PAYMENT_PENDING_RETRY_MS);
                    return;
                }

                const message = code === "PAYMENT_PENDING" ? tl("errors.paymentTimeout") : mapFetchError(code);
                setError(message);
                toast.error(message);
                setEntryMode("manual");
                return;
            }

            if (!Array.isArray(data.participants)) {
                throw new Error("Malformed response");
            }

            try {
                localStorage.removeItem(CREDIT_STORAGE_KEY);
            } catch {
                /* ignore */
            }
            setCreditToken(null);
            setParticipants(data.participants as Participant[]);
            if (data.meta) setFetchMeta(data.meta as TikTokFetchMeta);
            toast.success(tl("toasts.participantsAdded", { count: (data.participants as unknown[]).length }));
            goToConfigure();
        } catch {
            const friendly = tl("errors.generic");
            setError(friendly);
            toast.error(friendly);
            setEntryMode("manual");
        } finally {
            clearInterval(stepInterval);
            if (!retrying) {
                setLoading(false);
                setLoadingStep("");
            }
        }
    };

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CREDIT_STORAGE_KEY);
            if (stored) setCreditToken(stored);
        } catch {
            /* ignore */
        }
        const credit = searchParams.get("credit");
        const orderId = searchParams.get("oid");
        const paid = searchParams.get("paid");
        if (credit) {
            setCreditToken(credit);
            try {
                localStorage.setItem(CREDIT_STORAGE_KEY, credit);
            } catch {
                /* ignore */
            }
            setPayOpen(true);
        }
        if (paid === "1" && orderId) {
            void runEntitledFetch({ orderId });
        }
        if (paid === "0") {
            setPayOpen(true);
            setPayError(tl("pay.cancelled"));
        }
        if (credit || orderId || paid) {
            const url = new URL(window.location.href);
            url.searchParams.delete("credit");
            url.searchParams.delete("oid");
            url.searchParams.delete("paid");
            window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        }
        // One-shot return-from-checkout / credit-link bootstrap.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkFollowerStatus = async (winnersToCheck: Participant[], backupsToCheck: Participant[]) => {
        try {
            const allUsernames = [...winnersToCheck, ...backupsToCheck].map((p) => p.name);
            const response = await fetch("/api/tiktok/followers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channelUsername: channelUsername.replace(/^@/, ""),
                    usernames: allUsernames,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const results = data.results as Record<string, boolean | "unknown">;
                setWinners((prev) => prev.map((w) => ({ ...w, isFollowing: results[w.name] ?? "unknown" })));
                setBackups((prev) => prev.map((b) => ({ ...b, isFollowing: results[b.name] ?? "unknown" })));
            } else {
                setWinners((prev) => prev.map((w) => ({ ...w, isFollowing: "unknown" as const })));
                setBackups((prev) => prev.map((b) => ({ ...b, isFollowing: "unknown" as const })));
            }
        } catch {
            setWinners((prev) => prev.map((w) => ({ ...w, isFollowing: "unknown" as const })));
            setBackups((prev) => prev.map((b) => ({ ...b, isFollowing: "unknown" as const })));
        }
    };

    const triggerConfetti = () => {
        if (prefersReducedMotion()) return;
        const duration = 2400;
        const end = Date.now() + duration;
        const colors = ["#B61722", "#E09600", "#FFFFFF"];

        (function frame() {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

    const finishDraw = (pool: Participant[]) => {
        const shuffled = secureShuffle(pool);
        const selectedWinners = shuffled.slice(0, winnerCount).map((w) => ({
            ...w,
            isFollowing: requireFollow && channelUsername ? ("checking" as const) : ("unknown" as const),
        }));
        const selectedBackups = shuffled.slice(winnerCount, winnerCount + backupCount).map((b) => ({
            ...b,
            isFollowing: requireFollow && channelUsername ? ("checking" as const) : ("unknown" as const),
        }));

        setWinners(selectedWinners);
        setBackups(selectedBackups);
        setIsRolling(false);
        setDrawProof(
            buildDrawProof({
                platform: "tiktok",
                title: giveawayName || t.giveaway.tiktokTitle,
                total: filterStats.total,
                eligible: filterStats.eligible,
                keyword: keywordFilter,
                countUserOnce,
                winners: selectedWinners,
                backups: selectedBackups,
            })
        );
        triggerConfetti();

        if (requireFollow && channelUsername) {
            checkFollowerStatus(selectedWinners, selectedBackups);
        }
    };

    const startGiveaway = () => {
        if (eligibleParticipants.length < winnerCount + backupCount) {
            toast.warning(tg("notEnoughEligible") || t.home.notEnoughPeople);
            return;
        }

        setDrawProof(null);
        setPhase("results");

        if (prefersReducedMotion()) {
            finishDraw(eligibleParticipants);
            return;
        }

        setIsRolling(true);
        const interval = setInterval(() => {
            const randomIndex = secureRandomInt(eligibleParticipants.length);
            setRollingParticipant(eligibleParticipants[randomIndex]);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            finishDraw(eligibleParticipants);
        }, 2200);
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
        const text = `🎉 ${giveawayName || t.giveaway.tiktokTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w.name} - "${w.comment}"`).join("\n")}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b.name}`).join("\n")}` : ""}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(tl("toasts.copied"));
        setTimeout(() => setCopied(false), 2000);
    };

    const getShareText = () => {
        return `🎉 ${giveawayName || t.giveaway.tiktokTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w.name}`).join("\n")}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b.name}`).join("\n")}` : ""}\n\n${SITE_SHARE_SUFFIX}`;
    };

    const trustBadgeLabels = tl.raw("trustBadges") as string[];
    const metrics = tl.raw("metrics") as Array<{ value: string; label: string }>;
    const featuresData = tl.raw("features") as Array<{ title: string; desc: string }>;
    const howSteps = tl.raw("howSteps") as Array<{ title: string; desc: string }>;
    const faqItems = tl.raw("faq") as Array<{ q: string; a: string }>;
    const priceLabel = formatFetchPrice(locale);

    const progressSteps = [
        { n: 1, label: tl("steps.paste") },
        { n: 2, label: tl("steps.load") },
        { n: 3, label: tl("steps.rules") },
        { n: 4, label: tl("steps.draw") },
    ];

    const currentStep =
        phase === "results"
            ? 4
            : phase === "configure"
              ? 3
              : participants.length > 0 || loading
                ? 2
                : 1;

    const canDraw = eligibleParticipants.length >= winnerCount + backupCount;

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-[#fafafa] text-[var(--text-primary)] dark:bg-[var(--background)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(182,23,34,0.08),transparent_70%)]" />
            </div>

            <section ref={toolRef} className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32 lg:pb-20">
                <div className="mx-auto max-w-xl text-center">
                    <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)]">
                        <TikTokMark className="h-3.5 w-3.5 text-[var(--text-primary)]" />
                        <span className="tracking-tight">{tl("heroTitle")}</span>
                    </p>

                    <h1 className="font-heading text-[2.35rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[3.15rem]">
                        {tl("heroHighlight")}
                    </h1>
                    <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[var(--text-secondary)] sm:text-base">
                        {tl("heroSubtitle")}
                    </p>
                </div>

                <nav aria-label={tl("howTitle")} className="mx-auto mt-10 max-w-lg px-2">
                    <ol className="flex">
                        {progressSteps.map((s, i) => {
                            const state =
                                s.n < currentStep ? "done" : s.n === currentStep ? "current" : "upcoming";
                            return (
                                <li key={s.n} className="relative flex flex-1 flex-col items-center">
                                    {i > 0 && (
                                        <span
                                            aria-hidden
                                            className={`absolute right-1/2 left-0 top-[13px] h-px ${
                                                state !== "upcoming" ? "bg-santa-red" : "bg-[var(--border-medium)]"
                                            }`}
                                        />
                                    )}
                                    {i < progressSteps.length - 1 && (
                                        <span
                                            aria-hidden
                                            className={`absolute left-1/2 right-0 top-[13px] h-px ${
                                                state === "done" ? "bg-santa-red" : "bg-[var(--border-medium)]"
                                            }`}
                                        />
                                    )}
                                    <span
                                        className={`relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold ${
                                            state === "current"
                                                ? "bg-santa-red text-white shadow-[0_0_0_4px_rgba(182,23,34,0.12)]"
                                                : state === "done"
                                                  ? "bg-santa-red text-white"
                                                  : "border border-[var(--border-medium)] bg-white text-[var(--text-muted)] dark:bg-[var(--card-bg)]"
                                        }`}
                                        aria-current={state === "current" ? "step" : undefined}
                                    >
                                        {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.n}
                                    </span>
                                    <span
                                        className={`mt-2 text-[11px] font-semibold tracking-tight sm:text-xs ${
                                            state === "upcoming"
                                                ? "text-[var(--text-muted)]"
                                                : "text-[var(--text-primary)]"
                                        }`}
                                    >
                                        {s.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                <div className="mx-auto mt-8 max-w-2xl">
                    <div className="overflow-hidden rounded-[20px] border border-[var(--border-light)] bg-white shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:border-white/10 dark:bg-[var(--card-bg)]">
                        <div className="h-[3px] w-full bg-santa-red" aria-hidden />

                        {isRolling && (
                            <div className="flex flex-col items-center justify-center space-y-5 px-6 py-16" role="status" aria-live="polite">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                    {tl("selecting")}
                                </p>
                                <p className="text-4xl font-black tracking-tight text-santa-red sm:text-5xl">
                                    @{rollingParticipant?.name}
                                </p>
                                <p className="max-w-sm truncate px-4 text-sm text-[var(--text-muted)]">
                                    {rollingParticipant?.comment}
                                </p>
                                <Loader2 className="h-8 w-8 animate-spin text-santa-red" />
                            </div>
                        )}

                        {!isRolling && phase === "results" && (
                            <div className="space-y-6 p-5 sm:p-8">
                                <div className="text-center space-y-3">
                                    <div className={`mx-auto inline-flex rounded-2xl p-3 text-white ${TT_CTA}`}>
                                        <Trophy className="h-8 w-8" strokeWidth={1.75} />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                        {giveawayName || t.giveaway.tiktokTitle} {t.giveaway.results}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {winners.map((winner, i) => (
                                        <div
                                            key={`${winner.name}-${i}`}
                                            className="rounded-2xl border border-santa-red/15 bg-santa-red/[0.04] p-4"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${TT_CTA}`}>
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="text-lg font-bold">@{winner.name}</p>
                                                        {winner.comment && (
                                                            <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text-secondary)]">
                                                                &quot;{winner.comment}&quot;
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 self-start">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-santa-red/25 bg-white px-3 py-1 text-xs font-semibold text-santa-red dark:bg-white/5">
                                                        <Trophy className="h-3.5 w-3.5" /> {tl("winner")}
                                                    </span>
                                                    {requireFollow && (
                                                        <FollowBadge status={winner.isFollowing} t={t} />
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
                                                        {i + 1}. @{backup.name}
                                                    </span>
                                                    <span className="rounded bg-white/80 px-2 py-0.5 text-xs text-[var(--text-muted)] dark:bg-white/5">
                                                        {tl("backup")}
                                                    </span>
                                                </div>
                                                {backup.comment && (
                                                    <p className="mt-1 truncate pl-4 text-xs text-[var(--text-muted)]">
                                                        &quot;{backup.comment}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {drawProof && (
                                    <DrawProofPanel
                                        proof={drawProof}
                                        locale={locale}
                                        accentClass="text-santa-red"
                                        buttonClass="bg-santa-red hover:bg-santa-red-hover"
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
                                                giveawayName: giveawayName || t.giveaway.tiktokTitle,
                                                winners,
                                                backups,
                                                platform: "tiktok",
                                            });
                                            toast.success(tl("toasts.cardDownloaded"));
                                        }}
                                        variant="secondary"
                                        className="min-w-[120px] flex-1 rounded-2xl text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                                    >
                                        <Download className="mr-1.5 h-4 w-4" /> {tl("pngDownload")}
                                    </Button>
                                    <Button
                                        onClick={() => setShowShareModal(true)}
                                        className={`min-w-[120px] flex-1 rounded-2xl text-white ${TT_CTA}`}
                                    >
                                        <Share2 className="mr-2 h-4 w-4" /> {t.giveaway.shareResults}
                                    </Button>
                                    <Button onClick={resetGiveaway} className={`min-w-[120px] flex-1 rounded-2xl text-white ${TT_CTA}`}>
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
                            <div className="p-5 sm:p-7">
                                <div className="mb-5 flex gap-1 rounded-2xl bg-[var(--surface-2)] p-1">
                                    <button
                                        type="button"
                                        onClick={() => setEntryMode("auto")}
                                        className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
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
                                        className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
                                            entryMode === "manual"
                                                ? "bg-white text-[var(--text-primary)] shadow-sm dark:bg-white/10"
                                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                        }`}
                                    >
                                        <ClipboardPaste className="h-4 w-4" /> {tl("manual")}
                                    </button>
                                </div>

                                {entryMode === "auto" ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="tt-url" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                                                {tl("step1Url")}
                                            </label>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-4 py-3.5 transition focus-within:border-santa-red focus-within:ring-4 focus-within:ring-santa-red/10">
                                                    <TikTokMark className="h-5 w-5 shrink-0 text-[var(--text-primary)]" />
                                                    <input
                                                        id="tt-url"
                                                        type="url"
                                                        inputMode="url"
                                                        autoComplete="url"
                                                        placeholder={tl("urlPlaceholder")}
                                                        value={postLink}
                                                        onChange={(e) => setPostLink(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && openPayFlow()}
                                                        className="w-full bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
                                                        aria-describedby="tt-url-hint"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={openPayFlow}
                                                    disabled={loading}
                                                    className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-6 text-base font-bold text-white shadow-[0_4px_16px_rgba(182,23,34,0.22)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-santa-red focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${TT_CTA}`}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="h-5 w-5 animate-spin" /> {tl("fetching")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowRight className="h-5 w-5" /> {tl("fetchCta")}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p id="tt-url-hint" className="mt-2 text-xs text-[var(--text-muted)]">
                                                {tl("pay.feeHint", { price: priceLabel })}
                                            </p>
                                        </div>

                                        {creditNotice && !loading && (
                                            <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-4" role="status">
                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                                    {tl("pay.creditTitle")}
                                                </p>
                                                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{creditNotice.reason}</p>
                                                <p className="mt-2 text-xs text-[var(--text-muted)]">
                                                    {creditNotice.emailSent ? tl("pay.creditEmail") : tl("pay.creditSaved")}
                                                </p>
                                            </div>
                                        )}

                                        {loading && (
                                            <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4" role="status" aria-live="polite">
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-santa-red" />
                                                    <div>
                                                        <p className="text-sm font-semibold">{loadingStep}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{tl("loadingWait")}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                                                    <div className="h-full w-1/2 animate-pulse rounded-full bg-santa-red" />
                                                </div>
                                            </div>
                                        )}

                                        {error && !loading && (
                                            <div
                                                className="rounded-2xl border border-santa-red/30 bg-santa-red/8 p-4 text-sm"
                                                role="alert"
                                            >
                                                <p className="font-medium text-[var(--text-primary)]">{error}</p>
                                                <p className="mt-1 text-[var(--text-secondary)]">{tl("autoUnavailable")}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setEntryMode("manual")}
                                                    className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-santa-red underline-offset-2 hover:underline"
                                                >
                                                    {tl("switchManual")}
                                                </button>
                                            </div>
                                        )}

                                        {participants.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={goToConfigure}
                                                className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
                                            >
                                                {tl("continueWith", { count: participants.length })} <ArrowRight className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label htmlFor="tt-manual" className="block text-sm font-semibold text-[var(--text-secondary)]">
                                            {tl("step1Manual")}
                                        </label>
                                        <textarea
                                            id="tt-manual"
                                            value={manualPaste}
                                            onChange={(e) => {
                                                setManualPaste(e.target.value);
                                                setImportPreview(null);
                                            }}
                                            placeholder={`${t.giveaway.pasteComments}\n\n@user: yorum\nusername,comment`}
                                            className="h-44 w-full resize-none rounded-2xl border border-dashed border-[var(--border-medium)] bg-[var(--surface-2)] p-4 outline-none transition focus:border-santa-red focus:ring-4 focus:ring-santa-red/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleManualParse}
                                            disabled={!manualPaste.trim()}
                                            className={`inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold text-white disabled:opacity-50 ${TT_CTA}`}
                                        >
                                            {tl("previewImport")}
                                        </button>

                                        {importPreview && (
                                            <div className="space-y-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                                <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                                                    {[
                                                        ["Valid", importPreview.validCount],
                                                        ["Duplicate", importPreview.duplicateCount],
                                                        ["Invalid", importPreview.invalidCount],
                                                        ["Empty", importPreview.skippedEmpty],
                                                    ].map(([label, value]) => (
                                                        <div key={String(label)} className="rounded-xl bg-white/70 p-2 dark:bg-white/5">
                                                            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{label}</p>
                                                            <p className="font-black">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="max-h-36 space-y-1 overflow-y-auto text-left">
                                                    {importPreview.rows.slice(0, 40).map((row) => (
                                                        <div
                                                            key={`${row.sourceLine}-${row.name}`}
                                                            className={`rounded-lg px-2 py-1.5 text-xs ${row.duplicate ? "opacity-50 line-through" : "bg-white/60 dark:bg-white/5"}`}
                                                        >
                                                            <span className="font-bold">@{row.name}</span>
                                                            <span className="text-[var(--text-muted)]"> — {row.comment.slice(0, 80)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={confirmManualImport}
                                                    disabled={importPreview.validCount === 0}
                                                    className={`inline-flex w-full min-h-[48px] items-center justify-center rounded-2xl text-sm font-bold text-white disabled:opacity-50 ${TT_CTA}`}
                                                >
                                                    {tl("importPeople", { count: importPreview.validCount })}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!isRolling && phase === "configure" && (
                            <div ref={configureRef} className="space-y-6 p-5 sm:p-7">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-santa-red">{tl("step3Subtitle")}</p>
                                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{tl("step3Title")}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPhase("input")}
                                        className="min-h-[44px] text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    >
                                        {tl("backToUrl")}
                                    </button>
                                </div>

                                {fetchMeta && <TikTokFetchStats fetchMeta={fetchMeta} locale={locale} />}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">{t.giveaway.giveawayName}</label>
                                    <input
                                        type="text"
                                        placeholder={t.giveaway.tiktokTitle}
                                        value={giveawayName}
                                        onChange={(e) => setGiveawayName(e.target.value)}
                                        className="w-full rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-4 py-3 outline-none transition focus:border-santa-red focus:ring-4 focus:ring-santa-red/10"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                        <label className="mb-3 block text-center text-sm font-semibold">{t.giveaway.winnerCount}</label>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                aria-label="Decrease winners"
                                                onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))}
                                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-santa-red/12 text-santa-red"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-10 text-center text-xl font-bold">{winnerCount}</span>
                                            <button
                                                type="button"
                                                aria-label="Increase winners"
                                                onClick={() => setWinnerCount(winnerCount + 1)}
                                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-santa-red/12 text-santa-red"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                        <label className="mb-3 block text-center text-sm font-semibold">{t.giveaway.backupCount}</label>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                aria-label="Decrease backups"
                                                onClick={() => setBackupCount(Math.max(0, backupCount - 1))}
                                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--text-secondary)] dark:bg-white/10"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-10 text-center text-xl font-bold">{backupCount}</span>
                                            <button
                                                type="button"
                                                aria-label="Increase backups"
                                                onClick={() => setBackupCount(backupCount + 1)}
                                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--text-secondary)] dark:bg-white/10"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCountUserOnce(!countUserOnce)}
                                    className="flex w-full min-h-[48px] items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-left"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <Filter className="h-4 w-4 text-santa-red" /> {t.giveaway.countUserOnce}
                                    </span>
                                    <span className={`relative h-7 w-12 rounded-full transition-colors ${countUserOnce ? "bg-santa-red" : "bg-[var(--text-muted)]"}`}>
                                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? "right-1" : "left-1"}`} />
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    aria-expanded={showAdvanced}
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex w-full min-h-[44px] items-center justify-between text-sm font-semibold text-[var(--text-secondary)]"
                                >
                                    {showAdvanced ? tl("hideRules") : tl("moreRules")}
                                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>

                                {showAdvanced && (
                                    <div className="space-y-3">
                                        <FilterRulesPanel
                                            keyword={keywordFilter}
                                            onKeywordChange={setKeywordFilter}
                                            total={filterStats.total}
                                            eligible={filterStats.eligible}
                                            eligibleList={eligibleParticipants}
                                            excludeOwner={excludeOwner}
                                            onExcludeOwnerChange={setExcludeOwner}
                                            ownerUsername={ownerUsername}
                                            onOwnerUsernameChange={setOwnerUsername}
                                            accentClass="text-santa-red"
                                            toggleOnClass="bg-santa-red"
                                            inputFocusClass="focus:border-santa-red focus:ring-santa-red/10"
                                            labels={filterLabels}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setRequireFollow(!requireFollow)}
                                            className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-left"
                                        >
                                            <span className="flex items-center gap-2 text-sm font-medium">
                                                <Users className="h-4 w-4 text-santa-red" /> {t.giveaway.requireFollow}
                                            </span>
                                            <span className={`relative h-7 w-12 rounded-full transition-colors ${requireFollow ? "bg-santa-red" : "bg-[var(--text-muted)]"}`}>
                                                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${requireFollow ? "right-1" : "left-1"}`} />
                                            </span>
                                        </button>
                                        {requireFollow && (
                                            <div className="space-y-1.5">
                                                <p className="text-xs text-[var(--text-muted)]">{tl("followHint")}</p>
                                                <div className="flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-white px-3 dark:bg-white/5">
                                                    <AtSign className="h-4 w-4 text-[var(--text-muted)]" />
                                                    <input
                                                        type="text"
                                                        placeholder="tiktok_username"
                                                        value={channelUsername}
                                                        onChange={(e) => setChannelUsername(e.target.value.replace(/^@/, ""))}
                                                        className="flex-1 bg-transparent py-3 text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <TikTokFetchStats
                                            filterStats={filterStats}
                                            ownerRemoved={ownerRemovedCount}
                                            locale={locale}
                                        />
                                    </div>
                                )}

                                <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold">
                                            {t.giveaway.participants}{" "}
                                            <span className="rounded-full bg-santa-red px-2 py-0.5 text-xs text-white">{participants.length}</span>
                                        </h3>
                                        <div className="relative flex items-center gap-2" ref={dropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setShowManualEntry(!showManualEntry)}
                                                className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-santa-red/10 px-3 py-1.5 text-xs font-bold text-santa-red"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> {tl("add")}
                                            </button>
                                            {participants.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setParticipants([])}
                                                    className="text-xs font-medium text-[var(--text-muted)] hover:text-santa-red"
                                                >
                                                    {t.giveaway.clearAll}
                                                </button>
                                            )}
                                            {showManualEntry && (
                                                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[var(--border-light)] bg-white p-4 shadow-xl dark:bg-[var(--card-bg)]">
                                                    <div className="space-y-3">
                                                        <div className="flex gap-2">
                                                            <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-2">
                                                                <AtSign className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    placeholder="Username"
                                                                    value={newParticipant}
                                                                    onChange={(e) => setNewParticipant(e.target.value)}
                                                                    onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                                                                    className="w-full bg-transparent py-2 text-sm outline-none"
                                                                />
                                                            </div>
                                                            <Button onClick={addParticipant} size="sm" className={`h-9 w-9 rounded-xl p-0 ${TT_CTA}`}>
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <textarea
                                                            placeholder={"User1\nUser2"}
                                                            value={bulkInput}
                                                            onChange={(e) => setBulkInput(e.target.value)}
                                                            className="h-20 w-full resize-none rounded-xl border border-[var(--border-medium)] bg-[var(--surface-2)] p-3 text-sm outline-none"
                                                        />
                                                        <Button onClick={handleBulkAdd} variant="secondary" size="sm" className="w-full rounded-xl text-xs">
                                                            {t.giveaway.bulkAdd}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto">
                                        {participants.length === 0 ? (
                                            <p className="py-8 text-center text-sm text-[var(--text-muted)]">{t.giveaway.noParticipantsYet}</p>
                                        ) : (
                                            participants.slice(0, 40).map((p, i) => (
                                                <div key={`${p.name}-${i}`} className="flex items-start justify-between gap-2 rounded-xl bg-white p-3 dark:bg-white/5">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">@{p.name}</p>
                                                        {p.comment && <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">{p.comment}</p>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        aria-label={`Remove ${p.name}`}
                                                        onClick={() => removeParticipant(i)}
                                                        className="rounded-lg p-1 text-[var(--text-muted)] hover:text-santa-red"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                        {participants.length > 40 && (
                                            <p className="text-center text-xs text-[var(--text-muted)]">+{participants.length - 40}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="sticky bottom-4 z-20 space-y-2 rounded-2xl border border-[var(--border-light)] bg-white/95 p-4 shadow-lg backdrop-blur dark:bg-[var(--card-bg)]/95">
                                    <p className="text-center text-sm font-medium text-[var(--text-secondary)]">
                                        {tl("eligibleCta", { count: filterStats.eligible })}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={startGiveaway}
                                        disabled={!canDraw}
                                        className={`inline-flex w-full min-h-[56px] items-center justify-center gap-2 rounded-xl px-6 text-lg font-bold text-white shadow-[0_8px_24px_rgba(182,23,34,0.22)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 ${TT_CTA}`}
                                    >
                                        <Play className="h-5 w-5 fill-current" /> {t.giveaway.startGiveaway}
                                    </button>
                                    {!canDraw && (
                                        <p className="text-center text-sm font-medium text-santa-red">
                                            {tg("notEnoughEligible") || t.home.notEnoughPeople}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {phase === "input" && (
                    <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
                        {trustBadgeLabels.map((label, i) => {
                            const Icon = TRUST_ICONS[i] ?? BadgeCheck;
                            return (
                                <li
                                    key={label}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] dark:bg-white/5"
                                >
                                    <Icon className="h-3.5 w-3.5 text-santa-red" strokeWidth={2} />
                                    {label}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section className="relative z-10 border-y border-[var(--border-light)] bg-white/80 py-12 dark:bg-white/[0.02]">
                <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
                    {metrics.map((m) => (
                        <Reveal key={m.label}>
                            <div className="text-center">
                                <p className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">{m.value}</p>
                                <p className="mt-2 text-sm text-[var(--text-muted)]">{m.label}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6">
                <Reveal>
                    <div className="mx-auto mb-10 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-[2rem]">{tl("featuresTitle")}</h2>
                        <p className="mt-3 text-base text-[var(--text-secondary)]">{tl("featuresSubtitle")}</p>
                    </div>
                </Reveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featuresData.map((f, i) => {
                        const Icon = FEATURE_ICONS[i] ?? MessageCircle;
                        return (
                            <Reveal key={f.title}>
                                <article className="h-full rounded-[18px] border border-[var(--border-light)] bg-white p-5 dark:bg-[var(--card-bg)] dark:border-white/10">
                                    <div className="mb-4 inline-flex rounded-xl bg-[var(--navy)] p-3 text-white">
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

            <section className="relative z-10 border-t border-[var(--border-light)] bg-white py-16 dark:bg-white/[0.02]">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <Reveal>
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-[2rem]">{tl("howTitle")}</h2>
                            <p className="mt-3 text-base text-[var(--text-secondary)]">{tl("howSubtitle")}</p>
                        </div>
                    </Reveal>
                    <ol>
                        {howSteps.map((s, i) => (
                            <Reveal key={s.title} delay={i * 50}>
                                <li className="relative flex gap-4 pb-8 last:pb-0">
                                    {i < howSteps.length - 1 && (
                                        <div className="absolute left-[19px] top-10 h-[calc(100%-2rem)] w-px bg-santa-red/30" aria-hidden />
                                    )}
                                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${TT_CTA}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 rounded-2xl border border-[var(--border-light)] bg-[#f4f6f8] p-4 dark:bg-white/5">
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
                            className={`inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white ${TT_CTA}`}
                        >
                            <Shuffle className="h-4 w-4" /> {tl("startCta")}
                        </button>
                    </div>
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6">
                <Reveal>
                    <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-[2rem]">{tl("faqTitle")}</h2>
                </Reveal>
                <div className="space-y-3">
                    {faqItems.map((item, i) => {
                        const open = openFaq === i;
                        return (
                            <Reveal key={item.q} delay={i * 40}>
                                <div className="overflow-hidden rounded-[18px] border border-[var(--border-light)] bg-white dark:bg-[var(--card-bg)] dark:border-white/10">
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        className="flex w-full min-h-[52px] items-center justify-between gap-4 px-5 py-4 text-left"
                                    >
                                        <span className="font-heading text-base font-semibold sm:text-lg">{item.q}</span>
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] transition ${open ? "rotate-180" : ""}`}>
                                            <ChevronUp className="h-4 w-4" />
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
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

            <PayTicketDialog
                open={payOpen}
                onClose={() => setPayOpen(false)}
                priceLabel={priceLabel}
                email={payerEmail}
                onEmailChange={setPayerEmail}
                onPay={() => void startCheckout()}
                onUseCredit={creditToken ? () => void runEntitledFetch({ token: creditToken }) : undefined}
                hasCredit={Boolean(creditToken)}
                paying={checkoutLoading || loading}
                error={payError}
                onManual={() => {
                    setPayOpen(false);
                    setEntryMode("manual");
                }}
                salesContractHref={localePath(locale, "/mesafeli-satis-sozlesmesi")}
                labels={{
                    title: tl("pay.title"),
                    subtitle: tl("pay.subtitle"),
                    emailLabel: tl("pay.emailLabel"),
                    emailPlaceholder: tl("pay.emailPlaceholder"),
                    emailHint: tl("pay.emailHint"),
                    cta: tl("pay.cta"),
                    processing: tl("pay.processing"),
                    noMembership: tl("pay.noMembership"),
                    serviceName: tl("pay.serviceName"),
                    cap: tl("pay.cap", { count: COMMENTS_PER_FETCH }),
                    feeLine: tl("pay.feeLine"),
                    noRefund: tl("pay.noRefund"),
                    useCredit: tl("pay.useCredit"),
                    switchManual: tl("switchManual"),
                    salesContractLink: tl("pay.salesContractLink"),
                }}
            />
        </main>
    );
}

function FollowBadge({
    status,
    t,
}: {
    status?: boolean | "unknown" | "checking";
    t: { giveaway: Record<string, string> };
}) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-white px-3 py-1 text-xs font-semibold dark:bg-white/5">
            {status === "checking" && (
                <>
                    <Loader2 className="h-3 w-3 animate-spin text-[var(--text-muted)]" />
                    <span className="text-[var(--text-muted)]">{t.giveaway.checkingFollow}</span>
                </>
            )}
            {status === true && (
                <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600">{t.giveaway.following}</span>
                </>
            )}
            {status === false && (
                <>
                    <span className="h-2 w-2 rounded-full bg-santa-red" />
                    <span className="text-santa-red">{t.giveaway.notFollowing}</span>
                </>
            )}
            {(status === "unknown" || status === undefined) && (
                <>
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-amber-600">{t.giveaway.unknownFollow}</span>
                </>
            )}
        </div>
    );
}
