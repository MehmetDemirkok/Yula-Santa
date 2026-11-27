"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryParam } from "./useQueryParam";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, MailCheck, MailX } from "lucide-react";
import { localePath } from "@/lib/localePath";
import { emailError, normalizeEmail, passwordError, PASSWORD_MIN } from "@/lib/auth/credentials";

const inputClass =
    "h-[48px] w-full rounded-xl border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--input-focus)] focus:outline-none";
const primaryButton =
    "flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-santa-red font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-60";

function Message({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
    return kind === "ok" ? (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-950/30 dark:text-green-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span>{children}</span>
        </p>
    ) : (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span>{children}</span>
        </p>
    );
}

/** /forgot-password: asks for the e-mail and mails a reset link. Same answer whether or not an account exists. */
export function ForgotPasswordForm() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const [noAccount, setNoAccount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        const problem = emailError(normalizeEmail(email));
        if (problem) return setError(t(`login.errors.${problem}`));
        setBusy(true);
        try {
            const response = await fetch("/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalizeEmail(email), locale }),
            });
            if (response.ok) setSent(true);
            else if (response.status === 404) setNoAccount(normalizeEmail(email));
            else setError(response.status === 429 ? t("tooMany") : t("unavailable"));
        } catch {
            setError(t("unavailable"));
        } finally {
            setBusy(false);
        }
    };

    if (noAccount) {
        return (
            <div className="ys-card space-y-4 p-6 text-center sm:p-8">
                <MailX className="mx-auto h-12 w-12 text-amber-500" aria-hidden />
                <p className="font-bold text-foreground">{t("emails.noAccount", { email: noAccount })}</p>
                <p className="text-sm text-[var(--text-secondary)]">{t("emails.noAccountHint")}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    <NextLink href={localePath(locale, "/login")} className="flex h-[52px] items-center justify-center rounded-xl border-2 border-[var(--border-medium)] font-bold text-foreground hover:bg-[var(--surface-2)]">
                        {t("google")}
                    </NextLink>
                    <NextLink href={localePath(locale, "/register")} className="flex h-[52px] items-center justify-center rounded-xl bg-santa-red font-bold text-white hover:brightness-110">
                        {t("login.registerLink")}
                    </NextLink>
                </div>
                <button type="button" onClick={() => setNoAccount(null)} className="inline-flex min-h-[44px] items-center text-sm font-bold text-[var(--text-secondary)] hover:text-foreground">
                    {t("emails.tryOtherEmail")}
                </button>
            </div>
        );
    }

    if (sent) {
        return (
            <div className="ys-card space-y-4 p-6 text-center sm:p-8">
                <MailCheck className="mx-auto h-12 w-12 text-success-green" aria-hidden />
                <p className="text-[var(--text-secondary)]">{t("emails.forgotSent", { email: normalizeEmail(email) })}</p>
                <NextLink href={localePath(locale, "/login")} className="inline-flex min-h-[44px] items-center font-bold text-santa-red hover:underline">{t("emails.backToLogin")}</NextLink>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} noValidate className="ys-card space-y-4 p-6 sm:p-8">
            {error && <Message kind="error">{error}</Message>}
            <div>
                <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]">{t("login.email")}</label>
                <input id="forgot-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.emailPlaceholder")} className={inputClass} />
            </div>
            <button type="submit" disabled={busy} className={primaryButton}>
                {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} {t("emails.sendLink")}
            </button>
            <p className="text-center text-[13px] text-[var(--text-muted)]">{t("emails.forgotGoogle")}</p>
            <NextLink href={localePath(locale, "/login")} className="flex min-h-[44px] items-center justify-center text-sm font-bold text-[var(--text-secondary)] hover:text-foreground">{t("emails.backToLogin")}</NextLink>
        </form>
    );
}

/** /reset-password?token=…: sets a new password from the e-mailed link. */
export function ResetPasswordForm() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const tokenParam = useQueryParam("token");
    const token = tokenParam ?? "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rejected, setRejected] = useState(false);
    // A link without a token is broken; `undefined` (not read yet) still shows the form.
    const badLink = rejected || tokenParam === null;

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        const problem = passwordError(password);
        if (problem) return setError(t(`register.errors.${problem === "passwordMax" ? "passwordMin" : problem}`, { min: PASSWORD_MIN }));
        if (confirm !== password) return setError(t("register.errors.confirmMismatch"));
        setBusy(true);
        try {
            const response = await fetch("/api/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            if (response.ok) return setDone(true);
            const data = (await response.json().catch(() => ({}))) as { error?: string };
            if (data.error === "invalid_token") setRejected(true);
            else setError(response.status === 429 ? t("tooMany") : t("unavailable"));
        } catch {
            setError(t("unavailable"));
        } finally {
            setBusy(false);
        }
    };

    if (done) {
        return (
            <div className="ys-card space-y-4 p-6 text-center sm:p-8">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success-green" aria-hidden />
                <p className="text-[var(--text-secondary)]">{t("emails.resetDone")}</p>
                <NextLink href={localePath(locale, "/login")} className={primaryButton}>{t("navLogin")}</NextLink>
            </div>
        );
    }
    if (badLink) {
        return (
            <div className="ys-card space-y-4 p-6 text-center sm:p-8">
                <Message kind="error">{t("emails.badLink")}</Message>
                <NextLink href={localePath(locale, "/forgot-password")} className={primaryButton}>{t("emails.newLink")}</NextLink>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} noValidate className="ys-card space-y-4 p-6 sm:p-8">
            {error && <Message kind="error">{error}</Message>}
            <div className="relative">
                <label htmlFor="reset-password" className="sr-only">{t("accountPage.newPassword")}</label>
                <input id="reset-password" type={show ? "text" : "password"} autoComplete="new-password" value={password} maxLength={128} onChange={(e) => setPassword(e.target.value)} placeholder={t("register.passwordPlaceholder", { min: PASSWORD_MIN })} className={`${inputClass} pe-12`} />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t("hidePassword") : t("showPassword")} className="absolute end-1 top-1/2 flex h-[40px] w-[40px] !min-h-0 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-foreground">
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
            <div>
                <label htmlFor="reset-confirm" className="sr-only">{t("register.confirmPassword")}</label>
                <input id="reset-confirm" type={show ? "text" : "password"} autoComplete="new-password" value={confirm} maxLength={128} onChange={(e) => setConfirm(e.target.value)} placeholder={t("register.confirmPasswordPlaceholder")} className={inputClass} />
            </div>
            <button type="submit" disabled={busy} className={primaryButton}>
                {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} {t("accountPage.save")}
            </button>
        </form>
    );
}

/** /verify-email?token=…: confirms the address as soon as the page opens. */
export function VerifyEmailStatus() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const tokenParam = useQueryParam("token");
    const token = tokenParam ?? "";
    const { update } = useSession();
    const [result, setState] = useState<"working" | "done" | "bad" | "error">("working");
    // No token in the link at all: nothing to confirm. Until the query is read, keep "working".
    const state = tokenParam === null ? "bad" : result;
    const started = useRef(false);

    useEffect(() => {
        if (!token || started.current) return;
        started.current = true;
        fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
            .then(async (response) => {
                if (response.ok) {
                    setState("done");
                    // Refresh the session cookie so "confirm your e-mail" disappears. The session may
                    // still be loading here, so don't wait for it; update() is a no-op when signed out.
                    await update().catch(() => undefined);
                } else {
                    const data = (await response.json().catch(() => ({}))) as { error?: string };
                    setState(data.error === "invalid_token" ? "bad" : "error");
                }
            })
            .catch(() => setState("error"));
    }, [token, update]);

    return (
        <div className="ys-card space-y-4 p-6 text-center sm:p-8">
            {state === "working" && <Loader2 className="mx-auto h-10 w-10 animate-spin text-santa-red" aria-label={t("emails.verifying")} />}
            {state === "done" && (
                <>
                    <MailCheck className="mx-auto h-12 w-12 text-success-green" aria-hidden />
                    <p className="font-bold text-foreground">{t("emails.verified")}</p>
                    <NextLink href={localePath(locale, "/")} className={primaryButton}>{t("continue")}</NextLink>
                </>
            )}
            {state === "bad" && (
                <>
                    <Message kind="error">{t("emails.badVerifyLink")}</Message>
                    <NextLink href={localePath(locale, "/account")} className={primaryButton}>{t("accountPage.title")}</NextLink>
                </>
            )}
            {state === "error" && <Message kind="error">{t("unavailable")}</Message>}
        </div>
    );
}
