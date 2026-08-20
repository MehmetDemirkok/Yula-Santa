import type { TikTokErrorCode } from './types';

export type FailureCategory = 'infrastructure' | 'video' | 'empty' | 'client';

export type PaidFetchAnalysis = {
    grantCredit: boolean;
    refund: false;
    category: FailureCategory;
    code: TikTokErrorCode;
    reason: string;
};

const INFRA: TikTokErrorCode[] = [
    'SCRAPER_UNAVAILABLE',
    'TIMEOUT',
    'NO_APIFY_TOKEN',
    'RATE_LIMIT',
    'UNKNOWN',
];

const VIDEO: TikTokErrorCode[] = ['PRIVATE_VIDEO', 'DELETED_VIDEO', 'INVALID_URL'];

/** After a successful payment, a failed draw never refunds — it becomes 1 credit. */
export function analyzePaidFetchFailure(code: TikTokErrorCode): PaidFetchAnalysis {
    const category: FailureCategory = INFRA.includes(code)
        ? 'infrastructure'
        : VIDEO.includes(code)
          ? 'video'
          : code === 'EMPTY_RESULT'
            ? 'empty'
            : 'client';

    const reason =
        category === 'infrastructure'
            ? 'Yorum servisi yanıt vermedi veya zaman aşımına uğradı.'
            : category === 'video'
              ? 'Video çekilemedi (gizli, silinmiş veya geçersiz).'
              : category === 'empty'
                ? 'Videoda çekilecek yorum bulunamadı.'
                : 'Çekiliş tamamlanamadı.';

    return {
        grantCredit: true,
        refund: false,
        category,
        code,
        reason,
    };
}
