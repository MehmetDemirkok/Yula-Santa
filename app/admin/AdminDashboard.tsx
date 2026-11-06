"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
    Activity,
    CheckCircle2,
    DatabaseZap,
    FlaskConical,
    Gift,
    LayoutDashboard,
    Lock,
    Moon,
    ShieldAlert,
    ShieldCheck,
    Sun,
    Users,
    type LucideIcon,
} from "lucide-react";
import { Card, Delta, EmptyState, Funnel, RankedBars, SegmentedBar, StatTile, TrendChart, formatNumber, formatShare } from "@/components/admin/charts";
import type { AccessRow, AdminData, EventType, LiveEvent, RangeData, RangeKey, TrendPoint } from "@/lib/admin/types";
import { useTheme } from "@/lib/ThemeContext";

type ViewKey = "overview" | "draws" | "visitors" | "live" | "security";

const VIEWS: { key: ViewKey; label: string; icon: LucideIcon; description: string }[] = [
    { key: "overview", label: "Genel bakış", icon: LayoutDashboard, description: "Sitenin seçili dönemdeki özeti" },
    { key: "draws", label: "Çekilişler", icon: Gift, description: "Hangi araç ne kadar kullanılıyor" },
    { key: "visitors", label: "Ziyaretçiler", icon: Users, description: "Kimler, nereden ve hangi cihazla geliyor" },
    { key: "live", label: "Canlı akış", icon: Activity, description: "Sitede son yapılan işlemler" },
    { key: "security", label: "Güvenlik", icon: ShieldCheck, description: "Panele erişim kayıtları ve korumalar" },
];

const RANGES: { key: RangeKey; label: string; deltaSuffix: string }[] = [
    { key: "today", label: "Bugün", deltaSuffix: "düne göre" },
    { key: "7d", label: "7 gün", deltaSuffix: "önceki 7 güne göre" },
    { key: "30d", label: "30 gün", deltaSuffix: "önceki 30 güne göre" },
    { key: "90d", label: "90 gün", deltaSuffix: "önceki 90 güne göre" },
];

const seriesOf = (series: TrendPoint[], metric: "visitors" | "pageviews" | "draws") =>
    series.map((point) => ({ label: point.label, fullLabel: point.fullLabel, value: point[metric] }));

/** Last 12 points only: a sparkline shows direction, not detail. */
const sparkOf = (series: TrendPoint[], metric: "visitors" | "pageviews" | "draws") => series.slice(-12).map((point) => point[metric]);

function OverviewView({ data, deltaSuffix }: { data: RangeData; deltaSuffix: string }) {
    const { totals, deltas } = data;
    const usedTools = data.tools.filter((tool) => tool.draws > 0).slice(0, 6);

    return (
        <div className="flex flex-col gap-4">
            <section className="admin-card">
                <div className="mb-4">
                    <h2 className="text-[13px] font-medium text-[var(--text-secondary)]">Ziyaretçi</h2>
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <div className="font-heading text-[48px] font-extrabold leading-none tracking-tight text-[var(--text-primary)]">
                            {formatNumber(totals.visitors)}
                        </div>
                        <Delta value={deltas.visitors} suffix={deltaSuffix} />
                    </div>
                </div>
                <TrendChart points={seriesOf(data.series, "visitors")} valueName="Ziyaretçi" />
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile label="Sayfa görüntüleme" value={formatNumber(totals.pageviews)} delta={deltas.pageviews} deltaSuffix={deltaSuffix} trend={sparkOf(data.series, "pageviews")} />
                <StatTile label="Yapılan çekiliş" value={formatNumber(totals.draws)} delta={deltas.draws} deltaSuffix={deltaSuffix} trend={sparkOf(data.series, "draws")} />
                <StatTile label="Çekiliş yapan ziyaretçi" value={formatShare(totals.drawers, totals.visitors)} delta={deltas.conversion} deltaSuffix={deltaSuffix} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card title="En çok kullanılan araçlar" subtitle="Yapılan çekiliş sayısı">
                    <RankedBars rows={usedTools.map((tool) => ({ name: tool.name, count: tool.draws }))} total={totals.draws} />
                </Card>
                <Card title="Ülkeler" subtitle="Ziyaretçi sayısı">
                    <RankedBars rows={data.countries} />
                </Card>
                <Card title="Çekiliş hunisi" subtitle="Ziyaretçilerin adım adım ilerleyişi">
                    <Funnel steps={data.funnel} />
                </Card>
                <Card title="Site dili" subtitle="Ziyaretçi sayısı">
                    <RankedBars rows={data.languages} />
                </Card>
            </div>
        </div>
    );
}

function DrawsView({ data, deltaSuffix }: { data: RangeData; deltaSuffix: string }) {
    const { totals, deltas } = data;

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatTile label="Yapılan çekiliş" value={formatNumber(totals.draws)} delta={deltas.draws} deltaSuffix={deltaSuffix} trend={sparkOf(data.series, "draws")} />
                <StatTile label="Çekiliş başına katılımcı" value={totals.avgParticipants === null ? "—" : formatNumber(totals.avgParticipants)} delta={deltas.avgParticipants} deltaSuffix={deltaSuffix} />
                <StatTile label="Sonucu paylaşanlar" value={formatShare(totals.sharers, totals.drawers)} delta={deltas.shareRate} deltaSuffix={deltaSuffix} />
                <StatTile label="Plaka Avcısı oyunu" value={formatNumber(totals.plakaGames)} delta={deltas.plakaGames} deltaSuffix={deltaSuffix} />
                <StatTile label="TikTok eklenti çekilişi" value={formatNumber(totals.extensionGiveaways)} delta={deltas.extensionGiveaways} deltaSuffix={deltaSuffix} />
            </div>

            <Card title="Yapılan çekilişler" subtitle="Zaman içindeki değişim">
                <TrendChart points={seriesOf(data.series, "draws")} valueName="Çekiliş" height={220} />
            </Card>

            <Card title="Araçlara göre çekilişler">
                <div className="-mx-2 overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-[14px]">
                        <thead>
                            <tr className="text-[13px] text-[var(--text-muted)]">
                                <th className="px-2 py-2 font-medium">Araç</th>
                                <th className="px-2 py-2 text-right font-medium">Çekiliş</th>
                                <th className="px-2 py-2 text-right font-medium">Pay</th>
                                <th className="px-2 py-2 text-right font-medium">Ort. katılımcı</th>
                                <th className="px-2 py-2 text-right font-medium">Değişim</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.tools.map((tool) => (
                                <tr key={tool.name} className="ys-zebra-row">
                                    <td className="px-2 py-2.5 font-medium text-[var(--text-primary)]">{tool.name}</td>
                                    <td className="px-2 py-2.5 text-right tabular-nums text-[var(--text-primary)]">{formatNumber(tool.draws)}</td>
                                    <td className="px-2 py-2.5 text-right tabular-nums text-[var(--text-muted)]">{formatShare(tool.draws, totals.draws)}</td>
                                    <td className="px-2 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                                        {tool.avgParticipants === null ? "—" : formatNumber(tool.avgParticipants)}
                                    </td>
                                    <td className="px-2 py-2.5 text-right">
                                        <Delta value={tool.delta} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="flex items-start gap-3 rounded-2xl border border-[var(--border-medium)] bg-[var(--admin-hover)] p-4 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                <Lock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--text-primary)]" aria-hidden />
                <p>Bu ekranda yalnızca sayılar var. Katılımcı isimleri, kazananlar ve Secret Santa eşleşmeleri bu kayıtlara girmez.</p>
            </div>
        </div>
    );
}

function VisitorsView({ data }: { data: RangeData }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Cihaz">
                    <SegmentedBar parts={data.devices} label="Cihaz dağılımı" />
                </Card>
                <Card title="Yeni ve geri dönen">
                    <SegmentedBar parts={data.visitorTypes} label="Yeni ve geri dönen ziyaretçiler" />
                </Card>
                <Card title="Çerez onayı">
                    <SegmentedBar parts={data.consent} label="Çerez onayı dağılımı" />
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card title="Ülkeler">
                    <RankedBars rows={data.countries} />
                </Card>
                <Card title="Site dili">
                    <RankedBars rows={data.languages} />
                </Card>
                <Card title="Nereden geldiler">
                    <RankedBars rows={data.sources} />
                </Card>
                <Card title="Tarayıcı">
                    <RankedBars rows={data.browsers} />
                </Card>
            </div>

            <Card title="En çok görüntülenen sayfalar" subtitle="Sayfa görüntüleme sayısı">
                <RankedBars rows={data.pages} mono labelWidth="sm:grid-cols-[210px_minmax(0,1fr)_92px]" />
            </Card>
        </div>
    );
}

const EVENT_FILTERS: { key: EventType | "all"; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "draw_completed", label: "Çekiliş" },
    { key: "draw_shared", label: "Paylaşım" },
    { key: "page_view", label: "Sayfa" },
    { key: "consent", label: "Çerez" },
];

const EVENT_LABEL: Record<EventType, string> = {
    draw_completed: "Çekiliş",
    draw_shared: "Paylaşım",
    page_view: "Sayfa",
    consent: "Çerez",
};

function formatAgo(minutes: number): string {
    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} sa önce`;
    return `${Math.floor(minutes / 1440)} gün önce`;
}

function LiveView({ events }: { events: LiveEvent[] }) {
    const [filter, setFilter] = useState<EventType | "all">("all");
    const visible = useMemo(() => (filter === "all" ? events : events.filter((event) => event.type === filter)), [events, filter]);

    return (
        <Card title="Son işlemler" subtitle="Son 50 kayıt, 30 saniyede bir yenilenir. Aynı kod aynı ziyaretçiyi gösterir; e-posta yalnızca çerez onayı veren ve giriş yapan kullanıcılarda görünür.">
            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Olay türü">
                {EVENT_FILTERS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        aria-pressed={filter === item.key}
                        onClick={() => setFilter(item.key)}
                        className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                            filter === item.key
                                ? "border-transparent bg-[var(--text-primary)] text-[var(--background)]"
                                : "border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--admin-hover)]"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            {visible.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="-mx-2 overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-[14px]">
                        <thead>
                            <tr className="text-[13px] text-[var(--text-muted)]">
                                <th className="px-2 py-2 font-medium">Zaman</th>
                                <th className="px-2 py-2 font-medium">Tür</th>
                                <th className="px-2 py-2 font-medium">İşlem</th>
                                <th className="px-2 py-2 font-medium">Kim</th>
                                <th className="px-2 py-2 font-medium">Ülke</th>
                                <th className="px-2 py-2 font-medium">Dil</th>
                                <th className="px-2 py-2 font-medium">Cihaz</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((event) => (
                                <tr key={event.id} className="ys-zebra-row">
                                    <td className="whitespace-nowrap px-2 py-2.5 tabular-nums text-[var(--text-muted)]">{formatAgo(event.minutesAgo)}</td>
                                    <td className="px-2 py-2.5">
                                        <span className="ys-chip ys-chip-indigo inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-semibold">{EVENT_LABEL[event.type]}</span>
                                    </td>
                                    <td className="px-2 py-2.5">
                                        <div className="font-medium text-[var(--text-primary)]">{event.title}</div>
                                        <div className="break-all text-[13px] text-[var(--text-muted)]">{event.detail}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-2 py-2.5 text-[var(--text-secondary)]">{event.visitor}</td>
                                    <td className="px-2 py-2.5 text-[var(--text-secondary)]">{event.country}</td>
                                    <td className="px-2 py-2.5 text-[var(--text-secondary)]">{event.language}</td>
                                    <td className="px-2 py-2.5 text-[var(--text-secondary)]">{event.device}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}

const PROTECTIONS = [
    "Yalnızca izinli Google hesabı girebilir",
    "Diğer herkes 404 görür",
    "Her istekte sunucu tarafında yetki kontrolü",
    "12 saatte bir yeniden giriş",
    "Önbellek kapalı, başka sitede açılması engelli",
    "Kayıtlar 90 gün sonra silinir",
];

function SecurityView({ access }: { access: AccessRow[] }) {
    return (
        <div className="flex flex-col gap-4">
            <Card title="Panele erişim kayıtları" subtitle="Girişler ve reddedilen denemeler. Yerel modda giriş kontrolü çalışmadığı için kayıt oluşmaz.">
                {access.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="-mx-2 overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-[14px]">
                            <thead>
                                <tr className="text-[13px] text-[var(--text-muted)]">
                                    <th className="px-2 py-2 font-medium">Zaman</th>
                                    <th className="px-2 py-2 font-medium">Sonuç</th>
                                    <th className="px-2 py-2 font-medium">Olay</th>
                                    <th className="px-2 py-2 font-medium">Hesap</th>
                                    <th className="px-2 py-2 font-medium">Kaynak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {access.map((row) => (
                                    <tr key={row.id} className="ys-zebra-row">
                                        <td className="whitespace-nowrap px-2 py-2.5 text-[var(--text-muted)]">{row.when}</td>
                                        <td className="whitespace-nowrap px-2 py-2.5">
                                            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
                                                {row.outcome === "allowed" ? (
                                                    <CheckCircle2 className="h-[15px] w-[15px] text-[var(--admin-good)]" aria-hidden />
                                                ) : (
                                                    <ShieldAlert className="h-[15px] w-[15px] text-[var(--admin-bad)]" aria-hidden />
                                                )}
                                                {row.outcome === "allowed" ? "İzin verildi" : "Reddedildi"}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-[var(--text-primary)]">{row.event}</td>
                                        <td className="px-2 py-2.5 text-[var(--text-secondary)]">{row.account}</td>
                                        <td className="px-2 py-2.5 text-[var(--text-secondary)]">{row.origin}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Card title="Korumalar" subtitle="Canlı sitede geçerli olan kurallar.">
                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                    {PROTECTIONS.map((item) => (
                        <li key={item} className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] pb-3 text-[14px] text-[var(--text-primary)]">
                            <span>{item}</span>
                            <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--text-secondary)]">
                                <CheckCircle2 className="h-[14px] w-[14px] text-[var(--admin-good)]" aria-hidden />
                                Açık
                            </span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}

export function AdminDashboard({ data, range, localBypass }: { data: AdminData | null; range: RangeKey; localBypass: boolean }) {
    const [view, setView] = useState<ViewKey>("overview");
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const { resolvedTheme, toggleTheme } = useTheme();

    const current = VIEWS.find((item) => item.key === view) ?? VIEWS[0];
    const rangeInfo = RANGES.find((item) => item.key === range) ?? RANGES[2];
    const usesRange = view === "overview" || view === "draws" || view === "visitors";

    useEffect(() => {
        if (view !== "live") return;
        const interval = window.setInterval(() => router.refresh(), 30_000);
        return () => window.clearInterval(interval);
    }, [router, view]);

    const changeRange = (next: RangeKey) => {
        startTransition(() => router.replace(`/admin?range=${next}`, { scroll: false }));
    };

    return (
        <div className="admin-root min-h-dvh lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
            <aside className="border-b border-[var(--border-medium)] bg-[var(--admin-surface-solid)] lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-3 px-4 pb-2 pt-4 lg:px-5 lg:pb-5 lg:pt-6">
                    <Image src="/icon.png" alt="" width={32} height={32} className="rounded-lg" />
                    <div>
                        <div className="font-heading text-[15px] font-bold leading-tight text-[var(--text-primary)]">YulaSanta</div>
                        <div className="text-[12px] leading-tight text-[var(--text-muted)]">Yönetim paneli</div>
                    </div>
                </div>
                <nav aria-label="Panel bölümleri" className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:px-3">
                    {VIEWS.map((item) => {
                        const Icon = item.icon;
                        const active = item.key === view;
                        return (
                            <button
                                key={item.key}
                                type="button"
                                aria-current={active ? "page" : undefined}
                                onClick={() => setView(item.key)}
                                className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[14px] font-semibold transition-colors ${
                                    active
                                        ? "bg-[var(--admin-active)] text-[var(--text-primary)]"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--admin-hover)]"
                                }`}
                            >
                                <Icon className="h-[18px] w-[18px]" aria-hidden />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <div className="min-w-0">
                {localBypass && (
                    <div className="flex items-start gap-2.5 border-b border-[var(--admin-demo-border)] bg-[var(--admin-demo-bg)] px-4 py-2.5 text-[13px] leading-snug text-[var(--text-primary)] md:px-8">
                        <FlaskConical className="mt-px h-[16px] w-[16px] shrink-0" aria-hidden />
                        <p>
                            <strong>Yerel mod.</strong> Giriş kontrolü yalnızca bu bilgisayarda atlanıyor. Ziyaret ve çekiliş verileri localhost kaynaklıdır; Plaka Avcısı ve TikTok eklenti sayıları veritabanındaki gerçek kayıtlardır.
                        </p>
                    </div>
                )}

                <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
                    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="font-heading text-[24px] font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-[32px]">{current.label}</h1>
                            <p className="mt-1 text-[14px] text-[var(--text-muted)]">{current.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {usesRange && (
                                <div role="group" aria-label="Tarih aralığı" className="flex rounded-lg border border-[var(--border-medium)] bg-[var(--admin-surface-solid)] p-1">
                                    {RANGES.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            aria-pressed={range === item.key}
                                            onClick={() => changeRange(item.key)}
                                            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                                                range === item.key
                                                    ? "bg-[var(--text-primary)] text-[var(--background)]"
                                                    : "text-[var(--text-secondary)] hover:bg-[var(--admin-hover)]"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                aria-label={resolvedTheme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
                                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg border border-[var(--border-medium)] bg-[var(--admin-surface-solid)] text-[var(--text-secondary)] hover:bg-[var(--admin-hover)]"
                            >
                                {resolvedTheme === "dark" ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
                            </button>
                        </div>
                    </header>

                    {!data ? (
                        <div className="admin-card flex items-start gap-3 text-[14px] text-[var(--text-secondary)]">
                            <DatabaseZap className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--admin-bad)]" aria-hidden />
                            <p>Veritabanından veri alınamadı. Bağlantı ayarını kontrol edip sayfayı yenile.</p>
                        </div>
                    ) : (
                        <div className={`transition-opacity ${pending ? "opacity-50" : ""}`}>
                            {view === "overview" && <OverviewView data={data.range} deltaSuffix={rangeInfo.deltaSuffix} />}
                            {view === "draws" && <DrawsView data={data.range} deltaSuffix={rangeInfo.deltaSuffix} />}
                            {view === "visitors" && <VisitorsView data={data.range} />}
                            {view === "live" && <LiveView events={data.events} />}
                            {view === "security" && <SecurityView access={data.access} />}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
