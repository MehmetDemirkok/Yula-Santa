/**
 * Plaka Avcısı — Neon Postgres persistence (server-only).
 *
 * Same Neon instance as the TikTok flows, isolated `plaka_*` tables.
 * The answer key never leaves this module: questions are generated and stored
 * here, the browser receives labels only, and every point is awarded by SQL.
 */

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { createHash, randomUUID } from 'node:crypto';
import {
    CITIES,
    CITY_BY_CODE,
    PLATE_REGIONS,
    type PlakaCity,
    type PlakaRegion,
} from './cities';
import {
    DIFFICULTY_LABEL,
    MODE_CONFIG,
    PLAKA_MODES,
    TIME_ATTACK_SECONDS,
    accuracy,
    dailyKey,
    isPlakaLevel,
    isPlakaMode,
    modeLabel,
    scoreAnswer,
    type PlakaLevel,
    type PlakaMode,
    type QuestionKind,
} from './game';
import { ACHIEVEMENTS, type AchievementId, type AchievementProgress } from './achievements';
import type {
    AnswerResult,
    GameSummary,
    LeaderboardPeriod,
    LeaderboardResult,
    PlayerOverview,
    PublicQuestion,
    StartSessionResult,
} from './contracts';
import { buildDailyQuestionSet, buildQuestionSet, type GeneratedQuestion } from './questions';
import { defaultGuestAvatar, sanitizeNickname } from './player';

export class PlakaStoreError extends Error {
    constructor(
        public code:
            | 'store_unavailable'
            | 'not_found'
            | 'session_inactive'
            | 'session_expired'
            | 'already_answered'
            | 'invalid_position'
            | 'daily_done',
        message?: string
    ) {
        super(message ?? code);
        this.name = 'PlakaStoreError';
    }
}

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function getSql() {
    if (sql) return sql;
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new PlakaStoreError('store_unavailable', 'DATABASE_URL missing');
    sql = neon(url);
    return sql;
}

export function isPlakaStoreConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

const SESSION_TTL_MS = 45 * 60 * 1000;
/** Anything faster than this per answer is not humanly possible. */
const MIN_RESPONSE_MS = 250;

async function ensureSchema(): Promise<void> {
    if (schemaReady) return schemaReady;
    const db = getSql();

    schemaReady = (async () => {
        await db`
            CREATE TABLE IF NOT EXISTS plaka_cities (
                code SMALLINT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                region TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                hints JSONB NOT NULL DEFAULT '[]'::jsonb
            )
        `;
        await db`CREATE INDEX IF NOT EXISTS plaka_cities_region_idx ON plaka_cities (region)`;

        await db`
            CREATE TABLE IF NOT EXISTS plaka_game_modes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                config JSONB NOT NULL DEFAULT '{}'::jsonb
            )
        `;

        await db`
            CREATE TABLE IF NOT EXISTS plaka_sessions (
                id BIGSERIAL PRIMARY KEY,
                public_id TEXT NOT NULL UNIQUE,
                player_id TEXT NOT NULL,
                mode TEXT NOT NULL,
                level TEXT NOT NULL,
                is_daily BOOLEAN NOT NULL DEFAULT false,
                daily_key TEXT,
                question_count INT NOT NULL,
                current_index INT NOT NULL DEFAULT 0,
                score INT NOT NULL DEFAULT 0,
                correct_count INT NOT NULL DEFAULT 0,
                wrong_count INT NOT NULL DEFAULT 0,
                current_streak INT NOT NULL DEFAULT 0,
                best_streak INT NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active',
                started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                finished_at TIMESTAMPTZ,
                duration_ms INT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `;
        await db`CREATE INDEX IF NOT EXISTS plaka_sessions_player_idx ON plaka_sessions (player_id, started_at DESC)`;
        await db`CREATE INDEX IF NOT EXISTS plaka_sessions_rank_idx ON plaka_sessions (status, finished_at DESC, score DESC)`;
        await db`
            CREATE UNIQUE INDEX IF NOT EXISTS plaka_sessions_daily_uniq
            ON plaka_sessions (player_id, daily_key) WHERE is_daily = true
        `;

        await db`
            CREATE TABLE IF NOT EXISTS plaka_questions (
                id BIGSERIAL PRIMARY KEY,
                session_id BIGINT NOT NULL REFERENCES plaka_sessions(id) ON DELETE CASCADE,
                position INT NOT NULL,
                kind TEXT NOT NULL,
                city_code SMALLINT NOT NULL,
                city_name TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                prompt TEXT NOT NULL,
                options JSONB NOT NULL,
                correct_index SMALLINT NOT NULL,
                answered BOOLEAN NOT NULL DEFAULT false,
                chosen_index SMALLINT,
                is_correct BOOLEAN,
                points INT NOT NULL DEFAULT 0,
                answered_at TIMESTAMPTZ,
                UNIQUE (session_id, position)
            )
        `;
        await db`CREATE INDEX IF NOT EXISTS plaka_questions_session_idx ON plaka_questions (session_id, position)`;

        await db`
            CREATE TABLE IF NOT EXISTS plaka_answers (
                id BIGSERIAL PRIMARY KEY,
                session_id BIGINT NOT NULL REFERENCES plaka_sessions(id) ON DELETE CASCADE,
                question_id BIGINT NOT NULL,
                player_id TEXT NOT NULL,
                city_code SMALLINT NOT NULL,
                mode TEXT NOT NULL,
                chosen_index SMALLINT NOT NULL,
                is_correct BOOLEAN NOT NULL,
                points INT NOT NULL DEFAULT 0,
                response_ms INT,
                answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `;
        await db`CREATE INDEX IF NOT EXISTS plaka_answers_player_idx ON plaka_answers (player_id, is_correct, city_code)`;
        await db`CREATE INDEX IF NOT EXISTS plaka_answers_session_idx ON plaka_answers (session_id)`;

        await db`
            CREATE TABLE IF NOT EXISTS plaka_player_stats (
                player_id TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                avatar TEXT,
                total_score BIGINT NOT NULL DEFAULT 0,
                games_played INT NOT NULL DEFAULT 0,
                total_correct INT NOT NULL DEFAULT 0,
                total_wrong INT NOT NULL DEFAULT 0,
                best_score INT NOT NULL DEFAULT 0,
                best_streak INT NOT NULL DEFAULT 0,
                total_time_ms BIGINT NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `;

        await db`
            CREATE TABLE IF NOT EXISTS plaka_achievements (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                icon TEXT NOT NULL,
                tone TEXT NOT NULL,
                requirement TEXT NOT NULL
            )
        `;

        await db`
            CREATE TABLE IF NOT EXISTS plaka_player_achievements (
                player_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL REFERENCES plaka_achievements(id) ON DELETE CASCADE,
                unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                PRIMARY KEY (player_id, achievement_id)
            )
        `;

        // Abandoned runs are resumable for 45 minutes only; clear day-old leftovers
        // so the table doesn't grow unbounded (answers/questions cascade).
        await db`DELETE FROM plaka_sessions WHERE status = 'active' AND started_at < now() - interval '1 day'`;

        // "Leaderboard" model: finished sessions with a score, indexed for ranking.
        await db`
            CREATE OR REPLACE VIEW plaka_leaderboard AS
            SELECT s.id, s.player_id, s.mode, s.score, s.correct_count, s.wrong_count,
                   s.best_streak, s.duration_ms, s.finished_at
            FROM plaka_sessions s
            WHERE s.status = 'finished'
        `;

        await seedReferenceData(db);
    })().catch((error) => {
        schemaReady = null;
        throw error;
    });

    return schemaReady;
}

async function seedReferenceData(db: NeonQueryFunction<false, false>): Promise<void> {
    await db.query(
        `INSERT INTO plaka_cities (code, name, slug, region, difficulty, hints)
         SELECT * FROM unnest(
            $1::smallint[], $2::text[], $3::text[], $4::text[], $5::text[], $6::jsonb[]
         )
         ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            region = EXCLUDED.region,
            difficulty = EXCLUDED.difficulty,
            hints = EXCLUDED.hints`,
        [
            CITIES.map((c) => c.code),
            CITIES.map((c) => c.name),
            CITIES.map((c) => c.slug),
            CITIES.map((c) => c.region),
            CITIES.map((c) => c.difficulty),
            CITIES.map((c) => JSON.stringify(c.hints)),
        ]
    );

    await db.query(
        `INSERT INTO plaka_achievements (id, title, description, icon, tone, requirement)
         SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[])
         ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            tone = EXCLUDED.tone,
            requirement = EXCLUDED.requirement`,
        [
            ACHIEVEMENTS.map((a) => a.id),
            ACHIEVEMENTS.map((a) => a.title),
            ACHIEVEMENTS.map((a) => a.description),
            ACHIEVEMENTS.map((a) => a.icon),
            ACHIEVEMENTS.map((a) => a.tone),
            ACHIEVEMENTS.map((a) => a.requirement),
        ]
    );

    await db.query(
        `INSERT INTO plaka_game_modes (id, title, description, config)
         SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::jsonb[])
         ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            config = EXCLUDED.config`,
        [
            PLAKA_MODES.map((mode) => mode),
            PLAKA_MODES.map((mode) => MODE_CONFIG[mode].title),
            PLAKA_MODES.map((mode) => MODE_CONFIG[mode].description),
            PLAKA_MODES.map((mode) =>
                JSON.stringify({
                    durationSeconds: MODE_CONFIG[mode].durationSeconds,
                    questionCount: MODE_CONFIG[mode].questionCount,
                })
            ),
        ]
    );
}

/* ------------------------------------------------------------------ */
/* Row types                                                          */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

type SessionRow = {
    id: string | number;
    public_id: string;
    player_id: string;
    mode: string;
    level: string;
    is_daily: boolean;
    daily_key: string | null;
    question_count: number;
    current_index: number;
    score: number;
    correct_count: number;
    wrong_count: number;
    current_streak: number;
    best_streak: number;
    status: string;
    started_at: string;
    finished_at: string | null;
    duration_ms: number | null;
};

function asSession(row: Row | undefined): SessionRow | null {
    return (row as unknown as SessionRow) ?? null;
}

function iso(value: unknown): string | null {
    if (!value) return null;
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function fallbackName(playerId: string): string {
    const digest = createHash('sha1').update(playerId).digest();
    const num = ((digest[0] << 8) | digest[1]) % 9000 + 1000;
    return `Avcı ${num}`;
}

/* ------------------------------------------------------------------ */
/* Public shapes                                                      */
/* ------------------------------------------------------------------ */

export type StartSessionInput = {
    playerId: string;
    displayName?: string | null;
    avatar?: string | null;
    mode: PlakaMode;
    level: PlakaLevel;
    daily?: boolean;
};

export type AnswerInput = {
    playerId: string;
    sessionId: string;
    position: number;
    optionIndex: number;
    responseMs?: number;
};

/* ------------------------------------------------------------------ */
/* Sessions                                                           */
/* ------------------------------------------------------------------ */

function toPublicQuestion(q: GeneratedQuestion): PublicQuestion {
    return {
        position: q.position,
        kind: q.kind,
        prompt: q.prompt,
        options: q.options.map((option) => option.label),
        difficulty: q.difficulty,
    };
}

async function ensurePlayerStats(
    db: NeonQueryFunction<false, false>,
    playerId: string,
    displayName: string,
    avatar: string | null
): Promise<void> {
    await db.query(
        `INSERT INTO plaka_player_stats (player_id, display_name, avatar)
         VALUES ($1, $2, $3)
         ON CONFLICT (player_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            avatar = COALESCE(EXCLUDED.avatar, plaka_player_stats.avatar),
            updated_at = now()`,
        [playerId, displayName, avatar]
    );
}

export async function startSession(input: StartSessionInput): Promise<StartSessionResult> {
    if (!isPlakaStoreConfigured()) throw new PlakaStoreError('store_unavailable');
    if (!isPlakaMode(input.mode) || !isPlakaLevel(input.level)) {
        throw new PlakaStoreError('invalid_position', 'Geçersiz mod veya seviye');
    }

    await ensureSchema();
    const db = getSql();

    const nickname = sanitizeNickname(input.displayName);
    const existing = await db.query(
        `SELECT display_name, avatar FROM plaka_player_stats WHERE player_id = $1`,
        [input.playerId]
    );
    const existingRow = existing[0] as { display_name?: string; avatar?: string | null } | undefined;
    const displayName = nickname ?? existingRow?.display_name ?? fallbackName(input.playerId);
    const avatar = input.avatar ?? existingRow?.avatar ?? (input.playerId.startsWith('guest_')
        ? defaultGuestAvatar(input.playerId)
        : null);

    const isDaily = Boolean(input.daily);
    const dayKey = isDaily ? dailyKey() : null;

    if (isDaily && dayKey) {
        const done = await db.query(
            `SELECT public_id, score, correct_count, question_count, finished_at, status
             FROM plaka_sessions
             WHERE player_id = $1 AND is_daily = true AND daily_key = $2`,
            [input.playerId, dayKey]
        );
        const row = done[0] as Row | undefined;
        if (row && row.status === 'finished') {
            return {
                status: 'daily_done',
                score: Number(row.score ?? 0),
                correct: Number(row.correct_count ?? 0),
                total: Number(row.question_count ?? 0),
                finishedAt: iso(row.finished_at),
            };
        }
        if (row && row.status === 'active') {
            const resumed = await loadActiveSession(db, String(row.public_id), input.playerId);
            if (resumed) {
                return {
                    status: 'started',
                    sessionId: String(row.public_id),
                    mode: input.mode,
                    level: input.level,
                    daily: true,
                    dailyKey: dayKey,
                    durationSeconds: null,
                    totalQuestions: resumed.totalQuestions,
                    startedAt: resumed.startedAt,
                    answeredCount: resumed.answeredCount,
                    score: resumed.score,
                    currentStreak: resumed.currentStreak,
                    bestStreak: resumed.bestStreak,
                    player: { displayName, avatar },
                    questions: resumed.questions,
                };
            }
            // Stale attempt: release the daily slot so a fresh run can start.
            await db.query(
                `UPDATE plaka_sessions SET status = 'expired', daily_key = NULL
                 WHERE public_id = $1 AND status = 'active'`,
                [String(row.public_id)]
            );
        }
    }

    const questions = isDaily
        ? buildDailyQuestionSet(dayKey ?? dailyKey())
        : buildQuestionSet({ mode: input.mode, level: input.level });

    const publicId = randomUUID();
    const inserted = await db.query(
        `INSERT INTO plaka_sessions (public_id, player_id, mode, level, is_daily, daily_key, question_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, started_at`,
        [publicId, input.playerId, input.mode, input.level, isDaily, dayKey, questions.length]
    );
    const sessionId = String((inserted[0] as Row).id);

    await db.query(
        `INSERT INTO plaka_questions
            (session_id, position, kind, city_code, city_name, difficulty, prompt, options, correct_index)
         SELECT $1::bigint, * FROM unnest(
            $2::int[], $3::text[], $4::smallint[], $5::text[], $6::text[],
            $7::text[], $8::jsonb[], $9::smallint[]
         )`,
        [
            sessionId,
            questions.map((q) => q.position),
            questions.map((q) => q.kind),
            questions.map((q) => q.cityCode),
            questions.map((q) => q.cityName),
            questions.map((q) => q.difficulty),
            questions.map((q) => q.prompt),
            questions.map((q) => JSON.stringify(q.options.map((o) => o.label))),
            questions.map((q) => q.correctIndex),
        ]
    );

    await ensurePlayerStats(db, input.playerId, displayName, avatar);

    return {
        status: 'started',
        sessionId: publicId,
        mode: input.mode,
        level: input.level,
        daily: isDaily,
        dailyKey: dayKey,
        durationSeconds: MODE_CONFIG[input.mode].durationSeconds,
        totalQuestions: questions.length,
        startedAt: iso(inserted[0].started_at) ?? new Date().toISOString(),
        answeredCount: 0,
        score: 0,
        currentStreak: 0,
        bestStreak: 0,
        player: { displayName, avatar },
        questions: questions.map(toPublicQuestion),
    };
}

async function loadActiveSession(
    db: NeonQueryFunction<false, false>,
    publicId: string,
    playerId: string
): Promise<{
    startedAt: string;
    totalQuestions: number;
    answeredCount: number;
    score: number;
    currentStreak: number;
    bestStreak: number;
    questions: PublicQuestion[];
} | null> {
    const sessionRows = await db.query(
        `SELECT * FROM plaka_sessions WHERE public_id = $1 AND player_id = $2`,
        [publicId, playerId]
    );
    const session = asSession(sessionRows[0]);
    if (!session) return null;
    if (session.status !== 'active') return null;
    if (Date.now() - new Date(String(session.started_at)).getTime() > SESSION_TTL_MS) return null;

    const rows = await db.query(
        `SELECT position, kind, prompt, options, difficulty, answered
         FROM plaka_questions WHERE session_id = $1 ORDER BY position ASC`,
        [session.id]
    );

    return {
        startedAt: iso(session.started_at) ?? new Date().toISOString(),
        totalQuestions: Number(session.question_count),
        answeredCount: Number(session.current_index),
        score: Number(session.score),
        currentStreak: Number(session.current_streak),
        bestStreak: Number(session.best_streak),
        questions: (rows as Row[]).map((row) => ({
            position: Number(row.position),
            kind: String(row.kind) as QuestionKind,
            prompt: String(row.prompt),
            options: (row.options as string[]) ?? [],
            difficulty: String(row.difficulty),
        })),
    };
}

export async function submitAnswer(input: AnswerInput): Promise<AnswerResult> {
    if (!isPlakaStoreConfigured()) throw new PlakaStoreError('store_unavailable');
    await ensureSchema();
    const db = getSql();

    const rows = await db.query(
        `SELECT * FROM plaka_sessions WHERE public_id = $1 AND player_id = $2`,
        [input.sessionId, input.playerId]
    );
    const session = asSession(rows[0]);
    if (!session) throw new PlakaStoreError('not_found');
    if (session.status !== 'active') throw new PlakaStoreError('session_inactive');
    if (Date.now() - new Date(String(session.started_at)).getTime() > SESSION_TTL_MS) {
        await db.query(`UPDATE plaka_sessions SET status = 'expired' WHERE id = $1`, [session.id]);
        throw new PlakaStoreError('session_expired');
    }
    const questionRows = await db.query(
        `SELECT * FROM plaka_questions WHERE session_id = $1 AND position = $2`,
        [session.id, input.position]
    );
    const question = questionRows[0] as Row | undefined;
    if (!question) throw new PlakaStoreError('not_found');
    if (question.answered === true) throw new PlakaStoreError('already_answered');
    if (input.position !== Number(session.current_index)) {
        throw new PlakaStoreError('invalid_position');
    }

    const correctIndex = Number(question.correct_index);
    const options = (question.options as string[]) ?? [];
    const chosenIndex = input.optionIndex;
    if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex >= options.length) {
        throw new PlakaStoreError('invalid_position', 'Geçersiz seçenek');
    }

    const isCorrect = chosenIndex === correctIndex;
    const responseMs = Math.max(
        MIN_RESPONSE_MS,
        Math.min(120_000, Math.round(Number(input.responseMs) || 0))
    );
    const nextStreak = isCorrect ? Number(session.current_streak) + 1 : 0;
    const points = isCorrect
        ? scoreAnswer(String(question.difficulty) as PlakaCity['difficulty'], nextStreak)
        : { base: 0, combo: 0, total: 0 };

    // Atomic guard: only the first answer for this question can score.
    const marked = await db.query(
        `UPDATE plaka_questions
         SET answered = true, chosen_index = $3, is_correct = $4, points = $5, answered_at = now()
         WHERE session_id = $1 AND position = $2 AND answered = false
         RETURNING id`,
        [session.id, input.position, chosenIndex, isCorrect, points.total]
    );
    if (marked.length === 0) throw new PlakaStoreError('already_answered');

    const updated = await db.query(
        `UPDATE plaka_sessions
         SET score = score + $2,
             current_index = current_index + 1,
             correct_count = correct_count + $3,
             wrong_count = wrong_count + $4,
             current_streak = $5,
             best_streak = GREATEST(best_streak, $5)
         WHERE id = $1 AND status = 'active'
         RETURNING current_index, score, correct_count, current_streak, best_streak, question_count`,
        [session.id, points.total, isCorrect ? 1 : 0, isCorrect ? 0 : 1, nextStreak]
    );
    const after = updated[0] as Row;

    await db.query(
        `INSERT INTO plaka_answers
            (session_id, question_id, player_id, city_code, mode, chosen_index, is_correct, points, response_ms)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
            session.id,
            question.id,
            input.playerId,
            question.city_code,
            session.mode,
            chosenIndex,
            isCorrect,
            points.total,
            responseMs,
        ]
    );

    const answeredCount = Number(after.current_index);
    const totalQuestions = Number(after.question_count);
    const sessionComplete = answeredCount >= totalQuestions;

    return {
        correct: isCorrect,
        correctIndex,
        correctLabel: options[correctIndex] ?? '',
        chosenIndex,
        points: points.total,
        comboBonus: points.combo,
        streak: Number(after.current_streak),
        bestStreak: Number(after.best_streak),
        score: Number(after.score),
        answeredCount,
        totalQuestions,
        nextPosition: sessionComplete ? null : answeredCount,
        sessionComplete,
        cityName: String(question.city_name),
        cityCode: Number(question.city_code),
    };
}

export async function finishSession(playerId: string, publicId: string): Promise<GameSummary> {
    if (!isPlakaStoreConfigured()) throw new PlakaStoreError('store_unavailable');
    await ensureSchema();
    const db = getSql();

    const rows = await db.query(
        `SELECT * FROM plaka_sessions WHERE public_id = $1 AND player_id = $2`,
        [publicId, playerId]
    );
    const session = asSession(rows[0]);
    if (!session) throw new PlakaStoreError('not_found');

    const statsRows = await db.query(
        `SELECT best_score, total_score, games_played FROM plaka_player_stats WHERE player_id = $1`,
        [playerId]
    );
    const statsBefore = statsRows[0] as Row | undefined;
    const previousBest = Number(statsBefore?.best_score ?? 0);

    let finished = session;
    let newlyUnlocked: AchievementProgress[] = [];
    if (session.status === 'active') {
        const elapsed = Date.now() - new Date(String(session.started_at)).getTime();
        const rawDuration = Math.max(0, elapsed);
        const durationMs =
            session.mode === 'zamana-karsi'
                ? Math.min(rawDuration, (TIME_ATTACK_SECONDS + 5) * 1000)
                : rawDuration;

        const answered = Number(session.current_index);
        const questionCount = session.mode === 'zamana-karsi' ? answered : Number(session.question_count);

        const updated = await db.query(
            `UPDATE plaka_sessions
             SET status = 'finished', finished_at = now(), duration_ms = $2, question_count = $3
             WHERE id = $1 AND status = 'active'
             RETURNING *`,
            [session.id, Math.round(durationMs), questionCount]
        );
        if (updated.length === 0) {
            const reread = await db.query(`SELECT * FROM plaka_sessions WHERE id = $1`, [session.id]);
            finished = asSession(reread[0]) ?? session;
        } else {
            finished = asSession(updated[0]) ?? session;

            const name = fallbackName(playerId);
            await db.query(
                `INSERT INTO plaka_player_stats
                    (player_id, display_name, avatar, total_score, games_played, total_correct, total_wrong, best_score, best_streak, total_time_ms)
                 VALUES ($1, $2, $3, $4::bigint, 1, $5, $6, $4::int, $7, $8)
                 ON CONFLICT (player_id) DO UPDATE SET
                    total_score = plaka_player_stats.total_score + EXCLUDED.total_score,
                    games_played = plaka_player_stats.games_played + 1,
                    total_correct = plaka_player_stats.total_correct + EXCLUDED.total_correct,
                    total_wrong = plaka_player_stats.total_wrong + EXCLUDED.total_wrong,
                    best_score = GREATEST(plaka_player_stats.best_score, EXCLUDED.best_score),
                    best_streak = GREATEST(plaka_player_stats.best_streak, EXCLUDED.best_streak),
                    total_time_ms = plaka_player_stats.total_time_ms + EXCLUDED.total_time_ms,
                    updated_at = now()`,
                [
                    playerId,
                    name,
                    playerId.startsWith('guest_') ? defaultGuestAvatar(playerId) : null,
                    Number(finished.score),
                    Number(finished.correct_count),
                    Number(finished.wrong_count),
                    Number(finished.best_streak),
                    Number(finished.duration_ms ?? 0),
                ]
            );

            newlyUnlocked = await syncAchievements(playerId);
        }
    }

    const statsAfter = await db.query(
        `SELECT total_score, games_played FROM plaka_player_stats WHERE player_id = $1`,
        [playerId]
    );
    const afterRow = statsAfter[0] as Row | undefined;
    const totalQuestions = Number(finished.question_count) || Number(finished.current_index);

    return {
        sessionId: String(finished.public_id),
        mode: finished.mode as PlakaMode,
        modeTitle: modeLabel(finished.mode),
        level: finished.level as PlakaLevel,
        levelLabel: DIFFICULTY_LABEL[finished.level as PlakaLevel] ?? finished.level,
        daily: Boolean(finished.is_daily),
        score: Number(finished.score),
        correct: Number(finished.correct_count),
        wrong: Number(finished.wrong_count),
        answered: Number(finished.correct_count) + Number(finished.wrong_count),
        totalQuestions,
        accuracy: accuracy(Number(finished.correct_count), totalQuestions),
        durationMs: Number(finished.duration_ms ?? 0),
        bestStreak: Number(finished.best_streak),
        previousBest,
        totalScore: Number(afterRow?.total_score ?? 0),
        gamesPlayed: Number(afterRow?.games_played ?? 0),
        newRecord: Number(finished.score) > previousBest,
        finishedAt: iso(finished.finished_at) ?? new Date().toISOString(),
        unlockedAchievements: newlyUnlocked,
    };
}

/* ------------------------------------------------------------------ */
/* Achievements                                                       */
/* ------------------------------------------------------------------ */

async function computeAchievementProgress(playerId: string): Promise<AchievementProgress[]> {
    const db = getSql();
    const rows = await db.query(
        `SELECT
            (SELECT count(DISTINCT city_code) FROM plaka_answers WHERE player_id = $1 AND is_correct) AS distinct_all,
            (SELECT count(DISTINCT city_code) FROM plaka_answers WHERE player_id = $1 AND is_correct AND mode = 'plaka-sehir') AS distinct_plate,
            (SELECT array_agg(DISTINCT city_code) FROM plaka_answers WHERE player_id = $1 AND is_correct) AS codes,
            (SELECT count(*) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished') AS games,
            (SELECT COALESCE(max(best_streak), 0) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished') AS streak,
            (SELECT COALESCE(max(score), 0) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished' AND mode = 'zamana-karsi') AS time_best,
            (SELECT count(*) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished' AND correct_count >= 10 AND correct_count = question_count) AS perfect_rounds`,
        [playerId]
    );
    const data = (rows[0] ?? {}) as Row;

    const codes = ((data.codes as number[] | null) ?? []).map(Number);
    const regions = new Set(
        codes.map((code) => CITY_BY_CODE.get(code)?.region).filter((region): region is PlakaRegion => Boolean(region))
    );

    const distinctAll = Number(data.distinct_all ?? 0);
    const distinctPlate = Number(data.distinct_plate ?? 0);
    const games = Number(data.games ?? 0);
    const streak = Number(data.streak ?? 0);
    const timeBest = Number(data.time_best ?? 0);
    const perfectRounds = Number(data.perfect_rounds ?? 0);

    const unlockedRows = await db.query(
        `SELECT achievement_id, unlocked_at FROM plaka_player_achievements WHERE player_id = $1`,
        [playerId]
    );
    const unlockedAt = new Map<string, string>();
    for (const row of unlockedRows as Row[]) {
        unlockedAt.set(String(row.achievement_id), iso(row.unlocked_at) ?? new Date().toISOString());
    }

    const ratio = (value: number, target: number) => Math.max(0, Math.min(1, value / target));

    const state: Record<AchievementId, { unlocked: boolean; progress: number; label: string }> = {
        'ilk-oyun': {
            unlocked: games >= 1,
            progress: ratio(games, 1),
            label: `${Math.min(games, 1)}/1 oyun`,
        },
        'seri-katil': {
            unlocked: streak >= 10,
            progress: ratio(streak, 10),
            label: `${Math.min(streak, 10)}/10 seri`,
        },
        'hizli-sofor': {
            unlocked: timeBest >= 300,
            progress: ratio(timeBest, 300),
            label: `${Math.min(timeBest, 300)}/300 puan`,
        },
        'kusursuz-tur': {
            unlocked: perfectRounds >= 1,
            progress: perfectRounds >= 1 ? 1 : 0,
            label: perfectRounds >= 1 ? 'Tamamlandı' : '0/1 tur',
        },
        gezgin: {
            unlocked: regions.size >= PLATE_REGIONS.length,
            progress: ratio(regions.size, PLATE_REGIONS.length),
            label: `${regions.size}/7 bölge`,
        },
        'plaka-uzmani': {
            unlocked: distinctPlate >= CITIES.length,
            progress: ratio(distinctPlate, CITIES.length),
            label: `${distinctPlate}/81 il`,
        },
        'turkiyeyi-taniyorum': {
            unlocked: distinctAll >= CITIES.length,
            progress: ratio(distinctAll, CITIES.length),
            label: `${distinctAll}/81 il`,
        },
    };

    return ACHIEVEMENTS.map((achievement) => {
        const entry = state[achievement.id];
        return {
            id: achievement.id,
            unlocked: entry.unlocked || unlockedAt.has(achievement.id),
            unlockedAt: unlockedAt.get(achievement.id) ?? null,
            progress: entry.unlocked ? 1 : entry.progress,
            progressLabel: entry.label,
        };
    });
}

async function syncAchievements(playerId: string): Promise<AchievementProgress[]> {
    const state = await computeAchievementProgress(playerId);
    const unlocked = state.filter((item) => item.unlocked && item.unlockedAt === null);
    if (unlocked.length === 0) return [];

    const db = getSql();
    await db.query(
        `INSERT INTO plaka_player_achievements (player_id, achievement_id)
         SELECT $1, unnest($2::text[])
         ON CONFLICT DO NOTHING`,
        [playerId, unlocked.map((item) => item.id)]
    );

    const now = new Date().toISOString();
    return unlocked.map((item) => ({ ...item, unlockedAt: now }));
}

/* ------------------------------------------------------------------ */
/* Leaderboard & profile                                              */
/* ------------------------------------------------------------------ */

const PERIOD_CONDITIONS: Record<LeaderboardPeriod, string> = {
    daily: `s.finished_at >= (date_trunc('day', now() AT TIME ZONE 'Europe/Istanbul') AT TIME ZONE 'Europe/Istanbul')`,
    weekly: `s.finished_at >= (date_trunc('week', now() AT TIME ZONE 'Europe/Istanbul') AT TIME ZONE 'Europe/Istanbul')`,
    all: 'true',
};

export async function getLeaderboard(options: {
    period: LeaderboardPeriod;
    mode: PlakaMode | 'all';
    playerId: string | null;
}): Promise<LeaderboardResult> {
    if (!isPlakaStoreConfigured()) throw new PlakaStoreError('store_unavailable');
    await ensureSchema();
    const db = getSql();

    const period = (['daily', 'weekly', 'all'] as const).includes(options.period)
        ? options.period
        : 'daily';
    const mode = options.mode === 'all' || isPlakaMode(options.mode) ? options.mode : 'all';
    const modeCondition = mode === 'all' ? 'true' : `s.mode = '${mode}'`;

    const page = await db.query(
        `WITH best AS (
            SELECT s.player_id, MAX(s.score) AS score, COUNT(*) AS games
            FROM plaka_leaderboard s
            WHERE ${PERIOD_CONDITIONS[period]} AND ${modeCondition}
            GROUP BY s.player_id
         ), ranked AS (
            SELECT b.player_id, b.score, b.games,
                   ROW_NUMBER() OVER (ORDER BY b.score DESC, b.player_id ASC) AS rank,
                   COUNT(*) OVER () AS total_players,
                   COALESCE(st.display_name, 'Avcı') AS name,
                   st.avatar
            FROM best b
            LEFT JOIN plaka_player_stats st ON st.player_id = b.player_id
         )
         SELECT * FROM ranked ORDER BY rank ASC LIMIT 20`,
        []
    );

    const me = options.playerId
        ? await db.query(
              `WITH best AS (
                  SELECT s.player_id, MAX(s.score) AS score, COUNT(*) AS games
                  FROM plaka_leaderboard s
                  WHERE ${PERIOD_CONDITIONS[period]} AND ${modeCondition}
                  GROUP BY s.player_id
               ), ranked AS (
                  SELECT b.player_id, b.score, b.games,
                         ROW_NUMBER() OVER (ORDER BY b.score DESC, b.player_id ASC) AS rank,
                         COALESCE(st.display_name, 'Avcı') AS name,
                         st.avatar
                  FROM best b
                  LEFT JOIN plaka_player_stats st ON st.player_id = b.player_id
               )
               SELECT rank, score, name, avatar FROM ranked WHERE player_id = $1`,
              [options.playerId]
          )
        : [];

    const rows = page as Row[];
    const meRow = (me[0] ?? null) as Row | null;

    return {
        period,
        mode,
        entries: rows.map((row) => ({
            rank: Number(row.rank),
            name: String(row.name),
            avatar: (row.avatar as string | null) ?? null,
            score: Number(row.score),
            games: Number(row.games),
            isMe: options.playerId !== null && String(row.player_id) === options.playerId,
        })),
        me: meRow
            ? {
                  rank: Number(meRow.rank),
                  score: Number(meRow.score),
                  name: String(meRow.name),
                  avatar: (meRow.avatar as string | null) ?? null,
              }
            : null,
        playerCount: rows.length > 0 ? Number(rows[0].total_players ?? rows.length) : 0,
        updatedAt: new Date().toISOString(),
    };
}

export async function getPlayerOverview(playerId: string): Promise<PlayerOverview> {
    if (!isPlakaStoreConfigured()) throw new PlakaStoreError('store_unavailable');
    await ensureSchema();
    const db = getSql();

    const statsRows = await db.query(
        `SELECT * FROM plaka_player_stats WHERE player_id = $1`,
        [playerId]
    );
    const statsRow = (statsRows[0] ?? null) as Row | null;

    const rankRows = await db.query(
        `SELECT rank FROM (
            SELECT player_id, ROW_NUMBER() OVER (ORDER BY best_score DESC, player_id ASC) AS rank
            FROM plaka_player_stats WHERE best_score > 0
         ) ranked WHERE player_id = $1`,
        [playerId]
    );

    const key = dailyKey();
    const dailyRows = await db.query(
        `SELECT score, status FROM plaka_sessions
         WHERE player_id = $1 AND is_daily = true AND daily_key = $2 AND status = 'finished'`,
        [playerId, key]
    );
    const dailyRow = (dailyRows[0] ?? null) as Row | null;

    const achievements = await computeAchievementProgress(playerId);

    const totalCorrect = Number(statsRow?.total_correct ?? 0);
    const totalWrong = Number(statsRow?.total_wrong ?? 0);

    return {
        playerId,
        name: String(statsRow?.display_name ?? fallbackName(playerId)),
        avatar: (statsRow?.avatar as string | null) ?? null,
        stats: {
            totalScore: Number(statsRow?.total_score ?? 0),
            gamesPlayed: Number(statsRow?.games_played ?? 0),
            bestScore: Number(statsRow?.best_score ?? 0),
            bestStreak: Number(statsRow?.best_streak ?? 0),
            totalCorrect,
            totalWrong,
            accuracy: accuracy(totalCorrect, totalCorrect + totalWrong),
            totalTimeMs: Number(statsRow?.total_time_ms ?? 0),
            globalRank: rankRows.length > 0 ? Number((rankRows[0] as Row).rank) : null,
        },
        daily: {
            key,
            done: Boolean(dailyRow),
            score: dailyRow ? Number(dailyRow.score) : null,
            modeTitle: MODE_CONFIG['plaka-sehir'].title,
        },
        achievements,
    };
}
