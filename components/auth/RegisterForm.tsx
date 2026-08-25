"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useToast } from "@/lib/ToastContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
}

export function RegisterForm() {
    const t = useTranslations("auth");
    const tCommon = useTranslations("common");
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    function validate(): boolean {
        const next: FormErrors = {};
        if (!name.trim()) next.name = t("register.errors.nameRequired");

        if (!email.trim()) next.email = t("register.errors.emailRequired");
        else if (!EMAIL_RE.test(email)) next.email = t("register.errors.emailInvalid");

        if (!password) next.password = t("register.errors.passwordRequired");
        else if (password.length < 6) next.password = t("register.errors.passwordMin");

        if (password && confirmPassword !== password) next.confirmPassword = t("register.errors.confirmMismatch");

        if (!acceptTerms) next.terms = t("register.errors.termsRequired");

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        window.setTimeout(() => {
            setSubmitting(false);
            toast.info(t("register.comingSoonToast"));
        }, 500);
    }

    return (
        <div className="space-y-5">
            <GoogleButton />

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border-medium)]" />
                <span className="text-label-sm text-[var(--text-muted)]">{tCommon("or")}</span>
                <div className="h-px flex-1 bg-[var(--border-medium)]" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                    <label htmlFor="register-name" className="block text-label-md text-[var(--text-secondary)] mb-2">
                        {t("register.name")}
                    </label>
                    <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            id="register-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder={t("register.namePlaceholder")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-11 sm:pl-11"
                            aria-invalid={Boolean(errors.name)}
                        />
                    </div>
                    {errors.name && <p className="mt-1.5 text-sm text-[var(--error)]">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="register-email" className="block text-label-md text-[var(--text-secondary)] mb-2">
                        {t("register.email")}
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            id="register-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder={t("register.emailPlaceholder")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 sm:pl-11"
                            aria-invalid={Boolean(errors.email)}
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-sm text-[var(--error)]">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="register-password" className="block text-label-md text-[var(--text-secondary)] mb-2">
                        {t("register.password")}
                    </label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            id="register-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder={t("register.passwordPlaceholder")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-11 pr-11 sm:pl-11 sm:pr-11"
                            aria-invalid={Boolean(errors.password)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-sm text-[var(--error)]">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="register-confirm-password" className="block text-label-md text-[var(--text-secondary)] mb-2">
                        {t("register.confirmPassword")}
                    </label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            id="register-confirm-password"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder={t("register.confirmPasswordPlaceholder")}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-11 sm:pl-11"
                            aria-invalid={Boolean(errors.confirmPassword)}
                        />
                    </div>
                    {errors.confirmPassword && <p className="mt-1.5 text-sm text-[var(--error)]">{errors.confirmPassword}</p>}
                </div>

                <div>
                    <label className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--input-border)] text-santa-red focus:ring-santa-red"
                        />
                        <span>
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
                        </span>
                    </label>
                    {errors.terms && <p className="mt-1.5 text-sm text-[var(--error)]">{errors.terms}</p>}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? t("register.submitting") : t("register.submit")}
                </Button>

                <p className="text-center text-sm text-[var(--text-secondary)]">
                    {t("register.haveAccount")}{" "}
                    <Link href="/login" className="font-semibold text-santa-red hover:underline">
                        {t("register.loginLink")}
                    </Link>
                </p>
            </form>
        </div>
    );
}
