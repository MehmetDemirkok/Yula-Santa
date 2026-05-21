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
            if (!res.ok) throw new Error(data.error || t('noStoriesError'));
            if (data.stories && data.stories.length > 0) {
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-12 px-4 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}/tools`}
                        className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                            📱 {t('title')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-6">

                    {/* Hero Banner */}
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 text-center text-white">
                        <Instagram className="w-12 h-12 mx-auto mb-3" />
                        <h2 className="text-lg font-bold mb-1">{t('subtitle')}</h2>
                        <p className="text-white/80 text-sm">
                            {t('helper')}
                        </p>
                    </div>

                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {t('searchLabel')}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value.replace('@', ''))}
                                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleSearch()}
                                    placeholder="kullaniciadi"
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/20 outline-none transition-all dark:text-white disabled:opacity-50"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                <span className="hidden sm:inline">Ara</span>
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-4 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-xl animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-pink-700 dark:text-pink-400">{loadStep}</p>
                                    <p className="text-xs text-pink-400 dark:text-pink-500 mt-0.5">
                                        {phase === 'loading-stories' ? t('loadingNote') : t('waitPlease')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 w-full bg-pink-100 dark:bg-pink-900/30 rounded-full h-1 overflow-hidden">
                                <div className="h-full w-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                    )}

                    {/* Profile Card */}
                    {profile && !isLoading && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Profile Header */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-4">

                                {/* Story Ring + Profile Pic */}
                                <button
                                    onClick={() => stories.length > 0 && openViewer(0)}
                                    className={`relative flex-shrink-0 rounded-full ${stories.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    {/* Gradient ring (shows when stories exist) */}
                                    <div className={`absolute inset-0 rounded-full ${stories.length > 0 ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px]' : 'bg-gray-300 dark:bg-gray-600 p-[2px]'}`}>
                                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 m-[3px]">
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
                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white dark:border-gray-800">
                                            {stories.length}
                                        </span>
                                    )}
                                </button>

                                {/* Profile Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-gray-900 dark:text-white text-base">@{profile.username}</span>
                                        {profile.isVerified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />}
                                        {profile.isPrivate && <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                    </div>
                                    {profile.fullName && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile.fullName}</p>
                                    )}
                                    <a
                                        href={`https://instagram.com/${profile.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-purple-500 hover:underline mt-0.5"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        {t('viewProfile')}
                                    </a>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex justify-around py-3 border border-gray-100 dark:border-gray-700 rounded-xl mb-4">
                                <div className="text-center">
                                    <Grid3X3 className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCount(profile.postsCount)}</p>
                                    <p className="text-[11px] text-gray-400">{t('posts')}</p>
                                </div>
                                <div className="text-center">
                                    <Users className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCount(profile.followersCount)}</p>
                                    <p className="text-[11px] text-gray-400">{t('followers')}</p>
                                </div>
                                <div className="text-center">
                                    <User className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCount(profile.followsCount)}</p>
                                    <p className="text-[11px] text-gray-400">{t('followingLabel')}</p>
                                </div>
                            </div>

                            {profile.biography && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 px-1 mb-4 whitespace-pre-line">{profile.biography}</p>
                            )}

                            {/* Stories section */}
                            {stories.length > 0 ? (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-1">
                                        {t('storiesTitle')} ({stories.length})
                                    </p>
                                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                                        {stories.map((s, i) => (
                                            <button
                                                key={s.id}
                                                onClick={() => openViewer(i)}
                                                className="flex-shrink-0 w-16 h-24 rounded-xl overflow-hidden relative border-2 border-pink-400 shadow-md hover:scale-105 transition-transform"
                                            >
                                                {s.type === 'video' ? (
                                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
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
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-center">
                                    <ImageIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-3">
                                        {storiesError}
                                    </p>
                                    <a
                                        href={`https://instagram.com/stories/${profile.username}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-md transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {t('viewOnInstagram')}
                                    </a>
                                </div>
                            ) : null}

                            {/* Search Again */}
                            <button
                                onClick={() => { setProfile(null); setStories([]); setStoriesError(''); setPhase('idle'); setUsername(''); }}
                                className="mt-4 text-sm text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                {t('searchAgain')}
                            </button>
                        </div>
                    )}

                    {/* Info Box (shown only when idle) */}
                    {phase === 'idle' && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t('howItWorks')}</p>
                            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-start gap-2"><span className="text-pink-500 mt-0.5">①</span> {t('howStep1')}</li>
                                <li className="flex items-start gap-2"><span className="text-pink-500 mt-0.5">②</span> {t('howStep2')}</li>
                                <li className="flex items-start gap-2"><span className="text-pink-500 mt-0.5">③</span> {t('howStep3')}</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* About */}
                <section className="mt-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white mb-2">{t('aboutTitle')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t('aboutText')}
                    </p>
                </section>
            </div>

            {/* Story Viewer Modal */}
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
