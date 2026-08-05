/**
 * Soft fireworks — brand colors only, used after New Year midnight.
 */

"use client";

import { useEffect, useState } from "react";

interface Firework {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
}

const COLORS = ["#E09600", "#B61722", "#F5E6C8", "#FFFFFF"];

export function Fireworks() {
    const [fireworks, setFireworks] = useState<Firework[]>([]);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        if (mq.matches) return;

        const createFirework = () => {
            const fw: Firework = {
                id: Date.now() + Math.random(),
                x: Math.random() * 70 + 15,
                y: Math.random() * 35 + 10,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: Math.random() * 70 + 60,
            };
            setFireworks((prev) => [...prev.slice(-4), fw]);
            setTimeout(() => {
                setFireworks((prev) => prev.filter((f) => f.id !== fw.id));
            }, 1400);
        };

        for (let i = 0; i < 2; i++) setTimeout(createFirework, i * 700);
        const interval = setInterval(createFirework, 3200);
        return () => clearInterval(interval);
    }, []);

    if (reducedMotion) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
            <style jsx>{`
                @keyframes ys-fw-explode {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
                @keyframes ys-fw-particle {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(0);
                        opacity: 0;
                    }
                }
                .ys-fw {
                    position: absolute;
                    animation: ys-fw-explode 1.4s ease-out forwards;
                }
                .ys-fw-p {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    animation: ys-fw-particle 1.1s ease-out forwards;
                }
            `}</style>
            {fireworks.map((fw) => (
                <div
                    key={fw.id}
                    className="ys-fw"
                    style={{
                        left: `${fw.x}%`,
                        top: `${fw.y}%`,
                        width: fw.size,
                        height: fw.size,
                    }}
                >
                    {Array.from({ length: 10 }, (_, i) => {
                        const angle = (i * 36 * Math.PI) / 180;
                        const d = fw.size / 2;
                        return (
                            <div
                                key={i}
                                className="ys-fw-p"
                                style={
                                    {
                                        backgroundColor: fw.color,
                                        boxShadow: `0 0 6px ${fw.color}`,
                                        left: "50%",
                                        top: "50%",
                                        ["--tx" as string]: `${Math.cos(angle) * d}px`,
                                        ["--ty" as string]: `${Math.sin(angle) * d}px`,
                                        animationDelay: `${i * 0.015}s`,
                                    } as React.CSSProperties
                                }
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
