"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Briefcase, GraduationCap, Users, type LucideIcon } from "lucide-react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { localePath } from "@/lib/localePath";
import { hasSantaLanding } from "@/lib/secretSanta/landingLocales";

/**
 * Shown on a personal link (/s) after the gift is revealed. Participants are
 * the people most likely to run a draw of their own, so this invites them to.
 * Clicks are recorded as `cta_click` with the /s path, which the admin panel
 * counts as "link to new draw".
 */
export function StartOwnDrawCard({ locale }: { locale: string }) {
    const t = useTranslations("santa");
    // The office page exists only in some locales; elsewhere it falls back to the tool.
    const office = hasSantaLanding(locale) ? "/secret-santa/office" : "/secret-santa";
    const audiences: { path: string; label: string; icon: LucideIcon }[] = [
        { path: office, label: t("growOffice"), icon: Briefcase },
        { path: "/secret-santa/classroom", label: t("growClassroom"), icon: GraduationCap },
        { path: "/secret-santa", label: t("growFriends"), icon: Users },
    ];

    return (
        <section className="ys-card w-full p-4 sm:p-6 space-y-4 text-start" aria-labelledby="ys-start-own-draw">
            <div className="space-y-1">
                <h2 id="ys-start-own-draw" className="font-heading text-lg font-bold text-[var(--text-primary)]">
                    {t("growTitle")}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">{t("growDesc")}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {audiences.map(({ path, label, icon: Icon }) => (
                    <TrackedLink
                        key={label}
                        tool="secret_santa"
                        href={localePath(locale, path)}
                        className="flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-2)] px-1 text-center text-[13px] font-semibold text-[var(--text-primary)] transition-colors hover:border-santa-red hover:text-santa-red"
                    >
                        <Icon className="h-5 w-5 shrink-0 text-santa-red" aria-hidden />
                        <span className="leading-tight break-words">{label}</span>
                    </TrackedLink>
                ))}
            </div>

            <TrackedLink
                tool="secret_santa"
                href={localePath(locale, "/secret-santa")}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-santa-red px-6 font-bold text-white transition-opacity hover:opacity-90"
            >
                {t("createOwn")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </TrackedLink>
        </section>
    );
}
