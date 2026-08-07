import type { TikTokParticipant, TikTokRawComment } from './types';

/** Strip @, trim, lowercase (tr-TR) — same semantics as giveawayFilters.normalizeGiveawayName. */
export function normalizeTikTokUsername(name: string): string {
    return name.trim().replace(/^@+/, '').toLocaleLowerCase('tr-TR');
}

/** Display name: trim + strip leading @, preserve original casing for UI. */
export function sanitizeDisplayUsername(name: string): string {
    return name.trim().replace(/^@+/, '').replace(/[\u0000-\u001F\u007F]/g, '');
}

export function sanitizeCommentText(text: string): string {
    return text.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

export function isValidTikTokUsername(name: string): boolean {
    const cleaned = sanitizeDisplayUsername(name);
    if (!cleaned || cleaned.length > 64) return false;
    // TikTok usernames: letters, numbers, underscore, period
    return /^[a-zA-Z0-9._]+$/.test(cleaned);
}

export type NormalizeBatchResult = {
    participants: TikTokParticipant[];
    invalidRecords: number;
    emptyUsernamesRemoved: number;
    duplicatesRemoved: number;
};

/**
 * Validate + normalize raw provider items into participants.
 * Invalid records are skipped (never fail the whole batch).
 * Dedupes by normalized username, keeping first occurrence.
 */
export function normalizeParticipantBatch(
    items: readonly TikTokRawComment[],
    options?: { dedupe?: boolean }
): NormalizeBatchResult {
    const dedupe = options?.dedupe ?? true;
    const participants: TikTokParticipant[] = [];
    const seen = new Set<string>();
    let invalidRecords = 0;
    let emptyUsernamesRemoved = 0;
    let duplicatesRemoved = 0;

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            invalidRecords++;
            continue;
        }

        const rawName =
            pickString(item.uniqueId) ||
            pickString(item.username) ||
            pickString(item.nickname);

        if (!rawName) {
            emptyUsernamesRemoved++;
            continue;
        }

        const name = sanitizeDisplayUsername(rawName);
        if (!isValidTikTokUsername(name)) {
            invalidRecords++;
            continue;
        }

        const comment = sanitizeCommentText(
            pickString(item.text) || pickString(item.comment) || ''
        );
        // Empty comment is allowed for manual-like rows but provider rows without text are skipped
        if (!comment) {
            invalidRecords++;
            continue;
        }

        if (dedupe) {
            const key = normalizeTikTokUsername(name);
            if (seen.has(key)) {
                duplicatesRemoved++;
                continue;
            }
            seen.add(key);
        }

        participants.push({ name, comment });
    }

    return { participants, invalidRecords, emptyUsernamesRemoved, duplicatesRemoved };
}

function pickString(value: unknown): string {
    return typeof value === 'string' ? value : '';
}
