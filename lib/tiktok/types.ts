/**
 * TikTok giveaway shared types.
 * Keep participant shape compatible with existing ClientPage + draw proof.
 */

export type TikTokParticipant = {
    name: string;
    comment: string;
};

/** Raw comment-like object coming from any provider before validation. */
export type TikTokRawComment = {
    uniqueId?: unknown;
    nickname?: unknown;
    username?: unknown;
    text?: unknown;
    comment?: unknown;
    [key: string]: unknown;
};

export type TikTokFetchMeta = {
    provider: string;
    durationMs: number;
    fetchedComments: number;
    validParticipants: number;
    invalidRecords: number;
    duplicatesRemoved: number;
    emptyUsernamesRemoved: number;
    retryCount: number;
    pageCount: number;
    commentCap?: number;
};

export type TikTokFetchResult = {
    participants: TikTokParticipant[];
    meta: TikTokFetchMeta;
};

export type TikTokErrorCode =
    | 'INVALID_URL'
    | 'PRIVATE_VIDEO'
    | 'DELETED_VIDEO'
    | 'SCRAPER_UNAVAILABLE'
    | 'TIMEOUT'
    | 'EMPTY_RESULT'
    | 'RATE_LIMIT'
    | 'NO_APIFY_TOKEN'
    | 'MALFORMED_PAYLOAD'
    | 'PAYMENT_PENDING'
    | 'UNKNOWN';

export class TikTokProviderError extends Error {
    readonly code: TikTokErrorCode;
    readonly retryable: boolean;

    constructor(code: TikTokErrorCode, message: string, options?: { retryable?: boolean; cause?: unknown }) {
        super(message);
        this.name = 'TikTokProviderError';
        this.code = code;
        this.retryable = options?.retryable ?? false;
        if (options?.cause !== undefined) {
            (this as Error & { cause?: unknown }).cause = options.cause;
        }
    }
}

export type TikTokCommentProvider = {
    readonly id: string;
    fetchComments(postUrl: string, options?: { signal?: AbortSignal }): Promise<TikTokFetchResult>;
};
