"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { BookmarkCheck, Car, ChevronDown, HelpCircle, History, LayoutDashboard, LogIn, LogOut, UserPlus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/localePath";
import { loginHref } from "@/lib/auth/redirect";

/** Google profile photo, or the first letter of the name when there is none. */
export function UserAvatar({ name, image, size = 36 }: { name?: string | null; image?: string | null; size?: number }) {
    const initial = (name ?? "").trim().charAt(0).toLocaleUpperCase() || "?";
    return image ? (
        // Google photo URLs are external and tiny; next/image would need a remote pattern for little gain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={image}
            alt=""
            width={size}
            height={size}
            referrerPolicy="no-referrer"
            className="shrink-0 rounded-full object-cover ring-2 ring-white/70 dark:ring-white/10"
            style={{ width: size, height: size }}
        />
    ) : (
        <span
            aria-hidden
            className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-santa-red to-red-700 font-bold text-white"
            style={{ width: size, height: size, fontSize: size * 0.42 }}
        >
            {initial}
        </span>
    );
}

/** Login link that brings the visitor back to the current page afterwards. */
function useLoginHref() {
    const locale = useLocale();
    const pathname = usePathname();
    return loginHref(localePath(locale, "/login"), pathname);
}

/**
 * Navbar control: "Log in" when signed out, the Google avatar with a small menu
 * (name, e-mail, log out) when signed in. While the session loads it keeps its
 * size, so the navbar does not jump.
 */
export function AccountMenu() {
    const t = useTranslations("auth");
    const tHistory = useTranslations("drawHistory");
    const locale = useLocale();
    const { data: session, status } = useSession();
    const href = useLoginHref();
    const accountHref = localePath(locale, "/account");
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointer = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    if (status === "loading") {
        return <span aria-hidden className="block h-11 w-11 rounded-full bg-[var(--surface-2)] animate-pulse" />;
    }

    if (!session?.user) {
        return (
            <NextLink
                href={href}
                className="flex h-11 items-center gap-2 rounded-full bg-santa-red px-3 text-sm font-bold text-white shadow-[0_3px_12px_rgba(182,23,34,0.35)] transition hover:brightness-110 sm:px-4"
                aria-label={t("navLogin")}
            >
                <LogIn className="h-[18px] w-[18px] shrink-0" aria-hidden />
                <span className="hidden whitespace-nowrap sm:inline">{t("navLogin")}</span>
            </NextLink>
        );
    }

    const { name, email, image } = session.user;
    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t("account")}
                className="flex h-11 items-center gap-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] p-1 transition-colors hover:bg-[var(--border-medium)] dark:border-white/10 dark:bg-white/10 sm:pe-2"
            >
                <UserAvatar name={name} image={image} size={34} />
                <ChevronDown className={cn("hidden h-4 w-4 text-[var(--text-muted)] transition-transform sm:block", open && "rotate-180")} aria-hidden />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute end-0 top-full z-[110] mt-2 w-[min(88vw,280px)] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[0_20px_50px_rgba(17,24,39,0.16)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                >
                    <div className="h-1 bg-gradient-to-r from-santa-red via-gold to-indigo-accent" />
                    <div className="flex items-center gap-3 p-4">
                        <UserAvatar name={name} image={image} size={44} />
                        <div className="min-w-0">
                            {name && <p className="truncate font-bold text-foreground">{name}</p>}
                            {email && <p className="truncate text-xs text-[var(--text-muted)]">{email}</p>}
                        </div>
                    </div>
                    <div className="border-t border-[var(--border-light)] p-2 dark:border-white/10">
                        {[
                            { href: accountHref, icon: UserRound, label: t("accountPage.title") },
                            { href: localePath(locale, "/account/draws"), icon: BookmarkCheck, label: tHistory("title") },
                            { href: `${accountHref}#plaka`, icon: Car, label: t("accountPage.menuPlaka") },
                            { href: `${accountHref}#cihaz`, icon: History, label: t("accountPage.menuDraws") },
                            ...(session.isAdmin ? [{ href: "/admin", icon: LayoutDashboard, label: t("accountPage.adminTitle") }] : []),
                            { href: localePath(locale, "/faq"), icon: HelpCircle, label: t("accountPage.helpTitle") },
                        ].map((item) => (
                            <NextLink
                                key={item.href}
                                role="menuitem"
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-foreground dark:hover:bg-white/10"
                            >
                                <item.icon className="h-4 w-4" aria-hidden />
                                {item.label}
                            </NextLink>
                        ))}
                        <div className="my-1 h-px bg-[var(--border-light)] dark:bg-white/10" />
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => signOut({ redirectTo: window.location.pathname })}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-santa-red dark:hover:bg-white/10"
                        >
                            <LogOut className="h-4 w-4" aria-hidden />
                            {t("logout")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Account block at the top of the phone menu. */
export function MobileAccountSection() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const { data: session, status } = useSession();
    const href = useLoginHref();

    if (status === "loading") return <div aria-hidden className="h-[76px] rounded-2xl bg-[var(--surface-2)] animate-pulse" />;

    if (!session?.user) {
        return (
            <div className="grid grid-cols-2 gap-2">
                <NextLink
                    href={href}
                    className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-santa-red font-bold text-white shadow-md active:scale-[0.98]"
                >
                    <LogIn className="h-5 w-5" aria-hidden />
                    {t("navLogin")}
                </NextLink>
                <NextLink
                    href={localePath(locale, "/register")}
                    className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] font-bold text-foreground active:scale-[0.98] dark:border-white/10 dark:bg-white/5"
                >
                    <UserPlus className="h-5 w-5" aria-hidden />
                    {t("login.registerLink")}
                </NextLink>
            </div>
        );
    }

    const { name, email, image } = session.user;
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-3 dark:border-white/10 dark:bg-white/5">
            <NextLink href={localePath(locale, "/account")} className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar name={name} image={image} size={48} />
                <span className="min-w-0">
                    {name && <span className="block truncate font-extrabold text-foreground">{name}</span>}
                    {email && <span className="block truncate text-xs text-[var(--text-muted)]">{email}</span>}
                    <span className="block text-xs font-bold text-santa-red">{t("accountPage.title")} →</span>
                </span>
            </NextLink>
            <button
                type="button"
                onClick={() => signOut({ redirectTo: window.location.pathname })}
                className="flex h-[44px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-santa-red hover:bg-santa-red/10"
            >
                <LogOut className="h-4 w-4" aria-hidden />
                {t("logout")}
            </button>
        </div>
    );
}
