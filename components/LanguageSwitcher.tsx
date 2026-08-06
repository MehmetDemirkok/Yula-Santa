/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Language Switcher Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A reusable, accessible language switcher that:
 * - Works with both light and dark themes
 * - Is fully accessible (keyboard navigation, screen readers)
 * - Persists language choice via URL and cookie
 * - Shows flags and native language names
 * - Uses next-intl's useRouter for proper locale-aware navigation
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale() as Locale;

    const handleLocaleChange = (newLocale: Locale) => {
        if (newLocale === currentLocale) {
            setIsOpen(false);
            return;
        }
        setIsOpen(false);
        // Set cookie BEFORE navigation to ensure middleware reads the correct value
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        startTransition(() => {
            router.replace(pathname, { locale: newLocale });
        });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-gray-900 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
                disabled={isPending}
            >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
                <span className="text-xs sm:text-sm">{currentLocale.toUpperCase()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Mobile Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] sm:hidden animate-fade-in"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Content */}
                    <div
                        className="
                            fixed inset-x-0 bottom-0 z-[70] w-full bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] border-t border-white/50 safe-area-inset-bottom
                            sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:bottom-auto sm:z-50 sm:mt-2 sm:min-w-[16rem] sm:w-auto sm:bg-white sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-100 sm:pb-0
                            animate-slide-up sm:animate-fade-in
                        "
                        role="listbox"
                        aria-label="Available languages"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Handle */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 sm:hidden" />

                        <div className="px-4 py-2 sm:px-3 sm:py-2 border-b border-gray-100/50 sm:border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center sm:text-left">
                                Select Language
                            </p>
                        </div>

                        <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto p-2 sm:p-3 custom-scrollbar">
                            {locales.map((locale) => {
                                const isActive = locale === currentLocale;

                                return (
                                    <button
                                        key={locale}
                                        type="button"
                                        onClick={() => handleLocaleChange(locale)}
                                        className={`w-full flex items-center gap-4 sm:gap-3 px-4 sm:px-3 py-3.5 sm:py-2.5 rounded-xl sm:rounded-lg transition-all ${isActive
                                            ? 'bg-red-50 text-santa-red shadow-sm sm:shadow-none font-bold'
                                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-medium'
                                            }`}
                                        role="option"
                                        aria-selected={isActive}
                                    >
                                        <span className="text-2xl sm:text-lg leading-none">{localeFlags[locale]}</span>
                                        <span className="text-base sm:text-sm flex-1 text-left">{localeNames[locale]}</span>
                                        {isActive && (
                                            <div className="bg-red-100 p-1 rounded-full sm:bg-transparent sm:p-0 ml-auto">
                                                <span className="text-santa-red text-sm">✓</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
