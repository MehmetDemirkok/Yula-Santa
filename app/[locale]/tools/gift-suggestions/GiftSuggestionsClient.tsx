"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, Sparkles, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { specialDays } from '@/lib/giftData';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function GiftSuggestionsClient() {
    const t = useTranslations('tools.giftSuggestionsContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';
    const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

    const handleDayClick = (id: string) => {
        setSelectedDayId(id);
        // Smooth scroll to suggestions if on mobile or just for better UX
        const element = document.getElementById('suggestions-section');
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const selectedDay = specialDays.find(d => d.id === selectedDayId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-8 sm:py-12 px-4 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Gift className="w-8 h-8 text-pink-500" />
                            {t('title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Day Selection */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-white/10 p-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                {t('selectDay')}
                            </h2>
                            <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {specialDays.map((day) => (
                                    <button
                                        key={day.id}
                                        onClick={() => handleDayClick(day.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border-2",
                                            selectedDayId === day.id
                                                ? `bg-gradient-to-br ${day.color} border-transparent shadow-md scale-[1.02]`
                                                : "bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                                        )}
                                    >
                                        <span className="text-3xl mb-2 filter drop-shadow-sm">{day.icon}</span>
                                        <span className={cn(
                                            "text-xs font-bold text-center leading-tight",
                                            selectedDayId === day.id ? day.textColor : "text-gray-600 dark:text-gray-400"
                                        )}>
                                            {t(`days.${day.id}`)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Suggestions */}
                    <div className="lg:col-span-7" id="suggestions-section">
                        {selectedDayId ? (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className={cn(
                                    "rounded-3xl p-8 bg-gradient-to-r shadow-2xl relative overflow-hidden",
                                    selectedDay?.color || 'from-gray-100 to-gray-200'
                                )}>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-5xl">{selectedDay?.icon}</span>
                                            <div>
                                                <h2 className={cn("text-3xl font-black", selectedDay?.textColor)}>
                                                    {t(`days.${selectedDayId}`)}
                                                </h2>
                                                <p className="text-gray-600 font-medium opacity-90">
                                                    {t('subtitle')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                                </div>

                                <div className="grid gap-4">
                                    {[1, 2, 3, 4, 5].map((index) => {
                                        // We need to safely access translations. 
                                        // We can iterate 1 to 5 as we populated 5 items for all days in the JSON.

                                        const titleKey = `suggestions.${selectedDayId}.${index}.title` as any;
                                        const descKey = `suggestions.${selectedDayId}.${index}.desc` as any;

                                        return (
                                            <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1">
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white shadow-md group-hover:scale-110 transition-transform",
                                                        selectedDay?.badgeColor || 'bg-gray-500'
                                                    )}>
                                                        {index}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                                            {t(titleKey)}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {t(descKey)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Gift className="w-12 h-12 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('noDaySelected')}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                    {t('aboutText')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <section className="mt-12 bg-white/40 dark:bg-gray-800/40 backdrop-blur rounded-3xl p-6 sm:p-8 border border-white/50 dark:border-white/5 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                        {t('aboutTitle')}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t('aboutText')}
                    </p>
                </section>
            </div>
        </div>
    );
}
