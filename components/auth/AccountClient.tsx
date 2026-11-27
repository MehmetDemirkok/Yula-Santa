"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
    Car,
    CheckCircle2,
    ChevronRight,
    Eye,
    EyeOff,
    Gift,
    HelpCircle,
    History,
    KeyRound,
    LayoutDashboard,
    Loader2,
    LogIn,
    LogOut,
    Mail,
    MailWarning,
    Pencil,
    Shuffle,
    Trash2,
    Trophy,
    UserRound,
} from "lucide-react";
import { localePath } from "@/lib/localePath";
import { loginHref } from "@/lib/auth/redirect";
import { NAME_MAX, passwordError, PASSWORD_MIN } from "@/lib/auth/credentials";
import { readDeviceDraws, type DeviceDraw } from "@/lib/account/deviceDraws";
import { UserAvatar } from "./AccountMenu";

const inputClass =
    "h-[48px] w-full rounded-xl border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--input-focus)] focus:outline-none";
const primaryButton =
    "flex h-[48px] items-center justify-center gap-2 rounded-xl bg-santa-red px-5 font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-60";

type Notice = { kind: "ok" | "error"; text: string } | null;

function NoticeLine({ notice }: { notice: Notice }) {
    if (!notice) return null;
    return notice.kind === "ok" ? (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-950/30 dark:text-green-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {notice.text}
        </p>
    ) : (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">{notice.text}</p>
    );
}

/** Account page card. `hint` is a one-line summary; `collapsible` folds long forms away until needed. */
function Section({ id, icon, tone = "bg-[var(--surface-2)]", title, hint, collapsible, children }: {
    id?: string; icon: ReactNode; tone?: string; title: string; hint?: string; collapsible?: boolean; children: ReactNode;
}) {
    const heading = (
        <span className="flex min-w-0 items-center gap-3.5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}>{icon}</span>
            <span className="min-w-0 text-start">
                <span className="block font-heading text-[17px] font-bold leading-tight text-foreground">{title}</span>
                {hint && <span className="mt-1 block text-[13px] leading-snug text-[var(--text-muted)]">{hint}</span>}
            </span>
        </span>
    );
    if (collapsible) {
        return (
            <details id={id} className="group ys-card scroll-mt-[136px] p-5 sm:p-6 lg:scroll-mt-[112px]">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 rounded-xl [&::-webkit-details-marker]:hidden">
                    {heading}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] transition-transform group-open:rotate-90 rtl:rotate-180">
                        <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
                    </span>
                </summary>
                <div className="mt-5 border-t border-[var(--border-light)] pt-5">{children}</div>
            </details>
        );
    }
    return (
        <section id={id} className="ys-card scroll-mt-[136px] space-y-5 p-5 sm:p-6 lg:scroll-mt-[112px]">
            <h2>{heading}</h2>
            {children}
        </section>
    );
}

type NavItem = { id: string; label: string; icon: ReactNode };

/** Highlights the section currently in the middle of the screen. */
function useActiveSection(ids: string[]): string | null {
    const [active, setActive] = useState<string | null>(null);
    const key = ids.join(",");
    useEffect(() => {
        const elements = key.split(",").map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
        if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActive(visible[0].target.id);
            },
            { rootMargin: "-30% 0px -60% 0px" },
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [key]);
    return active;
}

/** Phones and tablets: sticky, horizontally scrolling tabs under the navbar. */
function SectionTabs({ items, active }: { items: NavItem[]; active: string | null }) {
    const t = useTranslations("auth");
    return (
        <nav aria-label={t("accountPage.title")} className="sticky top-[64px] z-20 -mx-4 bg-[var(--background)]/90 px-4 py-2.5 backdrop-blur-md sm:top-[72px] lg:hidden">
            <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((item) => {
                    const on = active === item.id;
                    return (
                        <li key={item.id} className="shrink-0">
                            <a
                                href={`#${item.id}`}
                                aria-current={on ? "true" : undefined}
                                className={`flex h-[40px] items-center gap-1.5 rounded-full border px-4 text-[13px] font-bold transition-colors ${on ? "border-santa-red bg-santa-red text-white" : "border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-foreground"}`}
                            >
                                {item.label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

/** Desktop: a sticky sidebar with the same links, plus log out. */
function SectionSidebar({ items, active, onLogout }: { items: NavItem[]; active: string | null; onLogout: () => void }) {
    const t = useTranslations("auth");
    return (
        <aside className="hidden lg:block">
            <nav aria-label={t("accountPage.title")} className="sticky top-[112px] space-y-1">
                {items.map((item) => {
                    const on = active === item.id;
                    return (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            aria-current={on ? "true" : undefined}
                            className={`flex h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${on ? "bg-santa-red/10 text-santa-red" : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-foreground"}`}
                        >
                            <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                            {item.label}
                        </a>
                    );
                })}
                <div className="my-3 h-px bg-[var(--border-light)]" />
                <button type="button" onClick={onLogout} className="flex h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-santa-red">
                    <LogOut className="h-5 w-5" aria-hidden /> {t("logout")}
                </button>
            </nav>
        </aside>
    );
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete, show, onToggle, label }: {
    id: string; value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string; show: boolean; onToggle?: () => void; label: string;
}) {
    const t = useTranslations("auth");
    return (
        <div className="relative">
            <label htmlFor={id} className="sr-only">{label}</label>
            <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} maxLength={128} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputClass} ${onToggle ? "pe-12" : ""}`} />
            {onToggle && (
                <button type="button" onClick={onToggle} aria-label={show ? t("hidePassword") : t("showPassword")} className="absolute end-1 top-1/2 flex h-[40px] w-[40px] !min-h-0 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-foreground">
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            )}
        </div>
    );
}

function AccountSkeleton() {
    return (
        <div aria-hidden className="space-y-4">
            <div className="ys-card flex animate-pulse items-center gap-4 p-6">
                <span className="h-20 w-20 rounded-full bg-[var(--surface-2)]" />
                <span className="flex-1 space-y-2">
                    <span className="block h-5 w-40 rounded bg-[var(--surface-2)]" />
                    <span className="block h-4 w-56 rounded bg-[var(--surface-2)]" />
                </span>
            </div>
            <div className="ys-card h-[120px] animate-pulse" />
            <div className="ys-card h-[180px] animate-pulse" />
        </div>
    );
}

/** /account: profile, password, Plaka report card, this device's draws, admin link, help and account deletion. */
export function AccountClient() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const isPassword = session?.provider === "credentials";
    const canSetPassword = !isPassword && session?.emailVerified === true && Boolean(session?.user?.email);
    const hasSecurity = Boolean(session?.user) && (isPassword || canSetPassword);
    const nav: NavItem[] = [
        { id: "profil", label: t("accountPage.tabProfile"), icon: <UserRound className="h-[18px] w-[18px]" aria-hidden /> },
        ...(hasSecurity ? [{ id: "guvenlik", label: t("accountPage.tabSecurity"), icon: <KeyRound className="h-[18px] w-[18px]" aria-hidden /> }] : []),
        { id: "plaka", label: t("accountPage.tabPlaka"), icon: <Car className="h-[18px] w-[18px]" aria-hidden /> },
        { id: "cihaz", label: t("accountPage.tabDraws"), icon: <History className="h-[18px] w-[18px]" aria-hidden /> },
        { id: "yardim", label: t("accountPage.tabHelp"), icon: <HelpCircle className="h-[18px] w-[18px]" aria-hidden /> },
    ];
    const active = useActiveSection(session?.user ? nav.map((item) => item.id) : []);

    if (status === "loading") return <AccountSkeleton />;

    if (!session?.user) {
        return (
            <div className="ys-card mx-auto max-w-md space-y-5 p-8 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-santa-red/10 text-santa-red">
                    <UserRound className="h-8 w-8" aria-hidden />
                </span>
                <p className="text-[var(--text-secondary)]">{t("accountPage.loginFirst")}</p>
                <NextLink href={loginHref(localePath(locale, "/login"), pathname)} className={`${primaryButton} w-full`}>
                    <LogIn className="h-5 w-5" aria-hidden /> {t("navLogin")}
                </NextLink>
            </div>
        );
    }

    const needsVerify = isPassword && !session.emailProven;
    const logout = () => signOut({ redirectTo: localePath(locale, "/") });

    return (
        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
            <SectionSidebar items={nav} active={active} onLogout={logout} />
            <div className="min-w-0 space-y-4">
                <ProfileSection isPassword={isPassword} />
                {needsVerify && <VerifyEmailBanner />}
                <SectionTabs items={nav} active={active} />
                {isPassword ? <ChangePasswordSection /> : canSetPassword ? <SetPasswordSection email={session.user.email!} /> : null}
                <PlakaSection />
                <DeviceDrawsSection />
                {session.isAdmin && (
                    <NextLink href="/admin" className="ys-card group flex items-center gap-3.5 p-5 transition-colors hover:border-indigo-400/60">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white"><LayoutDashboard className="h-5 w-5" aria-hidden /></span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-heading text-[17px] font-bold text-foreground">{t("accountPage.adminTitle")}</span>
                            <span className="block text-[13px] text-[var(--text-muted)]">{t("accountPage.adminDesc")}</span>
                        </span>
                        <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
                    </NextLink>
                )}
                <HelpSection />
                <button
                    type="button"
                    onClick={logout}
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] font-bold text-[var(--text-secondary)] transition-colors hover:text-santa-red lg:hidden"
                >
                    <LogOut className="h-5 w-5" aria-hidden /> {t("logout")}
                </button>
                <DeleteSection isPassword={isPassword} />
            </div>
        </div>
    );
}

/** Password accounts whose address is not confirmed yet: explain why it matters and resend the mail. */
function VerifyEmailBanner() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const { update } = useSession();
    const [state, setState] = useState<"idle" | "busy" | "sent" | "error" | "limited">("idle");
    const refreshed = useRef(false);

    // The session cookie remembers the state from sign-in. If the link was clicked since (maybe
    // in another browser or the mail app), one refresh reads the database and hides this banner.
    useEffect(() => {
        if (refreshed.current) return;
        refreshed.current = true;
        update().catch(() => undefined);
    }, [update]);

    const resend = async () => {
        setState("busy");
        try {
            const response = await fetch("/api/auth/verify-email", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale }) });
            setState(response.ok ? "sent" : response.status === 429 ? "limited" : "error");
        } catch {
            setState("error");
        }
    };

    return (
        <section className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-500/40 dark:bg-amber-500/10">
            <p className="flex items-start gap-2 font-bold text-amber-800 dark:text-amber-200">
                <MailWarning className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> {t("emails.unverifiedTitle")}
            </p>
            <p className="text-sm text-amber-900/80 dark:text-amber-100/80">{t("emails.unverifiedDesc")}</p>
            {state === "sent" ? (
                <p role="status" className="text-sm font-bold text-green-700 dark:text-green-300">{t("emails.verifySent")}</p>
            ) : (
                <>
                    {state === "error" && <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">{t("unavailable")}</p>}
                    {state === "limited" && <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">{t("tooMany")}</p>}
                    <button type="button" onClick={resend} disabled={state === "busy"} className="inline-flex h-[44px] items-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60">
                        {state === "busy" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {t("emails.resendVerify")}
                    </button>
                </>
            )}
        </section>
    );
}

function ProfileSection({ isPassword }: { isPassword: boolean }) {
    const t = useTranslations("auth");
    const { data: session, update } = useSession();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(session?.user?.name ?? "");
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<Notice>(null);
    const user = session?.user;
    const verified = isPassword ? session?.emailProven === true : session?.emailVerified === true;

    const save = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);
        if (!name.trim()) return setNotice({ kind: "error", text: t("register.errors.nameRequired") });
        setBusy(true);
        try {
            const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
            if (!response.ok) throw new Error();
            await update();
            setEditing(false);
            setNotice({ kind: "ok", text: t("accountPage.nameSaved") });
        } catch {
            setNotice({ kind: "error", text: t("unavailable") });
        } finally {
            setBusy(false);
        }
    };

    return (
        <section id="profil" className="ys-card relative scroll-mt-[136px] overflow-hidden p-0 lg:scroll-mt-[112px]">
            {/* Soft brand wash behind the header. Colour alpha only (no opacity), so it never paints over the avatar. */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(120deg,rgba(182,23,34,0.16),rgba(231,181,60,0.12)_50%,rgba(79,70,229,0.16))] [mask-image:linear-gradient(to_bottom,black_35%,transparent)]" />
            <div className="relative space-y-4 p-5 sm:p-6">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-start">
                    <span className="relative z-10 shrink-0 rounded-full bg-[var(--card-bg)] p-1 shadow-[0_8px_24px_rgba(17,24,39,0.14)]">
                        <UserAvatar name={user?.name} image={user?.image} size={80} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">{t("accountPage.title")}</p>
                        {user?.name && <h2 className="mt-1 truncate font-heading text-2xl font-extrabold tracking-tight text-foreground">{user.name}</h2>}
                        {user?.email && <p className="truncate text-sm text-[var(--text-secondary)]">{user.email}</p>}
                        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--card-bg)] px-3 text-xs font-bold text-[var(--text-secondary)] ring-1 ring-[var(--border-light)]">
                                {isPassword ? <Mail className="h-3.5 w-3.5" aria-hidden /> : <GoogleMark />}
                                {isPassword ? t("accountPage.viaEmail") : t("accountPage.viaGoogle")}
                            </span>
                            <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-bold ${verified ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}>
                                {verified ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <MailWarning className="h-3.5 w-3.5" aria-hidden />}
                                {verified ? t("accountPage.verifiedBadge") : t("accountPage.unverifiedBadge")}
                            </span>
                        </div>
                    </div>
                    {isPassword && !editing && (
                        <button
                            type="button"
                            onClick={() => { setName(user?.name ?? ""); setEditing(true); setNotice(null); }}
                            className="inline-flex h-[44px] shrink-0 items-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] px-4 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-foreground"
                        >
                            <Pencil className="h-4 w-4" aria-hidden /> {t("accountPage.editName")}
                        </button>
                    )}
                </div>
                {!isPassword && <p className="text-center text-xs text-[var(--text-muted)] sm:text-start">{t("accountPage.nameFromGoogle")}</p>}
                {editing && (
                    <form onSubmit={save} className="flex flex-col gap-2 border-t border-[var(--border-light)] pt-4 sm:flex-row">
                        <label htmlFor="acc-name" className="sr-only">{t("register.name")}</label>
                        <input id="acc-name" autoComplete="name" value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} className={inputClass} autoFocus />
                        <div className="flex gap-2">
                            <button type="submit" disabled={busy} className={`${primaryButton} flex-1 sm:flex-none`}>
                                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {t("accountPage.saveName")}
                            </button>
                            <button type="button" onClick={() => setEditing(false)} className="h-[48px] rounded-xl px-4 font-bold text-[var(--text-muted)] hover:bg-[var(--surface-2)]">
                                {t("accountPage.cancel")}
                            </button>
                        </div>
                    </form>
                )}
                <NoticeLine notice={notice} />
            </div>
        </section>
    );
}

function GoogleMark() {
    return (
        <svg viewBox="0 0 48 48" className="h-3.5 w-3.5" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.4 34.9 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.5 5.4C41.9 35.2 44 30 44 24c0-1.3-.1-2.7-.4-3.5z" />
        </svg>
    );
}

function usePasswordForm() {
    const t = useTranslations("auth");
    return (password: string, confirm: string): string | null => {
        const problem = passwordError(password);
        if (problem) return t(`register.errors.${problem === "passwordMax" ? "passwordMin" : problem}`, { min: PASSWORD_MIN });
        if (confirm !== password) return t("register.errors.confirmMismatch");
        return null;
    };
}

async function postPassword(body: Record<string, string>): Promise<string | null> {
    const response = await fetch("/api/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) return null;
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    return data.error ?? "unavailable";
}

function SetPasswordSection({ email }: { email: string }) {
    const t = useTranslations("auth");
    const check = usePasswordForm();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<Notice>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const problem = check(password, confirm);
        if (problem) return setNotice({ kind: "error", text: problem });
        setBusy(true);
        const error = await postPassword({ password }).catch(() => "unavailable");
        setBusy(false);
        if (!error) {
            setPassword("");
            setConfirm("");
            setNotice({ kind: "ok", text: t("accountPage.saved", { email }) });
        } else {
            setNotice({ kind: "error", text: error === "rate_limited" ? t("tooMany") : error === "google_required" ? t("accountPage.needGoogle") : t("unavailable") });
        }
    };

    return (
        <Section id="guvenlik" collapsible tone="bg-red-50 dark:bg-red-500/15" icon={<KeyRound className="h-5 w-5 text-santa-red" aria-hidden />} title={t("accountPage.setPasswordTitle")} hint={t("accountPage.setPasswordHint")}>
            <form onSubmit={onSubmit} noValidate className="space-y-3">
                <p className="text-sm text-[var(--text-secondary)]">{t("accountPage.setPasswordDesc", { email })}</p>
                <NoticeLine notice={notice} />
                {/* Lets password managers save the new password under the right e-mail. */}
                <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
                <PasswordInput id="acc-password" label={t("accountPage.newPassword")} value={password} onChange={setPassword} placeholder={t("register.passwordPlaceholder", { min: PASSWORD_MIN })} autoComplete="new-password" show={show} onToggle={() => setShow((v) => !v)} />
                <PasswordInput id="acc-confirm" label={t("register.confirmPassword")} value={confirm} onChange={setConfirm} placeholder={t("register.confirmPasswordPlaceholder")} autoComplete="new-password" show={show} />
                <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
                    {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} {t("accountPage.save")}
                </button>
            </form>
        </Section>
    );
}

function ChangePasswordSection() {
    const t = useTranslations("auth");
    const check = usePasswordForm();
    const [current, setCurrent] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<Notice>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!current) return setNotice({ kind: "error", text: t("login.errors.passwordRequired") });
        const problem = check(password, confirm);
        if (problem) return setNotice({ kind: "error", text: problem });
        setBusy(true);
        const error = await postPassword({ currentPassword: current, password }).catch(() => "unavailable");
        setBusy(false);
        if (!error) {
            setCurrent("");
            setPassword("");
            setConfirm("");
            setNotice({ kind: "ok", text: t("accountPage.passwordChanged") });
        } else {
            setNotice({ kind: "error", text: error === "wrong_password" ? t("accountPage.wrongPassword") : error === "rate_limited" ? t("tooMany") : t("unavailable") });
        }
    };

    return (
        <Section id="guvenlik" collapsible tone="bg-red-50 dark:bg-red-500/15" icon={<KeyRound className="h-5 w-5 text-santa-red" aria-hidden />} title={t("accountPage.changePasswordTitle")} hint={t("accountPage.changePasswordHint")}>
            <form onSubmit={onSubmit} noValidate className="space-y-3">
                <NoticeLine notice={notice} />
                <PasswordInput id="acc-current" label={t("accountPage.currentPassword")} value={current} onChange={setCurrent} placeholder={t("accountPage.currentPassword")} autoComplete="current-password" show={show} onToggle={() => setShow((v) => !v)} />
                <PasswordInput id="acc-new" label={t("accountPage.newPassword")} value={password} onChange={setPassword} placeholder={t("register.passwordPlaceholder", { min: PASSWORD_MIN })} autoComplete="new-password" show={show} />
                <PasswordInput id="acc-new-confirm" label={t("register.confirmPassword")} value={confirm} onChange={setConfirm} placeholder={t("register.confirmPasswordPlaceholder")} autoComplete="new-password" show={show} />
                <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
                    {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} {t("accountPage.changePasswordButton")}
                </button>
            </form>
        </Section>
    );
}

type PlakaOverview = {
    stats: { bestScore: number; gamesPlayed: number; accuracy: number; globalRank: number | null };
    achievements: { unlocked: boolean }[];
};

function PlakaSection() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const [data, setData] = useState<PlakaOverview | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/plaka/stats", { signal: controller.signal })
            .then((response) => (response.ok ? response.json() : Promise.reject()))
            .then((json: PlakaOverview) => setData(json))
            .catch(() => !controller.signal.aborted && setFailed(true));
        return () => controller.abort();
    }, []);

    const playHref = localePath(locale, "/oyun/plaka-avcisi");
    const unlocked = data?.achievements.filter((a) => a.unlocked).length ?? 0;
    const number = new Intl.NumberFormat(locale);

    return (
        <Section id="plaka" tone="bg-teal-50 dark:bg-teal-500/15" icon={<Car className="h-5 w-5 text-teal-500" aria-hidden />} title={t("accountPage.plakaTitle")} hint={t("accountPage.plakaHint")}>
            {failed ? (
                <p className="text-sm text-[var(--text-muted)]">{t("accountPage.plakaError")}</p>
            ) : !data ? (
                <div aria-hidden className="h-[84px] animate-pulse rounded-xl bg-[var(--surface-2)]" />
            ) : data.stats.gamesPlayed === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">{t("accountPage.plakaEmpty")}</p>
            ) : (
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                        [t("accountPage.bestScore"), number.format(data.stats.bestScore)],
                        [t("accountPage.rank"), data.stats.globalRank ? `#${number.format(data.stats.globalRank)}` : "–"],
                        [t("accountPage.games"), number.format(data.stats.gamesPlayed)],
                        [t("accountPage.badges"), `${unlocked}/${data.achievements.length}`],
                    ].map(([label, value], index) => (
                        <div key={label} className="rounded-2xl bg-[var(--surface-2)] px-3.5 py-3">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</dt>
                            <dd className="mt-1 font-heading text-2xl font-extrabold tabular-nums text-foreground">{value}</dd>
                            {index === 3 && data.achievements.length > 0 && (
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border-light)]" aria-hidden>
                                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.round((unlocked / data.achievements.length) * 100)}%` }} />
                                </div>
                            )}
                        </div>
                    ))}
                </dl>
            )}
            <div className="flex flex-wrap gap-2">
                <NextLink href={playHref} className="inline-flex h-[44px] items-center gap-1.5 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white hover:brightness-110">
                    <Car className="h-4 w-4" aria-hidden /> {t("accountPage.play")}
                </NextLink>
                <NextLink href={localePath(locale, "/oyun/plaka-avcisi/liderlik")} className="inline-flex h-[44px] items-center gap-1.5 rounded-xl border border-[var(--border-light)] px-4 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]">
                    <Trophy className="h-4 w-4" aria-hidden /> {t("accountPage.leaderboard")}
                </NextLink>
            </div>
        </Section>
    );
}

const DRAW_ICONS: Record<DeviceDraw["kind"], ReactNode> = {
    santaResult: <Gift className="h-5 w-5" aria-hidden />,
    santaDraft: <Gift className="h-5 w-5" aria-hidden />,
    raffleDraft: <Trophy className="h-5 w-5" aria-hidden />,
    wheel: <Shuffle className="h-5 w-5" aria-hidden />,
};

function DeviceDrawsSection() {
    const t = useTranslations("auth");
    const tRoot = useTranslations();
    const locale = useLocale();
    // Mounted only on the client (AccountClient waits for the session), so localStorage is there.
    const [draws] = useState<DeviceDraw[]>(() => {
        try {
            return readDeviceDraws((key) => window.localStorage.getItem(key));
        } catch {
            return [];
        }
    });
    const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });

    const label = (draw: DeviceDraw) => {
        switch (draw.kind) {
            case "santaResult": return t("accountPage.santaResult", { people: draw.people });
            case "santaDraft": return t("accountPage.santaDraft", { people: draw.people });
            case "raffleDraft": return t("accountPage.raffleDraft", { people: draw.people });
            case "wheel": return t("accountPage.wheel", { options: draw.options, spins: draw.spins });
        }
    };
    const when = (draw: DeviceDraw) => {
        const at = draw.kind === "santaResult" ? draw.at : draw.kind === "wheel" ? draw.at : null;
        if (at === null) return null;
        const d = new Date(at);
        return Number.isNaN(d.getTime()) ? null : date.format(d);
    };

    return (
        <Section id="cihaz" tone="bg-amber-50 dark:bg-amber-500/15" icon={<History className="h-5 w-5 text-santa-red" aria-hidden />} title={t("accountPage.drawsTitle")} hint={t("accountPage.drawsNote")}>
            {draws.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-dashed border-[var(--border-medium)] p-4 text-center">
                    <p className="text-sm text-[var(--text-muted)]">{t("accountPage.drawsEmpty")}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                            { href: "/secret-santa", icon: <Gift className="h-4 w-4" aria-hidden />, label: tRoot("footer.secretSanta") },
                            { href: "/raffle", icon: <Trophy className="h-4 w-4" aria-hidden />, label: tRoot("footer.namePicker") },
                            { href: "/tools/wheel-of-fortune", icon: <Shuffle className="h-4 w-4" aria-hidden />, label: tRoot("tools.wheelOfFortune") },
                        ].map((tool) => (
                            <NextLink key={tool.href} href={localePath(locale, tool.href)} className="flex h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 text-sm font-bold text-foreground transition-colors hover:text-santa-red">
                                {tool.icon} {tool.label}
                            </NextLink>
                        ))}
                    </div>
                </div>
            ) : (
                <ul className="space-y-2">
                    {draws.map((draw) => (
                        <li key={draw.kind}>
                            <NextLink href={localePath(locale, draw.href)} className="flex items-center gap-3 rounded-xl border border-[var(--border-light)] p-3 transition-colors hover:bg-[var(--surface-2)]">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-santa-red dark:bg-red-500/15">{DRAW_ICONS[draw.kind]}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-bold text-foreground">{label(draw)}</span>
                                    {when(draw) && <span className="block text-xs text-[var(--text-muted)]">{when(draw)}</span>}
                                </span>
                                <span className="text-sm font-bold text-santa-red">{t("accountPage.open")}</span>
                            </NextLink>
                        </li>
                    ))}
                </ul>
            )}
        </Section>
    );
}

function HelpSection() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const links = [
        { href: "/faq", label: t("accountPage.faq") },
        { href: "/contact", label: t("accountPage.contact") },
        { href: "/privacy", label: t("accountPage.privacy") },
    ];
    return (
        <Section id="yardim" tone="bg-indigo-50 dark:bg-indigo-500/15" icon={<HelpCircle className="h-5 w-5 text-indigo-500" aria-hidden />} title={t("accountPage.helpTitle")}>
            <ul className="divide-y divide-[var(--border-light)]">
                {links.map((link) => (
                    <li key={link.href}>
                        <NextLink href={localePath(locale, link.href)} className="flex min-h-[48px] items-center justify-between text-sm font-bold text-[var(--text-secondary)] hover:text-foreground">
                            {link.label} <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                        </NextLink>
                    </li>
                ))}
            </ul>
        </Section>
    );
}

function DeleteSection({ isPassword }: { isPassword: boolean }) {
    const t = useTranslations("auth");
    const locale = useLocale();
    const [confirm, setConfirm] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [needsReauth, setNeedsReauth] = useState(false);
    const [notice, setNotice] = useState<Notice>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);
        setBusy(true);
        try {
            const response = await fetch("/api/auth/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirm, password, locale }),
            });
            if (response.ok) {
                await signOut({ redirectTo: localePath(locale, "/") });
                return;
            }
            const data = (await response.json().catch(() => ({}))) as { error?: string };
            if (data.error === "reauth") setNeedsReauth(true);
            else setNotice({
                kind: "error",
                text: data.error === "wrong_password" ? t("accountPage.wrongPassword")
                    : data.error === "confirm" ? t("accountPage.deleteConfirmLabel", { word: t("accountPage.deleteWord") })
                    : data.error === "rate_limited" ? t("tooMany")
                    : t("unavailable"),
            });
        } catch {
            setNotice({ kind: "error", text: t("unavailable") });
        } finally {
            setBusy(false);
        }
    };

    return (
        <details id="sil" className="group scroll-mt-[96px] rounded-2xl border border-red-200 bg-[var(--card-bg)] p-5 dark:border-red-900/40">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 font-bold text-red-600 dark:text-red-400 [&::-webkit-details-marker]:hidden">
                <Trash2 className="h-5 w-5" aria-hidden /> {t("accountPage.deleteTitle")}
                <ChevronRight className="ms-auto h-4 w-4 transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <div className="mt-3 space-y-3">
                <p className="text-sm text-[var(--text-secondary)]">{t("accountPage.deleteDesc")}</p>
                {needsReauth ? (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-[var(--text-secondary)]">{t("accountPage.deleteReauth")}</p>
                        <button type="button" onClick={() => signIn("google", { redirectTo: `${localePath(locale, "/account")}#sil` })} className={`${primaryButton} w-full`}>
                            {t("accountPage.reauthButton")}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-3">
                        <NoticeLine notice={notice} />
                        {isPassword && (
                            <PasswordInput id="del-password" label={t("accountPage.currentPassword")} value={password} onChange={setPassword} placeholder={t("accountPage.currentPassword")} autoComplete="current-password" show={false} />
                        )}
                        <div>
                            <label htmlFor="del-confirm" className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]">
                                {t("accountPage.deleteConfirmLabel", { word: t("accountPage.deleteWord") })}
                            </label>
                            <input id="del-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" autoCapitalize="characters" className={inputClass} />
                        </div>
                        <button type="submit" disabled={busy || !confirm.trim()} className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 font-bold text-white disabled:opacity-50">
                            {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} {t("accountPage.deleteButton")}
                        </button>
                    </form>
                )}
            </div>
        </details>
    );
}
