/**
 * Winter snowfall — six-armed snowflake particles (SVG), theme-aware
 * (visible on both light and dark backgrounds). Under reduced motion it
 * shows fewer, slower flakes instead of hiding the effect.
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

/**
 * Windows'ta "Animasyon efektleri" kapalıyken (ya da Uzak Masaüstü / "en iyi
 * performans" ayarında) Chrome `prefers-reduced-motion: reduce` bildirir.
 * Bu ziyaretçilerden karı tamamen gizlemek yerine az, yavaş ve dönmeyen
 * taneler gösteriyoruz; tercih sayfa açıkken değişirse liste yeniden kurulur.
 */
function buildFlakes(reduced: boolean): Snowflake[] {
    const narrow = window.innerWidth < 640;
    const count = reduced ? (narrow ? 8 : 12) : narrow ? 16 : 26;
    return Array.from({ length: count }, (_, i) => {
        // Çoğu ince kar; her dört taneden biri şekli seçilebilen büyük tane
        const size = i % 4 === 0 ? Math.random() * 3 + 8 : Math.random() * 2.5 + 3;
        const duration = reduced ? Math.random() * 15 + 35 : Math.random() * 12 + 14;
        return {
            id: i,
            x: Math.random() * 100,
            size,
            duration,
            delay: -Math.random() * duration,
            opacity: Math.random() * 0.35 + 0.35,
            drift: (Math.random() - 0.5) * (reduced ? 12 : 40),
            rotation: Math.random() * 360,
        };
    });
}

export function Snowfall() {
    const [flakes, setFlakes] = useState<Snowflake[]>([]);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setFlakes(buildFlakes(mq.matches));
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    if (flakes.length === 0) return null;

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
