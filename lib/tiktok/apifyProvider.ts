import { ApifyClient } from 'apify-client';
import { normalizeParticipantBatch } from './normalize';
import { logTikTokEvent } from './logging';
import {
    TikTokCommentProvider,
    TikTokFetchResult,
    TikTokProviderError,
    TikTokRawComment,
} from './types';

const ACTOR_ID = 'clockworks/tiktok-comments-scraper';
const COMMENTS_PER_POST = 500;
const DEFAULT_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;

type ApifyProviderOptions = {
    token: string;
    timeoutMs?: number;
    requestId?: string;
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number | undefined): boolean {
    if (!status) return true;
    return status === 408 || status === 429 || status >= 500;
}

function classifyApifyError(error: unknown): TikTokProviderError {
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();
    const status =
        typeof error === 'object' && error && 'statusCode' in error
            ? Number((error as { statusCode?: number }).statusCode)
            : undefined;

    if (lower.includes('timeout') || lower.includes('aborted') || status === 408) {
        return new TikTokProviderError('TIMEOUT', message, { retryable: true, cause: error });
    }
    if (status === 429 || lower.includes('rate')) {
        return new TikTokProviderError('RATE_LIMIT', message, { retryable: true, cause: error });
    }
    if (lower.includes('private')) {
        return new TikTokProviderError('PRIVATE_VIDEO', message, { retryable: false, cause: error });
    }
    if (lower.includes('not found') || lower.includes('deleted') || status === 404) {
        return new TikTokProviderError('DELETED_VIDEO', message, { retryable: false, cause: error });
    }
    return new TikTokProviderError('SCRAPER_UNAVAILABLE', message, {
        retryable: isRetryableStatus(status),
        cause: error,
    });
}

export class ApifyCommentProvider implements TikTokCommentProvider {
    readonly id = 'apify';

    private readonly token: string;
    private readonly timeoutMs: number;
    private readonly requestId?: string;

    constructor(options: ApifyProviderOptions) {
        this.token = options.token;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.requestId = options.requestId;
    }

    async fetchComments(
        postUrl: string,
        options?: { signal?: AbortSignal }
    ): Promise<TikTokFetchResult> {
        const started = Date.now();
        let retryCount = 0;
        let lastError: unknown;

        while (retryCount <= MAX_RETRIES) {
            try {
                const result = await this.runOnce(postUrl, options?.signal, retryCount);
                logTikTokEvent('fetch_success', {
                    requestId: this.requestId,
                    provider: this.id,
                    durationMs: Date.now() - started,
                    retryCount,
                    fetchedComments: result.meta.fetchedComments,
                    returnedParticipants: result.participants.length,
                });
                return result;
            } catch (error) {
                const mapped = error instanceof TikTokProviderError ? error : classifyApifyError(error);
                lastError = mapped;

                if (!mapped.retryable || retryCount >= MAX_RETRIES) {
                    logTikTokEvent('fetch_error', {
                        requestId: this.requestId,
                        provider: this.id,
                        durationMs: Date.now() - started,
                        retryCount,
                        code: mapped.code,
                        errors: mapped.message.slice(0, 200),
                    });
                    throw mapped;
                }

                const backoff = Math.min(8000, 500 * 2 ** retryCount);
                logTikTokEvent('fetch_retry', {
                    requestId: this.requestId,
                    provider: this.id,
                    retryCount,
                    backoffMs: backoff,
                    code: mapped.code,
                });
                await sleep(backoff);
                retryCount++;
            }
        }

        throw lastError instanceof TikTokProviderError
            ? lastError
            : new TikTokProviderError('UNKNOWN', 'Fetch failed', { cause: lastError });
    }

    private async runOnce(
        postUrl: string,
        outerSignal: AbortSignal | undefined,
        retryCount: number
    ): Promise<TikTokFetchResult> {
        const started = Date.now();
        const client = new ApifyClient({ token: this.token });

        const controller = new AbortController();
        const onAbort = () => controller.abort();
        outerSignal?.addEventListener('abort', onAbort);

        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            if (controller.signal.aborted) {
                throw new TikTokProviderError('TIMEOUT', 'Request aborted before start', {
                    retryable: true,
                });
            }

            // Apify client doesn't take AbortSignal directly; race with timeout promise
            const runPromise = client.actor(ACTOR_ID).call({
                postURLs: [postUrl],
                commentsPerPost: COMMENTS_PER_POST,
            });

            const run = await Promise.race([
                runPromise,
                new Promise<never>((_, reject) => {
                    controller.signal.addEventListener('abort', () => {
                        reject(
                            new TikTokProviderError('TIMEOUT', 'Apify actor call timed out', {
                                retryable: true,
                            })
                        );
                    });
                }),
            ]);

            const datasetId = run.defaultDatasetId;
            if (!datasetId) {
                throw new TikTokProviderError('SCRAPER_UNAVAILABLE', 'Missing dataset id', {
                    retryable: true,
                });
            }

            const { items } = await client.dataset(datasetId).listItems();
            const rawItems = Array.isArray(items) ? (items as TikTokRawComment[]) : [];

            // Incremental normalize — single pass, no extra map copies beyond result arrays
            const normalized = normalizeParticipantBatch(rawItems, { dedupe: true });

            if (normalized.participants.length === 0) {
                throw new TikTokProviderError('EMPTY_RESULT', 'No valid comments returned', {
                    retryable: false,
                });
            }

            return {
                participants: normalized.participants,
                meta: {
                    provider: this.id,
                    durationMs: Date.now() - started,
                    fetchedComments: rawItems.length,
                    validParticipants: normalized.participants.length,
                    invalidRecords: normalized.invalidRecords,
                    duplicatesRemoved: normalized.duplicatesRemoved,
                    emptyUsernamesRemoved: normalized.emptyUsernamesRemoved,
                    retryCount,
                    pageCount: 1,
                },
            };
        } catch (error) {
            if (error instanceof TikTokProviderError) throw error;
            throw classifyApifyError(error);
        } finally {
            clearTimeout(timer);
            outerSignal?.removeEventListener('abort', onAbort);
        }
    }
}

export function createDefaultTikTokProvider(
    options: { token?: string; requestId?: string; timeoutMs?: number } = {}
): TikTokCommentProvider {
    const token = options.token ?? process.env.APIFY_API_TOKEN;
    if (!token) {
        throw new TikTokProviderError(
            'NO_APIFY_TOKEN',
            'APIFY_API_TOKEN is not configured',
            { retryable: false }
        );
    }
    return new ApifyCommentProvider({
        token,
        requestId: options.requestId,
        timeoutMs: options.timeoutMs,
    });
}
