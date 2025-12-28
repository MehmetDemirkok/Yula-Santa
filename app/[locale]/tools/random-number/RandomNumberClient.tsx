"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, Shuffle, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function RandomNumberPage() {
    const t = useTranslations('tools.randomNumberContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [min, setMin] = useState(1);
    const [max, setMax] = useState(100);
    const [count, setCount] = useState(1);
    const [results, setResults] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateNumbers = () => {
        if (min >= max) return;

        setIsGenerating(true);

        setTimeout(() => {
            const numbers: number[] = [];
            for (let i = 0; i < count; i++) {
                numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }
            setResults(numbers);
            setIsGenerating(false);
        }, 500);
    };

    const copyResults = () => {
        navigator.clipboard.writeText(results.join(', '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:to-gray-950 py-12 px-4 transition-colors duration-300">
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
                            🔢 {t('title')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div>
                            <label htmlFor="min-value" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {t('min')}
                            </label>
                            <input
                                id="min-value"
                                type="number"
                                value={min}
                                onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/20 outline-none transition-all text-lg font-medium dark:text-white"
                                aria-label="Minimum"
                            />
                        </div>
                        <div>
                            <label htmlFor="max-value" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {t('max')}
                            </label>
                            <input
                                id="max-value"
                                type="number"
                                value={max}
                                onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/20 outline-none transition-all text-lg font-medium dark:text-white"
                                aria-label="Maximum"
                            />
                        </div>
                    </div>

                    <div className="min-h-[150px] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20 rounded-2xl p-6 mb-8 border border-green-100 dark:border-green-900/30" aria-live="polite" aria-atomic="true">
                        {results.length > 0 ? (
                            <div className="flex flex-wrap gap-3 justify-center">
                                {results.map((num, index) => (
                                    <div
                                        key={index}
                                        className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center animate-fade-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <span className="text-xl font-black text-white">{num}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                                <div className="text-center">
                                    <Hash className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
                                    <p>{t('placeholder')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={generateNumbers}
                            disabled={isGenerating || min >= max}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <Shuffle className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
                            {isGenerating ? t('rolling') : t('generate')}
                        </button>

                        {results.length > 0 && (
                            <button
                                onClick={copyResults}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                                {copied ? 'OK!' : t('result')}
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
