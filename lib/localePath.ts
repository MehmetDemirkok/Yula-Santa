import { defaultLocale } from '@/i18n/config';

/** Build a locale-aware path for `as-needed` prefix strategy (TR has no `/tr` prefix). */
export function localePath(locale: string | string[] | undefined, path: string = ''): string {
    const loc = Array.isArray(locale) ? locale[0] : locale;
    const normalized = path.startsWith('/') ? path : path ? `/${path}` : '';
    if (!loc || loc === defaultLocale) {
        return normalized || '/';
    }
    return `/${loc}${normalized}`;
}
