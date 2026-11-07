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
    formatPlate,
    type PlakaCity,
    type PlakaRegion,
} from './cities';
import {
    DAILY_MODE,
    DIFFICULTY_LABEL,
    MODE_CONFIG,
    PLAKA_MODES,
    STANDARD_QUESTION_COUNT,
    TIME_ATTACK_GRACE_SECONDS,
    TIME_ATTACK_SECONDS,
    accuracy,
    dailyKey,
    isPlakaLevel,
    isPlakaMode,
    isTimeAttackOver,
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
    RunMistake,
    StartedSession,
    StartSessionResult,
} from './contracts';
import { buildDailyQuestionSet, buildQuestionSet, type GeneratedQuestion } from './questions';
import { defaultGuestAvatar, sanitizeNickname } from './player';
import { isOffensiveNickname } from './nickname';

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

/** Bump this whenever the DDL below changes. Reference data is hashed in automatically. */
const SCHEMA_REVISION = 2;
const SCHEMA_MARKER = `plaka-schema:${SCHEMA_REVISION}:${createHash('sha1')
    .update(JSON.stringify([CITIES, ACHIEVEMENTS, MODE_CONFIG]))
    .digest('hex')
    .slice(0, 16)}`;
/** Share of cold starts that also clear abandoned sessions. */
const STALE_CLEANUP_CHANCE = 0.05;

/**
 * Local dev and production share one database, so this must stay safe for both
 * and must not change objects an older deployment also manages. In particular,
 * never add columns through CREATE OR REPLACE VIEW: the older deployment's
 * statement then fails with "cannot drop columns from view".
 */
async function ensureSchema(): Promise<void> {
    if (schemaReady) return schemaReady;
    const db = getSql();

    schemaReady = (async () => {
        // A cold start costs one query once the database is up to date, not dozens.
        const marker = await db.query(
            `SELECT obj_description(to_regclass('public.plaka_cities'), 'pg_class') AS marker`
        );
        if ((marker[0] as Row | undefined)?.marker === SCHEMA_MARKER) {
            if (Math.random() < STALE_CLEANUP_CHANCE) await deleteStaleSessions(db);
            return;
        }

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

        await deleteStaleSessions(db);
        // Revision 2: Google profile photos are no longer shown publicly, so drop the stored URLs.
        await db`UPDATE plaka_player_stats SET avatar = NULL WHERE avatar LIKE 'http%'`;
        await seedReferenceData(db);

        // Written last, so a run that fails halfway is retried by the next cold start.
        await db.query(`COMMENT ON TABLE plaka_cities IS '${SCHEMA_MARKER}'`);
    })().catch((error) => {
        schemaReady = null;
        throw error;
    });

    return schemaReady;
}

/** Abandoned runs are resumable for 45 minutes only; clear day-old leftovers (answers/questions cascade). */
async function deleteStaleSessions(db: NeonQueryFunction<false, false>): Promise<void> {
    await db`DELETE FROM plaka_sessions WHERE status = 'active' AND started_at < now() - interval '1 day'`;
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

/** Name shown publicly: names stored before the filter existed are hidden too. */
function publicName(playerId: string, stored: unknown): string {
    const name = typeof stored === 'string' ? stored.trim() : '';
    return name && !isOffensiveNickname(name) ? name : fallbackName(playerId);
}

/**
 * Avatar shown publicly: always a vehicle emoji. Google profile photos are never
 * published, including URLs stored before this rule.
 */
function publicAvatar(playerId: string, stored: unknown): string {
    return typeof stored === 'string' && stored && !stored.startsWith('http')
        ? stored
        : defaultGuestAvatar(playerId);
}

/* ------------------------------------------------------------------ */
/* Public shapes                                                      */
/* ------------------------------------------------------------------ */

export type StartSessionInput = {
    playerId: string;
    displayName?: string | null;
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
    const isDaily = Boolean(input.daily);
    const dayKey = isDaily ? dailyKey() : null;
    // The daily challenge has one fixed format, whatever the request claims.
    const mode = isDaily ? DAILY_MODE : input.mode;
    const level: PlakaLevel = isDaily ? 'karisik' : input.level;

    const [existing, dailyRows] = await Promise.all([
        db.query(`SELECT display_name, avatar FROM plaka_player_stats WHERE player_id = $1`, [
            input.playerId,
        ]),
        isDaily
            ? db.query(
                  `SELECT public_id, score, correct_count, question_count, finished_at, status
                   FROM plaka_sessions
                   WHERE player_id = $1 AND is_daily = true AND daily_key = $2`,
                  [input.playerId, dayKey]
              )
            : Promise.resolve([]),
    ]);
    const existingRow = existing[0] as { display_name?: string; avatar?: string | null } | undefined;
    const displayName = nickname ?? publicName(input.playerId, existingRow?.display_name);
    const avatar = publicAvatar(input.playerId, existingRow?.avatar);

    if (isDaily && dayKey) {
        const row = dailyRows[0] as Row | undefined;
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
            if (resumed) return { ...resumed, player: { displayName, avatar } };
        }
        if (row) {
            // Stale attempt: release the daily slot so a fresh run can start.
            await db.query(
                `UPDATE plaka_sessions SET status = 'expired', daily_key = NULL
                 WHERE public_id = $1 AND status <> 'finished'`,
                [String(row.public_id)]
            );
        }
    }

    const questions = isDaily
        ? buildDailyQuestionSet(dayKey ?? dailyKey())
        : buildQuestionSet({ mode, level });

    const publicId = randomUUID();
    const inserted = await db.query(
        `INSERT INTO plaka_sessions (public_id, player_id, mode, level, is_daily, daily_key, question_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, started_at`,
        [publicId, input.playerId, mode, level, isDaily, dayKey, questions.length]
    );
    const sessionId = String((inserted[0] as Row).id);

    await Promise.all([
        db.query(
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
        ),
        ensurePlayerStats(db, input.playerId, displayName, avatar),
    ]);

    return {
        status: 'started',
        sessionId: publicId,
        mode,
        level,
        daily: isDaily,
        dailyKey: dayKey,
        durationSeconds: MODE_CONFIG[mode].durationSeconds,
        totalQuestions: questions.length,
        startedAt: iso(inserted[0].started_at) ?? new Date().toISOString(),
        answeredCount: 0,
        score: 0,
        correctCount: 0,
        currentStreak: 0,
        bestStreak: 0,
        player: { displayName, avatar },
        questions: questions.map(toPublicQuestion),
    };
}

/**
 * An unfinished untimed run, ready to continue. Timed runs are never resumed:
 * their clock kept running while the page was gone.
 */
async function loadActiveSession(
    db: NeonQueryFunction<false, false>,
    publicId: string,
    playerId: string
): Promise<Omit<StartedSession, 'player'> | null> {
    const sessionRows = await db.query(
        `SELECT * FROM plaka_sessions WHERE public_id = $1 AND player_id = $2`,
        [publicId, playerId]
    );
    const session = asSession(sessionRows[0]);
    if (!session) return null;
    if (session.status !== 'active') return null;
    if (!isPlakaMode(session.mode) || MODE_CONFIG[session.mode].durationSeconds !== null) return null;
    if (Date.now() - new Date(String(session.started_at)).getTime() > SESSION_TTL_MS) return null;

    const rows = await db.query(
        `SELECT position, kind, prompt, options, difficulty, answered
         FROM plaka_questions WHERE session_id = $1 ORDER BY position ASC`,
        [session.id]
    );

    return {
        status: 'started',
        sessionId: String(session.public_id),
        mode: session.mode,
        level: isPlakaLevel(session.level) ? session.level : 'karisik',
        daily: Boolean(session.is_daily),
        dailyKey: session.daily_key,
        durationSeconds: null,
        startedAt: iso(session.started_at) ?? new Date().toISOString(),
        totalQuestions: Number(session.question_count),
        answeredCount: Number(session.current_index),
        score: Number(session.score),
        correctCount: Number(session.correct_count),
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

/** Continue an unfinished run after a page reload, or null when there is nothing to continue. */
export async function resumeSession(playerId: string, publicId: string): Promise<StartedSession | null> {
    if (!isPlakaStoreConfigured()) throw new PlakaStoreError('store_unavailable');
    await ensureSchema();
    const db = getSql();

    const [resumed, statsRows] = await Promise.all([
        loadActiveSession(db, publicId, playerId),
        db.query(`SELECT display_name, avatar FROM plaka_player_stats WHERE player_id = $1`, [playerId]),
    ]);
    if (!resumed) return null;
    const stats = statsRows[0] as Row | undefined;
    return {
        ...resumed,
        player: {
            displayName: publicName(playerId, stats?.display_name),
            avatar: publicAvatar(playerId, stats?.avatar),
        },
    };
}

export async function submitAnswer(input: AnswerInput): Promise<AnswerResult> {
    if (!isPlakaStoreConfigured()) throw new PlakaStoreError('store_unavailable');
    await ensureSchema();
    const db = getSql();

    const [rows, questionRows] = await Promise.all([
        db.query(`SELECT * FROM plaka_sessions WHERE public_id = $1 AND player_id = $2`, [
            input.sessionId,
            input.playerId,
        ]),
        db.query(
            `SELECT q.* FROM plaka_questions q
             JOIN plaka_sessions s ON s.id = q.session_id
             WHERE s.public_id = $1 AND s.player_id = $2 AND q.position = $3`,
            [input.sessionId, input.playerId, input.position]
        ),
    ]);
    const session = asSession(rows[0]);
    if (!session) throw new PlakaStoreError('not_found');
    if (session.status !== 'active') throw new PlakaStoreError('session_inactive');
    // The session stays active so the client's follow-up finish call still records the run.
    const elapsedMs = Date.now() - new Date(String(session.started_at)).getTime();
    if (elapsedMs > SESSION_TTL_MS || isTimeAttackOver(session.mode, elapsedMs)) {
        throw new PlakaStoreError('session_expired');
    }
    const question = questionRows[0] as Row | undefined;
    if (!question) throw new PlakaStoreError('not_found');
    if (question.answered === true) throw new PlakaStoreError('already_answered');
    if (input.position !== Number(session.current_index)) {
        throw new PlakaStoreError('invalid_position');
    }

    const correctIndex = Number(question.correct_index);
    const options = (question.options as string[]) ?? [];
    const chosenIndex = input.optionIndex;
    // Map questions are answered with a plate code; the others with an option index.
    const isMap = question.kind === 'harita';
    const validChoice = isMap
        ? CITY_BY_CODE.has(chosenIndex)
        : Number.isInteger(chosenIndex) && chosenIndex >= 0 && chosenIndex < options.length;
    if (!validChoice) {
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

    // Both run only after the guard above, so they can't double-count.
    const [updated] = await Promise.all([
        db.query(
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
        ),
        db.query(
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
        ),
    ]);
    const after = updated[0] as Row;

    const answeredCount = Number(after.current_index);
    const totalQuestions = Number(after.question_count);
    const sessionComplete = answeredCount >= totalQuestions;

    return {
        correct: isCorrect,
        correctIndex,
        correctLabel: isMap ? formatPlate(correctIndex) : (options[correctIndex] ?? ''),
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

    const [rows, statsRows] = await Promise.all([
        db.query(`SELECT * FROM plaka_sessions WHERE public_id = $1 AND player_id = $2`, [
            publicId,
            playerId,
        ]),
        db.query(`SELECT best_score, total_score, games_played FROM plaka_player_stats WHERE player_id = $1`, [
            playerId,
        ]),
    ]);
    const session = asSession(rows[0]);
    if (!session) throw new PlakaStoreError('not_found');

    const statsBefore = statsRows[0] as Row | undefined;
    const previousBest = Number(statsBefore?.best_score ?? 0);

    let finished = session;
    let newlyUnlocked: AchievementProgress[] = [];
    if (session.status === 'active') {
        const elapsed = Date.now() - new Date(String(session.started_at)).getTime();
        const rawDuration = Math.max(0, elapsed);
        const durationMs =
            session.mode === 'zamana-karsi'
                ? Math.min(rawDuration, (TIME_ATTACK_SECONDS + TIME_ATTACK_GRACE_SECONDS) * 1000)
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
                    defaultGuestAvatar(playerId),
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

    const [statsAfter, mistakeRows] = await Promise.all([
        db.query(`SELECT total_score, games_played FROM plaka_player_stats WHERE player_id = $1`, [
            playerId,
        ]),
        db.query(
            `SELECT position, kind, city_code, city_name, options, chosen_index
             FROM plaka_questions
             WHERE session_id = $1 AND answered = true AND is_correct = false
             ORDER BY position ASC`,
            [finished.id]
        ),
    ]);
    const afterRow = statsAfter[0] as Row | undefined;
    const totalQuestions = Number(finished.question_count) || Number(finished.current_index);
    const answered = Number(finished.correct_count) + Number(finished.wrong_count);

    const mistakes: RunMistake[] = (mistakeRows as Row[]).map((row) => ({
        position: Number(row.position),
        cityCode: Number(row.city_code),
        cityName: String(row.city_name),
        chosenLabel:
            row.kind === 'harita'
                ? (CITY_BY_CODE.get(Number(row.chosen_index))?.name ?? '')
                : (((row.options as string[]) ?? [])[Number(row.chosen_index)] ?? ''),
    }));

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
        answered,
        totalQuestions,
        // Based on answered questions, so leaving a run early doesn't count skipped ones as wrong.
        accuracy: accuracy(Number(finished.correct_count), answered),
        durationMs: Number(finished.duration_ms ?? 0),
        bestStreak: Number(finished.best_streak),
        previousBest,
        totalScore: Number(afterRow?.total_score ?? 0),
        gamesPlayed: Number(afterRow?.games_played ?? 0),
        newRecord: Number(finished.score) > previousBest,
        finishedAt: iso(finished.finished_at) ?? new Date().toISOString(),
        unlockedAchievements: newlyUnlocked,
        mistakes,
    };
}

/* ------------------------------------------------------------------ */
/* Achievements                                                       */
/* ------------------------------------------------------------------ */

async function computeAchievementProgress(
    playerId: string
): Promise<{ progress: AchievementProgress[]; knownCodes: number[] }> {
    const db = getSql();
    const unlockedRowsQuery = db.query(
        `SELECT achievement_id, unlocked_at FROM plaka_player_achievements WHERE player_id = $1`,
        [playerId]
    );
    const rows = await db.query(
        `SELECT
            (SELECT count(DISTINCT city_code) FROM plaka_answers WHERE player_id = $1 AND is_correct) AS distinct_all,
            (SELECT count(DISTINCT city_code) FROM plaka_answers WHERE player_id = $1 AND is_correct AND mode = 'plaka-sehir') AS distinct_plate,
            (SELECT array_agg(DISTINCT city_code) FROM plaka_answers WHERE player_id = $1 AND is_correct) AS codes,
            (SELECT count(*) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished') AS games,
            (SELECT COALESCE(max(best_streak), 0) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished') AS streak,
            (SELECT COALESCE(max(score), 0) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished' AND mode = 'zamana-karsi') AS time_best,
            (SELECT count(*) FROM plaka_sessions WHERE player_id = $1 AND status = 'finished' AND correct_count >= $2 AND correct_count = question_count) AS perfect_rounds`,
        [playerId, STANDARD_QUESTION_COUNT]
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

    const unlockedRows = await unlockedRowsQuery;
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

    const progress = ACHIEVEMENTS.map((achievement) => {
        const entry = state[achievement.id];
        return {
            id: achievement.id,
            unlocked: entry.unlocked || unlockedAt.has(achievement.id),
            unlockedAt: unlockedAt.get(achievement.id) ?? null,
            progress: entry.unlocked ? 1 : entry.progress,
            progressLabel: entry.label,
        };
    });
    return { progress, knownCodes: codes };
}

async function syncAchievements(playerId: string): Promise<AchievementProgress[]> {
    const { progress: state } = await computeAchievementProgress(playerId);
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

const PERIOD_CONDITIONS: Record<Exclude<LeaderboardPeriod, 'challenge'>, string> = {
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

    const period = (['challenge', 'daily', 'weekly', 'all'] as const).includes(options.period)
        ? options.period
        : 'daily';
    const mode = options.mode === 'all' || isPlakaMode(options.mode) ? options.mode : 'all';
    const modeCondition = mode === 'all' ? 'true' : `s.mode = '${mode}'`;
    // dailyKey() only ever yields YYYY-MM-DD, so it is safe to inline.
    const periodCondition =
        period === 'challenge'
            ? `s.is_daily = true AND s.daily_key = '${dailyKey()}'`
            : PERIOD_CONDITIONS[period];

    const pageQuery = db.query(
        `WITH best AS (
            SELECT s.player_id, MAX(s.score) AS score, COUNT(*) AS games
            FROM plaka_sessions s
            WHERE s.status = 'finished' AND ${periodCondition} AND ${modeCondition}
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

    const meQuery = options.playerId
        ? db.query(
              `WITH best AS (
                  SELECT s.player_id, MAX(s.score) AS score, COUNT(*) AS games
                  FROM plaka_sessions s
                  WHERE s.status = 'finished' AND ${periodCondition} AND ${modeCondition}
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
        : Promise.resolve([]);

    const [page, me] = await Promise.all([pageQuery, meQuery]);
    const rows = page as Row[];
    const meRow = (me[0] ?? null) as Row | null;

    return {
        period,
        mode,
        entries: rows.map((row) => ({
            rank: Number(row.rank),
            name: publicName(String(row.player_id), row.name),
            avatar: publicAvatar(String(row.player_id), row.avatar),
            score: Number(row.score),
            games: Number(row.games),
            isMe: options.playerId !== null && String(row.player_id) === options.playerId,
        })),
        me: meRow
            ? {
                  rank: Number(meRow.rank),
                  score: Number(meRow.score),
                  name: publicName(options.playerId as string, meRow.name),
                  avatar: publicAvatar(options.playerId as string, meRow.avatar),
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

    const key = dailyKey();
    const [statsRows, rankRows, dailyRows, { progress: achievements, knownCodes }] = await Promise.all([
        db.query(`SELECT * FROM plaka_player_stats WHERE player_id = $1`, [playerId]),
        db.query(
            `SELECT rank FROM (
                SELECT player_id, ROW_NUMBER() OVER (ORDER BY best_score DESC, player_id ASC) AS rank
                FROM plaka_player_stats WHERE best_score > 0
             ) ranked WHERE player_id = $1`,
            [playerId]
        ),
        db.query(
            `SELECT score, status FROM plaka_sessions
             WHERE player_id = $1 AND is_daily = true AND daily_key = $2 AND status = 'finished'`,
            [playerId, key]
        ),
        computeAchievementProgress(playerId),
    ]);
    const statsRow = (statsRows[0] ?? null) as Row | null;
    const dailyRow = (dailyRows[0] ?? null) as Row | null;

    const totalCorrect = Number(statsRow?.total_correct ?? 0);
    const totalWrong = Number(statsRow?.total_wrong ?? 0);

    return {
        playerId,
        name: publicName(playerId, statsRow?.display_name),
        avatar: publicAvatar(playerId, statsRow?.avatar),
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
        knownCodes,
    };
}
