"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
    Twitter,
    MessageCircle,
    Heart,
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
    Repeat2,
    Loader2,
    X,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type TabType = 'links' | 'rules' | 'participants';
type DrawType = 'retweets' | 'likes' | 'replies' | 'followers';

interface Participant {
    name: string;
    comment: string;
}

export default function TwitterGiveaway() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useLanguage();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('links');

    // Link & Draw settings
    const [tweetLink, setTweetLink] = useState("");
    const [drawType, setDrawType] = useState<DrawType>('retweets');

    // Rules/Settings
    const [giveawayName, setGiveawayName] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(0);
    const [requireFollow, setRequireFollow] = useState(true);
    const [requireRetweet, setRequireRetweet] = useState(true);
    const [requireLike, setRequireLike] = useState(false);
    const [requiredHashtags, setRequiredHashtags] = useState("");
    const [countUserOnce, setCountUserOnce] = useState(true);

    // Participants (Manual Entry)
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

    const addParticipant = () => {
        if (!newParticipant.trim()) return;
        const name = newParticipant.trim().replace(/^@/, '');
        if (participants.some(p => p.name === name)) {
            alert(t.home.nameExists);
            return;
        }
        setParticipants([...participants, { name, comment: 'Manual Entry' }]);
        setNewParticipant("");
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
        const colors = ['#1DA1F2', '#14171A', '#657786', '#AAB8C2', '#FFFFFF'];

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
            alert(t.home.notEnoughPeople);
            return;
        }

        setIsRolling(true);
        // Rolling animation
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * participants.length);
            setRollingParticipant(participants[randomIndex]);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);

            const shuffled = [...participants].sort(() => Math.random() - 0.5);
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
        const text = `🎉 ${giveawayName || t.giveaway.twitterTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w.name}`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b.name}`).join('\n')}` : ''}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen min-h-dvh flex flex-col items-center p-3 sm:p-4 pt-24 sm:pt-32 relative overflow-hidden bg-gradient-to-b from-sky-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 safe-area-inset-bottom transition-colors duration-300">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-sky-200 dark:bg-sky-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-blue-200 dark:bg-blue-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 translate-y-1/3" />

            {/* Manual Entry Modal */}


            <div className="z-10 w-full max-w-2xl space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-black rounded-xl sm:rounded-2xl shadow-lg">
                        <Twitter className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        {t.giveaway.twitterTitle}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm sm:text-base px-2">
                        {t.giveaway.twitterDesc}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden min-h-[400px]">
                    {/* Tab Navigation */}
                    <div className={`flex border-b border-gray-100 ${isRolling ? 'opacity-50 pointer-events-none' : ''}`}>
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'links'
                                ? 'text-sky-600 border-sky-500 bg-sky-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.links}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'rules'
                                ? 'text-sky-600 border-sky-500 bg-sky-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.rules}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'participants'
                                ? 'text-sky-600 border-sky-500 bg-sky-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.participants}</span>
                            {participants.length > 0 && (
                                <span className="ml-1 sm:ml-2 bg-sky-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
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
                                    <h3 className="text-xl font-bold text-gray-500">{t.giveaway.fetching || "Rolling..."}</h3>
                                    <div className="text-4xl sm:text-5xl font-black text-sky-600 tracking-tight transition-all scale-110">
                                        @{rollingParticipant?.name}
                                    </div>
                                    <p className="text-sm text-gray-400 max-w-sm mx-auto truncate px-4">
                                        {rollingParticipant?.comment}
                                    </p>
                                </div>
                                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                            </div>
                        )}

                        {/* NORMAL TABS */}
                        {!isRolling && (
                            <>
                                {/* Links Tab */}
                                {activeTab === 'links' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        {/* Tweet Link Input */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 focus-within:border-sky-300 transition-colors">
                                                <Twitter className="w-5 h-5 text-sky-500" />
                                                <input
                                                    type="text"
                                                    placeholder={t.giveaway.linkInputPlaceholder}
                                                    value={tweetLink}
                                                    onChange={(e) => setTweetLink(e.target.value)}
                                                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 text-center">
                                                {t.giveaway.twitterDesc}
                                            </p>
                                        </div>

                                        {/* Draw Type Selection */}
                                        <div className="flex flex-wrap gap-3 justify-center">
                                            <button
                                                onClick={() => setDrawType('retweets')}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'retweets'
                                                    ? 'bg-white border-2 border-green-400 text-green-600 shadow-md'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Repeat2 className="w-4 h-4" />
                                                {t.giveaway.retweets}
                                            </button>
                                            <button
                                                onClick={() => setDrawType('likes')}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'likes'
                                                    ? 'bg-white border-2 border-pink-400 text-pink-600 shadow-md'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Heart className="w-4 h-4" />
                                                {t.giveaway.likes}
                                            </button>
                                            <button
                                                onClick={() => setDrawType('replies')}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'replies'
                                                    ? 'bg-white border-2 border-sky-400 text-sky-600 shadow-md'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                {t.giveaway.replies}
                                            </button>
                                            <button
                                                onClick={() => setDrawType('followers')}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'followers'
                                                    ? 'bg-white border-2 border-gray-600 text-gray-700 shadow-md'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Users className="w-4 h-4" />
                                                {t.giveaway.followers}
                                            </button>
                                        </div>

                                        {/* Navigate to Rules */}
                                        <div className="pt-4 flex justify-end">
                                            <Button
                                                onClick={() => setActiveTab('rules')}
                                                className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg"
                                            >
                                                {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Rules Tab */}
                                {activeTab === 'rules' && !showResults && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        {/* Giveaway Name */}
                                        <div className="text-center space-y-2">
                                            <label className="text-sm font-bold text-gray-600 flex items-center justify-center gap-1">
                                                {t.giveaway.giveawayName}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Giveaway"
                                                value={giveawayName}
                                                onChange={(e) => setGiveawayName(e.target.value)}
                                                className="w-full max-w-md mx-auto block text-center py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-sky-400 outline-none transition-colors"
                                            />
                                        </div>

                                        {/* Winner Counts */}
                                        <div className="flex justify-center gap-8">
                                            <div className="text-center space-y-2">
                                                <label className="text-sm font-bold text-gray-600 flex items-center justify-center gap-1">
                                                    {t.giveaway.winnerCount}
                                                </label>
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                                    <button onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))} className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-12 text-center font-bold text-xl">{winnerCount}</span>
                                                    <button onClick={() => setWinnerCount(winnerCount + 1)} className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <label className="text-sm font-bold text-gray-600 flex items-center justify-center gap-1">
                                                    {t.giveaway.backupCount}
                                                </label>
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                                    <button onClick={() => setBackupCount(Math.max(0, backupCount - 1))} className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-12 text-center font-bold text-xl">{backupCount}</span>
                                                    <button onClick={() => setBackupCount(backupCount + 1)} className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="space-y-3 max-w-md mx-auto">
                                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-sky-500" />
                                                    {t.giveaway.requireFollow}
                                                </span>
                                                <button onClick={() => setRequireFollow(!requireFollow)} className={`w-12 h-7 rounded-full transition-colors relative ${requireFollow ? 'bg-sky-500' : 'bg-gray-300'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireFollow ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Repeat2 className="w-4 h-4 text-green-500" />
                                                    {t.giveaway.requireRetweet}
                                                </span>
                                                <button onClick={() => setRequireRetweet(!requireRetweet)} className={`w-12 h-7 rounded-full transition-colors relative ${requireRetweet ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireRetweet ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Heart className="w-4 h-4 text-pink-500" />
                                                    {t.giveaway.requireLike}
                                                </span>
                                                <button onClick={() => setRequireLike(!requireLike)} className={`w-12 h-7 rounded-full transition-colors relative ${requireLike ? 'bg-pink-500' : 'bg-gray-300'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireLike ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    {t.giveaway.countUserOnce}
                                                </span>
                                                <button onClick={() => setCountUserOnce(!countUserOnce)} className={`w-12 h-7 rounded-full transition-colors relative ${countUserOnce ? 'bg-sky-500' : 'bg-gray-300'}`}>
                                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </label>
                                        </div>

                                        {/* Required Hashtags */}
                                        <div className="max-w-md mx-auto space-y-2">
                                            <label className="text-sm font-bold text-gray-600 flex items-center gap-1">
                                                {t.giveaway.tags} (Hashtags)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="#cekilisvar #giveaway"
                                                value={requiredHashtags}
                                                onChange={(e) => setRequiredHashtags(e.target.value)}
                                                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-sky-400 outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="pt-4 flex justify-between items-center gap-4">
                                            <Button onClick={() => setActiveTab('links')} variant="ghost" className="text-gray-500">← {t.common.cancel}</Button>

                                            <div className="flex gap-4">
                                                <Button onClick={() => setActiveTab('participants')} variant="secondary" className="text-gray-600">
                                                    {t.giveaway.participants} ({participants.length})
                                                </Button>

                                                <Button onClick={startGiveaway} disabled={participants.length < winnerCount + backupCount} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-200">
                                                    <Play className="w-5 h-5 mr-2" fill="currentColor" /> {t.giveaway.startGiveaway}
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
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-600">
                                                    {t.giveaway.participants} ({participants.length})
                                                </label>
                                                <div className="flex gap-2 relative">
                                                    <button
                                                        onClick={() => setShowManualEntry(!showManualEntry)}
                                                        className="text-xs bg-sky-50 text-sky-600 font-bold px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-1 active:scale-95 duration-75"
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
                                                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-2 border border-gray-200 focus-within:border-sky-300 transition-colors">
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
                                                                        <Button onClick={addParticipant} size="sm" className="bg-sky-500 hover:bg-sky-600 h-9 w-9 p-0 rounded-lg">
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
                                                                        placeholder="@user1&#10;@user2&#10;@user3"
                                                                        value={bulkInput}
                                                                        onChange={(e) => setBulkInput(e.target.value)}
                                                                        className="w-full h-24 p-3 text-sm rounded-lg border border-gray-200 focus:border-sky-300 outline-none resize-none bg-gray-50"
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
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                                                        <Users className="w-8 h-8 opacity-20 mb-2" />
                                                        <p className="text-sm opacity-60">{t.home.noParticipants}</p>
                                                    </div>
                                                ) : (
                                                    participants.map((p, i) => (
                                                        <div key={i} className="flex flex-col p-3 bg-white rounded-xl shadow-sm border border-gray-100 group hover:border-sky-200 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-gray-700">@{p.name}</span>
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
                                            <Button onClick={() => setActiveTab('rules')} className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg">
                                                {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Results */}
                                {showResults && (
                                    <div className="space-y-6 animate-in zoom-in duration-500">
                                        <div className="text-center space-y-2">
                                            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl">
                                                <Trophy className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-black text-gray-900">
                                                🎉 {giveawayName || t.giveaway.twitterTitle} {t.giveaway.results}
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            {winners.map((winner, i) => (
                                                <div key={i} className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <div className="flex flex-col gap-2">
                                                        <span className="font-bold text-gray-800 text-lg">@{winner.name}</span>
                                                        {winner.comment && winner.comment !== 'Manual Entry' && (
                                                            <p className="text-sm text-gray-600 italic">&quot;{winner.comment}&quot;</p>
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
                                                            <span>{i + 1}. @{backup.name}</span>
                                                            <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded text-gray-500">{t.giveaway.backups.slice(0, -1)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-4">
                                            <Button onClick={copyResults} variant="secondary" className="flex-1">{copied ? t.giveaway.copied : t.giveaway.copyResults}</Button>
                                            <Button onClick={resetGiveaway} className="flex-1 bg-sky-600 hover:bg-sky-700">{t.giveaway.newGiveaway}</Button>
                                        </div>
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
