"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Gift, ArrowRight, Sparkles, User, RefreshCw, ArrowLeftRight, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Assignments {
    [giver: string]: string;
}

export default function ResultPage() {
    const router = useRouter();
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
            router.push("/");
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
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-green-50 to-white relative overflow-x-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-[120px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full blur-[120px] opacity-40 -translate-x-1/3 translate-y-1/3"></div>

            <div className="z-10 w-full max-w-lg space-y-8 text-center">
                {/* Header */}
                {!result && drawMode === 'secret' && (
                    <div className="space-y-2 animate-fade-in">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Kime Hediye Alacağım?
                        </h1>
                        <p className="text-gray-500">
                            İsminizi seçin ve sonucu görün. 🎁
                        </p>
                    </div>
                )}
                {drawMode === 'pairs' && (
                    <div className="space-y-2 animate-fade-in">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Eşleşme Listesi
                        </h1>
                        <p className="text-gray-500">
                            İşte yılbaşı eşleşmeleri! 🎄
                        </p>
                    </div>
                )}

                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">

                    {/* DIRECT PAIRS MODE - FULL LIST */}
                    {drawMode === 'pairs' && (
                        <div className="space-y-4">
                            {uniquePairs.map(([p1, p2], idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-800">{p1}</span>
                                            <div className="bg-red-50 p-1.5 rounded-full text-santa-red">
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-gray-800">{p2}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => activeSuggestion === p1 + p2 ? setActiveSuggestion(null) : fetchGiftSuggestions(p1 + p2)}
                                            className="text-christmas-green hover:text-green-700 hover:bg-green-50"
                                            title="Hediye önerisi al"
                                        >
                                            <Gift className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Inline Suggestions */}
                                    {activeSuggestion === p1 + p2 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 text-left animate-in slide-in-from-top-2">
                                            {loadingSuggestions ? (
                                                <div className="space-y-2">
                                                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                                                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                                                </div>
                                            ) : (
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-gold" /> AI Hediye Önerileri
                                                    </p>
                                                    {giftSuggestions.map((idea, i) => (
                                                        <div key={i} className="flex flex-col bg-gray-50 p-2 rounded-lg">
                                                            <span className="font-medium text-gray-800">{idea.title}</span>
                                                            <span className="text-xs text-gray-500">{idea.description}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-6">
                                <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                                    Yeni Çekiliş Yap
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
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-4 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                        >
                                            <option value="">İsminizi seçin...</option>
                                            {Object.keys(assignments).sort().map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleReveal}
                                        disabled={!selectedUser}
                                        className="w-full py-4 text-lg"
                                    >
                                        Sonucu Gör <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>

                                    <div className="pt-2">
                                        <Button
                                            onClick={() => router.push('/')}
                                            variant="ghost"
                                            className="w-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                        >
                                            <Home className="w-4 h-4 mr-2" /> Ana Ekrana Dön
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Result Step */}
                            {result && (
                                <div className="space-y-8 animate-in zoom-in duration-500">
                                    <div>
                                        <p className="text-gray-400 text-sm font-uppercase tracking-wider font-bold mb-2">HEDİYE ALACAĞIN KİŞİ</p>
                                        <div className="text-5xl font-black text-santa-red drop-shadow-sm p-4 bg-red-50 rounded-2xl border border-red-100 transform rotate-1">
                                            {result}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-50 rounded-xl text-yellow-700 text-sm flex items-start gap-3 text-left border border-yellow-100">
                                        <Sparkles className="w-5 h-5 shrink-0 mt-1" />
                                        <p>Bu bilgiyi sakın unutma! Kimseye söyleme, sürprizi bozma. 🤫</p>
                                    </div>

                                    {!showGiftIdeas ? (
                                        <Button
                                            onClick={() => fetchGiftSuggestions()}
                                            variant="secondary"
                                            className="w-full shadow-lg shadow-red-200/50"
                                        >
                                            <Gift className="w-5 h-5 mr-2" /> Hediye Fikirleri Gör
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 text-left">
                                            <h3 className="font-bold text-gray-900 flex items-center">
                                                <Sparkles className="w-4 h-4 text-gold mr-2" />
                                                AI Hediye Önerileri
                                            </h3>

                                            {loadingSuggestions ? (
                                                <div className="space-y-3">
                                                    <div className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                                    <div className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                                    <div className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {giftSuggestions.map((idea, i) => (
                                                        <div key={i} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-sm">
                                                            <span className="font-bold text-gray-800 block mb-1">{idea.title}</span>
                                                            <span className="text-gray-500">{idea.description}</span>
                                                        </div>
                                                    ))}
                                                    {giftSuggestions.length === 0 && (
                                                        <p className="text-gray-500 text-sm">Öneri bulunamadı.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-100">
                                        <Button
                                            onClick={handleReset}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" /> Başka biri baksın
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
