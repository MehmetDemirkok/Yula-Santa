"use client";

import NextLink from "next/link";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { localePath } from "@/lib/localePath";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanName, emailError, normalizeEmail, passwordError, PASSWORD_MIN, type CredentialsError } from "@/lib/auth/credentials";

type Field = "name" | "email" | "password" | "confirm";

const inputClass =
    "h-[48px] w-full rounded-xl border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--input-focus)] focus:outline-none aria-[invalid=true]:border-red-400";

/**
 * E-mail + password sign-in and sign-up. Sign-up posts to /api/auth/register
 * and then signs in with the same credentials; the rules are shared with the API
 * (lib/auth/credentials.ts).
 */
export function EmailAuthForm({ mode, redirectTo }: { mode: "login" | "register"; redirectTo: string }) {
    const t = useTranslations("auth");
    const locale = useLocale();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const isRegister = mode === "register";
    const copy = isRegister ? "register" : "login";

    const fieldMessage = (code: CredentialsError) => t(`${copy}.errors.${code === "passwordMax" ? "passwordMin" : code}`, { min: PASSWORD_MIN });

    const validate = (): boolean => {
        const next: Partial<Record<Field, string>> = {};
        if (isRegister && !cleanName(name)) next.name = t("register.errors.nameRequired");
        const mailProblem = emailError(normalizeEmail(email));
        if (mailProblem) next.email = fieldMessage(mailProblem);
        const passProblem = passwordError(password);
        // Logging in only needs a password; the length rule is for new accounts.
        if (passProblem && (isRegister || passProblem === "passwordRequired")) next.password = fieldMessage(passProblem);
        if (isRegister && !next.password && confirm !== password) next.confirm = t("register.errors.confirmMismatch");
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const finishSignIn = async () => {
        const result = await signIn("credentials", { email: normalizeEmail(email), password, redirect: false });
        if (!result || result.error) {
            setFormError(result?.code === "rate_limited" ? t("tooMany") : t("invalidCredentials"));
            return false;
        }
        window.location.assign(redirectTo);
        return true;
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!validate()) return;
        setBusy(true);
        try {
            if (isRegister) {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: cleanName(name), email: normalizeEmail(email), password, locale }),
                });
                if (!response.ok) {
                    const data = (await response.json().catch(() => ({}))) as { error?: string };
                    if (data.error === "email_taken") setErrors({ email: t("emailTaken") });
                    else setFormError(data.error === "rate_limited" ? t("tooMany") : t("unavailable"));
                    return;
                }
            }
            if (await finishSignIn()) return;
        } catch {
            setFormError(t("unavailable"));
        } finally {
            setBusy(false);
        }
    };

    const fieldProps = (field: Field) => ({
        "aria-invalid": Boolean(errors[field]),
        "aria-describedby": errors[field] ? `auth-${field}-error` : undefined,
        onInput: () => errors[field] && setErrors((prev) => ({ ...prev, [field]: undefined })),
    });

    const error = (field: Field) =>
        errors[field] ? (
            <p id={`auth-${field}-error`} className="mt-1.5 text-[13px] font-medium text-red-600 dark:text-red-400">
                {errors[field]}
            </p>
        ) : null;

    const label = "mb-1.5 block text-sm font-bold text-[var(--text-primary)]";

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
            {formError && (
                <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {formError}
                </div>
            )}

            {isRegister && (
                <div>
                    <label htmlFor="auth-name" className={label}>{t("register.name")}</label>
                    <input id="auth-name" name="name" autoComplete="name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder={t("register.namePlaceholder")} className={inputClass} {...fieldProps("name")} />
                    {error("name")}
                </div>
            )}

            <div>
                <label htmlFor="auth-email" className={label}>{t(`${copy}.email`)}</label>
                <input id="auth-email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t(`${copy}.emailPlaceholder`)} className={inputClass} {...fieldProps("email")} />
                {error("email")}
            </div>

            <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="auth-password" className="block text-sm font-bold text-[var(--text-primary)]">{t(`${copy}.password`)}</label>
                    {!isRegister && (
                        <NextLink href={localePath(locale, "/forgot-password")} className="text-[13px] font-bold text-santa-red hover:underline">
                            {t("login.forgot")}
                        </NextLink>
                    )}
                </div>
                <div className="relative">
                    <input
                        id="auth-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={isRegister ? "new-password" : "current-password"}
                        value={password}
                        maxLength={128}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t(`${copy}.passwordPlaceholder`, { min: PASSWORD_MIN })}
                        className={cn(inputClass, "pe-12")}
                        {...fieldProps("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                        className="absolute end-1 top-1/2 flex h-[40px] w-[40px] !min-h-0 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {error("password")}
            </div>

            {isRegister && (
                <div>
                    <label htmlFor="auth-confirm" className={label}>{t("register.confirmPassword")}</label>
                    <input id="auth-confirm" name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirm} maxLength={128} onChange={(e) => setConfirm(e.target.value)} placeholder={t("register.confirmPasswordPlaceholder")} className={inputClass} {...fieldProps("confirm")} />
                    {error("confirm")}
                </div>
            )}

            <button
                type="submit"
                disabled={busy}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-santa-red text-[16px] font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
            >
                {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
                {busy ? t(`${copy}.submitting`) : t(`${copy}.submit`)}
            </button>
        </form>
    );
}
