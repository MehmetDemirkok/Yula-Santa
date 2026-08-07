// Supported languages
export const SUPPORTED_LOCALES = [
    'tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'ja', 'ko', 'zh'
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

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

export interface Translation {
    // Meta
    meta: {
        title: string;
        description: string;
        keywords: string[];
    };
    // Home page
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
    };
    // Result page
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
    // Giveaway
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
        youtubeDesc: string;
        tiktokTitle: string;
        tiktokDesc: string;
        requireSubscription: string;
        requireNotification: string;
        requireFollow: string;
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
        participantLimitDetails: string;
        youtubeLimitNote: string;
        tiktokLimitNote: string;
    };
    // Support
    support: {
        button: string;
        title: string;
        description: string;
        subject: string;
        message: string;
        send: string;
        contact: string;
    };
    // Common
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

// Export default removed as it is no longer used.
// Use messages/*.json files for translations via next-intl.
