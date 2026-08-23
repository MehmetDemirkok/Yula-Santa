import { TikTokErrorCode, TikTokProviderError } from './types';

const USER_MESSAGES: Record<TikTokErrorCode, { tr: string; en: string }> = {
    INVALID_URL: {
        tr: 'Geçerli bir TikTok video linki girin (tiktok.com/@.../video/...).',
        en: 'Enter a valid TikTok video link (tiktok.com/@.../video/...).',
    },
    PRIVATE_VIDEO: {
        tr: 'Bu video gizli görünüyor. Herkese açık bir video deneyin veya yorumları manuel ekleyin.',
        en: 'This video appears private. Try a public video or add comments manually.',
    },
    DELETED_VIDEO: {
        tr: 'Video bulunamadı veya silinmiş olabilir. Linki kontrol edin.',
        en: 'Video not found or may have been deleted. Check the link.',
    },
    SCRAPER_UNAVAILABLE: {
        tr: 'Yorum servisi şu anda kullanılamıyor. Lütfen daha sonra deneyin veya manuel ekleyin.',
        en: 'Comment service is unavailable. Try again later or add comments manually.',
    },
    TIMEOUT: {
        tr: 'Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.',
        en: 'The request timed out. Please try again.',
    },
    EMPTY_RESULT: {
        tr: 'Bu videoda yorum bulunamadı. Yorumları manuel ekleyebilirsiniz.',
        en: 'No comments found on this video. You can add them manually.',
    },
    RATE_LIMIT: {
        tr: 'Çok fazla istek. Lütfen bir dakika bekleyip tekrar deneyin.',
        en: 'Too many requests. Please wait a minute and try again.',
    },
    NO_APIFY_TOKEN: {
        tr: 'Otomatik yorum çekme yapılandırılmamış. Yorumları manuel ekleyin.',
        en: 'Automatic comment fetch is not configured. Please add comments manually.',
    },
    MALFORMED_PAYLOAD: {
        tr: 'İstek geçersiz. Sayfayı yenileyip tekrar deneyin.',
        en: 'Invalid request. Refresh the page and try again.',
    },
    PAYMENT_PENDING: {
        tr: 'Ödemeniz onaylanıyor. Birkaç saniye içinde otomatik olarak tekrar denenecek.',
        en: 'Your payment is being confirmed. This will retry automatically in a few seconds.',
    },
    UNKNOWN: {
        tr: 'Yorumlar çekilemedi. Linki ve videonun herkese açık olduğunu kontrol edin.',
        en: 'Could not fetch comments. Check the link and that the video is public.',
    },
};

export function friendlyTikTokError(code: TikTokErrorCode, locale = 'tr'): string {
    const entry = USER_MESSAGES[code] ?? USER_MESSAGES.UNKNOWN;
    return locale.startsWith('tr') ? entry.tr : entry.en;
}

export function mapProviderErrorToCode(error: unknown): TikTokErrorCode {
    if (error instanceof TikTokProviderError) return error.code;

    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    if (lower.includes('timeout') || lower.includes('etimedout') || lower.includes('aborted')) {
        return 'TIMEOUT';
    }
    if (lower.includes('rate') || lower.includes('429') || lower.includes('too many')) {
        return 'RATE_LIMIT';
    }
    if (lower.includes('private')) return 'PRIVATE_VIDEO';
    if (lower.includes('not found') || lower.includes('deleted') || lower.includes('404')) {
        return 'DELETED_VIDEO';
    }
    if (lower.includes('token') || lower.includes('unauthorized') || lower.includes('apify')) {
        return 'SCRAPER_UNAVAILABLE';
    }
    return 'UNKNOWN';
}
