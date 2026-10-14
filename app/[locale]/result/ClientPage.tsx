"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Gift, Sparkles, User, RefreshCw, ArrowLeftRight, Home } from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";
import styles from "./result.module.css";

interface Assignments {
    [giver: string]: string;
}

interface GiftSuggestion {
    title: string;
    description: string;
}

const AVATAR_TONES = [
    "from-red-500 to-rose-700",
    "from-emerald-500 to-green-700",
    "from-amber-400 to-yellow-600",
    "from-indigo-500 to-violet-700",
];

function Avatar({ name, index = 0, size = "md" }: { name: string; index?: number; size?: "md" | "lg" }) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    const dim = size === "lg" ? "w-11 h-11 text-lg" : "w-8 h-8 text-xs";
    return (
        <span
            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_TONES[index % AVATAR_TONES.length]} text-white font-bold shrink-0 shadow-md ring-2 ring-white/50 dark:ring-white/10 ${dim}`}
        >
            {initial}
        </span>
    );
}

function GiftBox({ open, onOpen }: { open: boolean; onOpen: () => void }) {
    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label="Open your gift"
            className={`${styles.giftButton} ${open ? styles.open : ""}`}
        >
            <span className={styles.glow} aria-hidden />
            <svg viewBox="0 0 220 220" className={styles.giftSvg} aria-hidden>
                <defs>
                    <linearGradient id="giftBody" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d1222e" />
                        <stop offset="100%" stopColor="#8f0f1a" />
                    </linearGradient>
                    <linearGradient id="giftLid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e84040" />
                        <stop offset="100%" stopColor="#a4101c" />
                    </linearGradient>
                    <linearGradient id="giftRibbon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F5C030" />
                        <stop offset="100%" stopColor="#E09600" />
                    </linearGradient>
                </defs>

                <rect x="45" y="100" width="130" height="98" rx="12" fill="url(#giftBody)" />
                <rect x="45" y="100" width="130" height="16" rx="8" fill="#ffffff" opacity="0.1" />
                <rect x="101" y="100" width="18" height="98" fill="url(#giftRibbon)" />

                <g className={styles.lid}>
                    <rect x="36" y="76" width="148" height="32" rx="9" fill="url(#giftLid)" />
                    <rect x="36" y="76" width="148" height="10" rx="5" fill="#ffffff" opacity="0.12" />
                    <rect x="101" y="76" width="18" height="32" fill="url(#giftRibbon)" />
                </g>

                <g className={styles.bow}>
                    <ellipse cx="88" cy="62" rx="26" ry="16" fill="url(#giftRibbon)" transform="rotate(-18 88 62)" />
                    <ellipse cx="132" cy="62" rx="26" ry="16" fill="url(#giftRibbon)" transform="rotate(18 132 62)" />
                    <circle cx="110" cy="68" r="12" fill="#F5C030" />
                    <circle cx="106" cy="64" r="4" fill="#ffffff" opacity="0.5" />
                </g>
            </svg>
        </button>
    );
}

export default function ResultPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { t } = useLanguage();
    const [assignments, setAssignments] = useState<Assignments>({});
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [result, setResult] = useState<string | null>(null);
    const [stage, setStage] = useState<'pick' | 'gift' | 'revealed'>('pick');
    const [opening, setOpening] = useState(false);
    const [showGiftIdeas, setShowGiftIdeas] = useState(false);

    const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([]);
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
            celebrate();
        }
    }, [drawMode, assignments]);

    const handleStartReveal = () => {
        if (!selectedUser) return;
        setStage('gift');
    };

    const handleOpenGift = () => {
        if (opening) return;
        setOpening(true);
        celebrate();
        window.setTimeout(() => {
            setResult(assignments[selectedUser]);
            setStage('revealed');
            setOpening(false);
        }, 900);
    };

    const handleReset = () => {
        setResult(null);
        setSelectedUser("");
        setStage('pick');
        setOpening(false);
        setShowGiftIdeas(false);
        setGiftSuggestions([]);
        setActiveSuggestion(null);
    };

    const fetchGiftSuggestions = async (target?: string) => {
        setLoadingSuggestions(true);
        setShowGiftIdeas(true);
        if (target) setActiveSuggestion(target);

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
        <main className="ys-page-shell flex flex-col items-center pt-24 sm:pt-32 relative overflow-x-hidden safe-area-inset-bottom transition-colors duration-300">
            <div className="absolute top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-red-100 dark:bg-red-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-green-100 dark:bg-green-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-40 -translate-x-1/3 translate-y-1/3"></div>

            <div className="z-10 w-full max-w-lg space-y-4 sm:space-y-6 md:space-y-8 text-center px-1 flex-1 flex flex-col justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="inline-flex items-center justify-center p-1 bg-[var(--card-bg)] rounded-2xl shadow-xl border border-[var(--border-light)] overflow-hidden ring-4 ring-[var(--card-bg)]">
                        <img src="/icon.png" alt="YulaSanta Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-xl" />
                    </div>
                </div>

                {drawMode === 'secret' && stage !== 'revealed' && (
                    <div className="space-y-2 animate-fade-in">
                        <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">
                            {t.result.whoGetsGift}
                        </h1>
                        <p className="text-[var(--text-secondary)] text-body-md sm:text-body-lg">
                            {t.result.selectName}
                        </p>
                    </div>
                )}
                {drawMode === 'pairs' && (
                    <div className="space-y-2 animate-fade-in">
                        <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">
                            {t.result.matchList}
                        </h1>
                        <p className="text-[var(--text-secondary)] text-body-md sm:text-body-lg">
                            {t.result.christmasMatches}
                        </p>
                    </div>
                )}

                <div className="ys-card backdrop-blur-xl p-4 sm:p-6 md:p-8 relative overflow-hidden">

                    {drawMode === 'pairs' && (
                        <div className="space-y-4">
                            {uniquePairs.map(([p1, p2], idx) => (
                                <div key={idx} className="ys-zebra-row bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Avatar name={p1} index={idx * 2} />
                                            <span className="font-bold text-[var(--text-primary)] truncate">{p1}</span>
                                            <div className="bg-red-50 dark:bg-red-500/20 p-1.5 rounded-full text-santa-red shrink-0">
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-[var(--text-primary)] truncate">{p2}</span>
                                            <Avatar name={p2} index={idx * 2 + 1} />
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => activeSuggestion === p1 + p2 ? setActiveSuggestion(null) : fetchGiftSuggestions(p1 + p2)}
                                            className="text-christmas-green hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 shrink-0"
                                            title={t.result.seeGiftIdeas}
                                        >
                                            <Gift className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {activeSuggestion === p1 + p2 && (
                                        <div className="mt-4 pt-4 border-t border-[var(--border-light)] text-left animate-in slide-in-from-top-2">
                                            {loadingSuggestions ? (
                                                <div className="space-y-2">
                                                    <div className="h-10 bg-[var(--surface-2)] rounded-lg animate-pulse" />
                                                    <div className="h-10 bg-[var(--surface-2)] rounded-lg animate-pulse" />
                                                </div>
                                            ) : (
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-label-sm text-[var(--text-muted)] uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-gold" /> {t.result.aiSuggestions}
                                                    </p>
                                                    {giftSuggestions.map((idea, i) => (
                                                        <div key={i} className="flex flex-col bg-[var(--surface-2)] p-2 rounded-lg">
                                                            <span className="font-medium text-[var(--text-primary)]">{idea.title}</span>
                                                            <span className="text-xs text-[var(--text-secondary)]">{idea.description}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <AdWrapper position="inline">
                                <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                            </AdWrapper>

                            <div className="pt-6">
                                <Button onClick={() => router.push(`/${locale}`)} variant="outline" className="w-full">
                                    {t.result.newDraw}
                                </Button>
                            </div>
                        </div>
                    )}

                    {drawMode === 'secret' && (
                        <>
                            {stage === 'pick' && (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--text-primary)] py-4 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-[var(--input-focus)]"
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                        >
                                            <option value="">{t.result.selectYourName}</option>
                                            {Object.keys(assignments).sort().map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-muted)]">
                                            <User className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleStartReveal}
                                        disabled={!selectedUser}
                                        className="w-full py-4 text-lg rounded-full font-bold"
                                    >
                                        <Gift className="w-5 h-5 mr-2" /> {t.result.seeResult}
                                    </Button>

                                    <div className="pt-2">
                                        <Button
                                            onClick={() => router.push(`/${locale}`)}
                                            variant="ghost"
                                            className="w-full text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                        >
                                            <Home className="w-4 h-4 mr-2" /> {t.result.backToHome}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {stage === 'gift' && (
                                <div className={styles.stage}>
                                    <p className="text-[var(--text-muted)] text-label-sm uppercase tracking-wider">
                                        {selectedUser}
                                    </p>
                                    <GiftBox open={opening} onOpen={handleOpenGift} />
                                    <p className={styles.hint}>
                                        {locale === 'tr' ? 'Hediyeni açmak için kutuya dokun' : 'Tap the box to open your gift'}
                                    </p>
                                    <Button
                                        onClick={() => setStage('pick')}
                                        variant="ghost"
                                        size="sm"
                                        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    >
                                        <Home className="w-4 h-4 mr-2" /> {t.result.backToHome}
                                    </Button>
                                </div>
                            )}

                            {stage === 'revealed' && result && (
                                <div className="space-y-8">
                                    <div>
                                        <p className="text-[var(--text-muted)] text-label-sm uppercase tracking-wider mb-2">{t.result.giftRecipient}</p>
                                        <div className="ys-winner-reveal p-6 sm:p-8">
                                            <span className={styles.spark} aria-hidden />
                                            <span className={styles.spark} aria-hidden />
                                            <span className={styles.spark} aria-hidden />
                                            <span className={styles.spark} aria-hidden />
                                            <span className={styles.spark} aria-hidden />
                                            <Sparkles className="w-6 h-6 mx-auto mb-2 animate-float opacity-90" />
                                            <div className={`text-3xl sm:text-4xl font-black drop-shadow-sm ${styles.winnerName}`}>
                                                {result}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-3 text-left border border-yellow-100 dark:border-yellow-500/20">
                                        <Sparkles className="w-5 h-5 shrink-0 mt-1" />
                                        <p>{t.result.keepSecret}</p>
                                    </div>

                                    <AdWrapper position="inline">
                                        <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                                    </AdWrapper>

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
                                            <h3 className="font-heading font-bold text-[var(--text-primary)] flex items-center">
                                                <Sparkles className="w-4 h-4 text-gold mr-2" />
                                                {t.result.aiSuggestions}
                                            </h3>

                                            {loadingSuggestions ? (
                                                <div className="space-y-3">
                                                    <div className="h-16 bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
                                                    <div className="h-16 bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
                                                    <div className="h-16 bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {giftSuggestions.map((idea, i) => (
                                                        <div key={i} className="ys-zebra-row bg-[var(--card-bg)] border border-[var(--border-light)] p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-sm">
                                                            <span className="font-bold text-[var(--text-primary)] block mb-1">{idea.title}</span>
                                                            <span className="text-[var(--text-secondary)]">{idea.description}</span>
                                                        </div>
                                                    ))}
                                                    {giftSuggestions.length === 0 && (
                                                        <p className="text-[var(--text-secondary)] text-sm">{t.result.noSuggestions}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-[var(--border-light)]">
                                        <Button
                                            onClick={handleReset}
                                            variant="ghost"
                                            size="sm"
                                            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
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
