"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import { getTimeUntilNewYear } from "./config";
import { COPY } from "./CountdownBanner";

const COUNTDOWN_SECONDS = 10;
const PARTY_MS = 9000;

type Phase = "idle" | "count" | "party";

/** Full-screen final seconds of the year, for whoever is on the site at midnight. */
export function MidnightMoment({ onNewYear }: { onNewYear: () => void }) {
    const locale = useLocale();
    const tClose = useTranslations("tools.wheelOfFortuneContent");
    const [phase, setPhase] = useState<Phase>("idle");
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
    const [year, setYear] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const phaseRef = useRef<Phase>("idle");

    useEffect(() => {
        let partyTimer = 0;
        const check = () => {
            const left = getTimeUntilNewYear();
            if (left.isNewYear) {
                if (phaseRef.current !== "count") return;
                phaseRef.current = "party";
                setPhase("party");
                setYear(left.targetYear);
                onNewYear();
                celebrate({ duration: 4000 });
                partyTimer = window.setTimeout(() => {
                    phaseRef.current = "idle";
                    setPhase("idle");
                }, PARTY_MS);
                return;
            }
            const total = left.days * 86400 + left.hours * 3600 + left.minutes * 60 + left.seconds;
            if (total > COUNTDOWN_SECONDS) return;
            phaseRef.current = "count";
            setPhase("count");
            setYear(left.targetYear);
            setSeconds(total);
        };

        const interval = window.setInterval(check, 250);
        return () => {
            clearInterval(interval);
            clearTimeout(partyTimer);
        };
    }, [onNewYear]);

    if (phase === "idle" || dismissed) return null;

    const copy = COPY[locale] || COPY.en;

    return (
        <div
            role="status"
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(182,23,34,0.94),rgba(20,8,14,0.97)_70%)] px-4 text-center text-white"
        >
            <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label={tClose("close")}
                className="absolute right-3 top-3 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
                <X className="h-6 w-6" />
            </button>

            {phase === "count" ? (
                <>
                    <p className="font-heading text-2xl font-bold tabular-nums text-[#FFE08A] sm:text-3xl">{year}</p>
                    <p key={seconds} className="ys-midnight-pop mt-2 font-heading text-[150px] font-extrabold leading-none tabular-nums sm:text-[240px]">
                        {seconds}
                    </p>
                </>
            ) : (
                <>
                    <p className="ys-midnight-pop font-heading text-5xl font-extrabold leading-tight tracking-tight text-[#FFE08A] sm:text-8xl">
                        {copy.celebration}
                    </p>
                    <p className="ys-midnight-pop mt-2 font-heading text-[90px] font-extrabold leading-none tabular-nums sm:text-[150px]">{year}</p>
                </>
            )}
        </div>
    );
}
