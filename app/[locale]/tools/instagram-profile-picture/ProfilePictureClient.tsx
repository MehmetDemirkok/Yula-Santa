"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, AlertCircle, ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function InstagramProfilePicturePage() {
    const t = useTranslations('tools.instagramProfileContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = () => {
        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }

        setIsLoading(true);
        setError('');

        setTimeout(() => {
            setIsLoading(false);
            setError('Feature under development.');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-12 px-4 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                            🖼️ {t('title')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 mb-8 text-center text-white">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">{t('title')}</h2>
                        <p className="text-white/80 text-sm">
                            {t('helper')}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="instagram-profile-username" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Username
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium" aria-hidden="true">@</span>
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/20 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="text-center py-8" aria-live="polite">
                            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" role="status" />
                            <p className="text-gray-500 dark:text-gray-400">Wait...</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 text-center" role="alert">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
                            <p className="text-amber-700 dark:text-amber-400 font-medium">{error}</p>
                        </div>
                    )}
                </article>

                <section className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">{t('aboutTitle')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t('aboutText')}
                    </p>
                </section>
            </div>
        </div>
    );
}
