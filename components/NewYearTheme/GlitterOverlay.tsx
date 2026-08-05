/**
 * Sparse gold twinkles — quiet sparkle, not a glitter storm.
 */

"use client";

import { useEffect, useState } from "react";

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

export function GlitterOverlay() {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const onChange = () => setReducedMotion(mq.matches);
        mq.addEventListener("change", onChange);

        if (mq.matches) return () => mq.removeEventListener("change", onChange);

        const count = 12;
        setSparkles(
            Array.from({ length: count }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 70 + 5,
                size: Math.random() * 3 + 2,
                duration: Math.random() * 3 + 2.5,
                delay: Math.random() * 4,
            }))
        );

        return () => mq.removeEventListener("change", onChange);
    }, []);

    if (reducedMotion || sparkles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
            <style jsx>{`
                @keyframes ys-twinkle {
                    0%,
                    100% {
                        opacity: 0;
                        transform: scale(0.4) rotate(0deg);
                    }
                    50% {
                        opacity: 0.85;
                        transform: scale(1) rotate(45deg);
                    }
                }
                .ys-spark {
                    position: absolute;
                    animation: ys-twinkle ease-in-out infinite;
                }
                .ys-spark::before,
                .ys-spark::after {
                    content: "";
                    position: absolute;
                    background: linear-gradient(90deg, transparent, var(--gold), transparent);
                    left: 50%;
                    top: 50%;
                }
                .ys-spark::before {
                    width: 100%;
                    height: 1.5px;
                    transform: translate(-50%, -50%);
                }
                .ys-spark::after {
                    width: 1.5px;
                    height: 100%;
                    transform: translate(-50%, -50%);
                }
            `}</style>
            {sparkles.map((s) => (
                <span
                    key={s.id}
                    className="ys-spark"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        animationDuration: `${s.duration}s`,
                        animationDelay: `${s.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
