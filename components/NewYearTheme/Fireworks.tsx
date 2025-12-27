/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Fireworks Animation Component
 * ═══════════════════════════════════════════════════════════════════════════
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

const colors = [
    "#FFD700", // Gold
    "#FF6B6B", // Coral
    "#4ECDC4", // Teal
    "#A855F7", // Purple
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#3B82F6", // Blue
];

export function Fireworks() {
    const [fireworks, setFireworks] = useState<Firework[]>([]);

    useEffect(() => {
        const createFirework = () => {
            const newFirework: Firework = {
                id: Date.now() + Math.random(),
                x: Math.random() * 80 + 10,
                y: Math.random() * 50 + 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 100 + 80,
            };

            setFireworks((prev) => [...prev, newFirework]);

            setTimeout(() => {
                setFireworks((prev) => prev.filter((f) => f.id !== newFirework.id));
            }, 1500);
        };

        // İlk havai fişekleri hemen başlat
        for (let i = 0; i < 3; i++) {
            setTimeout(createFirework, i * 500);
        }

        const interval = setInterval(createFirework, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            <style jsx>{`
        @keyframes firework-explode {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        @keyframes particle-fly {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        
        .firework {
          position: absolute;
          animation: firework-explode 1.5s ease-out forwards;
        }
        
        .firework-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: particle-fly 1.2s ease-out forwards;
        }
      `}</style>

            {fireworks.map((fw) => (
                <div
                    key={fw.id}
                    className="firework"
                    style={{
                        left: `${fw.x}%`,
                        top: `${fw.y}%`,
                        width: `${fw.size}px`,
                        height: `${fw.size}px`,
                    }}
                >
                    {[...Array(12)].map((_, i) => {
                        const angle = (i * 30 * Math.PI) / 180;
                        const distance = fw.size / 2;
                        const tx = Math.cos(angle) * distance;
                        const ty = Math.sin(angle) * distance;

                        return (
                            <div
                                key={i}
                                className="firework-particle"
                                style={{
                                    backgroundColor: fw.color,
                                    boxShadow: `0 0 6px ${fw.color}, 0 0 12px ${fw.color}`,
                                    left: "50%",
                                    top: "50%",
                                    "--tx": `${tx}px`,
                                    "--ty": `${ty}px`,
                                    animationDelay: `${i * 0.02}s`,
                                } as React.CSSProperties}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
