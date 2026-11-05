"use client";

import { useRef, useState } from "react";
import confetti from "canvas-confetti";

const BAUBLES = [
    { position: "left-[58%] sm:left-[46%]", thread: 46, size: 24, color: "#D62839", delay: "0s" },
    { position: "left-[74%] sm:left-[54%]", thread: 74, size: 18, color: "#E7B53C", delay: "0.7s" },
    { position: "hidden sm:block sm:left-[61%]", thread: 38, size: 20, color: "#1F9D63", delay: "1.3s" },
    { position: "hidden lg:block lg:left-[96%]", thread: 60, size: 26, color: "#D62839", delay: "0.4s" },
];

const GIFT_COLORS = ["#D62839", "#FFD166", "#34D399", "#FFFFFF"];

/** Baubles hanging from under the navbar, plus a warm glow behind the hero. */
export function HeroDecor() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 right-[-6%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(231,181,60,0.2)_0%,transparent_68%)]" />
            {BAUBLES.map((bauble) => (
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

/** Santa-hat Yula on a little snow hill; a tap makes her hop and pop a gift burst. */
export function FestiveMascot() {
    const [hopping, setHopping] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleTap = () => {
        setHopping(true);
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;
        void confetti({
            particleCount: 36,
            spread: 80,
            startVelocity: 26,
            scalar: 0.8,
            ticks: 90,
            colors: GIFT_COLORS,
            disableForReducedMotion: true,
            origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight,
            },
        });
    };

    return (
        <>
            <div
                aria-hidden="true"
                className="absolute inset-x-[2%] bottom-[12%] h-[18%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_35%,#FFFFFF_0%,#E3EDF9_55%,rgba(214,226,242,0)_72%)] dark:bg-[radial-gradient(ellipse_at_50%_35%,rgba(226,236,250,0.55)_0%,rgba(190,208,235,0.26)_50%,rgba(180,200,230,0)_72%)]"
            />
            <button
                ref={buttonRef}
                type="button"
                onClick={handleTap}
                onAnimationEnd={() => setHopping(false)}
                className={`relative z-10 block h-full w-full cursor-pointer rounded-full !min-h-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-santa-red ${hopping ? "ys-yula-hop" : ""}`}
            >
                <img
                    alt="YulaSanta Mascot"
                    className="h-full w-full object-contain drop-shadow-2xl animate-float"
                    src="/yula-mascot-santa.png"
                />
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
