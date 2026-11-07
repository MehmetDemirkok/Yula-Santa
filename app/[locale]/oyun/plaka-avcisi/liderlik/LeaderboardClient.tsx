'use client';

import Link from 'next/link';
import { ArrowLeft, Medal, Trophy } from 'lucide-react';
import AchievementList from '@/components/plaka/AchievementList';
import LeaderboardPanel from '@/components/plaka/LeaderboardPanel';
import styles from '@/components/plaka/PlakaAvcisi.module.css';
import type { AchievementProgress } from '@/lib/plaka/achievements';
import type { LeaderboardPeriod } from '@/lib/plaka/contracts';
import { localePath } from '@/lib/localePath';
import { useEffect, useState } from 'react';
import { plakaApi } from '@/components/plaka/api';

export default function LeaderboardClient({
    locale,
    initialPeriod,
}: {
    locale: string;
    initialPeriod: LeaderboardPeriod;
}) {
    const [achievements, setAchievements] = useState<AchievementProgress[] | null>(null);

    useEffect(() => {
        let active = true;
        void plakaApi
            .stats()
            .then((data) => {
                if (active) setAchievements(data.achievements);
            })
            .catch(() => {
                if (active) setAchievements(null);
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className={styles.shell} lang="tr" dir="ltr">
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <Link
                        href={localePath(locale, '/oyun/plaka-avcisi')}
                        className={styles.backLink}
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Plaka Avcısı
                    </Link>
                    <span className={styles.topTag}>Canlı sıralama</span>
                </div>

                <header style={{ marginBottom: '1.25rem' }}>
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-heading), system-ui, sans-serif',
                            fontSize: 'clamp(1.8rem, 6vw, 2.6rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Liderlik <span style={{ color: 'var(--pa-neon)' }}>Tablosu</span>
                    </h1>
                    <p className={styles.tagline} style={{ marginTop: '0.4rem' }}>
                        Günün meydan okuması ile günlük, haftalık ve tüm zamanların en iyi plaka avcıları.
                        Her oyuncunun en yüksek tek tur skoru sıralamaya girer.
                    </p>
                </header>

                <LeaderboardPanel initialPeriod={initialPeriod} title="Sıralama" />

                <section className={styles.section}>
                    <div className={styles.panel}>
                        <div className={styles.panelHead}>
                            <h2 className={styles.panelTitle}>
                                <Medal size={17} aria-hidden="true" />
                                Rozetler
                            </h2>
                            <span className={styles.panelHint}>Koşullar sunucuda kontrol edilir</span>
                        </div>
                        <AchievementList progress={achievements} />
                    </div>
                </section>

                <div className={styles.resultActions} style={{ marginTop: '1.25rem' }}>
                    <Link
                        href={localePath(locale, '/oyun/plaka-avcisi')}
                        className={styles.cta}
                        style={{ textDecoration: 'none' }}
                    >
                        <Trophy size={17} aria-hidden="true" />
                        Oyuna dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
