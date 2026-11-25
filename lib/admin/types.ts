export type RangeKey = "today" | "7d" | "30d" | "90d";

export const RANGE_KEYS: RangeKey[] = ["today", "7d", "30d", "90d"];

export type TrendPoint = {
    label: string;
    fullLabel: string;
    visitors: number;
    pageviews: number;
    draws: number;
};

export type NamedCount = { name: string; count: number };

export type ToolRow = {
    name: string;
    draws: number;
    /** Distinct visitors who drew. One person rolling dice 100 times counts once here. */
    users: number;
    /** null when no draw of this tool reported a participant count. */
    avgParticipants: number | null;
    /** Percent change against the previous period; null when there is nothing to compare with. */
    delta: number | null;
};

export type RangeData = {
    series: TrendPoint[];
    totals: {
        visitors: number;
        pageviews: number;
        draws: number;
        drawers: number;
        sharers: number;
        avgParticipants: number | null;
        plakaGames: number;
        extensionGiveaways: number;
        /** Distinct visitors who opened a Secret Santa personal link (/s#…) that decoded. */
        santaLinksOpened: number;
        /** Distinct visitors who landed on /s with a missing or broken token. */
        santaLinksInvalid: number;
        /** Distinct visitors who clicked "start your own draw" on a personal link. */
        santaLinkStarters: number;
        /** Secret Santa draws whose organizer sent every personal link. */
        santaAllSent: number;
    };
    deltas: {
        visitors: number | null;
        pageviews: number | null;
        draws: number | null;
        conversion: number | null;
        avgParticipants: number | null;
        shareRate: number | null;
        plakaGames: number | null;
        extensionGiveaways: number | null;
        santaLinksOpened: number | null;
        santaLinksInvalid: number | null;
        santaLinkStartRate: number | null;
        santaAllSent: number | null;
    };
    tools: ToolRow[];
    funnel: NamedCount[];
    countries: NamedCount[];
    languages: NamedCount[];
    sources: NamedCount[];
    browsers: NamedCount[];
    pages: NamedCount[];
    devices: NamedCount[];
    visitorTypes: NamedCount[];
    consent: NamedCount[];
};

export type EventType = import("@/lib/analytics/events").EventName;

export type LiveEvent = {
    id: string;
    minutesAgo: number;
    type: EventType;
    title: string;
    detail: string;
    visitor: string;
    country: string;
    language: string;
    device: string;
};

export type AccessRow = {
    id: string;
    when: string;
    outcome: "allowed" | "denied";
    event: string;
    account: string;
    origin: string;
};

export type AdminData = {
    range: RangeData;
    events: LiveEvent[];
    access: AccessRow[];
};
