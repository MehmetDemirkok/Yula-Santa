/**
 * Pure wheel logic, free of DOM and canvas so it can be unit-tested.
 *
 * Rotation convention: `rotation` is in radians and grows clockwise. Segment `i`
 * spans [i * segmentAngle, (i + 1) * segmentAngle) clockwise from 12 o'clock when
 * the rotation is 0. The pointer is fixed at 12 o'clock.
 */

export const TWO_PI = Math.PI * 2;
export const MAX_ENTRIES = 100;
export const MAX_ENTRY_LENGTH = 60;

export const WHEEL_COLORS = [
    "#D62839", // red
    "#4F46E5", // indigo
    "#F4B400", // amber
    "#0B8457", // emerald
    "#7C3AED", // violet
    "#F97316", // orange
    "#0E7FA8", // teal
    "#DB2777", // pink
] as const;

const normalizeAngle = (angle: number) => ((angle % TWO_PI) + TWO_PI) % TWO_PI;

/** Colour for a segment; the wheel wraps around, so the last must differ from the first. */
export function colorForSegment(index: number, count: number): string {
    const len = WHEEL_COLORS.length;
    const isLast = index === count - 1;
    if (isLast && count > 1 && (count - 1) % len === 0) return WHEEL_COLORS[2];
    return WHEEL_COLORS[index % len];
}

/** Index of the segment currently under the pointer. */
export function segmentAtRotation(rotation: number, count: number): number {
    if (count <= 0) return -1;
    const segmentAngle = TWO_PI / count;
    return Math.min(count - 1, Math.floor(normalizeAngle(-rotation) / segmentAngle));
}

/**
 * Final rotation that lands the pointer inside `index`, after `fullSpins` extra turns.
 * `jitter` (0..1) only picks where inside the segment it stops: the winner itself is
 * chosen by the caller, so nothing here can bias the result.
 */
export function computeSpinTarget(
    startRotation: number,
    index: number,
    count: number,
    fullSpins: number,
    jitter: number
): number {
    const segmentAngle = TWO_PI / count;
    const padding = segmentAngle * 0.12;
    const landing = index * segmentAngle + padding + jitter * (segmentAngle - 2 * padding);
    const delta = normalizeAngle(-landing - startRotation);
    return startRotation + fullSpins * TWO_PI + delta;
}

/** Fast at first, slowing into a long, tense finish. */
export function easeOutSpin(t: number): number {
    return 1 - Math.pow(1 - t, 4);
}

/** Maps flick strength (0..1) to the spin's length; a harder flick spins longer. */
export function spinPlan(power: number): { durationMs: number; fullSpins: number } {
    const p = Math.max(0, Math.min(1, power));
    return { durationMs: Math.round(4600 + p * 2400), fullSpins: 6 + Math.round(p * 6) };
}

/** Splits typed or pasted text into clean entries (one per line, or comma-separated). */
export function parseEntries(text: string): string[] {
    const lines = text.split(/\r?\n/);
    const parts = lines.length > 1 ? lines : text.split(",");
    return parts
        .map((part) => part.trim().slice(0, MAX_ENTRY_LENGTH))
        .filter((part) => part.length > 0);
}

/** Text colour with the better contrast on a given segment colour. */
export function readableTextColor(hex: string): "#FFFFFF" | "#14161F" {
    const value = parseInt(hex.slice(1), 16);
    const channel = (shift: number) => {
        const c = ((value >> shift) & 0xff) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
    const onWhite = 1.05 / (luminance + 0.05);
    const onDark = (luminance + 0.05) / 0.0585;
    return onWhite >= onDark ? "#FFFFFF" : "#14161F";
}
