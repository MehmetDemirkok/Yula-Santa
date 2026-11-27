"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";

const BAUBLES = [
    { position: "left-[58%] sm:left-[46%]", thread: 46, size: 24, color: "#D62839", delay: "0s" },
    { position: "left-[74%] sm:left-[54%]", thread: 74, size: 18, color: "#E7B53C", delay: "0.7s" },
    { position: "hidden sm:flex sm:left-[61%]", thread: 38, size: 20, color: "#1F9D63", delay: "1.3s" },
    { position: "hidden lg:flex lg:left-[96%]", thread: 60, size: 26, color: "#D62839", delay: "0.4s" },
];

const GIFT_COLORS = ["#D62839", "#FFD166", "#34D399", "#FFFFFF"];

/** Baubles hanging from under the navbar, plus a warm glow behind the hero. */
export function HeroDecor({ baubles = BAUBLES }: { baubles?: typeof BAUBLES }) {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 right-[-6%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(231,181,60,0.2)_0%,transparent_68%)]" />
            {baubles.map((bauble) => (
                <span
                    key={bauble.position}
                    className={`ys-bauble absolute top-0 flex flex-col items-center ${bauble.position}`}
                    style={{ animationDelay: bauble.delay }}
                >
                    <span className="w-px bg-[#B98A25]/70" style={{ height: bauble.thread }} />
                    <span className="h-[5px] w-[7px] rounded-t-sm bg-[#D9AE4F]" />
                    <span
                        className="rounded-full shadow-[0_6px_14px_rgba(0,0,0,0.3)]"
                        style={{
                            width: bauble.size,
                            height: bauble.size,
                            background: `radial-gradient(circle at 34% 28%, #FFFFFF 0%, ${bauble.color} 34%, ${bauble.color} 72%, rgba(0,0,0,0.35) 100%)`,
                        }}
                    />
                </span>
            ))}
        </div>
    );
}

const MASCOT_TAPPED_KEY = "yulasanta_mascot_tapped";

// One shared confetti canvas, drawn in a worker so a burst never stalls the page.
// It is created once, when the browser is idle, instead of on the first tap.
let shooter: confetti.CreateTypes | null = null;
function getShooter(): confetti.CreateTypes {
    if (shooter) return shooter;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:70";
    document.body.appendChild(canvas);
    shooter = confetti.create(canvas, { resize: true, useWorker: true, disableForReducedMotion: true });
    return shooter;
}

const HOP: Keyframe[] = [
    { transform: "translateY(0) scale(1, 1) rotate(0deg)" },
    { transform: "translateY(0) scale(1.1, 0.88) rotate(0deg)", offset: 0.14 },
    { transform: "translateY(-24%) scale(0.94, 1.08) rotate(-7deg)", offset: 0.42 },
    { transform: "translateY(0) scale(1.08, 0.92) rotate(3deg)", offset: 0.7 },
    { transform: "translateY(-5%) scale(0.98, 1.02) rotate(0deg)", offset: 0.85 },
    { transform: "translateY(0) scale(1, 1) rotate(0deg)" },
];

function burst(origin: { x: number; y: number }, big: boolean) {
    const fire = getShooter();
    const base = { origin, colors: GIFT_COLORS, ticks: 170, gravity: 0.95 };
    void fire({ ...base, particleCount: 70, spread: 80, startVelocity: 44, scalar: 1 });
    void fire({ ...base, particleCount: 26, spread: 110, startVelocity: 34, scalar: 1.3, shapes: ["star"], colors: ["#FFD166", "#FFE08A", "#FFFFFF"] });
    window.setTimeout(() => void fire({ ...base, particleCount: 36, spread: 150, startVelocity: 24, decay: 0.92, scalar: 0.8 }), 140);
    if (big) {
        // Every fifth tap: side cannons for a proper celebration.
        void fire({ ...base, particleCount: 90, angle: 60, spread: 70, startVelocity: 62, origin: { x: 0, y: 0.9 } });
        void fire({ ...base, particleCount: 90, angle: 120, spread: 70, startVelocity: 62, origin: { x: 1, y: 0.9 } });
    }
}

/**
 * Santa-hat Yula on a little snow hill; a tap makes her hop and pop a gift burst.
 * With `hint`, a "tap me" bubble and an occasional wiggle show first-time visitors
 * that she is tappable; both go away after the first tap.
 */
export function FestiveMascot({
    sizes = "(min-width: 1024px) 360px, (min-width: 640px) 170px, 116px",
    hint = false,
}: { sizes?: string; hint?: boolean }) {
    const t = useTranslations("home");
    const buttonRef = useRef<HTMLButtonElement>(null);
    const taps = useRef(0);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
        idle(() => getShooter());
        if (!hint) return;
        const timer = window.setTimeout(() => {
            let tapped = false;
            try { tapped = localStorage.getItem(MASCOT_TAPPED_KEY) === "1"; } catch { /* private mode */ }
            if (!tapped) setShowHint(true);
        }, 1200);
        return () => window.clearTimeout(timer);
    }, [hint]);

    const handleTap = () => {
        const el = buttonRef.current;
        if (!el) return;
        taps.current += 1;
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.animate(HOP, { duration: 700, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" });
        }
        const rect = el.getBoundingClientRect();
        burst(
            { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height * 0.45) / window.innerHeight },
            taps.current % 5 === 0,
        );
        if (showHint) {
            setShowHint(false);
            try { localStorage.setItem(MASCOT_TAPPED_KEY, "1"); } catch { /* private mode */ }
        }
    };

    return (
        <>
            <div
                aria-hidden="true"
                className="absolute inset-x-[2%] bottom-[12%] h-[18%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_35%,#FFFFFF_0%,#E3EDF9_55%,rgba(214,226,242,0)_72%)] dark:bg-[radial-gradient(ellipse_at_50%_35%,rgba(226,236,250,0.55)_0%,rgba(190,208,235,0.26)_50%,rgba(180,200,230,0)_72%)]"
            />
            {showHint && (
                <span
                    aria-hidden="true"
                    className="ys-mascot-hint pointer-events-none absolute left-1/2 top-[2%] z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-santa-red px-3 py-1.5 text-[12px] font-bold text-white shadow-lg lg:top-[8%] lg:px-4 lg:py-2 lg:text-sm"
                >
                    {t("mascotHint")}
                    <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-santa-red" />
                </span>
            )}
            <button
                ref={buttonRef}
                type="button"
                onClick={handleTap}
                aria-label={t("mascotHint")}
                style={{ transformOrigin: "50% 85%" }}
                className="relative z-10 block h-full w-full cursor-pointer rounded-full !min-h-0 will-change-transform select-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-santa-red"
            >
                <span className={`block h-full w-full ${showHint ? "ys-mascot-nudge" : ""}`}>
                    <Image
                        alt=""
                        className="object-contain drop-shadow-2xl animate-float will-change-transform"
                        src="/yula-mascot-santa.png"
                        fill
                        priority
                        draggable={false}
                        sizes={sizes}
                    />
                </span>
            </button>
        </>
    );
}

/** Snow settled along the top of a card. The parent needs `relative overflow-hidden`. */
export function SnowCap() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 400 14"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 h-[10px] w-full fill-[#D8E5F5] dark:fill-[#EEF3FB]"
        >
            <path d="M0 0H400V4C385 11 372 11 358 6C345 2 332 3 318 8C302 13 288 12 272 6C258 1 244 3 230 8C214 13 198 11 184 5C170 1 156 3 142 9C128 13 112 12 98 6C84 1 70 3 56 8C40 13 24 12 12 7C7 5 3 4 0 4Z" />
        </svg>
    );
}

/** Gift bow tied at the top of the seasonal card. */
export function GiftBow() {
    return (
        <svg aria-hidden="true" viewBox="0 0 48 26" className="pointer-events-none absolute left-1/2 top-[4px] h-[24px] w-[44px] -translate-x-1/2">
            <path d="M24 13C17 2 5 1 4 7C3 13 15 16 24 13Z" fill="#E7B53C" stroke="#B98A25" strokeWidth="1" />
            <path d="M24 13C31 2 43 1 44 7C45 13 33 16 24 13Z" fill="#E7B53C" stroke="#B98A25" strokeWidth="1" />
            <path d="M22 14L15 25L21 23L24 15Z" fill="#D9AE4F" />
            <path d="M26 14L33 25L27 23L24 15Z" fill="#D9AE4F" />
            <circle cx="24" cy="13" r="3.5" fill="#FFE08A" stroke="#B98A25" strokeWidth="1" />
        </svg>
    );
}
