"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Gift, ArrowRight, Sparkles, User, RefreshCw, ArrowLeftRight, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Assignments {
    [giver: string]: string;
}

export default function ResultPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useLanguage();
    const [assignments, setAssignments] = useState<Assignments>({});
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [result, setResult] = useState<string | null>(null);
    const [showGiftIdeas, setShowGiftIdeas] = useState(false);

    // Suggestion state
    const [giftSuggestions, setGiftSuggestions] = useState<any[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const [drawMode, setDrawMode] = useState<'secret' | 'pairs' | null>(null);
    const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

    useEffect(() => {
        const mode = localStorage.getItem("draw_mode") as 'secret' | 'pairs' || 'secret';
        setDrawMode(mode);

        const data = localStorage.getItem("secret_santa_assignments");
        if (!data) {
            router.push(`/${locale}`);
            return;
        }
        setAssignments(JSON.parse(data));
    }, [router]);

    useEffect(() => {
        if (drawMode === 'pairs' && Object.keys(assignments).length > 0) {
            triggerConfetti();
        }
    }, [drawMode, assignments]);

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#D42426', '#165B33', '#FFD700']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#D42426', '#165B33', '#FFD700']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    const handleReveal = () => {
        if (!selectedUser) return;
        triggerConfetti();
        setResult(assignments[selectedUser]);
    };

    const handleReset = () => {
        setResult(null);
        setSelectedUser("");
        setShowGiftIdeas(false);
        setGiftSuggestions([]);
        setActiveSuggestion(null);
    };

    const fetchGiftSuggestions = async (target?: string) => {
        setLoadingSuggestions(true);
        setShowGiftIdeas(true);
        if (target) setActiveSuggestion(target);

        // Call API
        try {
            const res = await fetch("/api/suggest-gifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gender: "uni-sex",
                    budget: "medium",
                    relationship: "friend"
                })
            });
            const data = await res.json();
            setGiftSuggestions(data.suggestions || []);
        } catch (e) {
            console.error("AI Error", e);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const uniquePairs = Object.entries(assignments)
        .filter(([a, b]) => a < b);

    if (!drawMode) return null;

    return (
        <main className="min-h-screen min-h-dvh flex flex-col items-center pt-24 sm:pt-32 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-x-hidden safe-area-inset-bottom transition-colors duration-300">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-red-100 dark:bg-red-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-green-100 dark:bg-green-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/3 translate-y-1/3"></div>

            <div className="z-10 w-full max-w-lg space-y-4 sm:space-y-6 md:space-y-8 text-center px-1 flex-1 flex flex-col justify-center">
                {/* Header with Logo */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="inline-flex items-center justify-center p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl border border-white/50 dark:border-gray-700 overflow-hidden ring-4 ring-white dark:ring-gray-800">
                        <img src="/icon.png" alt="YulaSanta Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-xl" />
                    </div>
                </div>

                {!result && drawMode === 'secret' && (
                    <div className="space-y-2 animate-fade-in">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t.result.whoGetsGift}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {t.result.selectName}
                        </p>
                    </div>
                )}
                {drawMode === 'pairs' && (
                    <div className="space-y-2 animate-fade-in">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t.result.matchList}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {t.result.christmasMatches}
                        </p>
                    </div>
                )}

                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden">

                    {/* DIRECT PAIRS MODE - FULL LIST */}
                    {drawMode === 'pairs' && (
                        <div className="space-y-4">
                            {uniquePairs.map(([p1, p2], idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-800 dark:text-white">{p1}</span>
                                            <div className="bg-red-50 dark:bg-red-500/20 p-1.5 rounded-full text-santa-red">
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-gray-800 dark:text-white">{p2}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => activeSuggestion === p1 + p2 ? setActiveSuggestion(null) : fetchGiftSuggestions(p1 + p2)}
                                            className="text-christmas-green hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
                                            title={t.result.seeGiftIdeas}
                                        >
                                            <Gift className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Inline Suggestions */}
                                    {activeSuggestion === p1 + p2 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-600 text-left animate-in slide-in-from-top-2">
                                            {loadingSuggestions ? (
                                                <div className="space-y-2">
                                                    <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg animate-pulse" />
                                                    <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg animate-pulse" />
                                                </div>
                                            ) : (
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-gold" /> {t.result.aiSuggestions}
                                                    </p>
                                                    {giftSuggestions.map((idea, i) => (
                                                        <div key={i} className="flex flex-col bg-gray-50 dark:bg-gray-600/50 p-2 rounded-lg">
                                                            <span className="font-medium text-gray-800 dark:text-white">{idea.title}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{idea.description}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-6">
                                <Button onClick={() => router.push(`/${locale}`)} variant="outline" className="w-full">
                                    {t.result.newDraw}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* SECRET SANTA MODE */}
                    {drawMode === 'secret' && (
                        <>
                            {/* Selection Step */}
                            {!result && (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white py-4 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-gray-500 dark:focus:border-gray-400"
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                        >
                                            <option value="">{t.result.selectYourName}</option>
                                            {Object.keys(assignments).sort().map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 dark:text-gray-400">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleReveal}
                                        disabled={!selectedUser}
                                        className="w-full py-4 text-lg"
                                    >
                                        {t.result.seeResult} <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>

                                    <div className="pt-2">
                                        <Button
                                            onClick={() => router.push(`/${locale}`)}
                                            variant="ghost"
                                            className="w-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        >
                                            <Home className="w-4 h-4 mr-2" /> {t.result.backToHome}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Result Step */}
                            {result && (
                                <div className="space-y-8 animate-in zoom-in duration-500">
                                    <div>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm font-uppercase tracking-wider font-bold mb-2">{t.result.giftRecipient}</p>
                                        <div className="text-5xl font-black text-santa-red drop-shadow-sm p-4 bg-red-50 dark:bg-red-500/20 rounded-2xl border border-red-100 dark:border-red-500/30 transform rotate-1">
                                            {result}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-3 text-left border border-yellow-100 dark:border-yellow-500/20">
                                        <Sparkles className="w-5 h-5 shrink-0 mt-1" />
                                        <p>{t.result.keepSecret}</p>
                                    </div>

                                    {!showGiftIdeas ? (
                                        <Button
                                            onClick={() => fetchGiftSuggestions()}
                                            variant="secondary"
                                            className="w-full shadow-lg shadow-red-200/50 dark:shadow-red-500/20"
                                        >
                                            <Gift className="w-5 h-5 mr-2" /> {t.result.seeGiftIdeas}
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 text-left">
                                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                                                <Sparkles className="w-4 h-4 text-gold mr-2" />
                                                {t.result.aiSuggestions}
                                            </h3>

                                            {loadingSuggestions ? (
                                                <div className="space-y-3">
                                                    <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                                    <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                                    <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {giftSuggestions.map((idea, i) => (
                                                        <div key={i} className="bg-white dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-sm">
                                                            <span className="font-bold text-gray-800 dark:text-white block mb-1">{idea.title}</span>
                                                            <span className="text-gray-500 dark:text-gray-400">{idea.description}</span>
                                                        </div>
                                                    ))}
                                                    {giftSuggestions.length === 0 && (
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t.result.noSuggestions}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <Button
                                            onClick={handleReset}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" /> {t.result.someoneElse}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
