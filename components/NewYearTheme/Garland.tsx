"use client";

import { useEffect, useRef } from "react";

const BULB_COLORS = ["#FF4B55", "#FFD166", "#34D399", "#60A5FA"];
const SEGMENTS = 44; // Wide enough for any screen; the overflow is clipped.

/** A thin string of lights that follows the bottom edge of the fixed navbar. */
export function Garland() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const header = document.querySelector("header");
        const root = rootRef.current;
        if (!header || !root) return;

        const place = () => {
            root.style.top = `${header.getBoundingClientRect().bottom}px`;
        };
        place();

        // Border box, because the navbar shrinks on scroll by changing only its padding.
        const observer = new ResizeObserver(place);
        observer.observe(header, { box: "border-box" });
        window.addEventListener("resize", place);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", place);
        };
    }, []);

    return (
        <div
            ref={rootRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 right-0 z-[99] flex h-[13px] overflow-hidden"
        >
            {Array.from({ length: SEGMENTS }, (_, i) => {
                const color = BULB_COLORS[i % BULB_COLORS.length];
                return (
                    <span key={i} className="relative h-full w-[64px] shrink-0">
                        <svg viewBox="0 0 64 8" className="absolute inset-x-0 top-0 h-[8px] w-full" preserveAspectRatio="none">
                            <path
                                d="M0 1 Q32 8 64 1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-[#7A5A2A]/60 dark:text-white/30"
                            />
                        </svg>
                        <span
                            className="ys-garland-bulb absolute left-1/2 top-[4px] h-[7px] w-[5px] -translate-x-1/2 rounded-b-full rounded-t-sm"
                            style={{
                                backgroundColor: color,
                                boxShadow: `0 0 6px 1px ${color}`,
                                animationDelay: `${(i % 4) * 0.45}s`,
                            }}
                        />
                    </span>
                );
            })}
        </div>
    );
}
