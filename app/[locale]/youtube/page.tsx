"use client";

import { useState } from "react";
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
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type TabType = 'links' | 'rules' | 'participants';
type DrawType = 'comments' | 'likes' | 'subscribers';

export default function YouTubeGiveaway() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useLanguage();

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

    // Participants (Manual Entry)
    const [participants, setParticipants] = useState<string[]>([]);
    const [newParticipant, setNewParticipant] = useState("");
    const [bulkInput, setBulkInput] = useState("");

    // Results
    const [winners, setWinners] = useState<string[]>([]);
    const [backups, setBackups] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractVideoId = (url: string) => {
        // Updated regex to support shorts
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[8].length === 11) ? match[8] : null;
    };

    const fetchComments = async () => {
        setError(null);
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            setError(t.giveaway.inputError || "Invalid link");
            return;
        }

        setLoading(true);
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

            const unique = [...new Set([...participants, ...data.participants])];
            setParticipants(unique);
            setActiveTab('participants');
            // alert(`${data.participants.length} ${t.home.namesAdded}`); // Optional: show success toast

        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setLoading(false);
        }
    };

    const addParticipant = () => {
        if (!newParticipant.trim()) return;
        const name = newParticipant.trim().replace(/^@/, '');
        if (participants.includes(name)) {
            alert(t.home.nameExists);
            return;
        }
        setParticipants([...participants, name]);
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

        const unique = [...new Set([...participants, ...names])];
        setParticipants(unique);
        setBulkInput("");
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
            alert(t.home.notEnoughPeople);
            return;
        }

        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        const selectedWinners = shuffled.slice(0, winnerCount);
        const selectedBackups = shuffled.slice(winnerCount, winnerCount + backupCount);

        setWinners(selectedWinners);
        setBackups(selectedBackups);
        setShowResults(true);
        triggerConfetti();
    };

    const resetGiveaway = () => {
        setWinners([]);
        setBackups([]);
        setShowResults(false);
    };

    const copyResults = () => {
        const text = `🎉 ${giveawayName || t.giveaway.youtubeTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. ${w}`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. ${b}`).join('\n')}` : ''}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen min-h-dvh flex flex-col items-center p-3 sm:p-4 relative overflow-hidden bg-gradient-to-b from-red-50 via-gray-50 to-white safe-area-inset-bottom">
            <div className="absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-red-200 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-gray-200 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 translate-y-1/3" />

            <div className="z-10 w-full max-w-2xl space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-red-600 rounded-xl sm:rounded-2xl shadow-lg">
                        <Youtube className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        {t.giveaway.youtubeTitle}
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base px-2">
                        {t.giveaway.youtubeDesc}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'links'
                                ? 'text-red-600 border-red-500 bg-red-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.links}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'rules'
                                ? 'text-red-600 border-red-500 bg-red-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.rules}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all border-b-2 ${activeTab === 'participants'
                                ? 'text-red-600 border-red-500 bg-red-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline sm:inline">{t.giveaway.participants}</span>
                            {participants.length > 0 && (
                                <span className="ml-1 sm:ml-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                                    {participants.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Links Tab */}
                        {activeTab === 'links' && !showResults && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 focus-within:border-red-300 transition-colors">
                                            <Youtube className="w-5 h-5 text-red-500" />
                                            <input
                                                type="text"
                                                placeholder={t.giveaway.linkInputPlaceholder}
                                                value={videoLink}
                                                onChange={(e) => setVideoLink(e.target.value)}
                                                className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                            />
                                        </div>
                                        <Button
                                            onClick={fetchComments}
                                            disabled={loading || !videoLink}
                                            className="h-auto px-6 bg-red-600 hover:bg-red-700 text-white shadow-lg whitespace-nowrap"
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
                                    <p className="text-xs text-gray-400 text-center">
                                        {t.giveaway.youtubeDesc}
                                    </p>
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center animate-in slide-in-from-top-2">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Draw Type Selection */}
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <button
                                        onClick={() => setDrawType('comments')}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'comments'
                                            ? 'bg-white border-2 border-red-400 text-red-600 shadow-md'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        {t.giveaway.comments}
                                    </button>
                                    <button
                                        onClick={() => setDrawType('likes')}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'likes'
                                            ? 'bg-white border-2 border-blue-400 text-blue-600 shadow-md'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        {t.giveaway.likes}
                                    </button>
                                    <button
                                        onClick={() => setDrawType('subscribers')}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'subscribers'
                                            ? 'bg-white border-2 border-gray-600 text-gray-700 shadow-md'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Bell className="w-4 h-4" />
                                        {t.giveaway.subscribers}
                                    </button>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        onClick={() => setActiveTab('rules')}
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                    >
                                        {t.giveaway.rules} <Settings className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Rules Tab */}
                        {activeTab === 'rules' && !showResults && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <label className="text-sm font-bold text-gray-600 flex items-center justify-center gap-1">
                                        {t.giveaway.giveawayName}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Giveaway"
                                        value={giveawayName}
                                        onChange={(e) => setGiveawayName(e.target.value)}
                                        className="w-full max-w-md mx-auto block text-center py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-red-400 outline-none transition-colors"
                                    />
                                </div>

                                <div className="flex justify-center gap-8">
                                    <div className="text-center space-y-2">
                                        <label className="text-sm font-bold text-gray-600 flex items-center justify-center gap-1">
                                            {t.giveaway.winnerCount}
                                        </label>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                            <button
                                                onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))}
                                                className="w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-bold text-xl">{winnerCount}</span>
                                            <button
                                                onClick={() => setWinnerCount(winnerCount + 1)}
                                                className="w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <label className="text-sm font-bold text-gray-600 flex items-center justify-center gap-1">
                                            {t.giveaway.backupCount}
                                        </label>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                            <button
                                                onClick={() => setBackupCount(Math.max(0, backupCount - 1))}
                                                className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-bold text-xl">{backupCount}</span>
                                            <button
                                                onClick={() => setBackupCount(backupCount + 1)}
                                                className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 max-w-md mx-auto">
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-red-500" />
                                            {t.giveaway.requireSubscription}
                                        </span>
                                        <button
                                            onClick={() => setRequireSubscription(!requireSubscription)}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${requireSubscription ? 'bg-red-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireSubscription ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </label>

                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            🔔 {t.giveaway.requireNotification}
                                        </span>
                                        <button
                                            onClick={() => setRequireNotification(!requireNotification)}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${requireNotification ? 'bg-red-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireNotification ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </label>

                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            {t.giveaway.countUserOnce}
                                        </span>
                                        <button
                                            onClick={() => setCountUserOnce(!countUserOnce)}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${countUserOnce ? 'bg-red-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <Button
                                        onClick={() => setActiveTab('links')}
                                        variant="ghost"
                                        className="text-gray-500"
                                    >
                                        ← {t.common.cancel}
                                    </Button>
                                    <Button
                                        onClick={() => setActiveTab('participants')}
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                    >
                                        {t.giveaway.participants} <Users className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Participants Tab */}
                        {activeTab === 'participants' && !showResults && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t.giveaway.addParticipant}</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 border-2 border-gray-200 focus-within:border-red-300 transition-colors">
                                            <AtSign className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={t.home.inputPlaceholder}
                                                value={newParticipant}
                                                onChange={(e) => setNewParticipant(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                                                className="flex-1 bg-transparent outline-none py-3 text-gray-700 placeholder:text-gray-400"
                                            />
                                        </div>
                                        <Button onClick={addParticipant} className="bg-red-500 hover:bg-red-600">
                                            <Plus className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">
                                        {t.giveaway.bulkAdd}
                                    </label>
                                    <textarea
                                        placeholder="User1&#10;User2&#10;User3"
                                        value={bulkInput}
                                        onChange={(e) => setBulkInput(e.target.value)}
                                        className="w-full h-32 p-4 rounded-xl border-2 border-gray-200 focus:border-red-300 outline-none resize-none transition-colors"
                                    />
                                    <Button onClick={handleBulkAdd} variant="secondary" className="w-full">
                                        {t.giveaway.bulkAdd}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-600">
                                            {t.giveaway.participants} ({participants.length})
                                        </label>
                                        {participants.length > 0 && (
                                            <button
                                                onClick={() => setParticipants([])}
                                                className="text-xs text-red-500 hover:text-red-600 font-medium"
                                            >
                                                {t.giveaway.clearAll}
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {participants.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>{t.home.noParticipants}</p>
                                            </div>
                                        ) : (
                                            participants.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-red-50 transition-colors">
                                                    <span className="font-medium text-gray-700">{p}</span>
                                                    <button
                                                        onClick={() => removeParticipant(i)}
                                                        className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={startGiveaway}
                                        disabled={participants.length < winnerCount + backupCount}
                                        className="w-full py-4 text-lg bg-red-600 hover:bg-red-700 shadow-lg"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        {t.giveaway.startGiveaway}
                                    </Button>

                                    {participants.length > 0 && participants.length < winnerCount + backupCount && (
                                        <p className="text-center text-sm text-red-500 mt-2">
                                            {t.home.notEnoughPeople}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Results */}
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

                                {/* Winners */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        {t.giveaway.winners}
                                    </h3>
                                    {winners.map((winner, i) => (
                                        <div key={i} className="p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl border border-red-200 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-bold text-sm">
                                                    {i + 1}
                                                </span>
                                                <span className="font-bold text-gray-800 text-lg">{winner}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Backups */}
                                {backups.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <h3 className="font-bold text-gray-500 flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            {t.giveaway.backups}
                                        </h3>
                                        {backups.map((backup, i) => (
                                            <div key={i} className="px-4 py-2 bg-gray-50 rounded-lg flex items-center justify-between text-gray-600 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${(winners.length + i) * 100}ms` }}>
                                                <span>{i + 1}. {backup}</span>
                                                <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded text-gray-500">{t.giveaway.backups.slice(0, -1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={copyResults} variant="secondary" className="flex-1">
                                        {copied ? t.giveaway.copied : t.giveaway.copyResults}
                                    </Button>
                                    <Button onClick={resetGiveaway} className="flex-1 bg-red-600 hover:bg-red-700">
                                        {t.giveaway.newGiveaway}
                                    </Button>
                                </div>
                            </div>
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
