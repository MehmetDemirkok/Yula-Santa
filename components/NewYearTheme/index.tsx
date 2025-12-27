/**
 * ═══════════════════════════════════════════════════════════════════════════
 * New Year Theme - Main Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bu bileşen tüm yılbaşı dekorasyon ve efektlerini bir araya getirir.
 * 
 * KULLANIM:
 * - components/NewYearTheme/config.ts dosyasında ENABLE_NEW_YEAR_THEME = true/false
 *   ile temayı açıp kapatabilirsiniz.
 * - NEW_YEAR_THEME_END_DATE ile temanın otomatik kapanacağı tarihi belirleyebilirsiniz.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useState, useEffect } from "react";
import { isNewYearThemeActive } from "./config";
import { Snowfall } from "./Snowfall";
import { Fireworks } from "./Fireworks";
import { Confetti } from "./Confetti";
import { CountdownBanner } from "./CountdownBanner";
import { GlitterOverlay } from "./GlitterOverlay";

interface NewYearThemeProps {
    // Kar yağışı göster
    showSnowfall?: boolean;
    // Havai fişek göster
    showFireworks?: boolean;
    // Konfeti göster
    showConfetti?: boolean;
    // Geri sayım banner göster
    showCountdown?: boolean;
    // Parıltı overlay göster
    showGlitter?: boolean;
}

export function NewYearTheme({
    showSnowfall = true,
    showFireworks = false,
    showConfetti = true,
    showCountdown = true,
    showGlitter = true,
}: NewYearThemeProps) {
    const [isActive, setIsActive] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsActive(isNewYearThemeActive());
    }, []);

    // SSR'da ve tema aktif değilse hiçbir şey render etme
    if (!mounted || !isActive) return null;

    return (
        <>
            {showSnowfall && <Snowfall />}
            {showFireworks && <Fireworks />}
            {showConfetti && <Confetti />}
            {showGlitter && <GlitterOverlay />}
            {showCountdown && <CountdownBanner />}
        </>
    );
}

// Export all components for individual use
export { Snowfall } from "./Snowfall";
export { Fireworks } from "./Fireworks";
export { Confetti } from "./Confetti";
export { CountdownBanner } from "./CountdownBanner";
export { GlitterOverlay } from "./GlitterOverlay";
export { isNewYearThemeActive, ENABLE_NEW_YEAR_THEME, NEW_YEAR_THEME_END_DATE, TARGET_YEAR } from "./config";
