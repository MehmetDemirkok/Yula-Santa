"use client";

import NextLink from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, Car, LogIn, LogOut, ShieldCheck, UserPlus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { localePath } from "@/lib/localePath";
import { safeRedirect } from "@/lib/auth/redirect";
import { GoogleSignIn } from "./GoogleSignIn";
import { UserAvatar } from "./AccountMenu";
import { EmailAuthForm } from "./EmailAuthForm";
import { useQueryParam } from "./useQueryParam";

/**
 * Body of /login and /register: e-mail + password form and the Google button.
 * A signed-in visitor sees who they are instead, and Auth.js errors (sent here
 * as ?error=…, see `pages` in auth.ts) show a short message.
 */
export function AuthPanel({ mode }: { mode: "login" | "register" }) {
    const t = useTranslations("auth");
    const locale = useLocale();
    const callbackUrl = useQueryParam("callbackUrl");
    const error = useQueryParam("error");
    const { data: session } = useSession();
    const next = safeRedirect(callbackUrl ?? null, localePath(locale, "/"));

    // The form renders at once (also in the server HTML) instead of waiting for
    // /api/auth/session; a signed-in visitor sees the welcome card when it arrives.
    if (session?.user) {
        const { name, email, image } = session.user;
        return (
            <div className="ys-card space-y-5 p-6 text-center sm:p-8">
                <div className="flex justify-center">
                    <UserAvatar name={name} image={image} size={64} />
                </div>
                <div>
                    <p className="font-heading text-xl font-bold text-foreground">{t("welcome", { name: name ?? "" })}</p>
                    {email && <p className="mt-1 text-sm text-[var(--text-muted)]">{t("signedInAs", { email })}</p>}
                </div>
                <NextLink
                    href={next}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-santa-red font-bold text-white shadow-md transition hover:brightness-110"
                >
                    {t("continue")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </NextLink>
                <button
                    type="button"
                    onClick={() => signOut({ redirectTo: localePath(locale, "/login") })}
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[var(--text-muted)] hover:text-santa-red"
                >
                    <LogOut className="h-4 w-4" aria-hidden /> {t("logout")}
                </button>
            </div>
        );
    }

    const other = mode === "login"
        ? { text: t("login.noAccount"), link: t("login.registerLink"), href: "/register" as const }
        : { text: t("register.haveAccount"), link: t("register.loginLink"), href: "/login" as const };
    const otherHref = callbackUrl ? { pathname: other.href, query: { callbackUrl } } : other.href;

    return (
        <div className="space-y-4">
            {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {t("error")}
                </div>
            )}

            <div className="ys-card space-y-5 p-6 sm:p-8">
                <EmailAuthForm mode={mode} redirectTo={next} />
                {mode === "login" && (
                    <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">{t("googleHint")}</p>
                )}

                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]" aria-hidden>
                    <span className="h-px flex-1 bg-[var(--border-light)]" />
                    {t("or")}
                    <span className="h-px flex-1 bg-[var(--border-light)]" />
                </div>

                <GoogleSignIn redirectTo={next} />
                {mode === "register" && (
                    <p className="text-center text-xs text-[var(--text-muted)]">{t("registerNote")}</p>
                )}
            </div>

            {/* The other page as a full-width button: a small text link was easy to miss. */}
            <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-[var(--text-secondary)]">{other.text}</p>
                <Link
                    href={otherHref}
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-santa-red bg-[var(--card-bg)] text-[16px] font-bold text-santa-red transition-colors hover:bg-santa-red hover:text-white"
                >
                    {mode === "login" ? <UserPlus className="h-5 w-5" aria-hidden /> : <LogIn className="h-5 w-5" aria-hidden />}
                    {other.link}
                </Link>
            </div>

            <ul className="space-y-2 rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-green" aria-hidden />
                    {t("benefitTools")}
                </li>
                <li className="flex items-start gap-2.5">
                    <Car className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" aria-hidden />
                    {t("benefitPlaka")}
                </li>
            </ul>
        </div>
    );
}
