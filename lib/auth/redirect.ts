/**
 * Where to send someone after signing in. Client-safe and pure.
 *
 * Only same-site paths are accepted ("/raffle", "/en/youtube?x=1"); anything that
 * could leave the site ("//evil.com", "https://…", "/\\evil.com") or would loop back
 * to the sign-in pages falls back to `fallback`.
 */
export function safeRedirect(target: string | null | undefined, fallback: string): string {
    if (!target || typeof target !== "string") return fallback;
    if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) return fallback;
    if (/[\u0000-\u001f]/.test(target)) return fallback;
    const path = target.split(/[?#]/)[0];
    if (/^(?:\/[a-z]{2})?\/(?:login|register)\/?$/.test(path)) return fallback;
    return target;
}

/** The login page URL that brings the visitor back to `returnTo` afterwards. */
export function loginHref(loginPath: string, returnTo: string | null | undefined): string {
    const back = safeRedirect(returnTo, "");
    return back && back !== "/" ? `${loginPath}?callbackUrl=${encodeURIComponent(back)}` : loginPath;
}
