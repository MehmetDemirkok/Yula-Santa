export interface WinnerCardData {
    giveawayName: string;
    winners: { name: string; comment?: string }[];
    backups: { name: string }[];
    platform: "instagram" | "youtube" | "tiktok" | "secret-santa";
}

const PLATFORM_COLORS: Record<WinnerCardData["platform"], { bg: string; accent: string; text: string }> = {
    instagram: { bg: "#6C2EBE", accent: "#E1306C", text: "#fff" },
    youtube:   { bg: "#CC0000", accent: "#FF4444", text: "#fff" },
    tiktok:    { bg: "#010101", accent: "#25F4EE", text: "#fff" },
    "secret-santa": { bg: "#165B33", accent: "#D42426", text: "#fff" },
};

export function downloadWinnerCard(data: WinnerCardData) {
    const W = 800;
    const PADDING = 48;
    const ROW_H = 64;
    const HEADER_H = 180;
    const BACKUP_H = data.backups.length > 0 ? 40 + data.backups.length * 44 : 0;
    const FOOTER_H = 60;
    const CONTENT_H = data.winners.length * ROW_H + 20;
    const H = HEADER_H + CONTENT_H + BACKUP_H + FOOTER_H + 40;

    const canvas = document.createElement("canvas");
    canvas.width = W * 2;      // 2x for retina
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);

    const colors = PLATFORM_COLORS[data.platform];

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, colors.bg);
    grad.addColorStop(1, shadeColor(colors.bg, -30));
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, W, H, 24);
    ctx.fill();

    // Subtle overlay pattern
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(W - 60 + i * 20, -60 + i * 20, 100 + i * 40, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Header area
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, PADDING, 24, W - PADDING * 2, 130, 16);
    ctx.fill();

    // Trophy emoji
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆", W / 2, 78);

    // Giveaway name
    ctx.fillStyle = "#fff";
    ctx.font = `bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    const title = data.giveawayName || "Çekiliş Sonuçları";
    ctx.fillText(truncate(title, 40), W / 2, 112);

    // Subtitle
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillText(`${data.winners.length} Kazanan${data.backups.length > 0 ? ` · ${data.backups.length} Yedek` : ""}`, W / 2, 136);

    // Winners section label
    let y = HEADER_H;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("KAZANANLAR", PADDING, y);
    y += 20;

    // Winner rows
    data.winners.forEach((w, i) => {
        // Row background
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        roundRect(ctx, PADDING, y, W - PADDING * 2, ROW_H - 8, 12);
        ctx.fill();

        // Number badge
        const badgeGrad = ctx.createLinearGradient(PADDING + 8, y + 8, PADDING + 40, y + 48);
        badgeGrad.addColorStop(0, colors.accent);
        badgeGrad.addColorStop(1, shadeColor(colors.accent, -20));
        ctx.fillStyle = badgeGrad;
        ctx.beginPath();
        ctx.arc(PADDING + 24, y + 28, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = `bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(String(i + 1), PADDING + 24, y + 33);

        // Name
        ctx.fillStyle = "#fff";
        ctx.font = `bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText(`@${truncate(w.name, 28)}`, PADDING + 52, y + 24);

        // Comment
        if (w.comment && w.comment !== "Manual Entry") {
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = `12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
            ctx.fillText(`"${truncate(w.comment, 50)}"`, PADDING + 52, y + 42);
        }

        y += ROW_H;
    });

    y += 16;

    // Backups section
    if (data.backups.length > 0) {
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = `bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText("YEDEKLER", PADDING, y);
        y += 20;

        data.backups.forEach((b, i) => {
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            roundRect(ctx, PADDING, y, W - PADDING * 2, 36, 10);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.font = `13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
            ctx.textAlign = "left";
            ctx.fillText(`${i + 1}. @${truncate(b.name, 32)}`, PADDING + 14, y + 23);
            y += 44;
        });
    }

    // Footer
    const footerY = H - FOOTER_H;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, footerY, W, FOOTER_H);

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = `bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("yulasanta.com.tr", W / 2, footerY + 34);

    // Download
    const link = document.createElement("a");
    link.download = `cekilis-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function truncate(str: string, max: number) {
    return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function shadeColor(hex: string, percent: number) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}
