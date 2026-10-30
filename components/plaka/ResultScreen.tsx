'use client';

import Link from 'next/link';
import { ArrowRight, Home, RotateCcw, Trophy, Zap } from 'lucide-react';
import { ACHIEVEMENT_BY_ID } from '@/lib/plaka/achievements';
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
    const unlocked = summary.unlockedAchievements
        .map((item) => ({ ...item, def: ACHIEVEMENT_BY_ID.get(item.id) }))
        .filter((item) => item.def);

    const comparison = summary.newRecord ? (
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

                        {summary.newRecord ? (
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

                    <div className={styles.resultActions}>
                        <button
                            type="button"
                            className={styles.cta}
                            onClick={onReplay}
                            disabled={replaying}
                        >
                            <RotateCcw size={17} aria-hidden="true" />
                            {replaying ? 'Hazırlanıyor…' : 'Tekrar Oyna'}
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
