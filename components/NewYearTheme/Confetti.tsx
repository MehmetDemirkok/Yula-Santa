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
  "#FFFFFF", // Pure White
  "#E0F2FE", // Light Blue
  "#F8FAFC", // Ghost White
  "#BAE6FD", // Sky Blue tint
];

export function Confetti() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const pieces: ConfettiPiece[] = [];
    const pieceCount = 30; // Reduced from 80 for a more subtle effect

    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6, // Slightly larger flakes
        rotation: Math.random() * 360,
        animationDuration: Math.random() * 6 + 10, // Slower fall
        animationDelay: Math.random() * -15,
        shape: "circle", // Circles looks better for soft snow
      });
    }

    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }
        
        @keyframes confetti-sway {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(50px);
          }
          75% {
            transform: translateX(-50px);
          }
        }
        
        .confetti-piece {
          position: absolute;
          top: -20px;
          animation: confetti-fall linear infinite;
        }
        
        .confetti-inner {
          animation: confetti-sway 4s ease-in-out infinite;
          display: flex;
          items-center: center;
          justify-content: center;
          color: white;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
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
              fontSize: `${piece.size}px`,
              opacity: 0.6,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          >
            ❄
          </div>
        </div>
      ))}
    </div>
  );
}
