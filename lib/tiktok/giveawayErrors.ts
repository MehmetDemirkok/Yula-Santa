/** Error codes + Turkish/English messages for the extension-based TikTok giveaway flow. */

export type GiveawayErrorCode =
    | 'INVALID_URL'
    | 'GIVEAWAY_NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'ALREADY_DRAWN'
    | 'EMPTY_RESULT'
    | 'PAYLOAD_TOO_LARGE'
    | 'RATE_LIMIT'
    | 'MALFORMED_PAYLOAD'
    | 'STORE_UNAVAILABLE'
    | 'UNKNOWN';

const MESSAGES: Record<GiveawayErrorCode, { tr: string; en: string }> = {
    INVALID_URL: {
        tr: 'Geçerli bir TikTok video linki girin (tiktok.com/@.../video/...).',
        en: 'Enter a valid TikTok video link (tiktok.com/@.../video/...).',
    },
    GIVEAWAY_NOT_FOUND: {
        tr: 'Çekiliş bulunamadı. Giveaway ID’yi kontrol edin.',
        en: 'Giveaway not found. Check the giveaway ID.',
    },
    UNAUTHORIZED: {
        tr: 'Bu işlem için yetkiniz yok. İçe aktarma kodunu kontrol edin.',
        en: 'You are not authorized for this action. Check the import code.',
    },
    ALREADY_DRAWN: {
        tr: 'Bu çekiliş zaten tamamlandı.',
        en: 'This giveaway has already been drawn.',
    },
    EMPTY_RESULT: {
        tr: 'Katılımcı bulunamadı. Önce Chrome Extension ile yorum toplayın.',
        en: 'No participants found. Collect comments with the Chrome Extension first.',
    },
    PAYLOAD_TOO_LARGE: {
        tr: 'Tek seferde en fazla 1000 yorum gönderebilirsiniz.',
        en: 'You can send at most 1000 comments per request.',
    },
    RATE_LIMIT: {
        tr: 'Çok fazla istek. Lütfen bir dakika bekleyip tekrar deneyin.',
        en: 'Too many requests. Please wait a minute and try again.',
    },
    MALFORMED_PAYLOAD: {
        tr: 'İstek geçersiz. Sayfayı yenileyip tekrar deneyin.',
        en: 'Invalid request. Refresh the page and try again.',
    },
    STORE_UNAVAILABLE: {
        tr: 'Veritabanı şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
        en: 'Database is currently unavailable. Please try again later.',
    },
    UNKNOWN: {
        tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        en: 'Something went wrong. Please try again.',
    },
};

export function friendlyGiveawayError(code: GiveawayErrorCode, locale = 'tr'): string {
    const entry = MESSAGES[code] ?? MESSAGES.UNKNOWN;
    return locale.startsWith('tr') ? entry.tr : entry.en;
}
