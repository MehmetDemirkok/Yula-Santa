'use client';

import { Compass, Flag, Flame, Gauge, Map as MapIcon, Medal, Lock, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ACHIEVEMENTS, type AchievementDef } from '@/lib/plaka/achievements';
import type { AchievementProgress } from '@/lib/plaka/achievements';
import styles from './PlakaAvcisi.module.css';

const ICONS: Record<AchievementDef['icon'], LucideIcon> = {
    flag: Flag,
    flame: Flame,
    gauge: Gauge,
    target: Target,
    compass: Compass,
    medal: Medal,
    map: MapIcon,
};

type Props = {
    progress: AchievementProgress[] | null;
    limit?: number;
};

export default function AchievementList({ progress, limit }: Props) {
    const stateById = new Map((progress ?? []).map((item) => [item.id, item] as const));
    const items = limit ? ACHIEVEMENTS.slice(0, limit) : ACHIEVEMENTS;

    return (
        <ul className={styles.badgeGrid} aria-label="Başarımlar">
            {items.map((achievement) => {
                const state = stateById.get(achievement.id);
                const unlocked = state?.unlocked ?? false;
                const Icon = unlocked ? ICONS[achievement.icon] : Lock;
                const percent = Math.round((state?.progress ?? 0) * 100);

                return (
                    <li
                        key={achievement.id}
                        className={`${styles.badge} ${unlocked ? styles.badgeUnlocked : ''}`}
                    >
                        <span className={styles.badgeIcon} aria-hidden="true">
                            <Icon size={18} />
                        </span>
                        <div>
                            <div className={styles.badgeTitle}>
                                {achievement.title}
                                {unlocked ? (
                                    <span className={styles.srOnly}> (kazanıldı)</span>
                                ) : null}
                            </div>
                            <p className={styles.badgeDesc}>
                                {unlocked ? achievement.description : state?.progressLabel ?? achievement.requirement}
                            </p>
                            {!unlocked && state ? (
                                <div
                                    className={styles.track}
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={percent}
                                    aria-label={`${achievement.title} ilerlemesi`}
                                >
                                    <div className={styles.trackFill} style={{ width: `${percent}%` }} />
                                </div>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
