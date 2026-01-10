"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, RefreshCw, Shuffle, SortAsc, Trash2, Plus, Edit3, X, List } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

const COLORS = [
    "#F87171", "#FB923C", "#FBBF24", "#A3E635", "#34D399",
    "#22D3EE", "#60A5FA", "#818CF8", "#A78BFA", "#F472B6",
    "#FB7185", "#E879F9"
];

export function WheelClient() {
    const t = useTranslations('tools.wheelOfFortuneContent');
    const router = useRouter();

    // Core data
    const [segments, setSegments] = useState<string[]>([]);

    // UI States
    const [newName, setNewName] = useState("");
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState("");

    // Wheel States
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    // Sync bulk text when entering bulk mode
    useEffect(() => {
        if (isBulkMode) {
            setBulkText(segments.join('\n'));
        } else {
            // When exiting bulk mode (if triggered by toggle), we might want to save?
            // Usually explicit save is better, but let's sync on toggle for smoother DX
        }
    }, [isBulkMode]);

    const handleAddName = () => {
        if (newName.trim()) {
            setSegments([...segments, newName.trim()]);
            setNewName("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddName();
        }
    };

    const removeSegment = (index: number) => {
        setSegments(segments.filter((_, i) => i !== index));
    };

    const saveBulk = () => {
        const newSegments = bulkText.split('\n').filter(line => line.trim() !== '');
        setSegments(newSegments);
        setIsBulkMode(false);
    };

    const spinWheel = () => {
        if (isSpinning || segments.length < 2) return;

        setWinner(null);
        setIsSpinning(true);

        const newRotation = rotation + 1800 + Math.random() * 360; // At least 5 full spins
        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            const actualRotation = newRotation % 360;
            const segmentAngle = 360 / segments.length;
            const normalizedRotation = (360 - actualRotation) % 360;
            const winningIndex = Math.floor(normalizedRotation / segmentAngle);
            const winningName = segments[winningIndex];

            setWinner(winningName);
            triggerConfetti();
        }, 5000);
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const removeWinner = () => {
        if (!winner) return;
        setSegments(segments.filter(s => s !== winner));
        setWinner(null);
    };

    const shuffleSegments = () => {
        setSegments([...segments].sort(() => Math.random() - 0.5));
    };

    const sortSegments = () => {
        setSegments([...segments].sort((a, b) => a.localeCompare(b)));
    };

    // SVG Calculation
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">🎡 {t('title')}</span>
                                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                    {segments.length}
                                </span>
                            </h2>

                            {/* Mode Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4">
                                <button
                                    onClick={() => setIsBulkMode(false)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${!isBulkMode ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <List className="w-4 h-4 inline-block mr-1.5" />
                                    {t('listMode')}
                                </button>
                                <button
                                    onClick={() => setIsBulkMode(true)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${isBulkMode ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <Edit3 className="w-4 h-4 inline-block mr-1.5" />
                                    {t('bulkMode')}
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 flex flex-col min-h-0">
                                {isBulkMode ? (
                                    <div className="flex-1 flex flex-col">
                                        <textarea
                                            value={bulkText}
                                            onChange={(e) => setBulkText(e.target.value)}
                                            placeholder={t('placeholder')}
                                            className="flex-1 w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-medium mb-4 text-sm leading-relaxed"
                                        />
                                        <Button onClick={saveBulk} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Apply Changes
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Add Name Input */}
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t('addName')}
                                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            />
                                            <Button onClick={handleAddName} className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-10 h-10 p-0 flex items-center justify-center">
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        {/* Name List */}
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                                            {segments.length === 0 ? (
                                                <div className="text-center text-gray-400 py-8 text-sm italic">
                                                    {t('placeholder')}
                                                </div>
                                            ) : (
                                                segments.map((segment, idx) => (
                                                    <div key={idx} className="group flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate mr-2 text-sm">
                                                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                            {segment}
                                                        </span>
                                                        <button
                                                            onClick={() => removeSegment(idx)}
                                                            className="text-gray-400 hover:text-red-500 p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
                                <Button onClick={shuffleSegments} variant="outline" size="sm" className="w-full">
                                    <Shuffle className="w-3 h-3 mr-2" />
                                    {t('shuffle')}
                                </Button>
                                <Button onClick={sortSegments} variant="outline" size="sm" className="w-full">
                                    <SortAsc className="w-3 h-3 mr-2" />
                                    {t('sort')}
                                </Button>
                                <Button
                                    onClick={() => setSegments([])}
                                    variant="outline"
                                    size="sm"
                                    className="col-span-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-100 dark:border-red-900/20"
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    {t('clear')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Wheel Section */}
                    <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[600px] bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                        {segments.length > 1 ? (
                            <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]">
                                {/* Pointer */}
                                <div className="absolute top-1/2 right-[-20px] -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center pointer-events-none">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[20px] border-r-gray-800 dark:border-r-white drop-shadow-md"></div>
                                </div>

                                {/* Wheel SVG */}
                                <svg
                                    viewBox="-1 -1 2 2"
                                    className="w-full h-full transform transition-transform duration-[5000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                                    style={{ transform: `rotate(${rotation}deg)` }}
                                >
                                    {segments.map((segment, index) => {
                                        const startAngle = index / segments.length;
                                        const endAngle = (index + 1) / segments.length;
                                        const [x1, y1] = getCoordinatesForPercent(startAngle);
                                        const [x2, y2] = getCoordinatesForPercent(endAngle);
                                        const pathData = [
                                            `M 0 0`,
                                            `L ${x1} ${y1}`,
                                            `A 1 1 0 0 1 ${x2} ${y2}`,
                                            `Z`
                                        ].join(' ');
                                        const midAngle = (startAngle + endAngle) / 2;
                                        const degrees = midAngle * 360;

                                        return (
                                            <g key={index}>
                                                <path d={pathData} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="0.005" />
                                                <text
                                                    x="0.6"
                                                    y="0.02"
                                                    fill="white"
                                                    fontSize="0.08"
                                                    fontWeight="bold"
                                                    textAnchor="end"
                                                    dominantBaseline="middle"
                                                    transform={`rotate(${degrees})`}
                                                    style={{ userSelect: 'none' }}
                                                >
                                                    {segment.length > 15 ? segment.substring(0, 15) + '...' : segment}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                                {/* Center decoration */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg z-10 flex items-center justify-center border-4 border-indigo-500">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-12 text-gray-400">
                                <RefreshCw className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">{t('placeholder')}</p>
                            </div>
                        )}

                        <div className="mt-12 flex flex-col items-center gap-4 z-10">
                            {winner ? (
                                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="text-lg text-gray-500 dark:text-gray-400 font-medium mb-1">{t('congrats')}</div>
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-6 drop-shadow-sm">
                                        {winner}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={spinWheel}
                                            size="lg"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 text-lg"
                                        >
                                            <RefreshCw className="mr-2 w-5 h-5" />
                                            {t('spin')}
                                        </Button>
                                        <Button
                                            onClick={removeWinner}
                                            variant="secondary"
                                            size="lg"
                                            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-6 px-6 rounded-2xl"
                                        >
                                            <Trash2 className="mr-2 w-5 h-5" />
                                            {t('removeWinner')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={spinWheel}
                                    disabled={isSpinning || segments.length < 2}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-8 px-12 text-2xl rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                                >
                                    {isSpinning ? t('spin') + '...' : t('spin')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions & About Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('howToTitle')}</h3>
                        <ul className="space-y-3">
                            {(t.raw('howToText') as string[]).map((step, i) => (
                                <li key={i} className="flex items-start text-gray-500 dark:text-gray-400">
                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('aboutTitle')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg">{t('aboutText')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
