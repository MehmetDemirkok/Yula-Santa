"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useToast } from "@/lib/ToastContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
    email?: string;
    password?: string;
}

export function LoginForm() {
    const t = useTranslations("auth");
    const tCommon = useTranslations("common");
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    function validate(): boolean {
        const next: FormErrors = {};
        if (!email.trim()) next.email = t("login.errors.emailRequired");
        else if (!EMAIL_RE.test(email)) next.email = t("login.errors.emailInvalid");

        if (!password) next.password = t("login.errors.passwordRequired");
        else if (password.length < 6) next.password = t("login.errors.passwordMin");

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        window.setTimeout(() => {
            setSubmitting(false);
            toast.info(t("login.comingSoonToast"));
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
                    <label htmlFor="login-email" className="block text-label-md text-[var(--text-secondary)] mb-2">
                        {t("login.email")}
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder={t("login.emailPlaceholder")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 sm:pl-11"
                            aria-invalid={Boolean(errors.email)}
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-sm text-[var(--error)]">{errors.email}</p>}
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label htmlFor="login-password" className="block text-label-md text-[var(--text-secondary)]">
                            {t("login.password")}
                        </label>
                        <button
                            type="button"
                            onClick={() => toast.info(t("login.comingSoonToast"))}
                            className="text-label-sm text-indigo-accent hover:underline"
                        >
                            {t("login.forgot")}
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder={t("login.passwordPlaceholder")}
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

                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--input-border)] text-santa-red focus:ring-santa-red"
                    />
                    {t("login.remember")}
                </label>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? t("login.submitting") : t("login.submit")}
                </Button>

                <p className="text-center text-sm text-[var(--text-secondary)]">
                    {t("login.noAccount")}{" "}
                    <Link href="/register" className="font-semibold text-santa-red hover:underline">
                        {t("login.registerLink")}
                    </Link>
                </p>
            </form>
        </div>
    );
}
