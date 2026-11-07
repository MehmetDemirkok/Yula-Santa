/**
 * Plaka Avcısı — client-safe game configuration and scoring rules.
 * Scoring is implemented here once and used by the server to award points,
 * so the client can never submit its own score.
 */

export const PLAKA_MODES = ['plaka-sehir', 'sehir-plaka', 'zamana-karsi', 'ipucu'] as const;
export type PlakaMode = (typeof PLAKA_MODES)[number];

export const PLAKA_DIFFICULTIES = ['kolay', 'orta', 'zor'] as const;
export type PlakaDifficulty = (typeof PLAKA_DIFFICULTIES)[number];

/** Difficulty chosen for a game; `karisik` mixes all three tiers. */
export const PLAKA_LEVELS = [...PLAKA_DIFFICULTIES, 'karisik'] as const;
export type PlakaLevel = (typeof PLAKA_LEVELS)[number];

export type QuestionKind = 'plaka-sehir' | 'sehir-plaka' | 'ipucu';

export const TIME_ATTACK_SECONDS = 60;
export const STANDARD_QUESTION_COUNT = 20;
export const DAILY_QUESTION_COUNT = 20;
/** Hard cap for the 60-second mode — far more than anyone can answer. */
export const TIME_ATTACK_MAX_QUESTIONS = 45;
/** Network allowance before the server stops accepting timed answers. */
export const TIME_ATTACK_GRACE_SECONDS = 5;

/** True once the server must stop accepting answers for a timed run. */
export function isTimeAttackOver(mode: string, elapsedMs: number): boolean {
    return mode === 'zamana-karsi' && elapsedMs > (TIME_ATTACK_SECONDS + TIME_ATTACK_GRACE_SECONDS) * 1000;
}

export const BASE_POINTS: Record<PlakaDifficulty, number> = {
    kolay: 10,
    orta: 20,
    zor: 30,
};

export const COMBO_THRESHOLD = 3;
export const COMBO_BONUS_STEP = 5;
export const COMBO_BONUS_CAP = 25;

export type ModeConfig = {
    id: PlakaMode;
    title: string;
    tagline: string;
    description: string;
    icon: 'plate' | 'city' | 'timer' | 'hint';
    accent: string;
    durationSeconds: number | null;
    questionCount: number;
    kindLabel: string;
};

export const MODE_CONFIG: Record<PlakaMode, ModeConfig> = {
    'plaka-sehir': {
        id: 'plaka-sehir',
        title: 'Plakadan Şehri Bul',
        tagline: '06 → ?',
        description: 'Ekranda beliren plaka kodunun hangi ile ait olduğunu seç.',
        icon: 'plate',
        accent: '#2ef2c0',
        durationSeconds: null,
        questionCount: STANDARD_QUESTION_COUNT,
        kindLabel: 'Plaka → Şehir',
    },
    'sehir-plaka': {
        id: 'sehir-plaka',
        title: 'Şehirden Plakayı Bul',
        tagline: 'Ankara → ?',
        description: 'Verilen şehrin plaka kodunu dört seçenek arasından yakala.',
        icon: 'city',
        accent: '#5eead4',
        durationSeconds: null,
        questionCount: STANDARD_QUESTION_COUNT,
        kindLabel: 'Şehir → Plaka',
    },
    'zamana-karsi': {
        id: 'zamana-karsi',
        title: 'Zamana Karşı',
        tagline: '60 saniye',
        description: '60 saniyede kaç plakayı avlayabilirsin? Seri yaptıkça puan katlanır.',
        icon: 'timer',
        accent: '#ffd166',
        durationSeconds: TIME_ATTACK_SECONDS,
        questionCount: TIME_ATTACK_MAX_QUESTIONS,
        kindLabel: 'Süreli',
    },
    ipucu: {
        id: 'ipucu',
        title: 'İpuçlarından Şehri Bul',
        tagline: 'İpucu → Şehir',
        description: 'Bölge ve simge ipuçlarını okuyup doğru şehri tahmin et.',
        icon: 'hint',
        accent: '#a78bfa',
        durationSeconds: null,
        questionCount: STANDARD_QUESTION_COUNT,
        kindLabel: 'İpucu',
    },
};

export function isPlakaMode(value: unknown): value is PlakaMode {
    return typeof value === 'string' && (PLAKA_MODES as readonly string[]).includes(value);
}

export function isPlakaLevel(value: unknown): value is PlakaLevel {
    return typeof value === 'string' && (PLAKA_LEVELS as readonly string[]).includes(value);
}

/**
 * Points for one correct answer.
 * Combo bonus only starts at the 3rd consecutive correct answer
 * (+5, +10 … capped at +25), so guessing can't inflate a score.
 */
export function scoreAnswer(
    difficulty: PlakaDifficulty,
    streakAfterAnswer: number
): { base: number; combo: number; total: number } {
    const base = BASE_POINTS[difficulty];
    const combo =
        streakAfterAnswer >= COMBO_THRESHOLD
            ? Math.min(COMBO_BONUS_CAP, (streakAfterAnswer - (COMBO_THRESHOLD - 1)) * COMBO_BONUS_STEP)
            : 0;
    return { base, combo, total: base + combo };
}

export function modeQuestionCount(mode: PlakaMode): number {
    return MODE_CONFIG[mode].questionCount;
}

export function accuracy(correct: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((correct / total) * 100);
}

/** Short label used in badges/leaderboard rows. */
export function modeLabel(mode: string): string {
    return MODE_CONFIG[mode as PlakaMode]?.title ?? 'Plaka Avcısı';
}

export const DIFFICULTY_LABEL: Record<PlakaLevel, string> = {
    kolay: 'Kolay',
    orta: 'Orta',
    zor: 'Zor',
    karisik: 'Karışık',
};

/** Deterministic YYYY-MM-DD key (Europe/Istanbul) used for the daily challenge. */
export function dailyKey(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

export const DAILY_MODE: PlakaMode = 'plaka-sehir';
