"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// --- Physics & 3D Constants ---
const DIE_SIZE = 2;
const DIE_MASS = 1;
const GROUND_SIZE = 50;

// --- Helper: Create Dice Face Texture ---
const createDiceTexture = (value: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background - Pure bright white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Dots - High contrast
    ctx.fillStyle = '#111827';
    const dotRadius = 25;
    const padding = 60;
    const mid = 128;
    const left = padding;
    const right = 256 - padding;
    const top = padding;
    const bottom = 256 - padding;

    const positions: Record<number, { x: number; y: number }[]> = {
        1: [{ x: mid, y: mid }],
        2: [{ x: left, y: top }, { x: right, y: bottom }],
        3: [{ x: left, y: top }, { x: mid, y: mid }, { x: right, y: bottom }],
        4: [{ x: left, y: top }, { x: right, y: top }, { x: left, y: bottom }, { x: right, y: bottom }],
        5: [{ x: left, y: top }, { x: right, y: top }, { x: mid, y: mid }, { x: left, y: bottom }, { x: right, y: bottom }],
        6: [{ x: left, y: top }, { x: right, y: top }, { x: left, y: mid }, { x: right, y: mid }, { x: left, y: bottom }, { x: right, y: bottom }],
    };

    positions[value].forEach(pos => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [rollHistory, setRollHistory] = useState<{ dice: number[]; total: number }[]>([]);

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

    // --- Three.js & Cannon.js Initialization ---
    useEffect(() => {
        if (!canvasRef.current) return;

        let resizeObserver: ResizeObserver | null = null;
        let animationFrameId: number | null = null;

        const initScene = () => {
            if (!canvasRef.current) return;
            const width = canvasRef.current.clientWidth;
            const height = canvasRef.current.clientHeight;

            if (width === 0 || height === 0) return;

            // Cleanup
            if (sceneRef.current) {
                sceneRef.current.cleanup();
            }

            // Scene
            const scene = new THREE.Scene();
            scene.background = null;

            // Camera
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            camera.position.set(0, 15, 12);
            camera.lookAt(0, 0, 0);

            // Renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            canvasRef.current.appendChild(renderer.domElement);

            // Physics World
            const world = new CANNON.World();
            world.gravity.set(0, -20.81, 0);
            world.allowSleep = true;

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(5, 15, 5);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0xffffff, 0.6);
            pointLight.position.set(-5, 10, -5);
            scene.add(pointLight);

            // Floor
            const groundBody = new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Plane(),
                material: new CANNON.Material({ friction: 0.1, restitution: 0.5 })
            });
            groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            world.addBody(groundBody);

            const groundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
                new THREE.ShadowMaterial({ opacity: 0.2 })
            );
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.receiveShadow = true;
            scene.add(groundMesh);

            // Walls
            const wallMaterial = new CANNON.Material({ friction: 0, restitution: 0.9 });
            const walls = [
                { pos: [10, 5, 0], rot: [0, -Math.PI / 2, 0] },
                { pos: [-10, 5, 0], rot: [0, Math.PI / 2, 0] },
                { pos: [0, 5, 6], rot: [0, Math.PI, 0] },
                { pos: [0, 5, -6], rot: [0, 0, 0] },
            ];
            walls.forEach(w => {
                const body = new CANNON.Body({
                    type: CANNON.Body.STATIC,
                    shape: new CANNON.Plane(),
                    material: wallMaterial
                });
                body.position.set(w.pos[0], w.pos[1], w.pos[2]);
                body.quaternion.setFromEuler(w.rot[0], w.rot[1], w.rot[2]);
                world.addBody(body);
            });

            const dice: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];

            // Helper to create dice
            const createDice = (count: number) => {
                dice.forEach(d => {
                    scene.remove(d.mesh);
                    world.removeBody(d.body);
                });
                dice.length = 0;

                const geometries = new RoundedBoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE, 6, 0.2);
                const commonProps = { roughness: 0.15, metalness: 0.02, envMapIntensity: 1 };
                const materials = [
                    new THREE.MeshStandardMaterial({ map: createDiceTexture(2), ...commonProps }),
                    new THREE.MeshStandardMaterial({ map: createDiceTexture(5), ...commonProps }),
                    new THREE.MeshStandardMaterial({ map: createDiceTexture(3), ...commonProps }),
                    new THREE.MeshStandardMaterial({ map: createDiceTexture(4), ...commonProps }),
                    new THREE.MeshStandardMaterial({ map: createDiceTexture(1), ...commonProps }),
                    new THREE.MeshStandardMaterial({ map: createDiceTexture(6), ...commonProps }),
                ];

                for (let i = 0; i < count; i++) {
                    const mesh = new THREE.Mesh(geometries, materials);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);

                    const body = new CANNON.Body({
                        mass: DIE_MASS,
                        shape: new CANNON.Box(new CANNON.Vec3(DIE_SIZE / 2, DIE_SIZE / 2, DIE_SIZE / 2)),
                        material: new CANNON.Material({ friction: 0.1, restitution: 0.3 })
                    });

                    // Spread dice out a bit if multiple
                    const offset = (count - 1) * 1.5;
                    body.position.set((i * 3) - offset, 2, 0);

                    body.quaternion.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    world.addBody(body);
                    dice.push({ mesh, body });
                }
            };

            // Initial creation
            // We use the current state's diceCount, but we might want to pass it or read from ref if stale
            // For now, simple init is fine, useEffect([diceCount]) will handle updates
            createDice(1); // Default start, useEffect update will toggle

            // Animation Loop
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

            // Cleanup
            const cleanup = () => {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                renderer.dispose();
                if (canvasRef.current?.contains(renderer.domElement)) {
                    canvasRef.current.removeChild(renderer.domElement);
                }
            };

            sceneRef.current = {
                scene,
                camera,
                renderer,
                world,
                dice,
                cleanup,
                createDice
            };
        };

        // ResizeObserver
        resizeObserver = new ResizeObserver(() => {
            if (sceneRef.current) {
                if (!canvasRef.current) return;
                const width = canvasRef.current.clientWidth;
                const height = canvasRef.current.clientHeight;
                if (width === 0 || height === 0) return;

                sceneRef.current.camera.aspect = width / height;
                sceneRef.current.camera.updateProjectionMatrix();
                sceneRef.current.renderer.setSize(width, height);
            } else {
                initScene();
            }
        });

        if (canvasRef.current) {
            resizeObserver.observe(canvasRef.current);
        }

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            if (sceneRef.current) sceneRef.current.cleanup();
        };
    }, []);

    // --- Update Dice Count ---
    useEffect(() => {
        if (sceneRef.current && sceneRef.current.createDice) {
            sceneRef.current.createDice(diceCount);
        }
    }, [diceCount]);

    const rollDice = () => {
        if (!sceneRef.current || isRolling) return;
        setIsRolling(true);
        setResults([]);

        const { dice } = sceneRef.current;

        // Apply forces
        dice.forEach(d => {
            d.body.position.set(d.body.position.x, 5 + Math.random() * 2, d.body.position.z);
            d.body.velocity.set(
                (Math.random() - 0.5) * 15,
                10 + Math.random() * 5,
                (Math.random() - 0.5) * 15
            );
            d.body.angularVelocity.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            d.body.wakeUp();
        });

        // Wait for rest
        const checkInterval = setInterval(() => {
            if (!sceneRef.current) {
                clearInterval(checkInterval);
                return;
            }

            const allResting = sceneRef.current.dice.every(d =>
                d.body.velocity.length() < 0.1 && d.body.angularVelocity.length() < 0.1 && d.body.position.y < 2
            );

            if (allResting) {
                clearInterval(checkInterval);
                const finalResults = sceneRef.current.dice.map(getDieResult);
                setResults(finalResults);
                const total = finalResults.reduce((a, b) => a + b, 0);
                setRollHistory(prev => [{ dice: finalResults, total }, ...prev].slice(0, 10));
                setIsRolling(false);
            }
        }, 200);
    };

    const getDieResult = (die: { mesh: THREE.Mesh; body: CANNON.Body }) => {
        const up = new CANNON.Vec3(0, 1, 0);
        const quaternion = die.body.quaternion;

        const faces = [
            { normal: new CANNON.Vec3(0, 0, 1), value: 5 }, // Front
            { normal: new CANNON.Vec3(0, 0, -1), value: 6 }, // Back
            { normal: new CANNON.Vec3(0, 1, 0), value: 3 }, // Top
            { normal: new CANNON.Vec3(0, -1, 0), value: 4 }, // Bottom
            { normal: new CANNON.Vec3(1, 0, 0), value: 2 }, // Right
            { normal: new CANNON.Vec3(-1, 0, 0), value: 1 }, // Left
        ];

        let bestMatch = 0;
        let maxDot = -Infinity;

        faces.forEach(face => {
            const worldNormal = new CANNON.Vec3();
            quaternion.vmult(face.normal, worldNormal);
            const dot = worldNormal.dot(up);
            if (dot > maxDot) {
                maxDot = dot;
                bestMatch = face.value;
            }
        });

        return bestMatch;
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const selectDiceCount = (count: number) => {
        setDiceCount(count);
        setIsDropdownOpen(false);
    };

    const resetHistory = () => {
        setRollHistory([]);
        setResults([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-8 sm:py-12 px-4 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                            🎲 {t('title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 p-6 sm:p-8">

                    {/* Controls Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 relative z-30">
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={toggleDropdown}
                                className="w-full sm:w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-left flex items-center justify-between shadow-sm hover:border-indigo-400 transition-colors"
                            >
                                <span className="font-bold text-gray-700 dark:text-gray-200">
                                    {diceCount} {diceCount === 1 ? t('oneDie') : diceCount === 2 ? t('twoDice') : t('threeDice')}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl shadow-xl overflow-hidden z-40 animate-slide-up">
                                    {[1, 2, 3].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => selectDiceCount(num)}
                                            className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            {num} {num === 1 ? t('oneDie') : num === 2 ? t('twoDice') : t('threeDice')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {results.length > 0 && (
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 px-5 py-2 rounded-full border border-indigo-200 dark:border-indigo-800 animate-fade-in">
                                <span className="text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                                    {t('total')}: {results.reduce((a, b) => a + b, 0)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div
                        ref={canvasRef}
                        className="relative bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6 sm:mb-8 h-[300px] sm:h-[400px] w-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group"
                    >
                        {!isRolling && results.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 pointer-events-none z-10">
                                <span className="text-6xl mb-4 opacity-20 animate-bounce">🎲</span>
                                <p className="text-sm font-medium opacity-60">Tap Roll to Start</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={rollDice}
                        disabled={isRolling}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500 bg-[length:200%_100%] hover:bg-[100%_0%] text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 disabled:opacity-70 flex items-center justify-center gap-3 active:scale-[0.99]"
                    >
                        {isRolling ? t('rolling') : t('roll')}
                    </button>
                </div>

                {rollHistory.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                {t('history')}
                            </h3>
                            <button
                                onClick={resetHistory}
                                className="text-xs font-semibold text-red-500 hover:text-red-600"
                            >
                                {t('clear')}
                            </button>
                        </div>
                        <div className="space-y-3">
                            {rollHistory.map((roll, idx) => (
                                <div key={idx} className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700 text-sm">
                                    <div className="flex gap-2">
                                        {roll.dice.map((d, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-mono font-bold text-gray-700 dark:text-gray-300">
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Total: {roll.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
