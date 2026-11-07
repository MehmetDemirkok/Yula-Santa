"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GoogleButton } from "./GoogleButton";

/**
 * Google is the only sign-in method that exists (see auth.ts), so the login and
 * register pages offer just this instead of email/password forms that did nothing.
 */
export function GoogleSignIn() {
    const t = useTranslations("auth");

    return (
        <div className="space-y-5">
            <GoogleButton />
            <p className="text-label-sm text-[var(--text-muted)] text-center leading-relaxed">
                {t.rich("register.terms", {
                    privacy: (chunks) => (
                        <Link href="/privacy" className="font-semibold text-indigo-accent hover:underline">
                            {chunks}
                        </Link>
                    ),
                    terms: (chunks) => (
                        <Link href="/legal" className="font-semibold text-indigo-accent hover:underline">
                            {chunks}
                        </Link>
                    ),
                })}
            </p>
        </div>
    );
}
