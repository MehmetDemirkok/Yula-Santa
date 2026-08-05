/**
 * Soft winter snowfall — CSS particles, brand-neutral, respects reduced motion.
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

        const count = window.innerWidth < 640 ? 14 : 22;
        setFlakes(
            Array.from({ length: count }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                size: Math.random() * 3.5 + 2,
                duration: Math.random() * 12 + 14,
                delay: Math.random() * -24,
                opacity: Math.random() * 0.35 + 0.25,
                drift: (Math.random() - 0.5) * 40,
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
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #fff, rgba(255, 255, 255, 0.55));
                    box-shadow: 0 0 4px rgba(255, 255, 255, 0.35);
                    animation: ys-snow-fall linear infinite;
                    will-change: transform, opacity;
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
                />
            ))}
        </div>
    );
}
