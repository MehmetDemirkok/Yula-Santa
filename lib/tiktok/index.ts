/** Client-safe TikTok utilities (no Node / Apify imports). */
export type {
    TikTokCommentProvider,
    TikTokFetchResult,
    TikTokFetchMeta,
    TikTokParticipant,
    TikTokErrorCode,
} from './types';
export { TikTokProviderError } from './types';
export {
    normalizeTikTokUsername,
    normalizeParticipantBatch,
    sanitizeDisplayUsername,
    isValidTikTokUsername,
} from './normalize';
export { isLikelyTikTokUrl, normalizeTikTokPostUrl } from './url';
export { friendlyTikTokError, mapProviderErrorToCode } from './errors';
export { parseManualImport, applyManualImportPreview } from './manualImport';
export { isValidEmail, normalizeEmail } from './email';
export type { ManualImportPreview, ManualImportRow } from './manualImport';
export { createRequestId, logTikTokEvent } from './logging';
export {
    COMMENTS_PER_FETCH,
    FETCH_PRICE_TRY,
    FETCH_CURRENCY,
    formatFetchPrice,
    capFetchedParticipants,
} from './pricing';
