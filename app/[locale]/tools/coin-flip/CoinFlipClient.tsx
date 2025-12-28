"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coins, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function CoinFlipPage() {
    const t = useTranslations('tools.coinFlipContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [result, setResult] = useState<'heads' | 'tails' | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipCount, setFlipCount] = useState({ heads: 0, tails: 0 });

    const flipCoin = () => {
        setIsFlipping(true);
        setResult(null);

        setTimeout(() => {
            const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
            setResult(outcome);
            setFlipCount(prev => ({
                ...prev,
                [outcome]: prev[outcome] + 1
            }));
            setIsFlipping(false);
        }, 1000);
    };

    const resetStats = () => {
        setFlipCount({ heads: 0, tails: 0 });
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-12 px-4 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                            🪙 {t('title')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                    <div className="flex justify-center mb-8" aria-live="polite" aria-atomic="true">
                        <div
                            className={`w-48 h-48 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ${isFlipping
                                ? 'animate-spin bg-gradient-to-br from-yellow-300 to-amber-500'
                                : result === 'heads'
                                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                                    : result === 'tails'
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                        : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
                                }`}
                            role="img"
                        >
                            {!isFlipping && result && (
                                <div className="text-center animate-fade-in">
                                    <p className="text-4xl mb-2">
                                        {result === 'heads' ? '👑' : '🔢'}
                                    </p>
                                    <p className="text-xl font-black text-white drop-shadow-lg uppercase">
                                        {result === 'heads' ? t('heads') : t('tails')}
                                    </p>
                                </div>
                            )}
                            {!isFlipping && !result && (
                                <Coins className="w-20 h-20 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                            )}
                            {isFlipping && (
                                <Coins className="w-20 h-20 text-white" aria-hidden="true" />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900/50 dark:to-yellow-950/20 rounded-2xl p-4 text-center border border-yellow-100 dark:border-yellow-900/30">
                            <p className="text-3xl font-black text-amber-600 dark:text-amber-500">{flipCount.heads}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('heads')} 👑</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900/50 dark:to-orange-950/20 rounded-2xl p-4 text-center border border-orange-100 dark:border-orange-900/30">
                            <p className="text-3xl font-black text-orange-600 dark:text-orange-500">{flipCount.tails}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('tails')} 🔢</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={flipCoin}
                            disabled={isFlipping}
                            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <Coins className={`w-5 h-5 ${isFlipping ? 'animate-spin' : ''}`} aria-hidden="true" />
                            {isFlipping ? t('rolling') : t('roll')}
                        </button>

                        {(flipCount.heads > 0 || flipCount.tails > 0) && (
                            <button
                                onClick={resetStats}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                {t('reset')}
                            </button>
                        )}
                    </div>
                </article>

                <section className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">{t('aboutTitle')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t('aboutText')}
                    </p>
                </section>
            </div>
        </div>
    );
}
