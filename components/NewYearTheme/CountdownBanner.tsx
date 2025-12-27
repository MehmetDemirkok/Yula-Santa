/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Countdown Banner Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useEffect, useState } from "react";
import { getTimeUntilNewYear, TARGET_YEAR } from "./config";
import { Sparkles, PartyPopper } from "lucide-react";

export function CountdownBanner() {
    const [timeLeft, setTimeLeft] = useState(getTimeUntilNewYear());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(getTimeUntilNewYear());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    return (
        <div className="z-40 animate-slide-up pointer-events-auto">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 p-[2px] rounded-2xl shadow-2xl shadow-purple-500/30">
                <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 rounded-2xl">
                    {timeLeft.isNewYear ? (
                        // Yeni Yıl kutlaması
                        <div className="flex items-center gap-3 sm:gap-4">
                            <PartyPopper className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-bounce" />
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-purple-300 font-medium">🎊 Mutlu Yıllar! 🎊</p>
                                <p className="text-xl sm:text-3xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                    {TARGET_YEAR}
                                </p>
                            </div>
                            <PartyPopper className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-bounce" />
                        </div>
                    ) : (
                        // Geri sayım
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
                            <div>
                                <p className="text-[10px] sm:text-xs text-purple-300 font-medium text-center mb-1.5">
                                    ✨ {TARGET_YEAR}&apos;ya Kalan Süre ✨
                                </p>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <TimeBox value={timeLeft.days} label="Gün" />
                                    <span className="text-lg sm:text-xl font-bold text-white animate-pulse">:</span>
                                    <TimeBox value={timeLeft.hours} label="Saat" />
                                    <span className="text-lg sm:text-xl font-bold text-white animate-pulse">:</span>
                                    <TimeBox value={timeLeft.minutes} label="Dk" />
                                    <span className="text-lg sm:text-xl font-bold text-white animate-pulse">:</span>
                                    <TimeBox value={timeLeft.seconds} label="Sn" />
                                </div>
                            </div>
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TimeBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
                <span className="text-lg sm:text-2xl font-black text-white tabular-nums">
                    {value.toString().padStart(2, "0")}
                </span>
            </div>
            <span className="text-[8px] sm:text-[10px] text-purple-300 mt-0.5 font-medium">{label}</span>
        </div>
    );
}
