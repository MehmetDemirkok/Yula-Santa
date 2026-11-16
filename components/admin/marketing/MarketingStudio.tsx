"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileCode2, Printer } from "lucide-react";
import { trackAction } from "@/lib/analytics/client";
import { CAMPAIGNS, FORMATS, type CampaignKey, type FormatKey } from "@/lib/marketing/campaigns";
import { MarketingTemplate } from "./MarketingTemplate";

function serialize(svg: SVGSVGElement): string {
    return new XMLSerializer().serializeToString(svg);
}

function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Editable campaign templates (Instagram story/post, A4 poster, A4 QR poster).
 * Everything is drawn as SVG at full size; PNG export rasterizes that SVG in the
 * browser. Web fonts do not load inside an SVG image, so the PNG falls back to
 * the system sans-serif; the SVG download keeps the font names.
 */
export function MarketingStudio() {
    const [campaignKey, setCampaignKey] = useState<CampaignKey>("teacher");
    const [formatKey, setFormatKey] = useState<FormatKey>("story");
    const campaign = CAMPAIGNS.find((c) => c.key === campaignKey)!;
    const format = FORMATS.find((f) => f.key === formatKey)!;
    const [edits, setEdits] = useState<Partial<Record<CampaignKey, { headline?: string; subline?: string; url?: string }>>>({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const current = { headline: campaign.headline, subline: campaign.subline, url: campaign.url, ...edits[campaignKey] };
    const setField = (field: "headline" | "subline" | "url", value: string) =>
        setEdits((prev) => ({ ...prev, [campaignKey]: { ...prev[campaignKey], [field]: value } }));
    const fileName = `yulasanta-${campaignKey}-${formatKey}`;

    const downloadSvg = () => {
        if (!svgRef.current) return;
        download(new Blob([serialize(svgRef.current)], { type: "image/svg+xml" }), `${fileName}.svg`);
        trackAction("qr_generated");
    };

    const downloadPng = async () => {
        if (!svgRef.current) return;
        setBusy(true);
        setError(null);
        try {
            const url = URL.createObjectURL(new Blob([serialize(svgRef.current)], { type: "image/svg+xml" }));
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("load"));
                img.src = url;
            });
            const canvas = document.createElement("canvas");
            canvas.width = format.width;
            canvas.height = format.height;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
            if (!blob) throw new Error("blob");
            download(blob, `${fileName}.png`);
            trackAction("qr_generated");
        } catch {
            setError("PNG oluşturulamadı. SVG olarak indirmeyi deneyin.");
        } finally {
            setBusy(false);
        }
    };

    const printA4 = () => {
        if (!svgRef.current) return;
        const win = window.open("", "_blank");
        if (!win) {
            setError("Yazdırma penceresi açılamadı. Açılır pencerelere izin verin.");
            return;
        }
        win.document.write(
            `<!doctype html><html><head><meta charset="utf-8"><title>${fileName}</title><style>@page{size:A4;margin:0}html,body{margin:0}svg{width:210mm;height:297mm;display:block}</style></head><body>${serialize(svgRef.current)}<script>onload=()=>{print()}<\/script></body></html>`
        );
        win.document.close();
        trackAction("qr_generated");
    };

    const isA4 = formatKey === "poster" || formatKey === "qrPoster";
    const label = "block text-[13px] font-semibold text-[var(--text-secondary)] mb-1";
    const field = "w-full rounded-lg border border-[var(--border-medium)] bg-[var(--admin-surface-solid)] px-3 py-2 text-[14px] text-[var(--text-primary)]";

    return (
        <div className="admin-root min-h-dvh">
            <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
                <Link href="/admin" className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Panele dön
                </Link>
                <h1 className="font-heading text-[24px] font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-[32px]">Tanıtım materyalleri</h1>
                <p className="mt-1 mb-6 text-[14px] text-[var(--text-muted)]">
                    Kampanyayı ve formatı seçin, metni düzenleyin, PNG veya SVG olarak indirin. QR kodlar kısa Türkçe adreslere gider.
                </p>

                <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <div className="space-y-4">
                        <fieldset>
                            <legend className={label}>Kampanya</legend>
                            <div className="grid grid-cols-2 gap-2">
                                {CAMPAIGNS.map((c) => (
                                    <button
                                        key={c.key}
                                        type="button"
                                        aria-pressed={c.key === campaignKey}
                                        onClick={() => setCampaignKey(c.key)}
                                        className={`min-h-[44px] rounded-lg border px-3 py-2 text-left text-[13px] font-semibold ${
                                            c.key === campaignKey
                                                ? "border-santa-red bg-[var(--admin-active)] text-[var(--text-primary)]"
                                                : "border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--admin-hover)]"
                                        }`}
                                    >
                                        <span aria-hidden>{c.emoji}</span> {c.label}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <div>
                            <label htmlFor="mk-format" className={label}>Format</label>
                            <select id="mk-format" value={formatKey} onChange={(e) => setFormatKey(e.target.value as FormatKey)} className={field}>
                                {FORMATS.map((f) => (
                                    <option key={f.key} value={f.key}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        {formatKey !== "qrPoster" && (
                            <>
                                <div>
                                    <label htmlFor="mk-headline" className={label}>Başlık</label>
                                    <textarea id="mk-headline" rows={2} value={current.headline} onChange={(e) => setField("headline", e.target.value)} className={field} />
                                </div>
                                <div>
                                    <label htmlFor="mk-subline" className={label}>Açıklama</label>
                                    <textarea id="mk-subline" rows={3} value={current.subline} onChange={(e) => setField("subline", e.target.value)} className={field} />
                                </div>
                            </>
                        )}
                        <div>
                            <label htmlFor="mk-url" className={label}>QR kodun adresi</label>
                            <input id="mk-url" type="url" value={current.url} onChange={(e) => setField("url", e.target.value)} className={field} />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <button type="button" onClick={downloadPng} disabled={busy} className="inline-flex h-[44px] items-center gap-2 rounded-lg bg-santa-red px-4 text-[14px] font-bold text-white hover:brightness-110 disabled:opacity-60">
                                <Download className="h-4 w-4" aria-hidden /> {busy ? "Hazırlanıyor…" : "PNG indir"}
                            </button>
                            <button type="button" onClick={downloadSvg} className="inline-flex h-[44px] items-center gap-2 rounded-lg border border-[var(--border-medium)] px-4 text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--admin-hover)]">
                                <FileCode2 className="h-4 w-4" aria-hidden /> SVG indir
                            </button>
                            {isA4 && (
                                <button type="button" onClick={printA4} className="inline-flex h-[44px] items-center gap-2 rounded-lg border border-[var(--border-medium)] px-4 text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--admin-hover)]">
                                    <Printer className="h-4 w-4" aria-hidden /> Yazdır
                                </button>
                            )}
                        </div>
                        {error && <p role="alert" className="text-[13px] font-semibold text-[var(--admin-bad)]">{error}</p>}
                        <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">
                            PNG&apos;de yazı tipi sistemin varsayılan yazı tipine döner. Marka yazı tipi için SVG&apos;yi bir tasarım aracında açın.
                        </p>
                    </div>

                    <div className="flex justify-center rounded-xl border border-[var(--border-medium)] bg-[var(--admin-surface-solid)] p-4">
                        <div style={{ width: "100%", maxWidth: formatKey === "post" ? 520 : 420 }}>
                            <div style={{ aspectRatio: `${format.width} / ${format.height}` }} className="[&>svg]:h-full [&>svg]:w-full">
                                <MarketingTemplate
                                    ref={svgRef}
                                    format={formatKey}
                                    width={format.width}
                                    height={format.height}
                                    emoji={campaign.emoji}
                                    headline={current.headline}
                                    subline={current.subline}
                                    url={current.url}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
