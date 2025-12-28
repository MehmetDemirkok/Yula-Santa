"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

// 3D Zar SVG Bileşeni
const Dice3D = ({ value, isRolling, label }: { value: number; isRolling: boolean; label: string }) => {
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
                role="img"
                aria-label={`${label}: ${value}`}
            >
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

                <rect
                    x="5"
                    y="5"
                    width="90"
                    height="8"
                    rx="16"
                    fill="white"
                    opacity="0.6"
                />

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
    const t = useTranslations('tools.diceContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [diceCount, setDiceCount] = useState(1);
    const [results, setResults] = useState<number[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [rollHistory, setRollHistory] = useState<{ dice: number[]; total: number }[]>([]);

    useEffect(() => {
        const handleClickOutside = () => setIsDropdownOpen(false);
        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    const rollDice = () => {
        setIsRolling(true);

        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50, 50, 100]);
        }

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

    const totalValue = results.reduce((sum, val) => sum + val, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-8 sm:py-12 px-4 transition-colors duration-300">
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
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                            🎲 {t('title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl border border-white/50 dark:border-white/10 p-4 sm:p-6 md:p-8">
                    <div className="mb-6 sm:mb-8">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3" htmlFor="dice-count">
                            {t('label')}
                        </label>
                        <div className="relative">
                            <button
                                id="dice-count"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 transition-all text-left"
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="listbox"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl" role="img" aria-label="zar">🎲</span>
                                    <span className="font-bold text-gray-800 dark:text-white text-lg">{t('option', { count: diceCount })}</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in" role="listbox">
                                    {[1, 2].map((num) => (
                                        <button
                                            key={num}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDiceCount(num);
                                                setResults([]);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors ${diceCount === num ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                            role="option"
                                            aria-selected={diceCount === num}
                                        >
                                            <span className="text-xl">
                                                {'🎲'.repeat(num)}
                                            </span>
                                            <span className="font-medium">{t('option', { count: num })}</span>
                                            {diceCount === num && (
                                                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-950/20 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 min-h-[180px] flex items-center justify-center border border-gray-200 dark:border-gray-700" aria-live="polite" aria-atomic="true">
                        {results.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                                {results.map((value, index) => (
                                    <Dice3D
                                        key={index}
                                        value={value}
                                        label={t('label')}
                                        isRolling={isRolling}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                <span className="text-5xl sm:text-6xl mb-3 opacity-30" role="img" aria-label="zar ikonu">🎲</span>
                                <p className="text-sm sm:text-base">{t('placeholder')}</p>
                            </div>
                        )}
                    </div>

                    {results.length > 0 && !isRolling && (
                        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('total')}</p>
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                                <span className="text-4xl sm:text-5xl font-black text-white">
                                    {totalValue}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={rollDice}
                        disabled={isRolling}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <RotateCcw className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                        {isRolling ? t('rolling') : t('roll')}
                    </button>

                    {rollHistory.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                                {t('history')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {rollHistory.slice().reverse().map((roll, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border border-gray-100 dark:border-gray-800"
                                    >
                                        <span className="text-gray-400 dark:text-gray-500">[{roll.dice.join(', ')}]</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">= {roll.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                <section className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">{t('aboutTitle')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {t('aboutText')}
                    </p>
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('featuresTitle')}</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                        {t.raw('features').map((feature: string, idx: number) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
