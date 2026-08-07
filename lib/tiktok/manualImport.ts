import { normalizeTikTokUsername, sanitizeCommentText, sanitizeDisplayUsername, isValidTikTokUsername } from './normalize';
import type { TikTokParticipant } from './types';

export type ManualImportRow = TikTokParticipant & {
    sourceLine: number;
    duplicate: boolean;
};

export type ManualImportPreview = {
    rows: ManualImportRow[];
    validCount: number;
    duplicateCount: number;
    invalidCount: number;
    skippedEmpty: number;
};

/**
 * Parse pasted/uploaded text into TikTok participants.
 * Supports:
 * - name: comment
 * - @name comment
 * - CSV: name,comment
 * - one username per line
 * - Excel paste (tab-separated)
 */
export function parseManualImport(
    raw: string,
    existingNames: readonly string[] = []
): ManualImportPreview {
    const existing = new Set(existingNames.map(normalizeTikTokUsername).filter(Boolean));
    const seen = new Set<string>(existing);
    const rows: ManualImportRow[] = [];
    let invalidCount = 0;
    let skippedEmpty = 0;
    let duplicateCount = 0;
    let validCount = 0;

    const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            skippedEmpty++;
            continue;
        }

        // Skip CSV header-ish rows
        if (i === 0 && /^(username|name|user|kullanici)/i.test(line) && /comment|yorum/i.test(line)) {
            continue;
        }

        const parsed = parseLine(line);
        if (!parsed) {
            invalidCount++;
            continue;
        }

        const key = normalizeTikTokUsername(parsed.name);
        const duplicate = seen.has(key);
        if (duplicate) {
            duplicateCount++;
        } else {
            seen.add(key);
            validCount++;
        }

        rows.push({
            ...parsed,
            sourceLine: i + 1,
            duplicate,
        });
    }

    return { rows, validCount, duplicateCount, invalidCount, skippedEmpty };
}

export function applyManualImportPreview(
    preview: ManualImportPreview,
    options?: { includeDuplicates?: boolean }
): TikTokParticipant[] {
    const includeDuplicates = options?.includeDuplicates ?? false;
    const out: TikTokParticipant[] = [];
    for (const row of preview.rows) {
        if (row.duplicate && !includeDuplicates) continue;
        out.push({ name: row.name, comment: row.comment });
    }
    return out;
}

function parseLine(line: string): TikTokParticipant | null {
    // Tab-separated (Excel paste): name \t comment
    if (line.includes('\t')) {
        const [namePart, ...rest] = line.split('\t');
        return toParticipant(namePart, rest.join('\t'));
    }

    // CSV: name,comment (only split on first comma if two+ fields look username-like)
    if (line.includes(',') && !line.includes(':')) {
        const idx = line.indexOf(',');
        const namePart = line.slice(0, idx);
        const commentPart = line.slice(idx + 1);
        const candidate = sanitizeDisplayUsername(namePart);
        if (isValidTikTokUsername(candidate)) {
            return toParticipant(namePart, commentPart);
        }
        // Looks like CSV but username is invalid — do not fall through to loose parsers
        return null;
    }

    // name: comment
    if (line.includes(':')) {
        const idx = line.indexOf(':');
        return toParticipant(line.slice(0, idx), line.slice(idx + 1));
    }

    // @name rest...
    const atMatch = line.match(/^@?([a-zA-Z0-9._]+)\s+(.*)$/);
    if (atMatch) {
        return toParticipant(atMatch[1], atMatch[2]);
    }

    // bare username
    return toParticipant(line, 'Manual Entry');
}

function toParticipant(nameRaw: string, commentRaw: string): TikTokParticipant | null {
    const name = sanitizeDisplayUsername(nameRaw);
    if (!isValidTikTokUsername(name)) return null;
    const comment = sanitizeCommentText(commentRaw) || 'Manual Entry';
    return { name, comment };
}
