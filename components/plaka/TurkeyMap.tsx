'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { CITY_BY_CODE } from '@/lib/plaka/cities';
import { TURKEY_MAP_VIEWBOX, TURKEY_PROVINCES } from '@/lib/plaka/turkeyMap';
import styles from './PlakaAvcisi.module.css';

const ZOOM_LEVELS = [1, 1.75, 2.5];

type Props = {
    /** Province picked but not yet confirmed. */
    selected: number | null;
    /** After an answer: the right province, and the wrong pick if there was one. */
    correct: number | null;
    wrong: number | null;
    disabled: boolean;
    onPick: (code: number) => void;
};

/**
 * Clickable map of the 81 provinces. Names stay hidden until the answer is
 * revealed, so the map can't be used to look the answer up; screen readers
 * hear a neutral label for the same reason.
 */
export default function TurkeyMap({ selected, correct, wrong, disabled, onPick }: Props) {
    const [zoomIndex, setZoomIndex] = useState(0);
    const zoom = ZOOM_LEVELS[zoomIndex];
    const revealed = correct !== null;

    const classFor = (code: number) => {
        if (code === correct) return `${styles.mapProvince} ${styles.mapCorrect}`;
        if (code === wrong) return `${styles.mapProvince} ${styles.mapWrong}`;
        if (code === selected) return `${styles.mapProvince} ${styles.mapSelected}`;
        return styles.mapProvince;
    };

    const markers = [correct, wrong].filter((code): code is number => code !== null);

    return (
        <div className={styles.mapWrap}>
            <div className={styles.mapZoom} role="group" aria-label="Haritayı yakınlaştır">
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                    disabled={zoomIndex === 0}
                    aria-label="Uzaklaştır"
                >
                    <Minus size={16} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
                    disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                    aria-label="Yakınlaştır"
                >
                    <Plus size={16} aria-hidden="true" />
                </button>
            </div>

            <div className={styles.mapScroll}>
                <svg
                    className={styles.mapSvg}
                    style={{ width: `${zoom * 100}%` }}
                    viewBox={TURKEY_MAP_VIEWBOX}
                    role="group"
                    aria-label="Türkiye haritası"
                >
                    {TURKEY_PROVINCES.map((province) => (
                        <path
                            key={province.code}
                            d={province.d}
                            className={classFor(province.code)}
                            role="button"
                            tabIndex={disabled ? -1 : 0}
                            // Same label for every province until the reveal: a numbered
                            // label would follow plate order and give the answer away.
                            aria-label={
                                revealed ? (CITY_BY_CODE.get(province.code)?.name ?? '') : 'Haritada bir il'
                            }
                            aria-pressed={province.code === selected}
                            onClick={() => {
                                if (!disabled) onPick(province.code);
                            }}
                            onKeyDown={(event) => {
                                if (disabled) return;
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onPick(province.code);
                                }
                            }}
                        />
                    ))}
                    {markers.map((code) => {
                        const province = TURKEY_PROVINCES.find((p) => p.code === code);
                        const city = CITY_BY_CODE.get(code);
                        if (!province || !city) return null;
                        return (
                            <g key={`label-${code}`} className={styles.mapLabel} aria-hidden="true">
                                <circle cx={province.x} cy={province.y} r={5} />
                                <text x={province.x} y={province.y - 10} textAnchor="middle">
                                    {city.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
