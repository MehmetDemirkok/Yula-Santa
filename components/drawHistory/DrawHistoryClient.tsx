"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
    ArrowLeft,
    BookmarkCheck,
    Check,
    ChevronDown,
    Copy,
    Disc3,
    ExternalLink,
    Eye,
    EyeOff,
    Gift,
    Loader2,
    LogIn,
    Puzzle,
    RotateCcw,
    ShieldCheck,
    Shuffle,
    Trash2,
    Trophy,
    Users,
    Video,
} from "lucide-react";
import { localePath } from "@/lib/localePath";
import { loginHref } from "@/lib/auth/redirect";
import { hasPendingDraw, postDraw, takePendingDraw } from "@/lib/drawHistory/client";
import { LIMITS, type HistoryTool, type SavedDraw, type SavedDrawSummary } from "@/lib/drawHistory/types";
import { loadDraw, saveDraw as saveSantaLocally } from "@/lib/secretSanta/storage";
import { nameKey } from "@/lib/secretSanta/draw";

const TOOL_ICONS: Record<HistoryTool, ReactNode> = {
    secret_santa: <Gift className="h-5 w-5" aria-hidden />,
    raffle: <Trophy className="h-5 w-5" aria-hidden />,
    youtube: <Video className="h-5 w-5" aria-hidden />,
    tiktok: <Video className="h-5 w-5" aria-hidden />,
    tiktok_extension: <Puzzle className="h-5 w-5" aria-hidden />,
    wheel: <Disc3 className="h-5 w-5" aria-hidden />,
    team_generator: <Users className="h-5 w-5" aria-hidden />,
    short_straw: <Shuffle className="h-5 w-5" aria-hidden />,
};

/** Where "draw again" goes for each tool. */
const TOOL_PATHS: Record<HistoryTool, string> = {
    secret_santa: "/secret-santa",
    raffle: "/raffle",
    youtube: "/youtube",
    tiktok: "/tiktok",
    tiktok_extension: "/tiktok/extension",
    wheel: "/tools/wheel-of-fortune",
    team_generator: "/tools/team-generator",
    short_straw: "/tools/short-straw",
};

type Notice = { kind: "ok" | "error"; text: string } | null;

function NoticeLine({ notice }: { notice: Notice }) {
    if (!notice) return null;
    return (
        <p
            role={notice.kind === "ok" ? "status" : "alert"}
            className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${notice.kind === "ok" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}
        >
            {notice.kind === "ok" && <BookmarkCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />} {notice.text}
        </p>
    );
}

/** A button that asks for a second tap within 3 seconds before doing something destructive. */
function ConfirmButton({ label, confirmLabel, onConfirm, busy, className }: {
    label: ReactNode; confirmLabel: ReactNode; onConfirm: () => void; busy?: boolean; className: string;
}) {
    const [armed, setArmed] = useState(false);
    useEffect(() => {
        if (!armed) return;
        const timer = window.setTimeout(() => setArmed(false), 3000);
        return () => window.clearTimeout(timer);
    }, [armed]);
    return (
        <button
            type="button"
            disabled={busy}
            onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
            className={`${className} ${armed ? "!border-red-500 !bg-red-600 !text-white" : ""}`}
        >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
            {armed ? confirmLabel : label}
        </button>
    );
}

export function DrawHistoryClient() {
    const t = useTranslations("drawHistory");
    const locale = useLocale();
    const pathname = usePathname();
    const { status } = useSession();
    const [draws, setDraws] = useState<SavedDrawSummary[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [notice, setNotice] = useState<Notice>(null);
    const [openId, setOpenId] = useState<string | null>(null);
    const [clearing, setClearing] = useState(false);
    const [pendingWaiting, setPendingWaiting] = useState(false);
    const started = useRef(false);

    const load = useCallback(async () => {
        try {
            const response = await fetch("/api/draws", { cache: "no-store" });
            if (!response.ok) throw new Error(String(response.status));
            const data = (await response.json()) as { draws: SavedDrawSummary[] };
            setDraws(data.draws);
            setFailed(false);
        } catch {
            setFailed(true);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            setPendingWaiting(hasPendingDraw());
            return;
        }
        if (status !== "authenticated" || started.current) return;
        started.current = true;
        (async () => {
            // A guest pressed "sign in and save" on a result: save it now.
            const pending = takePendingDraw();
            if (pending) {
                const result = await postDraw(pending);
                setNotice(result.ok ? { kind: "ok", text: t("pendingSaved") } : { kind: "error", text: t("saveError") });
                if (result.ok) setOpenId(result.draw.id);
            }
            await load();
        })();
    }, [status, load, t]);

    if (status === "loading") {
        return (
            <div className="space-y-3" aria-hidden>
                {[0, 1, 2].map((i) => <div key={i} className="h-[84px] animate-pulse rounded-2xl bg-[var(--surface-2)]" />)}
            </div>
        );
    }

    if (status !== "authenticated") {
        return (
            <div className="ys-card mx-auto max-w-md space-y-5 p-8 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-santa-red/10 text-santa-red">
                    <BookmarkCheck className="h-8 w-8" aria-hidden />
                </span>
                <p className="text-[var(--text-secondary)]">{pendingWaiting ? t("loginToSavePending") : t("loginFirst")}</p>
                <NextLink
                    href={loginHref(localePath(locale, "/login"), pathname)}
                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-santa-red px-5 font-bold text-white shadow-md transition hover:brightness-110"
                >
                    <LogIn className="h-5 w-5" aria-hidden /> {t("loginButton")}
                </NextLink>
                <p className="text-xs text-[var(--text-muted)]">{t("guestHint")}</p>
            </div>
        );
    }

    const removeOne = (id: string) => {
        setDraws((list) => list?.filter((d) => d.id !== id) ?? list);
        if (openId === id) setOpenId(null);
        setNotice({ kind: "ok", text: t("deleted") });
    };

    const clearAll = async () => {
        setClearing(true);
        try {
            const response = await fetch("/api/draws", { method: "DELETE" });
            if (!response.ok) throw new Error();
            setDraws([]);
            setOpenId(null);
            setNotice({ kind: "ok", text: t("cleared") });
        } catch {
            setNotice({ kind: "error", text: t("actionError") });
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="space-y-4">
            <NextLink href={localePath(locale, "/account")} className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[var(--text-secondary)] hover:text-santa-red">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden /> {t("back")}
            </NextLink>

            <NoticeLine notice={notice} />

            {failed ? (
                <div className="ys-card space-y-3 p-6 text-center">
                    <p className="text-sm text-[var(--text-muted)]">{t("loadError")}</p>
                    <button type="button" onClick={load} className="inline-flex h-[44px] items-center gap-2 rounded-xl border border-[var(--border-light)] px-4 text-sm font-bold">
                        <RotateCcw className="h-4 w-4" aria-hidden /> {t("retry")}
                    </button>
                </div>
            ) : draws === null ? (
                <div className="space-y-3" aria-hidden>
                    {[0, 1, 2].map((i) => <div key={i} className="h-[84px] animate-pulse rounded-2xl bg-[var(--surface-2)]" />)}
                </div>
            ) : draws.length === 0 ? (
                <EmptyState />
            ) : (
                <ul className="space-y-3">
                    {draws.map((draw) => (
                        <li key={draw.id}>
                            <DrawCard
                                summary={draw}
                                open={openId === draw.id}
                                onToggle={() => setOpenId((id) => (id === draw.id ? null : draw.id))}
                                onDeleted={() => removeOne(draw.id)}
                                onError={() => setNotice({ kind: "error", text: t("actionError") })}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div className="space-y-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
                <p>{t("privacyNote", { max: LIMITS.perAccount })}</p>
                {draws && draws.length > 0 && (
                    <ConfirmButton
                        label={t("clearAll")}
                        confirmLabel={t("clearConfirm")}
                        busy={clearing}
                        onConfirm={clearAll}
                        className="inline-flex h-[44px] items-center gap-2 rounded-xl border border-red-200 bg-[var(--card-bg)] px-4 font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
                    />
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    const t = useTranslations("drawHistory");
    const locale = useLocale();
    return (
        <div className="ys-card space-y-4 p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <BookmarkCheck className="h-7 w-7" aria-hidden />
            </span>
            <p className="text-[var(--text-secondary)]">{t("empty")}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(["secret_santa", "raffle", "wheel"] as const).map((tool) => (
                    <NextLink
                        key={tool}
                        href={localePath(locale, TOOL_PATHS[tool])}
                        className="flex h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 text-sm font-bold text-foreground transition-colors hover:text-santa-red"
                    >
                        {TOOL_ICONS[tool]} {t(`tools.${tool}`)}
                    </NextLink>
                ))}
            </div>
        </div>
    );
}

function DrawCard({ summary, open, onToggle, onDeleted, onError }: {
    summary: SavedDrawSummary; open: boolean; onToggle: () => void; onDeleted: () => void; onError: () => void;
}) {
    const t = useTranslations("drawHistory");
    const locale = useLocale();
    const [detail, setDetail] = useState<SavedDraw | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!open || detail) return;
        const controller = new AbortController();
        fetch(`/api/draws/${summary.id}`, { signal: controller.signal, cache: "no-store" })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data: { draw: SavedDraw }) => setDetail(data.draw))
            .catch(() => !controller.signal.aborted && setLoadFailed(true));
        return () => controller.abort();
    }, [open, detail, summary.id]);

    const remove = async () => {
        setDeleting(true);
        try {
            const response = await fetch(`/api/draws/${summary.id}`, { method: "DELETE" });
            if (!response.ok && response.status !== 404) throw new Error();
            onDeleted();
        } catch {
            onError();
        } finally {
            setDeleting(false);
        }
    };

    const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(summary.createdAt));
    const toolLabel = t(`tools.${summary.tool}`);
    const bodyId = `draw-${summary.id}`;

    return (
        <article className="ys-card overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={bodyId}
                className="flex w-full items-center gap-3.5 p-4 text-start transition-colors hover:bg-[var(--surface-2)] sm:p-5"
            >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-santa-red dark:bg-red-500/15">{TOOL_ICONS[summary.tool]}</span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-[16px] font-bold text-foreground">{summary.title || toolLabel}</span>
                    <span className="mt-0.5 block text-[13px] text-[var(--text-muted)]">
                        {summary.title ? `${toolLabel} · ` : ""}{date} · {t("participants", { count: summary.participantCount })}
                    </span>
                    {summary.winnerPreview.length > 0 && (
                        <span className="mt-1 block truncate text-[13px] font-semibold text-[var(--text-secondary)]">
                            🏆 {summary.winnerPreview.join(", ")}
                        </span>
                    )}
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
            </button>

            {open && (
                <div id={bodyId} className="space-y-4 border-t border-[var(--border-light)] p-4 sm:p-5">
                    {loadFailed ? (
                        <p className="text-sm text-[var(--text-muted)]">{t("loadError")}</p>
                    ) : !detail ? (
                        <div aria-hidden className="h-24 animate-pulse rounded-xl bg-[var(--surface-2)]" />
                    ) : (
                        <DrawDetail draw={detail} />
                    )}
                    <div className="flex flex-wrap gap-2 border-t border-[var(--border-light)] pt-4">
                        <NextLink
                            href={localePath(locale, TOOL_PATHS[summary.tool])}
                            className="inline-flex h-[44px] items-center gap-1.5 rounded-xl border border-[var(--border-light)] px-4 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                        >
                            <RotateCcw className="h-4 w-4" aria-hidden /> {t("drawAgain")}
                        </NextLink>
                        <ConfirmButton
                            label={t("delete")}
                            confirmLabel={t("deleteConfirm")}
                            busy={deleting}
                            onConfirm={remove}
                            className="inline-flex h-[44px] items-center gap-1.5 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
                        />
                    </div>
                </div>
            )}
        </article>
    );
}

const listClass = "overflow-hidden rounded-xl border border-[var(--border-light)]";
const rowClass = "ys-zebra-row flex items-start gap-3 px-3 py-2 text-sm";
const badgeClass = "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white";

function Heading({ children }: { children: ReactNode }) {
    return <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{children}</h3>;
}

function DrawDetail({ draw }: { draw: SavedDraw }) {
    const t = useTranslations("drawHistory");
    const locale = useLocale();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        const lines: string[] = [`${draw.title || t(`tools.${draw.tool}`)}`];
        if (draw.winners.length) lines.push("", `${t("winners")}:`, ...draw.winners.map((w, i) => `${i + 1}. ${w.name}`));
        if (draw.backups.length) lines.push("", `${t("backups")}:`, ...draw.backups.map((b, i) => `${i + 1}. ${b.name}`));
        if (draw.teams) draw.teams.forEach((team, i) => lines.push("", `${t("team", { n: i + 1 })}:`, ...team));
        try {
            await navigator.clipboard.writeText(lines.join("\n"));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked: the list is still on screen.
        }
    };

    const proofHref = draw.proofPath && (draw.proofPath.startsWith("/verify/") ? localePath(locale, draw.proofPath) : draw.proofPath);

    return (
        <div className="space-y-4">
            {draw.winners.length > 0 && (
                <section>
                    <Heading>{draw.tool === "short_straw" ? t("shortStrawResult") : t("winners")}</Heading>
                    <ol className={listClass}>
                        {draw.winners.map((w, i) => (
                            <li key={i} className={rowClass}>
                                <span className={`${badgeClass} bg-gold`}>{i + 1}</span>
                                <span className="min-w-0">
                                    <span className="block font-bold text-foreground [overflow-wrap:anywhere]">{w.name}</span>
                                    {w.note && <span className="block text-[var(--text-muted)] [overflow-wrap:anywhere]">“{w.note}”</span>}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            {draw.backups.length > 0 && (
                <section>
                    <Heading>{t("backups")}</Heading>
                    <ol className={listClass}>
                        {draw.backups.map((b, i) => (
                            <li key={i} className={rowClass}>
                                <span className={`${badgeClass} bg-[var(--text-muted)]`}>{i + 1}</span>
                                <span className="text-[var(--text-secondary)] [overflow-wrap:anywhere]">{b.name}</span>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            {draw.teams && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {draw.teams.map((team, i) => (
                        <section key={i} className="rounded-xl border border-[var(--border-light)] p-3">
                            <Heading>{t("team", { n: i + 1 })}</Heading>
                            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                                {team.map((member, j) => <li key={j} className="[overflow-wrap:anywhere]">{member}</li>)}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            {draw.santa && <SantaDetail draw={draw} />}

            {draw.participants && draw.participants.length > 0 && !draw.santa && (
                <details className="rounded-xl border border-[var(--border-light)] p-3">
                    <summary className="cursor-pointer text-sm font-bold text-[var(--text-secondary)]">
                        {t("allParticipants", { count: draw.participants.length })}
                    </summary>
                    <p className="mt-2 text-sm text-[var(--text-secondary)] [overflow-wrap:anywhere]">{draw.participants.join(", ")}</p>
                </details>
            )}

            <div className="flex flex-wrap gap-2">
                {!draw.santa && (
                    <button type="button" onClick={copy} className="inline-flex h-[44px] items-center gap-1.5 rounded-xl bg-[var(--surface-2)] px-4 text-sm font-bold text-foreground">
                        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                        {copied ? t("copied") : t("copy")}
                    </button>
                )}
                {proofHref && (
                    <NextLink href={proofHref} className="inline-flex h-[44px] items-center gap-1.5 rounded-xl bg-[var(--surface-2)] px-4 text-sm font-bold text-foreground">
                        <ShieldCheck className="h-4 w-4" aria-hidden /> {t("proof")}
                    </NextLink>
                )}
                {draw.sourceUrl && (
                    <a href={draw.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-[44px] items-center gap-1.5 rounded-xl bg-[var(--surface-2)] px-4 text-sm font-bold text-foreground">
                        <ExternalLink className="h-4 w-4" aria-hidden /> {t("source")}
                    </a>
                )}
            </div>
        </div>
    );
}

function SantaDetail({ draw }: { draw: SavedDraw }) {
    const t = useTranslations("drawHistory");
    const locale = useLocale();
    const router = useRouter();
    const santa = draw.santa!;
    const secret = santa.mode === "secret";
    const [showPairs, setShowPairs] = useState(!secret);

    const pairs = Object.entries(santa.assignments).sort(([a], [b]) => a.localeCompare(b, locale));
    const visible = secret ? pairs : pairs.filter(([a, b]) => a.localeCompare(b) < 0);

    // Puts the saved draw back into this browser so the organizer can resend links or print cards.
    const reopen = () => {
        const current = loadDraw();
        const same = current && JSON.stringify(current.assignments) === JSON.stringify(santa.assignments);
        if (current && !same && !window.confirm(t("reopenConfirm"))) return;
        if (!same) saveSantaLocally({ mode: santa.mode, assignments: santa.assignments, hints: santa.hints, event: santa.event });
        router.push(localePath(locale, "/result"));
    };

    const event = santa.event;
    const facts = [
        event?.date && [t("eventDate"), new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${event.date}T12:00:00`))],
        event?.budget && [t("eventBudget"), event.budget],
        event?.note && [t("eventNote"), event.note],
    ].filter((f): f is string[] => Array.isArray(f));

    return (
        <div className="space-y-4">
            {facts.length > 0 && (
                <dl className="grid gap-2 sm:grid-cols-3">
                    {facts.map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-[var(--surface-2)] px-3 py-2">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</dt>
                            <dd className="text-sm font-semibold text-foreground [overflow-wrap:anywhere]">{value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            <section>
                <div className="mb-2 flex items-center justify-between gap-2">
                    <Heading>{t("pairs")}</Heading>
                    {secret && (
                        <button type="button" onClick={() => setShowPairs((v) => !v)} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-santa-red hover:bg-red-50 dark:hover:bg-red-500/10">
                            {showPairs ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                            {showPairs ? t("hidePairs") : t("showPairs")}
                        </button>
                    )}
                </div>
                {showPairs ? (
                    <ul className={listClass}>
                        {visible.map(([giver, receiver]) => (
                            <li key={giver} className={rowClass}>
                                <span className="min-w-0 flex-1 font-bold text-foreground [overflow-wrap:anywhere]">{giver}</span>
                                <span aria-hidden className="text-santa-red">{secret ? "→" : "↔"}</span>
                                <span className="min-w-0 flex-1 text-end text-[var(--text-secondary)] [overflow-wrap:anywhere]">
                                    {receiver}
                                    {santa.hints[nameKey(receiver)] && <span className="block text-xs text-[var(--text-muted)]">{santa.hints[nameKey(receiver)]}</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="rounded-xl border border-dashed border-[var(--border-medium)] p-3 text-sm text-[var(--text-muted)]">
                        {t("pairsHidden", { count: pairs.length })}
                    </p>
                )}
            </section>

            <button type="button" onClick={reopen} className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-santa-red px-4 text-sm font-bold text-white shadow-md hover:brightness-110">
                <Gift className="h-4 w-4" aria-hidden /> {secret ? t("reopenSecret") : t("reopenPairs")}
            </button>
        </div>
    );
}
