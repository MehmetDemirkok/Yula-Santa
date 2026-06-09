/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Fair Random Engine — Adil Rastgelelik Motoru
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Bir çekiliş sitesinin EN kritik parçası: her katılımcının kazanma şansının
 * matematiksel olarak EŞİT olması. Bu modül bunu garanti eder.
 *
 * Neden `Math.random()` veya `.sort(() => Math.random() - 0.5)` DEĞİL?
 *  1. `.sort(() => Math.random() - 0.5)` yanlıdır (biased): karşılaştırma
 *     tabanlı sıralama, elemanları eşit olasılıkla dağıtmaz. Bazı katılımcılar
 *     diğerlerinden daha sık kazanır. Bir çekiliş için kabul edilemez.
 *  2. `Math.floor(Math.random() * n)` ise istatistiksel olarak iyi olsa da
 *     kriptografik değildir ve "modulo bias" içerebilir.
 *
 * Bu modül:
 *  - Tarayıcının kriptografik güvenli `crypto.getRandomValues` üretecini kullanır
 *  - Rejection sampling ile "modulo bias"i tamamen eler (provably uniform)
 *  - Gerçek Fisher–Yates karıştırması uygular (her permütasyon eşit olasılıklı)
 *  - crypto yoksa (çok eski ortam) güvenli şekilde Math.random'a düşer
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Ortamda kriptografik güvenli üreteç var mı? (SSR/eski tarayıcı koruması) */
const cryptoObj: Crypto | undefined =
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto?.getRandomValues === "function"
        ? globalThis.crypto
        : undefined;

/**
 * [0, maxExclusive) aralığında YANSIZ (unbiased) bir tam sayı döndürür.
 * Rejection sampling kullanır: modulo bias yoktur — her değer eşit olasılıklı.
 */
export function secureRandomInt(maxExclusive: number): number {
    if (maxExclusive <= 0) return 0;
    if (maxExclusive === 1) return 0;

    if (cryptoObj) {
        // 32-bit'lik üretecin tam katı olan en büyük eşiği bul; üstündekileri reddet.
        const range = 0x100000000; // 2^32
        const limit = range - (range % maxExclusive);
        const buf = new Uint32Array(1);
        let value: number;
        do {
            cryptoObj.getRandomValues(buf);
            value = buf[0];
        } while (value >= limit);
        return value % maxExclusive;
    }

    // Fallback (kriptografik üreteç yoksa)
    return Math.floor(Math.random() * maxExclusive);
}

/**
 * [min, max] aralığında (her iki uç dahil) yansız bir tam sayı döndürür.
 */
export function secureRandomIntInRange(min: number, max: number): number {
    if (max < min) [min, max] = [max, min];
    return min + secureRandomInt(max - min + 1);
}

/**
 * Diziyi Fisher–Yates ile karıştırıp YENİ bir dizi döndürür.
 * Her olası sıralama matematiksel olarak eşit olasılıklıdır.
 */
export function secureShuffle<T>(array: readonly T[]): T[] {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Diziden tek bir öğeyi eşit olasılıkla seçer.
 */
export function pickOne<T>(array: readonly T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[secureRandomInt(array.length)];
}

/**
 * Diziden tekrar etmeden `count` adet kazanan seçer (adil çekiliş).
 * count >= dizi uzunluğu ise karıştırılmış tüm diziyi döndürür.
 */
export function pickWinners<T>(array: readonly T[], count: number): T[] {
    return secureShuffle(array).slice(0, Math.max(0, count));
}
