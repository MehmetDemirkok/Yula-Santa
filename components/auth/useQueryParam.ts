"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
};

/**
 * Reads one query parameter without useSearchParams. useSearchParams forces a
 * Suspense boundary on a static page, so the form would only appear after
 * hydration. This renders the full page on the server and picks the value up
 * right after hydration.
 *
 * `undefined` means "not read yet" (server HTML, first client pass); `null`
 * means the parameter is really missing.
 */
export function useQueryParam(name: string): string | null | undefined {
    return useSyncExternalStore(
        subscribe,
        () => new URLSearchParams(window.location.search).get(name),
        () => undefined,
    );
}
