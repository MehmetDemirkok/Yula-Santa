"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const numberFormat = new Intl.NumberFormat("tr-TR");

export const formatNumber = (value: number) => numberFormat.format(value);

export const formatShare = (part: number, whole: number) =>
    whole > 0 ? `%${numberFormat.format(Math.round((part / whole) * 100))}` : "%0";

const formatAxis = (value: number) => (value >= 10_000 ? `${numberFormat.format(value / 1000)} B` : formatNumber(value));

function niceTicks(max: number, count = 4): number[] {
    const raw = Math.max(max, 1) / count;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const normalized = raw / magnitude;
    const step = Math.max((normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude, 1);
    const ticks: number[] = [];
    for (let tick = 0; tick < max + step; tick += step) ticks.push(Math.round(tick));
    return ticks;
}

export function EmptyState({ text = "Henüz veri yok" }: { text?: string }) {
    return <p className="py-6 text-center text-[14px] text-[var(--text-muted)]">{text}</p>;
}

/** value is null when the previous period has no data to compare with. */
export function Delta({ value, suffix }: { value: number | null; suffix?: string }) {
    if (value === null) {
        return <span className="text-[13px] text-[var(--text-muted)]">{suffix ? "Karşılaştırma yok" : "—"}</span>;
    }
    const up = value >= 0;
    const Icon = up ? ArrowUpRight : ArrowDownRight;
    return (
        <span className="inline-flex items-center gap-1 text-[13px] text-[var(--text-secondary)]">
            <Icon className={`h-[15px] w-[15px] ${up ? "text-[var(--admin-good)]" : "text-[var(--admin-bad)]"}`} aria-hidden />
            <span className="font-semibold text-[var(--text-primary)]">
                {up ? "+" : "−"}%{Math.abs(value)}
            </span>
            {suffix && <span className="text-[var(--text-muted)]">{suffix}</span>}
        </span>
    );
}

export function Sparkline({ values }: { values: number[] }) {
    const width = 84;
    const height = 30;
    const pad = 5;
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const x = (index: number) => pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = (value: number) => height - pad - ((value - min) / Math.max(max - min, 1)) * (height - pad * 2);
    const path = values.map((value, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(value)}`).join(" ");
    const last = values.length - 1;

    return (
        <svg width={width} height={height} aria-hidden className="shrink-0">
            <path d={path} fill="none" stroke="var(--admin-muted-mark)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={x(last)} cy={y(values[last])} r={4} fill="var(--admin-series-1)" stroke="var(--admin-surface)" strokeWidth={2} />
        </svg>
    );
}

export function StatTile({
    label,
    value,
    delta,
    trend,
    deltaSuffix = "önceki döneme göre",
}: {
    label: string;
    value: string;
    delta: number | null;
    trend?: number[];
    deltaSuffix?: string;
}) {
    return (
        <div className="admin-card flex flex-col gap-3">
            <div className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</div>
            <div className="flex items-end justify-between gap-3">
                <div className="font-heading text-[28px] font-bold leading-none tracking-tight text-[var(--text-primary)]">{value}</div>
                {trend && <Sparkline values={trend} />}
            </div>
            <Delta value={delta} suffix={deltaSuffix} />
        </div>
    );
}

export type ChartPoint = { label: string; fullLabel: string; value: number };

function useWidth() {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return { ref, width };
}

export function TrendChart({ points, valueName, height = 240 }: { points: ChartPoint[]; valueName: string; height?: number }) {
    const { ref, width } = useWidth();
    const [active, setActive] = useState<number | null>(null);

    const margin = { top: 14, right: 48, bottom: 26, left: 44 };
    const plotWidth = Math.max(width - margin.left - margin.right, 1);
    const plotHeight = height - margin.top - margin.bottom;
    const ticks = niceTicks(Math.max(...points.map((point) => point.value), 1));
    const top = ticks[ticks.length - 1];
    const x = (index: number) => margin.left + (index / Math.max(points.length - 1, 1)) * plotWidth;
    const y = (value: number) => margin.top + plotHeight - (value / top) * plotHeight;

    const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.value)}`).join(" ");
    const area = `${line} L${x(points.length - 1)},${margin.top + plotHeight} L${x(0)},${margin.top + plotHeight} Z`;

    const labelCount = width < 480 ? 3 : 6;
    const labelEvery = Math.max(Math.ceil((points.length - 1) / (labelCount - 1)), 1);
    const labelIndexes = points
        .map((_, index) => index)
        .filter((index) => index % labelEvery === 0 && points.length - 1 - index >= labelEvery / 2);
    labelIndexes.push(points.length - 1);

    const onPointer = (event: PointerEvent<HTMLDivElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - box.left - margin.left) / plotWidth;
        setActive(Math.min(Math.max(Math.round(ratio * (points.length - 1)), 0), points.length - 1));
    };

    const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const step = event.key === "ArrowLeft" ? -1 : 1;
        setActive((current) => Math.min(Math.max((current ?? points.length - 1) + step, 0), points.length - 1));
    };

    const last = points[points.length - 1];
    const selected = active === null ? null : points[active];
    const tooltipWidth = 172;

    return (
        <div>
            <div
                ref={ref}
                role="img"
                tabIndex={0}
                aria-label={`${valueName} grafiği. Son değer ${last.fullLabel}: ${formatNumber(last.value)}. Değerler arasında ok tuşlarıyla gezinebilirsin.`}
                className="relative touch-pan-y rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-series-1)]"
                style={{ height }}
                onPointerMove={onPointer}
                onPointerLeave={() => setActive(null)}
                onKeyDown={onKey}
                onFocus={() => setActive(points.length - 1)}
                onBlur={() => setActive(null)}
            >
                {width > 0 && (
                    <svg width={width} height={height} aria-hidden className="block">
                        {ticks.map((tick) => (
                            <g key={tick}>
                                <line x1={margin.left} x2={margin.left + plotWidth} y1={y(tick)} y2={y(tick)} stroke="var(--admin-grid)" strokeWidth={1} />
                                <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="admin-axis-text">
                                    {formatAxis(tick)}
                                </text>
                            </g>
                        ))}
                        {labelIndexes.map((index) => (
                            <text
                                key={index}
                                x={x(index)}
                                y={height - 6}
                                textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
                                className="admin-axis-text"
                            >
                                {points[index].label}
                            </text>
                        ))}
                        <path d={area} fill="var(--admin-series-1)" opacity={0.1} />
                        <path d={line} fill="none" stroke="var(--admin-series-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        {active !== null && selected && (
                            <>
                                <line x1={x(active)} x2={x(active)} y1={margin.top} y2={margin.top + plotHeight} stroke="var(--admin-muted-mark)" strokeWidth={1} />
                                <circle cx={x(active)} cy={y(selected.value)} r={5} fill="var(--admin-series-1)" stroke="var(--admin-surface)" strokeWidth={2} />
                            </>
                        )}
                        <circle cx={x(points.length - 1)} cy={y(last.value)} r={4} fill="var(--admin-series-1)" stroke="var(--admin-surface)" strokeWidth={2} />
                        <text x={x(points.length - 1) + 9} y={y(last.value) + 4} className="admin-end-label">
                            {formatAxis(last.value)}
                        </text>
                    </svg>
                )}
                {active !== null && selected && width > 0 && (
                    <div
                        className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border-medium)] bg-[var(--admin-surface-solid)] px-3 py-2 shadow-lg"
                        style={{
                            top: 4,
                            width: tooltipWidth,
                            left: Math.min(Math.max(x(active) - tooltipWidth / 2, 0), width - tooltipWidth),
                        }}
                    >
                        <div className="font-heading text-[18px] font-bold leading-tight text-[var(--text-primary)]">{formatNumber(selected.value)}</div>
                        <div className="mt-0.5 text-[12px] leading-snug text-[var(--text-secondary)]">{valueName}</div>
                        <div className="text-[12px] leading-snug text-[var(--text-muted)]">{selected.fullLabel}</div>
                    </div>
                )}
            </div>
            <details className="mt-2 text-[13px] text-[var(--text-secondary)]">
                <summary className="w-fit select-none font-medium hover:text-[var(--text-primary)]">Tablo olarak göster</summary>
                <div className="mt-2 max-h-[220px] overflow-y-auto rounded-lg border border-[var(--border-light)]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[var(--text-muted)]">
                                <th className="px-3 py-2 font-medium">Zaman</th>
                                <th className="px-3 py-2 text-right font-medium">{valueName}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {points.map((point) => (
                                <tr key={point.fullLabel} className="ys-zebra-row">
                                    <td className="px-3 py-1.5">{point.fullLabel}</td>
                                    <td className="px-3 py-1.5 text-right tabular-nums text-[var(--text-primary)]">{formatNumber(point.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}

export function RankedBars({
    rows,
    total,
    labelWidth = "sm:grid-cols-[150px_minmax(0,1fr)_92px]",
    mono = false,
}: {
    rows: { name: string; count: number }[];
    total?: number;
    labelWidth?: string;
    mono?: boolean;
}) {
    const max = Math.max(...rows.map((row) => row.count), 1);
    const whole = total ?? rows.reduce((acc, row) => acc + row.count, 0);

    if (rows.length === 0) return <EmptyState />;

    return (
        <ul className="flex flex-col">
            {rows.map((row) => (
                <li
                    key={row.name}
                    className={`group grid grid-cols-[minmax(0,1fr)_92px] items-center gap-x-3 gap-y-1 rounded-md px-1.5 py-1.5 hover:bg-[var(--admin-hover)] ${labelWidth}`}
                    title={`${row.name}: ${formatNumber(row.count)} (${formatShare(row.count, whole)})`}
                >
                    <span className={`truncate text-[13px] text-[var(--text-secondary)] ${mono ? "font-mono" : ""}`}>{row.name}</span>
                    <span className="order-3 col-span-2 flex h-[10px] items-center sm:order-none sm:col-span-1">
                        <span
                            className="block h-[10px] rounded-r-[4px] bg-[var(--admin-series-1)] group-hover:opacity-85"
                            style={{ width: `${Math.max((row.count / max) * 100, 0.5)}%` }}
                        />
                    </span>
                    <span className="text-right text-[13px] tabular-nums">
                        <span className="font-semibold text-[var(--text-primary)]">{formatNumber(row.count)}</span>{" "}
                        <span className="text-[var(--text-muted)]">{formatShare(row.count, whole)}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

const SEGMENT_STYLES = [
    { fill: "var(--admin-series-1)", ink: "#FFFFFF" },
    { fill: "var(--admin-series-2)", ink: "#111827" },
    { fill: "var(--admin-series-3)", ink: "#111827" },
];

/** One whole split into at most three parts; hues follow the entity's position in the list. */
export function SegmentedBar({ parts, label }: { parts: { name: string; count: number }[]; label: string }) {
    const whole = parts.reduce((acc, part) => acc + part.count, 0);
    const summary = parts.map((part) => `${part.name} ${formatShare(part.count, whole)}`).join(", ");

    if (whole === 0) return <EmptyState />;

    return (
        <div>
            <div role="img" aria-label={`${label}: ${summary}`} className="flex h-[28px] w-full gap-[2px]">
                {parts.map((part, index) => {
                    const share = (part.count / Math.max(whole, 1)) * 100;
                    return (
                        <div
                            key={part.name}
                            title={`${part.name}: ${formatNumber(part.count)} (${formatShare(part.count, whole)})`}
                            className="flex items-center rounded-[4px] pl-2 text-[12px] font-semibold"
                            style={{ width: `${share}%`, background: SEGMENT_STYLES[index].fill, color: SEGMENT_STYLES[index].ink }}
                        >
                            {share >= 10 && formatShare(part.count, whole)}
                        </div>
                    );
                })}
            </div>
            <ul className="mt-3 flex flex-col gap-1.5">
                {parts.map((part, index) => (
                    <li key={part.name} className="flex items-center gap-2 text-[13px]">
                        <span className="h-[10px] w-[10px] shrink-0 rounded-[3px]" style={{ background: SEGMENT_STYLES[index].fill }} />
                        <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">{part.name}</span>
                        <span className="font-semibold tabular-nums text-[var(--text-primary)]">{formatNumber(part.count)}</span>
                        <span className="w-[38px] text-right tabular-nums text-[var(--text-muted)]">{formatShare(part.count, whole)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Funnel({ steps }: { steps: { name: string; count: number }[] }) {
    const first = Math.max(steps[0]?.count ?? 0, 1);

    return (
        <ol className="flex flex-col gap-3">
            {steps.map((step, index) => (
                <li key={step.name} title={`${step.name}: ${formatNumber(step.count)}`}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
                        <span className="truncate text-[var(--text-secondary)]">{step.name}</span>
                        <span className="shrink-0 tabular-nums">
                            <span className="font-semibold text-[var(--text-primary)]">{formatNumber(step.count)}</span>{" "}
                            <span className="text-[var(--text-muted)]">
                                {index === 0 ? "%100" : formatShare(step.count, first)}
                            </span>
                        </span>
                    </div>
                    <div
                        className="h-[12px] rounded-r-[4px] bg-[var(--admin-series-1)]"
                        style={{ width: step.count > 0 ? `${Math.max((step.count / first) * 100, 0.5)}%` : 0 }}
                    />
                </li>
            ))}
        </ol>
    );
}

export function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
    return (
        <section className={`admin-card ${className}`}>
            <header className="mb-4">
                <h2 className="font-heading text-[16px] font-bold text-[var(--text-primary)]">{title}</h2>
                {subtitle && <p className="mt-1 text-[13px] leading-snug text-[var(--text-muted)]">{subtitle}</p>}
            </header>
            {children}
        </section>
    );
}
