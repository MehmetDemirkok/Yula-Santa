/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Glitter Overlay Animation Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useEffect, useState } from "react";

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    animationDuration: number;
    animationDelay: number;
}

export function GlitterOverlay() {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    useEffect(() => {
        const particles: Sparkle[] = [];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                animationDuration: Math.random() * 2 + 1,
                animationDelay: Math.random() * 2,
            });
        }

        setSparkles(particles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
            <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .sparkle {
          position: absolute;
          animation: sparkle ease-in-out infinite;
        }
        
        .sparkle::before,
        .sparkle::after {
          content: "";
          position: absolute;
          background: linear-gradient(45deg, #FFD700, #FFF);
        }
        
        .sparkle::before {
          width: 100%;
          height: 2px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        
        .sparkle::after {
          width: 2px;
          height: 100%;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
      `}</style>

            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    className="sparkle"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        width: `${sparkle.size}px`,
                        height: `${sparkle.size}px`,
                        animationDuration: `${sparkle.animationDuration}s`,
                        animationDelay: `${sparkle.animationDelay}s`,
                    }}
                />
            ))}
        </div>
    );
}
