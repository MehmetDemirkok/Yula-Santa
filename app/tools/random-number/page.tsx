"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, Shuffle, Copy, Check } from 'lucide-react';

export default function RandomNumberPage() {
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/"
                        className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                            🔢 Rastgele Sayı Seçici
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Random Number Generator</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Minimum
                            </label>
                            <input
                                type="number"
                                value={min}
                                onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-lg font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Maksimum / Maximum
                            </label>
                            <input
                                type="number"
                                value={max}
                                onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-lg font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Adet / Count
                            </label>
                            <input
                                type="number"
                                value={count}
                                min={1}
                                max={100}
                                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-lg font-medium"
                            />
                        </div>
                    </div>

                    {/* Results Display */}
                    <div className="min-h-[150px] bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-100">
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
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Hash className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Sayı üretmek için butona tıklayın</p>
                                    <p className="text-sm">Click to generate numbers</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={generateNumbers}
                            disabled={isGenerating || min >= max}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <Shuffle className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Üretiliyor... / Generating...' : 'Sayı Üret / Generate'}
                        </button>

                        {results.length > 0 && (
                            <button
                                onClick={copyResults}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Kopyalandı! / Copied!' : 'Kopyala / Copy'}
                            </button>
                        )}
                    </div>

                    {min >= max && (
                        <p className="text-center text-red-500 text-sm mt-4">
                            ⚠️ Minimum değer maksimumdan küçük olmalı / Minimum must be less than maximum
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
