"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
    Youtube,
    MessageCircle,
    ThumbsUp,
    Plus,
    Minus,
    Settings,
    Link2,
    Trophy,
    Users,
    AtSign,
    Play,
    Home,
    Trash2,
    Bell,
    Loader2,
    X,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ShareModal from "@/components/ShareModal";
import { useToast } from "@/lib/ToastContext";
import { downloadWinnerCard } from "@/lib/downloadWinnerCard";
import { secureShuffle, secureRandomInt } from "@/lib/random";
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";

type TabType = 'links' | 'rules' | 'participants';
type DrawType = 'comments' | 'likes' | 'subscribers';

interface Participant {
    name: string;
    comment: string;
    channelId?: string;
    profileImageUrl?: string;
    isSubscribed?: boolean | null | 'private'; // null = check not run yet, 'private' = hidden, false = not subbed, true = subbed
}

export default function YouTubeGiveaway() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useLanguage();
    const { toast } = useToast();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('links');

    // Link & Draw settings
    const [videoLink, setVideoLink] = useState("");
    const [drawType, setDrawType] = useState<DrawType>('comments');

    // Rules/Settings
    const [giveawayName, setGiveawayName] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(0);
    const [requireSubscription, setRequireSubscription] = useState(true);
    const [requireNotification, setRequireNotification] = useState(false);
    const [countUserOnce, setCountUserOnce] = useState(true);
    const [videoOwnerChannelId, setVideoOwnerChannelId] = useState<string | null>(null);

    // Participants (Manual Entry)
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newParticipant, setNewParticipant] = useState("");
    const [bulkInput, setBulkInput] = useState("");
    const [showManualEntry, setShowManualEntry] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Animation & Results
    const [isRolling, setIsRolling] = useState(false);
    const [rollingParticipant, setRollingParticipant] = useState<Participant | null>(null);
    const [winners, setWinners] = useState<Participant[]>([]);
    const [backups, setBackups] = useState<Participant[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");
    const [error, setError] = useState<string | null>(null);

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

    const extractVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[8].length === 11) ? match[8] : null;
    };

    const fetchComments = async () => {
        setError(null);
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            toast.error("Geçerli bir YouTube video linki giriniz");
            return;
        }

        setLoading(true);
        const steps = [
            "YouTube'a bağlanılıyor...",
            "Video yorumları çekiliyor...",
            "Katılımcılar listeleniyor...",
            "Veriler hazırlanıyor...",
        ];
        let stepIdx = 0;
        setLoadingStep(steps[0]);
        const stepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            setLoadingStep(steps[stepIdx]);
        }, 5000);

        try {
            const response = await fetch('/api/youtube/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t.giveaway.fetchError);
            }

            const newParticipants = data.participants as Participant[];
            setVideoOwnerChannelId(data.videoOwnerChannelId);

            const existingNames = new Set(participants.map(p => p.name));
            const unique = [...participants];

            newParticipants.forEach(p => {
                if (!existingNames.has(p.name)) {
                    unique.push(p);
                    existingNames.add(p.name);
                }
            });

            setParticipants(unique);
            setActiveTab('rules');
            toast.success(`${newParticipants.length} katılımcı başarıyla eklendi!`);

        } catch (err) {
            const raw = err instanceof Error ? err.message : String(err);
            const friendly = raw.includes('API key') || raw.includes('quota')
                ? 'YouTube API kotası doldu, lütfen daha sonra deneyin'
                : raw.includes('disabled') || raw.includes('403')
                ? 'Bu video için yorumlar kapalı'
                : raw.includes('not found') || raw.includes('404')
                ? 'Video bulunamadı veya gizli'
                : 'Yorumlar çekilemedi — video linkini kontrol edin';
            setError(friendly);
            toast.error(friendly);
        } finally {
            clearInterval(stepInterval);
            setLoading(false);
            setLoadingStep("");
        }
    };

    const verifyParticipantSubscription = async (participant: Participant): Promise<boolean | null | 'private'> => {
        if (!participant.channelId || !videoOwnerChannelId) return null;
        try {
            const res = await fetch('/api/youtube/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: participant.channelId,
                    videoOwnerChannelId: videoOwnerChannelId
                })
            });
            const data = await res.json();
            return data.isSubscribed; // true or false
        } catch (e) {
            console.error("Verification failed", e);
            return null;
        }
    };

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
        const names = bulkInput
            .split(/[\n,;]+/)
            .map(n => n.trim().replace(/^@/, ''))
            .filter(n => n.length > 0);

        const existingNames = new Set(participants.map(p => p.name));
        const unique = [...participants];

        names.forEach(name => {
            if (!existingNames.has(name)) {
                unique.push({ name, comment: 'Manual Entry' });
                existingNames.add(name);
            }
        });

        setParticipants(unique);
        setBulkInput("");
        setShowManualEntry(false);
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#FF0000', '#FFFFFF', '#282828', '#FF4444'];

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

    const startGiveaway = () => {
        if (participants.length < winnerCount + backupCount) {
            toast.warning(t.home.notEnoughPeople || "Yeterli katılımcı yok");
            return;
        }

        setIsRolling(true);

        const interval = setInterval(() => {
            const randomIndex = secureRandomInt(participants.length);
            setRollingParticipant(participants[randomIndex]);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);

            const shuffled = secureShuffle(participants);
            const selectedWinners = shuffled.slice(0, winnerCount);
            const selectedBackups = shuffled.slice(winnerCount, winnerCount + backupCount);

            setWinners(selectedWinners);
            setBackups(selectedBackups);
            setIsRolling(false);
            setShowResults(true);
            triggerConfetti();

            // Verify Winners asynchronously
            if (videoOwnerChannelId) {
                selectedWinners.forEach(async (winner, index) => {
                    if (winner.channelId) {
                        const isSubbed = await verifyParticipantSubscription(winner);
                        setWinners(prev => {
                            const newWinners = [...prev];
                            // Make sure we update the specific winner in case list changed (unlikely here)
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
        setShowResults(false);
        setActiveTab('links');
    };

    const copyResults = () => {
        const text = `🎉 ${giveawayName || t.giveaway.youtubeTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. ${w.name} - "${w.comment}"`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. ${b.name}`).join('\n')}` : ''}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Sonuçlar panoya kopyalandı!");
        setTimeout(() => setCopied(false), 2000);
    };

    const getShareText = () => {
        return `🎉 ${giveawayName || t.giveaway.youtubeTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. ${w.name}`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. ${b.name}`).join('\n')}` : ''}\n\n🎰 www.yulasanta.com.tr`;
    };

    const backToHome = () => {
        router.push(`/${locale}`);
    };

    return (
        <main className="ys-page-shell flex flex-col items-center p-3 sm:p-4 pt-24 sm:pt-32 relative overflow-hidden safe-area-inset-bottom transition-colors duration-300">
            <div className="absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-red-200 dark:bg-red-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-gray-200 dark:bg-gray-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 translate-y-1/3" />

            <div className="z-10 w-full max-w-2xl space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-red-600 rounded-xl sm:rounded-2xl shadow-lg">
                        <Youtube className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">
                        {t.giveaway.youtubeTitle}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-body-md max-w-lg mx-auto px-2">
                        {t.giveaway.youtubeDesc}
                    </p>
                </div>

                {/* Main Card */}
                <div className="ys-card backdrop-blur-xl overflow-hidden min-h-[400px]">
                    {/* Tab Navigation */}
                    <div className={`flex border-b border-[var(--border-light)] ${isRolling ? 'opacity-50 pointer-events-none' : ''}`}>
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'links'
                                ? 'text-santa-red border-santa-red bg-santa-red/5'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.links}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'rules'
                                ? 'text-santa-red border-santa-red bg-santa-red/5'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.rules}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'participants'
                                ? 'text-santa-red border-santa-red bg-santa-red/5'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.participants}</span>
                            {participants.length > 0 && (
                                <span className="ml-1 sm:ml-2 bg-santa-red text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
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
                                    <h3 className="text-xl font-bold text-[var(--text-secondary)]">{t.giveaway.fetching || "Rolling..."}</h3>
                                    <div className="font-heading text-4xl sm:text-5xl font-black text-santa-red tracking-tight transition-all scale-110">
                                        {rollingParticipant?.name}
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto truncate px-4">
                                        {rollingParticipant?.comment}
                                    </p>
                                </div>
                                <Loader2 className="w-8 h-8 text-santa-red animate-spin" />
                            </div>
                        )}

                        {/* NORMAL TABS */}
                        {!isRolling && (
                            <>
                                {/* Links Tab */}
                                {activeTab === 'links' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex items-center gap-2 bg-[var(--input-bg)] rounded-xl p-4 border-2 border-dashed border-[var(--input-border)] focus-within:border-santa-red transition-colors">
                                                    <Youtube className="w-5 h-5 text-red-500" />
                                                    <input
                                                        type="text"
                                                        placeholder={t.giveaway.linkInputPlaceholder}
                                                        value={videoLink}
                                                        onChange={(e) => setVideoLink(e.target.value)}
                                                        className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={fetchComments}
                                                    disabled={loading || !videoLink}
                                                    className="h-auto px-6 whitespace-nowrap"
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
                                            <p className="text-label-sm text-[var(--text-muted)] text-center">
                                                {t.giveaway.youtubeDesc}
                                            </p>
                                            {loading && (
                                                <div className="p-4 bg-santa-red/5 border border-santa-red/20 rounded-xl animate-in fade-in">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-santa-red/30 border-t-santa-red rounded-full animate-spin flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-santa-red">{loadingStep}</p>
                                                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Bu işlem 10-30 saniye sürebilir, lütfen bekleyin</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 w-full bg-santa-red/15 rounded-full h-1 overflow-hidden">
                                                        <div className="h-full w-full bg-gradient-to-r from-santa-red/70 to-santa-red rounded-full origin-left animate-[pulse_2s_ease-in-out_infinite]" />
                                                    </div>
                                                </div>
                                            )}

                                            {error && !loading && (
                                                <div className="p-3 bg-santa-red/5 border border-santa-red/20 text-santa-red rounded-xl text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                                                    <span className="text-lg leading-none">⚠️</span>
                                                    <span>{error}</span>
                                                </div>
                                            )}

                                            <div className="bg-indigo-accent/10 border border-indigo-accent/25 rounded-xl p-4 text-sm text-indigo-accent space-y-2">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    <span className="text-xl">ℹ️</span>
                                                    {t.giveaway.youtubeLimitNote}
                                                </h4>
                                                <p className="opacity-90">
                                                    {t.giveaway.participantLimitDetails}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 justify-center">
                                            <button
                                                onClick={() => setDrawType('comments')}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'comments'
                                                    ? 'bg-[var(--card-bg)] border-2 border-santa-red text-santa-red shadow-md'
                                                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--border-medium)]'
                                                    }`}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                {t.giveaway.comments}
                                            </button>
                                            <div className="relative opacity-50 cursor-not-allowed" title={t.giveaway.comingSoon}>
                                                <div className="flex items-center gap-2 px-5 py-3 rounded-full font-medium bg-[var(--surface-2)] text-[var(--text-muted)] select-none">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    {t.giveaway.likes}
                                                </div>
                                                <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[var(--text-muted)] text-white px-1.5 py-0.5 rounded-full leading-none">{t.giveaway.comingSoon}</span>
                                            </div>
                                            <div className="relative opacity-50 cursor-not-allowed" title={t.giveaway.comingSoon}>
                                                <div className="flex items-center gap-2 px-5 py-3 rounded-full font-medium bg-[var(--surface-2)] text-[var(--text-muted)] select-none">
                                                    <Bell className="w-4 h-4" />
                                                    {t.giveaway.subscribers}
                                                </div>
                                                <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[var(--text-muted)] text-white px-1.5 py-0.5 rounded-full leading-none">{t.giveaway.comingSoon}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <Button
                                                onClick={() => setActiveTab('rules')}
                                            >
                                                {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Rules Tab */}
                                {activeTab === 'rules' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="text-center space-y-2">
                                            <label className="text-label-md text-[var(--text-secondary)] flex items-center justify-center gap-1">
                                                {t.giveaway.giveawayName}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Giveaway"
                                                value={giveawayName}
                                                onChange={(e) => setGiveawayName(e.target.value)}
                                                className="w-full max-w-md mx-auto block text-center py-3 px-4 rounded-xl border-2 border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:border-santa-red outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="flex justify-center gap-8">
                                            <div className="text-center space-y-2">
                                                <label className="text-label-md text-[var(--text-secondary)] flex items-center justify-center gap-1">
                                                    {t.giveaway.winnerCount}
                                                </label>
                                                <div className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl p-2">
                                                    <button onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))} className="w-10 h-10 rounded-lg bg-santa-red/10 text-santa-red hover:bg-santa-red/20 flex items-center justify-center transition-colors"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-12 text-center font-bold text-xl text-[var(--text-primary)]">{winnerCount}</span>
                                                    <button onClick={() => setWinnerCount(winnerCount + 1)} className="w-10 h-10 rounded-lg bg-santa-red/10 text-santa-red hover:bg-santa-red/20 flex items-center justify-center transition-colors"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <label className="text-label-md text-[var(--text-secondary)] flex items-center justify-center gap-1">
                                                    {t.giveaway.backupCount}
                                                </label>
                                                <div className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl p-2">
                                                    <button onClick={() => setBackupCount(Math.max(0, backupCount - 1))} className="w-10 h-10 rounded-lg bg-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--border-medium)] flex items-center justify-center transition-colors"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-12 text-center font-bold text-xl text-[var(--text-primary)]">{backupCount}</span>
                                                    <button onClick={() => setBackupCount(backupCount + 1)} className="w-10 h-10 rounded-lg bg-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--border-medium)] flex items-center justify-center transition-colors"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-w-md mx-auto">
                                            <label className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-xl cursor-pointer hover:bg-[var(--border-light)] transition-colors">
                                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-red-500" />
                                                    {t.giveaway.requireSubscription}
                                                </span>
                                                <button onClick={() => setRequireSubscription(!requireSubscription)} className={`w-12 h-7 rounded-full transition-colors relative ${requireSubscription ? 'bg-santa-red' : 'bg-[var(--border-medium)]'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireSubscription ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-xl cursor-pointer hover:bg-[var(--border-light)] transition-colors">
                                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                                    🔔 {t.giveaway.requireNotification}
                                                </span>
                                                <button onClick={() => setRequireNotification(!requireNotification)} className={`w-12 h-7 rounded-full transition-colors relative ${requireNotification ? 'bg-santa-red' : 'bg-[var(--border-medium)]'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireNotification ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-xl cursor-pointer hover:bg-[var(--border-light)] transition-colors">
                                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                                    {t.giveaway.countUserOnce}
                                                </span>
                                                <button onClick={() => setCountUserOnce(!countUserOnce)} className={`w-12 h-7 rounded-full transition-colors relative ${countUserOnce ? 'bg-santa-red' : 'bg-[var(--border-medium)]'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                        </div>

                                        <div className="pt-4 flex justify-between items-center gap-4">
                                            <Button onClick={() => setActiveTab('links')} variant="ghost">← {t.common.cancel}</Button>
                                            <div className="flex gap-4">
                                                <Button onClick={() => setActiveTab('participants')} variant="secondary">{t.giveaway.participants} ({participants.length})</Button>
                                                <Button onClick={startGiveaway} disabled={participants.length < winnerCount + backupCount}>
                                                    <Play className="w-5 h-5 mr-2" /> {t.giveaway.startGiveaway}
                                                </Button>
                                            </div>
                                        </div>
                                        {participants.length < winnerCount + backupCount && (
                                            <p className="text-center text-sm text-santa-red font-medium">⚠️ {t.home.notEnoughPeople}</p>
                                        )}
                                    </div>
                                )}

                                {/* Participants Tab (Redone with Dropdown) */}
                                {activeTab === 'participants' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-600">
                                                    {t.giveaway.participants} ({participants.length})
                                                </label>
                                                <div className="flex gap-2 relative">
                                                    <button
                                                        onClick={() => setShowManualEntry(!showManualEntry)}
                                                        className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 active:scale-95 duration-75"
                                                    >
                                                        + {t.giveaway.addParticipant || "Add Manually"}
                                                        {showManualEntry ? <X className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {showManualEntry && (
                                                        <div
                                                            ref={dropdownRef}
                                                            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right transform"
                                                        >
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t.giveaway.addParticipant}</label>
                                                                    <div className="flex gap-2">
                                                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-2 border border-gray-200 focus-within:border-red-300 transition-colors">
                                                                            <AtSign className="w-3.5 h-3.5 text-gray-400" />
                                                                            <input
                                                                                autoFocus
                                                                                type="text"
                                                                                placeholder="Username"
                                                                                value={newParticipant}
                                                                                onChange={(e) => setNewParticipant(e.target.value)}
                                                                                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                                                                                className="flex-1 bg-transparent outline-none py-2 text-sm text-gray-700 placeholder:text-gray-400"
                                                                            />
                                                                        </div>
                                                                        <Button onClick={addParticipant} size="sm" className="bg-red-500 hover:bg-red-600 h-9 w-9 p-0 rounded-lg">
                                                                            <Plus className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                <div className="relative">
                                                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                                                                    <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-2 text-gray-400">{t.common.or || "OR"} {t.giveaway.bulkAdd || "BULK"}</span></div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        placeholder="User1&#10;User2&#10;User3"
                                                                        value={bulkInput}
                                                                        onChange={(e) => setBulkInput(e.target.value)}
                                                                        className="w-full h-24 p-3 text-sm rounded-lg border border-gray-200 focus:border-red-300 outline-none resize-none bg-gray-50"
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
                                                            className="text-xs text-gray-400 hover:text-red-500 font-medium px-2"
                                                        >
                                                            {t.giveaway.clearAll}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="min-h-[200px] max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar border-2 border-dashed border-gray-100 rounded-xl p-2 bg-gray-50/30">
                                                {participants.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10 gap-3">
                                                        <div className="p-4 bg-red-50 rounded-2xl">
                                                            <Users className="w-10 h-10 text-red-200" />
                                                        </div>
                                                        <div className="text-center space-y-1">
                                                            <p className="text-sm font-semibold text-gray-500">{t.giveaway.noParticipantsYet}</p>
                                                            <p className="text-xs text-gray-400 max-w-[200px] mx-auto">{t.giveaway.youtubeNoParticipantsHint}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setActiveTab('links')}
                                                            className="text-xs bg-red-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            {t.giveaway.fetchFromVideo}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    participants.map((p, i) => (
                                                        <div key={i} className="flex flex-col p-3 bg-white rounded-xl shadow-sm border border-gray-100 group hover:border-red-200 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-gray-700">{p.name}</span>
                                                                <button
                                                                    onClick={() => removeParticipant(i)}
                                                                    className="p-1 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            {p.comment && (
                                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.comment}</p>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                                            <Button
                                                onClick={() => setActiveTab('rules')}
                                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                            >
                                                {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Results View */}
                                {showResults && (
                                    <div className="space-y-6 animate-in zoom-in duration-500">
                                        <div className="text-center space-y-2">
                                            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-yellow-400 to-red-500 rounded-xl">
                                                <Trophy className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-black text-gray-900">
                                                🎉 {giveawayName || t.giveaway.youtubeTitle} {t.giveaway.results}
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                                {t.giveaway.winners}
                                            </h3>
                                            {winners.map((winner, i) => (
                                                <div key={i} className="p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl border border-red-200 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                                    {i + 1}
                                                                </span>
                                                                <span className="font-bold text-gray-800 text-lg">{winner.name}</span>
                                                            </div>
                                                            {/* Subscription Status Badge */}
                                                            {videoOwnerChannelId && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-white border border-gray-100">
                                                                    {winner.isSubscribed === true && (
                                                                        <>
                                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                                            <span className="text-green-600">{t.giveaway.subscribed}</span>
                                                                        </>
                                                                    )}
                                                                    {winner.isSubscribed === false && (
                                                                        <>
                                                                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                                                                            <span className="text-red-500">{t.giveaway.notSubscribed}</span>
                                                                        </>
                                                                    )}
                                                                    {winner.isSubscribed === 'private' && (
                                                                        <>
                                                                            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                                            <span className="text-yellow-600">{t.giveaway.subscribedPrivate}</span>
                                                                        </>
                                                                    )}
                                                                    {(winner.isSubscribed === undefined || winner.isSubscribed === null) && (
                                                                        <>
                                                                            <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                                                                            <span className="text-gray-400">{t.giveaway.checkingSubscription}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {winner.comment && (
                                                            <div className="ml-11 p-3 bg-white/60 rounded-lg text-sm text-gray-600 italic border-l-4 border-red-300">
                                                                &quot;{winner.comment}&quot;
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {backups.length > 0 && (
                                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                                <h3 className="font-bold text-gray-500 flex items-center gap-2">
                                                    <Users className="w-5 h-5" />
                                                    {t.giveaway.backups}
                                                </h3>
                                                {backups.map((backup, i) => (
                                                    <div key={i} className="px-4 py-3 bg-gray-50 rounded-lg flex flex-col justify-between text-gray-600 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${(winners.length + i) * 100}ms` }}>
                                                        <div className="flex items-center justify-between">
                                                            <span>{i + 1}. {backup.name}</span>
                                                            <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded text-gray-500">{t.giveaway.backups.slice(0, -1)}</span>
                                                        </div>
                                                        {backup.comment && <p className="text-xs text-gray-400 mt-1 truncate pl-4">&quot;{backup.comment}&quot;</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <AdWrapper position="inline">
                                            <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                                        </AdWrapper>

                                        <div className="flex flex-wrap gap-2 pt-4">
                                            <Button onClick={copyResults} variant="secondary" className="flex-1 min-w-[120px]">
                                                {copied ? t.giveaway.copied : t.giveaway.copyResults}
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    downloadWinnerCard({ giveawayName: giveawayName || t.giveaway.youtubeTitle, winners, backups, platform: "youtube" });
                                                    toast.success("Kazanan kartı indirildi!");
                                                }}
                                                variant="secondary"
                                                className="flex-1 min-w-[120px] border-red-200 text-red-600 hover:bg-red-50"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                PNG İndir
                                            </Button>
                                            <Button onClick={() => setShowShareModal(true)} className="flex-1 min-w-[120px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg">
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                                {t.giveaway.shareResults || "Paylaş"}
                                            </Button>
                                            <Button onClick={resetGiveaway} className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700">
                                                {t.giveaway.newGiveaway}
                                            </Button>
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
                        onClick={backToHome}
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        {t.result.backToHome}
                    </Button>
                </div>
            </div>
        </main>
    );
}
