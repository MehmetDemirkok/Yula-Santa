/**
 * Campaign copy and formats for the admin marketing studio (/admin/marketing).
 * Client-safe. QR codes point at the short Turkish slugs, which redirect to the
 * landing pages (see next.config.ts), so posters stay readable.
 */
export type CampaignKey = "teacher" | "office" | "university" | "friends";
export type FormatKey = "story" | "post" | "poster" | "qrPoster";

export type Campaign = {
    key: CampaignKey;
    label: string;
    emoji: string;
    headline: string;
    subline: string;
    url: string;
};

export const CAMPAIGNS: Campaign[] = [
    {
        key: "teacher",
        label: "Öğretmen / sınıf",
        emoji: "🎒",
        headline: "Sınıfınızda Yılbaşı Heyecanı Başlasın!",
        subline: "Sınıf listesini yükleyin, çekilişi yapın, katlanabilir kartları yazdırıp dağıtın. Öğrencilere telefon gerekmez.",
        url: "https://www.yulasanta.com.tr/sinif-yilbasi-cekilisi",
    },
    {
        key: "office",
        label: "Ofis",
        emoji: "💼",
        headline: "Ofisinizde Secret Santa Heyecanını Başlatın!",
        subline: "Listeyi Excel ile ekleyin, ekipleri birbirinden ayırın, herkese kendi linkini gönderin.",
        url: "https://www.yulasanta.com.tr/ofis-yilbasi-cekilisi",
    },
    {
        key: "university",
        label: "Üniversite",
        emoji: "🎓",
        headline: "Kampüste Yılbaşı Hediye Çekilişi",
        subline: "Kulüp, bölüm ya da ev arkadaşlarınla dakikalar içinde çekiliş yap. Herkes sonucunu telefonundan görsün.",
        url: "https://www.yulasanta.com.tr/universite-yilbasi-cekilisi",
    },
    {
        key: "friends",
        label: "Arkadaşlar ve aile",
        emoji: "🎅",
        headline: "Yılbaşı Hediye Çekilişini Dakikalar İçinde Yap!",
        subline: "İsimleri ekle, çekilişi başlat, herkese WhatsApp'tan kendi linkini gönder.",
        url: "https://www.yulasanta.com.tr/yilbasi-cekilisi",
    },
];

export const FORMATS: { key: FormatKey; label: string; width: number; height: number }[] = [
    { key: "story", label: "Instagram Story (1080×1920)", width: 1080, height: 1920 },
    { key: "post", label: "Instagram Post (1080×1080)", width: 1080, height: 1080 },
    { key: "poster", label: "A4 afiş (300 dpi)", width: 2480, height: 3508 },
    { key: "qrPoster", label: "A4 QR afişi (300 dpi)", width: 2480, height: 3508 },
];

export const BADGE = "Ücretsiz · Kayıt gerekmez";
export const QR_POSTER_TITLE = "Tara, çekilişi başlat!";
export const QR_POSTER_TEXT = "Telefonunun kamerasını QR koda tut.";

/** Splits text into lines of at most `maxChars`, keeping words whole and honoring manual line breaks. */
export function wrapText(text: string, maxChars: number): string[] {
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
        let line = "";
        for (const word of paragraph.split(/\s+/).filter(Boolean)) {
            if (!line) line = word;
            else if ((line + " " + word).length <= maxChars) line += " " + word;
            else {
                lines.push(line);
                line = word;
            }
        }
        if (line) lines.push(line);
    }
    return lines;
}

/** Strips the scheme and www so the URL printed under a QR code is short. */
export function displayUrl(url: string): string {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
}
