"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
    TWO_PI,
    colorForSegment,
    computeSpinTarget,
    easeOutSpin,
    readableTextColor,
    segmentAtRotation,
    spinPlan,
} from "@/lib/wheel/wheelMath";

// All geometry is a fraction of the canvas size, so the wheel stays sharp at any size.
const FRAME_RADIUS = 0.492;
const BULB_RING = 0.461;
const FACE_RADIUS = 0.428;
const HUB_RADIUS = 0.1;
const BULB_COUNT = 24;
const MAX_DPR = 3;
const IDLE_FRAME_MS = 80;
const POINTER_KICK_MS = 170;
const HIGHLIGHT_FADE_MS = 320;
const MIN_LABEL_CSS_PX = 6.5;
const REDUCED_MOTION_SPIN_MS = 900;

export type WheelStageHandle = {
    spin: (index: number, power?: number) => void;
};

type WheelTheme = "light" | "dark";

type WheelStageProps = {
    segments: string[];
    winnerIndex: number | null;
    theme: WheelTheme;
    canSpin: boolean;
    hubLabel: string;
    wheelLabel: string;
    onRequestSpin: (power: number) => void;
    onTick: (intensity: number) => void;
    onPass: (index: number) => void;
    onSpinEnd: (index: number) => void;
};

type ActiveSpin = {
    from: number;
    to: number;
    startedAt: number;
    duration: number;
    index: number;
};

function makeLayer(size: number) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    return { canvas, ctx: canvas.getContext("2d") };
}

function drawFrame(size: number, theme: WheelTheme) {
    const { canvas, ctx } = makeLayer(size);
    if (!ctx) return canvas;
    const c = size / 2;
    const isLight = theme === "light";

    const body = ctx.createLinearGradient(0, 0, 0, size);
    body.addColorStop(0, isLight ? "#C4202D" : "#232a44");
    body.addColorStop(1, isLight ? "#7E0F19" : "#0d1120");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(c, c, size * FRAME_RADIUS, 0, TWO_PI);
    ctx.fill();

    const gold = ctx.createLinearGradient(0, 0, size, size);
    gold.addColorStop(0, "#FFE9A8");
    gold.addColorStop(0.35, "#C9962E");
    gold.addColorStop(0.55, "#FFE08A");
    gold.addColorStop(1, "#8F6516");
    ctx.strokeStyle = gold;

    ctx.lineWidth = size * 0.005;
    ctx.beginPath();
    ctx.arc(c, c, size * (FRAME_RADIUS - 0.003), 0, TWO_PI);
    ctx.stroke();

    ctx.lineWidth = size * 0.009;
    ctx.beginPath();
    ctx.arc(c, c, size * (FACE_RADIUS + 0.006), 0, TWO_PI);
    ctx.stroke();

    return canvas;
}

function drawFace(segments: string[], size: number, dpr: number, fontFamily: string, theme: WheelTheme) {
    const { canvas, ctx } = makeLayer(size);
    if (!ctx) return canvas;
    const c = size / 2;
    const r = size * FACE_RADIUS;
    const hasEntries = segments.length >= 2;
    const count = hasEntries ? segments.length : 8;
    const angle = TWO_PI / count;
    const startOf = (i: number) => -Math.PI / 2 + i * angle;

    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, r, startOf(i), startOf(i + 1));
        ctx.closePath();
        const emptyColors = theme === "light" ? ["#F3ECDC", "#E9DFC9"] : ["#222a45", "#1a2036"];
        ctx.fillStyle = hasEntries ? colorForSegment(i, count) : emptyColors[i % 2];
        ctx.fill();
    }

    // Depth: brighter around the middle, darker towards the rim.
    const depth = ctx.createRadialGradient(c, c, r * 0.15, c, c, r);
    depth.addColorStop(0, "rgba(255,255,255,0.14)");
    depth.addColorStop(0.62, "rgba(255,255,255,0)");
    depth.addColorStop(1, "rgba(0,0,0,0.26)");
    ctx.fillStyle = depth;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, TWO_PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = Math.max(1, size * 0.0022);
    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.lineTo(c + r * Math.cos(startOf(i)), c + r * Math.sin(startOf(i)));
        ctx.stroke();
    }

    if (!hasEntries) return canvas;

    // Pegs on the dividers; dropped when they would touch each other.
    if (count <= 48) {
        const pegRadius = size * 0.0062;
        const pegOrbit = r - size * 0.012;
        for (let i = 0; i < count; i++) {
            const x = c + pegOrbit * Math.cos(startOf(i));
            const y = c + pegOrbit * Math.sin(startOf(i));
            const peg = ctx.createRadialGradient(x - pegRadius / 3, y - pegRadius / 3, 0, x, y, pegRadius);
            peg.addColorStop(0, "#FFF4C9");
            peg.addColorStop(1, "#B98A25");
            ctx.fillStyle = peg;
            ctx.beginPath();
            ctx.arc(x, y, pegRadius, 0, TWO_PI);
            ctx.fill();
        }
    }

    // Labels run the same way on every segment and end at the rim.
    const outerEdge = r - size * 0.038;
    const innerEdge = size * HUB_RADIUS * 1.22;
    const available = outerEdge - innerEdge;
    const arcSpace = angle < Math.PI * 0.9 ? 2 * r * 0.72 * Math.tan(angle / 2) : Infinity;
    const baseFont = Math.min(size * 0.05, arcSpace * 0.62);
    if (baseFont < MIN_LABEL_CSS_PX * dpr) return canvas;

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    segments.forEach((label, i) => {
        ctx.font = `700 ${baseFont}px ${fontFamily}`;
        const fullWidth = ctx.measureText(label).width;
        const fontSize = baseFont * Math.max(0.72, Math.min(1, available / fullWidth));
        ctx.font = `700 ${fontSize}px ${fontFamily}`;

        let text = label;
        if (ctx.measureText(text).width > available) {
            while (text.length > 1 && ctx.measureText(`${text}…`).width > available) {
                text = text.slice(0, -1);
            }
            text = `${text.trimEnd()}…`;
        }

        ctx.save();
        ctx.translate(c, c);
        ctx.rotate(startOf(i) + angle / 2);
        const color = readableTextColor(colorForSegment(i, count));
        ctx.fillStyle = color;
        ctx.shadowColor = color === "#FFFFFF" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.25)";
        ctx.shadowBlur = size * 0.005;
        ctx.fillText(text, outerEdge, 0);
        ctx.restore();
    });

    return canvas;
}

/** Light on the wheel stays still while the wheel turns under it. */
function drawGloss(size: number) {
    const { canvas, ctx } = makeLayer(size);
    if (!ctx) return canvas;
    const c = size / 2;
    const r = size * FACE_RADIUS;
    const gloss = ctx.createRadialGradient(c - r * 0.35, c - r * 0.55, 0, c - r * 0.35, c - r * 0.55, r * 1.25);
    gloss.addColorStop(0, "rgba(255,255,255,0.2)");
    gloss.addColorStop(0.55, "rgba(255,255,255,0.03)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, TWO_PI);
    ctx.fill();
    return canvas;
}

function drawBulb(size: number, lit: boolean) {
    const { canvas, ctx } = makeLayer(size);
    if (!ctx) return canvas;
    const c = size / 2;
    if (lit) {
        const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
        glow.addColorStop(0, "rgba(255,240,190,1)");
        glow.addColorStop(0.26, "rgba(255,214,110,0.95)");
        glow.addColorStop(0.5, "rgba(255,180,60,0.28)");
        glow.addColorStop(1, "rgba(255,170,40,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);
    } else {
        ctx.fillStyle = "#6d5a33";
        ctx.beginPath();
        ctx.arc(c, c, size * 0.15, 0, TWO_PI);
        ctx.fill();
    }
    return canvas;
}

function drawPointer(ctx: CanvasRenderingContext2D, size: number, angle: number) {
    const c = size / 2;
    const pivotY = c - size * FRAME_RADIUS + size * 0.012;
    const length = size * 0.082;
    const halfWidth = size * 0.031;

    ctx.save();
    ctx.translate(c, pivotY);
    ctx.rotate(angle);
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = size * 0.012;
    ctx.shadowOffsetY = size * 0.005;

    ctx.beginPath();
    ctx.moveTo(-halfWidth, 0);
    ctx.quadraticCurveTo(0, -halfWidth * 1.35, halfWidth, 0);
    ctx.lineTo(0, length);
    ctx.closePath();
    const fill = ctx.createLinearGradient(-halfWidth, 0, halfWidth, 0);
    fill.addColorStop(0, "#F2F4FA");
    fill.addColorStop(0.5, "#FFFFFF");
    fill.addColorStop(1, "#BFC6DA");
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#D62839";
    ctx.beginPath();
    ctx.arc(0, size * 0.002, size * 0.012, 0, TWO_PI);
    ctx.fill();
    ctx.restore();
}

export const WheelStage = forwardRef<WheelStageHandle, WheelStageProps>(function WheelStage(props, ref) {
    const { segments, winnerIndex, theme, canSpin, hubLabel, wheelLabel, onRequestSpin } = props;
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const propsRef = useRef(props);
    const invalidateRef = useRef<() => void>(() => {});
    const rebuildRef = useRef<() => void>(() => {});
    const restyleRef = useRef<() => void>(() => {});
    const spinRef = useRef<WheelStageHandle["spin"]>(() => {});
    const gestureRef = useRef<{ x: number; y: number; at: number } | null>(null);

    useEffect(() => {
        propsRef.current = props;
    });

    useImperativeHandle(ref, () => ({ spin: (index, power) => spinRef.current(index, power) }), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !wrap || !ctx) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let px = 0;
        let dpr = 1;
        let rotation = 0;
        let spin: ActiveSpin | null = null;
        let lastBoundary = 0;
        let lastPassed = -1;
        let kickAt = -Infinity;
        let kickStrength = 0;
        let highlight = 0;
        let lastFrameAt = 0;
        let rafId = 0;
        let timerId = 0;
        let inView = true;
        let flashUntil = 0;
        let frame: HTMLCanvasElement | null = null;
        let face: HTMLCanvasElement | null = null;
        let gloss: HTMLCanvasElement | null = null;
        let bulbOn: HTMLCanvasElement | null = null;
        let bulbOff: HTMLCanvasElement | null = null;

        const rebuildFace = () => {
            if (!px) return;
            const fontFamily = getComputedStyle(canvas).fontFamily || "sans-serif";
            face = drawFace(propsRef.current.segments, px, dpr, fontFamily, propsRef.current.theme);
        };

        const resize = () => {
            const css = wrap.clientWidth;
            if (!css) return;
            dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
            px = Math.round(css * dpr);
            canvas.width = px;
            canvas.height = px;
            frame = drawFrame(px, propsRef.current.theme);
            gloss = drawGloss(px);
            const bulbSize = Math.round(px * 0.06);
            bulbOn = drawBulb(bulbSize, true);
            bulbOff = drawBulb(bulbSize, false);
            rebuildFace();
            invalidate();
        };

        const drawHighlight = (index: number, count: number, strength: number) => {
            const c = px / 2;
            const r = px * FACE_RADIUS;
            const angle = TWO_PI / count;
            const from = -Math.PI / 2 + index * angle;

            const veil = propsRef.current.theme === "light" ? "255,250,240" : "6,8,18";
            ctx.fillStyle = `rgba(${veil},${(propsRef.current.theme === "light" ? 0.74 : 0.66) * strength})`;
            ctx.beginPath();
            ctx.moveTo(c, c);
            ctx.arc(c, c, r, from + angle, from + TWO_PI);
            ctx.closePath();
            ctx.fill();

            ctx.save();
            ctx.strokeStyle = `rgba(255,224,138,${strength})`;
            ctx.lineWidth = px * 0.008;
            ctx.lineJoin = "round";
            ctx.shadowColor = "rgba(255,200,80,0.9)";
            ctx.shadowBlur = px * 0.03 * strength;
            ctx.beginPath();
            ctx.moveTo(c, c);
            ctx.arc(c, c, r - ctx.lineWidth / 2, from, from + angle);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        };

        const paint = (now: number) => {
            if (!px || !frame || !face || !gloss || !bulbOn || !bulbOff) return;
            const c = px / 2;
            ctx.clearRect(0, 0, px, px);
            ctx.drawImage(frame, 0, 0);

            ctx.save();
            ctx.translate(c, c);
            ctx.rotate(rotation);
            ctx.translate(-c, -c);
            ctx.drawImage(face, 0, 0);
            const { winnerIndex: winner, segments: segs } = propsRef.current;
            if (winner !== null && highlight > 0 && segs.length >= 2) {
                drawHighlight(winner, segs.length, highlight);
            }
            ctx.restore();

            ctx.drawImage(gloss, 0, 0);

            const flashing = now < flashUntil;
            const chase = reducedMotion ? 0 : Math.floor(now / (spin ? 70 : 240));
            const bulbSize = bulbOn.width;
            for (let i = 0; i < BULB_COUNT; i++) {
                const a = (i / BULB_COUNT) * TWO_PI;
                const x = c + px * BULB_RING * Math.cos(a) - bulbSize / 2;
                const y = c + px * BULB_RING * Math.sin(a) - bulbSize / 2;
                const lit = flashing ? Math.floor(now / 130) % 2 === 0 : (i + chase) % 3 !== 0;
                ctx.drawImage(lit ? bulbOn : bulbOff, x, y);
            }

            const sinceKick = now - kickAt;
            const kick =
                sinceKick < POINTER_KICK_MS
                    ? kickStrength * Math.exp(-sinceKick / 60) * Math.cos(sinceKick / 24)
                    : 0;
            drawPointer(ctx, px, kick * 0.42);
        };

        const finishSpin = (active: ActiveSpin, now: number) => {
            spin = null;
            flashUntil = now + 1300;
            propsRef.current.onSpinEnd(active.index);
        };

        const advanceSpin = (now: number) => {
            if (!spin) return;
            const t = Math.min(1, (now - spin.startedAt) / spin.duration);
            rotation = spin.from + (spin.to - spin.from) * easeOutSpin(t);

            const count = propsRef.current.segments.length;
            const boundary = Math.floor(rotation / (TWO_PI / count));
            if (boundary !== lastBoundary) {
                lastBoundary = boundary;
                kickAt = now;
                kickStrength = 0.45 + (1 - t) * 0.55;
                propsRef.current.onTick(1 - t);
            }

            const passed = segmentAtRotation(rotation, count);
            if (passed !== lastPassed) {
                lastPassed = passed;
                propsRef.current.onPass(passed);
            }

            if (t >= 1) finishSpin(spin, now);
        };

        const advanceHighlight = (delta: number) => {
            const wanted = propsRef.current.winnerIndex !== null ? 1 : 0;
            if (highlight === wanted) return;
            const step = reducedMotion ? 1 : delta / HIGHLIGHT_FADE_MS;
            highlight = wanted ? Math.min(1, highlight + step) : Math.max(0, highlight - step);
        };

        const needsFullSpeed = (now: number) => {
            const wanted = propsRef.current.winnerIndex !== null ? 1 : 0;
            return Boolean(spin) || highlight !== wanted || now - kickAt < POINTER_KICK_MS || now < flashUntil;
        };

        const onFrame = (now: number) => {
            rafId = 0;
            const delta = lastFrameAt ? now - lastFrameAt : 16;
            lastFrameAt = now;
            advanceSpin(now);
            advanceHighlight(delta);
            paint(now);
            schedule(now);
        };

        const requestFrame = () => {
            if (!rafId) rafId = requestAnimationFrame(onFrame);
        };

        const schedule = (now: number) => {
            if (needsFullSpeed(now)) {
                requestFrame();
                return;
            }
            // Idle: slow light chase only while visible, to save the phone's battery.
            if (reducedMotion || !inView || document.hidden || timerId) return;
            timerId = window.setTimeout(() => {
                timerId = 0;
                requestFrame();
            }, IDLE_FRAME_MS);
        };

        const invalidate = () => {
            if (timerId) {
                clearTimeout(timerId);
                timerId = 0;
            }
            requestFrame();
        };

        invalidateRef.current = invalidate;
        restyleRef.current = resize;
        rebuildRef.current = () => {
            rebuildFace();
            invalidate();
        };

        spinRef.current = (index, power = 0.55) => {
            const count = propsRef.current.segments.length;
            if (spin || count < 2) return;
            const plan = spinPlan(power);
            spin = {
                from: rotation,
                to: computeSpinTarget(rotation, index, count, plan.fullSpins, Math.random()),
                startedAt: performance.now(),
                duration: reducedMotion ? REDUCED_MOTION_SPIN_MS : plan.durationMs,
                index,
            };
            lastBoundary = Math.floor(rotation / (TWO_PI / count));
            lastPassed = -1;
            invalidate();
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(wrap);

        const viewObserver = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) invalidate();
        });
        viewObserver.observe(wrap);

        const onVisibility = () => {
            if (!document.hidden) invalidate();
        };
        document.addEventListener("visibilitychange", onVisibility);

        // Labels drawn before the web font loads use a fallback font, so redraw once it arrives.
        let cancelled = false;
        void document.fonts?.ready.then(() => {
            if (!cancelled) rebuildRef.current();
        });

        resize();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            clearTimeout(timerId);
            resizeObserver.disconnect();
            viewObserver.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            invalidateRef.current = () => {};
            rebuildRef.current = () => {};
            restyleRef.current = () => {};
            spinRef.current = () => {};
        };
    }, []);

    useEffect(() => {
        rebuildRef.current();
    }, [segments]);

    useEffect(() => {
        restyleRef.current();
    }, [theme]);

    useEffect(() => {
        invalidateRef.current();
    }, [winnerIndex]);

    const onPointerDown = (e: React.PointerEvent) => {
        gestureRef.current = { x: e.clientX, y: e.clientY, at: e.timeStamp };
    };

    const onPointerUp = (e: React.PointerEvent) => {
        const start = gestureRef.current;
        gestureRef.current = null;
        if (!start || !canSpin) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const distance = Math.hypot(dx, dy);
        const elapsed = Math.max(1, e.timeStamp - start.at);

        if (distance < 10 && elapsed < 400) {
            onRequestSpin(0.5);
        } else if (distance >= 24 && elapsed < 700) {
            onRequestSpin(Math.min(1, distance / elapsed / 1.6));
        }
    };

    return (
        <div
            ref={wrapRef}
            className="relative aspect-square w-full [container-type:inline-size] touch-pan-y select-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
                gestureRef.current = null;
            }}
        >
            {/* Drawn in CSS because a shadow on the canvas would be cut off at its square edge. */}
            <div
                aria-hidden="true"
                className="absolute inset-[0.8%] rounded-full shadow-[0_10px_28px_rgba(90,50,20,0.38)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.6)]"
            />
            {/* The hub is the accessible control; the canvas is decoration for assistive tech. */}
            <canvas
                ref={canvasRef}
                role="img"
                aria-label={wheelLabel}
                className={`absolute inset-0 h-full w-full font-sans ${canSpin ? "cursor-pointer" : ""}`}
            />
            <button
                type="button"
                disabled={!canSpin}
                // The wheel's pointer handlers already treat a press here as a tap;
                // onClick covers keyboard users, whose presses have detail === 0.
                onClick={(e) => {
                    if (e.detail === 0) onRequestSpin(0.5);
                }}
                className="absolute left-1/2 top-1/2 flex aspect-square w-[21%] min-w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[3px] border-[#D9AE4F] bg-[radial-gradient(circle_at_35%_28%,#ffffff_0%,#F3ECDC_75%)] px-1 text-center font-heading text-[clamp(10px,3.5cqw,17px)] font-extrabold uppercase leading-none tracking-wide text-[#B61722] shadow-[0_6px_18px_rgba(90,50,20,0.4),inset_0_1px_0_rgba(255,255,255,0.8)] transition-transform duration-150 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#14161F]/50 active:scale-95 disabled:cursor-default disabled:text-[#14161F]/35 disabled:hover:scale-100 dark:border-[#E7C26A] dark:bg-[radial-gradient(circle_at_35%_28%,#3a4468_0%,#141a2e_70%)] dark:text-white dark:shadow-[0_6px_18px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.3)] dark:focus-visible:ring-white/80 dark:disabled:text-white/40"
            >
                {hubLabel}
            </button>
        </div>
    );
});
