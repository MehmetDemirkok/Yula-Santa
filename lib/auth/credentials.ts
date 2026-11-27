/**
 * Validation rules for e-mail + password accounts. Pure and client-safe, so the
 * forms and the API check exactly the same things.
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const NAME_MAX = 60;
export const EMAIL_MAX = 254;

export type CredentialsError =
    | "nameRequired"
    | "emailRequired"
    | "emailInvalid"
    | "passwordRequired"
    | "passwordMin"
    | "passwordMax";

/** Trimmed, lower-cased e-mail; the unique key for an account. */
export function normalizeEmail(email: unknown): string {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function cleanName(name: unknown): string {
    return typeof name === "string"
        ? name.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX)
        : "";
}

export function emailError(email: string): CredentialsError | null {
    if (!email) return "emailRequired";
    if (email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "emailInvalid";
    return null;
}

export function passwordError(password: unknown): CredentialsError | null {
    if (typeof password !== "string" || password.length === 0) return "passwordRequired";
    if (password.length < PASSWORD_MIN) return "passwordMin";
    if (password.length > PASSWORD_MAX) return "passwordMax";
    return null;
}

/** First problem with a sign-up, or null when it can be stored. */
export function registrationError(input: { name: unknown; email: unknown; password: unknown }): CredentialsError | null {
    if (!cleanName(input.name)) return "nameRequired";
    return emailError(normalizeEmail(input.email)) ?? passwordError(input.password);
}
