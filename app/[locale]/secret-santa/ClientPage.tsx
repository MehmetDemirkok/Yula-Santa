/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Home Page - Localized
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Trash2, Gift, Sparkles, FileUp, Instagram, Youtube, Twitter, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslations } from 'next-intl';
import { CountdownBanner } from "@/components/NewYearTheme";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";
import * as XLSX from "xlsx";

export default function Home() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations();

    const [name, setName] = useState("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("participants_draft");
        if (saved) {
            try {
                setParticipants(JSON.parse(saved));
            } catch { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("participants_draft", JSON.stringify(participants));
    }, [participants]);

    const [drawMode, setDrawMode] = useState<'secret' | 'pairs'>('secret');

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

            const shuffled = [...currentParticipants];
            let isValid = false;
            let attempts = 0;

            while (!isValid && attempts < 1000) {
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }

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

            const shuffled = [...currentParticipants];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

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
        <main className="min-h-screen min-h-dvh flex flex-col items-center pt-24 sm:pt-32 relative overflow-hidden bg-gradient-to-b from-[#FFF5F5] to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300 safe-area-inset-bottom">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-red-200 dark:bg-red-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-green-200 dark:bg-green-900/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] opacity-30 translate-x-1/3 translate-y-1/3"></div>

            <div className="z-10 w-full max-w-md space-y-4 sm:space-y-6 md:space-y-8 text-center px-1 flex-1 flex flex-col justify-center">
                <div className="space-y-2">
                    <div className="inline-flex items-center justify-center p-1 bg-white dark:bg-gray-800 rounded-2xl mb-2 sm:mb-4 shadow-sm border border-red-50 dark:border-red-900/20 overflow-hidden ring-4 ring-white dark:ring-gray-700 shadow-xl">
                        <img src="/icon.png" alt="YulaSanta Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Yula<span className="text-santa-red">Santa</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                        {t('home.subtitle')}
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Mode Selector */}
                    <div className="flex p-1 bg-gray-100/50 dark:bg-gray-900/50 rounded-lg sm:rounded-xl">
                        <button
                            onClick={() => setDrawMode('secret')}
                            className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-md sm:rounded-lg transition-all ${drawMode === 'secret' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            {t('home.secretDraw')}
                        </button>
                        <button
                            onClick={() => setDrawMode('pairs')}
                            className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-md sm:rounded-lg transition-all ${drawMode === 'pairs' ? 'bg-white dark:bg-gray-700 text-santa-red shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            {t('home.directMatch')}
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder={t('home.inputPlaceholder')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                            className="flex-1 bg-white/50 dark:bg-gray-900/50 text-base"
                        />
                        <Button onClick={addParticipant} className="aspect-square p-0 w-11 sm:w-12 rounded-xl sm:rounded-2xl shrink-0">
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[35vh] sm:max-h-[40vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                        {participants.length === 0 && (
                            <div className="text-center py-8 sm:py-12 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl bg-gray-50/50 dark:bg-gray-900/50">
                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm sm:text-base">{t('home.noParticipants')}</p>
                            </div>
                        )}
                        {participants.map((p, i) => (
                            <div key={i} className="group flex items-center justify-between p-2.5 sm:p-3 pl-3 sm:pl-4 bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 hover:border-red-100 dark:hover:border-red-900/30">
                                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base truncate mr-2">{p}</span>
                                <button
                                    onClick={() => removeParticipant(i)}
                                    className="p-1.5 sm:p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
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
                            className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-santa-red/50 hover:text-santa-red text-xs sm:text-sm py-2.5 sm:py-3"
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

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
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
                <div className="w-full mt-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center flex items-center justify-center gap-2">
                        <HelpCircle className="w-5 h-5 text-santa-red" />
                        {t('howToPlay.title')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center leading-relaxed font-medium">
                        {t('howToPlay.subtitle')}
                    </p>
                    <ul className="space-y-3">
                        {[1, 2, 3, 4].map((step) => (
                            <li key={step} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300 items-start text-left">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-santa-red font-bold text-xs flex items-center justify-center mt-0.5 border border-red-200 dark:border-red-800/50">
                                    {step}
                                </span>
                                <span>{t(`howToPlay.step${step}`)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Social Media Giveaways Section */}
                <div className="w-full space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white text-center">{t('home.socialMediaGiveaways')}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {/* Instagram */}
                        <button
                            onClick={() => router.push(`/${locale}/instagram`)}
                            className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-100/50 dark:hover:shadow-pink-900/20 transition-all"
                        >
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400">Instagram</span>
                        </button>

                        {/* YouTube */}
                        <button
                            onClick={() => router.push(`/${locale}/youtube`)}
                            className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-500/30 hover:shadow-lg hover:shadow-red-100/50 dark:hover:shadow-red-900/20 transition-all"
                        >
                            <div className="p-2 sm:p-3 bg-red-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                                <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400">YouTube</span>
                        </button>

                        {/* Twitter/X */}
                        <button
                            onClick={() => router.push(`/${locale}/twitter`)}
                            className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-100/50 dark:hover:shadow-sky-900/20 transition-all"
                        >
                            <div className="p-2 sm:p-3 bg-black dark:bg-gray-900 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform ring-1 ring-white/10">
                                <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">Twitter/X</span>
                        </button>

                        {/* TikTok */}
                        <button
                            onClick={() => router.push(`/${locale}/tiktok`)}
                            className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-100/50 dark:hover:shadow-cyan-900/20 transition-all"
                        >
                            <div className="p-2 sm:p-3 bg-black dark:bg-gray-900 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center ring-1 ring-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor">
                                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
                                </svg>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">TikTok</span>
                        </button>
                    </div>
                </div>

                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                    {t('home.happyNewYear')}
                </p>
            </div>
        </main>
    );
}
