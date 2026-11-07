'use client';

import { BookOpenCheck, Check } from 'lucide-react';
import { CITIES, formatPlate } from '@/lib/plaka/cities';
import styles from './PlakaAvcisi.module.css';

type Props = {
    /** Plate codes answered correctly at least once; null while the profile is unavailable. */
    knownCodes: number[] | null;
};

/** The player's report card for all 81 provinces, doubling as a plate reference table. */
export default function PlateAtlas({ knownCodes }: Props) {
    const known = new Set(knownCodes ?? []);
    const percent = Math.round((known.size / CITIES.length) * 100);

    return (
        <section className={styles.panel} aria-labelledby="plaka-atlas-title">
            <div className={styles.panelHead}>
                <h2 id="plaka-atlas-title" className={styles.panelTitle}>
                    <BookOpenCheck size={17} aria-hidden="true" />
                    Plaka Karnesi
                </h2>
                <span className={styles.panelHint}>
                    {known.size}/{CITIES.length} il bilindi
                </span>
            </div>

            <div
                className={styles.track}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={CITIES.length}
                aria-valuenow={known.size}
                aria-label="Bilinen il sayısı"
            >
                <div className={styles.trackFill} style={{ width: `${percent}%` }} />
            </div>

            <details className={styles.atlasDetails}>
                <summary className={styles.atlasSummary}>81 ilin plakasını göster</summary>
                <p className={styles.panelHint} style={{ margin: '0.6rem 0' }}>
                    Vurgulu iller, en az bir kez doğru bildiklerin.
                </p>
                <ul className={styles.atlasGrid}>
                    {CITIES.map((city) => {
                        const isKnown = known.has(city.code);
                        return (
                            <li
                                key={city.code}
                                className={`${styles.atlasTile} ${isKnown ? styles.atlasTileKnown : ''}`}
                            >
                                <span className={styles.atlasCode}>{formatPlate(city.code)}</span>
                                <span className={styles.atlasName}>{city.name}</span>
                                {isKnown ? (
                                    <>
                                        <Check size={13} className={styles.atlasCheck} aria-hidden="true" />
                                        <span className={styles.srOnly}> (bilindi)</span>
                                    </>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </details>
        </section>
    );
}
