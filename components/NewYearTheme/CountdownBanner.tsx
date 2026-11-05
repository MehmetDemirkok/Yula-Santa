/**
 * Countdown — YulaSanta winter mantelpiece clock.
 * Brand: santa-red + gold on deep evergreen night (no purple neon).
 */

"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { TreePine } from "lucide-react";
import { getTimeUntilNewYear } from "./config";

export const COPY: Record<
    string,
    { until: string; celebration: string; days: string; hours: string; minutes: string; seconds: string }
> = {
    tr: { until: "{year} yılına kalan süre", celebration: "Mutlu Yıllar", days: "Gün", hours: "Saat", minutes: "Dk", seconds: "Sn" },
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

const STARS = [
    { className: "left-[6px] bottom-[6px] text-[9px] opacity-60" },
    { className: "right-[8px] top-[14px] text-[8px] opacity-70 animate-pulse" },
    { className: "left-[38%] top-[13px] text-[7px] opacity-50 animate-pulse" },
];

export function CountdownBanner({ compact = false }: { compact?: boolean }) {
    const locale = useLocale();
    const copy = COPY[locale] || COPY.en;
    const [timeLeft, setTimeLeft] = useState(getTimeUntilNewYear());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTimeLeft(getTimeUntilNewYear()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Compact reserves its height, so the buttons below don't jump when it appears.
    if (!mounted) return compact ? <div className="min-h-[93px] sm:min-h-[71px]" aria-hidden="true" /> : null;

    const untilLabel = copy.until.replace("{year}", String(timeLeft.targetYear));

    if (compact) {
        return (
            <div
                className={`relative overflow-hidden rounded-2xl border border-[#E7C26A]/70 shadow-[0_12px_30px_-12px_rgba(182,23,34,0.7)] ${timeLeft.days === 0 && !timeLeft.isNewYear ? "ys-countdown-final" : ""}`}
                style={{
                    background:
                        "radial-gradient(circle at 12% 10%, #E0404F 0%, transparent 55%), linear-gradient(135deg, #B61722 0%, #8E101B 60%, #5F0A13 100%)",
                }}
            >
                {/* Snow settled along the top edge */}
                <svg
                    aria-hidden="true"
                    viewBox="0 0 400 14"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 top-0 h-[12px] w-full"
                >
                    <path
                        fill="#FFFDF8"
                        d="M0 0H400V4C385 11 372 11 358 6C345 2 332 3 318 8C302 13 288 12 272 6C258 1 244 3 230 8C214 13 198 11 184 5C170 1 156 3 142 9C128 13 112 12 98 6C84 1 70 3 56 8C40 13 24 12 12 7C7 5 3 4 0 4Z"
                    />
                </svg>

                {STARS.map((star) => (
                    <span
                        key={star.className}
                        aria-hidden="true"
                        className={`absolute text-[#FFE08A] motion-reduce:animate-none ${star.className}`}
                    >
                        ✦
                    </span>
                ))}

                {timeLeft.isNewYear ? (
                    <p className="relative px-3 pb-3 pt-[20px] text-center font-heading text-lg font-extrabold text-[#FFF1C2]">
                        {copy.celebration} {timeLeft.targetYear}
                    </p>
                ) : (
                    <div className="relative flex flex-col items-center gap-x-4 gap-y-2 px-3 pb-3 pt-[18px] sm:flex-row sm:justify-between">
                        <p className="flex items-center gap-1.5 text-center font-heading text-[13px] font-bold leading-tight text-[#FFF1C2]">
                            <TreePine className="h-[18px] w-[18px] shrink-0 text-[#FFE08A]" aria-hidden="true" />
                            {untilLabel}
                        </p>
                        <div role="timer" className="grid w-full grid-cols-4 gap-1.5 sm:w-auto">
                            {[
                                [timeLeft.days, copy.days],
                                [timeLeft.hours, copy.hours],
                                [timeLeft.minutes, copy.minutes],
                                [timeLeft.seconds, copy.seconds],
                            ].map(([value, label]) => (
                                <div
                                    key={label}
                                    className="rounded-lg bg-[#FFFBF2] px-1 py-1 text-center shadow-[0_2px_6px_rgba(60,0,8,0.4)] sm:min-w-[50px]"
                                >
                                    <div className="font-heading text-[19px] font-extrabold leading-none tabular-nums text-[#B61722]">
                                        {value.toString().padStart(2, "0")}
                                    </div>
                                    <div className="mt-0.5 text-[10px] font-semibold leading-none text-[#7A5A2A]">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
