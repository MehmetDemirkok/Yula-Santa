/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Confetti Animation Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    size: number;
    rotation: number;
    animationDuration: number;
    animationDelay: number;
    shape: "rect" | "circle";
}

const colors = [
    "#FFD700", // Gold
    "#C0C0C0", // Silver
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#A855F7", // Purple
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#10B981", // Emerald
];

export function Confetti() {
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        const pieces: ConfettiPiece[] = [];
        const pieceCount = 80;

        for (let i = 0; i < pieceCount; i++) {
            pieces.push({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                animationDuration: Math.random() * 4 + 6,
                animationDelay: Math.random() * -10,
                shape: Math.random() > 0.5 ? "rect" : "circle",
            });
        }

        setConfetti(pieces);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg) scale(1);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes confetti-sway {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(30px);
          }
          75% {
            transform: translateX(-30px);
          }
        }
        
        .confetti-piece {
          position: absolute;
          top: -20px;
          animation: confetti-fall linear infinite;
        }
        
        .confetti-inner {
          animation: confetti-sway 2s ease-in-out infinite;
        }
      `}</style>

            {confetti.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: `${piece.x}%`,
                        animationDuration: `${piece.animationDuration}s`,
                        animationDelay: `${piece.animationDelay}s`,
                    }}
                >
                    <div
                        className="confetti-inner"
                        style={{
                            width: `${piece.size}px`,
                            height: piece.shape === "rect" ? `${piece.size * 1.5}px` : `${piece.size}px`,
                            backgroundColor: piece.color,
                            borderRadius: piece.shape === "circle" ? "50%" : "2px",
                            transform: `rotate(${piece.rotation}deg)`,
                            boxShadow: `0 0 4px ${piece.color}`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
