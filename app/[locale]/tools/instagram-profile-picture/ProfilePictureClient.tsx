"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, AlertCircle, ImageIcon, Download, User, Users, Grid3X3, CheckCircle, Lock, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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

export default function InstagramProfilePicturePage() {
    const t = useTranslations('tools.instagramProfileContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const handleSearch = async () => {
        if (!username.trim()) {
            setError(t('errorEmptyUsername') || 'Please enter a username');
            return;
        }

        setIsLoading(true);
        setError('');
        setProfileData(null);

        try {
            const response = await fetch('/api/instagram/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('errorGeneric') || 'An error occurred');
            }

            setProfileData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errorGeneric') || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (isHD: boolean = true) => {
        if (!profileData) return;

        const imageUrl = isHD ? profileData.profilePicUrlHD : profileData.profilePicUrl;

        try {
            // Use proxy to avoid CORS issues
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            const response = await fetch(proxyUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${profileData.username}_profile_picture${isHD ? '_hd' : ''}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
        }
    };

    const handleReset = () => {
        setUsername('');
        setProfileData(null);
        setError('');
    };

    return (
        <div className="ys-page-shell py-12 px-4 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-lg bg-[var(--card-bg)] shadow-sm border border-[var(--border-light)] hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                    </Link>
                    <div>
                        <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)]">
                            🖼️ {t('title')}
                        </h1>
                        <p className="text-body-md text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="ys-card p-6 md:p-8">
                    {!profileData ? (
                        <>
                            {/* Instagram-brand hero banner — gradient kept as platform icon identity */}
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 mb-8 text-center text-white">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10" aria-hidden="true" />
                                </div>
                                <h2 className="font-heading text-xl font-bold mb-2">{t('title')}</h2>
                                <p className="text-white/80 text-sm">
                                    {t('helper')}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="instagram-profile-username" className="block text-label-md text-[var(--text-secondary)] mb-2">
                                    {t('usernameLabel') || 'Username'}
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium" aria-hidden="true">@</span>
                                        <input
                                            id="instagram-profile-username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value.replace('@', ''));
                                                setError('');
                                            }}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder={t('placeholder')}
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] focus:border-[var(--input-focus)] focus:outline-none focus:ring-0 outline-none transition-colors text-[var(--text-primary)] disabled:opacity-50"
                                        />
                                    </div>
                                    <Button onClick={handleSearch} disabled={isLoading}>
                                        <Search className="w-5 h-5" aria-hidden="true" />
                                        <span className="hidden sm:inline">{t('searchButton') || 'Search'}</span>
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            {/* Profile Picture — Instagram-brand ring gradient kept as platform icon identity */}
                            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-full p-1">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[var(--card-bg)] p-1">
                                        <Image
                                            src={`/api/proxy-image?url=${encodeURIComponent(profileData.profilePicUrlHD || profileData.profilePicUrl)}`}
                                            alt={`${profileData.username} profile picture`}
                                            width={256}
                                            height={256}
                                            className="w-full h-full rounded-full object-cover"
                                            unoptimized
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h2 className="font-heading text-headline-md text-[var(--text-primary)]">
                                        @{profileData.username}
                                    </h2>
                                    {profileData.isVerified && (
                                        <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500" />
                                    )}
                                    {profileData.isPrivate && (
                                        <Lock className="w-5 h-5 text-[var(--text-muted)]" />
                                    )}
                                </div>
                                {profileData.fullName && (
                                    <p className="text-body-lg text-[var(--text-secondary)] mb-2">
                                        {profileData.fullName}
                                    </p>
                                )}
                                {profileData.biography && (
                                    <p className="text-body-md text-[var(--text-muted)] max-w-md mx-auto mb-4 line-clamp-3">
                                        {profileData.biography}
                                    </p>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex justify-center gap-8 mb-8">
                                <div className="text-center">
                                    <Grid3X3 className="w-5 h-5 mx-auto mb-1 text-[var(--text-muted)]" />
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        {formatNumber(profileData.postsCount)}
                                    </p>
                                    <p className="text-label-sm text-[var(--text-muted)]">{t('posts') || 'Posts'}</p>
                                </div>
                                <div className="text-center">
                                    <Users className="w-5 h-5 mx-auto mb-1 text-[var(--text-muted)]" />
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        {formatNumber(profileData.followersCount)}
                                    </p>
                                    <p className="text-label-sm text-[var(--text-muted)]">{t('followers') || 'Followers'}</p>
                                </div>
                                <div className="text-center">
                                    <User className="w-5 h-5 mx-auto mb-1 text-[var(--text-muted)]" />
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        {formatNumber(profileData.followsCount)}
                                    </p>
                                    <p className="text-label-sm text-[var(--text-muted)]">{t('following') || 'Following'}</p>
                                </div>
                            </div>

                            {/* Download Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                                <Button onClick={() => handleDownload(true)}>
                                    <Download className="w-5 h-5" />
                                    {t('downloadHD') || 'Download HD'}
                                </Button>
                                <Button onClick={() => handleDownload(false)} variant="secondary">
                                    <Download className="w-5 h-5" />
                                    {t('downloadNormal') || 'Download Normal'}
                                </Button>
                            </div>

                            {/* Open in Instagram */}
                            <a
                                href={`https://instagram.com/${profileData.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-indigo-accent hover:underline mb-6"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t('openInInstagram') || 'Open in Instagram'}
                            </a>

                            {/* Search Again */}
                            <div className="pt-4 border-t border-[var(--border-light)]">
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-[var(--text-secondary)] hover:text-indigo-accent transition-colors"
                                >
                                    {t('searchAnother') || '← Search another profile'}
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-8" aria-live="polite">
                            <div className="w-16 h-16 border-4 border-[var(--border-medium)] border-t-indigo-accent rounded-full animate-spin mx-auto mb-4" role="status" />
                            <p className="text-[var(--text-secondary)]">{t('loading') || 'Fetching profile...'}</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 text-center" role="alert">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
                            <p className="text-amber-700 dark:text-amber-400 font-medium">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="mt-4 text-sm text-amber-600 dark:text-amber-500 hover:underline"
                            >
                                {t('tryAgain') || 'Try again'}
                            </button>
                        </div>
                    )}
                </article>

                <section className="mt-8 ys-card p-6">
                    <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-3">{t('aboutTitle')}</h2>
                    <p className="text-body-md text-[var(--text-secondary)] leading-relaxed">
                        {t('aboutText')}
                    </p>
                </section>
            </div>
        </div>
    );
}
