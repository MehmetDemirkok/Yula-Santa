type LogFields = Record<string, string | number | boolean | null | undefined>;

export function createRequestId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `tt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Structured one-line JSON log for Vercel / server logs. */
export function logTikTokEvent(event: string, fields: LogFields): void {
    const payload = {
        scope: 'tiktok',
        event,
        ts: new Date().toISOString(),
        ...fields,
    };
    // Prefer info for success paths; callers pass error level via event name
    if (event.includes('error') || event.includes('fail')) {
        console.error(JSON.stringify(payload));
    } else {
        console.info(JSON.stringify(payload));
    }
}
