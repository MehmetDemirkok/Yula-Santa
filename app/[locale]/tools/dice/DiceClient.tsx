"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { SITE_SHARE_SUFFIX } from "@/lib/constants";

type DiceStyle = "classic" | "casino" | "ivory";

const DIE_SIZE = 1.85;
const DIE_MASS = 1.15;
const DICE_UNICODE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const TABLE_W = 14;
const TABLE_D = 10;

type StylePalette = {
  faceA: string;
  faceB: string;
  pipA: string;
  pipB: string;
  pipC: string;
  corner: string;
  border: string;
  metalness: number;
  roughness: number;
};

const STYLES: Record<DiceStyle, StylePalette> = {
  classic: {
    faceA: "#ffffff",
    faceB: "#f3eee6",
    pipA: "#3d1515",
    pipB: "#1a0808",
    pipC: "#0a0404",
    corner: "#140808",
    border: "rgba(90,50,20,0.28)",
    metalness: 0.02,
    roughness: 0.42,
  },
  casino: {
    faceA: "#9f1239",
    faceB: "#7f1d1d",
    pipA: "#fff8f0",
    pipB: "#fde68a",
    pipC: "#fef3c7",
    corner: "#3f0a14",
    border: "rgba(255,220,160,0.35)",
    metalness: 0.08,
    roughness: 0.38,
  },
  ivory: {
    faceA: "#fff8ee",
    faceB: "#f0e2c8",
    pipA: "#7f1d1d",
    pipB: "#5c1010",
    pipC: "#3b0808",
    corner: "#2a1810",
    border: "rgba(180,140,80,0.4)",
    metalness: 0.12,
    roughness: 0.32,
  },
};

function createNoiseCanvas(size: number, fn: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  fn(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function createFeltTexture() {
  return createNoiseCanvas(512, (ctx, S) => {
    const g = ctx.createRadialGradient(S * 0.5, S * 0.45, 20, S * 0.5, S * 0.5, S * 0.72);
    g.addColorStop(0, "#1a6b4a");
    g.addColorStop(0.45, "#0f4d36");
    g.addColorStop(1, "#083024");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)";
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    // Soft vignette ring like a gaming table
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.ellipse(S / 2, S / 2, S * 0.42, S * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function createWoodTexture() {
  return createNoiseCanvas(256, (ctx, S) => {
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, "#6b3f1f");
    g.addColorStop(0.5, "#4a2a12");
    g.addColorStop(1, "#2e170a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(20,8,0,${0.04 + Math.random() * 0.08})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * S);
      ctx.bezierCurveTo(S * 0.3, Math.random() * S, S * 0.7, Math.random() * S, S, Math.random() * S);
      ctx.stroke();
    }
  });
}

function createDiceTexture(value: number, style: DiceStyle) {
  const pal = STYLES[style];
  const canvas = document.createElement("canvas");
  const S = 512;
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = pal.corner;
  ctx.fillRect(0, 0, S, S);

  const R = 58;
  const face = () => {
    ctx.beginPath();
    ctx.roundRect(10, 10, S - 20, S - 20, R);
    ctx.closePath();
  };

  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, pal.faceA);
  bg.addColorStop(1, pal.faceB);
  face();
  ctx.fillStyle = bg;
  ctx.fill();

  // Micro grain
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * S, Math.random() * S, 2, 2);
  }
  ctx.restore();

  const edge = ctx.createLinearGradient(0, 0, 0, S);
  edge.addColorStop(0, "rgba(255,255,255,0.55)");
  edge.addColorStop(0.45, "rgba(255,255,255,0)");
  edge.addColorStop(1, "rgba(0,0,0,0.12)");
  face();
  ctx.fillStyle = edge;
  ctx.fill();

  face();
  ctx.strokeStyle = pal.border;
  ctx.lineWidth = 7;
  ctx.stroke();

  const dotR = 44;
  const pad = 112;
  const mid = S / 2;
  const L = pad;
  const RI = S - pad;
  const T = pad;
  const B = S - pad;
  const positions: Record<number, { x: number; y: number }[]> = {
    1: [{ x: mid, y: mid }],
    2: [
      { x: L, y: T },
      { x: RI, y: B },
    ],
    3: [
      { x: L, y: T },
      { x: mid, y: mid },
      { x: RI, y: B },
    ],
    4: [
      { x: L, y: T },
      { x: RI, y: T },
      { x: L, y: B },
      { x: RI, y: B },
    ],
    5: [
      { x: L, y: T },
      { x: RI, y: T },
      { x: mid, y: mid },
      { x: L, y: B },
      { x: RI, y: B },
    ],
    6: [
      { x: L, y: T },
      { x: RI, y: T },
      { x: L, y: mid },
      { x: RI, y: mid },
      { x: L, y: B },
      { x: RI, y: B },
    ],
  };

  positions[value]?.forEach(({ x, y }) => {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.arc(x + 2, y + 3, dotR, 0, Math.PI * 2);
    ctx.fill();

    const dot = ctx.createRadialGradient(x - dotR * 0.25, y - dotR * 0.25, 2, x, y, dotR);
    dot.addColorStop(0, pal.pipA);
    dot.addColorStop(0.55, pal.pipB);
    dot.addColorStop(1, pal.pipC);
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(x, y, dotR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(x - dotR * 0.28, y - dotR * 0.3, dotR * 0.34, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function getDieResult(die: { body: CANNON.Body }) {
  const up = new CANNON.Vec3(0, 1, 0);
  const faces = [
    { normal: new CANNON.Vec3(0, 0, 1), value: 1 },
    { normal: new CANNON.Vec3(0, 0, -1), value: 6 },
    { normal: new CANNON.Vec3(0, 1, 0), value: 3 },
    { normal: new CANNON.Vec3(0, -1, 0), value: 4 },
    { normal: new CANNON.Vec3(1, 0, 0), value: 2 },
    { normal: new CANNON.Vec3(-1, 0, 0), value: 5 },
  ];
  let best = 0;
  let maxDot = -Infinity;
  for (const f of faces) {
    const wn = new CANNON.Vec3();
    die.body.quaternion.vmult(f.normal, wn);
    const dot = wn.dot(up);
    if (dot > maxDot) {
      maxDot = dot;
      best = f.value;
    }
  }
  return best;
}

function createDiceAudio() {
  let ctx: AudioContext | null = null;
  const ensure = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const clack = (intensity = 0.5) => {
    try {
      const ac = ensure();
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180 + intensity * 220, t0);
      osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.08);
      filter.type = "lowpass";
      filter.frequency.value = 900;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.12 * intensity, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + 0.14);

      // Soft noise burst
      const buffer = ac.createBuffer(1, ac.sampleRate * 0.06, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.25));
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      const ng = ac.createGain();
      ng.gain.value = 0.045 * intensity;
      noise.connect(ng);
      ng.connect(ac.destination);
      noise.start(t0);
    } catch {
      /* audio optional */
    }
  };

  const settleChime = () => {
    try {
      const ac = ensure();
      const t0 = ac.currentTime;
      [523.25, 659.25].forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t0 + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.05, t0 + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t0 + i * 0.05);
        osc.stop(t0 + i * 0.05 + 0.4);
      });
    } catch {
      /* optional */
    }
  };

  return { clack, settleChime, dispose: () => void ctx?.close() };
}

export default function DicePage() {
  const t = useTranslations("tools.diceContent");

  const [diceCount, setDiceCount] = useState(2);
  const [diceStyle, setDiceStyle] = useState<DiceStyle>("classic");
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<{ dice: number[]; total: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [special, setSpecial] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const rollCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRollingRef = useRef(false);
  const soundOnRef = useRef(true);
  const audioRef = useRef(createDiceAudio());
  const lastClackRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const shakeUntilRef = useRef(0);

  const diceStyleRef = useRef(diceStyle);
  diceStyleRef.current = diceStyle;
  soundOnRef.current = soundOn;

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    world: CANNON.World;
    dice: { mesh: THREE.Mesh; body: CANNON.Body }[];
    cameraBase: THREE.Vector3;
    cleanup: () => void;
    createDice: (count: number, style: DiceStyle) => void;
  } | null>(null);

  const howSteps = t.raw("howSteps") as string[];
  const features = t.raw("features") as string[];

  const stats = useMemo(() => {
    if (!history.length) return null;
    const totals = history.map((h) => h.total);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const best = Math.max(...totals);
    return { rolls: history.length, avg, best };
  }, [history]);

  const detectSpecial = useCallback(
    (dice: number[], total: number) => {
      if (dice.length >= 2 && dice.every((d) => d === dice[0])) {
        if (dice[0] === 1) return t("snakeEyes");
        if (dice[0] === 6) return t("boxcars");
        return t("doubles");
      }
      if (dice.length === 2 && total === 7) return t("luckySeven");
      return null;
    },
    [t]
  );

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

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
      scene.fog = new THREE.FogExp2(0x06140f, 0.028);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      const cameraBase = new THREE.Vector3(0, 13.2, 12.4);
      camera.position.copy(cameraBase);
      camera.lookAt(0, 0.2, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      canvasRef.current.appendChild(renderer.domElement);

      const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -28, 0) });
      world.allowSleep = true;
      world.defaultContactMaterial.friction = 0.35;
      world.defaultContactMaterial.restitution = 0.28;

      const feltMat = new CANNON.Material("felt");
      const dieMat = new CANNON.Material("die");
      world.addContactMaterial(
        new CANNON.ContactMaterial(feltMat, dieMat, { friction: 0.45, restitution: 0.22 })
      );
      world.addContactMaterial(
        new CANNON.ContactMaterial(dieMat, dieMat, { friction: 0.2, restitution: 0.35 })
      );

      // Lighting — warm casino canopy
      scene.add(new THREE.AmbientLight(0xfff0e0, 0.35));
      const key = new THREE.DirectionalLight(0xfff4e8, 1.55);
      key.position.set(4, 16, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 40;
      key.shadow.camera.left = -12;
      key.shadow.camera.right = 12;
      key.shadow.camera.top = 12;
      key.shadow.camera.bottom = -12;
      key.shadow.bias = -0.0003;
      scene.add(key);

      const fill = new THREE.PointLight(0xffc9a0, 0.55, 40);
      fill.position.set(-7, 7, 4);
      scene.add(fill);
      const rim = new THREE.SpotLight(0xffe8c8, 1.1, 50, Math.PI / 5, 0.45, 1);
      rim.position.set(0, 18, 0);
      rim.target.position.set(0, 0, 0);
      scene.add(rim);
      scene.add(rim.target);
      const accent = new THREE.PointLight(0xdc2626, 0.25, 25);
      accent.position.set(0, 3, -6);
      scene.add(accent);

      // Felt table top
      const feltTex = createFeltTexture();
      if (feltTex) feltTex.repeat.set(2.2, 1.6);
      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(TABLE_W, 0.35, TABLE_D),
        new THREE.MeshStandardMaterial({
          map: feltTex ?? undefined,
          color: feltTex ? 0xffffff : 0x0f4d36,
          roughness: 0.92,
          metalness: 0.02,
        })
      );
      tableTop.position.y = -0.175;
      tableTop.receiveShadow = true;
      tableTop.castShadow = true;
      scene.add(tableTop);

      const woodTex = createWoodTexture();
      const railMat = new THREE.MeshStandardMaterial({
        map: woodTex ?? undefined,
        color: woodTex ? 0xffffff : 0x4a2a12,
        roughness: 0.55,
        metalness: 0.15,
      });
      const railH = 0.85;
      const railT = 0.55;
      const rails: [number, number, number, number, number, number][] = [
        [TABLE_W + railT * 2, railH, railT, 0, railH / 2 - 0.05, TABLE_D / 2 + railT / 2],
        [TABLE_W + railT * 2, railH, railT, 0, railH / 2 - 0.05, -(TABLE_D / 2 + railT / 2)],
        [railT, railH, TABLE_D, TABLE_W / 2 + railT / 2, railH / 2 - 0.05, 0],
        [railT, railH, TABLE_D, -(TABLE_W / 2 + railT / 2), railH / 2 - 0.05, 0],
      ];
      rails.forEach(([w, h, d, x, y, z]) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), railMat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      });

      // Physics ground + walls aligned to table
      const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
        material: feltMat,
      });
      groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      world.addBody(groundBody);

      const wallDefs: { pos: [number, number, number]; rot: [number, number, number] }[] = [
        { pos: [TABLE_W / 2 - 0.2, 2, 0], rot: [0, -Math.PI / 2, 0] },
        { pos: [-(TABLE_W / 2 - 0.2), 2, 0], rot: [0, Math.PI / 2, 0] },
        { pos: [0, 2, TABLE_D / 2 - 0.2], rot: [0, Math.PI, 0] },
        { pos: [0, 2, -(TABLE_D / 2 - 0.2)], rot: [0, 0, 0] },
      ];
      wallDefs.forEach(({ pos, rot }) => {
        const b = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Plane(),
          material: feltMat,
        });
        b.position.set(...pos);
        b.quaternion.setFromEuler(...rot);
        world.addBody(b);
      });

      // Collision audio
      world.addEventListener("postStep", () => {
        if (!soundOnRef.current || !isRollingRef.current) return;
        const now = performance.now();
        if (now - lastClackRef.current < 90) return;
        for (const d of dice) {
          const v = d.body.velocity.length();
          if (v > 4 && d.body.position.y < DIE_SIZE + 0.6) {
            lastClackRef.current = now;
            audioRef.current.clack(Math.min(1, v / 18));
            break;
          }
        }
      });

      const dice: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
      const createDice = (count: number, style: DiceStyle) => {
        if (dice.length > 0) {
          const shared = dice[0].mesh.material;
          dice.forEach((d) => {
            scene.remove(d.mesh);
            world.removeBody(d.body);
          });
          const mats = (Array.isArray(shared) ? shared : [shared]) as THREE.Material[];
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial;
            if (std.map) std.map.dispose();
            m.dispose();
          });
          dice.length = 0;
        }

        const geo = new RoundedBoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE, 5, 0.26);
        const pal = STYLES[style];
        const mats = [2, 5, 3, 4, 1, 6].map(
          (v) =>
            new THREE.MeshStandardMaterial({
              map: createDiceTexture(v, style)!,
              roughness: pal.roughness,
              metalness: pal.metalness,
            })
        );

        const spacing = count === 3 ? 2.35 : 2.7;
        const offset = ((count - 1) * spacing) / 2;
        for (let i = 0; i < count; i++) {
          const mesh = new THREE.Mesh(geo, mats);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          const body = new CANNON.Body({
            mass: DIE_MASS,
            shape: new CANNON.Box(new CANNON.Vec3(DIE_SIZE / 2, DIE_SIZE / 2, DIE_SIZE / 2)),
            material: dieMat,
            allowSleep: true,
            sleepSpeedLimit: 0.15,
            sleepTimeLimit: 0.4,
          });
          body.position.set(i * spacing - offset, DIE_SIZE / 2 + 0.05, 0);
          body.quaternion.setFromEuler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          world.addBody(body);
          dice.push({ mesh, body });
        }
      };
      createDice(diceCount, diceStyleRef.current);

      let idleT = 0;

      const animate = () => {
        world.fixedStep();
        dice.forEach((d) => {
          d.mesh.position.copy(d.body.position as unknown as THREE.Vector3);
          d.mesh.quaternion.copy(d.body.quaternion as unknown as THREE.Quaternion);
        });

        const now = performance.now();
        if (now < shakeUntilRef.current && !reducedMotionRef.current) {
          const amp = 0.12 * ((shakeUntilRef.current - now) / 280);
          camera.position.set(
            cameraBase.x + (Math.random() - 0.5) * amp,
            cameraBase.y + (Math.random() - 0.5) * amp * 0.6,
            cameraBase.z + (Math.random() - 0.5) * amp
          );
        } else if (!isRollingRef.current && !reducedMotionRef.current) {
          idleT += 0.008;
          camera.position.set(
            cameraBase.x + Math.sin(idleT) * 0.35,
            cameraBase.y + Math.sin(idleT * 0.7) * 0.12,
            cameraBase.z + Math.cos(idleT * 0.85) * 0.2
          );
        } else {
          camera.position.copy(cameraBase);
        }
        camera.lookAt(0, 0.25, 0);

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();

      const cleanup = () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        feltTex?.dispose();
        woodTex?.dispose();
        if (canvasRef.current?.contains(renderer.domElement)) {
          canvasRef.current.removeChild(renderer.domElement);
        }
        setSceneReady(false);
      };

      sceneRef.current = {
        scene,
        camera,
        renderer,
        world,
        dice,
        cameraBase,
        cleanup,
        createDice,
      };
      setSceneReady(true);
    };

    resizeObserver = new ResizeObserver(() => {
      if (sceneRef.current) {
        if (!canvasRef.current) return;
        const w = canvasRef.current.clientWidth;
        const h = canvasRef.current.clientHeight;
        if (w === 0 || h === 0) return;
        sceneRef.current.camera.aspect = w / h;
        sceneRef.current.camera.updateProjectionMatrix();
        sceneRef.current.renderer.setSize(w, h);
      } else {
        initScene();
      }
    });
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);

    return () => {
      if (rollCheckRef.current) clearInterval(rollCheckRef.current);
      if (resizeObserver) resizeObserver.disconnect();
      if (sceneRef.current) sceneRef.current.cleanup();
      sceneRef.current = null;
      audioRef.current.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sceneRef.current?.createDice) {
      sceneRef.current.createDice(diceCount, diceStyle);
      setResults([]);
      setSpecial(null);
    }
  }, [diceCount, diceStyle]);

  const rollDice = useCallback(() => {
    if (!sceneRef.current || isRollingRef.current) return;
    isRollingRef.current = true;
    setIsRolling(true);
    setResults([]);
    setSpecial(null);
    if (rollCheckRef.current) clearInterval(rollCheckRef.current);

    if (soundOnRef.current) audioRef.current.clack(0.7);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);

    shakeUntilRef.current = performance.now() + 320;

    const n = sceneRef.current.dice.length;
    const spacing = n === 3 ? 2.35 : 2.7;
    const offset = ((n - 1) * spacing) / 2;

    sceneRef.current.dice.forEach((d, i) => {
      d.body.wakeUp();
      d.body.position.set(i * spacing - offset + (Math.random() - 0.5) * 0.4, 6.5 + Math.random() * 1.8, (Math.random() - 0.5) * 1.2);
      d.body.velocity.set(
        (Math.random() - 0.5) * 10,
        6 + Math.random() * 5,
        (Math.random() - 0.5) * 10
      );
      d.body.angularVelocity.set(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 28
      );
    });

    let settledTicks = 0;
    let safety = 0;
    rollCheckRef.current = setInterval(() => {
      safety += 1;
      if (!sceneRef.current) {
        if (rollCheckRef.current) clearInterval(rollCheckRef.current);
        return;
      }
      const resting = sceneRef.current.dice.every(
        (d) =>
          d.body.velocity.length() < 0.18 &&
          d.body.angularVelocity.length() < 0.18 &&
          d.body.position.y < DIE_SIZE + 0.35
      );
      if (resting) settledTicks += 1;
      else settledTicks = 0;

      if (settledTicks >= 3 || safety > 80) {
        if (rollCheckRef.current) clearInterval(rollCheckRef.current);
        rollCheckRef.current = null;
        const final = sceneRef.current.dice.map(getDieResult);
        const total = final.reduce((a, b) => a + b, 0);
        const badge = detectSpecial(final, total);
        setResults(final);
        setSpecial(badge);
        setHistory((prev) => [{ dice: final, total }, ...prev].slice(0, 12));
        isRollingRef.current = false;
        setIsRolling(false);
        if (soundOnRef.current) audioRef.current.settleChime();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(badge ? [18, 40, 18] : 8);
      }
    }, 120);
  }, [detectSpecial]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      e.preventDefault();
      rollDice();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rollDice]);

  const shareResult = async () => {
    if (!results.length) return;
    const score = results.reduce((a, b) => a + b, 0);
    const faces = results.map((v) => DICE_UNICODE[v]).join(" ");
    const badge = special ? ` (${special})` : "";
    const text = `${faces} — ${t("total")} ${score}${badge}\n${SITE_SHARE_SUFFIX}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const totalScore = results.reduce((a, b) => a + b, 0);
  const styleLabel = (s: DiceStyle) =>
    s === "classic" ? t("styleClassic") : s === "casino" ? t("styleCasino") : t("styleIvory");

  return (
    <div className="ys-page-shell relative overflow-hidden px-4 py-6 sm:py-10 transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-700/10" />
        <div className="absolute -bottom-40 left-[-12%] h-[460px] w-[460px] rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-900/10" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-rose-300/10 blur-3xl dark:bg-rose-900/10" />
      </div>

      <div className="relative mx-auto max-w-xl">
        <div className="mb-6 flex items-start gap-4">
          <Link
            href="/tools"
            className="mt-1 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-2.5 shadow-md backdrop-blur transition-all hover:scale-105 hover:shadow-lg"
            aria-label={t("backToTools")}
          >
            <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800/70 dark:text-emerald-300/70">
              YulaSanta Table
            </p>
            <h1 className="font-heading text-headline-lg-mobile tracking-tight text-[var(--text-primary)] sm:text-headline-lg">
              {t("title")}
            </h1>
            <p className="mt-0.5 text-label-sm text-emerald-800/80 dark:text-emerald-300/80">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => setSoundOn((v) => !v)}
            className="mt-1 rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] p-2.5 text-[var(--text-secondary)] transition hover:border-emerald-700/30 hover:text-emerald-800 dark:hover:text-emerald-300"
            aria-label={soundOn ? t("soundOn") : t("soundOff")}
            title={soundOn ? t("soundOn") : t("soundOff")}
          >
            {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>

        <div
          className="overflow-hidden rounded-[1.75rem] border border-emerald-950/15 shadow-2xl shadow-emerald-950/10 dark:border-emerald-200/10"
          style={{
            background:
              "linear-gradient(165deg, rgba(15,61,46,0.06) 0%, var(--card-bg) 28%, var(--card-bg) 100%)",
          }}
        >
          {/* Count */}
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 pt-5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDiceCount(n)}
                disabled={isRolling}
                className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                  diceCount === n
                    ? "border-emerald-800 bg-emerald-900 text-emerald-50 shadow-lg shadow-emerald-900/25 dark:border-emerald-500 dark:bg-emerald-700"
                    : "border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:border-emerald-700/40"
                }`}
              >
                {n === 1 ? `1 ${t("oneDie")}` : n === 2 ? `2 ${t("twoDice")}` : t("threeDice")}
              </button>
            ))}
          </div>

          {/* Style */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 px-4">
            {(["classic", "casino", "ivory"] as DiceStyle[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDiceStyle(s)}
                disabled={isRolling}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                  diceStyle === s
                    ? s === "casino"
                      ? "border-santa-red bg-santa-red text-white"
                      : s === "ivory"
                        ? "border-amber-600 bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
                        : "border-slate-700 bg-slate-800 text-white"
                    : "border-[var(--border-light)] text-[var(--text-muted)] hover:border-emerald-700/40"
                }`}
              >
                {styleLabel(s)}
              </button>
            ))}
          </div>

          {/* Theatre */}
          <div className="relative mt-4">
            <div className="relative h-[300px] w-full overflow-hidden sm:h-[380px]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 20%, #1a4a38 0%, #0a1f18 55%, #050d0a 100%)",
                }}
              />
              <div ref={canvasRef} className="absolute inset-0 z-[1]" />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-14 bg-gradient-to-b from-black/35 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-t from-black/50 to-transparent" />

              {!sceneReady && (
                <div className="absolute inset-0 z-[3] flex items-center justify-center">
                  <span className="animate-pulse text-sm text-emerald-100/40">{t("tableReady")}…</span>
                </div>
              )}

              {isRolling && (
                <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
                  <p className="rounded-full bg-black/35 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-100/80 backdrop-blur-sm">
                    {t("throwing")}
                  </p>
                </div>
              )}

              {results.length > 0 && !isRolling && (
                <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-2 animate-slide-up">
                  {special && (
                    <span className="rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-500 to-yellow-600 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-lg">
                      {special}
                    </span>
                  )}
                  <div className="rounded-full border border-white/15 bg-gradient-to-r from-emerald-800 to-emerald-950 px-6 py-2 shadow-2xl backdrop-blur-sm">
                    <span className="whitespace-nowrap text-sm font-black uppercase tracking-widest text-emerald-50 drop-shadow">
                      {results.map((v) => DICE_UNICODE[v]).join(" ")} — {t("total")} {totalScore}
                    </span>
                  </div>
                </div>
              )}

              {!results.length && !isRolling && sceneReady && (
                <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-center">
                  <p className="animate-pulse text-xs font-medium uppercase tracking-widest text-emerald-100/35">
                    {t("placeholder")}
                  </p>
                  <p className="mt-1 hidden text-[10px] text-emerald-100/25 sm:block">{t("spaceHint")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            <p className="text-center text-[11px] font-medium text-[var(--text-muted)]">{t("fairNote")}</p>

            {results.length > 0 && (
              <div
                className={`animate-zoom-in grid gap-3 ${
                  results.length === 1 ? "grid-cols-1" : results.length === 2 ? "grid-cols-2" : "grid-cols-3"
                }`}
              >
                {results.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-emerald-800/15 bg-emerald-900/[0.06] p-3 text-center sm:p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                  >
                    <p className="text-4xl font-black tabular-nums text-emerald-900 dark:text-emerald-300 sm:text-5xl">
                      {v}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      {t("oneDie")} {i + 1}
                    </p>
                  </div>
                ))}
                {results.length > 1 && (
                  <div className="col-span-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-3 text-center">
                    <p className="text-2xl font-black text-[var(--text-primary)]">
                      {t("total")}: <span className="text-emerald-800 dark:text-emerald-300">{totalScore}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {stats && (
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)]/80 p-3">
                <div className="text-center">
                  <p className="text-lg font-black tabular-nums text-[var(--text-primary)]">{stats.rolls}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{t("rollsLabel")}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black tabular-nums text-[var(--text-primary)]">{stats.avg.toFixed(1)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{t("avgLabel")}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black tabular-nums text-emerald-800 dark:text-emerald-300">{stats.best}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{t("bestLabel")}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={rollDice}
              disabled={isRolling || !sceneReady}
              className={`group relative w-full overflow-hidden rounded-2xl py-4 text-xl font-black text-white shadow-xl transition-all duration-300 active:scale-[0.97] ${
                isRolling || !sceneReady
                  ? "cursor-not-allowed bg-[var(--text-muted)]"
                  : "bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 shadow-emerald-900/30 hover:scale-[1.015] hover:brightness-110 hover:shadow-2xl"
              }`}
            >
              {!isRolling && sceneReady && (
                <div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest drop-shadow">
                <span className={`text-2xl ${isRolling ? "animate-spin" : ""}`} aria-hidden="true">
                  🎲
                </span>
                {isRolling ? t("rolling") : t("roll")}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {results.length > 0 && !isRolling && (
                <button
                  type="button"
                  onClick={shareResult}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-emerald-700/30 hover:text-emerald-800 dark:hover:text-emerald-300"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t("copied") : t("share")}
                </button>
              )}
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    setResults([]);
                    setSpecial(null);
                  }}
                  className={`group flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:border-santa-red/30 hover:text-santa-red ${
                    results.length > 0 && !isRolling ? "" : "col-span-2"
                  }`}
                >
                  <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                  {t("clear")}
                </button>
              )}
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-label-sm uppercase tracking-wider text-[var(--text-muted)]">{t("history")}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{t("maxHistory")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((roll, idx) => (
                <div
                  key={`${roll.total}-${idx}-${roll.dice.join("")}`}
                  className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 ${
                    idx === 0
                      ? "border-emerald-700/35 bg-emerald-900/10 shadow-sm dark:border-emerald-400/30"
                      : "border-[var(--border-light)] bg-[var(--card-bg)] opacity-80"
                  }`}
                >
                  {roll.dice.map((d, i) => (
                    <span
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-sm font-black text-emerald-50 dark:bg-emerald-700"
                    >
                      {d}
                    </span>
                  ))}
                  {roll.dice.length > 1 && (
                    <span className="pl-1 text-xs font-bold tabular-nums text-[var(--text-secondary)]">
                      ={roll.total}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <section className="ys-card p-5 sm:p-6">
            <h2 className="mb-3 font-heading text-headline-md text-[var(--text-primary)]">{t("howTitle")}</h2>
            <ol className="space-y-3">
              {howSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-[var(--text-secondary)]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-900/10 text-sm font-bold text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-300">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-body-md leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="ys-card p-5 sm:p-6">
            <h2 className="mb-3 font-heading text-headline-md text-[var(--text-primary)]">{t("aboutTitle")}</h2>
            <p className="mb-4 text-body-md leading-relaxed text-[var(--text-secondary)]">{t("aboutText")}</p>
            <h3 className="mb-2 text-label-md font-semibold text-[var(--text-primary)]">{t("featuresTitle")}</h3>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-800 dark:bg-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
