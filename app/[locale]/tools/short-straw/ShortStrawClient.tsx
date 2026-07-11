"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shuffle, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { secureRandomInt } from '@/lib/random';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
            const randomIndex = secureRandomInt(participants.length);
            setLoser(participants[randomIndex]);
            count++;
            if (count > 15) {
                clearInterval(interval);
                const finalIndex = secureRandomInt(participants.length);
                setLoser(participants[finalIndex]);
                setIsSelecting(false);
            }
        }, 100);
    };

    const reset = () => {
        setLoser(null);
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
                            🎋 {t('title')}
                        </h1>
                        <p className="text-body-md text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="ys-card p-6 md:p-8">
                    <div className="mb-6">
                        <label htmlFor="participant-name" className="block text-label-md text-[var(--text-secondary)] mb-2">
                            {t('label')}
                        </label>
                        <div className="flex gap-2">
                            <Input
                                id="participant-name"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                                placeholder="Name..."
                                className="flex-1 focus:border-indigo-accent"
                            />
                            <Button onClick={addParticipant} className="shrink-0 aspect-square p-0 w-11">
                                <Plus className="w-5 h-5" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-label-md text-[var(--text-secondary)] mb-3">
                            {t('label')} ({participants.length})
                        </p>
                        {participants.length > 0 ? (
                            <div className="flex flex-wrap gap-2" role="list">
                                {participants.map((name) => (
                                    <div
                                        key={name}
                                        role="listitem"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${loser === name && !isSelecting
                                            ? 'bg-santa-red text-white border-santa-red scale-110 shadow-lg'
                                            : loser === name && isSelecting
                                                ? 'bg-indigo-accent text-white border-indigo-accent'
                                                : 'bg-[var(--surface-2)] border-[var(--border-light)] text-[var(--text-secondary)]'
                                            }`}
                                    >
                                        <span className="font-medium">{name}</span>
                                        {!loser && (
                                            <button
                                                onClick={() => removeParticipant(name)}
                                                className="text-[var(--text-muted)] hover:text-santa-red transition-colors"
                                            >
                                                <X className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-[var(--text-muted)]">
                                <p>{t('noParticipants')}</p>
                            </div>
                        )}
                    </div>

                    {loser && !isSelecting && (
                        <div className="ys-winner-reveal text-center p-6 mb-6 animate-fade-in" aria-live="polite" aria-atomic="true">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white/15 rounded-full flex items-center justify-center shadow-xl animate-float">
                                <span className="text-4xl" role="img">😱</span>
                            </div>
                            <p className="text-label-sm text-white/80 mb-2">{t('lost')}</p>
                            <p className="text-3xl font-black text-white">{loser}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={selectLoser}
                            disabled={isSelecting || participants.length < 2}
                            size="lg"
                            className="w-full"
                        >
                            <Shuffle className={`w-5 h-5 ${isSelecting ? 'animate-spin' : ''}`} aria-hidden="true" />
                            {isSelecting ? t('selecting') : t('draw')}
                        </Button>

                        {loser && !isSelecting && (
                            <Button
                                onClick={reset}
                                variant="secondary"
                                className="w-full"
                            >
                                <Shuffle className="w-4 h-4" aria-hidden="true" />
                                {t('reset')}
                            </Button>
                        )}
                    </div>
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
