/**
 * ═══════════════════════════════════════════════════════════════════════════
 * celebrate — tek, ortak "kazanan açıklandı" konfeti efekti
 * ═══════════════════════════════════════════════════════════════════════════
 * Tüm çekiliş/kura sayfaları (raffle, YouTube, TikTok, çark, takım, secret
 * santa...) aynı kutlama anını tetikler; efekt burada tek yerden yönetilir.
 *
 * İki katman:
 *  1. Anlık "patlama" — merkezden 5 katmanlı, farklı hız/açı/boyutlarda bir
 *     tek seferlik burst (canvas-confetti'nin "realistic" reçetesi).
 *  2. Sönümlenen iki yanlı konfeti akışı — süre boyunca yoğunluğu azalan.
 *
 * `prefers-reduced-motion` canvas-confetti'nin kendi `disableForReducedMotion`
 * bayrağıyla native olarak saygı görür.
 */

import confetti from "canvas-confetti";

/** Marka renkleri (design.md): santa-red, christmas-green, gold, kar beyazı */
export const CELEBRATE_COLORS = ["#B61722", "#145A2E", "#E09600", "#FFFFFF"];

const SHAPES: confetti.Shape[] = ["square", "circle", "star"];

interface CelebrateOptions {
    /** Konfeti renk paleti — varsayılan marka renkleri */
    colors?: string[];
    /** Sönümlenen akışın toplam süresi (ms) */
    duration?: number;
}

/**
 * Bir kazanan/sonuç açıklandığında çağrılır. Kendi kendine temizlenir,
 * cleanup gerektirmez.
 */
export function celebrate({ colors = CELEBRATE_COLORS, duration = 2200 }: CelebrateOptions = {}) {
    const base = { colors, shapes: SHAPES, disableForReducedMotion: true };

    // 1) Anlık patlama — katmanlı "realistic" burst
    const burst = (particleRatio: number, opts: confetti.Options) =>
        confetti({ ...base, origin: { y: 0.65 }, particleCount: Math.floor(200 * particleRatio), ...opts });

    burst(0.25, { spread: 26, startVelocity: 55 });
    burst(0.2, { spread: 60 });
    burst(0.35, { spread: 100, decay: 0.91, scalar: 0.85 });
    burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    burst(0.1, { spread: 120, startVelocity: 45 });

    // 2) Sönümlenen iki yanlı akış
    const end = Date.now() + duration;
    (function frame() {
        const timeLeft = end - Date.now();
        const intensity = Math.max(timeLeft / duration, 0);
        if (intensity <= 0) return;

        confetti({ ...base, particleCount: Math.ceil(4 + 10 * intensity), angle: 60, spread: 65, startVelocity: 45, origin: { x: 0, y: 0.7 } });
        confetti({ ...base, particleCount: Math.ceil(4 + 10 * intensity), angle: 120, spread: 65, startVelocity: 45, origin: { x: 1, y: 0.7 } });

        requestAnimationFrame(frame);
    })();
}
