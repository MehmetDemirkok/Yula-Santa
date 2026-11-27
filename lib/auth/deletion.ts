/** Rules for deleting an account. Pure and client-safe. */

/** Google users must have signed in this recently to delete their account (no password to ask for). */
export const DELETE_REAUTH_SECONDS = 15 * 60;

/**
 * The word typed to confirm, per locale. Must match `auth.accountPage.deleteWord`
 * in messages/*.json (tests/auth/account.test.ts checks it).
 */
export const DELETE_WORDS: Record<string, string> = {
    tr: "SİL",
    en: "DELETE",
    de: "LÖSCHEN",
    fr: "SUPPRIMER",
    es: "ELIMINAR",
    it: "ELIMINA",
    pt: "EXCLUIR",
    ru: "УДАЛИТЬ",
    ar: "حذف",
    ja: "削除",
    ko: "삭제",
    zh: "删除",
};

export function deleteWordFor(locale: string): string {
    return DELETE_WORDS[locale] ?? DELETE_WORDS.en;
}

export function isFreshSignIn(authAt: number | undefined, nowSeconds: number): boolean {
    if (typeof authAt !== "number") return false;
    const age = nowSeconds - authAt;
    return age >= 0 && age <= DELETE_REAUTH_SECONDS;
}

/** Case-insensitive, and for Turkish "sil" / "SIL" count as "SİL" (keyboards without İ). */
export function isDeleteConfirmed(input: unknown, locale: string): boolean {
    if (typeof input !== "string") return false;
    const word = deleteWordFor(locale);
    const typed = input.trim();
    if (locale === "tr") return typed.toLocaleUpperCase("tr").replace("I", "İ") === word;
    return typed.toLocaleUpperCase(locale) === word.toLocaleUpperCase(locale);
}
