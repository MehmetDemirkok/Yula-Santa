import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TikTokCommentProvider, TikTokFetchResult } from '../../lib/tiktok';

/** Minimal stub proving UI/API can swap providers without touching draw logic. */
class StubCommentProvider implements TikTokCommentProvider {
    readonly id = 'stub';

    async fetchComments(): Promise<TikTokFetchResult> {
        return {
            participants: [
                { name: 'alice', comment: 'hi' },
                { name: 'bob', comment: 'yo' },
            ],
            meta: {
                provider: this.id,
                durationMs: 1,
                fetchedComments: 2,
                validParticipants: 2,
                invalidRecords: 0,
                duplicatesRemoved: 0,
                emptyUsernamesRemoved: 0,
                retryCount: 0,
                pageCount: 1,
            },
        };
    }
}

describe('TikTokCommentProvider adapter', () => {
    it('returns participants through the provider interface', async () => {
        const provider: TikTokCommentProvider = new StubCommentProvider();
        const result = await provider.fetchComments('https://www.tiktok.com/@x/video/1');
        assert.equal(provider.id, 'stub');
        assert.equal(result.participants.length, 2);
        assert.equal(result.meta.provider, 'stub');
    });
});
