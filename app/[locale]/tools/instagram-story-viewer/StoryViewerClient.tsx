"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Instagram, Search, Eye, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function InstagramStoryViewerPage() {
    const t = useTranslations('tools.instagramStoryContent');
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                            📱 {t('title')}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 mb-8 text-center text-white">
                        <Instagram className="w-16 h-16 mx-auto mb-4" aria-hidden="true" />
                        <h2 className="text-xl font-bold mb-2">{t('title')}</h2>
                        <p className="text-white/80 text-sm">
                            {t('helper')}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="instagram-username" className="block text-sm font-bold text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium" aria-hidden="true">@</span>
                                <input
                                    id="instagram-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value.replace('@', ''));
                                        setError('');
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={t('placeholder')}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="text-center py-8" aria-live="polite">
                            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" role="status" />
                            <p className="text-gray-500">Wait...</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center" role="alert">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
                            <p className="text-amber-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Eye className="w-5 h-5" aria-hidden="true" />
                            Info
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• {t('helper')}</li>
                        </ul>
                    </div>
                </article>

                <section className="mt-8 bg-white/60 backdrop-blur rounded-2xl p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">{t('aboutTitle')}</h2>
                    <p className="text-sm text-gray-600">
                        {t('aboutText')}
                    </p>
                </section>
            </div>
        </div>
    );
}
