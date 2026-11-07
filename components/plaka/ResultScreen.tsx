'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, Home, RotateCcw, Share2, Trophy, Zap } from 'lucide-react';
import { ACHIEVEMENT_BY_ID } from '@/lib/plaka/achievements';
import { formatPlate } from '@/lib/plaka/cities';
import { STANDARD_QUESTION_COUNT } from '@/lib/plaka/game';
import { SITE_URL } from '@/lib/constants';
import { localePath } from '@/lib/localePath';
import type { GameSummary } from '@/lib/plaka/contracts';
import styles from './PlakaAvcisi.module.css';

type Props = {
    locale: string;
    summary: GameSummary;
    onReplay: () => void;
    onHome: () => void;
    replaying: boolean;
};

function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function ResultScreen({ locale, summary, onReplay, onHome, replaying }: Props) {
    const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const celebratedRef = useRef(false);

    // A first game beats a best of zero, which isn't a record worth announcing.
    const beatRecord = summary.newRecord && summary.previousBest > 0;
    const perfectRound =
        summary.answered >= STANDARD_QUESTION_COUNT && summary.correct === summary.answered;

    useEffect(() => {
        if (celebratedRef.current || !(beatRecord || perfectRound)) return;
        celebratedRef.current = true;
        // Loaded on demand: most results never need the confetti library.
        void import('@/lib/celebrate').then(({ celebrate }) => celebrate());
    }, [beatRecord, perfectRound]);

    const handleShare = async () => {
        const url = `${SITE_URL}${localePath(locale, '/oyun/plaka-avcisi')}`;
        const text = `Plaka Avcısı${summary.daily ? ' Günün Meydan Okuması' : ''}: ${summary.answered} soruda ${summary.correct} doğru, ${summary.score} puan. Sen kaç yaparsın?`;
        try {
            if (typeof navigator.share === 'function') {
                await navigator.share({ title: 'Plaka Avcısı', text, url });
                return;
            }
            await navigator.clipboard.writeText(`${text} ${url}`);
            setShareState('copied');
        } catch (error) {
            // Closing the share sheet rejects with AbortError; that isn't a failure.
            if (error instanceof DOMException && error.name === 'AbortError') return;
            setShareState('failed');
        }
    };

    const unlocked = summary.unlockedAchievements
        .map((item) => ({ ...item, def: ACHIEVEMENT_BY_ID.get(item.id) }))
        .filter((item) => item.def);

    const comparison = beatRecord ? (
        <>
            Yeni rekor! Önceki en iyi skorun <span className={styles.compareStrong}>{summary.previousBest}</span>{' '}
            puandı.
        </>
    ) : summary.previousBest > 0 ? (
        <>
            Rekorun <span className={styles.compareStrong}>{summary.previousBest}</span> puan. Bu tur{' '}
            <span className={styles.compareStrong}>{summary.score}</span> —{' '}
            {summary.previousBest - summary.score > 0
                ? `${summary.previousBest - summary.score} puan kaldı.`
                : 'Rekora eşitlendin.'}
        </>
    ) : (
        <>
            İlk skorun kaydedildi:{' '}
            <span className={styles.compareStrong}>{summary.score} puan</span>. Rekor avı başlasın.
        </>
    );

    return (
        <div className={styles.shell} lang="tr" dir="ltr">
            <div className={styles.container}>
                <div className={styles.resultWrap}>
                    <div className={styles.resultHero}>
                        <div className={styles.resultEyebrow}>
                            {summary.modeTitle} · {summary.levelLabel}
                            {summary.daily ? ' · Günün meydan okuması' : ''}
                        </div>
                        <div className={styles.resultScore}>{summary.score}</div>
                        <div className={styles.resultScoreLabel}>Toplam puan</div>

                        {beatRecord ? (
                            <div className={styles.recordBadge}>
                                <Trophy size={13} aria-hidden="true" /> Yeni kişisel rekor
                            </div>
                        ) : null}
                    </div>

                    <div className={styles.resultGrid}>
                        <div className={styles.resultCell}>
                            <div className={`${styles.resultCellValue} ${styles.resultCellValueGood}`}>
                                {summary.correct}
                            </div>
                            <div className={styles.resultCellLabel}>Doğru</div>
                        </div>
                        <div className={styles.resultCell}>
                            <div className={`${styles.resultCellValue} ${styles.resultCellValueBad}`}>
                                {summary.wrong}
                            </div>
                            <div className={styles.resultCellLabel}>Yanlış</div>
                        </div>
                        <div className={styles.resultCell}>
                            <div className={styles.resultCellValue}>%{summary.accuracy}</div>
                            <div className={styles.resultCellLabel}>Başarı</div>
                        </div>
                        <div className={styles.resultCell}>
                            <div className={styles.resultCellValue}>{formatDuration(summary.durationMs)}</div>
                            <div className={styles.resultCellLabel}>Süre</div>
                        </div>
                        <div className={styles.resultCell}>
                            <div className={styles.resultCellValue}>{summary.bestStreak}</div>
                            <div className={styles.resultCellLabel}>En uzun seri</div>
                        </div>
                        <div className={styles.resultCell}>
                            <div className={styles.resultCellValue}>
                                {summary.totalQuestions > 0
                                    ? `${summary.answered}/${summary.totalQuestions}`
                                    : '—'}
                            </div>
                            <div className={styles.resultCellLabel}>Cevaplanan</div>
                        </div>
                        <div className={styles.resultCell}>
                            <div className={styles.resultCellValue}>{summary.totalScore}</div>
                            <div className={styles.resultCellLabel}>Toplam puanın</div>
                        </div>
                        <div className={styles.resultCell}>
                            <div className={styles.resultCellValue}>{summary.gamesPlayed}</div>
                            <div className={styles.resultCellLabel}>Oynanan oyun</div>
                        </div>
                    </div>

                    <div className={styles.compare}>{comparison}</div>

                    {unlocked.length > 0 ? (
                        <section className={styles.panel} style={{ marginTop: '1rem' }} aria-live="polite">
                            <div className={styles.panelHead}>
                                <h2 className={styles.panelTitle}>
                                    <Zap size={17} aria-hidden="true" /> Yeni rozetler
                                </h2>
                            </div>
                            <ul className={styles.badgeGrid}>
                                {unlocked.map((item) => (
                                    <li key={item.id} className={`${styles.badge} ${styles.badgeUnlocked}`}>
                                        <span className={styles.badgeIcon} aria-hidden="true">
                                            <Trophy size={18} />
                                        </span>
                                        <div>
                                            <div className={styles.badgeTitle}>{item.def?.title}</div>
                                            <p className={styles.badgeDesc}>{item.def?.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {summary.mistakes.length > 0 ? (
                        <section className={styles.panel} style={{ marginTop: '1rem' }} aria-labelledby="plaka-review-title">
                            <div className={styles.panelHead}>
                                <h2 id="plaka-review-title" className={styles.panelTitle}>
                                    <BookOpen size={17} aria-hidden="true" /> Tekrar etmen gerekenler
                                </h2>
                                <span className={styles.panelHint}>{summary.mistakes.length} yanlış</span>
                            </div>
                            <ul className={styles.reviewList}>
                                {summary.mistakes.map((item) => (
                                    <li key={item.position} className={styles.reviewRow}>
                                        <span className={styles.reviewPlate}>{formatPlate(item.cityCode)}</span>
                                        <span className={styles.reviewCity}>{item.cityName}</span>
                                        <span className={styles.reviewChosen}>Cevabın: {item.chosenLabel}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    <div className={styles.resultActions}>
                        <button
                            type="button"
                            className={styles.cta}
                            onClick={onReplay}
                            disabled={replaying}
                        >
                            <RotateCcw size={17} aria-hidden="true" />
                            {replaying ? 'Hazırlanıyor…' : summary.daily ? 'Serbest Oyna' : 'Tekrar Oyna'}
                        </button>
                        <button
                            type="button"
                            className={styles.ctaGhost}
                            onClick={() => void handleShare()}
                        >
                            {shareState === 'copied' ? (
                                <Check size={16} aria-hidden="true" />
                            ) : (
                                <Share2 size={16} aria-hidden="true" />
                            )}
                            {shareState === 'copied'
                                ? 'Kopyalandı'
                                : shareState === 'failed'
                                  ? 'Paylaşılamadı'
                                  : 'Skoru Paylaş'}
                        </button>
                        <button type="button" className={styles.ctaGhost} onClick={onHome}>
                            <Home size={16} aria-hidden="true" />
                            Ana Menü
                        </button>
                        <Link
                            href={localePath(locale, '/oyun/plaka-avcisi/liderlik')}
                            className={styles.ctaGhost}
                            style={{ textDecoration: 'none' }}
                        >
                            <Trophy size={16} aria-hidden="true" />
                            Liderlik
                            <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>

                    <p className={styles.panelHint} style={{ textAlign: 'center', marginTop: '0.9rem' }}>
                        Skorun sunucuda doğrulandı ve kaydedildi.
                        {summary.daily ? ' Günlük meydan okuma tamamlandı.' : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
