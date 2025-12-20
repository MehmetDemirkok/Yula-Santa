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
 * - SEO-friendly (uses proper anchor links)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const params = useParams();
    const pathname = usePathname();

    const currentLocale = (params.locale as Locale) || 'tr';

    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

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
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-gray-900"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
            >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
                <span className="text-xs sm:text-sm">{currentLocale.toUpperCase()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    role="listbox"
                    aria-label="Available languages"
                >
                    <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Select Language
                        </p>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {locales.map((locale) => {
                            const isActive = locale === currentLocale;
                            const href = `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

                            return (
                                <Link
                                    key={locale}
                                    href={href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 mx-1 rounded-lg transition-colors ${isActive
                                            ? 'bg-santa-red/10 text-santa-red'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    role="option"
                                    aria-selected={isActive}
                                    hrefLang={locale}
                                >
                                    <span className="text-lg">{localeFlags[locale]}</span>
                                    <span className="flex-1 font-medium text-sm">{localeNames[locale]}</span>
                                    {isActive && (
                                        <span className="text-santa-red">✓</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
