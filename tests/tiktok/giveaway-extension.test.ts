import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createGiveawayId, isValidGiveawayId } from '../../lib/tiktok/giveawayId';
import { computeDedupeKey, createOwnerToken, timingSafeTokenEquals } from '../../lib/tiktok/giveawayStore';
import { validateImportBatch, MAX_IMPORT_BATCH } from '../../lib/tiktok/giveawayImport';
import { applyGiveawayFilters } from '../../lib/giveawayFilters';
import { pickWinners } from '../../lib/random';

describe('createGiveawayId', () => {
    it('produces YS-TT-XXXXXXXX with an unambiguous alphabet', () => {
        for (let i = 0; i < 20; i++) {
            const id = createGiveawayId();
            assert.match(id, /^YS-TT-[A-Z0-9]{8}$/);
            assert.equal(isValidGiveawayId(id), true);
        }
    });

    it('rejects malformed ids', () => {
        assert.equal(isValidGiveawayId('YS-TT-123'), false);
        assert.equal(isValidGiveawayId('ys-tt-ABCDEFGH'), false);
        assert.equal(isValidGiveawayId(''), false);
    });
});

describe('createOwnerToken / timingSafeTokenEquals', () => {
    it('generates 48 hex chars and only matches itself', () => {
        const a = createOwnerToken();
        const b = createOwnerToken();
        assert.match(a, /^[0-9a-f]{48}$/);
        assert.notEqual(a, b);
        assert.equal(timingSafeTokenEquals(a, a), true);
        assert.equal(timingSafeTokenEquals(a, b), false);
    });

    it('rejects empty or mismatched-length tokens without throwing', () => {
        assert.equal(timingSafeTokenEquals('', ''), false);
        assert.equal(timingSafeTokenEquals('abc', 'abcd'), false);
    });
});

describe('computeDedupeKey', () => {
    it('prefers commentId when present', () => {
        const a = computeDedupeKey({ username: 'alice', comment: 'hi', commentId: '123' });
        const b = computeDedupeKey({ username: 'alice', comment: 'different text', commentId: '123' });
        assert.equal(a, b);
    });

    it('falls back to username+comment+timestamp when commentId is missing', () => {
        const a = computeDedupeKey({ username: 'bob', comment: 'yo', commentedAt: '2026-08-23T10:00:00.000Z' });
        const b = computeDedupeKey({ username: 'bob', comment: 'yo', commentedAt: '2026-08-23T10:00:00.000Z' });
        const c = computeDedupeKey({ username: 'bob', comment: 'yo', commentedAt: '2026-08-23T11:00:00.000Z' });
        assert.equal(a, b);
        assert.notEqual(a, c);
    });
});

describe('validateImportBatch', () => {
    it('drops invalid usernames and empty comments, normalizes the rest', () => {
        const { valid, invalidUsername, emptyComment } = validateImportBatch([
            { username: '@Mehmet', displayName: 'Mehmet', comment: 'YULASANTA katılıyorum' },
            { username: 'has space', comment: 'nope' },
            { username: 'ayse', comment: '   ' },
            { username: 'ayse', comment: 'harika' },
        ]);
        assert.equal(valid.length, 2);
        assert.equal(invalidUsername, 1);
        assert.equal(emptyComment, 1);
        assert.equal(valid[0].username, 'mehmet');
    });

    it('respects MAX_IMPORT_BATCH as a documented constant', () => {
        assert.equal(MAX_IMPORT_BATCH, 1000);
    });
});

describe('one-user-one-entry via applyGiveawayFilters (extension flow)', () => {
    it('same user with 3 comments counts as a single eligible entry', () => {
        const entries = [
            { name: 'mehmet', comment: 'yorum 1' },
            { name: 'mehmet', comment: 'yorum 2' },
            { name: 'mehmet', comment: 'yorum 3' },
            { name: 'ayse', comment: 'yorum' },
        ];
        const { eligible, stats } = applyGiveawayFilters(entries, { countUserOnce: true });
        assert.equal(eligible.length, 2);
        assert.equal(stats.eligible, 2);

        const { eligible: withoutDedupe } = applyGiveawayFilters(entries, { countUserOnce: false });
        assert.equal(withoutDedupe.length, 4);
    });
});

describe('winner selection uses the crypto engine (no duplicates, correct length)', () => {
    it('picks distinct winners without exceeding the pool size', () => {
        const pool = Array.from({ length: 50 }, (_, i) => ({ name: `user${i}`, comment: 'x' }));
        const winners = pickWinners(pool, 5);
        assert.equal(winners.length, 5);
        assert.equal(new Set(winners.map((w) => w.name)).size, 5);
    });
});
