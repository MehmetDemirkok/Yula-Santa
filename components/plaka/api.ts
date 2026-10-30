/**
 * Plaka Avcısı — typed fetch helpers used by client components.
 */

import type {
    AnswerResult,
    GameSummary,
    LeaderboardPeriod,
    LeaderboardResult,
    PlayerOverview,
    StartSessionResult,
} from '@/lib/plaka/contracts';
import type { PlakaLevel, PlakaMode } from '@/lib/plaka/game';

export class PlakaClientError extends Error {
    constructor(
        public code: string,
        message: string,
        public status: number
    ) {
        super(message);
        this.name = 'PlakaClientError';
    }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...init,
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });

    let payload: unknown = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const data = (payload ?? {}) as { error?: string; message?: string };
        throw new PlakaClientError(
            data.error ?? 'request_failed',
            data.message ?? 'Bir şeyler ters gitti. Lütfen tekrar dene.',
            response.status
        );
    }

    return payload as T;
}

export const plakaApi = {
    stats(): Promise<PlayerOverview> {
        return request<PlayerOverview>('/api/plaka/stats');
    },

    startSession(input: {
        mode: PlakaMode;
        level: PlakaLevel;
        daily?: boolean;
        nickname?: string;
    }): Promise<StartSessionResult & { playerKind?: 'user' | 'guest' }> {
        return request('/api/plaka/session', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },

    answer(input: {
        sessionId: string;
        position: number;
        optionIndex: number;
        responseMs: number;
    }): Promise<AnswerResult> {
        return request('/api/plaka/answer', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },

    finish(sessionId: string): Promise<GameSummary> {
        return request('/api/plaka/finish', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        });
    },

    leaderboard(period: LeaderboardPeriod, mode: PlakaMode | 'all'): Promise<LeaderboardResult> {
        const params = new URLSearchParams({ period, mode });
        return request<LeaderboardResult>(`/api/plaka/leaderboard?${params.toString()}`);
    },
};
