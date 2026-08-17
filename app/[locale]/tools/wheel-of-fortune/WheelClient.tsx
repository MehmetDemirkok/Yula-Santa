"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, RefreshCw, Shuffle, SortAsc, Trash2, Plus, Edit3, X, List } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { secureRandomInt, secureShuffle } from "@/lib/random";

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

        // 1. First, randomly pick a winner (cryptographically uniform — no bias)
        const winningIndex = secureRandomInt(segments.length);

        // 2. Calculate the angle to land the pointer on that segment
        //    SVG segments start from the right (3 o'clock / 0°) and go clockwise.
        //    The pointer is on the right side.
        //    Segment i occupies from (i/n * 360) to ((i+1)/n * 360) degrees.
        //    To land on segment i, the wheel needs to rotate so that segment i
        //    is under the pointer (at 0° / right side).
        const segmentAngle = 360 / segments.length;

        // Random position within the winning segment (avoid edges for visual clarity)
        const segmentStart = winningIndex * segmentAngle;
        const padding = segmentAngle * 0.15; // 15% padding from edges
        const randomWithinSegment = segmentStart + padding + Math.random() * (segmentAngle - 2 * padding);

        // The wheel rotates, so we need to send this segment to 0° (pointer position)
        // If segment is at angle X, we rotate by (360 - X) to bring it to 0°
        const targetAngle = (360 - randomWithinSegment + 360) % 360;

        // Add multiple full rotations for dramatic effect (5-8 full spins)
        const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
        const newRotation = rotation + fullSpins + targetAngle - (rotation % 360);

        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setWinner(segments[winningIndex]);
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
        setSegments(secureShuffle(segments));
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
        <div className="ys-page-shell py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] mb-6 tracking-tight">
                    {t('title')}
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Controls Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="ys-card p-6 flex flex-col h-[480px]">
                            <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">{t('listMode')}</span>
                                <span className="ys-chip ys-chip-indigo">
                                    {segments.length}
                                </span>
                            </h2>

                            {/* Mode Toggle */}
                            <div className="flex bg-[var(--surface-2)] p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => setIsBulkMode(false)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!isBulkMode ? 'bg-[var(--card-bg)] shadow-sm text-indigo-accent' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                                >
                                    <List className="w-4 h-4 inline-block mr-1.5" />
                                    {t('listMode')}
                                </button>
                                <button
                                    onClick={() => setIsBulkMode(true)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${isBulkMode ? 'bg-[var(--card-bg)] shadow-sm text-indigo-accent' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
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
                                            className="flex-1 w-full p-4 rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-0 focus:border-indigo-accent focus:outline-none resize-none font-medium mb-4 text-sm leading-relaxed"
                                        />
                                        <Button onClick={saveBulk} variant="secondary" className="w-full">
                                            Apply Changes
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Add Name Input */}
                                        <div className="flex gap-2 mb-4">
                                            <Input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t('addName')}
                                                className="flex-1 h-auto py-2 focus:border-indigo-accent"
                                            />
                                            <Button onClick={handleAddName} className="shrink-0 aspect-square p-0 w-10 h-10">
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        {/* Name List */}
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
                                            {segments.length === 0 ? (
                                                <div className="text-center text-[var(--text-muted)] py-8 text-sm italic">
                                                    {t('placeholder')}
                                                </div>
                                            ) : (
                                                segments.map((segment, idx) => (
                                                    <div key={idx} className="group flex items-center justify-between bg-[var(--surface-2)] p-3 rounded-lg border border-[var(--border-light)] hover:border-indigo-accent/30 transition-colors">
                                                        <span className="font-medium text-[var(--text-secondary)] truncate mr-2 text-sm">
                                                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                            {segment}
                                                        </span>
                                                        <button
                                                            onClick={() => removeSegment(idx)}
                                                            className="text-[var(--text-muted)] hover:text-santa-red p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <div className="pt-4 mt-auto border-t border-[var(--border-light)] grid grid-cols-2 gap-2">
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
                                    className="col-span-2 text-santa-red hover:text-santa-red hover:bg-santa-red/10 border-santa-red/20"
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    {t('clear')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Wheel Section */}
                    <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[480px] ys-card p-6 relative overflow-hidden">
                        {segments.length > 1 ? (
                            <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] lg:w-[400px] lg:h-[400px]">
                                {/* Pointer */}
                                <div className="absolute top-1/2 right-[-20px] -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center pointer-events-none">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[20px] border-r-[var(--text-primary)] drop-shadow-md"></div>
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
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-[var(--card-bg)] rounded-full shadow-lg z-10 flex items-center justify-center border-4 border-indigo-accent">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-accent"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-12 text-[var(--text-muted)]">
                                <RefreshCw className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">{t('placeholder')}</p>
                            </div>
                        )}

                        <div className="mt-8 flex flex-col items-center gap-4 z-10">
                            {winner ? (
                                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="text-body-lg text-[var(--text-secondary)] font-medium mb-1">{t('congrats')}</div>
                                    <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-santa-red to-indigo-accent mb-6 drop-shadow-sm">
                                        {winner}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={spinWheel}
                                            size="lg"
                                        >
                                            <RefreshCw className="mr-2 w-5 h-5" />
                                            {t('spin')}
                                        </Button>
                                        <Button
                                            onClick={removeWinner}
                                            variant="secondary"
                                            size="lg"
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
                                    size="lg"
                                    className="hover:scale-105 transition-transform"
                                >
                                    {isSpinning ? t('spin') + '...' : t('spin')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions & About Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <div className="ys-card p-8">
                        <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">{t('howToTitle')}</h3>
                        <ul className="space-y-3">
                            {(t.raw('howToText') as string[]).map((step, i) => (
                                <li key={i} className="flex items-start text-[var(--text-secondary)]">
                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-indigo-accent rounded-full shrink-0"></span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="ys-card p-8">
                        <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">{t('aboutTitle')}</h3>
                        <p className="text-body-lg text-[var(--text-secondary)] leading-relaxed">{t('aboutText')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
