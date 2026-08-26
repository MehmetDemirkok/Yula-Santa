"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    ArrowLeft,
    RefreshCw,
    Shuffle,
    SortAsc,
    Trash2,
    Plus,
    Edit3,
    X,
    List,
    Volume2,
    VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { secureRandomInt, secureShuffle } from "@/lib/random";
import { celebrate } from "@/lib/celebrate";

// Festive palette built from the site's own brand tokens (santa-red, christmas-green,
// gold, indigo-accent) plus supporting shades — keeps the wheel "on theme" instead of
// a generic rainbow, while still giving enough contrast between adjacent segments.
const COLORS = [
    "#C41E3A", "#1B7A3D", "#E0A100", "#4F46E5",
    "#8B1E3F", "#2F9E5C", "#C97F00", "#6D28D9",
    "#E0483F", "#0F5132", "#F5C030", "#3730A3",
];

// ─── World-space geometry constants (three.js units) ───────────────────────
const R = 5; // wheel radius
const THICKNESS = 0.55;
const POINTER_ANGLE = Math.PI / 2; // fixed pointer sits at 12 o'clock (world "up")
const TWO_PI = Math.PI * 2;
const BULB_COUNT = 28;
const BULB_RADIUS = R + 0.85;
const CAMERA_FOV = 32;
// Everything that must always stay fully on-screen (backboard + trim + bulbs),
// with a little breathing room so the rig never touches the frame edge.
const VISUAL_RADIUS = 6.6;

// Camera distance along Z that keeps a circle of VISUAL_RADIUS fully inside the
// frustum for a given viewport aspect ratio — recomputed on every resize so the
// wheel/cabinet never gets clipped by its own container, on any screen size.
function computeCameraDistance(aspect: number): number {
    const vFovRad = (CAMERA_FOV * Math.PI) / 180;
    const base = VISUAL_RADIUS / Math.tan(vFovRad / 2);
    return base * Math.max(1, 1 / aspect);
}

// ─── Canvas texture for the wheel face ──────────────────────────────────────
// Convention: a "world angle" theta (0 = +x/right, increasing counter-clockwise,
// matching standard math / three.js Y-up) maps onto the canvas via
//   canvasX = cx + r*cos(theta),  canvasY = cy - r*sin(theta)
// This is exactly how a THREE.PlaneGeometry (facing +Z, no rotation) samples its
// texture, so anything drawn here lines up 1:1 with 3D objects (pegs, hub) placed
// at the same theta in the wheel's local space.
function createWheelTexture(segments: string[]): THREE.CanvasTexture | null {
    const S = 1400;
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const cx = S / 2;
    const cy = S / 2;
    const outerPx = S / 2 - 4;
    const scale = outerPx / R;
    const n = segments.length;
    const segAngle = TWO_PI / n;

    const toCanvas = (theta: number, rWorld: number): [number, number] => [
        cx + rWorld * scale * Math.cos(theta),
        cy - rWorld * scale * Math.sin(theta),
    ];

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerPx, 0, TWO_PI);
    ctx.clip();

    // Segments
    for (let i = 0; i < n; i++) {
        const theta0 = i * segAngle;
        const theta1 = (i + 1) * segAngle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const steps = Math.max(2, Math.ceil((theta1 - theta0) / (Math.PI / 90)));
        for (let s = 0; s <= steps; s++) {
            const t = theta0 + ((theta1 - theta0) * s) / steps;
            const [x, y] = toCanvas(t, R + 0.1);
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
    }

    // Subtle radial shading for depth (glossy center → darker rim)
    const shade = ctx.createRadialGradient(cx, cy, outerPx * 0.1, cx, cy, outerPx);
    shade.addColorStop(0, "rgba(255,255,255,0.16)");
    shade.addColorStop(0.55, "rgba(255,255,255,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, S, S);

    // Divider lines
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineCap = "round";
    for (let i = 0; i < n; i++) {
        const theta = i * segAngle;
        const [x1, y1] = toCanvas(theta, R * 0.05);
        const [x2, y2] = toCanvas(theta, R + 0.1);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Center cap ring (hub sits on top of this, keeps texture tidy at core)
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.16 * scale, 0, TWO_PI);
    ctx.fillStyle = "rgba(20,15,10,0.35)";
    ctx.fill();

    // Labels — radial text, auto-flipped so it never renders upside down
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    segments.forEach((label, i) => {
        const thetaMid = i * segAngle + segAngle / 2;
        const fontSize = n > 20 ? 32 : n > 14 ? 40 : n > 8 ? 48 : 58;
        ctx.font = `700 ${fontSize}px Inter, sans-serif`;
        const maxChars = n > 20 ? 9 : n > 14 ? 12 : n > 8 ? 15 : 18;
        const text = label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-thetaMid);
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        const flip = Math.cos(thetaMid) < 0;
        if (flip) {
            ctx.rotate(Math.PI);
            ctx.textAlign = "left";
            ctx.fillText(text, -(outerPx - 34), 0);
        } else {
            ctx.textAlign = "right";
            ctx.fillText(text, outerPx - 34, 0);
        }
        ctx.restore();
    });

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
}

// ─── Lightweight synth for peg-tick clicks + win chime ──────────────────────
function createWheelAudio() {
    let ctx: AudioContext | null = null;
    const ensure = () => {
        if (!ctx) ctx = new AudioContext();
        if (ctx.state === "suspended") void ctx.resume();
        return ctx;
    };

    const tick = (intensity = 0.6) => {
        try {
            const ac = ensure();
            const t0 = ac.currentTime;
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(1400 + intensity * 400, t0);
            osc.frequency.exponentialRampToValueAtTime(600, t0 + 0.035);
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(0.09 * intensity, t0 + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(t0);
            osc.stop(t0 + 0.06);
        } catch {
            /* audio optional */
        }
    };

    const win = () => {
        try {
            const ac = ensure();
            const t0 = ac.currentTime;
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                const start = t0 + i * 0.09;
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.09, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
                osc.connect(gain);
                gain.connect(ac.destination);
                osc.start(start);
                osc.stop(start + 0.55);
            });
        } catch {
            /* optional */
        }
    };

    return { tick, win, dispose: () => void ctx?.close() };
}

type SceneRefs = {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    wheelGroup: THREE.Group;
    fixedRig: THREE.Group;
    wheelFace: THREE.Mesh;
    pegsGroup: THREE.Group;
    flapperPivot: THREE.Group;
    bulbs: THREE.Mesh[];
    cameraBase: THREE.Vector3;
    lastFlickTime: number;
    winFlashUntil: number;
    cleanup: () => void;
};

export function WheelClient() {
    const t = useTranslations("tools.wheelOfFortuneContent");
    const router = useRouter();

    // Core data
    const [segments, setSegments] = useState<string[]>([]);

    // UI States
    const [newName, setNewName] = useState("");
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [soundOn, setSoundOn] = useState(true);
    const [sceneReady, setSceneReady] = useState(false);

    // Wheel States
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SceneRefs | null>(null);
    const segmentsRef = useRef<string[]>(segments);
    const rotationRef = useRef(0);
    const isSpinningRef = useRef(false);
    const soundOnRef = useRef(true);
    const reducedMotionRef = useRef(false);
    const audioRef = useRef(createWheelAudio());
    const spinFrameRef = useRef<number | null>(null);

    segmentsRef.current = segments;
    soundOnRef.current = soundOn;

    // Sync bulk text when entering bulk mode
    useEffect(() => {
        if (isBulkMode) setBulkText(segments.join("\n"));
    }, [isBulkMode, segments]);

    useEffect(() => {
        reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    // ── Scene init (runs once) ───────────────────────────────────────────────
    useEffect(() => {
        if (!canvasRef.current) return;
        let resizeObserver: ResizeObserver | null = null;
        let animationFrameId: number | null = null;

        const initScene = () => {
            if (!canvasRef.current) return;
            const width = canvasRef.current.clientWidth;
            const height = canvasRef.current.clientHeight;
            if (width === 0 || height === 0) return;
            if (sceneRef.current) sceneRef.current.cleanup();
            Array.from(canvasRef.current.querySelectorAll("canvas")).forEach((el) => el.remove());

            const scene = new THREE.Scene();

            const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 100);
            const cameraBase = new THREE.Vector3(0, 0.4, computeCameraDistance(width / height));
            camera.position.copy(cameraBase);
            camera.lookAt(0, 0.1, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.08;
            renderer.domElement.style.display = "block";
            renderer.domElement.style.width = "100%";
            renderer.domElement.style.height = "100%";
            canvasRef.current.appendChild(renderer.domElement);

            // Lighting
            scene.add(new THREE.AmbientLight(0xfff2e0, 0.8));
            const key = new THREE.DirectionalLight(0xfff6e8, 1.4);
            key.position.set(3, 6, 10);
            scene.add(key);
            const fill = new THREE.PointLight(0xbcd9ff, 0.4, 40);
            fill.position.set(-8, 2, 6);
            scene.add(fill);
            const rimLight = new THREE.PointLight(0xffd27a, 0.7, 40);
            rimLight.position.set(0, 3, -4);
            scene.add(rimLight);
            // Broad front light near the camera axis — gives the gold metal parts
            // (rim/hub/pegs) a reliable specular sweep instead of appearing flat/dark
            const frontLight = new THREE.PointLight(0xfff0d8, 1.1, 60);
            frontLight.position.set(0, 1.5, 16);
            scene.add(frontLight);

            // Fixed rig: everything that stays still while the wheel spins
            // (backboard, stand, marquee bulbs, flapper mount). Grouped so it can be
            // hidden as one unit in the empty state instead of leaving a stray dark
            // disc floating on the backdrop.
            const fixedRig = new THREE.Group();
            scene.add(fixedRig);

            // Backboard — warm bronze tone so it reads as an intentional cabinet
            // panel in both light and dark page themes, never a flat black hole.
            const backboard = new THREE.Mesh(
                new THREE.CylinderGeometry(R + 1.05, R + 1.05, 0.18, 72),
                new THREE.MeshStandardMaterial({
                    color: 0x7a4a3a,
                    metalness: 0.25,
                    roughness: 0.6,
                    emissive: 0x3a1f16,
                    emissiveIntensity: 0.45,
                })
            );
            backboard.rotation.x = Math.PI / 2;
            backboard.position.z = -THICKNESS / 2 - 0.15;
            fixedRig.add(backboard);

            // Thin gold trim ring around the backboard edge, ties it visually to the
            // wheel's rim/hub/peg gold accents instead of looking like a bare cutout.
            const backboardTrim = new THREE.Mesh(
                new THREE.TorusGeometry(R + 1.05, 0.05, 12, 96),
                new THREE.MeshStandardMaterial({
                    color: 0xe9d18a,
                    metalness: 0.5,
                    roughness: 0.4,
                    emissive: 0x4a3512,
                    emissiveIntensity: 0.3,
                })
            );
            backboardTrim.position.z = -THICKNESS / 2 - 0.06;
            fixedRig.add(backboardTrim);

            // Stand
            const standMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, metalness: 0.15, roughness: 0.6 });
            const pole = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.4, 0.9), standMat);
            pole.position.set(0, -(R + 1.05) - 1.5, -THICKNESS / 2 - 0.35);
            fixedRig.add(pole);
            const foot = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 1.6), standMat);
            foot.position.set(0, -(R + 1.05) - 3.05, -THICKNESS / 2 - 0.2);
            fixedRig.add(foot);

            // Marquee bulbs
            const bulbGeo = new THREE.SphereGeometry(0.1, 10, 10);
            const bulbs: THREE.Mesh[] = [];
            for (let i = 0; i < BULB_COUNT; i++) {
                const angle = (i / BULB_COUNT) * TWO_PI;
                const mat = new THREE.MeshStandardMaterial({
                    color: 0xffdca0,
                    emissive: 0xffb347,
                    emissiveIntensity: 0.4,
                    roughness: 0.4,
                });
                const bulb = new THREE.Mesh(bulbGeo, mat);
                bulb.position.set(BULB_RADIUS * Math.cos(angle), BULB_RADIUS * Math.sin(angle), -THICKNESS / 2 - 0.02);
                fixedRig.add(bulb);
                bulbs.push(bulb);
            }

            // Rotating wheel group
            const wheelGroup = new THREE.Group();
            scene.add(wheelGroup);

            // Drum (side + back of the wheel body)
            const drum = new THREE.Mesh(
                new THREE.CylinderGeometry(R, R, THICKNESS, 96),
                new THREE.MeshStandardMaterial({ color: 0xd8c9a3, metalness: 0.25, roughness: 0.55 })
            );
            drum.rotation.x = Math.PI / 2;
            wheelGroup.add(drum);

            // Front face (textured plane, rebuilt whenever segments change)
            const wheelFace = new THREE.Mesh(
                new THREE.PlaneGeometry(R * 2, R * 2),
                new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.45, metalness: 0.05, transparent: true })
            );
            wheelFace.position.z = THICKNESS / 2 + 0.005;
            wheelGroup.add(wheelFace);

            // Metal rim
            const rim = new THREE.Mesh(
                new THREE.TorusGeometry(R, 0.16, 16, 96),
                new THREE.MeshStandardMaterial({
                    color: 0xe9d18a,
                    metalness: 0.55,
                    roughness: 0.35,
                    emissive: 0x4a3512,
                    emissiveIntensity: 0.35,
                })
            );
            rim.position.z = THICKNESS / 2;
            wheelGroup.add(rim);

            // Pegs (rebuilt on segment change)
            const pegsGroup = new THREE.Group();
            wheelGroup.add(pegsGroup);

            // Hub
            const hubMat = new THREE.MeshStandardMaterial({
                color: 0xf0d98c,
                metalness: 0.55,
                roughness: 0.35,
                emissive: 0x4a3512,
                emissiveIntensity: 0.4,
            });
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, THICKNESS + 0.45, 32), hubMat);
            hub.rotation.x = Math.PI / 2;
            wheelGroup.add(hub);
            const hubCap = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20, 0, TWO_PI, 0, Math.PI / 2), hubMat);
            hubCap.rotation.x = -Math.PI / 2;
            hubCap.position.z = THICKNESS / 2 + 0.225;
            wheelGroup.add(hubCap);

            // Fixed flapper (clicks against pegs as the wheel spins)
            const flapperPivot = new THREE.Group();
            flapperPivot.position.set(0, R + 0.02, THICKNESS / 2 + 0.18);
            flapperPivot.rotation.z = -0.55;
            fixedRig.add(flapperPivot);
            const flapArm = new THREE.Mesh(
                new THREE.BoxGeometry(0.14, 0.62, 0.06),
                new THREE.MeshStandardMaterial({ color: 0x2b2016, roughness: 0.85, metalness: 0.05 })
            );
            flapArm.position.y = -0.31;
            flapperPivot.add(flapArm);
            const mountPost = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.7, 0.12),
                new THREE.MeshStandardMaterial({ color: 0x1c1c22, metalness: 0.5, roughness: 0.5 })
            );
            mountPost.position.set(0, R + 0.5, THICKNESS / 2 + 0.05);
            fixedRig.add(mountPost);

            let idleT = 0;
            const animate = () => {
                const now = performance.now();
                const s = sceneRef.current;
                if (s) {
                    // Idle camera parallax sway
                    if (!isSpinningRef.current && !reducedMotionRef.current) {
                        idleT += 0.006;
                        camera.position.set(
                            s.cameraBase.x + Math.sin(idleT) * 0.5,
                            s.cameraBase.y + Math.sin(idleT * 0.7) * 0.2,
                            s.cameraBase.z
                        );
                        camera.lookAt(0, 0.1, 0);
                    }

                    // Marquee chase lights
                    const flashLeft = s.winFlashUntil - now;
                    s.bulbs.forEach((bulb, i) => {
                        const mat = bulb.material as THREE.MeshStandardMaterial;
                        if (flashLeft > 0) {
                            mat.emissiveIntensity = 1.6 + Math.sin(now * 0.03 + i) * 0.4;
                        } else {
                            const phase = now * 0.004 - i * 0.35;
                            mat.emissiveIntensity = 0.35 + Math.max(0, Math.sin(phase)) * 0.55;
                        }
                    });

                    // Flapper spring-back after a tick
                    const sinceFlick = now - s.lastFlickTime;
                    const flickT = Math.min(1, sinceFlick / 220);
                    const kick = Math.sin(flickT * Math.PI) * Math.exp(-flickT * 3);
                    s.flapperPivot.rotation.z = -0.55 + kick * 0.55;
                }

                renderer.render(scene, camera);
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();

            const cleanup = () => {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                renderer.dispose();
                (wheelFace.material as THREE.MeshStandardMaterial).map?.dispose();
                if (canvasRef.current?.contains(renderer.domElement)) {
                    canvasRef.current.removeChild(renderer.domElement);
                }
                setSceneReady(false);
            };

            sceneRef.current = {
                scene,
                camera,
                renderer,
                wheelGroup,
                fixedRig,
                wheelFace,
                pegsGroup,
                flapperPivot,
                bulbs,
                cameraBase,
                lastFlickTime: 0,
                winFlashUntil: 0,
                cleanup,
            };
            setSceneReady(true);
            rebuildWheel(segmentsRef.current);
        };

        resizeObserver = new ResizeObserver(() => {
            if (sceneRef.current) {
                if (!canvasRef.current) return;
                const w = canvasRef.current.clientWidth;
                const h = canvasRef.current.clientHeight;
                if (w === 0 || h === 0) return;
                const aspect = w / h;
                sceneRef.current.camera.aspect = aspect;
                sceneRef.current.cameraBase.z = computeCameraDistance(aspect);
                sceneRef.current.camera.position.z = sceneRef.current.cameraBase.z;
                sceneRef.current.camera.updateProjectionMatrix();
                sceneRef.current.renderer.setSize(w, h);
            } else {
                initScene();
            }
        });
        if (canvasRef.current) resizeObserver.observe(canvasRef.current);

        return () => {
            if (spinFrameRef.current) cancelAnimationFrame(spinFrameRef.current);
            if (resizeObserver) resizeObserver.disconnect();
            if (sceneRef.current) sceneRef.current.cleanup();
            sceneRef.current = null;
            audioRef.current.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Rebuild the wheel face + pegs whenever the segment list changes ─────
    const rebuildWheel = useCallback((segs: string[]) => {
        const s = sceneRef.current;
        if (!s) return;

        const mat = s.wheelFace.material as THREE.MeshStandardMaterial;
        mat.map?.dispose();

        // Clear old pegs
        while (s.pegsGroup.children.length) {
            const child = s.pegsGroup.children.pop()!;
            (child as THREE.Mesh).geometry.dispose();
            ((child as THREE.Mesh).material as THREE.Material).dispose();
        }

        if (segs.length < 2) {
            mat.map = null;
            mat.needsUpdate = true;
            s.wheelGroup.visible = false;
            s.fixedRig.visible = false;
            return;
        }

        s.wheelGroup.visible = true;
        s.fixedRig.visible = true;
        const tex = createWheelTexture(segs);
        mat.map = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;

        const n = segs.length;
        const segAngle = TWO_PI / n;
        const pegGeo = new THREE.CylinderGeometry(0.085, 0.1, 0.36, 10);
        const pegMat = new THREE.MeshStandardMaterial({
            color: 0xe8c874,
            metalness: 0.55,
            roughness: 0.35,
            emissive: 0x4a3512,
            emissiveIntensity: 0.35,
        });
        for (let i = 0; i < n; i++) {
            const theta = i * segAngle;
            const peg = new THREE.Mesh(pegGeo, pegMat);
            peg.rotation.x = Math.PI / 2;
            peg.position.set(R * Math.cos(theta), R * Math.sin(theta), THICKNESS / 2 + 0.18);
            s.pegsGroup.add(peg);
        }
    }, []);

    useEffect(() => {
        if (sceneReady) rebuildWheel(segments);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [segments, sceneReady]);

    // ── List management ──────────────────────────────────────────────────────
    const handleAddName = () => {
        if (newName.trim()) {
            setSegments([...segments, newName.trim()]);
            setNewName("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddName();
        }
    };

    const removeSegment = (index: number) => {
        setSegments(segments.filter((_, i) => i !== index));
    };

    const saveBulk = () => {
        const newSegments = bulkText.split("\n").filter((line) => line.trim() !== "");
        setSegments(newSegments);
        setIsBulkMode(false);
    };

    const shuffleSegments = () => setSegments(secureShuffle(segments));
    const sortSegments = () => setSegments([...segments].sort((a, b) => a.localeCompare(b)));

    const removeWinner = () => {
        if (!winner) return;
        setSegments(segments.filter((s) => s !== winner));
        setWinner(null);
    };

    // ── Spin ──────────────────────────────────────────────────────────────────
    const spinWheel = useCallback(() => {
        const s = sceneRef.current;
        const segs = segmentsRef.current;
        if (isSpinningRef.current || segs.length < 2 || !s) return;

        isSpinningRef.current = true;
        setIsSpinning(true);
        setWinner(null);

        const n = segs.length;
        const segAngle = TWO_PI / n;
        const winningIndex = secureRandomInt(n);

        const segStart = winningIndex * segAngle;
        const padding = segAngle * 0.18;
        const thetaLocal = segStart + padding + Math.random() * (segAngle - 2 * padding);

        let deltaTarget = (POINTER_ANGLE - thetaLocal) % TWO_PI;
        if (deltaTarget < 0) deltaTarget += TWO_PI;

        const startRotation = rotationRef.current;
        const currentMod = ((startRotation % TWO_PI) + TWO_PI) % TWO_PI;
        const extraSpins = (9 + Math.floor(Math.random() * 5)) * TWO_PI;
        const targetRotation = startRotation + extraSpins + deltaTarget - currentMod;

        const duration = reducedMotionRef.current ? 900 : 5200 + Math.random() * 700;
        const startTime = performance.now();

        const ticksAt = (r: number) => Math.floor((r - POINTER_ANGLE) / segAngle);
        let lastTick = ticksAt(startRotation);

        const ease = (t: number) => 1 - Math.pow(1 - t, 4.2);

        const step = (now: number) => {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            const eased = ease(t);
            const r = startRotation + (targetRotation - startRotation) * eased;
            s.wheelGroup.rotation.z = r;
            rotationRef.current = r;

            const currentTick = ticksAt(r);
            if (currentTick !== lastTick) {
                lastTick = currentTick;
                s.lastFlickTime = now;
                if (soundOnRef.current) audioRef.current.tick(0.4 + (1 - t) * 0.6);
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(5);
            }

            if (t < 1) {
                spinFrameRef.current = requestAnimationFrame(step);
            } else {
                spinFrameRef.current = null;
                isSpinningRef.current = false;
                setIsSpinning(false);
                setWinner(segs[winningIndex]);
                s.winFlashUntil = performance.now() + 1000;
                if (soundOnRef.current) audioRef.current.win();
                celebrate({ colors: COLORS });
            }
        };

        spinFrameRef.current = requestAnimationFrame(step);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code !== "Space") return;
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
            e.preventDefault();
            spinWheel();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [spinWheel]);

    return (
        <div className="ys-page-shell py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-900/10" />
                <div className="absolute -bottom-40 left-[-12%] h-[460px] w-[460px] rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-900/10" />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("backToTools")}
                    </Button>
                    <button
                        type="button"
                        onClick={() => setSoundOn((v) => !v)}
                        className="rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] p-2.5 text-[var(--text-secondary)] transition hover:border-indigo-accent/30 hover:text-indigo-accent"
                        aria-label={soundOn ? t("soundOn") : t("soundOff")}
                        title={soundOn ? t("soundOn") : t("soundOff")}
                    >
                        {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>

                <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] mb-1 tracking-tight">
                    {t("title")}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mb-6">{t("subtitle")}</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Controls Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="ys-card p-6 flex flex-col h-[480px]">
                            <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">{t("listMode")}</span>
                                <span className="ys-chip ys-chip-indigo">{segments.length}</span>
                            </h2>

                            {/* Mode Toggle */}
                            <div className="flex bg-[var(--surface-2)] p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => setIsBulkMode(false)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!isBulkMode ? "bg-[var(--card-bg)] shadow-sm text-indigo-accent" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
                                >
                                    <List className="w-4 h-4 inline-block mr-1.5" />
                                    {t("listMode")}
                                </button>
                                <button
                                    onClick={() => setIsBulkMode(true)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${isBulkMode ? "bg-[var(--card-bg)] shadow-sm text-indigo-accent" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
                                >
                                    <Edit3 className="w-4 h-4 inline-block mr-1.5" />
                                    {t("bulkMode")}
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 flex flex-col min-h-0">
                                {isBulkMode ? (
                                    <div className="flex-1 flex flex-col">
                                        <textarea
                                            value={bulkText}
                                            onChange={(e) => setBulkText(e.target.value)}
                                            placeholder={t("placeholder")}
                                            className="flex-1 w-full p-4 rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-0 focus:border-indigo-accent focus:outline-none resize-none font-medium mb-4 text-sm leading-relaxed"
                                        />
                                        <Button onClick={saveBulk} variant="secondary" className="w-full">
                                            {t("applyChanges")}
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2 mb-4">
                                            <Input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t("addName")}
                                                className="flex-1 h-auto py-2 focus:border-indigo-accent"
                                            />
                                            <Button onClick={handleAddName} className="shrink-0 aspect-square p-0 sm:p-0 w-10 h-10">
                                                <Plus className="w-5 h-5 shrink-0" />
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
                                            {segments.length === 0 ? (
                                                <div className="text-center text-[var(--text-muted)] py-8 text-sm italic">
                                                    {t("placeholder")}
                                                </div>
                                            ) : (
                                                segments.map((segment, idx) => (
                                                    <div key={idx} className="group flex items-center justify-between bg-[var(--surface-2)] p-3 rounded-lg border border-[var(--border-light)] hover:border-indigo-accent/30 transition-colors">
                                                        <span className="font-medium text-[var(--text-secondary)] truncate mr-2 text-sm">
                                                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                            {segment}
                                                        </span>
                                                        <button
                                                            onClick={() => removeSegment(idx)}
                                                            className="text-[var(--text-muted)] hover:text-santa-red p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 mt-auto border-t border-[var(--border-light)] grid grid-cols-2 gap-2">
                                <Button onClick={shuffleSegments} variant="outline" size="sm" className="w-full">
                                    <Shuffle className="w-3 h-3 mr-2" />
                                    {t("shuffle")}
                                </Button>
                                <Button onClick={sortSegments} variant="outline" size="sm" className="w-full">
                                    <SortAsc className="w-3 h-3 mr-2" />
                                    {t("sort")}
                                </Button>
                                <Button
                                    onClick={() => setSegments([])}
                                    variant="outline"
                                    size="sm"
                                    className="col-span-2 text-santa-red hover:text-santa-red hover:bg-santa-red/10 border-santa-red/20"
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    {t("clear")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Wheel Section */}
                    <div className="lg:col-span-2 flex flex-col ys-card overflow-hidden">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#f3ead2_0%,#e6d7ab_55%,#d6c48c_100%)] dark:bg-[radial-gradient(ellipse_at_50%_35%,#241b33_0%,#100a1c_55%,#07050c_100%)]" />
                            {/* Soft spotlight glow behind the wheel — gives the stage depth even before it's populated */}
                            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(255,220,150,0.16)_0%,rgba(255,220,150,0)_70%)]" />
                            <div ref={canvasRef} className="relative h-[360px] sm:h-[440px] md:h-[480px] w-full" />

                            <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-14 bg-gradient-to-b from-black/10 dark:from-black/30 to-transparent" />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-t from-black/15 dark:from-black/40 to-transparent" />

                            {!sceneReady && (
                                <div className="absolute inset-0 z-[3] flex items-center justify-center">
                                    <span className="animate-pulse text-sm font-medium text-black/50 dark:text-indigo-100/50">{t("wheelReady")}…</span>
                                </div>
                            )}

                            {segments.length < 2 && sceneReady && (
                                <div className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none p-6">
                                    <div className="flex aspect-square h-[78%] max-h-full flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed border-black/15 dark:border-white/15 px-6 text-center">
                                        <RefreshCw className="w-10 h-10 text-black/30 dark:text-white/30" />
                                        <p className="text-black/60 dark:text-white/55 text-sm font-semibold leading-snug">{t("placeholder")}</p>
                                    </div>
                                </div>
                            )}

                            {isSpinning && (
                                <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
                                    <p className="rounded-full bg-black/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                                        {t("spinning")}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-5 sm:p-7 flex flex-col items-center gap-4">
                            {winner ? (
                                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                                    <div className="text-body-lg text-[var(--text-secondary)] font-medium mb-1">{t("congrats")}</div>
                                    <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-santa-red to-indigo-accent mb-6 drop-shadow-sm break-words">
                                        {winner}
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Button onClick={spinWheel} size="lg">
                                            <RefreshCw className="mr-2 w-5 h-5" />
                                            {t("spin")}
                                        </Button>
                                        <Button onClick={removeWinner} variant="secondary" size="lg">
                                            <Trash2 className="mr-2 w-5 h-5" />
                                            {t("removeWinner")}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={spinWheel}
                                    disabled={isSpinning || segments.length < 2 || !sceneReady}
                                    size="lg"
                                    className="hover:scale-105 transition-transform"
                                >
                                    {isSpinning ? t("spinning") : t("spin")}
                                </Button>
                            )}
                            <p className="text-xs font-medium text-[var(--text-secondary)] text-center">{t("fairNote")}</p>
                            <p className="hidden sm:block text-[11px] text-[var(--text-muted)] text-center">{t("spinHint")}</p>
                        </div>
                    </div>
                </div>

                {/* Instructions & About Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <div className="ys-card p-8">
                        <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">{t("howToTitle")}</h3>
                        <ul className="space-y-3">
                            {(t.raw("howToText") as string[]).map((step, i) => (
                                <li key={i} className="flex items-start text-[var(--text-secondary)]">
                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-indigo-accent rounded-full shrink-0"></span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="ys-card p-8">
                        <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">{t("aboutTitle")}</h3>
                        <p className="text-body-lg text-[var(--text-secondary)] leading-relaxed">{t("aboutText")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
