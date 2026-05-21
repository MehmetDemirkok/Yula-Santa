"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const DIE_SIZE = 2;
const DIE_MASS = 1;
const GROUND_SIZE = 50;
const DICE_UNICODE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// Classic dice: pure white face, near-black dots — maximum contrast for 3D rendering
const createDiceTexture = (value: number) => {
    const canvas = document.createElement('canvas');
    const S = 512;
    canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // ── 1. Fill entire canvas black first (corners will show black) ───────────
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, S, S);

    // ── 2. White face with subtle warm gradient ───────────────────────────────
    const R = 56;
    const face = () => {
        ctx.beginPath();
        ctx.roundRect(8, 8, S - 16, S - 16, R);
        ctx.closePath();
    };
    const bg = ctx.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(1, '#f8f4ee');
    face();
    ctx.fillStyle = bg;
    ctx.fill();

    // ── 3. Subtle inner edge shadow (depth) ───────────────────────────────────
    const edgeShadow = ctx.createLinearGradient(0, 0, 0, S);
    edgeShadow.addColorStop(0, 'rgba(255,255,255,0.6)');
    edgeShadow.addColorStop(0.5, 'rgba(0,0,0,0)');
    edgeShadow.addColorStop(1, 'rgba(0,0,0,0.08)');
    face();
    ctx.fillStyle = edgeShadow;
    ctx.fill();

    // ── 4. Border ─────────────────────────────────────────────────────────────
    face();
    ctx.strokeStyle = 'rgba(100, 60, 20, 0.25)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // ── 5. Dots — near-black for guaranteed contrast ──────────────────────────
    const dotR = 46;
    const pad  = 108;
    const mid  = S / 2;
    const L = pad, RI = S - pad, T = pad, B = S - pad;

    const positions: Record<number, { x: number; y: number }[]> = {
        1: [{ x: mid, y: mid }],
        2: [{ x: L, y: T }, { x: RI, y: B }],
        3: [{ x: L, y: T }, { x: mid, y: mid }, { x: RI, y: B }],
        4: [{ x: L, y: T }, { x: RI, y: T }, { x: L, y: B }, { x: RI, y: B }],
        5: [{ x: L, y: T }, { x: RI, y: T }, { x: mid, y: mid }, { x: L, y: B }, { x: RI, y: B }],
        6: [{ x: L, y: T }, { x: RI, y: T }, { x: L, y: mid }, { x: RI, y: mid }, { x: L, y: B }, { x: RI, y: B }],
    };

    positions[value]?.forEach(({ x, y }) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 3, dotR, 0, Math.PI * 2);
        ctx.fill();

        // Dot body — dark warm charcoal (near-black)
        const dotFill = ctx.createRadialGradient(x - dotR * 0.25, y - dotR * 0.25, 2, x, y, dotR);
        dotFill.addColorStop(0, '#3d1515');
        dotFill.addColorStop(0.5, '#200a0a');
        dotFill.addColorStop(1, '#0d0404');
        ctx.fillStyle = dotFill;
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();

        // Subtle specular
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.arc(x - dotR * 0.28, y - dotR * 0.3, dotR * 0.36, 0, Math.PI * 2);
        ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
};

export default function DicePage() {
    const t = useTranslations('tools.diceContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [diceCount, setDiceCount] = useState(1);
    const [results, setResults] = useState<number[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    const [history, setHistory] = useState<{ dice: number[]; total: number }[]>([]);

    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        world: CANNON.World;
        dice: { mesh: THREE.Mesh; body: CANNON.Body }[];
        cleanup: () => void;
        createDice: (count: number) => void;
    } | null>(null);

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

            const scene = new THREE.Scene();
            scene.background = null;
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            camera.position.set(0, 15, 12);
            camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.1;
            canvasRef.current.appendChild(renderer.domElement);

            const world = new CANNON.World();
            world.gravity.set(0, -20.81, 0);
            world.allowSleep = true;

            // Balanced lighting — bright enough to see detail, not so bright it washes texture
            scene.add(new THREE.AmbientLight(0xffffff, 0.55));
            const dir = new THREE.DirectionalLight(0xfff8f0, 1.4);
            dir.position.set(5, 18, 8); dir.castShadow = true;
            dir.shadow.mapSize.width = 2048; dir.shadow.mapSize.height = 2048;
            scene.add(dir);
            const fill = new THREE.PointLight(0xffeedd, 0.6);
            fill.position.set(-6, 6, 5); scene.add(fill);
            const rim = new THREE.PointLight(0xddeeff, 0.35);
            rim.position.set(0, 5, -9); scene.add(rim);

            // Ground
            const groundBody = new CANNON.Body({
                type: CANNON.Body.STATIC, shape: new CANNON.Plane(),
                material: new CANNON.Material({ friction: 0.1, restitution: 0.5 })
            });
            groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            world.addBody(groundBody);
            const groundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
                new THREE.ShadowMaterial({ opacity: 0.35 })
            );
            groundMesh.rotation.x = -Math.PI / 2; groundMesh.receiveShadow = true;
            scene.add(groundMesh);

            // Walls
            const wm = new CANNON.Material({ friction: 0, restitution: 0.9 });
            const wDef: [number, number, number][] = [
                [10, 5, 0], [-10, 5, 0], [0, 5, 6], [0, 5, -6]
            ];
            const wRot: [number, number, number][] = [
                [0, -Math.PI / 2, 0], [0, Math.PI / 2, 0], [0, Math.PI, 0], [0, 0, 0]
            ];
            wDef.forEach((pos, i) => {
                const b = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane(), material: wm });
                b.position.set(...pos); b.quaternion.setFromEuler(...wRot[i]); world.addBody(b);
            });

            const dice: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
            const createDice = (count: number) => {
                dice.forEach(d => { scene.remove(d.mesh); world.removeBody(d.body); });
                dice.length = 0;
                const geo = new RoundedBoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE, 6, 0.28);
                const matProps = { roughness: 0.45, metalness: 0.0, envMapIntensity: 0.3 };
                const mats = [2, 5, 3, 4, 1, 6].map(v =>
                    new THREE.MeshStandardMaterial({ map: createDiceTexture(v), ...matProps })
                );
                for (let i = 0; i < count; i++) {
                    const mesh = new THREE.Mesh(geo, mats);
                    mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
                    const body = new CANNON.Body({
                        mass: DIE_MASS,
                        shape: new CANNON.Box(new CANNON.Vec3(DIE_SIZE / 2, DIE_SIZE / 2, DIE_SIZE / 2)),
                        material: new CANNON.Material({ friction: 0.1, restitution: 0.3 })
                    });
                    const offset = (count - 1) * 1.5;
                    body.position.set((i * 3) - offset, 2, 0);
                    body.quaternion.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    world.addBody(body); dice.push({ mesh, body });
                }
            };
            createDice(1);

            const animate = () => {
                world.fixedStep();
                dice.forEach(d => {
                    d.mesh.position.copy(d.body.position as any);
                    d.mesh.quaternion.copy(d.body.quaternion as any);
                });
                renderer.render(scene, camera);
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();

            const cleanup = () => {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                renderer.dispose();
                if (canvasRef.current?.contains(renderer.domElement))
                    canvasRef.current.removeChild(renderer.domElement);
            };
            sceneRef.current = { scene, camera, renderer, world, dice, cleanup, createDice };
        };

        resizeObserver = new ResizeObserver(() => {
            if (sceneRef.current) {
                if (!canvasRef.current) return;
                const w = canvasRef.current.clientWidth, h = canvasRef.current.clientHeight;
                if (w === 0 || h === 0) return;
                sceneRef.current.camera.aspect = w / h;
                sceneRef.current.camera.updateProjectionMatrix();
                sceneRef.current.renderer.setSize(w, h);
            } else { initScene(); }
        });
        if (canvasRef.current) resizeObserver.observe(canvasRef.current);
        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            if (sceneRef.current) sceneRef.current.cleanup();
        };
    }, []);

    useEffect(() => {
        if (sceneRef.current?.createDice) sceneRef.current.createDice(diceCount);
    }, [diceCount]);

    const rollDice = () => {
        if (!sceneRef.current || isRolling) return;
        setIsRolling(true); setResults([]);
        sceneRef.current.dice.forEach(d => {
            d.body.position.set(d.body.position.x, 5 + Math.random() * 2, d.body.position.z);
            d.body.velocity.set((Math.random() - 0.5) * 15, 10 + Math.random() * 5, (Math.random() - 0.5) * 15);
            d.body.angularVelocity.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
            d.body.wakeUp();
        });
        const check = setInterval(() => {
            if (!sceneRef.current) { clearInterval(check); return; }
            const resting = sceneRef.current.dice.every(d =>
                d.body.velocity.length() < 0.1 && d.body.angularVelocity.length() < 0.1 && d.body.position.y < 2
            );
            if (resting) {
                clearInterval(check);
                const final = sceneRef.current.dice.map(getDieResult);
                setResults(final);
                const total = final.reduce((a, b) => a + b, 0);
                setHistory(prev => [{ dice: final, total }, ...prev].slice(0, 10));
                setIsRolling(false);
            }
        }, 200);
    };

    const getDieResult = (die: { mesh: THREE.Mesh; body: CANNON.Body }) => {
        const up = new CANNON.Vec3(0, 1, 0);
        const faces = [
            { normal: new CANNON.Vec3(0, 0, 1), value: 1 },
            { normal: new CANNON.Vec3(0, 0, -1), value: 6 },
            { normal: new CANNON.Vec3(0, 1, 0), value: 3 },
            { normal: new CANNON.Vec3(0, -1, 0), value: 4 },
            { normal: new CANNON.Vec3(1, 0, 0), value: 2 },
            { normal: new CANNON.Vec3(-1, 0, 0), value: 5 },
        ];
        let best = 0, maxDot = -Infinity;
        faces.forEach(f => {
            const wn = new CANNON.Vec3(); die.body.quaternion.vmult(f.normal, wn);
            const dot = wn.dot(up); if (dot > maxDot) { maxDot = dot; best = f.value; }
        });
        return best;
    };

    const totalScore = results.reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-red-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 py-8 sm:py-12 px-4 transition-colors duration-300">

            {/* Ambient blobs — matches coin-flip */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-red-200/25 dark:bg-red-900/8 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-200/25 dark:bg-amber-900/8 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-100/15 dark:bg-orange-900/5 blur-3xl" />
            </div>

            <div className="max-w-lg mx-auto relative">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${locale}`} className="p-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-md border border-white/60 dark:border-white/10 hover:shadow-lg hover:scale-105 transition-all duration-200">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            🎲 {t('title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-0.5 font-medium">{t('subtitle')}</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden">

                    {/* Dice count toggle — inline buttons like coin-flip style selector */}
                    <div className="flex items-center justify-center gap-2 px-5 pt-5">
                        {[1, 2].map(n => (
                            <button
                                key={n}
                                onClick={() => setDiceCount(n)}
                                disabled={isRolling}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                                    diceCount === n
                                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-lg shadow-red-500/20'
                                        : 'bg-white/60 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400'
                                }`}
                            >
                                <span className="text-base">{n === 1 ? '🎲' : '🎲🎲'}</span>
                                <span>{n} {n === 1 ? t('oneDie') : t('twoDice')}</span>
                            </button>
                        ))}
                    </div>

                    {/* 3D Canvas — dark slate with dot grid (identical to coin-flip) */}
                    <div className="relative mt-4">
                        <div className="absolute inset-0 rounded-none bg-gradient-to-b from-red-400/5 via-transparent to-transparent pointer-events-none z-10" />
                        <div
                            ref={canvasRef}
                            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 h-[270px] sm:h-[340px] w-full overflow-hidden"
                        >
                            {/* Dot grid overlay — same as coin-flip */}
                            <div
                                className="absolute inset-0 z-10 pointer-events-none opacity-10"
                                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}
                            />

                            {/* Result banner — mirrors coin-flip result banner style */}
                            {results.length > 0 && !isRolling && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-slide-up">
                                    <div className="bg-gradient-to-r from-red-600 to-rose-600 px-7 py-2 rounded-full shadow-2xl border border-white/15 backdrop-blur-sm">
                                        <span className="text-white font-black uppercase text-sm tracking-widest drop-shadow whitespace-nowrap">
                                            {results.map(v => DICE_UNICODE[v]).join(' ')} — {t('total')} {totalScore}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!results.length && !isRolling && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                                    <p className="text-white/25 text-xs font-medium tracking-widest uppercase animate-pulse">
                                        Atmak için butona bas
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 sm:p-7 space-y-4">

                        {/* Roll stats — last roll result shown as large clean numbers */}
                        {results.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 animate-zoom-in">
                                {results.map((v, i) => (
                                    <div key={i} className="rounded-2xl p-4 text-center border bg-red-50 dark:bg-red-900/15 border-red-100 dark:border-red-900/30">
                                        <p className="text-5xl font-black tabular-nums text-red-600 dark:text-red-400">{v}</p>
                                        <p className="text-xs font-bold uppercase tracking-widest mt-1 text-slate-500 dark:text-slate-400">
                                            {t('oneDie')} {i + 1}
                                        </p>
                                    </div>
                                ))}
                                {diceCount === 2 && results.length === 2 && (
                                    <div className="col-span-2 rounded-2xl p-3 text-center border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                        <p className="text-2xl font-black text-slate-700 dark:text-slate-200">
                                            {t('total')}: <span className="text-red-600 dark:text-red-400">{totalScore}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Roll Button — matches coin-flip button exactly */}
                        <button
                            onClick={rollDice}
                            disabled={isRolling}
                            className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-xl transition-all duration-300 active:scale-[0.97] relative overflow-hidden group ${
                                isRolling
                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 shadow-red-400/40 dark:shadow-red-900/40 hover:shadow-2xl hover:scale-[1.02]'
                            }`}
                        >
                            {!isRolling && (
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest drop-shadow">
                                <span className={`text-2xl ${isRolling ? 'animate-spin' : ''}`}>🎲</span>
                                {isRolling ? t('rolling') : t('roll')}
                            </span>
                        </button>

                        {/* Reset */}
                        {history.length > 0 && (
                            <button
                                onClick={() => { setHistory([]); setResults([]); }}
                                className="w-full py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 group text-sm uppercase tracking-wide"
                            >
                                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                                {t('clear')}
                            </button>
                        )}
                    </div>
                </div>

                {/* History — dice badge dots, mirrors coin-flip history style */}
                {history.length > 0 && (
                    <div className="mt-6 space-y-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider px-1">
                            {t('history')}
                        </p>
                        {history.map((roll, idx) => (
                            <div
                                key={idx}
                                className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between border text-sm ${
                                    idx === 0
                                        ? 'border-red-200 dark:border-red-800/40 animate-slide-up'
                                        : 'border-white/40 dark:border-gray-700/50'
                                }`}
                            >
                                <div className="flex gap-1.5">
                                    {roll.dice.map((d, i) => (
                                        <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-sm border transition-all ${
                                            idx === 0 && i === 0
                                                ? 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400 text-white ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-gray-800 scale-110'
                                                : 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400 text-white opacity-70'
                                        }`}>
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <span className="font-bold text-gray-500 dark:text-gray-400 tabular-nums text-xs">
                                    {roll.dice.length > 1 ? `= ${roll.total}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
