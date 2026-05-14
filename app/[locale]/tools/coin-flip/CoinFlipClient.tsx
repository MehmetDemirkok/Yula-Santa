"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const COIN_RADIUS = 2;
const COIN_HEIGHT = 0.4;
const COIN_MASS = 1;

// ─── CLASSIC (Silver) Coin ───────────────────────────────────────────────────
const createCoinTextureClassic = (type: 'heads' | 'tails', logoImg?: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const cx = 512, cy = 512, r = 512;

    // Silver background
    const bg = ctx.createRadialGradient(cx, cy, 80, cx, cy, r);
    bg.addColorStop(0, '#f8fafc'); bg.addColorStop(0.4, '#e2e8f0');
    bg.addColorStop(0.8, '#cbd5e1'); bg.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 1024);

    // Brushed noise
    ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 200; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, Math.random() * r, 0, Math.PI * 2);
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.strokeStyle = Math.random() > 0.5 ? '#000' : '#fff'; ctx.stroke();
    }
    ctx.restore();

    // Outer rim
    ctx.beginPath(); ctx.arc(cx, cy, 480, 0, Math.PI * 2); ctx.lineWidth = 40; ctx.strokeStyle = '#e2e8f0'; ctx.stroke();
    const rimGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    rimGrad.addColorStop(0, '#ffffff'); rimGrad.addColorStop(0.5, '#94a3b8'); rimGrad.addColorStop(1, '#475569');
    ctx.strokeStyle = rimGrad; ctx.lineWidth = 30; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 440, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = '#cbd5e1'; ctx.stroke();

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowOffsetY = 4; ctx.shadowBlur = 4;

    if (type === 'tails' && logoImg) {
        const size = 500; ctx.drawImage(logoImg, cx - size / 2, cx - size / 2, size, size);
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 90px "Inter", sans-serif'; ctx.fillText('TURA', cx, 880);
    } else {
        ctx.fillStyle = '#334155'; ctx.font = 'bold 160px "Inter", sans-serif'; ctx.fillText('YULA', cx, 380);
        ctx.fillStyle = '#dc2626'; ctx.font = '900 180px "Inter", sans-serif';
        ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText('SANTA', cx, 540); ctx.fillText('SANTA', cx, 540);
        ctx.fillStyle = '#64748b'; ctx.font = 'bold 90px "Inter", sans-serif'; ctx.fillText('YAZI', cx, 880);
    }

    // Shine
    ctx.shadowColor = 'transparent';
    const shine = ctx.createLinearGradient(0, 0, 1024, 1024);
    shine.addColorStop(0.3, 'rgba(255,255,255,0)'); shine.addColorStop(0.45, 'rgba(255,255,255,0.2)');
    shine.addColorStop(0.5, 'rgba(255,255,255,0.5)'); shine.addColorStop(0.55, 'rgba(255,255,255,0.2)');
    shine.addColorStop(0.7, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine; ctx.fillRect(0, 0, 1024, 1024);

    return new THREE.CanvasTexture(canvas);
};

// ─── PREMIUM (Gold) Coin ──────────────────────────────────────────────────────
const createCoinTextureGold = (type: 'heads' | 'tails', logoImg?: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const cx = 512, cy = 512;

    // ── 1. Deep Gold Background ──
    const bg = ctx.createRadialGradient(cx - 80, cy - 80, 60, cx, cy, 520);
    bg.addColorStop(0, '#FFFACD');   // Lemon chiffon highlight
    bg.addColorStop(0.2, '#FFD700'); // Pure gold
    bg.addColorStop(0.5, '#DAA520'); // Goldenrod
    bg.addColorStop(0.75, '#B8860B'); // Dark goldenrod
    bg.addColorStop(1, '#7A5C00');   // Very dark gold edge
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 1024);

    // ── 2. Radial brushed lines (lathe-cut effect) ──
    ctx.save();
    for (let a = 0; a < Math.PI * 2; a += 0.012) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 520, cy + Math.sin(a) * 520);
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = a % 0.05 < 0.025 ? 'rgba(255,255,200,0.06)' : 'rgba(80,50,0,0.04)';
        ctx.stroke();
    }
    ctx.restore();

    // ── 3. Outer thick rim with bevel ──
    // Outer glow ring
    ctx.save();
    ctx.shadowColor = 'rgba(255, 220, 50, 0.6)';
    ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(cx, cy, 492, 0, Math.PI * 2);
    ctx.lineWidth = 22;
    const rimOut = ctx.createLinearGradient(0, 0, 1024, 1024);
    rimOut.addColorStop(0, '#FFFACD'); rimOut.addColorStop(0.3, '#FFD700');
    rimOut.addColorStop(0.7, '#B8860B'); rimOut.addColorStop(1, '#7A5C00');
    ctx.strokeStyle = rimOut; ctx.stroke();
    ctx.restore();

    // Inner rim line
    ctx.beginPath(); ctx.arc(cx, cy, 467, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,220,80,0.5)'; ctx.stroke();

    // ── 4. Reeded edge decoration (small dashes around outer rim) ──
    const reeds = 80;
    for (let i = 0; i < reeds; i++) {
        const angle = (i / reeds) * Math.PI * 2;
        const inner = 478, outer = 494;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,240,120,0.8)' : 'rgba(100,70,0,0.5)';
        ctx.stroke();
    }

    // ── 5. Inner decorative ring ──
    ctx.beginPath(); ctx.arc(cx, cy, 440, 0, Math.PI * 2);
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,220,50,0.4)'; ctx.stroke();

    // ── 6. Stars around inner circle (only heads side — adds elegance) ──
    if (type === 'heads') {
        const starCount = 12;
        const starR = 400;
        ctx.save();
        ctx.shadowColor = 'rgba(255,200,0,0.8)'; ctx.shadowBlur = 8;
        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2 - Math.PI / 2;
            const sx = cx + Math.cos(angle) * starR;
            const sy = cy + Math.sin(angle) * starR;
            drawStar(ctx, sx, sy, 5, 14, 6);
            const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
            g.addColorStop(0, '#FFFDE7'); g.addColorStop(1, '#FFD700');
            ctx.fillStyle = g; ctx.fill();
        }
        ctx.restore();
    }

    // ── 7. Content ──
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (type === 'tails' && logoImg) {
        // Gold tails: logo with circular ring of dots
        const dotCount = 24, dotR = 330;
        for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * dotR, cy + Math.sin(angle) * dotR, 8, 0, Math.PI * 2);
            const dg = ctx.createRadialGradient(
                cx + Math.cos(angle) * dotR, cy + Math.sin(angle) * dotR, 0,
                cx + Math.cos(angle) * dotR, cy + Math.sin(angle) * dotR, 8
            );
            dg.addColorStop(0, '#FFFDE7'); dg.addColorStop(1, '#DAA520');
            ctx.fillStyle = dg; ctx.fill();
        }

        // Logo with warm overlay
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy - 30, 240, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(logoImg, cx - 240, cy - 270, 480, 480);
        // Warm gold tint overlay
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#FFD700'; ctx.fillRect(0, 0, 1024, 1024);
        ctx.restore();

        // "TURA" label with deep emboss
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowOffsetY = 5; ctx.shadowBlur = 8;
        ctx.font = 'bold 88px "Inter", sans-serif';
        const turaGrad = ctx.createLinearGradient(cx - 150, 860, cx + 150, 920);
        turaGrad.addColorStop(0, '#FFFDE7'); turaGrad.addColorStop(0.5, '#FFD700'); turaGrad.addColorStop(1, '#B8860B');
        ctx.fillStyle = turaGrad; ctx.fillText('TURA', cx, 900);
        // Highlight stroke
        ctx.shadowColor = 'transparent'; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.strokeText('TURA', cx, 900);
    } else {
        // Gold heads: YULA SANTA with deep relief

        // YULA
        ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowOffsetY = 6; ctx.shadowBlur = 10;
        ctx.font = 'bold 155px "Inter", sans-serif';
        const yulaGrad = ctx.createLinearGradient(cx - 200, 280, cx + 200, 420);
        yulaGrad.addColorStop(0, '#FFFDE7'); yulaGrad.addColorStop(0.4, '#FFD700'); yulaGrad.addColorStop(1, '#B8860B');
        ctx.fillStyle = yulaGrad; ctx.fillText('YULA', cx, 360);
        ctx.shadowColor = 'transparent'; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.strokeText('YULA', cx, 360);

        // Divider line
        ctx.shadowColor = 'transparent';
        const divGrad = ctx.createLinearGradient(cx - 180, 450, cx + 180, 450);
        divGrad.addColorStop(0, 'transparent'); divGrad.addColorStop(0.5, 'rgba(255,220,80,0.6)'); divGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = divGrad; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 180, 455); ctx.lineTo(cx + 180, 455); ctx.stroke();

        // SANTA — crimson with gold outline
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowOffsetY = 7; ctx.shadowBlur = 12;
        ctx.font = '900 168px "Inter", sans-serif';
        // Gold outline
        ctx.lineWidth = 8; ctx.strokeStyle = '#FFD700'; ctx.strokeText('SANTA', cx, 560);
        // Red fill
        ctx.fillStyle = '#C0001A'; ctx.fillText('SANTA', cx, 560);
        // Bright edge highlight
        ctx.shadowColor = 'transparent'; ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,200,0,0.4)'; ctx.strokeText('SANTA', cx, 560);

        // YAZI
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowOffsetY = 4; ctx.shadowBlur = 6;
        ctx.font = 'bold 82px "Inter", sans-serif';
        const yaziGrad = ctx.createLinearGradient(cx - 120, 860, cx + 120, 910);
        yaziGrad.addColorStop(0, '#FFFDE7'); yaziGrad.addColorStop(0.5, '#FFD700'); yaziGrad.addColorStop(1, '#B8860B');
        ctx.fillStyle = yaziGrad; ctx.fillText('YAZI', cx, 890);
    }

    // ── 8. Final specular shine ──
    ctx.shadowColor = 'transparent';
    const shine = ctx.createLinearGradient(100, 100, 900, 900);
    shine.addColorStop(0, 'rgba(255,255,240,0)');
    shine.addColorStop(0.38, 'rgba(255,255,240,0.08)');
    shine.addColorStop(0.48, 'rgba(255,255,240,0.45)');
    shine.addColorStop(0.52, 'rgba(255,255,240,0.08)');
    shine.addColorStop(0.7, 'rgba(255,255,240,0)');
    ctx.fillStyle = shine; ctx.fillRect(0, 0, 1024, 1024);

    // ── 9. Vignette edge darkening ──
    const vignette = ctx.createRadialGradient(cx, cy, 350, cx, cy, 520);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, 1024, 1024);

    return new THREE.CanvasTexture(canvas);
};

// Helper: draw a star polygon
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, points: number, outer: number, inner: number) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const dist = i % 2 === 0 ? outer : inner;
        if (i === 0) ctx.moveTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
        else ctx.lineTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
    }
    ctx.closePath();
}

type CoinStyle = 'classic' | 'gold';

export default function CoinFlipPage() {
    const t = useTranslations('tools.coinFlipContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [result, setResult] = useState<'heads' | 'tails' | 'edge' | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipCount, setFlipCount] = useState({ heads: 0, tails: 0 });
    const [history, setHistory] = useState<Array<'heads' | 'tails'>>([]);
    const [coinStyle, setCoinStyle] = useState<CoinStyle>('gold');

    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        world: CANNON.World;
        coin: { mesh: THREE.Mesh; body: CANNON.Body };
        matSideClassic: THREE.MeshStandardMaterial;
        matSideGold: THREE.MeshStandardMaterial;
        logoImg: HTMLImageElement;
        cleanup: () => void;
    } | null>(null);

    // ── Apply coin style to mesh ──────────────────────────────────────────────
    const applyStyle = useCallback((style: CoinStyle) => {
        if (!sceneRef.current) return;
        const { coin: { mesh }, matSideClassic, matSideGold, logoImg } = sceneRef.current;
        const factory = style === 'gold' ? createCoinTextureGold : createCoinTextureClassic;
        const matSide = style === 'gold' ? matSideGold : matSideClassic;
        const faceProps = style === 'gold'
            ? { metalness: 0.7, roughness: 0.18 }
            : { metalness: 0.4, roughness: 0.3 };

        const mHeads = new THREE.MeshStandardMaterial({ map: factory('heads'), ...faceProps });
        const mTails = new THREE.MeshStandardMaterial({ map: factory('tails', logoImg.complete ? logoImg : undefined), ...faceProps });
        (mesh.material as THREE.Material[]).forEach(m => (m as THREE.MeshStandardMaterial).map?.dispose());
        mesh.material = [matSide, mHeads, mTails];
    }, []);

    // ── Scene init ────────────────────────────────────────────────────────────
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
            const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
            camera.position.set(0, 10, 8); camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            canvasRef.current.appendChild(renderer.domElement);

            const world = new CANNON.World();
            world.gravity.set(0, -25, 0);

            scene.add(new THREE.AmbientLight(0xffffff, 1.2));
            const dirLight = new THREE.DirectionalLight(0xfffae0, 2);
            dirLight.position.set(5, 10, 5); dirLight.castShadow = true; scene.add(dirLight);
            const spot = new THREE.SpotLight(0xfff3b0, 6);
            spot.position.set(-4, 6, -4); spot.lookAt(0, 0, 0); scene.add(spot);
            const fill = new THREE.PointLight(0xffffff, 1.5);
            fill.position.set(0, 8, 0); scene.add(fill);

            const groundBody = new CANNON.Body({
                type: CANNON.Body.STATIC, shape: new CANNON.Plane(),
                material: new CANNON.Material({ friction: 0.1, restitution: 0.4 })
            });
            groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            world.addBody(groundBody);

            const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.ShadowMaterial({ opacity: 0.2 }));
            groundMesh.rotation.x = -Math.PI / 2; groundMesh.receiveShadow = true; scene.add(groundMesh);

            const wallMat = new CANNON.Material({ friction: 0, restitution: 0.5 });
            [
                { pos: [8, 5, 0], rot: [0, -Math.PI / 2, 0] },
                { pos: [-8, 5, 0], rot: [0, Math.PI / 2, 0] },
                { pos: [0, 5, 6], rot: [0, Math.PI, 0] },
                { pos: [0, 5, -8], rot: [0, 0, 0] }
            ].forEach(w => {
                const b = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Box(new CANNON.Vec3(10, 10, 1)), material: wallMat });
                b.position.set(w.pos[0], w.pos[1], w.pos[2]);
                b.quaternion.setFromEuler(w.rot[0], w.rot[1], w.rot[2]);
                world.addBody(b);
            });

            // Side materials (one per style, pre-created)
            const matSideClassic = new THREE.MeshStandardMaterial({ color: '#c8d3dd', metalness: 0.4, roughness: 0.4 });
            const matSideGold = new THREE.MeshStandardMaterial({ color: '#C9980A', metalness: 0.75, roughness: 0.18 });

            const geo = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 64);
            const mesh = new THREE.Mesh(geo, [matSideGold, matSideGold, matSideGold]);
            mesh.castShadow = true; scene.add(mesh);

            const logoImg = new Image();
            logoImg.src = '/icon.png';

            const applyInitialStyle = () => {
                const style = coinStyle;
                const factory = style === 'gold' ? createCoinTextureGold : createCoinTextureClassic;
                const matSide = style === 'gold' ? matSideGold : matSideClassic;
                const faceProps = style === 'gold' ? { metalness: 0.7, roughness: 0.18 } : { metalness: 0.4, roughness: 0.3 };
                const mH = new THREE.MeshStandardMaterial({ map: factory('heads'), ...faceProps });
                const mT = new THREE.MeshStandardMaterial({ map: factory('tails', logoImg), ...faceProps });
                mesh.material = [matSide, mH, mT];
            };

            logoImg.onload = applyInitialStyle;
            if (logoImg.complete) applyInitialStyle();

            const body = new CANNON.Body({
                mass: COIN_MASS,
                shape: new CANNON.Cylinder(COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 32),
                material: new CANNON.Material({ friction: 0.1, restitution: 0.5 })
            });
            body.position.set(0, 0.5, 0); world.addBody(body);

            const animate = () => {
                world.fixedStep();
                mesh.position.copy(body.position as any);
                mesh.quaternion.copy(body.quaternion as any);
                if (body.position.y < -10) { body.position.set(0, 5, 0); body.velocity.set(0, 0, 0); }
                renderer.render(scene, camera);
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();

            sceneRef.current = {
                scene, camera, renderer, world,
                coin: { mesh, body },
                matSideClassic, matSideGold, logoImg,
                cleanup: () => {
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    renderer.dispose();
                    if (canvasRef.current?.contains(renderer.domElement))
                        canvasRef.current.removeChild(renderer.domElement);
                }
            };
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-apply style whenever user switches
    useEffect(() => { applyStyle(coinStyle); }, [coinStyle, applyStyle]);

    // ── Flip logic ────────────────────────────────────────────────────────────
    const flipCoin = useCallback(() => {
        if (isFlipping || !sceneRef.current) return;
        setIsFlipping(true); setResult(null);

        const { body } = sceneRef.current.coin;
        const { camera } = sceneRef.current;

        body.quaternion.setFromEuler(Math.random() * Math.PI * 0.1, Math.random() * Math.PI * 2, Math.random() * Math.PI * 0.1);
        body.position.set(0, 2, 0);
        body.velocity.set((Math.random() - 0.5) * 2, 18 + Math.random() * 10, (Math.random() - 0.5) * 2);
        body.angularVelocity.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100);

        const originalPos = camera.position.clone();
        let frames = 20;
        const shake = () => {
            if (frames-- > 0) {
                camera.position.set(originalPos.x + (Math.random() - 0.5) * 0.2, originalPos.y + (Math.random() - 0.5) * 0.2, originalPos.z + (Math.random() - 0.5) * 0.2);
                requestAnimationFrame(shake);
            } else camera.position.copy(originalPos);
        };
        shake();

        const checkInterval = setInterval(() => {
            if (body.velocity.length() < 0.1 && body.position.y < 3.0) {
                clearInterval(checkInterval);
                const coinUp = body.vectorToWorldFrame(new CANNON.Vec3(0, 1, 0));
                const dot = coinUp.dot(new CANNON.Vec3(0, 1, 0));
                const outcome: 'heads' | 'tails' | 'edge' = Math.abs(dot) < 0.2 ? 'edge' : dot > 0 ? 'heads' : 'tails';
                setResult(outcome);
                if (outcome !== 'edge') {
                    setFlipCount(p => ({ ...p, [outcome]: p[outcome] + 1 }));
                    setHistory(p => [outcome as 'heads' | 'tails', ...p].slice(0, 12));
                }
                setIsFlipping(false);
            }
        }, 100);
    }, [isFlipping]);

    const resetStats = () => { setFlipCount({ heads: 0, tails: 0 }); setResult(null); setHistory([]); };

    const total = flipCount.heads + flipCount.tails;
    const headsPercent = total > 0 ? Math.round((flipCount.heads / total) * 100) : 50;
    const tailsPercent = total > 0 ? Math.round((flipCount.tails / total) * 100) : 50;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 py-8 sm:py-12 px-4 transition-colors duration-300">
            {/* Decorative blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-200/30 dark:bg-amber-900/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-yellow-200/30 dark:bg-yellow-900/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-100/20 dark:bg-orange-900/5 blur-3xl" />
            </div>

            <div className="max-w-lg mx-auto relative">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${locale}`} className="p-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-md border border-white/60 dark:border-white/10 hover:shadow-lg hover:scale-105 transition-all duration-200" aria-label="Geri">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">🪙 {t('title')}</h1>
                        <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-0.5 font-medium">{t('subtitle')}</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden">

                    {/* Style Selector — sits above canvas */}
                    <div className="flex items-center justify-center gap-2 px-5 pt-4">
                        <button
                            onClick={() => setCoinStyle('classic')}
                            disabled={isFlipping}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                                coinStyle === 'classic'
                                    ? 'bg-slate-700 text-white border-slate-600 shadow-lg shadow-slate-500/20'
                                    : 'bg-white/60 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-slate-400'
                            }`}
                        >
                            <span className="text-base">🪙</span>
                            <span>Klasik</span>
                        </button>
                        <div className="text-gray-300 dark:text-gray-600 font-light select-none">|</div>
                        <button
                            onClick={() => setCoinStyle('gold')}
                            disabled={isFlipping}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                                coinStyle === 'gold'
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400 shadow-lg shadow-amber-400/30'
                                    : 'bg-white/60 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                            }`}
                        >
                            <span className="text-base">✨</span>
                            <span>Altın</span>
                        </button>
                    </div>

                    {/* 3D Canvas */}
                    <div className="relative mt-3">
                        <div className="absolute inset-0 rounded-none bg-gradient-to-b from-amber-400/5 via-transparent to-transparent pointer-events-none z-10" />

                        <div
                            ref={canvasRef}
                            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 h-[270px] sm:h-[350px] w-full overflow-hidden"
                        >
                            {/* Grid overlay */}
                            <div className="absolute inset-0 z-10 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                            {/* Result banner */}
                            {result && !isFlipping && (
                                <>
                                    {result === 'edge' ? (
                                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
                                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl max-w-xs w-full border-4 border-amber-400 text-center">
                                                <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-4 border-amber-200 shadow-inner">
                                                    <img src="/yula.jpeg" alt="Yula" className="w-full h-full object-cover" />
                                                </div>
                                                <h3 className="text-lg font-black text-amber-600 dark:text-amber-400 mb-1">🎲 OOPS!</h3>
                                                <p className="text-gray-700 dark:text-gray-200 text-sm font-medium">{t('edge')}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-slide-up">
                                            <div className={`px-8 py-2.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-sm ${
                                                result === 'heads'
                                                    ? 'bg-gradient-to-r from-slate-600 to-slate-700'
                                                    : 'bg-gradient-to-r from-red-600 to-rose-600'
                                            }`}>
                                                <span className="text-white font-black uppercase text-base tracking-widest whitespace-nowrap drop-shadow">
                                                    {result === 'heads' ? `✨ ${t('heads')}` : `🎯 ${t('tails')}`}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {!result && !isFlipping && total === 0 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                                    <p className="text-white/30 text-xs font-medium tracking-widest uppercase animate-pulse">Parayı atmak için butona bas</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 sm:p-7 space-y-5">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`rounded-2xl p-4 text-center border transition-all duration-300 ${
                                result === 'heads' && !isFlipping
                                    ? 'bg-slate-700 border-slate-500 shadow-lg shadow-slate-500/20 scale-[1.02]'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            }`}>
                                <p className={`text-4xl font-black tabular-nums ${result === 'heads' && !isFlipping ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{flipCount.heads}</p>
                                <p className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${result === 'heads' && !isFlipping ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>{t('heads')}</p>
                                {total > 0 && <p className={`text-xs mt-1 font-medium ${result === 'heads' && !isFlipping ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{headsPercent}%</p>}
                            </div>
                            <div className={`rounded-2xl p-4 text-center border transition-all duration-300 ${
                                result === 'tails' && !isFlipping
                                    ? 'bg-gradient-to-br from-red-600 to-rose-600 border-red-400 shadow-lg shadow-red-500/20 scale-[1.02]'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
                            }`}>
                                <p className={`text-4xl font-black tabular-nums ${result === 'tails' && !isFlipping ? 'text-white' : 'text-red-600 dark:text-red-400'}`}>{flipCount.tails}</p>
                                <p className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${result === 'tails' && !isFlipping ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>{t('tails')}</p>
                                {total > 0 && <p className={`text-xs mt-1 font-medium ${result === 'tails' && !isFlipping ? 'text-red-200' : 'text-slate-400 dark:text-slate-500'}`}>{tailsPercent}%</p>}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {total > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium px-0.5">
                                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{total} atış</span>
                                    <span>{headsPercent}% / {tailsPercent}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-slate-600 dark:bg-slate-500 transition-all duration-700 ease-out rounded-l-full" style={{ width: `${headsPercent}%` }} />
                                    <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-700 ease-out rounded-r-full" style={{ width: `${tailsPercent}%` }} />
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {history.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Son Atışlar</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {history.map((h, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm border transition-all duration-300 ${
                                            h === 'heads' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400 text-white'
                                        } ${i === 0 ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-gray-800 scale-110' : 'opacity-75'}`}>
                                            {h === 'heads' ? 'Y' : 'T'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Flip Button */}
                        <button
                            onClick={flipCoin}
                            disabled={isFlipping}
                            className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-xl transition-all duration-300 active:scale-[0.97] relative overflow-hidden group ${
                                isFlipping
                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 shadow-amber-300/50 dark:shadow-amber-900/50 hover:shadow-2xl hover:scale-[1.02]'
                            }`}
                        >
                            {!isFlipping && <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />}
                            <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest drop-shadow">
                                <span className={`text-2xl ${isFlipping ? 'animate-spin' : ''}`}>🪙</span>
                                {isFlipping ? t('rolling') : t('roll')}
                            </span>
                        </button>

                        {/* Reset */}
                        {total > 0 && (
                            <button onClick={resetStats} className="w-full py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 group">
                                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" aria-hidden="true" />
                                <span className="text-sm uppercase tracking-wide">{t('reset')}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* About */}
                <section className="mt-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur rounded-2xl p-5 sm:p-6 border border-white/50 dark:border-white/5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
                        {t('aboutTitle')}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('aboutText')}</p>
                </section>
            </div>
        </div>
    );
}
