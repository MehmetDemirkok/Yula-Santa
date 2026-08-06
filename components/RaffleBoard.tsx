/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RaffleBoard — Yeniden kullanılabilir liste çekilişi bileşeni
 * ═══════════════════════════════════════════════════════════════════════════
 * "İsim listesi gir → N kazanan + yedek → adil & animasyonlu çekiliş" akışını
 * sağlar. Hem Genel Liste Çekilişi hem Twitter/X sayfası bunu kullanır.
 *
 * Adalet: [[lib/random]] üzerinden kriptografik, yansız Fisher–Yates.
 */

"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import confetti from "canvas-confetti";
import { Plus, Trash2, Trophy, RefreshCw, Copy, Check, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { secureShuffle, secureRandomInt } from "@/lib/random";
import { AdWrapper, InArticleAd } from "@/components/ads";
import { AD_SLOTS } from "@/lib/ads/config";

interface RaffleBoardProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    /** İkon kutusu için gradient/renk sınıfı, ör. "bg-gradient-to-tr from-sky-400 to-sky-600" */
    accentBox: string;
    /** Ana buton rengi, ör. "bg-sky-600 hover:bg-sky-700" */
    accentButton: string;
    /** Arka plan dekor rengi, ör. "bg-sky-200 dark:bg-sky-500/20" */
    accentGlow: string;
    /** İsim giriş placeholder'ı */
    placeholder: string;
    /** localStorage taslak anahtarı (sayfaya özel) */
    storageKey: string;
    /** Sonuç metnine eklenecek imza, ör. "🎰 www.yulasanta.com.tr" */
    shareSuffix?: string;
}

export default function RaffleBoard({
    title, subtitle, icon, accentBox, accentButton, accentGlow, placeholder, storageKey, shareSuffix,
}: RaffleBoardProps) {
    const { t } = useLanguage();
    const { toast } = useToast();

    const [participants, setParticipants] = useState<string[]>([]);
    const [name, setName] = useState("");
    const [bulk, setBulk] = useState("");
    const [showBulk, setShowBulk] = useState(false);
    const [winnerCount, setWinnerCount] = useState(1);
    const [backupCount, setBackupCount] = useState(0);

    const [isRolling, setIsRolling] = useState(false);
    const [rolling, setRolling] = useState<string>("");
    const [winners, setWinners] = useState<string[]>([]);
    const [backups, setBackups] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [copied, setCopied] = useState(false);

    // Taslağı geri yükle / sakla
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setParticipants(JSON.parse(saved));
        } catch { /* yoksay */ }
    }, [storageKey]);
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(participants)); } catch { /* yoksay */ }
    }, [participants, storageKey]);

    const addName = () => {
        const clean = name.trim().replace(/^@/, "");
        if (!clean) return;
        if (participants.some((p) => p.toLowerCase() === clean.toLowerCase())) {
            toast.warning(t.home.nameExists);
            return;
        }
        setParticipants([...participants, clean]);
        setName("");
    };

    const addBulk = () => {
        const names = bulk
            .split(/[\n,;]+/)
            .map((n) => n.trim().replace(/^@/, ""))
            .filter((n) => n.length > 0);
        const set = new Set(participants.map((p) => p.toLowerCase()));
        const merged = [...participants];
        names.forEach((n) => {
            if (!set.has(n.toLowerCase())) { merged.push(n); set.add(n.toLowerCase()); }
        });
        setParticipants(merged);
        setBulk("");
        setShowBulk(false);
    };

    const remove = (i: number) => setParticipants(participants.filter((_, idx) => idx !== i));

    const fireConfetti = () => {
        const end = Date.now() + 2500;
        const colors = ['#D42426', '#165B33', '#FFD700'];
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

    const start = () => {
        if (participants.length < winnerCount + backupCount) {
            toast.warning(t.home.notEnoughPeople);
            return;
        }
        setShowResults(false);
        setIsRolling(true);

        const interval = setInterval(() => {
            setRolling(participants[secureRandomInt(participants.length)]);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            const shuffled = secureShuffle(participants);
            setWinners(shuffled.slice(0, winnerCount));
            setBackups(shuffled.slice(winnerCount, winnerCount + backupCount));
            setIsRolling(false);
            setShowResults(true);
            fireConfetti();
        }, 2600);
    };

    const reset = () => {
        setShowResults(false);
        setWinners([]);
        setBackups([]);
    };

    const copyResults = () => {
        const text =
            `🏆 ${title}\n\n${t.giveaway.winners}:\n${winners.map((w, i) => `${i + 1}. ${w}`).join("\n")}` +
            (backups.length ? `\n\n🔄 ${t.giveaway.backups}:\n${backups.map((b, i) => `${i + 1}. ${b}`).join("\n")}` : "") +
            (shareSuffix ? `\n\n${shareSuffix}` : "");
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(t.giveaway.copied);
        setTimeout(() => setCopied(false), 2000);
    };

    const Stepper = ({ label, value, set, min }: { label: string; value: number; set: (n: number) => void; min: number }) => (
        <div className="flex-1 bg-[var(--surface-2)] rounded-md p-3 text-center">
            <p className="text-label-sm text-[var(--text-muted)] mb-2">{label}</p>
            <div className="flex items-center justify-center gap-3">
                <button onClick={() => set(Math.max(min, value - 1))} className="w-8 h-8 rounded-sm bg-[var(--card-bg)] border border-[var(--border-medium)] font-bold text-[var(--text-secondary)] hover:border-santa-red">−</button>
                <span className="w-8 text-xl font-black text-[var(--text-primary)] tabular-nums">{value}</span>
                <button onClick={() => set(value + 1)} className="w-8 h-8 rounded-sm bg-[var(--card-bg)] border border-[var(--border-medium)] font-bold text-[var(--text-secondary)] hover:border-santa-red">+</button>
            </div>
        </div>
    );

    return (
        <main className="ys-page-shell flex flex-col items-center pt-24 sm:pt-32 px-3 sm:px-4 pb-16 relative overflow-hidden transition-colors duration-300">
            <div className={`absolute top-0 left-0 w-64 h-64 ${accentGlow} rounded-full blur-[90px] opacity-40 -translate-x-1/3 -translate-y-1/3`} />
            <div className={`absolute bottom-0 right-0 w-72 h-72 ${accentGlow} rounded-full blur-[90px] opacity-30 translate-x-1/3 translate-y-1/3`} />

            <div className="z-10 w-full max-w-lg space-y-5">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg text-white shadow-lg ${accentBox}`}>
                        {icon}
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">{title}</h1>
                    <p className="text-[var(--text-secondary)] text-body-md max-w-md mx-auto">{subtitle}</p>
                </div>

                {/* Card */}
                <div className="ys-card backdrop-blur-xl p-4 sm:p-6 space-y-5">
                    {!showResults && (
                        <>
                            {/* Add input */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder={placeholder}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addName()}
                                    className="flex-1 bg-white/50 dark:bg-gray-900/50"
                                />
                                <Button onClick={addName} className="aspect-square p-0 w-11 rounded-xl shrink-0">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Bulk toggle */}
                            <button
                                onClick={() => setShowBulk((v) => !v)}
                                className="text-label-sm text-[var(--text-muted)] hover:text-santa-red transition-colors"
                            >
                                {showBulk ? "▲" : "▼"} {t.giveaway.bulkAdd}
                            </button>
                            {showBulk && (
                                <div className="space-y-2">
                                    <textarea
                                        value={bulk}
                                        onChange={(e) => setBulk(e.target.value)}
                                        rows={4}
                                        placeholder={`${placeholder}\n${placeholder}\n...`}
                                        className="w-full p-3 rounded-md border-2 border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y focus:border-[var(--input-focus)] focus:outline-none"
                                    />
                                    <Button onClick={addBulk} variant="secondary" size="sm" className="w-full">
                                        {t.giveaway.parse}
                                    </Button>
                                </div>
                            )}

                            {/* List */}
                            <div className="flex items-center justify-between">
                                <span className="text-label-sm text-[var(--text-muted)] flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> {participants.length}
                                </span>
                                {participants.length > 0 && (
                                    <button onClick={() => setParticipants([])} className="text-label-sm text-[var(--text-muted)] hover:text-santa-red">
                                        {t.giveaway.clearAll}
                                    </button>
                                )}
                            </div>
                            <div className="rounded-md overflow-hidden border border-[var(--border-light)] max-h-[28vh] overflow-y-auto custom-scrollbar">
                                {participants.length === 0 && (
                                    <div className="text-center py-8 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-medium)] rounded-md">
                                        <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">{t.home.noParticipants}</p>
                                    </div>
                                )}
                                {participants.map((p, i) => (
                                    <div key={i} className="ys-zebra-row group flex items-center justify-between px-3 py-2">
                                        <span className="font-medium text-[var(--text-secondary)] text-sm truncate mr-2">{p}</span>
                                        <button onClick={() => remove(i)} className="p-1 text-[var(--text-muted)] hover:text-santa-red shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Counts */}
                            <div className="flex gap-3">
                                <Stepper label={t.giveaway.winnerCount} value={winnerCount} set={setWinnerCount} min={1} />
                                <Stepper label={t.giveaway.backupCount} value={backupCount} set={setBackupCount} min={0} />
                            </div>

                            {/* Start */}
                            <Button
                                onClick={start}
                                disabled={isRolling || participants.length < winnerCount + backupCount}
                                className={`w-full text-lg py-6 text-white shadow-lg ${accentButton}`}
                            >
                                {isRolling ? (
                                    <span className="animate-pulse">{rolling || "..."}</span>
                                ) : (
                                    <><Trophy className="w-5 h-5 mr-2" /> {t.giveaway.startGiveaway}</>
                                )}
                            </Button>
                        </>
                    )}

                    {/* Results */}
                    {showResults && (
                        <div className="space-y-5 animate-in zoom-in duration-500">
                            <div className="ys-winner-reveal text-center py-6 px-4">
                                <Trophy className="w-10 h-10 mx-auto text-white/90 mb-1 animate-float" />
                                <p className="text-label-sm text-white/80 uppercase">{t.giveaway.results}</p>
                            </div>

                            <div>
                                <p className="text-label-sm text-[var(--text-muted)] mb-2">🏆 {t.giveaway.winners}</p>
                                <div className="space-y-2">
                                    {winners.map((w, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-[color-mix(in_srgb,var(--success-green)_10%,transparent)] rounded-md border border-[color-mix(in_srgb,var(--success-green)_25%,transparent)]">
                                            <span className="w-7 h-7 rounded-full bg-gold text-white font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                                            <span className="font-bold text-[var(--text-primary)]">{w}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {backups.length > 0 && (
                                <div>
                                    <p className="text-label-sm text-[var(--text-muted)] mb-2">🔄 {t.giveaway.backups}</p>
                                    <div className="rounded-md overflow-hidden border border-[var(--border-light)]">
                                        {backups.map((b, i) => (
                                            <div key={i} className="ys-zebra-row flex items-center gap-3 px-3 py-2">
                                                <span className="w-6 h-6 rounded-full bg-[var(--text-muted)] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                                <span className="text-[var(--text-secondary)] text-sm">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <AdWrapper position="inline">
                                <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
                            </AdWrapper>

                            <div className="flex gap-2 pt-2">
                                <Button onClick={copyResults} variant="secondary" className="flex-1">
                                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {copied ? t.giveaway.copied : t.giveaway.copyResults}
                                </Button>
                                <Button onClick={reset} variant="outline" className="flex-1">
                                    <RefreshCw className="w-4 h-4 mr-2" /> {t.giveaway.newGiveaway}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
