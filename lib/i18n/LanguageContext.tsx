/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Legacy Language Context - Compatibility Layer
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file provides backward compatibility for existing pages that use
 * the old useLanguage() hook. It wraps next-intl's useTranslations.
 * 
 * MIGRATION NOTE:
 * New pages should use next-intl directly:
 * - import { useTranslations } from 'next-intl';
 * - const t = useTranslations();
 * - t('home.title') instead of t.home.title
 * 
 * Old pages can continue using:
 * - import { useLanguage } from '@/lib/i18n/LanguageContext';
 * - const { t } = useLanguage();
 * - t.home.title
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/config';

// Legacy types for backward compatibility
export const SUPPORTED_LOCALES = locales;
export type { Locale };

export const LOCALE_NAMES: Record<Locale, string> = {
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

export const LOCALE_FLAGS: Record<Locale, string> = {
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

// Translation interface (kept for type compatibility)
export interface Translation {
    meta: {
        title: string;
        description: string;
        keywords: string[];
    };
    home: {
        title: string;
        subtitle: string;
        secretDraw: string;
        directMatch: string;
        inputPlaceholder: string;
        noParticipants: string;
        uploadList: string;
        uploading: string;
        clearList: string;
        startDraw: string;
        match: string;
        happyNewYear: string;
        minPeople3: string;
        minPeople2: string;
        evenNumber: string;
        nameExists: string;
        namesAdded: string;
        totalCount: string;
        startDrawConfirm: string;
        notEnoughPeople: string;
        noNamesFound: string;
        uploadError: string;
        unsupportedFormat: string;
        secretDrawMinError: string;
        directMatchMinError: string;
        directMatchEvenError: string;
        drawError: string;
        socialMediaGiveaways: string;
    };
    result: {
        whoGetsGift: string;
        selectName: string;
        matchList: string;
        christmasMatches: string;
        giftRecipient: string;
        keepSecret: string;
        seeGiftIdeas: string;
        aiSuggestions: string;
        noSuggestions: string;
        someoneElse: string;
        newDraw: string;
        seeResult: string;
        selectYourName: string;
        backToHome: string;
    };
    giveaway: {
        links: string;
        rules: string;
        participants: string;
        giveawayName: string;
        winnerCount: string;
        backupCount: string;
        startGiveaway: string;
        newGiveaway: string;
        copyResults: string;
        copied: string;
        comments: string;
        likes: string;
        subscribers: string;
        retweets: string;
        replies: string;
        followers: string;
        tags: string;
        fetchComments: string;
        fetching: string;
        linkInputPlaceholder: string;
        addParticipant: string;
        bulkAdd: string;
        clearAll: string;
        results: string;
        winners: string;
        backups: string;
        youtubeTitle: string;
        instagramTitle: string;
        twitterTitle: string;
        youtubeDesc: string;
        instagramDesc: string;
        twitterDesc: string;
        requireSubscription: string;
        requireNotification: string;
        requireFollow: string;
        requireRetweet: string;
        requireLike: string;
        countUserOnce: string;
        inputError: string;
        fetchError: string;
        apiLimitation: string;
        manualMode: string;
        autoMode: string;
        manualDesc: string;
        autoDesc: string;
        pasteComments: string;
        parse: string;
        parsed: string;
    };
    support: {
        button: string;
        title: string;
        description: string;
        subject: string;
        message: string;
        send: string;
        contact: string;
    };
    common: {
        loading: string;
        error: string;
        confirm: string;
        cancel: string;
        yes: string;
        no: string;
        clearConfirm: string;
        or: string;
    };
}

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Translation;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider - Backward Compatible Wrapper
 * 
 * This component is now optional since next-intl handles everything.
 * It's kept for pages that haven't been migrated yet.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
    // Just render children - next-intl handles everything
    return <>{children}</>;
}

/**
 * useLanguage - Backward Compatible Hook
 * 
 * Wraps next-intl's useTranslations to provide the old t.section.key syntax.
 * New code should use useTranslations directly.
 */
export function useLanguage(): LanguageContextType {
    const tFunc = useTranslations();
    const locale = useLocale() as Locale;

    // Build a proxy object that mimics the old t.section.key pattern
    const t = new Proxy({} as Translation, {
        get: (_, section: string) => {
            return new Proxy({} as any, {
                get: (_, key: string) => {
                    try {
                        return tFunc(`${section}.${key}`);
                    } catch {
                        return `${section}.${key}`;
                    }
                }
            });
        }
    });

    return {
        locale,
        setLocale: () => {
            console.warn('setLocale is deprecated. Use Link with locale prefix instead.');
        },
        t,
        isLoading: false
    };
}
