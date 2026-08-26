/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Home Page - Localized
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Trash2, Gift, Sparkles, FileUp, Youtube, HelpCircle, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslations } from 'next-intl';
import { CountdownBanner } from "@/components/NewYearTheme";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";
import { secureShuffle } from "@/lib/random";
import * as XLSX from "xlsx";

export default function Home() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations();

    const [name, setName] = useState("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [drawMode, setDrawMode] = useState<'secret' | 'pairs'>('secret');
    const [hydrated, setHydrated] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("participants_draft");
        if (saved) {
            try {
                setParticipants(JSON.parse(saved));
            } catch { }
        }
        const savedMode = localStorage.getItem("draw_mode") as 'secret' | 'pairs' | null;
        setDrawMode(savedMode === 'pairs' ? 'pairs' : 'secret');
        setHydrated(true);
    }, []);

    useEffect(() => {
        localStorage.setItem("participants_draft", JSON.stringify(participants));
    }, [participants]);

    const addParticipant = () => {
        if (!name.trim()) return;
        if (participants.some(p => p.toLowerCase() === name.trim().toLowerCase())) {
            alert(t('home.nameExists'));
            return;
        }
        setParticipants([...participants, name.trim()]);
        setName("");
    };

    const removeParticipant = (index: number) => {
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        let newNames: string[] = [];

        try {
            if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                newNames = jsonData.flat().map(String).filter((s: string) => s && s.trim().length > 1);
            } else if (file.name.endsWith(".pdf")) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/parse-pdf", {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) throw new Error("PDF Parsing Failed");

                const data = await res.json();
                newNames = data.names || [];
            } else {
                alert(t('home.unsupportedFormat'));
                setIsUploading(false);
                return;
            }

            if (newNames.length > 0) {
                const combined = Array.from(new Set([...participants, ...newNames.map(n => n.trim())]));
                setParticipants(combined);

                if (combined.length >= (drawMode === 'pairs' ? 2 : 3)) {
                    setTimeout(() => {
                        if (confirm(`${newNames.length} ${t('home.namesAdded')} (${t('home.totalCount')}: ${combined.length}). ${t('home.startDrawConfirm')}`)) {
                            triggerDraw(combined);
                        }
                    }, 500);
                } else {
                    alert(`${newNames.length} ${t('home.namesAdded')}, ${t('home.notEnoughPeople')}`);
                }
            } else {
                alert(t('home.noNamesFound'));
            }
        } catch (error) {
            console.error(error);
            alert(t('home.uploadError'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const triggerDraw = (currentParticipants: string[]) => {
        if (drawMode === 'secret') {
            if (currentParticipants.length < 3) {
                alert(t('home.secretDrawMinError'));
                return;
            }

            let shuffled = [...currentParticipants];
            let isValid = false;
            let attempts = 0;

            while (!isValid && attempts < 1000) {
                shuffled = secureShuffle(currentParticipants);

                isValid = true;
                for (let i = 0; i < currentParticipants.length; i++) {
                    if (currentParticipants[i] === shuffled[i]) {
                        isValid = false;
                        break;
                    }
                }
                attempts++;
            }

            if (!isValid) {
                alert(t('home.drawError'));
                return;
            }

            const assignments: Record<string, string> = {};
            currentParticipants.forEach((p, i) => {
                assignments[p] = shuffled[i];
            });

            localStorage.setItem("secret_santa_assignments", JSON.stringify(assignments));
            localStorage.setItem("draw_mode", 'secret');
            router.push(`/${locale}/result`);

        } else {
            if (currentParticipants.length < 2) {
                alert(t('home.directMatchMinError'));
                return;
            }
            if (currentParticipants.length % 2 !== 0) {
                alert(t('home.directMatchEvenError'));
                return;
            }

            const shuffled = secureShuffle(currentParticipants);

            const assignments: Record<string, string> = {};
            for (let i = 0; i < shuffled.length; i += 2) {
                assignments[shuffled[i]] = shuffled[i + 1];
                assignments[shuffled[i + 1]] = shuffled[i];
            }

            localStorage.setItem("secret_santa_assignments", JSON.stringify(assignments));
            localStorage.setItem("draw_mode", 'pairs');
            router.push(`/${locale}/result`);
        }
    };

    const handleDraw = () => triggerDraw(participants);

    return (
        <main className="ys-page-shell flex flex-col items-center pt-24 sm:pt-32 relative overflow-hidden transition-colors duration-300 safe-area-inset-bottom">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-red-200 dark:bg-red-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-green-200 dark:bg-green-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] opacity-30 translate-x-1/3 translate-y-1/3"></div>

            <div className="z-10 w-full max-w-md space-y-4 sm:space-y-6 md:space-y-8 text-center px-1 flex-1 flex flex-col justify-center">
                <div className="space-y-2">
                    <div className="inline-flex items-center justify-center p-1 bg-[var(--card-bg)] rounded-2xl mb-2 sm:mb-4 shadow-sm border border-[var(--border-light)] overflow-hidden ring-4 ring-[var(--card-bg)] shadow-xl">
                        <img src="/icon.png" alt="YulaSanta Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl" />
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] tracking-tight">
                        {locale === 'tr' ? 'Online Secret Santa' : t('footer.secretSanta')}
                    </h1>
                    <div className="flex items-center justify-center gap-2 flex-wrap" suppressHydrationWarning>
                        <p className="text-[var(--text-secondary)] text-body-lg">
                            {t('home.subtitle')}
                        </p>
                        {participants.length > 0 && (
                            <span className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${participants.length >= (drawMode === 'pairs' ? 2 : 3) ? 'bg-green-100/80 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-yellow-100/80 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'}`}>
                                {participants.length}/{drawMode === 'pairs' ? '2+' : '3+'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="ys-card backdrop-blur-xl p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Mode Selector */}
                    <div className="grid grid-cols-2 gap-3" suppressHydrationWarning>
                        <button
                            onClick={() => setDrawMode('secret')}
                            className={`p-3 sm:p-4 rounded-2xl transition-all border-2 ${drawMode === 'secret' ? 'bg-red-100/50 dark:bg-red-500/15 border-santa-red text-santa-red shadow-lg' : 'bg-[var(--surface-2)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-medium)]'}`}
                        >
                            <div className="text-2xl sm:text-3xl mb-1">🎅</div>
                            <div className="font-bold text-xs sm:text-sm">{t('home.secretDraw')}</div>
                            <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1">Kim kime hediye verecek gizli</div>
                        </button>

                        <button
                            onClick={() => setDrawMode('pairs')}
                            className={`p-3 sm:p-4 rounded-2xl transition-all border-2 ${drawMode === 'pairs' ? 'bg-green-100/50 dark:bg-green-500/15 border-christmas-green text-christmas-green shadow-lg' : 'bg-[var(--surface-2)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-medium)]'}`}
                        >
                            <div className="text-2xl sm:text-3xl mb-1">👥</div>
                            <div className="font-bold text-xs sm:text-sm">{t('home.directMatch')}</div>
                            <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1">Birbirlerine hediye</div>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder={t('home.inputPlaceholder')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                            className="flex-1 bg-[var(--input-bg)] text-base"
                        />
                        <button
                            onClick={addParticipant}
                            aria-label={locale === 'tr' ? 'Kişi ekle' : 'Add participant'}
                            className="group relative aspect-square p-0 w-12 sm:w-14 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-santa-red to-red-700 text-white shadow-[0_4px_16px_rgba(182,23,34,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_8px_24px_rgba(182,23,34,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110 transition-all duration-200 active:scale-95"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0" aria-hidden />
                            <svg className="relative w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"></path>
                                <path d="M12 5v14"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[35vh] sm:max-h-[40vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                        {participants.length === 0 && (
                            <div className="text-center py-8 sm:py-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-medium)] rounded-xl sm:rounded-2xl bg-[var(--surface-2)]">
                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-body-md">{t('home.noParticipants')}</p>
                            </div>
                        )}
                        {participants.map((p, i) => (
                            <div key={i} className="ys-zebra-row group flex items-center justify-between p-2.5 sm:p-3 pl-3 sm:pl-4 bg-[var(--card-bg)] rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border border-[var(--border-light)] hover:border-red-100 dark:hover:border-red-900/30 animate-in slide-in-from-left-2 duration-300">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="font-bold text-santa-red text-xs sm:text-sm flex-shrink-0">#{i + 1}</span>
                                    <span className="font-medium text-[var(--text-secondary)] text-sm sm:text-base truncate">{p}</span>
                                </div>
                                <div className="flex items-center gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(p);
                                        }}
                                        className="p-1.5 sm:p-2 text-[var(--text-muted)] hover:text-santa-red rounded-lg transition-colors"
                                        title="Kopyala"
                                    >
                                        <ClipboardPaste className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button
                                        onClick={() => removeParticipant(i)}
                                        className="p-1.5 sm:p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* File Upload & Actions */}
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx, .xls, .csv, .pdf"
                            onChange={handleFileUpload}
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="ghost"
                            className="flex-1 border-2 border-dashed border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:border-santa-red/50 hover:text-santa-red text-xs sm:text-sm py-2.5 sm:py-3"
                        >
                            {isUploading ? t('home.uploading') : (
                                <>
                                    <FileUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                    <span className="truncate">{t('home.uploadList')}</span>
                                </>
                            )}
                        </Button>

                        {participants.length > 0 && (
                            <Button
                                onClick={() => {
                                    if (confirm(t('common.clearConfirm'))) {
                                        setParticipants([]);
                                    }
                                }}
                                variant="ghost"
                                className="aspect-square p-0 w-10 sm:w-12 border-2 border-dashed border-red-200 dark:border-red-900/30 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 hover:text-red-500"
                                title={t('home.clearList')}
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        )}
                    </div>

                    <div className="pt-4 border-t border-[var(--border-light)]">
                        <Button
                            onClick={handleDraw}
                            className={`w-full text-lg py-6 shadow-lg transition-all ${drawMode === 'pairs' ? 'shadow-green-200/50 dark:shadow-green-900/20 hover:shadow-green-200/50 bg-christmas-green hover:bg-green-700' : 'shadow-red-200/50 dark:shadow-red-900/20'}`}
                            variant="default"
                            disabled={participants.length < (drawMode === 'pairs' ? 2 : 3)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" /> {drawMode === 'pairs' ? t('home.match') : t('home.startDraw')}
                        </Button>
                        {participants.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {drawMode === 'secret' && participants.length < 3 && (
                                    <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 py-2 rounded-lg">{t('home.minPeople3')}</p>
                                )}
                                {drawMode === 'pairs' && (
                                    <>
                                        {participants.length < 2 && (
                                            <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 py-2 rounded-lg">{t('home.minPeople2')}</p>
                                        )}
                                        {participants.length >= 2 && participants.length % 2 !== 0 && (
                                            <p className="text-xs text-orange-500 font-medium bg-orange-50 dark:bg-orange-950/30 py-2 rounded-lg">{t('home.evenNumber')} ({participants.length})</p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 🎄 Yılbaşı Geri Sayım Banner */}
                {isNewYearThemeActive() && (
                    <div className="w-full flex justify-center mt-4 mb-2">
                        <CountdownBanner />
                    </div>
                )}

                {/* How to Play Section */}
                <div className="ys-card w-full mt-4 backdrop-blur-sm p-5">
                    <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-3 text-center flex items-center justify-center gap-2">
                        <HelpCircle className="w-5 h-5 text-santa-red" />
                        {t('howToPlay.title')}
                    </h3>
                    <p className="text-body-md text-[var(--text-secondary)] mb-4 text-center leading-relaxed font-medium">
                        {t('howToPlay.subtitle')}
                    </p>
                    <ul className="space-y-3">
                        {[1, 2, 3, 4].map((step) => (
                            <li key={step} className="flex gap-3 text-sm text-[var(--text-secondary)] items-start text-left">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-santa-red font-bold text-xs flex items-center justify-center mt-0.5 border border-red-200 dark:border-red-800/50">
                                    {step}
                                </span>
                                <span>{t(`howToPlay.step${step}`)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-full space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--text-primary)] text-center">{t('home.socialMediaGiveaways')}</h2>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <button
                            onClick={() => router.push(`/${locale}/youtube`)}
                            className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[var(--card-bg)] rounded-xl sm:rounded-2xl border border-[var(--border-light)] hover:border-red-200 dark:hover:border-red-500/30 hover:shadow-lg hover:shadow-red-100/50 dark:hover:shadow-red-900/20 transition-all"
                        >
                            <div className="p-2 sm:p-3 bg-red-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                                <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] group-hover:text-red-600 dark:group-hover:text-red-400">{t('home.youtubeGiveaway')}</span>
                        </button>

                        <button
                            onClick={() => router.push(`/${locale}/tiktok`)}
                            className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[var(--card-bg)] rounded-xl sm:rounded-2xl border border-[var(--border-light)] hover:border-cyan-200 dark:hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-100/50 dark:hover:shadow-cyan-900/20 transition-all"
                        >
                            <div className="p-2 sm:p-3 bg-black dark:bg-[var(--card-bg)] rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center ring-1 ring-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor">
                                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
                                </svg>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{t('home.tiktokGiveaway')}</span>
                        </button>
                    </div>
                </div>

                <p className="text-[var(--text-muted)] text-body-md font-medium">
                    {t('home.happyNewYear')}
                </p>
            </div>
        </main>
    );
}
