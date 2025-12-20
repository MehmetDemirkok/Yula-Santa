/**
 * ═══════════════════════════════════════════════════════════════════════════
 * i18n Request Configuration - YulaSanta
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file handles the request-level i18n setup for next-intl.
 * It loads the correct messages based on the current locale.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
    // Get the locale from the request
    let locale = await requestLocale;

    // Validate and fallback to default
    if (!locale || !locales.includes(locale as Locale)) {
        locale = defaultLocale;
    }

    // Load messages for the locale
    let messages;
    try {
        messages = (await import(`../messages/${locale}.json`)).default;
    } catch {
        // Fallback to default locale if translation file doesn't exist
        console.warn(`Translation file for locale "${locale}" not found, falling back to "${defaultLocale}"`);
        messages = (await import(`../messages/${defaultLocale}.json`)).default;
    }

    return {
        locale,
        messages
    };
});
