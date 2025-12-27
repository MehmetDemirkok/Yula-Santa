"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, ChevronDown } from 'lucide-react';

// 3D Zar SVG Bileşeni
const Dice3D = ({ value, isRolling }: { value: number; isRolling: boolean }) => {
    const dotPositions: Record<number, { cx: number; cy: number }[]> = {
        1: [{ cx: 50, cy: 50 }],
        2: [{ cx: 25, cy: 25 }, { cx: 75, cy: 75 }],
        3: [{ cx: 25, cy: 25 }, { cx: 50, cy: 50 }, { cx: 75, cy: 75 }],
        4: [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
        5: [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 50, cy: 50 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
        6: [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 25, cy: 50 }, { cx: 75, cy: 50 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
    };

    return (
        <div
            className={`relative transition-all duration-300 ${isRolling ? 'dice-rolling' : 'dice-bounce'}`}
            style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
            }}
        >
            <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                className="drop-shadow-2xl"
            >
                {/* Zar gövdesi - gradient ile 3D efekt */}
                <defs>
                    <linearGradient id={`diceGradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#f3f4f6" />
                        <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                    <filter id="diceShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.25" />
                    </filter>
                </defs>

                {/* Ana zar gövdesi */}
                <rect
                    x="5"
                    y="5"
                    width="90"
                    height="90"
                    rx="16"
                    fill={`url(#diceGradient-${value})`}
                    stroke="#d1d5db"
                    strokeWidth="1"
                    filter="url(#diceShadow)"
                />

                {/* 3D kenar efekti - üst */}
                <rect
                    x="5"
                    y="5"
                    width="90"
                    height="8"
                    rx="16"
                    fill="white"
                    opacity="0.6"
                />

                {/* Noktalar */}
                {dotPositions[value]?.map((pos, idx) => (
                    <circle
                        key={idx}
                        cx={pos.cx}
                        cy={pos.cy}
                        r="10"
                        fill="#1f2937"
                        className={isRolling ? '' : 'animate-fade-in'}
                        style={{ animationDelay: `${idx * 50}ms` }}
                    />
                ))}
            </svg>
        </div>
    );
};

export default function DicePage() {
    const [diceCount, setDiceCount] = useState(1);
    const [results, setResults] = useState<number[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [rollHistory, setRollHistory] = useState<{ dice: number[]; total: number }[]>([]);

    // Dropdown dışına tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = () => setIsDropdownOpen(false);
        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    const rollDice = () => {
        setIsRolling(true);

        // Ses efekti simulasyonu için titreşim (mobilde)
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50, 50, 100]);
        }

        // Animasyon - hızlı değişen değerler
        let count = 0;
        const interval = setInterval(() => {
            setResults(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
            count++;
            if (count > 15) {
                clearInterval(interval);
                const finalResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
                setResults(finalResults);
                setRollHistory(prev => [...prev.slice(-4), {
                    dice: finalResults,
                    total: finalResults.reduce((a, b) => a + b, 0)
                }]);
                setIsRolling(false);
            }
        }, 80);
    };

    const total = results.reduce((sum, val) => sum + val, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 sm:py-12 px-4">
            {/* CSS for dice animations */}
            <style jsx global>{`
                @keyframes diceRoll {
                    0% { transform: rotateX(0deg) rotateY(0deg) scale(1); }
                    25% { transform: rotateX(90deg) rotateY(45deg) scale(1.1); }
                    50% { transform: rotateX(180deg) rotateY(90deg) scale(1); }
                    75% { transform: rotateX(270deg) rotateY(135deg) scale(1.1); }
                    100% { transform: rotateX(360deg) rotateY(180deg) scale(1); }
                }
                @keyframes diceBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-10px) scale(1.02); }
                }
                .dice-rolling {
                    animation: diceRoll 0.3s linear infinite;
                }
                .dice-bounce {
                    animation: diceBounce 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>

            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <Link
                        href="/"
                        className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                            🎲 Zar Atma Oyunu
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Dice Roller</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 md:p-8">
                    {/* Dropdown Dice Count Selector */}
                    <div className="mb-6 sm:mb-8">
                        <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                            Zar Sayısı / Number of Dice
                        </label>
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎲</span>
                                    <span className="font-bold text-gray-800 text-lg">{diceCount} Zar</span>
                                    <span className="text-gray-400 text-sm">({diceCount} Dice)</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
                                    {[1, 2].map((num) => (
                                        <button
                                            key={num}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDiceCount(num);
                                                setResults([]);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${diceCount === num ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                                }`}
                                        >
                                            <span className="text-xl">
                                                {'🎲'.repeat(num)}
                                            </span>
                                            <span className="font-medium">{num} Zar</span>
                                            <span className="text-gray-400 text-sm">({num} Dice)</span>
                                            {diceCount === num && (
                                                <span className="ml-auto text-blue-600">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dice Display Area */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 min-h-[180px] flex items-center justify-center border border-gray-200">
                        {results.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                                {results.map((value, index) => (
                                    <Dice3D
                                        key={index}
                                        value={value}
                                        isRolling={isRolling}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <span className="text-5xl sm:text-6xl mb-3 opacity-30">🎲</span>
                                <p className="text-sm sm:text-base">Zar atmak için butona tıklayın</p>
                                <p className="text-xs text-gray-300">Click to roll the dice</p>
                            </div>
                        )}
                    </div>

                    {/* Total Display */}
                    {results.length > 0 && !isRolling && (
                        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Toplam / Total</p>
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                                <span className="text-4xl sm:text-5xl font-black text-white">
                                    {total}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Roll Button */}
                    <button
                        onClick={rollDice}
                        disabled={isRolling}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <RotateCcw className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                        {isRolling ? 'Atılıyor... / Rolling...' : 'Zar At / Roll Dice'}
                    </button>

                    {/* Roll History */}
                    {rollHistory.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                                Son Atışlar / Recent Rolls
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {rollHistory.slice().reverse().map((roll, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm"
                                    >
                                        <span className="text-gray-400">[{roll.dice.join(', ')}]</span>
                                        <span className="font-bold text-blue-600">= {roll.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
