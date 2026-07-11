"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, Shuffle, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { secureRandomIntInRange } from '@/lib/random';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RandomNumberPage() {
    const t = useTranslations('tools.randomNumberContent');
    const params = useParams();
    const locale = params.locale as string || 'tr';

    const [min, setMin] = useState(1);
    const [max, setMax] = useState(100);
    const [count, setCount] = useState(1);
    const [results, setResults] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateNumbers = () => {
        if (min >= max) return;

        setIsGenerating(true);

        setTimeout(() => {
            const numbers: number[] = [];
            for (let i = 0; i < count; i++) {
                numbers.push(secureRandomIntInRange(min, max));
            }
            setResults(numbers);
            setIsGenerating(false);
        }, 500);
    };

    const copyResults = () => {
        navigator.clipboard.writeText(results.join(', '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                            🔢 {t('title')}
                        </h1>
                        <p className="text-body-md text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <article className="ys-card p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div>
                            <label htmlFor="min-value" className="block text-label-md text-[var(--text-secondary)] mb-2">
                                {t('min')}
                            </label>
                            <Input
                                id="min-value"
                                type="number"
                                value={min}
                                onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                                className="text-lg font-medium focus:border-success-green"
                                aria-label="Minimum"
                            />
                        </div>
                        <div>
                            <label htmlFor="max-value" className="block text-label-md text-[var(--text-secondary)] mb-2">
                                {t('max')}
                            </label>
                            <Input
                                id="max-value"
                                type="number"
                                value={max}
                                onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                                className="text-lg font-medium focus:border-success-green"
                                aria-label="Maximum"
                            />
                        </div>
                        <div>
                            <label htmlFor="count-value" className="block text-label-md text-[var(--text-secondary)] mb-2">
                                {t('countLabel')}
                            </label>
                            <Input
                                id="count-value"
                                type="number"
                                value={count}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val > 0) setCount(val);
                                    else if (e.target.value === '') setCount(1);
                                }}
                                min="1"
                                max="1000"
                                className="text-lg font-medium focus:border-success-green"
                                aria-label="Count"
                            />
                        </div>
                    </div>

                    <div className="min-h-[150px] bg-[var(--surface-2)] rounded-xl p-6 mb-8 border border-[var(--border-light)]" aria-live="polite" aria-atomic="true">
                        {results.length > 0 ? (
                            <div className="flex flex-wrap gap-3 justify-center">
                                {results.map((num, index) => (
                                    <div
                                        key={index}
                                        className="w-16 h-16 bg-success-green rounded-xl shadow-lg flex items-center justify-center animate-fade-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <span className="text-xl font-black text-white">{num}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                                <div className="text-center">
                                    <Hash className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
                                    <p>{t('placeholder')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={generateNumbers}
                            disabled={isGenerating || min >= max}
                            size="lg"
                            className="w-full"
                        >
                            <Shuffle className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
                            {isGenerating ? t('rolling') : t('generate')}
                        </Button>

                        {results.length > 0 && (
                            <Button
                                onClick={copyResults}
                                variant="secondary"
                                className="w-full"
                            >
                                {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                                {copied ? 'OK!' : t('result')}
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
