/**
 * ═══════════════════════════════════════════════════════════════════════════
 * i18n Configuration - YulaSanta
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file configures the next-intl internationalization system.
 * 
 * HOW TO ADD A NEW LANGUAGE:
 * 1. Add the locale code to the `locales` array below
 * 2. Create a new JSON file in /messages/{locale}.json
 * 3. Copy the structure from /messages/tr.json (source of truth)
 * 4. Translate all values (or use AI - see below)
 * 5. Restart the dev server
 * 
 * AI TRANSLATION:
 * To auto-generate translations using AI:
 * 1. Run: npx tsx scripts/generate-translations.ts {locale}
 * 2. This will use OpenAI to translate from tr.json to the new locale
 * 3. Review and commit the generated file
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales - add new languages here
export const locales = ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'ja', 'ko', 'zh'] as const;
export type Locale = (typeof locales)[number];

// Default locale (fallback)
export const defaultLocale: Locale = 'tr';

// Locale display names
export const localeNames: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية',
    ja: '日本語',
    ko: '한국어',
    zh: '中文'
};

// Locale flags (emoji)
export const localeFlags: Record<Locale, string> = {
    tr: '🇹🇷',
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷',
    es: '🇪🇸',
    it: '🇮🇹',
    pt: '🇵🇹',
    ru: '🇷🇺',
    ar: '🇸🇦',
    ja: '🇯🇵',
    ko: '🇰🇷',
    zh: '🇨🇳'
};

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

// Check if locale is valid
export function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale);
}

// Get direction for locale
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
    return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate that the incoming `locale` parameter is valid
    const locale = await requestLocale;

    if (!locale || !isValidLocale(locale)) {
        notFound();
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
