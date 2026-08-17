"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useLocale, useTranslations } from "next-intl";
import {
    MessageCircle,
    Plus,
    Minus,
    Settings,
    Link2,
    Users,
    AtSign,
    Play,
    Home,
    Trash2,
    Loader2,
    Trophy,
    X,
    ChevronDown
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
import {
    applyManualImportPreview,
    isLikelyTikTokUrl,
    parseManualImport,
    type ManualImportPreview,
    type TikTokErrorCode,
    type TikTokFetchMeta,
} from "@/lib/tiktok";

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor">
        <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
    </svg>
);

type TabType = 'links' | 'rules' | 'participants';


interface Participant {
    name: string;
    comment: string;
    isFollowing?: boolean | 'unknown' | 'checking';
}

export default function TikTokGiveaway() {
    const router = useRouter();
    const locale = useLocale();
    const { t } = useLanguage();
    const tg = useTranslations("giveaway");
    const { toast } = useToast();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('links');

    // Link & Draw settings
    const [mode, setMode] = useState<'manual' | 'auto' | null>(null);
    const [manualPaste, setManualPaste] = useState("");
    const [postLink, setPostLink] = useState("");
    const [channelUsername, setChannelUsername] = useState("");

    // Rules/Settings
    const [giveawayName, setGiveawayName] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(0);
    const [requireFollow, setRequireFollow] = useState(true);
    const [countUserOnce, setCountUserOnce] = useState(true);
    const [keywordFilter, setKeywordFilter] = useState("");
    const [excludeOwner, setExcludeOwner] = useState(true);
    const [ownerUsername, setOwnerUsername] = useState("");
    const [drawProof, setDrawProof] = useState<DrawProof | null>(null);

    // Participants
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newParticipant, setNewParticipant] = useState("");
    const [bulkInput, setBulkInput] = useState("");
    const [showManualEntry, setShowManualEntry] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowManualEntry(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Animation & Results
    const [isRolling, setIsRolling] = useState(false);
    const [rollingParticipant, setRollingParticipant] = useState<Participant | null>(null);
    const [winners, setWinners] = useState<Participant[]>([]);
    const [backups, setBackups] = useState<Participant[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [fetchMeta, setFetchMeta] = useState<TikTokFetchMeta | null>(null);
    const [importPreview, setImportPreview] = useState<ManualImportPreview | null>(null);

    const addParticipant = () => {
        if (!newParticipant.trim()) return;
        const name = newParticipant.trim().replace(/^@/, '');
        if (participants.some(p => p.name === name)) {
            toast.warning(t.home.nameExists || "Bu kullanıcı zaten listede");
            return;
        }
        setParticipants([...participants, { name, comment: 'Manual Entry' }]);
        setNewParticipant("");
        toast.success(`@${name} eklendi`);
    };

    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const handleBulkAdd = () => {
        if (!bulkInput.trim()) return;
        const preview = parseManualImport(bulkInput, participants.map((p) => p.name));
        const added = applyManualImportPreview(preview);
        if (added.length === 0) {
            toast.warning(locale.startsWith("tr") ? "Eklenecek yeni isim bulunamadı" : "No new names to add");
            return;
        }
        setParticipants((prev) => [...prev, ...added]);
        setBulkInput("");
        setShowManualEntry(false);
        toast.success(`${added.length} ${locale.startsWith("tr") ? "katılımcı eklendi" : "participants added"}`);
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
            toast.warning(locale.startsWith("tr") ? "İçe aktarılacak geçerli satır yok" : "No valid rows to import");
            return;
        }
        setParticipants((prev) => [...prev, ...added]);
        setManualPaste("");
        setImportPreview(null);
        setFetchMeta(null);
        setActiveTab("rules");
        toast.success(`${added.length} ${locale.startsWith("tr") ? "katılımcı içe aktarıldı" : "participants imported"}`);
    };

    const fetchTikTokComments = async () => {
        setError(null);
        if (!postLink.trim()) {
            toast.warning(locale.startsWith("tr") ? "Lütfen bir TikTok video linki girin" : "Please enter a TikTok video link");
            return;
        }
        if (!isLikelyTikTokUrl(postLink)) {
            toast.error(
                locale.startsWith("tr")
                    ? "Geçerli bir TikTok video linki giriniz (tiktok.com/@.../video/...)"
                    : "Enter a valid TikTok video link (tiktok.com/@.../video/...)"
            );
            return;
        }

        setLoading(true);
        setFetchMeta(null);
        const steps = locale.startsWith("tr")
            ? [
                  "TikTok'a bağlanılıyor...",
                  "Video yorumları çekiliyor...",
                  "Katılımcılar doğrulanıyor...",
                  "Veriler hazırlanıyor...",
              ]
            : [
                  "Connecting to TikTok...",
                  "Fetching video comments...",
                  "Validating participants...",
                  "Preparing data...",
              ];
        let stepIdx = 0;
        setLoadingStep(steps[0]);
        const stepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            setLoadingStep(steps[stepIdx]);
        }, 5000);

        try {
            const response = await fetch("/api/tiktok/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postLink }),
            });

            const data = await response.json().catch(() => ({} as Record<string, unknown>));

            if (!response.ok) {
                const code = (data.code as TikTokErrorCode | undefined) ?? "UNKNOWN";
                const message =
                    typeof data.error === "string"
                        ? data.error
                        : locale.startsWith("tr")
                          ? "Yorumlar çekilemedi"
                          : "Could not fetch comments";
                setError(message);
                toast.error(message);
                if (code === "NO_APIFY_TOKEN" || code === "SCRAPER_UNAVAILABLE") {
                    setMode("manual");
                }
                return;
            }

            if (!Array.isArray(data.participants)) {
                throw new Error("Malformed response");
            }

            setParticipants(data.participants);
            if (data.meta) setFetchMeta(data.meta as TikTokFetchMeta);
            setActiveTab("rules");
            toast.success(
                `${data.participants.length} ${
                    locale.startsWith("tr") ? "katılımcı başarıyla eklendi!" : "participants added!"
                }`
            );
        } catch (err: unknown) {
            console.error(err);
            const friendly = locale.startsWith("tr")
                ? "Yorumlar çekilemedi — video linkini kontrol edin ve videonun herkese açık olduğundan emin olun"
                : "Could not fetch comments — check the link and that the video is public";
            setError(friendly);
            toast.error(friendly);
        } finally {
            clearInterval(stepInterval);
            setLoading(false);
            setLoadingStep("");
        }
    };

    const checkFollowerStatus = async (winnersToCheck: Participant[], backupsToCheck: Participant[]) => {
        try {
            const allUsernames = [...winnersToCheck, ...backupsToCheck].map(p => p.name);

            const response = await fetch('/api/tiktok/followers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelUsername: channelUsername.replace(/^@/, ''),
                    usernames: allUsernames
                })
            });

            if (response.ok) {
                const data = await response.json();
                const results = data.results as Record<string, boolean | 'unknown'>;

                // Update winners with follower status
                setWinners(prev => prev.map(w => ({
                    ...w,
                    isFollowing: results[w.name] ?? 'unknown'
                })));

                // Update backups with follower status
                setBackups(prev => prev.map(b => ({
                    ...b,
                    isFollowing: results[b.name] ?? 'unknown'
                })));
            } else {
                // Mark all as unknown on error
                setWinners(prev => prev.map(w => ({ ...w, isFollowing: 'unknown' as const })));
                setBackups(prev => prev.map(b => ({ ...b, isFollowing: 'unknown' as const })));
            }
        } catch (error) {
            console.error('Follower check error:', error);
            setWinners(prev => prev.map(w => ({ ...w, isFollowing: 'unknown' as const })));
            setBackups(prev => prev.map(b => ({ ...b, isFollowing: 'unknown' as const })));
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        // TikTok Colors: Cyan (#25F4EE) and Red/Magenta (#FE2C55)
        const colors = ['#25F4EE', '#FE2C55', '#000000'];

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    useEffect(() => {
        const extracted = extractOwnerFromSocialUrl(postLink);
        if (extracted) {
            setOwnerUsername(extracted);
            if (!channelUsername) setChannelUsername(extracted);
        }
    }, [postLink]);

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

    const startGiveaway = () => {
        if (eligibleParticipants.length < winnerCount + backupCount) {
            toast.warning(tg("notEnoughEligible") || t.home.notEnoughPeople || "Yeterli katılımcı yok");
            return;
        }

        setIsRolling(true);
        setDrawProof(null);

        // Rolling animation
        const interval = setInterval(() => {
            const randomIndex = secureRandomInt(eligibleParticipants.length);
            setRollingParticipant(eligibleParticipants[randomIndex]);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);

            const shuffled = secureShuffle(eligibleParticipants);
            const selectedWinners = shuffled.slice(0, winnerCount).map(w => ({ ...w, isFollowing: 'checking' as const }));
            const selectedBackups = shuffled.slice(winnerCount, winnerCount + backupCount).map(b => ({ ...b, isFollowing: 'checking' as const }));

            setWinners(selectedWinners);
            setBackups(selectedBackups);
            setIsRolling(false);
            setShowResults(true);
            setDrawProof(buildDrawProof({
                platform: "tiktok",
                title: giveawayName || t.giveaway.tiktokTitle,
                total: filterStats.total,
                eligible: filterStats.eligible,
                keyword: keywordFilter,
                countUserOnce,
                winners: selectedWinners,
                backups: selectedBackups,
            }));
            triggerConfetti();

            // Check follower status if requireFollow is enabled and channelUsername is provided
            if (requireFollow && channelUsername) {
                checkFollowerStatus(selectedWinners, selectedBackups);
            } else {
                // Mark as unknown if we can't check
                setWinners(selectedWinners.map(w => ({ ...w, isFollowing: 'unknown' as const })));
                setBackups(selectedBackups.map(b => ({ ...b, isFollowing: 'unknown' as const })));
            }
        }, 3000);
    };

    const resetGiveaway = () => {
        setWinners([]);
        setBackups([]);
        setDrawProof(null);
        setShowResults(false);
        setActiveTab('links');
    };

    const copyResults = () => {
        const text = `🎉 ${giveawayName || t.giveaway.tiktokTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w.name} - "${w.comment}"`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b.name}`).join('\n')}` : ''}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Sonuçlar panoya kopyalandı!");
        setTimeout(() => setCopied(false), 2000);
    };

    const getShareText = () => {
        return `🎉 ${giveawayName || t.giveaway.tiktokTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w.name}`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b.name}`).join('\n')}` : ''}\n\n${SITE_SHARE_SUFFIX}`;
    };

    return (
        <main className="ys-page-shell flex flex-col items-center p-3 sm:p-4 pt-24 sm:pt-32 relative overflow-hidden safe-area-inset-bottom transition-colors duration-300">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-cyan-200 dark:bg-cyan-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-red-200 dark:bg-red-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 translate-y-1/3" />

            <div className="z-10 w-full max-w-2xl space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-black rounded-xl sm:rounded-2xl shadow-lg">
                        <TikTokIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] dark:text-white tracking-tight">
                        {locale === 'tr' ? 'TikTok yorum çekilişi' : t.giveaway.tiktokTitle.replace(/\s*\|.*$/, '')}
                    </h1>
                    <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] max-w-lg mx-auto text-sm sm:text-base px-2">
                        {t.giveaway.tiktokDesc}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/90 dark:bg-[var(--card-bg)] backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden min-h-[400px]">
                    {/* Tab Navigation */}
                    <div className={`flex border-b border-[var(--border-light)] ${isRolling ? 'opacity-50 pointer-events-none' : ''}`}>
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'links'
                                ? 'text-cyan-600 border-cyan-500 bg-cyan-50/50'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.links}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'rules'
                                ? 'text-cyan-600 border-cyan-500 bg-cyan-50/50'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.rules}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'participants'
                                ? 'text-cyan-600 border-cyan-500 bg-cyan-50/50'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.participants}</span>
                            {participants.length > 0 && (
                                <span className="ml-1 sm:ml-2 bg-cyan-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                                    {participants.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* ROLLING ANIMATION UI */}
                        {isRolling && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in duration-300">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-[var(--text-muted)]">{t.giveaway.fetching || "Rolling..."}</h3>
                                    <div className="text-4xl sm:text-5xl font-black text-cyan-600 tracking-tight transition-all scale-110">
                                        @{rollingParticipant?.name}
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto truncate px-4">
                                        {rollingParticipant?.comment}
                                    </p>
                                </div>
                                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                            </div>
                        )}

                        {/* NORMAL TABS */}
                        {!isRolling && (
                            <>
                                {/* Links/Method Tab */}
                                {activeTab === 'links' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

                                        {!mode ? (
                                            // Mode Selection
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setMode('manual')}
                                                    className="flex flex-col items-center justify-center p-6 bg-[var(--surface-2)] hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border-2 border-dashed border-[var(--border-medium)] hover:border-cyan-300 dark:hover:border-cyan-500/50 rounded-2xl transition-all group"
                                                >
                                                    <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform text-cyan-500">
                                                        <Users className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{t.giveaway.manualMode}</h3>
                                                    <p className="text-sm text-[var(--text-secondary)] text-center">{t.giveaway.manualDesc}</p>
                                                </button>

                                                <button
                                                    onClick={() => setMode('auto')}
                                                    className="flex flex-col items-center justify-center p-6 bg-[var(--surface-2)] hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border-2 border-dashed border-[var(--border-medium)] hover:border-cyan-300 dark:hover:border-cyan-500/50 rounded-2xl transition-all group"
                                                >
                                                    <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform text-cyan-500">
                                                        <TikTokIcon className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{t.giveaway.autoMode}</h3>
                                                    <p className="text-sm text-[var(--text-secondary)] text-center">{t.giveaway.autoDesc}</p>
                                                </button>
                                            </div>
                                        ) : (
                                            // Selected Mode UI
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                                <button onClick={() => setMode(null)} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1 mb-2">
                                                    ← Back to selection
                                                </button>

                                                {mode === 'manual' ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={manualPaste}
                                                            onChange={(e) => {
                                                                setManualPaste(e.target.value);
                                                                setImportPreview(null);
                                                            }}
                                                            placeholder={`${t.giveaway.pasteComments}\n\nCSV / TXT / Excel paste desteklenir:\nusername,comment\n@user: yorum`}
                                                            className="w-full h-48 p-4 rounded-xl border-2 border-dashed border-[var(--border-medium)] focus:border-cyan-300 outline-none resize-none bg-[var(--surface-2)]"
                                                        />
                                                        <Button onClick={handleManualParse} disabled={!manualPaste.trim()} className="w-full bg-cyan-600 hover:bg-cyan-700">
                                                            {locale.startsWith("tr") ? "Önizle" : "Preview"}
                                                        </Button>

                                                        {importPreview && (
                                                            <div className="space-y-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                                                    <div className="rounded-xl bg-white/70 dark:bg-white/5 p-2">
                                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Valid</p>
                                                                        <p className="font-black text-[var(--text-primary)]">{importPreview.validCount}</p>
                                                                    </div>
                                                                    <div className="rounded-xl bg-white/70 dark:bg-white/5 p-2">
                                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Duplicate</p>
                                                                        <p className="font-black text-[var(--text-primary)]">{importPreview.duplicateCount}</p>
                                                                    </div>
                                                                    <div className="rounded-xl bg-white/70 dark:bg-white/5 p-2">
                                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Invalid</p>
                                                                        <p className="font-black text-[var(--text-primary)]">{importPreview.invalidCount}</p>
                                                                    </div>
                                                                    <div className="rounded-xl bg-white/70 dark:bg-white/5 p-2">
                                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Empty</p>
                                                                        <p className="font-black text-[var(--text-primary)]">{importPreview.skippedEmpty}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-40 overflow-y-auto space-y-1 text-left">
                                                                    {importPreview.rows.slice(0, 40).map((row) => (
                                                                        <div
                                                                            key={`${row.sourceLine}-${row.name}`}
                                                                            className={`text-xs px-2 py-1.5 rounded-lg ${row.duplicate ? "opacity-50 line-through" : "bg-white/60 dark:bg-white/5"}`}
                                                                        >
                                                                            <span className="font-bold">@{row.name}</span>
                                                                            <span className="text-[var(--text-muted)]"> — {row.comment.slice(0, 80)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <Button
                                                                    onClick={confirmManualImport}
                                                                    disabled={importPreview.validCount === 0}
                                                                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                                                                >
                                                                    {locale.startsWith("tr")
                                                                        ? `${importPreview.validCount} kişiyi içe aktar`
                                                                        : `Import ${importPreview.validCount} people`}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {/* Post Link Input */}
                                                        <div className="space-y-3">
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 flex items-center gap-2 bg-[var(--surface-2)] rounded-xl p-4 border-2 border-dashed border-[var(--border-medium)] focus-within:border-cyan-300 transition-colors">
                                                                    <TikTokIcon className="w-5 h-5 text-cyan-500" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder={t.giveaway.linkInputPlaceholder}
                                                                        value={postLink}
                                                                        onChange={(e) => setPostLink(e.target.value)}
                                                                        className="flex-1 bg-transparent outline-none text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    onClick={fetchTikTokComments}
                                                                    disabled={loading}
                                                                    className="h-auto px-6 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg whitespace-nowrap"
                                                                >
                                                                    {loading ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                            {t.giveaway.fetching}
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <MessageCircle className="w-4 h-4 mr-2" />
                                                                            {t.giveaway.fetchComments}
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {loading && (
                                                            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl animate-in fade-in">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-5 h-5 border-2 border-cyan-300 border-t-cyan-600 rounded-full animate-spin flex-shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-cyan-700">{loadingStep}</p>
                                                                        <p className="text-xs text-cyan-400 mt-0.5">Bu işlem 20-60 saniye sürebilir, lütfen bekleyin</p>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 w-full bg-cyan-100 rounded-full h-1 overflow-hidden">
                                                                    <div className="h-full w-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full origin-left animate-[pulse_2s_ease-in-out_infinite]" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {error && !loading && (
                                                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                                                                <span className="text-lg leading-none">⚠️</span>
                                                                <span>{error}</span>
                                                            </div>
                                                        )}

                                                        {fetchMeta && !loading && (
                                                            <TikTokFetchStats fetchMeta={fetchMeta} locale={locale} />
                                                        )}

                                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 space-y-2">
                                                            <h4 className="font-bold flex items-center gap-2">
                                                                <span className="text-xl">ℹ️</span>
                                                                {t.giveaway.tiktokLimitNote}
                                                            </h4>
                                                            <p className="opacity-90">
                                                                {t.giveaway.participantLimitDetails}
                                                            </p>
                                                        </div>

                                                        <div className="pt-4 flex justify-end">
                                                            <Button
                                                                onClick={() => setActiveTab('rules')}
                                                                className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg"
                                                            >
                                                                {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}


                                {/* Rules Tab */}
                                {activeTab === 'rules' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        {/* Giveaway Name */}
                                        <div className="text-center space-y-2">
                                            <label className="text-sm font-bold text-[var(--text-secondary)]">{t.giveaway.giveawayName}</label>
                                            <input
                                                type="text"
                                                placeholder="TikTok Giveaway"
                                                value={giveawayName}
                                                onChange={(e) => setGiveawayName(e.target.value)}
                                                className="w-full max-w-md mx-auto block text-center py-3 px-4 rounded-xl border-2 border-[var(--border-medium)] focus:border-cyan-400 outline-none transition-colors"
                                            />
                                        </div>

                                        {/* Winner Counts */}
                                        <div className="flex justify-center gap-8">
                                            <div className="text-center space-y-2">
                                                <label className="text-sm font-bold text-[var(--text-secondary)]">{t.giveaway.winnerCount}</label>
                                                <div className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl p-2">
                                                    <button onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))} className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-12 text-center font-bold text-xl">{winnerCount}</span>
                                                    <button onClick={() => setWinnerCount(winnerCount + 1)} className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <label className="text-sm font-bold text-[var(--text-secondary)]">{t.giveaway.backupCount}</label>
                                                <div className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl p-2">
                                                    <button onClick={() => setBackupCount(Math.max(0, backupCount - 1))} className="w-10 h-10 rounded-lg bg-[var(--surface-2)] text-[var(--text-secondary)] flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-12 text-center font-bold text-xl">{backupCount}</span>
                                                    <button onClick={() => setBackupCount(backupCount + 1)} className="w-10 h-10 rounded-lg bg-[var(--surface-2)] text-[var(--text-secondary)] flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="space-y-3 max-w-md mx-auto">
                                            <label className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
                                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-cyan-500" />
                                                    {t.giveaway.requireFollow}
                                                </span>
                                                <button onClick={() => setRequireFollow(!requireFollow)} className={`w-12 h-7 rounded-full transition-colors relative ${requireFollow ? 'bg-cyan-500' : 'bg-[var(--text-muted)]'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireFollow ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
                                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                                    {t.giveaway.countUserOnce}
                                                </span>
                                                <button onClick={() => setCountUserOnce(!countUserOnce)} className={`w-12 h-7 rounded-full transition-colors relative ${countUserOnce ? 'bg-cyan-500' : 'bg-[var(--text-muted)]'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <TikTokFetchStats
                                                fetchMeta={fetchMeta}
                                                filterStats={filterStats}
                                                ownerRemoved={ownerRemovedCount}
                                                locale={locale}
                                            />

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
                                                accentClass="text-cyan-600"
                                                toggleOnClass="bg-cyan-500"
                                                inputFocusClass="focus:border-cyan-500 focus:ring-cyan-500/10"
                                                labels={filterLabels}
                                            />
                                        </div>

                                        {/* Channel Username for Follower Check */}
                                        {requireFollow && (
                                            <div className="max-w-md mx-auto space-y-2">
                                                <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                                                    <TikTokIcon className="w-4 h-4" />
                                                    {t.giveaway.channelUsername || "Username (Follower Check)"}
                                                </label>
                                                <div className="flex items-center gap-2 bg-[var(--surface-2)] rounded-xl px-3 border-2 border-[var(--border-medium)] focus-within:border-cyan-400 transition-colors">
                                                    <AtSign className="w-4 h-4 text-[var(--text-muted)]" />
                                                    <input
                                                        type="text"
                                                        placeholder="tiktok_username"
                                                        value={channelUsername}
                                                        onChange={(e) => setChannelUsername(e.target.value)}
                                                        className="flex-1 bg-transparent outline-none py-3 text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
                                                    />
                                                </div>
                                                <p className="text-xs text-[var(--text-muted)] text-center">
                                                    {t.giveaway.channelUsernameHint || "Enter your username to check if winners follow you"}
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-4 flex justify-between items-center gap-4">
                                            <Button onClick={() => setActiveTab('links')} variant="ghost" className="text-[var(--text-muted)]">← {t.common.cancel}</Button>

                                            <div className="flex gap-4">
                                                <Button onClick={() => setActiveTab('participants')} variant="secondary" className="text-[var(--text-secondary)]">
                                                    {t.giveaway.participants} ({participants.length})
                                                </Button>

                                                <Button onClick={startGiveaway} disabled={eligibleParticipants.length < winnerCount + backupCount} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200">
                                                    <Play className="w-5 h-5 mr-2" /> {t.giveaway.startGiveaway}
                                                </Button>
                                            </div>
                                        </div>
                                        {eligibleParticipants.length < winnerCount + backupCount && (
                                            <p className="text-center text-sm text-red-500 font-medium bg-red-50 py-2 rounded-lg mt-2">
                                                ⚠️ {tg("notEnoughEligible") || t.home.notEnoughPeople}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Participants Tab */}
                                {activeTab === 'participants' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        {/* List */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-[var(--text-secondary)]">{t.giveaway.participants} ({participants.length})</label>
                                                <div className="flex gap-2 relative">
                                                    <button
                                                        onClick={() => setShowManualEntry(!showManualEntry)}
                                                        className="text-xs bg-cyan-50 text-cyan-600 font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-100 transition-colors flex items-center gap-1 active:scale-95 duration-75"
                                                    >
                                                        + {t.giveaway.addParticipant || "Add Manually"}
                                                        {showManualEntry ? <X className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {showManualEntry && (
                                                        <div
                                                            ref={dropdownRef}
                                                            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[var(--border-light)] z-50 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right transform"
                                                        >
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">{t.giveaway.addParticipant}</label>
                                                                    <div className="flex gap-2">
                                                                        <div className="flex-1 flex items-center gap-2 bg-[var(--surface-2)] rounded-lg px-2 border border-[var(--border-medium)] focus-within:border-cyan-300 transition-colors">
                                                                            <AtSign className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                                            <input
                                                                                autoFocus
                                                                                type="text"
                                                                                placeholder="Username"
                                                                                value={newParticipant}
                                                                                onChange={(e) => setNewParticipant(e.target.value)}
                                                                                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                                                                                className="flex-1 bg-transparent outline-none py-2 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
                                                                            />
                                                                        </div>
                                                                        <Button onClick={addParticipant} size="sm" className="bg-cyan-500 hover:bg-cyan-600 h-9 w-9 p-0 rounded-lg">
                                                                            <Plus className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                <div className="relative">
                                                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--border-light)]"></span></div>
                                                                    <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-2 text-[var(--text-muted)]">{t.common.or || "OR"} {t.giveaway.bulkAdd || "BULK"}</span></div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        placeholder="User1&#10;User2&#10;User3"
                                                                        value={bulkInput}
                                                                        onChange={(e) => setBulkInput(e.target.value)}
                                                                        className="w-full h-24 p-3 text-sm rounded-lg border border-[var(--border-medium)] focus:border-cyan-300 outline-none resize-none bg-[var(--surface-2)]"
                                                                    />
                                                                    <Button onClick={handleBulkAdd} variant="secondary" size="sm" className="w-full text-xs h-8">
                                                                        {t.giveaway.bulkAdd}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {participants.length > 0 && (
                                                        <button
                                                            onClick={() => setParticipants([])}
                                                            className="text-xs text-[var(--text-muted)] hover:text-red-500 font-medium px-2"
                                                        >
                                                            {t.giveaway.clearAll}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="min-h-[200px] max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar border-2 border-dashed border-[var(--border-light)] rounded-xl p-2 bg-[var(--surface-2)]">
                                                {participants.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] py-10 gap-3">
                                                        <div className="p-4 bg-cyan-50 rounded-2xl">
                                                            <Users className="w-10 h-10 text-cyan-200" />
                                                        </div>
                                                        <div className="text-center space-y-1">
                                                            <p className="text-sm font-semibold text-[var(--text-muted)]">{t.giveaway.noParticipantsYet}</p>
                                                            <p className="text-xs text-[var(--text-muted)] max-w-[200px] mx-auto">{t.giveaway.tiktokNoParticipantsHint}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setActiveTab('links')}
                                                            className="text-xs bg-cyan-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
                                                        >
                                                            {t.giveaway.fetchFromVideo}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    participants.map((p, i) => (
                                                        <div key={i} className="flex flex-col p-3 bg-white rounded-xl shadow-sm border border-[var(--border-light)] group hover:border-cyan-200 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-[var(--text-secondary)]">@{p.name}</span>
                                                                <button
                                                                    onClick={() => removeParticipant(i)}
                                                                    className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            {p.comment && (
                                                                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{p.comment}</p>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-[var(--border-light)] flex justify-end">
                                            <Button onClick={() => setActiveTab('rules')} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg">
                                                {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Results */}
                                {showResults && (
                                    <div className="space-y-6 animate-in zoom-in duration-500">
                                        <div className="text-center space-y-2">
                                            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl">
                                                <Trophy className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-black text-[var(--text-primary)]">
                                                🎉 {giveawayName || t.giveaway.tiktokTitle} {t.giveaway.results}
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            {winners.map((winner, i) => (
                                                <div key={i} className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                                    {i + 1}
                                                                </span>
                                                                <span className="font-bold text-[var(--text-primary)] text-lg">@{winner.name}</span>
                                                            </div>
                                                            {/* Follower Status Badge */}
                                                            {requireFollow && (
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full">
                                                                    {winner.isFollowing === 'checking' && (
                                                                        <>
                                                                            <Loader2 className="w-3 h-3 text-[var(--text-muted)] animate-spin" />
                                                                            <span className="text-[var(--text-muted)]">{t.giveaway.checkingFollow || "Checking..."}</span>
                                                                        </>
                                                                    )}
                                                                    {winner.isFollowing === true && (
                                                                        <>
                                                                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                                                                            <span className="text-green-600">{t.giveaway.following || "Following"} ✓</span>
                                                                        </>
                                                                    )}
                                                                    {winner.isFollowing === false && (
                                                                        <>
                                                                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                                                                            <span className="text-red-600">{t.giveaway.notFollowing || "Not Following"} ✗</span>
                                                                        </>
                                                                    )}
                                                                    {winner.isFollowing === 'unknown' && (
                                                                        <>
                                                                            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                                            <span className="text-yellow-600">{t.giveaway.unknownFollow || "Unknown"}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {winner.comment && (
                                                            <div className="ml-11 p-3 bg-white/60 rounded-lg text-sm text-[var(--text-secondary)] italic border-l-4 border-cyan-300">
                                                                &quot;{winner.comment}&quot;
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {backups.length > 0 && (
                                            <div className="space-y-3 pt-4 border-t border-[var(--border-light)]">
                                                <h3 className="font-bold text-[var(--text-muted)] flex items-center gap-2">
                                                    <Users className="w-5 h-5" />
                                                    {t.giveaway.backups}
                                                </h3>
                                                {backups.map((backup, i) => (
                                                    <div key={i} className="px-4 py-3 bg-[var(--surface-2)] rounded-lg flex flex-col justify-between text-[var(--text-secondary)] animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${(winners.length + i) * 100}ms` }}>
                                                        <div className="flex items-center justify-between">
                                                            <span>{i + 1}. @{backup.name}</span>
                                                            <span className="text-xs font-medium bg-[var(--surface-2)] px-2 py-0.5 rounded text-[var(--text-muted)]">{t.giveaway.backups.slice(0, -1)}</span>
                                                        </div>
                                                        {backup.comment && <p className="text-xs text-[var(--text-muted)] mt-1 truncate pl-4">&quot;{backup.comment}&quot;</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {drawProof && (
                                            <DrawProofPanel
                                                proof={drawProof}
                                                locale={locale}
                                                accentClass="text-cyan-600"
                                                buttonClass="bg-cyan-600 hover:bg-cyan-700"
                                                labels={proofLabels}
                                                onToast={(msg) => toast.success(msg)}
                                            />
                                        )}
                                        <AdWrapper position="inline">
                                            <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                                        </AdWrapper>

                                        <div className="flex flex-wrap gap-2 pt-4">
                                            <Button onClick={copyResults} variant="secondary" className="flex-1 min-w-[120px]">{copied ? t.giveaway.copied : t.giveaway.copyResults}</Button>
                                            <Button
                                                onClick={() => {
                                                    downloadWinnerCard({ giveawayName: giveawayName || t.giveaway.tiktokTitle, winners, backups, platform: "tiktok" });
                                                    toast.success("Kazanan kartı indirildi!");
                                                }}
                                                variant="secondary"
                                                className="flex-1 min-w-[120px] border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                PNG İndir
                                            </Button>
                                            <Button onClick={() => setShowShareModal(true)} className="flex-1 min-w-[120px] bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg">
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                                {t.giveaway.shareResults || "Paylaş"}
                                            </Button>
                                            <Button onClick={resetGiveaway} className="flex-1 min-w-[120px] bg-cyan-600 hover:bg-cyan-700">{t.giveaway.newGiveaway}</Button>
                                        </div>

                                        <ShareModal
                                            isOpen={showShareModal}
                                            onClose={() => setShowShareModal(false)}
                                            shareText={getShareText()}
                                            t={{
                                                shareResults: t.giveaway.copyLink || "Linki Kopyala",
                                                shareTitle: t.giveaway.shareTitle || "Sonuçları Paylaş",
                                                shareDesc: t.giveaway.shareDesc || "Çekiliş sonuçlarını sosyal medyada paylaşın",
                                                close: t.giveaway.shareCopied || t.giveaway.copied || "Kopyalandı!"
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {/* Back to Home */}
                <div className="text-center pb-8">
                    <Button
                        onClick={() => router.push(`/${locale}`)}
                        variant="ghost"
                        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        {t.result.backToHome}
                    </Button>
                </div>
            </div>
        </main>
    );
}
