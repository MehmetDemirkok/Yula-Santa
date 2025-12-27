"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shuffle, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function ShortStrawPage() {
    const t = useTranslations('tools.shortStrawContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [participants, setParticipants] = useState<string[]>([]);
    const [newName, setNewName] = useState('');
    const [loser, setLoser] = useState<string | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const addParticipant = () => {
        if (newName.trim() && !participants.includes(newName.trim())) {
            setParticipants([...participants, newName.trim()]);
            setNewName('');
            setLoser(null);
        }
    };

    const removeParticipant = (name: string) => {
        setParticipants(participants.filter(p => p !== name));
        if (loser === name) setLoser(null);
    };

    const selectLoser = () => {
        if (participants.length < 2) return;

        setIsSelecting(true);
        setLoser(null);

        let count = 0;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * participants.length);
            setLoser(participants[randomIndex]);
            count++;
            if (count > 15) {
                clearInterval(interval);
                const finalIndex = Math.floor(Math.random() * participants.length);
                setLoser(participants[finalIndex]);
                setIsSelecting(false);
            }
        }, 100);
    };

    const reset = () => {
        setLoser(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-12 px-4">
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
                            🎋 {t('title')}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                    <div className="mb-6">
                        <label htmlFor="participant-name" className="block text-sm font-bold text-gray-700 mb-2">
                            {t('label')}
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="participant-name"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                                placeholder="Name..."
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            />
                            <button
                                onClick={addParticipant}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                            >
                                <Plus className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm font-bold text-gray-700 mb-3">
                            {t('label')} ({participants.length})
                        </p>
                        {participants.length > 0 ? (
                            <div className="flex flex-wrap gap-2" role="list">
                                {participants.map((name) => (
                                    <div
                                        key={name}
                                        role="listitem"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${loser === name && !isSelecting
                                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-500 scale-110 shadow-lg'
                                            : loser === name && isSelecting
                                                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-indigo-500'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <span className="font-medium">{name}</span>
                                        {!loser && (
                                            <button
                                                onClick={() => removeParticipant(name)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No participants yet</p>
                            </div>
                        )}
                    </div>

                    {loser && !isSelecting && (
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 mb-6 border border-red-100 animate-fade-in" aria-live="polite" aria-atomic="true">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                                    <span className="text-4xl" role="img">😱</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{t('lost')}</p>
                                <p className="text-3xl font-black text-red-600">{loser}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={selectLoser}
                            disabled={isSelecting || participants.length < 2}
                            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <Shuffle className={`w-5 h-5 ${isSelecting ? 'animate-spin' : ''}`} aria-hidden="true" />
                            {isSelecting ? 'Wait...' : t('draw')}
                        </button>

                        {loser && !isSelecting && (
                            <button
                                onClick={reset}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <Shuffle className="w-4 h-4" aria-hidden="true" />
                                {t('reset')}
                            </button>
                        )}
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
