/**
 * ═══════════════════════════════════════════════════════════════════════════
 * New Year Theme Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tema her yıl otomatik olarak:
 *   • 30 Kasım 00:00 itibarıyla aktif olur
 *   • 10 Ocak 00:00 itibarıyla kapanır (1–9 Ocak arası hâlâ aktif)
 *
 * Manuel müdahale gerekmez.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Tema başlangıç: Kasım'ın son günü (ay 0-index: 10 = Kasım) */
const THEME_START_MONTH = 10; // November
const THEME_START_DAY = 30;

/** Tema bitiş: 10 Ocak 00:00 (bu andan itibaren kapalı) */
const THEME_END_MONTH = 0; // January
const THEME_END_DAY = 10;

/**
 * Geri sayımın hedeflediği yeni yıl.
 * Kasım–Aralık → gelecek yıl; Ocak 1–9 → içinde bulunulan yıl.
 */
export function getTargetYear(now: Date = new Date()): number {
    return now.getMonth() === THEME_END_MONTH ? now.getFullYear() : now.getFullYear() + 1;
}

/** @deprecated getTargetYear() kullanın — geriye dönük uyumluluk */
export const TARGET_YEAR = getTargetYear();

/**
 * Tema aktif mi?
 * Aralık her zaman aktif; Kasım'da yalnızca 30+; Ocak'ta yalnızca 1–9.
 * Yerel önizleme: URL'ye `?ny=1` ekle (sadece client-side).
 */
export function isNewYearThemeActive(now: Date = new Date()): boolean {
    if (typeof window !== "undefined") {
        try {
            if (new URLSearchParams(window.location.search).get("ny") === "1") return true;
        } catch {
            /* ignore */
        }
    }

    const month = now.getMonth();
    const day = now.getDate();

    // 30 Kasım – 31 Aralık
    if (month === THEME_START_MONTH && day >= THEME_START_DAY) return true;
    if (month === 11) return true; // December

    // 1–9 Ocak (10 Ocak 00:00'dan itibaren kapalı)
    if (month === THEME_END_MONTH && day < THEME_END_DAY) return true;

    return false;
}

/** Geri sayım için kalan süre (hedef: bir sonraki 1 Ocak 00:00) */
export function getTimeUntilNewYear(now: Date = new Date()): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isNewYear: boolean;
    targetYear: number;
} {
    const targetYear = getTargetYear(now);
    const newYear = new Date(targetYear, 0, 1, 0, 0, 0, 0);
    const diff = newYear.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isNewYear: true, targetYear };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isNewYear: false, targetYear };
}
