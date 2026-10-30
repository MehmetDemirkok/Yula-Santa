'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    ArrowLeft,
    CalendarDays,
    CreditCard,
    Flame,
    Lightbulb,
    MapPin,
    Medal,
    Info,
    Play,
    Sparkles,
    Target,
    Timer,
    Trophy,
} from 'lucide-react';
import { localePath } from '@/lib/localePath';
import { PLAKA_FAQ } from '@/lib/plaka/faq';
import {
    DIFFICULTY_LABEL,
    MODE_CONFIG,
    PLAKA_MODES,
    PLAKA_LEVELS,
    type PlakaLevel,
    type PlakaMode,
} from '@/lib/plaka/game';
import type { PlayerOverview } from '@/lib/plaka/contracts';
import AchievementList from './AchievementList';
import LeaderboardPanel from './LeaderboardPanel';
import styles from './PlakaAvcisi.module.css';

const MODE_ICONS = {
    plate: CreditCard,
    city: MapPin,
    timer: Timer,
    hint: Lightbulb,
} as const;

type Props = {
    locale: string;
    profile: PlayerOverview | null;
    profileState: 'loading' | 'ready' | 'error';
    profileError: string | null;
    onRetryProfile: () => void;
    onStart: (mode: PlakaMode, level: PlakaLevel, daily?: boolean) => void;
    starting: boolean;
    notice: string | null;
    nickname: string;
    onNicknameChange: (value: string) => void;
    leaderboardKey: number;
    onDismissNotice: () => void;
};

function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('tr-TR').format(value);
}

export default function HomeScreen({
    locale,
    profile,
    profileState,
    profileError,
    onRetryProfile,
    onStart,
    starting,
    notice,
    nickname,
    onNicknameChange,
    leaderboardKey,
    onDismissNotice,
}: Props) {
    const tTools = useTranslations('tools');
    const [mode, setMode] = useState<PlakaMode>('plaka-sehir');
    const [level, setLevel] = useState<PlakaLevel>('karisik');

    const selectedMode = MODE_CONFIG[mode];
    const stats = profile?.stats;
    const dailyDone = profile?.daily.done ?? false;
    const dailyDate = profile?.daily.key
        ? new Intl.DateTimeFormat('tr-TR', {
              day: 'numeric',
              month: 'long',
              timeZone: 'UTC',
          }).format(new Date(`${profile.daily.key}T12:00:00Z`))
        : null;

    const statCards = useMemo(
        () => [
            {
                label: 'Toplam Puan',
                value: formatNumber(stats?.totalScore),
                icon: Trophy,
                accent: true,
            },
            { label: 'Oynanan Oyun', value: formatNumber(stats?.gamesPlayed), icon: Target },
            { label: 'En Yüksek Skor', value: formatNumber(stats?.bestScore), icon: Medal },
            {
                label: 'Sıralama',
                value: stats?.globalRank ? `#${stats.globalRank}` : '—',
                icon: Flame,
            },
        ],
        [stats]
    );

    return (
        <div className={styles.shell} lang="tr" dir="ltr">
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <Link className={styles.backLink} href={localePath(locale, '/tools')}>
                        <ArrowLeft size={16} aria-hidden="true" />
                        Araçlar
                    </Link>
                    <span className={styles.topTag}>81 il · 4 mod</span>
                </div>

                <header className={styles.hero}>
                    <div className={styles.heroInner}>
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span className={styles.topTag}>Türkiye plaka yarışı</span>
                                <span className={styles.newBadge}>
                                    <Sparkles size={11} aria-hidden="true" />
                                    {tTools('new')}
                                </span>
                            </div>
                            <h1 className={styles.title}>
                                Plaka <span className={styles.titleAccent}>Avcısı</span>
                            </h1>
                            <p className={styles.tagline}>
                                81 ilin plaka kodlarını avla. Seri yap, kombo bonusu kap, günün zirvesine
                                yerleş. Tüm cevaplar sunucuda doğrulanır — yani her puan gerçekten hak
                                edilmiş olur.
                            </p>
                            <div className={styles.heroMeta}>
                                <span className={styles.chip}>
                                    <Sparkles size={12} aria-hidden="true" /> Neon pist teması
                                </span>
                                <span className={styles.chip}>
                                    <Target size={12} aria-hidden="true" /> Sunucu doğrulamalı puan
                                </span>
                                <span className={styles.chip}>
                                    <Medal size={12} aria-hidden="true" /> 7 rozet
                                </span>
                            </div>
                        </div>

                        <div className={styles.heroActions}>
                            <button
                                type="button"
                                className={styles.cta}
                                onClick={() => onStart(mode, level)}
                                disabled={starting}
                            >
                                <Play size={18} aria-hidden="true" />
                                {starting ? 'Motor çalışıyor…' : 'Oyuna Başla'}
                            </button>
                            <Link
                                href={localePath(locale, '/oyun/plaka-avcisi/liderlik')}
                                className={styles.ctaGhost}
                                style={{ textDecoration: 'none' }}
                            >
                                <Trophy size={16} aria-hidden="true" />
                                Liderlik Tablosu
                            </Link>
                        </div>
                    </div>
                </header>

                {notice ? (
                    <div
                        className={styles.errorBox}
                        style={{
                            marginTop: '1rem',
                            borderColor: 'var(--pa-line-strong)',
                            background: 'var(--pa-neon-dim)',
                            color: 'var(--pa-text)',
                        }}
                        role="status"
                    >
                        <span>{notice}</span>
                        <button type="button" className={styles.ctaGhost} onClick={onDismissNotice}>
                            Tamam
                        </button>
                    </div>
                ) : null}

                {profileState === 'error' ? (
                    <div className={styles.errorBox} style={{ marginTop: '1rem' }} role="alert">
                        <span>{profileError ?? 'İstatistikler yüklenemedi.'}</span>
                        <button type="button" className={styles.ctaGhost} onClick={onRetryProfile}>
                            Tekrar dene
                        </button>
                    </div>
                ) : null}

                <section className={styles.statGrid} aria-label="Oyuncu istatistikleri">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className={styles.statCard}>
                                <div className={styles.statLabel}>
                                    <Icon size={12} aria-hidden="true" />
                                    {card.label}
                                </div>
                                <div
                                    className={`${styles.statValue} ${card.accent ? styles.statValueAccent : ''}`}
                                >
                                    {profileState === 'loading' ? '···' : card.value}
                                </div>
                            </div>
                        );
                    })}
                </section>

                <section className={styles.daily} aria-labelledby="plaka-daily-title">
                    <div>
                        <span className={styles.dailyEyebrow}>
                            <CalendarDays size={13} aria-hidden="true" />
                            Günün Meydan Okuması{dailyDate ? ` · ${dailyDate}` : ''}
                        </span>
                        <h2 id="plaka-daily-title" className={styles.dailyTitle}>
                            {dailyDone ? 'Bugünkü tur tamamlandı' : 'Aynı 10 soru, herkese aynı pist'}
                        </h2>
                        <p className={styles.dailyDesc}>
                            {dailyDone
                                ? `Bugünkü meydan okumayı ${formatNumber(profile?.daily.score)} puanla bitirdin. Yarın yeni sorular seni bekliyor.`
                                : 'Her gün herkese aynı 10 plaka sorusu. Günde tek deneme — skorun günlük tabloya yazılır.'}
                        </p>
                    </div>
                    <div className={styles.dailyActions}>
                        {dailyDone ? (
                            <Link
                                href={localePath(locale, '/oyun/plaka-avcisi/liderlik')}
                                className={styles.ctaGhost}
                            >
                                Günlük tabloyu gör
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className={styles.cta}
                                onClick={() => onStart('plaka-sehir', 'karisik', true)}
                                disabled={starting}
                            >
                                <Play size={17} aria-hidden="true" />
                                {starting ? 'Hazırlanıyor…' : 'Meydan okumaya katıl'}
                            </button>
                        )}
                    </div>
                </section>

                <section className={`${styles.section} ${styles.panel}`} aria-labelledby="plaka-modes-title">
                    <div className={styles.panelHead}>
                        <h2 id="plaka-modes-title" className={styles.panelTitle}>
                            <Flame size={17} aria-hidden="true" />
                            Oyun Modları
                        </h2>
                        <span className={styles.panelHint}>Bir mod seç, seviyeni ayarla</span>
                    </div>

                    <div className={styles.modeGrid} role="radiogroup" aria-label="Oyun modu">
                        {PLAKA_MODES.map((id) => {
                            const config = MODE_CONFIG[id];
                            const Icon = MODE_ICONS[config.icon];
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    role="radio"
                                    aria-checked={mode === id}
                                    className={`${styles.modeCard} ${mode === id ? styles.modeCardActive : ''}`}
                                    onClick={() => setMode(id)}
                                >
                                    <span className={styles.modeTop}>
                                        <span className={styles.modeIcon}>
                                            <Icon size={19} aria-hidden="true" />
                                        </span>
                                        <span>
                                            <span className={styles.modeName}>{config.title}</span>
                                            <br />
                                            <span className={styles.modeTag}>{config.kindLabel}</span>
                                        </span>
                                    </span>
                                    <span className={styles.modeDesc}>{config.description}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.levelRow}>
                        <div>
                            <div className={styles.levelLabel}>Seviye</div>
                            <div className={styles.pills} style={{ marginTop: '0.35rem' }}>
                                {PLAKA_LEVELS.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`${styles.pill} ${level === item ? styles.pillActive : ''}`}
                                        aria-pressed={level === item}
                                        onClick={() => setLevel(item)}
                                    >
                                        {DIFFICULTY_LABEL[item]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: 1, minWidth: 'min(100%, 240px)' }}>
                            <label className={styles.levelLabel} htmlFor="plaka-nickname">
                                Avcı adın (isteğe bağlı)
                            </label>
                            <input
                                id="plaka-nickname"
                                className={styles.select}
                                style={{ marginTop: '0.35rem', width: '100%' }}
                                value={nickname}
                                maxLength={20}
                                placeholder={profile?.name ?? 'Gizli Avcı'}
                                onChange={(event) => onNicknameChange(event.target.value)}
                                autoComplete="nickname"
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '1rem',
                        }}
                    >
                        <p className={styles.panelHint} style={{ margin: 0, maxWidth: '46ch' }}>
                            {selectedMode.title} · {DIFFICULTY_LABEL[level]}
                            {selectedMode.durationSeconds
                                ? ` · ${selectedMode.durationSeconds} saniye`
                                : ` · ${selectedMode.questionCount} soru`}
                            . Misafir olarak oynayabilirsin; skorların anonim avcı kimliğinle
                            saklanır.
                        </p>
                        <button
                            type="button"
                            className={styles.cta}
                            onClick={() => onStart(mode, level)}
                            disabled={starting}
                        >
                            <Play size={17} aria-hidden="true" />
                            {starting ? 'Hazırlanıyor…' : `${selectedMode.title} — Başla`}
                        </button>
                    </div>
                </section>

                <div className={styles.section} style={{ display: 'grid', gap: '1rem' }}>
                    <LeaderboardPanel compact refreshKey={leaderboardKey} />
                    <section className={styles.panel} aria-labelledby="plaka-badges-title">
                        <div className={styles.panelHead}>
                            <h2 id="plaka-badges-title" className={styles.panelTitle}>
                                <Medal size={17} aria-hidden="true" />
                                Başarımlar
                            </h2>
                            <span className={styles.panelHint}>Koşullar sunucuda kontrol edilir</span>
                        </div>
                        <AchievementList progress={profile?.achievements ?? null} limit={4} />
                    </section>
                </div>

                <section
                    className={`${styles.section} ${styles.panel}`}
                    aria-labelledby="plaka-faq-title"
                >
                    <div className={styles.panelHead}>
                        <h2 id="plaka-faq-title" className={styles.panelTitle}>
                            <Info size={17} aria-hidden="true" />
                            Sık Sorulan Sorular
                        </h2>
                        <span className={styles.panelHint}>81 il · 4 mod · ücretsiz</span>
                    </div>
                    <div className={styles.faq}>
                        {PLAKA_FAQ.map((item) => (
                            <details key={item.question} className={styles.faqItem}>
                                <summary className={styles.faqQuestion}>{item.question}</summary>
                                <p className={styles.faqAnswer}>{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <footer className={styles.section} style={{ textAlign: 'center' }}>
                    <p className={styles.panelHint} style={{ margin: 0 }}>
                        Plaka Avcısı · 81 il, 81 plaka ·{' '}
                        <Link
                            href={localePath(locale, '/oyun/plaka-avcisi/liderlik')}
                            className={styles.linkInline}
                        >
                            tüm sıralamalar
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    );
}
