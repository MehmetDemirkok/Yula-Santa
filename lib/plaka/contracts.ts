/**
 * Plaka Avcısı — API contracts shared by server routes and client components.
 * Client-safe (types only), so importing this never pulls in DB/Node code.
 */

import type { AchievementProgress } from './achievements';
import type { PlakaLevel, PlakaMode, QuestionKind } from './game';

export type PublicQuestion = {
    position: number;
    kind: QuestionKind;
    prompt: string;
    options: string[];
    difficulty: string;
};

export type StartedSession = {
    status: 'started';
    sessionId: string;
    mode: PlakaMode;
    level: PlakaLevel;
    daily: boolean;
    dailyKey: string | null;
    durationSeconds: number | null;
    totalQuestions: number;
    startedAt: string;
    answeredCount: number;
    score: number;
    currentStreak: number;
    bestStreak: number;
    player: { displayName: string; avatar: string | null };
    questions: PublicQuestion[];
    playerKind?: 'user' | 'guest';
};

export type DailyDoneSession = {
    status: 'daily_done';
    score: number;
    correct: number;
    total: number;
    finishedAt: string | null;
};

export type StartSessionResult = StartedSession | DailyDoneSession;

export type AnswerResult = {
    correct: boolean;
    correctIndex: number;
    correctLabel: string;
    chosenIndex: number;
    points: number;
    comboBonus: number;
    streak: number;
    bestStreak: number;
    score: number;
    answeredCount: number;
    totalQuestions: number;
    nextPosition: number | null;
    sessionComplete: boolean;
    cityName: string;
    cityCode: number;
};

export type GameSummary = {
    sessionId: string;
    mode: PlakaMode;
    modeTitle: string;
    level: PlakaLevel;
    levelLabel: string;
    daily: boolean;
    score: number;
    correct: number;
    wrong: number;
    answered: number;
    totalQuestions: number;
    accuracy: number;
    durationMs: number;
    bestStreak: number;
    previousBest: number;
    totalScore: number;
    gamesPlayed: number;
    newRecord: boolean;
    finishedAt: string;
    unlockedAchievements: AchievementProgress[];
};

export type LeaderboardPeriod = 'daily' | 'weekly' | 'all';

export type LeaderboardEntry = {
    rank: number;
    name: string;
    avatar: string | null;
    score: number;
    games: number;
    isMe: boolean;
};

export type LeaderboardResult = {
    period: LeaderboardPeriod;
    mode: PlakaMode | 'all';
    entries: LeaderboardEntry[];
    me: { rank: number; score: number; name: string; avatar: string | null } | null;
    playerCount: number;
    updatedAt: string;
};

export type PlayerOverview = {
    playerId: string;
    name: string;
    avatar: string | null;
    stats: {
        totalScore: number;
        gamesPlayed: number;
        bestScore: number;
        bestStreak: number;
        totalCorrect: number;
        totalWrong: number;
        accuracy: number;
        totalTimeMs: number;
        globalRank: number | null;
    };
    daily: {
        key: string;
        done: boolean;
        score: number | null;
        modeTitle: string;
    };
    achievements: AchievementProgress[];
    playerKind?: 'user' | 'guest';
};

export type PlakaApiError = {
    error: string;
    message?: string;
};
