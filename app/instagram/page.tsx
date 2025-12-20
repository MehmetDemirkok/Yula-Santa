"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type TabType = 'links' | 'rules' | 'participants';
type DrawType = 'comments' | 'likes' | 'tags';

export default function InstagramGiveaway() {
    const router = useRouter();
    const { t } = useLanguage();

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
    const [participants, setParticipants] = useState<string[]>([]);
    const [newParticipant, setNewParticipant] = useState("");
    const [bulkInput, setBulkInput] = useState("");

    // Results
    const [winners, setWinners] = useState<string[]>([]);
    const [backups, setBackups] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleManualParse = () => {
        if (!manualPaste.trim()) return;

        // Simple parser: assumes "username: comment" or just "username"
        // Also handles copies from web which might be "username\ncomment" by looking for lines that don't look like comments (heuristics could be improved)
        // For now, let's treat every line as a potential entry, taking the first part before a colon

        const lines = manualPaste.split('\n');
        const extractedNames: string[] = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // If it contains a colon, assume "username: comment"
            // If not, assume it might be a username if it's short (e.g. < 30 chars) and doesn't contain spaces (usernames usually don't)

            let possibleName = trimmed.split(':')[0].trim();

            // Remove @
            possibleName = possibleName.replace(/^@/, '');

            // Basic validation for username (alphanumeric, dot, underscore)
            // Instagram usernames are limited to 30 chars
            if (possibleName.length > 0 && possibleName.length <= 30 && !possibleName.includes(' ')) {
                extractedNames.push(possibleName);
            }
        });

        const unique = [...new Set([...participants, ...extractedNames])];
        setParticipants(unique);
        setManualPaste("");
        // alert(t.giveaway.parsed.replace('{count}', (unique.length - participants.length).toString()));
        alert(`${unique.length - participants.length} added`);
        setActiveTab('participants');
    };

    const fetchInstagramComments = async () => {
        if (!postLink) {
            alert(t.giveaway.inputError);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/instagram/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postLink }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If 500 and message about TOKEN, show specific help?
                // For now, generic error
                throw new Error(data.error || t.giveaway.fetchError);
            }

            const unique = [...new Set([...participants, ...data.participants])];
            setParticipants(unique);
            setActiveTab('participants');
        } catch (error: any) {
            console.error('Fetch error:', error);
            alert(error.message || t.giveaway.fetchError);
        } finally {
            setLoading(false);
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
        const text = `🎉 ${giveawayName || t.giveaway.instagramTitle} ${t.giveaway.results}\n\n🏆 ${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. @${w}`).join('\n')}${backups.length > 0 ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. @${b}`).join('\n')}` : ''}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden bg-gradient-to-b from-purple-50 via-pink-50 to-white">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 rounded-full blur-[120px] opacity-40 translate-x-1/3 translate-y-1/3" />

            <div className="z-10 w-full max-w-2xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-4 pt-8">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl shadow-lg">
                        <Instagram className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        {t.giveaway.instagramTitle}
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        {t.giveaway.instagramDesc}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'links'
                                ? 'text-pink-600 border-pink-500 bg-pink-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Link2 className="w-4 h-4" />
                            {t.giveaway.links}
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'rules'
                                ? 'text-pink-600 border-pink-500 bg-pink-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            {t.giveaway.rules}
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'participants'
                                ? 'text-pink-600 border-pink-500 bg-pink-50/50'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            {t.giveaway.participants}
                            {participants.length > 0 && (
                                <span className="ml-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {participants.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Links/Method Tab */}
                        {activeTab === 'links' && !showResults && (
                            <div className="space-y-6">

                                {!mode ? (
                                    // Mode Selection
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setMode('manual')}
                                            className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-pink-50 border-2 border-dashed border-gray-200 hover:border-pink-300 rounded-2xl transition-all group"
                                        >
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform text-pink-500">
                                                <Users className="w-8 h-8" />
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{t.giveaway.manualMode}</h3>
                                            <p className="text-sm text-gray-500 text-center">{t.giveaway.manualDesc}</p>
                                        </button>

                                        <button
                                            onClick={() => setMode('auto')}
                                            className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-pink-50 border-2 border-dashed border-gray-200 hover:border-pink-300 rounded-2xl transition-all group"
                                        >
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform text-pink-500">
                                                <Instagram className="w-8 h-8" />
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{t.giveaway.autoMode}</h3>
                                            <p className="text-sm text-gray-500 text-center">{t.giveaway.autoDesc}</p>
                                        </button>
                                    </div>
                                ) : (
                                    // Selected Mode UI
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        <button onClick={() => setMode(null)} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
                                            ← Back to selection
                                        </button>

                                        {mode === 'manual' ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={manualPaste}
                                                    onChange={(e) => setManualPaste(e.target.value)}
                                                    placeholder={t.giveaway.pasteComments}
                                                    className="w-full h-48 p-4 rounded-xl border-2 border-dashed border-gray-300 focus:border-pink-300 outline-none resize-none bg-gray-50/50"
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
                                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 focus-within:border-pink-300 transition-colors">
                                                            <Instagram className="w-5 h-5 text-pink-500" />
                                                            <input
                                                                type="text"
                                                                placeholder={t.giveaway.linkInputPlaceholder}
                                                                value={postLink}
                                                                onChange={(e) => setPostLink(e.target.value)}
                                                                className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={fetchInstagramComments}
                                                            disabled={loading}
                                                            className="h-auto px-6 bg-pink-600 hover:bg-pink-700 text-white shadow-lg whitespace-nowrap"
                                                        >
                                                            <MessageCircle className="w-4 h-4 mr-2" />
                                                            {loading ? t.giveaway.fetching : t.giveaway.fetchComments}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Draw Type Selection */}
                                                <div className="flex flex-wrap gap-3 justify-center">
                                                    <button
                                                        onClick={() => setDrawType('comments')}
                                                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'comments'
                                                            ? 'bg-white border-2 border-pink-400 text-pink-600 shadow-md'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        {t.giveaway.comments}
                                                    </button>
                                                    <button
                                                        onClick={() => setDrawType('likes')}
                                                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${drawType === 'likes'
                                                            ? 'bg-white border-2 border-red-400 text-red-600 shadow-md'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        {t.giveaway.likes}
                                                    </button>
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
                            <div className="space-y-6">
                                {/* Giveaway Name */}
                                <div className="text-center space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t.giveaway.giveawayName}</label>
                                    <input
                                        type="text"
                                        placeholder="Instagram Giveaway"
                                        value={giveawayName}
                                        onChange={(e) => setGiveawayName(e.target.value)}
                                        className="w-full max-w-md mx-auto block text-center py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none transition-colors"
                                    />
                                </div>

                                {/* Winner Counts */}
                                <div className="flex justify-center gap-8">
                                    <div className="text-center space-y-2">
                                        <label className="text-sm font-bold text-gray-600">{t.giveaway.winnerCount}</label>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                            <button onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))} className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                            <span className="w-12 text-center font-bold text-xl">{winnerCount}</span>
                                            <button onClick={() => setWinnerCount(winnerCount + 1)} className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <label className="text-sm font-bold text-gray-600">{t.giveaway.backupCount}</label>
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
                                            <Users className="w-4 h-4 text-pink-500" />
                                            {t.giveaway.requireFollow}
                                        </span>
                                        <button onClick={() => setRequireFollow(!requireFollow)} className={`w-12 h-7 rounded-full transition-colors relative ${requireFollow ? 'bg-pink-500' : 'bg-gray-300'}`}>
                                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${requireFollow ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </label>
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            {t.giveaway.countUserOnce}
                                        </span>
                                        <button onClick={() => setCountUserOnce(!countUserOnce)} className={`w-12 h-7 rounded-full transition-colors relative ${countUserOnce ? 'bg-pink-500' : 'bg-gray-300'}`}>
                                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${countUserOnce ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <Button onClick={() => setActiveTab('links')} variant="ghost" className="text-gray-500">← {t.common.cancel}</Button>
                                    <Button onClick={() => setActiveTab('participants')} className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg">{t.giveaway.participants} <Users className="w-4 h-4 ml-2" /></Button>
                                </div>
                            </div>
                        )}

                        {/* Participants Tab */}
                        {activeTab === 'participants' && !showResults && (
                            <div className="space-y-6">
                                {/* Add Participant */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t.giveaway.addParticipant}</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 border-2 border-gray-200 focus-within:border-pink-300 transition-colors">
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
                                        <Button onClick={addParticipant} className="bg-pink-500 hover:bg-pink-600"><Plus className="w-5 h-5" /></Button>
                                    </div>
                                </div>

                                {/* Bulk Add */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t.giveaway.bulkAdd}</label>
                                    <textarea
                                        placeholder="User1&#10;User2&#10;User3"
                                        value={bulkInput}
                                        onChange={(e) => setBulkInput(e.target.value)}
                                        className="w-full h-32 p-4 rounded-xl border-2 border-gray-200 focus:border-pink-300 outline-none resize-none transition-colors"
                                    />
                                    <Button onClick={handleBulkAdd} variant="secondary" className="w-full">{t.giveaway.bulkAdd}</Button>
                                </div>

                                {/* List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-600">{t.giveaway.participants} ({participants.length})</label>
                                        {participants.length > 0 && (
                                            <button onClick={() => setParticipants([])} className="text-xs text-red-500 hover:text-red-600 font-medium">
                                                {t.giveaway.clearAll}
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {participants.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>{t.home.noParticipants}</p>
                                            </div>
                                        ) : (
                                            participants.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-pink-50 transition-colors">
                                                    <span className="font-medium text-gray-700">@{p}</span>
                                                    <button onClick={() => removeParticipant(i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button onClick={startGiveaway} disabled={participants.length < winnerCount + backupCount} className="w-full py-4 text-lg bg-pink-600 hover:bg-pink-700 shadow-lg">
                                        <Play className="w-5 h-5 mr-2" /> {t.giveaway.startGiveaway}
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
                            <div className="space-y-6 text-center animate-in zoom-in">
                                <h2 className="text-2xl font-black text-gray-900">🎉 {t.giveaway.results}</h2>
                                <div className="space-y-3">
                                    {winners.map((winner, i) => (
                                        <div key={i} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                                            <span className="font-bold text-gray-800 text-lg">@{winner}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button onClick={copyResults} variant="secondary" className="flex-1">{copied ? t.giveaway.copied : t.giveaway.copyResults}</Button>
                                    <Button onClick={resetGiveaway} className="flex-1 bg-pink-600 hover:bg-pink-700">{t.giveaway.newGiveaway}</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Back to Home */}
                <div className="text-center pb-8">
                    <Button
                        onClick={() => router.push('/')}
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
