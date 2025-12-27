/**
 * ═══════════════════════════════════════════════════════════════════════════
 * New Year Theme Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bu dosya yılbaşı temasının konfigürasyonunu içerir.
 * Temayı devre dışı bırakmak için ENABLE_NEW_YEAR_THEME değerini false yapın.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Yılbaşı temasını açıp kapatmak için bu değeri değiştirin
// true = tema aktif, false = tema devre dışı
export const ENABLE_NEW_YEAR_THEME = true;

// Yılbaşı teması otomatik bitiş tarihi (bu tarihten sonra tema otomatik kapanır)
// Format: YYYY-MM-DD
export const NEW_YEAR_THEME_END_DATE = "2026-01-15";

// Hedef yıl
export const TARGET_YEAR = 2026;

// Tema'nın aktif olup olmadığını kontrol et
export function isNewYearThemeActive(): boolean {
    if (!ENABLE_NEW_YEAR_THEME) return false;

    const now = new Date();
    const endDate = new Date(NEW_YEAR_THEME_END_DATE);

    return now <= endDate;
}

// Geri sayım için kalan zamanı hesapla
export function getTimeUntilNewYear(): { days: number; hours: number; minutes: number; seconds: number; isNewYear: boolean } {
    const now = new Date();
    const newYear = new Date(`${TARGET_YEAR}-01-01T00:00:00`);

    const diff = newYear.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isNewYear: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isNewYear: false };
}
