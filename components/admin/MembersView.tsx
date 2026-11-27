"use client";

import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, BadgeCheck, Info, Mail, Search } from "lucide-react";
import { Card, EmptyState, formatNumber } from "@/components/admin/charts";
import { formatDuration, SESSION_GAP_MINUTES } from "@/lib/admin/memberFormat";
import type { MemberRow, MembersData } from "@/lib/admin/types";

type SortKey = "joined" | "seen" | "time" | "draws";

const SORTS: { key: SortKey; label: string }[] = [
    { key: "joined", label: "Üyelik tarihi" },
    { key: "seen", label: "Son görülme" },
    { key: "time", label: "Sitede geçen süre" },
    { key: "draws", label: "Çekiliş sayısı" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const dateFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
const timeFormat = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

function formatDate(value: string | null): { date: string; time: string } | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : { date: dateFormat.format(d), time: timeFormat.format(d) };
}

function ago(value: string | null, now: number): string {
    if (!value) return "";
    const minutes = Math.max(0, Math.round((now - new Date(value).getTime()) / 60000));
    if (minutes < 60) return minutes <= 1 ? "az önce" : `${minutes} dk önce`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} sa önce`;
    const days = Math.round(hours / 24);
    return days < 30 ? `${days} gün önce` : `${Math.round(days / 30)} ay önce`;
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="admin-card flex flex-col gap-2">
            <div className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</div>
            <div className="font-heading text-[28px] font-bold leading-none tracking-tight text-[var(--text-primary)]">{value}</div>
            {hint && <div className="text-[12px] text-[var(--text-muted)]">{hint}</div>}
        </div>
    );
}

function DateCell({ value, now }: { value: string | null; now: number }) {
    const d = formatDate(value);
    if (!d) return <span className="text-[var(--text-muted)]">–</span>;
    return (
        <span className="block whitespace-nowrap">
            <span className="block text-[var(--text-primary)]">{d.date}</span>
            <span className="block text-[12px] text-[var(--text-muted)]">
                {d.time} · {ago(value, now)}
            </span>
        </span>
    );
}

const sortValue = (row: MemberRow, key: SortKey): number | string => {
    switch (key) {
        case "joined": return row.joinedAt ?? "";
        case "seen": return row.lastSeenAt ?? "";
        case "time": return row.seconds ?? -1;
        case "draws": return row.draws;
    }
};

export function MembersView({ data }: { data: MembersData | null }) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("joined");
    // Fixed per render of the view; good enough for "x days ago".
    const [now] = useState(() => Date.now());

    const members = useMemo(() => data?.members ?? [], [data]);

    const stats = useMemo(() => {
        const newIn30 = members.filter((m) => m.joinedAt && now - new Date(m.joinedAt).getTime() <= 30 * DAY_MS).length;
        const activeIn7 = members.filter((m) => m.lastSeenAt && now - new Date(m.lastSeenAt).getTime() <= 7 * DAY_MS).length;
        const google = members.filter((m) => m.provider === "google").length;
        const measured = members.filter((m) => m.seconds !== null && m.seconds > 0);
        const totalSeconds = measured.reduce((sum, m) => sum + (m.seconds ?? 0), 0);
        return { newIn30, activeIn7, google, password: members.length - google, measured: measured.length, avgSeconds: measured.length ? totalSeconds / measured.length : null };
    }, [members, now]);

    const visible = useMemo(() => {
        const q = query.trim().toLocaleLowerCase("tr");
        const filtered = q
            ? members.filter((m) => `${m.name ?? ""} ${m.email ?? ""}`.toLocaleLowerCase("tr").includes(q))
            : members;
        return [...filtered].sort((a, b) => {
            const x = sortValue(a, sort);
            const y = sortValue(b, sort);
            return typeof x === "number" && typeof y === "number" ? y - x : String(y).localeCompare(String(x));
        });
    }, [members, query, sort]);

    if (!data) {
        return (
            <div className="admin-card text-[14px] text-[var(--text-secondary)]">Üye listesi şu an yüklenemedi. Sayfayı yenileyip tekrar dene.</div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Tile label="Toplam üye" value={formatNumber(members.length)} hint={`${formatNumber(stats.google)} Google · ${formatNumber(stats.password)} e-posta`} />
                <Tile label="Son 30 günde katılan" value={formatNumber(stats.newIn30)} />
                <Tile label="Son 7 günde aktif" value={formatNumber(stats.activeIn7)} />
                <Tile
                    label="Ortalama sitede geçen süre"
                    value={formatDuration(stats.avgSeconds)}
                    hint={`Ölçülebilen ${formatNumber(stats.measured)} üye, son 90 gün`}
                />
            </div>

            <Card title="Üyeler" subtitle="Her giriş yöntemi ayrı satırdır. Satırlar Google ve e-posta + şifre hesaplarını kapsar.">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <label className="relative min-w-[220px] flex-1">
                        <span className="sr-only">Üye ara</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ad veya e-posta ara"
                            className="h-[44px] w-full rounded-lg border border-[var(--border-medium)] bg-[var(--admin-surface-solid)] pl-9 pr-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-series-1)]"
                        />
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                        <ArrowDownWideNarrow className="h-[16px] w-[16px]" aria-hidden />
                        <span className="sr-only">Sırala</span>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            className="h-[44px] rounded-lg border border-[var(--border-medium)] bg-[var(--admin-surface-solid)] px-3 text-[14px] font-semibold text-[var(--text-primary)]"
                        >
                            {SORTS.map((s) => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {visible.length === 0 ? (
                    <EmptyState text={members.length === 0 ? "Henüz üye yok" : "Aramayla eşleşen üye yok"} />
                ) : (
                    <div className="-mx-2 overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-[14px]">
                            <thead>
                                <tr className="text-[13px] text-[var(--text-muted)]">
                                    <th className="px-2 py-2 font-medium">Üye</th>
                                    <th className="px-2 py-2 font-medium">Giriş yöntemi</th>
                                    <th className="px-2 py-2 font-medium">Üyelik tarihi</th>
                                    <th className="px-2 py-2 font-medium">Son görülme</th>
                                    <th className="px-2 py-2 text-right font-medium">Sitede geçen süre</th>
                                    <th className="px-2 py-2 text-right font-medium">Ziyaret</th>
                                    <th className="px-2 py-2 text-right font-medium">Çekiliş</th>
                                    <th className="px-2 py-2 text-right font-medium">Kayıtlı</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((m) => (
                                    <tr key={m.key} className="ys-zebra-row align-top">
                                        <td className="px-2 py-2.5">
                                            <span className="flex items-center gap-2.5">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--admin-active)] text-[13px] font-bold text-[var(--text-primary)]" aria-hidden>
                                                    {(m.name || m.email || "?").trim().charAt(0).toLocaleUpperCase("tr")}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block max-w-[240px] truncate font-semibold text-[var(--text-primary)]">{m.name || "İsimsiz"}</span>
                                                    <span className="block max-w-[240px] truncate text-[12px] text-[var(--text-muted)]">{m.email || "–"}</span>
                                                </span>
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-2.5">
                                            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
                                                {m.provider === "google" ? "Google" : (<><Mail className="h-[14px] w-[14px]" aria-hidden /> E-posta</>)}
                                                {m.emailVerified ? (
                                                    <BadgeCheck className="h-[15px] w-[15px] text-[var(--admin-good)]" aria-label="E-posta doğrulandı" />
                                                ) : (
                                                    <span className="text-[12px] font-medium text-[var(--text-muted)]">doğrulanmadı</span>
                                                )}
                                            </span>
                                            {m.signIns > 0 && <span className="block text-[12px] text-[var(--text-muted)]">{formatNumber(m.signIns)} giriş</span>}
                                        </td>
                                        <td className="px-2 py-2.5"><DateCell value={m.joinedAt} now={now} /></td>
                                        <td className="px-2 py-2.5"><DateCell value={m.lastSeenAt} now={now} /></td>
                                        <td className="whitespace-nowrap px-2 py-2.5 text-right font-semibold tabular-nums text-[var(--text-primary)]">
                                            {formatDuration(m.seconds)}
                                            {m.pageviews > 0 && <span className="block text-[12px] font-normal text-[var(--text-muted)]">{formatNumber(m.pageviews)} sayfa</span>}
                                        </td>
                                        <td className="px-2 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">{m.visits ? formatNumber(m.visits) : "–"}</td>
                                        <td className="px-2 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">{m.draws ? formatNumber(m.draws) : "–"}</td>
                                        <td className="px-2 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">{m.savedDraws ? formatNumber(m.savedDraws) : "–"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <div className="flex items-start gap-2.5 rounded-lg border border-[var(--border-light)] px-4 py-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                <Info className="mt-0.5 h-[16px] w-[16px] shrink-0" aria-hidden />
                <p>
                    Sitede geçen süre tahminidir: üyenin e-postasına bağlı kullanım kayıtlarında, aralarında {SESSION_GAP_MINUTES} dakikadan az olan işlemler aynı
                    ziyaret sayılır ve aradaki süreler toplanır; her ziyaretin son sayfasında geçen süre sayılmaz. E-posta yalnızca çerezleri kabul eden ve
                    adresi doğrulanmış üyelerde kayıtlara bağlandığı için diğerlerinde “–” görünür. Kullanım kayıtları 90 gün tutulur. Üye listesi bu özellikle
                    birlikte tutulmaya başladı; daha eski Google üyeleri, siteyi tekrar kullandıklarında ya da kullanım kayıtlarında e-postaları varsa görünür.
                </p>
            </div>
        </div>
    );
}
