/**
 * Plaka Avcısı — achievement catalogue (client-safe).
 * Conditions are evaluated server-side in lib/plaka/store.ts; the client only
 * renders what the API returns.
 */

import { STANDARD_QUESTION_COUNT } from './game';

export type AchievementId =
    | 'ilk-oyun'
    | 'seri-katil'
    | 'hizli-sofor'
    | 'kusursuz-tur'
    | 'gezgin'
    | 'plaka-uzmani'
    | 'turkiyeyi-taniyorum';

export type AchievementDef = {
    id: AchievementId;
    title: string;
    description: string;
    icon: 'flag' | 'flame' | 'gauge' | 'target' | 'compass' | 'medal' | 'map';
    /** Tailwind-friendly neon tone used by the badge card. */
    tone: 'cyan' | 'amber' | 'rose' | 'violet' | 'emerald';
    requirement: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
    {
        id: 'ilk-oyun',
        title: 'İlk Oyun',
        description: 'İlk oyununu tamamladın, motor ısındı.',
        icon: 'flag',
        tone: 'emerald',
        requirement: '1 oyun tamamla',
    },
    {
        id: 'seri-katil',
        title: 'Seri Katil',
        description: '10 soruyu arka arkaya doğru cevapladın.',
        icon: 'flame',
        tone: 'rose',
        requirement: '10’luk doğru seri',
    },
    {
        id: 'hizli-sofor',
        title: 'Hızlı Şoför',
        description: 'Zamana Karşı modunda 300 puanı geçtin.',
        icon: 'gauge',
        tone: 'amber',
        requirement: 'Zamana Karşı’da 300+ puan',
    },
    {
        id: 'kusursuz-tur',
        title: 'Kusursuz Tur',
        description: `${STANDARD_QUESTION_COUNT} soruluk bir turu hatasız bitirdin.`,
        icon: 'target',
        tone: 'cyan',
        requirement: 'Bir turda %100 isabet',
    },
    {
        id: 'gezgin',
        title: 'Gezgin',
        description: 'Yedi coğrafi bölgenin tamamından doğru cevap verdin.',
        icon: 'compass',
        tone: 'violet',
        requirement: '7 bölgede doğru cevap',
    },
    {
        id: 'plaka-uzmani',
        title: 'Plaka Uzmanı',
        description: 'Plakadan Şehri Bul modunda 81 ilin tamamını bildin.',
        icon: 'medal',
        tone: 'emerald',
        requirement: 'Plaka → Şehir’de 81/81 il',
    },
    {
        id: 'turkiyeyi-taniyorum',
        title: 'Türkiye’yi Tanıyorum',
        description: 'Tüm modlarda 81 ilin tamamına doğru cevap verdin.',
        icon: 'map',
        tone: 'cyan',
        requirement: 'Tüm modlarda 81/81 il',
    },
];

export const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export type AchievementProgress = {
    id: AchievementId;
    unlocked: boolean;
    unlockedAt: string | null;
    /** 0–1, used for progress bars. */
    progress: number;
    progressLabel: string;
};
