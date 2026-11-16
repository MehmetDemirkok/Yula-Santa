import { forwardRef, useMemo } from "react";
import QRCode from "qrcode";
import { BADGE, QR_POSTER_TEXT, QR_POSTER_TITLE, displayUrl, wrapText, type FormatKey } from "@/lib/marketing/campaigns";

type Props = {
    format: FormatKey;
    width: number;
    height: number;
    emoji: string;
    headline: string;
    subline: string;
    url: string;
};

const NAVY = "#141b2b";
const INDIGO = "#07006c";
const RED = "#da3437";
const GOLD = "#E7B53C";
/** Sizes in 1080-wide units. Checked so the QR box never overlaps the text at default copy lengths. */
const LAYOUT: Record<FormatKey, { head: number; sub: number; headChars: number; subChars: number; emoji: number; emojiY: number; headGap: number; qr: number; layout: "center" | "left" }> = {
    story: { head: 96, sub: 42, headChars: 18, subChars: 38, emoji: 180, emojiY: 400, headGap: 170, qr: 380, layout: "center" },
    post: { head: 84, sub: 36, headChars: 20, subChars: 30, emoji: 130, emojiY: 250, headGap: 140, qr: 260, layout: "left" },
    poster: { head: 84, sub: 38, headChars: 20, subChars: 40, emoji: 150, emojiY: 280, headGap: 160, qr: 260, layout: "center" },
    qrPoster: { head: 110, sub: 44, headChars: 16, subChars: 40, emoji: 160, emojiY: 300, headGap: 160, qr: 500, layout: "center" },
};

const FONT = "'Plus Jakarta Sans', Inter, 'Helvetica Neue', Arial, sans-serif";

/** QR modules as one SVG path, so the code stays sharp at any size. */
function QrPath({ url, x, y, size }: { url: string; x: number; y: number; size: number }) {
    const qr = useMemo(() => {
        try {
            return QRCode.create(url || " ", { errorCorrectionLevel: "M" }).modules;
        } catch {
            return null;
        }
    }, [url]);
    if (!qr) return null;
    const cell = size / qr.size;
    let d = "";
    for (let row = 0; row < qr.size; row++) {
        for (let col = 0; col < qr.size; col++) {
            if (qr.data[row * qr.size + col]) d += `M${x + col * cell} ${y + row * cell}h${cell}v${cell}h${-cell}z`;
        }
    }
    return <path d={d} fill={NAVY} shapeRendering="crispEdges" />;
}

function snowDots(width: number, height: number, count: number) {
    let seed = 7;
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: count }, () => ({ cx: rand() * width, cy: rand() * height, r: (0.6 + rand() * 1.8) * (width / 1080) * 3 }));
}

/** Deterministic snow dots, so the preview and the download match. */
function Snow({ width, height, count }: { width: number; height: number; count: number }) {
    const dots = useMemo(() => snowDots(width, height, count), [width, height, count]);
    return (
        <g fill="#ffffff" opacity="0.18">
            {dots.map((d, i) => (
                <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
            ))}
        </g>
    );
}

/**
 * One marketing template drawn as SVG at its real pixel size. The studio scales
 * it for the preview and rasterizes the same markup for the PNG download.
 */
export const MarketingTemplate = forwardRef<SVGSVGElement, Props>(function MarketingTemplate(
    { format, width, height, emoji, headline, subline, url },
    ref
) {
    const u = width / 1080; // 1 unit = 1px on a 1080-wide canvas
    const pad = 80 * u;
    const c = LAYOUT[format];
    const square = c.layout === "left";
    const qrOnly = format === "qrPoster";

    const headSize = c.head * u;
    const subSize = c.sub * u;
    const headLines = wrapText(qrOnly ? QR_POSTER_TITLE : headline, c.headChars);
    const subLines = wrapText(qrOnly ? QR_POSTER_TEXT : subline, c.subChars);

    const qrBox = c.qr * u;
    const qrPad = 28 * u;
    const qrX = square ? width - pad - qrBox : (width - qrBox) / 2;
    const qrY = square ? height - pad - qrBox - 50 * u : height - pad - qrBox - 120 * u;

    const emojiY = c.emojiY * u;
    const headY = emojiY + c.headGap * u;
    const subY = headY + headLines.length * headSize * 1.12 + 40 * u;
    const textX = square ? pad : width / 2;
    const anchor = square ? "start" : "middle";
    const badgeY = subY + subLines.length * subSize * 1.35 + 40 * u;
    const badgeW = 520 * u;
    const emojiSize = c.emoji * u;

    return (
        <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} fontFamily={FONT}>
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0" stopColor={NAVY} />
                    <stop offset="1" stopColor={INDIGO} />
                </linearGradient>
            </defs>
            <rect width={width} height={height} fill="url(#bg)" />
            <Snow width={width} height={height} count={square ? 50 : 90} />
            <rect x={0} y={0} width={width} height={14 * u} fill={RED} />

            <text x={pad} y={pad + 40 * u} fill="#ffffff" fontSize={40 * u} fontWeight={800}>
                🎁 YulaSanta
            </text>
            <text x={width - pad} y={pad + 40 * u} fill={GOLD} fontSize={30 * u} fontWeight={700} textAnchor="end">
                ✦ ✦ ✦
            </text>

            <text x={textX} y={emojiY} fontSize={emojiSize} textAnchor={anchor}>
                {qrOnly ? "📱" : emoji}
            </text>

            <text x={textX} y={headY} fill="#ffffff" fontSize={headSize} fontWeight={800} textAnchor={anchor}>
                {headLines.map((line, i) => (
                    <tspan key={i} x={textX} dy={i === 0 ? 0 : headSize * 1.12}>
                        {line}
                    </tspan>
                ))}
            </text>
            <text x={textX} y={subY} fill="#d7dbe8" fontSize={subSize} fontWeight={500} textAnchor={anchor}>
                {subLines.map((line, i) => (
                    <tspan key={i} x={textX} dy={i === 0 ? 0 : subSize * 1.35}>
                        {line}
                    </tspan>
                ))}
            </text>

            {!qrOnly && (
                <g>
                    <rect x={square ? pad : (width - badgeW) / 2} y={badgeY} width={badgeW} height={76 * u} rx={38 * u} fill={RED} />
                    <text x={(square ? pad : (width - badgeW) / 2) + badgeW / 2} y={badgeY + 50 * u} fill="#ffffff" fontSize={32 * u} fontWeight={700} textAnchor="middle">
                        {BADGE}
                    </text>
                </g>
            )}

            <rect x={qrX - qrPad} y={qrY - qrPad} width={qrBox + qrPad * 2} height={qrBox + qrPad * 2} rx={28 * u} fill="#ffffff" />
            <QrPath url={url} x={qrX} y={qrY} size={qrBox} />
            {/* In the square post the QR sits in the corner, so its URL is right-aligned to stay on the canvas. */}
            <text
                x={square ? qrX + qrBox + qrPad : qrX + qrBox / 2}
                y={qrY + qrBox + qrPad + (square ? 50 : 56) * u}
                fill="#ffffff"
                fontSize={(qrOnly ? 40 : square ? 22 : 28) * u}
                fontWeight={700}
                textAnchor={square ? "end" : "middle"}
            >
                {displayUrl(url)}
            </text>
        </svg>
    );
});
