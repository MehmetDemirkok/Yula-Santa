/**
 * Winter snowfall — six-armed snowflake particles (SVG), theme-aware
 * (visible on both light and dark backgrounds), respects reduced motion.
 */

"use client";

import { useEffect, useState } from "react";

interface Snowflake {
    id: number;
    x: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
    drift: number;
    rotation: number;
}

function SnowflakeIcon({ rotation }: { rotation: number }) {
    return (
        <svg
            viewBox="-12 -12 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            aria-hidden
            style={{ width: "100%", height: "100%", transform: `rotate(${rotation}deg)` }}
        >
            {[0, 60, 120, 180, 240, 300].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                    <line x1={0} y1={0} x2={0} y2={-10} />
                    <line x1={0} y1={-6.5} x2={-2.4} y2={-8.9} />
                    <line x1={0} y1={-6.5} x2={2.4} y2={-8.9} />
                </g>
            ))}
        </svg>
    );
}

export function Snowfall() {
    const [flakes, setFlakes] = useState<Snowflake[]>([]);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const onChange = () => setReducedMotion(mq.matches);
        mq.addEventListener("change", onChange);

        if (mq.matches) return () => mq.removeEventListener("change", onChange);

        const count = window.innerWidth < 640 ? 16 : 26;
        setFlakes(
            Array.from({ length: count }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                size: Math.random() * 2 + 2.5, // ~2.5–4.5px — küçük kar taneleri
                duration: Math.random() * 12 + 14,
                delay: Math.random() * -24,
                opacity: Math.random() * 0.35 + 0.35,
                drift: (Math.random() - 0.5) * 40,
                rotation: Math.random() * 360,
            }))
        );

        return () => mq.removeEventListener("change", onChange);
    }, []);

    if (reducedMotion || flakes.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
            <style jsx>{`
                @keyframes ys-snow-fall {
                    0% {
                        transform: translate3d(0, -8vh, 0);
                        opacity: 0;
                    }
                    8% {
                        opacity: 1;
                    }
                    92% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate3d(var(--drift), 105vh, 0);
                        opacity: 0;
                    }
                }
                .ys-flake {
                    position: absolute;
                    top: 0;
                    color: #6b80a4; /* light mode: cool slate-blue, visible on near-white bg */
                    filter: drop-shadow(0 0 1px rgba(107, 128, 164, 0.45));
                    animation: ys-snow-fall linear infinite;
                    will-change: transform, opacity;
                }
                :global(.dark) .ys-flake {
                    color: #ffffff;
                    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.45));
                }
            `}</style>
            {flakes.map((f) => (
                <span
                    key={f.id}
                    className="ys-flake"
                    style={
                        {
                            left: `${f.x}%`,
                            width: f.size,
                            height: f.size,
                            opacity: f.opacity,
                            animationDuration: `${f.duration}s`,
                            animationDelay: `${f.delay}s`,
                            ["--drift" as string]: `${f.drift}px`,
                        } as React.CSSProperties
                    }
                >
                    <SnowflakeIcon rotation={f.rotation} />
                </span>
            ))}
        </div>
    );
}
