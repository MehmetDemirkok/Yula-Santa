/**
 * Countdown — YulaSanta winter mantelpiece clock.
 * Brand: santa-red + gold on deep evergreen night (no purple neon).
 */

"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getTimeUntilNewYear } from "./config";

const COPY: Record<
    string,
    { until: string; celebration: string; days: string; hours: string; minutes: string; seconds: string }
> = {
    tr: { until: "{year}'ya kalan süre", celebration: "Mutlu Yıllar", days: "Gün", hours: "Saat", minutes: "Dk", seconds: "Sn" },
    en: { until: "Countdown to {year}", celebration: "Happy New Year", days: "Days", hours: "Hrs", minutes: "Min", seconds: "Sec" },
    de: { until: "Countdown bis {year}", celebration: "Frohes neues Jahr", days: "Tage", hours: "Std", minutes: "Min", seconds: "Sek" },
    fr: { until: "Compte à rebours {year}", celebration: "Bonne année", days: "Jours", hours: "Hrs", minutes: "Min", seconds: "Sec" },
    es: { until: "Cuenta atrás a {year}", celebration: "Feliz Año Nuevo", days: "Días", hours: "Hrs", minutes: "Min", seconds: "Seg" },
    it: { until: "Conto alla rovescia {year}", celebration: "Buon Anno", days: "Giorni", hours: "Ore", minutes: "Min", seconds: "Sec" },
    pt: { until: "Contagem para {year}", celebration: "Feliz Ano Novo", days: "Dias", hours: "Hrs", minutes: "Min", seconds: "Seg" },
    ru: { until: "До {year}", celebration: "С Новым Годом", days: "Дн", hours: "Час", minutes: "Мин", seconds: "Сек" },
    ar: { until: "العد التنازلي لـ {year}", celebration: "سنة سعيدة", days: "يوم", hours: "ساعة", minutes: "د", seconds: "ث" },
    ja: { until: "{year}まで", celebration: "明けましておめでとう", days: "日", hours: "時", minutes: "分", seconds: "秒" },
    ko: { until: "{year}까지", celebration: "새해 복 많이 받으세요", days: "일", hours: "시", minutes: "분", seconds: "초" },
    zh: { until: "距 {year}", celebration: "新年快乐", days: "天", hours: "时", minutes: "分", seconds: "秒" },
};

export function CountdownBanner() {
    const locale = useLocale();
    const copy = COPY[locale] || COPY.en;
    const [timeLeft, setTimeLeft] = useState(getTimeUntilNewYear());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTimeLeft(getTimeUntilNewYear()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    const untilLabel = copy.until.replace("{year}", String(timeLeft.targetYear));

    return (
        <div className="z-40 pointer-events-auto animate-slide-up">
            <div
                className="relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] shadow-[0_12px_40px_-12px_rgba(182,23,34,0.45)]"
                style={{
                    background:
                        "linear-gradient(145deg, #1A1210 0%, #2A1814 45%, #1C2418 100%)",
                }}
            >
                {/* Gold top edge */}
                <div
                    className="absolute inset-x-0 top-0 h-px opacity-80"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, var(--gold), transparent)",
                    }}
                />

                <div className="relative px-4 sm:px-5 py-3.5 sm:py-4">
                    {timeLeft.isNewYear ? (
                        <div className="flex items-center justify-center gap-3 text-center">
                            <span className="text-gold text-lg" aria-hidden>
                                ✦
                            </span>
                            <div>
                                <p className="text-[11px] sm:text-xs tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--gold)_85%,white)] font-semibold mb-0.5">
                                    {copy.celebration}
                                </p>
                                <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
                                    {timeLeft.targetYear}
                                </p>
                            </div>
                            <span className="text-gold text-lg" aria-hidden>
                                ✦
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2.5">
                            <p className="text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--gold)_70%,white)] font-semibold">
                                {untilLabel}
                            </p>
                            <div className="flex items-center gap-1.5 sm:gap-2" role="timer" aria-live="polite">
                                <TimeBox value={timeLeft.days} label={copy.days} />
                                <Colon />
                                <TimeBox value={timeLeft.hours} label={copy.hours} />
                                <Colon />
                                <TimeBox value={timeLeft.minutes} label={copy.minutes} />
                                <Colon />
                                <TimeBox value={timeLeft.seconds} label={copy.seconds} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Colon() {
    return (
        <span className="text-base sm:text-lg font-bold text-[color-mix(in_srgb,var(--gold)_55%,transparent)] pb-3 select-none" aria-hidden>
            :
        </span>
    );
}

function TimeBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center min-w-[2.75rem] sm:min-w-[3.25rem]">
            <div
                className="w-full rounded-lg px-2 py-1.5 sm:py-2 text-center border border-white/10"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(182,23,34,0.18) 100%)",
                }}
            >
                <span className="font-heading text-lg sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
                    {value.toString().padStart(2, "0")}
                </span>
            </div>
            <span className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-wider text-white/45 font-medium">
                {label}
            </span>
        </div>
    );
}
