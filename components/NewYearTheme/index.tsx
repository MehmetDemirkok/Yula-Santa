/**
 * New Year Theme — YulaSanta winter season pack.
 * Active: Nov 30 → Jan 10 (config.ts). Brand: crimson + gold + evergreen.
 */

"use client";

import { useState, useEffect } from "react";
import { getTimeUntilNewYear, isNewYearThemeActive } from "./config";
import { Snowfall } from "./Snowfall";
import { Fireworks } from "./Fireworks";
import { Confetti } from "./Confetti";
import { CountdownBanner } from "./CountdownBanner";
import { GlitterOverlay } from "./GlitterOverlay";

interface NewYearThemeProps {
    showSnowfall?: boolean;
    showFireworks?: boolean;
    showConfetti?: boolean;
    showCountdown?: boolean;
    showGlitter?: boolean;
}

export function NewYearTheme({
    showSnowfall = true,
    showFireworks = true,
    showConfetti = true,
    showCountdown = false,
    showGlitter = true,
}: NewYearThemeProps) {
    const [isActive, setIsActive] = useState(false);
    const [isCelebration, setIsCelebration] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const sync = () => {
            const active = isNewYearThemeActive();
            setIsActive(active);
            setIsCelebration(active && getTimeUntilNewYear().isNewYear);
            document.documentElement.classList.toggle("ys-new-year", active);
        };

        sync();
        const interval = setInterval(sync, 60_000);
        return () => {
            clearInterval(interval);
            document.documentElement.classList.remove("ys-new-year");
        };
    }, []);

    if (!mounted || !isActive) return null;

    return (
        <>
            {showSnowfall && <Snowfall />}
            {showGlitter && <GlitterOverlay />}
            {/* Paper confetti + fireworks only after midnight Jan 1 */}
            {showConfetti && isCelebration && <Confetti />}
            {showFireworks && isCelebration && <Fireworks />}
            {showCountdown && <CountdownBanner />}
        </>
    );
}

export { Snowfall } from "./Snowfall";
export { Fireworks } from "./Fireworks";
export { Confetti } from "./Confetti";
export { CountdownBanner } from "./CountdownBanner";
export { GlitterOverlay } from "./GlitterOverlay";
export { isNewYearThemeActive, getTargetYear, getTimeUntilNewYear, TARGET_YEAR } from "./config";
