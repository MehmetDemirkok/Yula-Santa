/**
 * Locales that have the office, university and what-is Secret Santa pages.
 * Kept apart from the long copy files so client components (the /s growth
 * card) can link to these pages without bundling their text.
 */
export const LANDING_LOCALES = ['tr', 'en', 'ru'] as const;

export function hasSantaLanding(locale: string): boolean {
    return (LANDING_LOCALES as readonly string[]).includes(locale);
}
