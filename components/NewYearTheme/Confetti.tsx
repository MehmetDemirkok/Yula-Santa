/**
 * Festive paper confetti — only for New Year celebration (Jan 1–9).
 * Brand palette: crimson, gold, cream, evergreen.
 */

"use client";

import { useEffect, useState } from "react";

interface Piece {
    id: number;
    x: number;
    color: string;
    w: number;
    h: number;
    duration: number;
    delay: number;
    rotate: number;
}

const COLORS = ["#B61722", "#E09600", "#F5E6C8", "#1A3A2A", "#FFFFFF"];

export function Confetti() {
    const [pieces, setPieces] = useState<Piece[]>([]);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const onChange = () => setReducedMotion(mq.matches);
        mq.addEventListener("change", onChange);

        if (mq.matches) return () => mq.removeEventListener("change", onChange);

        const count = window.innerWidth < 640 ? 16 : 28;
        setPieces(
            Array.from({ length: count }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: COLORS[i % COLORS.length],
                w: Math.random() * 6 + 4,
                h: Math.random() * 10 + 6,
                duration: Math.random() * 5 + 8,
                delay: Math.random() * -12,
                rotate: Math.random() * 360,
            }))
        );

        return () => mq.removeEventListener("change", onChange);
    }, []);

    if (reducedMotion || pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden>
            <style jsx>{`
                @keyframes ys-confetti-fall {
                    0% {
                        transform: translateY(-10vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.9;
                    }
                    100% {
                        transform: translateY(110vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .ys-confetti {
                    position: absolute;
                    top: 0;
                    border-radius: 1px;
                    animation: ys-confetti-fall linear infinite;
                    will-change: transform, opacity;
                }
            `}</style>
            {pieces.map((p) => (
                <span
                    key={p.id}
                    className="ys-confetti"
                    style={{
                        left: `${p.x}%`,
                        width: p.w,
                        height: p.h,
                        backgroundColor: p.color,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        transform: `rotate(${p.rotate}deg)`,
                    }}
                />
            ))}
        </div>
    );
}
