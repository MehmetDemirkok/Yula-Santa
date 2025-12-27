/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Snowfall Animation Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  x: number;
  size: number;
  animationDuration: number;
  animationDelay: number;
  opacity: number;
}

export function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = [];
    const flakeCount = 50;

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 8 + 4,
        animationDuration: Math.random() * 10 + 8,
        animationDelay: Math.random() * -15,
        opacity: Math.random() * 0.6 + 0.4,
      });
    }

    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @keyframes sway {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }
        
        .snowflake {
          position: absolute;
          top: -20px;
          color: white;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          animation: snowfall linear infinite;
        }
        
        .snowflake-inner {
          animation: sway 3s ease-in-out infinite;
        }
      `}</style>

      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.x}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
          }}
        >
          <div className="snowflake-inner">❄</div>
        </div>
      ))}
    </div>
  );
}
