"use client";

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LOCALES, Locale } from '@/lib/i18n/LanguageContext';
import { LOCALE_NAMES, LOCALE_FLAGS } from '@/lib/i18n/translations';

export function LanguageSelector() {
    const { locale, setLocale, isLoading } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLocaleChange = (newLocale: Locale) => {
        console.log('Changing locale from', locale, 'to', newLocale); // Debug
        setLocale(newLocale);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <div className="fixed top-4 right-4 z-50">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
                    <Globe className="w-4 h-4 text-gray-400 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105"
                aria-label="Select language"
            >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-lg">{LOCALE_FLAGS[locale]}</span>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{LOCALE_NAMES[locale]}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {SUPPORTED_LOCALES.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => handleLocaleChange(loc)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${locale === loc ? 'bg-red-50 text-santa-red' : 'text-gray-700'
                                    }`}
                            >
                                <span className="text-xl">{LOCALE_FLAGS[loc]}</span>
                                <span className={`text-sm flex-1 ${locale === loc ? 'font-bold' : 'font-medium'}`}>
                                    {LOCALE_NAMES[loc]}
                                </span>
                                {locale === loc && (
                                    <Check className="w-4 h-4 text-santa-red" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
