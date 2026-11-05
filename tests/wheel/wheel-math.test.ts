import { describe, it } from "node:test";
import assert from "node:assert";
import {
    TWO_PI,
    MAX_ENTRY_LENGTH,
    colorForSegment,
    computeSpinTarget,
    easeOutSpin,
    parseEntries,
    readableTextColor,
    segmentAtRotation,
    spinPlan,
} from "../../lib/wheel/wheelMath";

describe("computeSpinTarget", () => {
    it("always lands the pointer on the chosen segment", () => {
        for (const count of [2, 3, 7, 8, 13, 50, 100]) {
            for (const start of [0, 1.3, -4.2, 57.9, 1000.5]) {
                for (let index = 0; index < count; index++) {
                    for (const jitter of [0, 0.5, 1]) {
                        const target = computeSpinTarget(start, index, count, 8, jitter);
                        assert.strictEqual(segmentAtRotation(target, count), index);
                    }
                }
            }
        }
    });

    it("only ever spins forward, by at least the requested turns", () => {
        const start = 12.34;
        const target = computeSpinTarget(start, 3, 8, 6, 0.5);
        assert.ok(target - start >= 6 * TWO_PI);
        assert.ok(target - start < 7 * TWO_PI);
    });
});

describe("segmentAtRotation", () => {
    it("maps rotation to the segment under the 12 o'clock pointer", () => {
        const quarter = TWO_PI / 4;
        assert.strictEqual(segmentAtRotation(0.01, 4), 3);
        assert.strictEqual(segmentAtRotation(-0.01, 4), 0);
        assert.strictEqual(segmentAtRotation(-quarter - 0.01, 4), 1);
    });
});

describe("colorForSegment", () => {
    it("never gives neighbouring segments the same colour, including across the wrap", () => {
        for (let count = 2; count <= 120; count++) {
            for (let i = 0; i < count; i++) {
                const next = (i + 1) % count;
                assert.notStrictEqual(
                    colorForSegment(i, count),
                    colorForSegment(next, count),
                    `count=${count} i=${i}`
                );
            }
        }
    });
});

describe("parseEntries", () => {
    it("splits lines, trims, and drops blanks", () => {
        assert.deepStrictEqual(parseEntries(" Ayşe \r\n\n  Can\n"), ["Ayşe", "Can"]);
    });

    it("splits a single comma-separated line", () => {
        assert.deepStrictEqual(parseEntries("Ayşe, Can ,,Elif"), ["Ayşe", "Can", "Elif"]);
    });

    it("keeps commas when the text is already line-separated", () => {
        assert.deepStrictEqual(parseEntries("Ankara, TR\nİzmir, TR"), ["Ankara, TR", "İzmir, TR"]);
    });

    it("limits entry length", () => {
        assert.strictEqual(parseEntries("x".repeat(500))[0].length, MAX_ENTRY_LENGTH);
    });
});

describe("spin feel", () => {
    it("eases from 0 to 1 without moving backwards", () => {
        assert.strictEqual(easeOutSpin(0), 0);
        assert.strictEqual(easeOutSpin(1), 1);
        for (let t = 0; t < 1; t += 0.05) assert.ok(easeOutSpin(t + 0.05) >= easeOutSpin(t));
    });

    it("clamps flick power", () => {
        assert.deepStrictEqual(spinPlan(-3), spinPlan(0));
        assert.deepStrictEqual(spinPlan(9), spinPlan(1));
        assert.ok(spinPlan(1).durationMs > spinPlan(0).durationMs);
    });
});

describe("readableTextColor", () => {
    it("uses dark text on amber and white on deep colours", () => {
        assert.strictEqual(readableTextColor("#F4B400"), "#14161F");
        assert.strictEqual(readableTextColor("#4F46E5"), "#FFFFFF");
    });
});
