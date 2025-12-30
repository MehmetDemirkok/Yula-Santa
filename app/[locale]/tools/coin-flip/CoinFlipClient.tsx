"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coins, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// --- Constants ---
const COIN_RADIUS = 2;
const COIN_HEIGHT = 0.4;
const COIN_MASS = 1;

const createCoinTexture = (type: 'heads' | 'tails', logoImg?: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cx = 512;
    const cy = 512;
    const radius = 512;

    // 1. Brushed Metal Background
    const grad = ctx.createRadialGradient(cx, cy, 100, cx, cy, radius);
    grad.addColorStop(0, '#f8fafc');   // White center
    grad.addColorStop(0.4, '#e2e8f0'); // Light silver
    grad.addColorStop(0.8, '#cbd5e1'); // Darker silver
    grad.addColorStop(1, '#94a3b8');   // Edge shadow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Add circular noise
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, Math.random() * radius, 0, Math.PI * 2);
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.strokeStyle = Math.random() > 0.5 ? '#000' : '#fff';
        ctx.stroke();
    }
    ctx.restore();

    // 2. Embossed Rings
    ctx.beginPath();
    ctx.arc(cx, cy, 480, 0, Math.PI * 2);
    ctx.lineWidth = 40;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    const rimGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    rimGrad.addColorStop(0, '#ffffff');
    rimGrad.addColorStop(0.5, '#94a3b8');
    rimGrad.addColorStop(1, '#475569');
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 30;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 440, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    // 3. Content
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 4;

    if (type === 'tails' && logoImg) {
        // Tura: Yula Logo
        const size = 500;
        ctx.drawImage(logoImg, cx - size / 2, cx - size / 2, size, size);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 90px "Inter", sans-serif';
        ctx.fillText('TURA', cx, 880);
    } else {
        // Yazı: Circular Text + Center Text
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 160px "Inter", sans-serif';
        ctx.fillText('YULA', cx, 380);

        ctx.fillStyle = '#dc2626';
        ctx.font = '900 180px "Inter", sans-serif';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fff';
        ctx.strokeText('SANTA', cx, 540);
        ctx.fillText('SANTA', cx, 540);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 90px "Inter", sans-serif';
        ctx.fillText('YAZI', cx, 880);
    }

    // 4. Final Specular Shine
    const shine = ctx.createLinearGradient(0, 0, 1024, 1024);
    shine.addColorStop(0.3, 'rgba(255,255,255,0)');
    shine.addColorStop(0.45, 'rgba(255,255,255,0.2)');
    shine.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    shine.addColorStop(0.55, 'rgba(255,255,255,0.2)');
    shine.addColorStop(0.7, 'rgba(255,255,255,0)');

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, 1024, 1024);

    return new THREE.CanvasTexture(canvas);
};

export default function CoinFlipPage() {
    const t = useTranslations('tools.coinFlipContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [result, setResult] = useState<'heads' | 'tails' | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipCount, setFlipCount] = useState({ heads: 0, tails: 0 });

    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        world: CANNON.World;
        coin: { mesh: THREE.Mesh; body: CANNON.Body };
        cleanup: () => void;
    } | null>(null);

    // --- Initialization ---
    useEffect(() => {
        if (!canvasRef.current) return;

        let resizeObserver: ResizeObserver | null = null;
        let animationFrameId: number | null = null;

        const initScene = () => {
            if (!canvasRef.current) return;
            const width = canvasRef.current.clientWidth;
            const height = canvasRef.current.clientHeight;

            if (width === 0 || height === 0) return; // Wait for layout

            // Cleanup previous if exists
            if (sceneRef.current) {
                sceneRef.current.cleanup();
            }

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
            camera.position.set(0, 10, 8);
            camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            canvasRef.current.appendChild(renderer.domElement);

            const world = new CANNON.World();
            world.gravity.set(0, -25, 0);

            // Lights - Studio Setup
            const amb = new THREE.AmbientLight(0xffffff, 1.2);
            scene.add(amb);

            const dirLight = new THREE.DirectionalLight(0xfffae0, 2);
            dirLight.position.set(5, 10, 5);
            dirLight.castShadow = true;
            scene.add(dirLight);

            const spot = new THREE.SpotLight(0xdbeafe, 5);
            spot.position.set(-5, 0, -5);
            spot.lookAt(0, 0, 0);
            scene.add(spot);

            const point = new THREE.PointLight(0xffffff, 1);
            point.position.set(0, 8, 0);
            scene.add(point);

            // Physics Floor
            const groundBody = new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Plane(),
                material: new CANNON.Material({ friction: 0.1, restitution: 0.4 })
            });
            groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            world.addBody(groundBody);

            const groundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(50, 50),
                new THREE.ShadowMaterial({ opacity: 0.2 })
            );
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.receiveShadow = true;
            scene.add(groundMesh);

            // Invisible Walls
            const wallMaterial = new CANNON.Material({ friction: 0, restitution: 0.5 });
            const wallThickness = 1;
            const constraintSize = 8;

            const walls = [
                { pos: [constraintSize, 5, 0], rot: [0, -Math.PI / 2, 0] },
                { pos: [-constraintSize, 5, 0], rot: [0, Math.PI / 2, 0] },
                { pos: [0, 5, constraintSize - 2], rot: [0, Math.PI, 0] },
                { pos: [0, 5, -constraintSize], rot: [0, 0, 0] }
            ];

            walls.forEach(w => {
                const wallBody = new CANNON.Body({
                    type: CANNON.Body.STATIC,
                    shape: new CANNON.Box(new CANNON.Vec3(10, 10, wallThickness)),
                    material: wallMaterial
                });
                wallBody.position.set(w.pos[0], w.pos[1], w.pos[2]);
                wallBody.quaternion.setFromEuler(w.rot[0], w.rot[1], w.rot[2]);
                world.addBody(wallBody);
            });

            // Coin Setup
            const logoImg = new Image();
            logoImg.src = '/icon.png';

            const matSide = new THREE.MeshStandardMaterial({
                color: '#e2e8f0',
                metalness: 0.4,
                roughness: 0.4
            });

            const geo = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 64);
            const mesh = new THREE.Mesh(geo, [matSide, matSide, matSide]);
            mesh.castShadow = true;
            scene.add(mesh);

            logoImg.onload = () => {
                const matFaceProps = { metalness: 0.4, roughness: 0.3 };
                const mHeads = new THREE.MeshStandardMaterial({ map: createCoinTexture('heads'), ...matFaceProps });
                const mTails = new THREE.MeshStandardMaterial({ map: createCoinTexture('tails', logoImg), ...matFaceProps });
                mesh.material = [matSide, mHeads, mTails];
            };

            if (!logoImg.complete) {
                const mHeads = new THREE.MeshStandardMaterial({ map: createCoinTexture('heads'), metalness: 0.4, roughness: 0.3 });
                mesh.material = [matSide, mHeads, matSide];
            }

            const body = new CANNON.Body({
                mass: COIN_MASS,
                shape: new CANNON.Cylinder(COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 32),
                material: new CANNON.Material({ friction: 0.1, restitution: 0.5 })
            });
            body.position.set(0, 0.5, 0);
            world.addBody(body);

            // Animation Loop
            const animate = () => {
                world.fixedStep();
                mesh.position.copy(body.position as any);
                mesh.quaternion.copy(body.quaternion as any);

                if (body.position.y < -10) {
                    body.position.set(0, 5, 0);
                    body.velocity.set(0, 0, 0);
                }

                renderer.render(scene, camera);
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();

            // Cleanup function for this scene instance
            const cleanup = () => {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                renderer.dispose();
                if (canvasRef.current?.contains(renderer.domElement)) {
                    canvasRef.current.removeChild(renderer.domElement);
                }
            };

            sceneRef.current = { scene, camera, renderer, world, coin: { mesh, body }, cleanup };
        };

        // Initialize ResizeObserver
        resizeObserver = new ResizeObserver(() => {
            if (sceneRef.current) {
                // Determine if we need to resize or re-init
                if (!canvasRef.current) return;
                const width = canvasRef.current.clientWidth;
                const height = canvasRef.current.clientHeight;

                if (width === 0 || height === 0) return;

                sceneRef.current.camera.aspect = width / height;
                sceneRef.current.camera.updateProjectionMatrix();
                sceneRef.current.renderer.setSize(width, height);
            } else {
                // Try initial init
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

    const flipCoin = useCallback(() => {
        if (isFlipping || !sceneRef.current) return;
        setIsFlipping(true);
        setResult(null);

        const { body } = sceneRef.current.coin;
        const { camera } = sceneRef.current;

        // Start flip
        body.position.set(0, 1, 0);
        body.velocity.set(0, 20 + Math.random() * 5, 0);
        body.angularVelocity.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5,
            30 + Math.random() * 20
        );

        // Shake Effect
        const originalPos = camera.position.clone();
        let shakeFrames = 20;
        const shake = () => {
            if (shakeFrames > 0) {
                camera.position.set(
                    originalPos.x + (Math.random() - 0.5) * 0.2,
                    originalPos.y + (Math.random() - 0.5) * 0.2,
                    originalPos.z + (Math.random() - 0.5) * 0.2
                );
                shakeFrames--;
                requestAnimationFrame(shake);
            } else {
                camera.position.copy(originalPos);
            }
        };
        shake();

        const checkInterval = setInterval(() => {
            if (body.velocity.length() < 0.1 && body.position.y < 0.6) {
                clearInterval(checkInterval);

                // Detect Face
                const up = new CANNON.Vec3(0, 1, 0);
                const coinUp = body.vectorToWorldFrame(new CANNON.Vec3(0, 1, 0));
                const dot = coinUp.dot(up);

                const outcome = dot > 0 ? 'heads' : 'tails';
                setResult(outcome);
                setFlipCount(prev => ({
                    ...prev,
                    [outcome]: prev[outcome] + 1
                }));
                setIsFlipping(false);
            }
        }, 100);
    }, [isFlipping]);

    const resetStats = () => {
        setFlipCount({ heads: 0, tails: 0 });
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-8 sm:py-12 px-4 transition-colors duration-300">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                            🪙 {t('title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 p-6 sm:p-8">
                    <div
                        ref={canvasRef}
                        className="relative bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8 h-[300px] sm:h-[400px] w-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner"
                    >

                        {result && !isFlipping && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-slide-up">
                                <div className={`px-6 py-2 rounded-full shadow-lg border border-white/20 ${result === 'heads'
                                    ? 'bg-gradient-to-r from-slate-700 to-slate-600'
                                    : 'bg-gradient-to-r from-red-600 to-red-500'
                                    }`}>
                                    <span className="text-white font-black uppercase text-sm tracking-widest whitespace-nowrap flex items-center gap-2">
                                        {result === 'heads' ? t('heads') : t('tails')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Heads Stats (Yazı - Silver/Slate Theme) */}
                        <div className="bg-gradient-to-br from-slate-100 to-gray-50 dark:from-slate-800/50 dark:to-gray-900/50 rounded-2xl p-5 text-center border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                            <p className="text-4xl font-black text-slate-700 dark:text-slate-300 relative z-10">{flipCount.heads}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide relative z-10">{t('heads')}</p>
                        </div>

                        {/* Tails Stats (Tura - Red/Santa Theme) */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-5 text-center border border-red-100 dark:border-red-900/30 relative overflow-hidden group">
                            <p className="text-4xl font-black text-red-600 dark:text-red-500 relative z-10">{flipCount.tails}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide relative z-10">{t('tails')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={flipCoin}
                            disabled={isFlipping}
                            className="w-full py-5 bg-gradient-to-r from-slate-700 via-gray-600 to-slate-700 dark:from-blue-600 dark:via-blue-500 dark:to-blue-600 bg-[length:200%_100%] hover:bg-[100%_0%] text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            <Coins className={`w-6 h-6 relative z-10 ${isFlipping ? 'animate-spin' : ''}`} aria-hidden="true" />
                            <span className="relative z-10 uppercase tracking-wider">{isFlipping ? t('rolling') : t('roll')}</span>
                        </button>

                        {(flipCount.heads > 0 || flipCount.tails > 0) && (
                            <button
                                onClick={resetStats}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:text-red-500 dark:hover:text-red-400"
                            >
                                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                <span className="text-sm uppercase tracking-tight">{t('reset')}</span>
                            </button>
                        )}
                    </div>
                </article>

                <section className="mt-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur rounded-3xl p-6 sm:p-8 border border-white/50 dark:border-white/5 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                        {t('aboutTitle')}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t('aboutText')}
                    </p>
                </section>
            </div>
        </div>
    );
}
