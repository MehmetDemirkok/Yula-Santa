/**
 * TikTok giveaway shared types.
 * Keep participant shape compatible with existing ClientPage + draw proof.
 */

export type TikTokParticipant = {
    name: string;
    comment: string;
};

/** Raw comment-like object coming from any provider before validation. */
export type TikTokRawComment = {
    uniqueId?: unknown;
    nickname?: unknown;
    username?: unknown;
    text?: unknown;
    comment?: unknown;
    [key: string]: unknown;
};
