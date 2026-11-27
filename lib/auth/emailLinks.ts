/**
 * Builds the links we e-mail. Pure.
 *
 * Production always uses SITE_URL, never the request's Host header, so a forged
 * Host cannot make us mail a reset link that points somewhere else. Local and
 * preview builds use the request's own origin so the link works there.
 */
import { SITE_URL } from "@/lib/constants";
import { locales } from "@/i18n/config";
import { localePath } from "@/lib/localePath";

export const RESET_TTL_MINUTES = 30;
export const VERIFY_TTL_MINUTES = 24 * 60;

export function appOrigin(requestUrl: string, vercelEnv: string | undefined): string {
    if (vercelEnv === "production") return SITE_URL;
    try {
        return new URL(requestUrl).origin;
    } catch {
        return SITE_URL;
    }
}

export function pickLocale(value: unknown): string {
    return typeof value === "string" && (locales as readonly string[]).includes(value) ? value : "tr";
}

export function accountLink(origin: string, locale: string, path: "/reset-password" | "/verify-email", token: string): string {
    return `${origin}${localePath(pickLocale(locale), path)}?token=${encodeURIComponent(token)}`;
}
