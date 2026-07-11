"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Instagram, Search, ChevronLeft, ChevronRight,
    X, Users, Grid3X3, User, CheckCircle, Lock, ExternalLink,
    ImageIcon, Volume2, VolumeX, Play
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/lib/ToastContext';
import { Button } from '@/components/ui/Button';

interface ProfileData {
    username: string;
    fullName: string;
    biography: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
    profilePicUrl: string;
    profilePicUrlHD: string;
    isPrivate: boolean;
    isVerified: boolean;
}

interface Story {
    id: string;
    url: string;
    type: 'photo' | 'video' | string;
    timestamp: string | null;
    expiringAt: string | null;
    username: string;
}

type Phase = 'idle' | 'loading-profile' | 'loading-stories' | 'done' | 'error';

function getLoadStepsProfile(t: ReturnType<typeof useTranslations<'tools.instagramStoryContent'>>) {
    return [t('loadStepProfile1'), t('loadStepProfile2'), t('loadStepProfile3')];
}
function getLoadStepsStories(t: ReturnType<typeof useTranslations<'tools.instagramStoryContent'>>) {
    return [t('loadStepStory1'), t('loadStepStory2'), t('loadStepStory3'), t('loadStepStory4')];
}

function formatCount(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

export default function InstagramStoryViewerPage() {
    const t = useTranslations('tools.instagramStoryContent');
    const params = useParams();
    const locale = (params.locale as string) || 'tr';
    const { toast } = useToast();

    const [username, setUsername] = useState('');
    const [phase, setPhase] = useState<Phase>('idle');
    const [loadStep, setLoadStep] = useState('');
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [storiesError, setStoriesError] = useState('');
    const [storiesErrorCode, setStoriesErrorCode] = useState<string | null>(null);

    // Story viewer state
    const [viewerOpen, setViewerOpen] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [muted, setMuted] = useState(true);
    const [progress, setProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const STORY_DURATION = 5000;

    const startProgress = useCallback(() => {
        if (progressInterval.current) clearInterval(progressInterval.current);
        setProgress(0);
        const start = Date.now();
        progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(pct);
            if (pct >= 100) {
                clearInterval(progressInterval.current!);
                setCurrentIdx(prev => {
                    if (prev < stories.length - 1) return prev + 1;
                    setViewerOpen(false);
                    return prev;
                });
            }
        }, 50);
    }, [stories.length]);

    useEffect(() => {
        if (viewerOpen && stories[currentIdx]?.type !== 'video') {
            startProgress();
        }
        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [viewerOpen, currentIdx, startProgress, stories]);

    const cycleLoadSteps = (steps: string[], setStep: (s: string) => void) => {
        let i = 0;
        setStep(steps[0]);
        const iv = setInterval(() => {
            i = (i + 1) % steps.length;
            setStep(steps[i]);
        }, 4000);
        return iv;
    };

    const handleSearch = async () => {
        const clean = username.trim().replace(/^@/, '');
        if (!clean) {
            toast.warning(t('enterUsername'));
            return;
        }

        setProfile(null);
        setStories([]);
        setStoriesError('');
        setStoriesErrorCode(null);
        setPhase('loading-profile');

        const profileIv = cycleLoadSteps(getLoadStepsProfile(t), setLoadStep);

        let fetchedProfile: ProfileData | null = null;
        try {
            const res = await fetch('/api/instagram/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: clean }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('enterUsername'));
            fetchedProfile = data as ProfileData;
            setProfile(fetchedProfile);
        } catch (err) {
            clearInterval(profileIv);
            const msg = err instanceof Error ? err.message : t('enterUsername');
            toast.error(msg);
            setPhase('error');
            return;
        }
        clearInterval(profileIv);

        // Now fetch stories
        setPhase('loading-stories');
        const storyIv = cycleLoadSteps(getLoadStepsStories(t), setLoadStep);

        try {
            const res = await fetch('/api/instagram/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: clean }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStoriesError(data.error || t('noStoriesError'));
                setStoriesErrorCode(data.code || null);
            } else if (data.stories && data.stories.length > 0) {
                setStories(data.stories);
                toast.success(t('storiesFound', { count: data.stories.length }));
            } else {
                setStoriesError(t('noStoriesError'));
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : t('noStoriesError');
            setStoriesError(msg);
        } finally {
            clearInterval(storyIv);
            setPhase('done');
        }
    };

    const openViewer = (idx: number) => {
        setCurrentIdx(idx);
        setViewerOpen(true);
    };

    const prevStory = () => setCurrentIdx(i => Math.max(0, i - 1));
    const nextStory = () => {
        if (currentIdx < stories.length - 1) setCurrentIdx(i => i + 1);
        else setViewerOpen(false);
    };

    const isLoading = phase === 'loading-profile' || phase === 'loading-stories';

    return (
        <div className="ys-page-shell py-12 px-4 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}/tools`}
                        className="p-2 rounded-lg bg-[var(--card-bg)] shadow-sm border border-[var(--border-light)] hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                    </Link>
                    <div>
                        <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)]">
                            📱 {t('title')}
                        </h1>
                        <p className="text-body-md text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="ys-card p-6 md:p-8 space-y-6">

                    {/* Hero Banner — Instagram-brand gradient kept as platform icon identity */}
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 text-center text-white">
                        <Instagram className="w-12 h-12 mx-auto mb-3" />
                        <h2 className="font-heading text-lg font-bold mb-1">{t('subtitle')}</h2>
                        <p className="text-white/80 text-sm">
                            {t('helper')}
                        </p>
                    </div>

                    {/* Search Input */}
                    <div>
                        <label className="block text-label-md text-[var(--text-secondary)] mb-2">
                            {t('searchLabel')}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium select-none">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value.replace('@', ''))}
                                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleSearch()}
                                    placeholder="kullaniciadi"
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] focus:border-[var(--input-focus)] focus:outline-none focus:ring-0 outline-none transition-colors text-[var(--text-primary)] disabled:opacity-50"
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={isLoading}>
                                <Search className="w-5 h-5" />
                                <span className="hidden sm:inline">{t('searchButton')}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-4 bg-[var(--surface-2)] border border-[var(--border-light)] rounded-xl animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-[var(--border-medium)] border-t-indigo-accent rounded-full animate-spin flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{loadStep}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        {phase === 'loading-stories' ? t('loadingNote') : t('waitPlease')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 w-full bg-[var(--border-light)] rounded-full h-1 overflow-hidden">
                                <div className="h-full w-full bg-gradient-to-r from-santa-red to-indigo-accent rounded-full animate-pulse" />
                            </div>
                        </div>
                    )}

                    {/* Profile Card */}
                    {profile && !isLoading && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Profile Header */}
                            <div className="flex items-center gap-4 p-4 bg-[var(--surface-2)] rounded-2xl mb-4">

                                {/* Story Ring + Profile Pic — Instagram-brand gradient kept as platform icon identity */}
                                <button
                                    onClick={() => stories.length > 0 && openViewer(0)}
                                    className={`relative flex-shrink-0 rounded-full ${stories.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    {/* Gradient ring (shows when stories exist) */}
                                    <div className={`absolute inset-0 rounded-full ${stories.length > 0 ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px]' : 'bg-[var(--border-medium)] p-[2px]'}`}>
                                        <div className="w-full h-full rounded-full bg-[var(--card-bg)]" />
                                    </div>
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--card-bg)] m-[3px]">
                                        {profile.profilePicUrl ? (
                                            <Image
                                                src={`/api/proxy-image?url=${encodeURIComponent(profile.profilePicUrlHD || profile.profilePicUrl)}`}
                                                alt={profile.username}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                                                <User className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    {stories.length > 0 && (
                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-santa-red rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-[var(--card-bg)]">
                                            {stories.length}
                                        </span>
                                    )}
                                </button>

                                {/* Profile Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-[var(--text-primary)] text-base">@{profile.username}</span>
                                        {profile.isVerified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />}
                                        {profile.isPrivate && <Lock className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />}
                                    </div>
                                    {profile.fullName && (
                                        <p className="text-sm text-[var(--text-secondary)] truncate">{profile.fullName}</p>
                                    )}
                                    <a
                                        href={`https://instagram.com/${profile.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-indigo-accent hover:underline mt-0.5"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        {t('viewProfile')}
                                    </a>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex justify-around py-3 border border-[var(--border-light)] rounded-xl mb-4">
                                <div className="text-center">
                                    <Grid3X3 className="w-4 h-4 mx-auto mb-1 text-[var(--text-muted)]" />
                                    <p className="font-bold text-[var(--text-primary)] text-sm">{formatCount(profile.postsCount)}</p>
                                    <p className="text-[11px] text-[var(--text-muted)]">{t('posts')}</p>
                                </div>
                                <div className="text-center">
                                    <Users className="w-4 h-4 mx-auto mb-1 text-[var(--text-muted)]" />
                                    <p className="font-bold text-[var(--text-primary)] text-sm">{formatCount(profile.followersCount)}</p>
                                    <p className="text-[11px] text-[var(--text-muted)]">{t('followers')}</p>
                                </div>
                                <div className="text-center">
                                    <User className="w-4 h-4 mx-auto mb-1 text-[var(--text-muted)]" />
                                    <p className="font-bold text-[var(--text-primary)] text-sm">{formatCount(profile.followsCount)}</p>
                                    <p className="text-[11px] text-[var(--text-muted)]">{t('followingLabel')}</p>
                                </div>
                            </div>

                            {profile.biography && (
                                <p className="text-sm text-[var(--text-secondary)] px-1 mb-4 whitespace-pre-line">{profile.biography}</p>
                            )}

                            {/* Stories section */}
                            {/* Blocked error (no session invalidation — just rate limited) */}
                            {storiesErrorCode === 'INSTAGRAM_BLOCKED' && (
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-center mb-4">
                                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-3">
                                        Instagram hikaye erişimini geçici olarak engelledi. Birkaç dakika sonra tekrar deneyin.
                                    </p>
                                    <a
                                        href={`https://instagram.com/stories/${profile.username}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm bg-santa-red text-white font-bold px-4 py-2 rounded-lg hover:shadow-md transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {t('viewOnInstagram')}
                                    </a>
                                </div>
                            )}

                            {stories.length > 0 ? (
                                <div>
                                    <p className="text-label-sm text-[var(--text-muted)] uppercase mb-2 px-1">
                                        {t('storiesTitle')} ({stories.length})
                                    </p>
                                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                                        {stories.map((s, i) => (
                                            <button
                                                key={s.id}
                                                onClick={() => openViewer(i)}
                                                className="flex-shrink-0 w-16 h-24 rounded-xl overflow-hidden relative border-2 border-santa-red shadow-md hover:scale-105 transition-transform"
                                            >
                                                {s.type === 'video' ? (
                                                    <div className="w-full h-full bg-black/80 flex items-center justify-center">
                                                        <Play className="w-6 h-6 text-white" />
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={`/api/proxy-image?url=${encodeURIComponent(s.url)}`}
                                                        alt={`Story ${i + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                                    <p className="text-white text-[9px] font-bold text-center">{i + 1}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : storiesError ? (
                                storiesErrorCode === 'NO_SESSION' || storiesErrorCode === 'SESSION_EXPIRED' ? (
                                    <div className="bg-indigo-accent/10 border border-indigo-accent/25 rounded-xl p-5">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="text-2xl">🔑</span>
                                            <div>
                                                <p className="text-sm font-bold text-indigo-accent mb-1">
                                                    {storiesErrorCode === 'SESSION_EXPIRED'
                                                        ? 'Instagram oturumu süresi doldu'
                                                        : 'Hikayeler için Instagram oturumu gerekiyor'}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    {storiesErrorCode === 'SESSION_EXPIRED'
                                                        ? 'INSTAGRAM_SESSION_ID\'yi tarayıcıdan yeni session cookie alarak güncelle.'
                                                        : '.env.local dosyasına INSTAGRAM_SESSION_ID ekle.'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-[var(--surface-2)] rounded-lg p-3 text-xs font-mono text-[var(--text-secondary)] space-y-1">
                                            <p className="font-bold text-[var(--text-primary)]">Nasıl alınır (tam cookie):</p>
                                            <p>1. instagram.com&apos;a giriş yap</p>
                                            <p>2. F12 → Network → herhangi bir istek → Request Headers</p>
                                            <p>3. <span className="bg-indigo-accent/15 px-1 rounded">Cookie</span> başlığının tüm değerini kopyala</p>
                                            <p>4. .env.local → <span className="bg-indigo-accent/15 px-1 rounded">INSTAGRAM_COOKIES=&lt;yapıştır&gt;</span></p>
                                        </div>
                                        <a
                                            href={`https://instagram.com/stories/${profile.username}/`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center gap-2 text-xs text-indigo-accent hover:underline"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            {t('viewOnInstagram')}
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-center">
                                        <ImageIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-3">
                                            {storiesError}
                                        </p>
                                        <a
                                            href={`https://instagram.com/stories/${profile.username}/`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm bg-santa-red text-white font-bold px-4 py-2 rounded-lg hover:shadow-md transition-all"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            {t('viewOnInstagram')}
                                        </a>
                                    </div>
                                )
                            ) : null}

                            {/* Search Again */}
                            <button
                                onClick={() => { setProfile(null); setStories([]); setStoriesError(''); setStoriesErrorCode(null); setPhase('idle'); setUsername(''); }}
                                className="mt-4 text-sm text-[var(--text-muted)] hover:text-indigo-accent transition-colors"
                            >
                                {t('searchAgain')}
                            </button>
                        </div>
                    )}

                    {/* Info Box (shown only when idle) */}
                    {phase === 'idle' && (
                        <div className="bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border-light)]">
                            <p className="text-label-sm text-[var(--text-muted)] uppercase mb-2">{t('howItWorks')}</p>
                            <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                                <li className="flex items-start gap-2"><span className="text-santa-red mt-0.5">①</span> {t('howStep1')}</li>
                                <li className="flex items-start gap-2"><span className="text-santa-red mt-0.5">②</span> {t('howStep2')}</li>
                                <li className="flex items-start gap-2"><span className="text-santa-red mt-0.5">③</span> {t('howStep3')}</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* About */}
                <section className="mt-6 ys-card p-6">
                    <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-2">{t('aboutTitle')}</h2>
                    <p className="text-body-md text-[var(--text-secondary)] leading-relaxed">
                        {t('aboutText')}
                    </p>
                </section>
            </div>

            {/* Story Viewer Modal — fullscreen overlay chrome intentionally stays on black regardless of theme */}
            {viewerOpen && stories.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    onClick={e => { if (e.target === e.currentTarget) setViewerOpen(false); }}
                >
                    {/* Progress bars */}
                    <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                        {stories.map((_, i) => (
                            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-none"
                                    style={{
                                        width: i < currentIdx ? '100%' : i === currentIdx ? `${progress}%` : '0%',
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Top bar */}
                    <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                                {profile?.profilePicUrl && (
                                    <Image
                                        src={`/api/proxy-image?url=${encodeURIComponent(profile.profilePicUrl)}`}
                                        alt={profile.username}
                                        width={32} height={32}
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                            </div>
                            <span className="text-white text-sm font-bold">@{stories[currentIdx]?.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMuted(m => !m)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setViewerOpen(false)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Story Media */}
                    <div className="relative w-full max-w-sm h-[80vh] flex items-center justify-center">
                        {stories[currentIdx]?.type === 'video' ? (
                            <video
                                ref={videoRef}
                                key={stories[currentIdx].id}
                                src={`/api/proxy-image?url=${encodeURIComponent(stories[currentIdx].url)}`}
                                className="w-full h-full object-contain rounded-2xl"
                                autoPlay
                                muted={muted}
                                playsInline
                                onEnded={nextStory}
                            />
                        ) : (
                            <Image
                                key={stories[currentIdx].id}
                                src={`/api/proxy-image?url=${encodeURIComponent(stories[currentIdx].url)}`}
                                alt={`Story ${currentIdx + 1}`}
                                fill
                                className="object-contain rounded-2xl"
                                unoptimized
                                priority
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <button
                        onClick={prevStory}
                        disabled={currentIdx === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextStory}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Story counter */}
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                        <span className="text-white/60 text-xs">{currentIdx + 1} / {stories.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
