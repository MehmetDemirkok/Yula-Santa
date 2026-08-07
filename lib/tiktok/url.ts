/**
 * TikTok URL helpers — validation only (no network).
 */

const TIKTOK_VIDEO_RE =
    /^(https?:\/\/)?((www|vm|vt)\.)?tiktok\.com\/(@[\w.-]+\/video\/\d+|t\/[\w-]+|[\w-]+\/?)(\?.*)?$/i;

const TIKTOK_HOST_RE = /(^|\.)tiktok\.com$/i;

export function isLikelyTikTokUrl(raw: string): boolean {
    const value = raw.trim();
    if (!value) return false;
    if (!value.toLowerCase().includes('tiktok.com')) return false;
    try {
        const withProto = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        const url = new URL(withProto);
        return TIKTOK_HOST_RE.test(url.hostname);
    } catch {
        return TIKTOK_VIDEO_RE.test(value);
    }
}

export function normalizeTikTokPostUrl(raw: string): string {
    const value = raw.trim();
    if (!value) return value;
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
