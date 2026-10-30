'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { MODE_CONFIG, PLAKA_MODES, type PlakaMode } from '@/lib/plaka/game';
import type { LeaderboardPeriod, LeaderboardResult } from '@/lib/plaka/contracts';
import { plakaApi, PlakaClientError } from './api';
import styles from './PlakaAvcisi.module.css';

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
    { id: 'daily', label: 'Günlük' },
    { id: 'weekly', label: 'Haftalık' },
    { id: 'all', label: 'Tüm Zamanlar' },
];

type Props = {
    initialPeriod?: LeaderboardPeriod;
    compact?: boolean;
    title?: string;
    /** Bump this value to refetch (e.g. after a game finishes). */
    refreshKey?: number;
};

function Avatar({ entry }: { entry: { avatar: string | null; name: string } }) {
    const isUrl = entry.avatar?.startsWith('http');
    return (
        <span className={styles.avatar} aria-hidden="true">
            {isUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote Google avatars vary in size
                <img className={styles.avatarImg} src={entry.avatar as string} alt="" loading="lazy" />
            ) : (
                entry.avatar || '🏁'
            )}
        </span>
    );
}

export default function LeaderboardPanel({
    initialPeriod = 'daily',
    compact = false,
    title,
    refreshKey = 0,
}: Props) {
    const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
    const [mode, setMode] = useState<PlakaMode | 'all'>('all');
    const [board, setBoard] = useState<LeaderboardResult | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    const errorMessage = useCallback(
        (err: unknown) =>
            err instanceof PlakaClientError && err.code === 'rate_limited'
                ? 'Çok fazla istek. Bir dakika sonra tekrar dene.'
                : 'Liderlik tablosu yüklenemedi.',
        []
    );

    useEffect(() => {
        let active = true;
        plakaApi
            .leaderboard(period, mode)
            .then((result) => {
                if (!active) return;
                setBoard(result);
                setState('ready');
            })
            .catch((err: unknown) => {
                if (!active) return;
                setError(errorMessage(err));
                setState('error');
            });
        return () => {
            active = false;
        };
    }, [period, mode, refreshKey, errorMessage]);

    const retry = useCallback(async () => {
        setState('loading');
        setError(null);
        try {
            const result = await plakaApi.leaderboard(period, mode);
            setBoard(result);
            setState('ready');
        } catch (err) {
            setError(errorMessage(err));
            setState('error');
        }
    }, [errorMessage, period, mode]);

    const entries = compact ? (board?.entries ?? []).slice(0, 5) : board?.entries ?? [];
    const heading = title ?? (compact ? 'Bugünün Avcıları' : 'Liderlik Tablosu');

    return (
        <section className={styles.panel} aria-labelledby="plaka-board-title">
            <div className={styles.panelHead}>
                <h2 id="plaka-board-title" className={styles.panelTitle}>
                    <Trophy size={17} aria-hidden="true" />
                    {heading}
                </h2>
                <button
                    type="button"
                    onClick={() => void retry()}
                    className={styles.iconButton}
                    style={{ width: 34, height: 34 }}
                    aria-label="Liderlik tablosunu yenile"
                >
                    <RefreshCw size={15} />
                </button>
            </div>

            {!compact ? (
                <div className={styles.filterRow}>
                    <div className={styles.tabs} role="tablist" aria-label="Zaman aralığı">
                        {PERIODS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={period === item.id}
                                className={`${styles.tab} ${period === item.id ? styles.tabActive : ''}`}
                                onClick={() => setPeriod(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <label className={styles.srOnly} htmlFor="plaka-board-mode">
                        Oyun modu
                    </label>
                    <select
                        id="plaka-board-mode"
                        className={styles.select}
                        value={mode}
                        onChange={(event) => setMode(event.target.value as PlakaMode | 'all')}
                    >
                        <option value="all">Tüm modlar</option>
                        {PLAKA_MODES.map((item) => (
                            <option key={item} value={item}>
                                {MODE_CONFIG[item].title}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            {board?.me ? (
                <div className={styles.myRank}>
                    <div>
                        <div className={styles.myRankLabel}>Senin sıralaman</div>
                        <div className={styles.myRankValue}>#{board.me.rank}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className={styles.myRankLabel}>En iyi skorun</div>
                        <div className={styles.myRankValue}>{board.me.score} puan</div>
                    </div>
                </div>
            ) : null}

            {state === 'loading' ? (
                <div style={{ display: 'grid', gap: 6 }} aria-busy="true" aria-live="polite">
                    <span className={styles.srOnly}>Liderlik tablosu yükleniyor</span>
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                </div>
            ) : null}

            {state === 'error' ? (
                <div className={styles.errorBox} role="alert">
                    <span>{error}</span>
                    <button type="button" className={styles.ctaGhost} onClick={() => void retry()}>
                        Tekrar dene
                    </button>
                </div>
            ) : null}

            {state === 'ready' && entries.length === 0 ? (
                <div className={styles.empty}>
                    <strong style={{ color: 'var(--pa-text)' }}>Pist henüz boş.</strong>
                    <br />
                    İlk oyunu sen oyna, günün zirvesine yerleş.
                </div>
            ) : null}

            {state === 'ready' && entries.length > 0 ? (
                <ol className={styles.board}>
                    {entries.map((entry) => (
                        <li
                            key={`${entry.rank}-${entry.name}`}
                            className={`${styles.boardRow} ${entry.isMe ? styles.boardRowMe : ''}`}
                        >
                            <span className={`${styles.rank} ${entry.rank <= 3 ? styles.rankTop : ''}`}>
                                {entry.rank}
                            </span>
                            <span className={styles.boardName}>
                                <Avatar entry={entry} />
                                <span>
                                    <span className={styles.nameText}>{entry.name}</span>
                                    <span className={styles.boardMeta}>
                                        {entry.games} oyun{entry.isMe ? ' · sen' : ''}
                                    </span>
                                </span>
                            </span>
                            <span className={styles.boardScore}>{entry.score}</span>
                        </li>
                    ))}
                </ol>
            ) : null}

            {!compact && state === 'ready' ? (
                <p className={styles.panelHint} style={{ marginTop: '0.75rem' }}>
                    {board?.playerCount ?? 0} avcı sıralamada · Her oyuncunun en iyi turu sayılır.
                </p>
            ) : null}
        </section>
    );
}
