/** Validates + normalizes raw comment payloads coming from the Chrome Extension. */
import { normalizeTikTokUsername, sanitizeDisplayUsername, sanitizeCommentText, isValidTikTokUsername } from './normalize';
import type { IncomingComment } from './giveawayStore';

export const MAX_IMPORT_BATCH = 1000;

export type RawImportComment = {
    username?: unknown;
    displayName?: unknown;
    comment?: unknown;
    commentId?: unknown;
    timestamp?: unknown;
};

export type ImportValidationResult = {
    valid: IncomingComment[];
    invalidUsername: number;
    emptyComment: number;
};

/** Empty comments and invalid usernames are dropped silently (spec §10) — never fail the whole batch. */
export function validateImportBatch(items: readonly RawImportComment[]): ImportValidationResult {
    const valid: IncomingComment[] = [];
    let invalidUsername = 0;
    let emptyComment = 0;

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            invalidUsername++;
            continue;
        }

        const rawUsername = typeof item.username === 'string' ? item.username : '';
        const cleanedUsername = sanitizeDisplayUsername(rawUsername);
        if (!isValidTikTokUsername(cleanedUsername)) {
            invalidUsername++;
            continue;
        }

        const comment = sanitizeCommentText(typeof item.comment === 'string' ? item.comment : '');
        if (!comment) {
            emptyComment++;
            continue;
        }

        const displayName =
            typeof item.displayName === 'string' && item.displayName.trim()
                ? item.displayName.trim().slice(0, 100)
                : cleanedUsername;

        const commentId =
            typeof item.commentId === 'string' && item.commentId.trim() ? item.commentId.trim().slice(0, 128) : null;

        const rawTimestamp = typeof item.timestamp === 'string' ? item.timestamp.trim() : '';
        const parsed = rawTimestamp ? new Date(rawTimestamp) : null;
        const commentedAt = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null;

        valid.push({
            username: normalizeTikTokUsername(cleanedUsername),
            displayName,
            comment,
            commentId,
            commentedAt,
        });
    }

    return { valid, invalidUsername, emptyComment };
}
