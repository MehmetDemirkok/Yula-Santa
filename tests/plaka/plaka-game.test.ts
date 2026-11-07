import test from 'node:test';
import assert from 'node:assert/strict';

import {
    CITIES,
    PLATE_REGIONS,
    formatPlate,
    normalizeCityName,
} from '../../lib/plaka/cities';
import {
    BASE_POINTS,
    COMBO_BONUS_CAP,
    DAILY_QUESTION_COUNT,
    MODE_CONFIG,
    PLAKA_MODES,
    STANDARD_QUESTION_COUNT,
    TIME_ATTACK_SECONDS,
    accuracy,
    isPlakaLevel,
    isPlakaMode,
    isTimeAttackOver,
    scoreAnswer,
} from '../../lib/plaka/game';
import { buildDailyQuestionSet, buildQuestionSet } from '../../lib/plaka/questions';
import { ACHIEVEMENTS } from '../../lib/plaka/achievements';
import { TURKEY_PROVINCES } from '../../lib/plaka/turkeyMap';

test('plaka dataset covers all 81 provinces exactly once', () => {
    assert.equal(CITIES.length, 81);

    const codes = CITIES.map((city) => city.code).sort((a, b) => a - b);
    assert.deepEqual(codes, Array.from({ length: 81 }, (_, i) => i + 1));

    const names = new Set(CITIES.map((city) => city.name));
    assert.equal(names.size, 81, 'city names must be unique');

    const slugs = new Set(CITIES.map((city) => city.slug));
    assert.equal(slugs.size, 81, 'slugs must be unique');

    for (const city of CITIES) {
        assert.ok(PLATE_REGIONS.includes(city.region), `${city.name} has a valid region`);
        assert.ok(['kolay', 'orta', 'zor'].includes(city.difficulty));
        assert.equal(city.hints.length, 2, `${city.name} needs two hints`);
        assert.ok(city.hints.every((hint) => hint.length > 15), `${city.name} hints are meaningful`);
    }

    // Turkish-aware casing: İ → i, I → ı.
    assert.equal(normalizeCityName('İSTANBUL'), 'istanbul');
    assert.equal(normalizeCityName('ISPARTA'), 'ısparta');

    // Spot-check well-known plate codes.
    assert.equal(CITIES.find((c) => c.name === 'Ankara')?.code, 6);
    assert.equal(CITIES.find((c) => c.name === 'İstanbul')?.code, 34);
    assert.equal(CITIES.find((c) => c.name === 'İzmir')?.code, 35);
    assert.equal(CITIES.find((c) => c.name === 'Düzce')?.code, 81);
});

test('plate formatting pads to two digits', () => {
    assert.equal(formatPlate(1), '01');
    assert.equal(formatPlate(6), '06');
    assert.equal(formatPlate(34), '34');
    assert.equal(formatPlate(81), '81');
});

test('every difficulty tier has enough cities for distraction', () => {
    for (const tier of ['kolay', 'orta', 'zor'] as const) {
        const count = CITIES.filter((city) => city.difficulty === tier).length;
        assert.ok(count >= 10, `${tier} tier needs at least 10 cities, has ${count}`);
    }
});

test('scoring follows the published table', () => {
    assert.equal(BASE_POINTS.kolay, 10);
    assert.equal(BASE_POINTS.orta, 20);
    assert.equal(BASE_POINTS.zor, 30);

    assert.deepEqual(scoreAnswer('kolay', 1), { base: 10, combo: 0, total: 10 });
    assert.deepEqual(scoreAnswer('orta', 2), { base: 20, combo: 0, total: 20 });
    // Third consecutive correct answer starts the combo bonus.
    assert.deepEqual(scoreAnswer('zor', 3), { base: 30, combo: 5, total: 35 });
    assert.deepEqual(scoreAnswer('zor', 4), { base: 30, combo: 10, total: 40 });
    const capped = scoreAnswer('kolay', 30);
    assert.equal(capped.combo, COMBO_BONUS_CAP);
    assert.equal(capped.total, 10 + COMBO_BONUS_CAP);
});

test('accuracy is rounded and safe for empty sets', () => {
    assert.equal(accuracy(0, 0), 0);
    assert.equal(accuracy(7, 10), 70);
    assert.equal(accuracy(2, 3), 67);
});

test('mode/level guards reject unknown values', () => {
    for (const mode of PLAKA_MODES) assert.ok(isPlakaMode(mode));
    assert.ok(!isPlakaMode('plaka'));
    assert.ok(isPlakaLevel('karisik'));
    assert.ok(!isPlakaLevel('imkansiz'));
});

test('question sets never repeat a city and hide no answers', () => {
    for (const mode of PLAKA_MODES) {
        const questions = buildQuestionSet({ mode, level: 'karisik', seed: `seed-${mode}` });
        const expected = Math.min(MODE_CONFIG[mode].questionCount, 81);
        assert.equal(questions.length, expected, `${mode} question count`);

        const codes = questions.map((q) => q.cityCode);
        assert.equal(new Set(codes).size, codes.length, `${mode} repeats a city`);

        for (const question of questions) {
            if (question.kind === 'harita') {
                // Answered by tapping the map: no options, the key is the plate code.
                assert.equal(question.options.length, 0);
                assert.equal(question.correctIndex, question.cityCode);
                assert.equal(question.prompt, question.cityName);
                continue;
            }
            assert.equal(question.options.length, 4);
            const labels = question.options.map((o) => o.label);
            assert.equal(new Set(labels).size, 4, 'options must be distinct');
            assert.ok(question.correctIndex >= 0 && question.correctIndex < 4);
            assert.equal(question.options[question.correctIndex].code, question.cityCode);
            assert.ok(question.prompt.length > 0);
        }
    }
});

test('plate-to-city questions use the correct prompt and option kind', () => {
    const questions = buildQuestionSet({ mode: 'plaka-sehir', level: 'kolay', seed: 'abc' });
    for (const question of questions) {
        assert.equal(question.kind, 'plaka-sehir');
        assert.equal(question.prompt, formatPlate(question.cityCode));
        assert.equal(question.options[question.correctIndex].label, question.cityName);
    }
});

test('city-to-plate questions offer four plate codes', () => {
    const questions = buildQuestionSet({ mode: 'sehir-plaka', level: 'orta', seed: 'abc' });
    for (const question of questions) {
        assert.equal(question.kind, 'sehir-plaka');
        assert.equal(question.prompt, question.cityName);
        for (const option of question.options) {
            assert.match(option.label, /^\d{2}$/);
        }
        assert.equal(question.options[question.correctIndex].label, formatPlate(question.cityCode));
    }
});

test('hint questions expose both clues', () => {
    const questions = buildQuestionSet({ mode: 'ipucu', level: 'zor', seed: 'abc' });
    for (const question of questions) {
        assert.equal(question.kind, 'ipucu');
        assert.equal(question.prompt.split('\n').length, 2);
    }
});

test('daily challenge is deterministic for a date', () => {
    const first = buildDailyQuestionSet('2026-10-30');
    const second = buildDailyQuestionSet('2026-10-30');
    const other = buildDailyQuestionSet('2026-10-31');

    assert.deepEqual(
        first.map((q) => [q.cityCode, q.correctIndex, q.options.map((o) => o.code)]),
        second.map((q) => [q.cityCode, q.correctIndex, q.options.map((o) => o.code)])
    );
    assert.notDeepEqual(
        first.map((q) => q.cityCode),
        other.map((q) => q.cityCode)
    );
    assert.equal(first.length, DAILY_QUESTION_COUNT);
});

test('a standard round asks 20 questions in every untimed mode', () => {
    assert.equal(STANDARD_QUESTION_COUNT, 20);
    assert.equal(DAILY_QUESTION_COUNT, 20);
    for (const mode of ['plaka-sehir', 'sehir-plaka', 'ipucu'] as const) {
        for (const level of ['kolay', 'orta', 'zor', 'karisik'] as const) {
            const questions = buildQuestionSet({ mode, level, seed: `${mode}-${level}` });
            assert.equal(questions.length, 20, `${mode}/${level}`);
            assert.equal(new Set(questions.map((q) => q.cityCode)).size, 20, `${mode}/${level} repeats`);
        }
    }
});

test('a level uses every city of its tier before borrowing from another', () => {
    for (const level of ['kolay', 'orta', 'zor'] as const) {
        const tierSize = CITIES.filter((city) => city.difficulty === level).length;
        for (const count of [20, 45]) {
            for (let run = 0; run < 25; run++) {
                const questions = buildQuestionSet({
                    mode: 'plaka-sehir',
                    level,
                    seed: `${level}-${count}-${run}`,
                    count,
                });
                const inTier = questions.filter((q) => q.difficulty === level).length;
                assert.equal(inTier, Math.min(tierSize, count), `${level} with ${count} questions`);
            }
        }
    }
});

test('borrowed cities come from the nearest tier and are not all at the end', () => {
    const questions = buildQuestionSet({ mode: 'plaka-sehir', level: 'zor', seed: 'nearest' });
    const borrowed = questions.filter((q) => q.difficulty !== 'zor');
    assert.equal(borrowed.length, 2);
    assert.ok(borrowed.every((q) => q.difficulty === 'orta'));

    const anyBorrowedEarly = Array.from({ length: 20 }, (_, run) =>
        buildQuestionSet({ mode: 'plaka-sehir', level: 'zor', seed: `early-${run}` })
    ).some((set) => set.slice(0, 18).some((q) => q.difficulty !== 'zor'));
    assert.ok(anyBorrowedEarly, 'filler questions should be spread through the run');
});

test('hints never name the city they describe', () => {
    for (const city of CITIES) {
        const name = city.name.toLocaleLowerCase('tr-TR');
        for (const hint of city.hints) {
            const words = hint.toLocaleLowerCase('tr-TR').split(/[^\p{L}]+/u);
            assert.ok(!words.some((word) => word.startsWith(name)), `${city.name}: ${hint}`);
        }
    }
});

test('time attack closes after the countdown plus a small network allowance', () => {
    const limit = TIME_ATTACK_SECONDS * 1000;
    assert.equal(isTimeAttackOver('zamana-karsi', limit), false);
    assert.equal(isTimeAttackOver('zamana-karsi', limit + 4_000), false);
    assert.equal(isTimeAttackOver('zamana-karsi', limit + 6_000), true);
    assert.equal(isTimeAttackOver('plaka-sehir', limit * 10), false);
});

test('achievement catalogue is complete and unique', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.includes('plaka-uzmani'));
    assert.ok(ids.includes('seri-katil'));
    assert.ok(ids.includes('hizli-sofor'));
});

test('the map has every province exactly once, inside the viewBox', () => {
    const codes = TURKEY_PROVINCES.map((p) => p.code).sort((a, b) => a - b);
    assert.deepEqual(codes, CITIES.map((c) => c.code).sort((a, b) => a - b));
    for (const province of TURKEY_PROVINCES) {
        assert.match(province.d, /^M[\d.]+ [\d.]+(L[\d.]+ [\d.]+)+Z/, `${province.code} path`);
        assert.ok(province.x > 0 && province.x < 1000 && province.y > 0, `${province.code} marker`);
    }
});

test('map mode asks 20 distinct provinces at every level', () => {
    for (const level of ['kolay', 'orta', 'zor', 'karisik'] as const) {
        const questions = buildQuestionSet({ mode: 'harita', level, seed: `map-${level}` });
        assert.equal(questions.length, 20);
        assert.ok(questions.every((q) => q.kind === 'harita' && q.options.length === 0));
        assert.equal(new Set(questions.map((q) => q.cityCode)).size, 20);
    }
});
