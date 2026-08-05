"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
    Instagram,
    MessageCircle,
    Heart,
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
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";

type TabType = 'links' | 'rules' | 'participants';
type DrawType = 'comments' | 'likes' | 'tags';

interface Participant {
    name: string;
    comment: string;
}

export default function InstagramGiveaway() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useLanguage();
    const { toast } = useToast();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('links');

    // Link & Draw settings
    const [mode, setMode] = useState<'manual' | 'auto' | null>(null);
    const [manualPaste, setManualPaste] = useState("");
    const [postLink, setPostLink] = useState("");
    const [drawType, setDrawType] = useState<DrawType>('comments');

    // Rules/Settings
    const [giveawayName, setGiveawayName] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(0);
    const [requireFollow, setRequireFollow] = useState(true);
    const [countUserOnce, setCountUserOnce] = useState(true);

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

    const handleManualParse = () => {
        if (!manualPaste.trim()) return;

        const lines = manualPaste.split('\n');
        const extracted: Participant[] = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            let possibleName = trimmed.split(':')[0].trim();
            possibleName = possibleName.replace(/^@/, '');

            if (possibleName.length > 0 && possibleName.length <= 30 && !possibleName.includes(' ')) {
                extracted.push({ name: possibleName, comment: trimmed.substring(possibleName.length + 1).trim() || 'Manual Entry' });
            }
        });

        const existingNames = new Set(participants.map(p => p.name));
        const unique = [...participants];

        extracted.forEach(p => {
            if (!existingNames.has(p.name)) {
                unique.push(p);
                existingNames.add(p.name);
            }
        });

        setParticipants(unique);
        setManualPaste("");
        setActiveTab('rules');
    };

    const fetchInstagramComments = async () => {
        setError(null);
        if (!postLink.trim()) {
            toast.warning("Lütfen bir Instagram post linki girin");
            return;
        }
        if (!postLink.includes('instagram.com')) {
            toast.error("Geçerli bir Instagram post linki giriniz (instagram.com/p/...)");
            return;
        }

        setLoading(true);
        const steps = [
            "Instagram'a bağlanılıyor...",
            "Yorumlar çekiliyor...",
            "Katılımcılar analiz ediliyor...",
            "Veriler hazırlanıyor...",
        ];
        let stepIdx = 0;
        setLoadingStep(steps[0]);
        const stepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            setLoadingStep(steps[stepIdx]);
        }, 5000);

        try {
            const response = await fetch('/api/instagram/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postLink }),
            });

            const text = await response.text();
            let data;
            try {
                const normalized = text.replace(/^\s*for\s*\(\s*;\s*;\s*\)\s*;?\s*/i, '');
                data = JSON.parse(normalized);
            } catch {
                throw new Error(text || t.giveaway.fetchError);
            }

            if (!response.ok) {
                throw new Error(data.error || t.giveaway.fetchError);
            }

            const newParticipants = data.participants as Participant[];
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
            console.error('Fetch error:', err);
            const raw = err instanceof Error ? err.message : String(err);
            const friendly = raw.includes('token') || raw.includes('API') || raw.includes('configuration')
                ? 'Servis şu anda kullanılamıyor, lütfen daha sonra deneyin'
                : raw.includes('private') || raw.includes('not found') || raw.includes('404')
                ? 'Bu hesap gizli veya post bulunamadı'
                : raw.includes('timeout') || raw.includes('ETIMEDOUT') || raw.includes('network')
                ? 'Bağlantı zaman aşımına uğradı, lütfen tekrar deneyin'
                : 'Yorumlar çekilemedi — post linkini kontrol edin';
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

        const colors = ['#C13584', '#E1306C', '#FD1D1D', '#F56040'];

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

        // Rolling animation
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
        }, 3000);
    };

    const resetGiveaway = () => {
        setWinners([]);
        setBackups([]);
        setShowResults(false);
        setActiveTab('links');
    };

    const copyResults = () => {
        const text = `🎉 ${giveawayName || t.giveaway.instagramTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w.name} - "${w.comment}"`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b.name}`).join('\n')}` : ''}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Sonuçlar panoya kopyalandı!");
        setTimeout(() => setCopied(false), 2000);
    };

    const getShareText = () => {
        return `🎉 ${giveawayName || t.giveaway.instagramTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w.name}`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b.name}`).join('\n')}` : ''}\n\n🎰 www.yulasanta.com.tr`;
    };

    return (
        <main className="ys-page-shell flex flex-col items-center p-3 sm:p-4 pt-24 sm:pt-32 relative overflow-hidden safe-area-inset-bottom transition-colors duration-300">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-purple-200 dark:bg-purple-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-pink-200 dark:bg-pink-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 translate-y-1/3" />

            {/* Manual Entry Modal */}


            <div className="z-10 w-full max-w-2xl space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                        <Instagram className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] dark:text-white tracking-tight">
                        {t.giveaway.instagramTitle}
                    </h1>
                    <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] max-w-lg mx-auto text-sm sm:text-base px-2">
                        {t.giveaway.instagramDesc}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3 mt-6 text-sm text-left sm:text-center">
                        <div className="rounded-3xl bg-white/90 dark:bg-white/5 border border-[var(--border-medium)] dark:border-white/10 p-4 shadow-sm">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold">1</span>
                            <p className="mt-3 text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Instagram gönderi linkini yapıştır veya manuel ekle.</p>
                        </div>
                        <div className="rounded-3xl bg-white/90 dark:bg-white/5 border border-[var(--border-medium)] dark:border-white/10 p-4 shadow-sm">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold">2</span>
                            <p className="mt-3 text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Katılımcıları topla, gereksinimleri ayarla, adil bir çekiliş yap.</p>
                        </div>
                        <div className="rounded-3xl bg-white/90 dark:bg-white/5 border border-[var(--border-medium)] dark:border-white/10 p-4 shadow-sm">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold">3</span>
                            <p className="mt-3 text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Kazananları anında seç ve sonuçları paylaş.</p>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/90 dark:bg-[var(--card-bg)] backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden min-h-[400px]">
                    {/* Tab Navigation */}
                    <div className={`flex border-b border-[var(--border-light)] ${isRolling ? 'opacity-50 pointer-events-none' : ''}`}>
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'links'
                                ? 'text-pink-600 border-pink-500 bg-pink-50/50'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.links}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'rules'
                                ? 'text-pink-600 border-pink-500 bg-pink-50/50'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.rules}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'participants'
                                ? 'text-pink-600 border-pink-500 bg-pink-50/50'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.participants}</span>
                            {participants.length > 0 && (
                                <span className="ml-1 sm:ml-2 bg-pink-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
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
                                    <div className="text-4xl sm:text-5xl font-black text-pink-600 tracking-tight transition-all scale-110">
                                        @{rollingParticipant?.name}
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto truncate px-4">
                                        {rollingParticipant?.comment}
                                    </p>
                                </div>
                                <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
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
                                                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-pink-950/50 dark:via-[var(--card-bg)] dark:to-purple-950/40 border border-pink-200 dark:border-pink-500/30 rounded-3xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                                >
                                                    <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-lg mb-4 text-pink-600 dark:text-pink-400">
                                                        <Users className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t.giveaway.manualMode}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{t.giveaway.manualDesc}</p>
                                                </button>

                                                <button
                                                    onClick={() => setMode('auto')}
                                                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-pink-950/50 dark:via-[var(--card-bg)] dark:to-purple-950/40 border border-pink-200 dark:border-pink-500/30 rounded-3xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                                >
                                                    <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-lg mb-4 text-pink-600 dark:text-pink-400">
                                                        <Instagram className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t.giveaway.autoMode}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{t.giveaway.autoDesc}</p>
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
                                                            onChange={(e) => setManualPaste(e.target.value)}
                                                            placeholder={t.giveaway.pasteComments}
                                                            className="w-full h-48 p-4 rounded-xl border-2 border-dashed border-[var(--border-medium)] focus:border-pink-300 outline-none resize-none bg-[var(--surface-2)]"
                                                        />
                                                        <Button onClick={handleManualParse} disabled={!manualPaste.trim()} className="w-full bg-pink-600 hover:bg-pink-700">
                                                            {t.giveaway.parse}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {/* Post Link Input */}
                                                        <div className="space-y-3">
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 flex items-center gap-2 bg-[var(--surface-2)] rounded-xl p-4 border-2 border-dashed border-[var(--border-medium)] focus-within:border-pink-300 transition-colors">
                                                                    <Instagram className="w-5 h-5 text-pink-500" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder={t.giveaway.linkInputPlaceholder}
                                                                        value={postLink}
                                                                        onChange={(e) => setPostLink(e.target.value)}
                                                                        className="flex-1 bg-transparent outline-none text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    onClick={fetchInstagramComments}
                                                                    disabled={loading}
                                                                    className="h-auto px-6 bg-pink-600 hover:bg-pink-700 text-white shadow-lg whitespace-nowrap"
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
                                                            <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl animate-in fade-in">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin flex-shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-pink-700">{loadingStep}</p>
                                                                        <p className="text-xs text-pink-400 mt-0.5">Bu işlem 20-60 saniye sürebilir, lütfen bekleyin</p>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 w-full bg-pink-100 rounded-full h-1 overflow-hidden">
                                                                    <div className="h-full w-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full origin-left animate-[pulse_2s_ease-in-out_infinite]" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {error && !loading && (
                                                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                                                                <span className="text-lg leading-none">⚠️</span>
                                                                <span>{error}</span>
                                                            </div>
                                                        )}

                                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 space-y-2">
                                                            <h4 className="font-bold flex items-center gap-2">
                                                                <span className="text-xl">ℹ️</span>
                                                                {t.giveaway.instagramLimitNote}
                                                            </h4>
                                                            <p className="opacity-90">
                                                                {t.giveaway.participantLimitDetails}
                                                            </p>
                                                        </div>

                                                        {/* Draw Type Selection */}
                                                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                                                            <button
                                                                onClick={() => setDrawType('comments')}
                                                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'comments'
                                                                    ? 'bg-pink-100 border border-pink-300 text-pink-600 shadow-sm'
                                                                    : 'bg-white border border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-pink-50'
                                                                    }`}
                                                            >
                                                                <MessageCircle className="w-4 h-4 text-pink-600" />
                                                                {t.giveaway.comments}
                                                            </button>
                                                            <div className="relative opacity-60 cursor-not-allowed max-w-full sm:max-w-max">
                                                                <div className="flex items-center gap-2 px-5 py-3 rounded-full font-medium bg-[var(--surface-2)] text-[var(--text-muted)] select-none">
                                                                    <Heart className="w-4 h-4" />
                                                                    {t.giveaway.likes}
                                                                </div>
                                                                <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[var(--text-muted)] text-white px-1.5 py-0.5 rounded-full leading-none">{t.giveaway.comingSoon}</span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 flex justify-end">
                                                            <Button
                                                                onClick={() => setActiveTab('rules')}
                                                                className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
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
                                                placeholder="Instagram Giveaway"
                                                value={giveawayName}
                                                onChange={(e) => setGiveawayName(e.target.value)}
                                                className="w-full max-w-md mx-auto block text-center py-3 px-4 rounded-xl border-2 border-[var(--border-medium)] focus:border-pink-400 outline-none transition-colors"
                                            />
                                        </div>

                                        {/* Winner Counts */}
                                        <div className="flex justify-center gap-8">
                                            <div className="text-center space-y-2">
                                                <label className="text-sm font-bold text-[var(--text-secondary)]">{t.giveaway.winnerCount}</label>
                                                <div className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl p-2">
                                                    <button onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))} className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-12 text-center font-bold text-xl">{winnerCount}</span>
                                                    <button onClick={() => setWinnerCount(winnerCount + 1)} className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
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
                                                    <Users className="w-4 h-4 text-pink-500" />
                                                    {t.giveaway.requireFollow}
                                                </span>
                                                <button onClick={() => setRequireFollow(!requireFollow)} className={`w-12 h-7 rounded-full transition-colors relative ${requireFollow ? 'bg-pink-500' : 'bg-[var(--text-muted)]'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireFollow ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
                                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                                    {t.giveaway.countUserOnce}
                                                </span>
                                                <button onClick={() => setCountUserOnce(!countUserOnce)} className={`w-12 h-7 rounded-full transition-colors relative ${countUserOnce ? 'bg-pink-500' : 'bg-[var(--text-muted)]'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                        </div>

                                        <div className="pt-4 flex justify-between items-center gap-4">
                                            <Button onClick={() => setActiveTab('links')} variant="ghost" className="text-[var(--text-muted)]">← {t.common.cancel}</Button>

                                            <div className="flex gap-4">
                                                <Button onClick={() => setActiveTab('participants')} variant="secondary" className="text-[var(--text-secondary)]">
                                                    {t.giveaway.participants} ({participants.length})
                                                </Button>

                                                <Button onClick={startGiveaway} disabled={participants.length < winnerCount + backupCount} className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-200">
                                                    <Play className="w-5 h-5 mr-2" /> {t.giveaway.startGiveaway}
                                                </Button>
                                            </div>
                                        </div>
                                        {participants.length < winnerCount + backupCount && (
                                            <p className="text-center text-sm text-red-500 font-medium bg-red-50 py-2 rounded-lg mt-2">
                                                ⚠️ {t.home.notEnoughPeople}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Participants Tab */}
                                {activeTab === 'participants' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        {/* List */}
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <label className="text-sm font-bold text-[var(--text-secondary)]">{t.giveaway.participants} ({participants.length})</label>
                                                <div className="flex flex-wrap gap-2 items-center relative">
                                                    <button
                                                        onClick={() => setShowManualEntry(!showManualEntry)}
                                                        className="w-full sm:w-auto text-xs bg-pink-50 text-pink-600 font-bold px-4 py-2 rounded-full hover:bg-pink-100 transition-colors flex items-center gap-2 justify-center active:scale-95 duration-75"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        {t.giveaway.addParticipant || "Katılımcı Ekle"}
                                                        {showManualEntry ? <X className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
                                                                        <div className="flex-1 flex items-center gap-2 bg-[var(--surface-2)] rounded-lg px-2 border border-[var(--border-medium)] focus-within:border-pink-300 transition-colors">
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
                                                                        <Button onClick={addParticipant} size="sm" className="bg-pink-500 hover:bg-pink-600 h-9 w-9 p-0 rounded-lg">
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
                                                                        className="w-full h-24 p-3 text-sm rounded-lg border border-[var(--border-medium)] focus:border-pink-300 outline-none resize-none bg-[var(--surface-2)]"
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
                                                        <div className="p-4 bg-pink-50 rounded-2xl">
                                                            <Users className="w-10 h-10 text-pink-200" />
                                                        </div>
                                                        <div className="text-center space-y-1">
                                                            <p className="text-sm font-semibold text-[var(--text-muted)]">{t.giveaway.noParticipantsYet}</p>
                                                            <p className="text-xs text-[var(--text-muted)] max-w-[200px] mx-auto">{t.giveaway.instagramNoParticipantsHint}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setActiveTab('links')}
                                                            className="text-xs bg-pink-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                                                        >
                                                            {t.giveaway.fetchFromPost}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    participants.map((p, i) => (
                                                        <div key={i} className="flex flex-col p-3 bg-white rounded-xl shadow-sm border border-[var(--border-light)] group hover:border-pink-200 transition-colors">
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
                                            <Button onClick={() => setActiveTab('rules')} className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg">
                                                {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Results */}
                                {showResults && (
                                    <div className="space-y-6 animate-in zoom-in duration-500">
                                        <div className="text-center space-y-2">
                                            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-xl">
                                                <Trophy className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-black text-[var(--text-primary)]">
                                                🎉 {giveawayName || t.giveaway.instagramTitle} {t.giveaway.results}
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            {winners.map((winner, i) => (
                                                <div key={i} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/40 dark:to-purple-950/30 rounded-3xl border border-pink-200 dark:border-pink-500/30 shadow-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                                    {i + 1}
                                                                </span>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 dark:text-white text-lg">@{winner.name}</p>
                                                                    {winner.comment && (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">"{winner.comment}"</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-white/10 text-pink-600 dark:text-pink-300 text-xs font-semibold border border-pink-100 dark:border-pink-500/30">
                                                                <Trophy className="w-3.5 h-3.5" />
                                                                Winner
                                                            </span>
                                                        </div>
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

                                        <AdWrapper position="inline">
                                            <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                                        </AdWrapper>

                                        <div className="flex flex-wrap gap-2 pt-4">
                                            <Button onClick={copyResults} variant="secondary" className="flex-1 min-w-[120px]">{copied ? t.giveaway.copied : t.giveaway.copyResults}</Button>
                                            <Button
                                                onClick={() => {
                                                    downloadWinnerCard({ giveawayName: giveawayName || t.giveaway.instagramTitle, winners, backups, platform: "instagram" });
                                                    toast.success("Kazanan kartı indirildi!");
                                                }}
                                                variant="secondary"
                                                className="flex-1 min-w-[120px] border-pink-200 text-pink-600 hover:bg-pink-50"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                PNG İndir
                                            </Button>
                                            <Button onClick={() => setShowShareModal(true)} className="flex-1 min-w-[120px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                                {t.giveaway.shareResults || "Paylaş"}
                                            </Button>
                                            <Button onClick={resetGiveaway} className="flex-1 min-w-[120px] bg-pink-600 hover:bg-pink-700">{t.giveaway.newGiveaway}</Button>
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
