/**
 * Plaka Avcısı — server-side question factory.
 * Questions (and their correct answers) are created here and persisted, so the
 * browser only ever receives option labels — never the answer key.
 */

import { randomInt } from 'node:crypto';
import {
    CITIES,
    formatPlate,
    type PlakaCity,
    type PlakaDifficulty,
} from './cities';
import {
    DAILY_MODE,
    DAILY_QUESTION_COUNT,
    MODE_CONFIG,
    TIME_ATTACK_MAX_QUESTIONS,
    type PlakaLevel,
    type PlakaMode,
    type QuestionKind,
} from './game';

export type GeneratedOption = { code: number; label: string };

export type GeneratedQuestion = {
    position: number;
    kind: QuestionKind;
    cityCode: number;
    cityName: string;
    difficulty: PlakaDifficulty;
    prompt: string;
    options: GeneratedOption[];
    correctIndex: number;
};

type Rng = () => number;

/** mulberry32 — deterministic PRNG used for the shared daily challenge. */
function seededRng(seed: string): Rng {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    let a = h >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pickIndex(rng: Rng, length: number): number {
    return Math.min(length - 1, Math.floor(rng() * length));
}

function shuffle<T>(rng: Rng, items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = pickIndex(rng, i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/** Closest tiers first, used only when the chosen tier runs out of cities. */
const FILL_ORDER: Record<PlakaDifficulty, PlakaDifficulty[]> = {
    kolay: ['kolay', 'orta', 'zor'],
    orta: ['orta', 'kolay', 'zor'],
    zor: ['zor', 'orta', 'kolay'],
};

/** Every chosen-tier city comes before any other tier, so a level stays honest. */
function citiesForLevel(level: PlakaLevel, rng: Rng): PlakaCity[] {
    if (level === 'karisik') return shuffle(rng, CITIES);
    return FILL_ORDER[level].flatMap((tier) =>
        shuffle(rng, CITIES.filter((city) => city.difficulty === tier))
    );
}

function sameRegionDistractors(city: PlakaCity, rng: Rng, count: number): PlakaCity[] {
    const sameRegion = CITIES.filter((c) => c.code !== city.code && c.region === city.region);
    if (sameRegion.length >= count) return shuffle(rng, sameRegion).slice(0, count);

    const rest = CITIES.filter((c) => c.code !== city.code && c.region !== city.region);
    return [...shuffle(rng, sameRegion), ...shuffle(rng, rest)].slice(0, count);
}

function buildOptions(
    city: PlakaCity,
    kind: QuestionKind,
    rng: Rng
): { options: GeneratedOption[]; correctIndex: number } {
    const distractors = sameRegionDistractors(city, rng, 3);
    const toOption = (c: PlakaCity): GeneratedOption =>
        kind === 'sehir-plaka'
            ? { code: c.code, label: formatPlate(c.code) }
            : { code: c.code, label: c.name };

    const all = shuffle(rng, [city, ...distractors]);
    const options = all.map(toOption);
    return { options, correctIndex: all.findIndex((c) => c.code === city.code) };
}

function questionKind(mode: PlakaMode, rng: Rng): QuestionKind {
    if (mode === 'harita') return 'harita';
    if (mode === 'ipucu') return 'ipucu';
    if (mode === 'sehir-plaka') return 'sehir-plaka';
    if (mode === 'plaka-sehir') return 'plaka-sehir';
    // Zamana Karşı alternates both directions.
    return rng() < 0.5 ? 'plaka-sehir' : 'sehir-plaka';
}

function promptFor(city: PlakaCity, kind: QuestionKind): string {
    if (kind === 'plaka-sehir') return formatPlate(city.code);
    if (kind === 'sehir-plaka' || kind === 'harita') return city.name;
    return city.hints.join('\n');
}

function buildOne(city: PlakaCity, kind: QuestionKind, position: number, rng: Rng): GeneratedQuestion {
    // Map questions have no options: the player taps a province, and the
    // answer key is the plate code itself.
    const { options, correctIndex } =
        kind === 'harita' ? { options: [], correctIndex: city.code } : buildOptions(city, kind, rng);
    return {
        position,
        kind,
        cityCode: city.code,
        cityName: city.name,
        difficulty: city.difficulty,
        prompt: promptFor(city, kind),
        options,
        correctIndex,
    };
}

export type BuildQuestionSetInput = {
    mode: PlakaMode;
    level: PlakaLevel;
    /** Optional deterministic seed (daily challenge). */
    seed?: string;
    /** Defaults to the mode's configured question count. */
    count?: number;
};

export function buildQuestionSet({
    mode,
    level,
    seed,
    count,
}: BuildQuestionSetInput): GeneratedQuestion[] {
    const rng: Rng = seed ? seededRng(seed) : () => randomInt(0, 2 ** 31) / 2 ** 31;
    const target = Math.min(
        count ?? MODE_CONFIG[mode].questionCount,
        mode === 'zamana-karsi' ? TIME_ATTACK_MAX_QUESTIONS : CITIES.length
    );

    // Shuffled again so filler cities from another tier don't always come last.
    const selected = shuffle(rng, citiesForLevel(level, rng).slice(0, target));

    return selected.map((city, index) => buildOne(city, questionKind(mode, rng), index, rng));
}

/** Shared daily challenge — same questions for every player that day. */
export function buildDailyQuestionSet(dayKey: string): GeneratedQuestion[] {
    return buildQuestionSet({
        mode: DAILY_MODE,
        level: 'karisik',
        seed: `plaka-avcisi:${dayKey}`,
        count: DAILY_QUESTION_COUNT,
    });
}
