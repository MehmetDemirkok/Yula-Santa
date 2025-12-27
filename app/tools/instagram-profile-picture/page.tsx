"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Instagram, Search, Download, AlertCircle, ImageIcon } from 'lucide-react';

export default function InstagramProfilePicturePage() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = () => {
        if (!username.trim()) {
            setError('Lütfen kullanıcı adı girin / Please enter a username');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate loading
        setTimeout(() => {
            setIsLoading(false);
            setError('Bu özellik henüz geliştirme aşamasındadır. / This feature is under development.');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/"
                        className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                            🖼️ Instagram Profil Resmi Büyütme
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Instagram Profile Picture Viewer</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                    {/* Instagram Gradient Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 mb-8 text-center text-white">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Profil Fotoğrafı Görüntüleyici</h2>
                        <p className="text-white/80 text-sm">
                            Instagram profil fotoğraflarını HD kalitede görüntüleyin ve indirin
                        </p>
                    </div>

                    {/* Username Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Kullanıcı Adı / Username
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value.replace('@', ''));
                                        setError('');
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="kullaniciadi / username"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">Profil fotoğrafı alınıyor... / Fetching profile picture...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <p className="text-amber-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-3">
                                <ImageIcon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">HD Kalite</h3>
                            <p className="text-sm text-gray-500">Tam çözünürlükte görüntüleme / Full resolution viewing</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3">
                                <Download className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">Kolay İndirme</h3>
                            <p className="text-sm text-gray-500">Tek tıkla indirin / Download with one click</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
