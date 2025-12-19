"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Translation, Locale, SUPPORTED_LOCALES } from './translations';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Translation;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detect browser language and map to supported locale
function detectBrowserLanguage(): Locale {
    if (typeof navigator === 'undefined') return 'en';

    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();

    // Check if the language is supported
    if (SUPPORTED_LOCALES.includes(langCode as Locale)) {
        return langCode as Locale;
    }

    // Default to English if not supported
    return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('tr'); // Default to Turkish
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check localStorage first
        const savedLocale = localStorage.getItem('yulasanta_locale') as Locale;

        if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
            setLocaleState(savedLocale);
            document.documentElement.lang = savedLocale;
            document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr';
        } else {
            // Detect from browser
            const detected = detectBrowserLanguage();
            setLocaleState(detected);
            localStorage.setItem('yulasanta_locale', detected);
            document.documentElement.lang = detected;
            document.documentElement.dir = detected === 'ar' ? 'rtl' : 'ltr';
        }

        setIsLoading(false);
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        console.log('Setting locale to:', newLocale); // Debug log
        setLocaleState(newLocale);
        localStorage.setItem('yulasanta_locale', newLocale);

        // Update HTML lang attribute
        document.documentElement.lang = newLocale;

        // Update dir attribute for RTL languages
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    }, []);

    const t = translations[locale];

    // Show loading state with default translations
    const contextValue: LanguageContextType = {
        locale,
        setLocale,
        t,
        isLoading
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export { SUPPORTED_LOCALES, type Locale };
