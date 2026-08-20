import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    applyManualImportPreview,
    capFetchedParticipants,
    COMMENTS_PER_FETCH,
    FETCH_PRICE_TRY,
    formatFetchPrice,
    isLikelyTikTokUrl,
    isValidEmail,
    isValidTikTokUsername,
    normalizeParticipantBatch,
    normalizeTikTokUsername,
    parseManualImport,
    sanitizeDisplayUsername,
} from '../../lib/tiktok';
import { applyGiveawayFilters, extractOwnerFromSocialUrl } from '../../lib/giveawayFilters';
import { analyzePaidFetchFailure } from '../../lib/tiktok/failureAnalysis';
import { createCreditToken, verifyCreditToken } from '../../lib/tiktok/entitlement';

describe('normalizeTikTokUsername', () => {
    it('strips @ and lowercases', () => {
        assert.equal(normalizeTikTokUsername('@FooBar'), 'foobar');
        assert.equal(normalizeTikTokUsername('  @@User  '), 'user');
    });
});

describe('isValidTikTokUsername', () => {
    it('accepts valid handles', () => {
        assert.equal(isValidTikTokUsername('creator_01'), true);
        assert.equal(isValidTikTokUsername('a.b'), true);
    });
    it('rejects invalid handles', () => {
        assert.equal(isValidTikTokUsername(''), false);
        assert.equal(isValidTikTokUsername('has space'), false);
        assert.equal(isValidTikTokUsername('bad!'), false);
    });
});

describe('normalizeParticipantBatch', () => {
    it('skips invalid and empty, dedupes by username', () => {
        const result = normalizeParticipantBatch([
            { uniqueId: 'alice', text: 'hi' },
            { uniqueId: 'Alice', text: 'again' },
            { uniqueId: '', text: 'nope' },
            { nickname: 'bob!', text: 'bad' },
            { uniqueId: 'bob', text: 'ok' },
            null as unknown as { uniqueId: string },
        ]);
        assert.equal(result.participants.length, 2);
        assert.equal(result.participants[0].name, 'alice');
        assert.equal(result.participants[1].name, 'bob');
        assert.ok(result.duplicatesRemoved >= 1);
        assert.ok(result.invalidRecords + result.emptyUsernamesRemoved >= 2);
    });
});

describe('owner exclusion + filters', () => {
    it('extracts owner from TikTok URL', () => {
        assert.equal(
            extractOwnerFromSocialUrl('https://www.tiktok.com/@CreatorX/video/123'),
            'creatorx'
        );
    });

    it('applies keyword, dedupe and owner exclude before draw', () => {
        const entries = [
            { name: 'alice', comment: '#win please' },
            { name: 'Alice', comment: '#win again' },
            { name: 'bob', comment: 'hello' },
            { name: 'creatorx', comment: '#win owner' },
        ];
        const { eligible, stats } = applyGiveawayFilters(entries, {
            countUserOnce: true,
            keyword: '#win',
            excludeNames: ['creatorx'],
        });
        assert.equal(stats.total, 4);
        assert.equal(stats.afterKeyword, 3);
        assert.equal(stats.afterDedupe, 2); // alice + creatorx after dedupe of Alice
        assert.equal(eligible.length, 1);
        assert.equal(eligible[0].name, 'alice');
    });
});

describe('manual import parser', () => {
    it('parses CSV, colon, tab and bare usernames with preview', () => {
        const raw = [
            'username,comment',
            'alice,hello world',
            '@bob: hi there',
            'carol\twelcome',
            'dave',
            'alice,duplicate',
            'bad name!,nope',
        ].join('\n');

        const preview = parseManualImport(raw);
        assert.equal(preview.validCount, 4);
        assert.equal(preview.duplicateCount, 1);
        assert.ok(preview.invalidCount >= 1);

        const applied = applyManualImportPreview(preview);
        assert.deepEqual(
            applied.map((p) => p.name),
            ['alice', 'bob', 'carol', 'dave']
        );
    });

    it('respects existing names as duplicates', () => {
        const preview = parseManualImport('alice: hi\nbob: yo', ['alice']);
        assert.equal(preview.validCount, 1);
        assert.equal(preview.duplicateCount, 1);
        assert.equal(applyManualImportPreview(preview)[0].name, 'bob');
    });
});

describe('url validation', () => {
    it('accepts tiktok hosts', () => {
        assert.equal(isLikelyTikTokUrl('https://www.tiktok.com/@u/video/1'), true);
        assert.equal(isLikelyTikTokUrl('tiktok.com/@u/video/1'), true);
        assert.equal(isLikelyTikTokUrl('https://example.com'), false);
    });
});

describe('sanitizeDisplayUsername', () => {
    it('strips control chars and @', () => {
        assert.equal(sanitizeDisplayUsername('@user\u0000name'), 'username');
    });
});

describe('paid fetch product', () => {
    it('locks 500 comments and 200 TL', () => {
        assert.equal(COMMENTS_PER_FETCH, 500);
        assert.equal(FETCH_PRICE_TRY, 200);
        assert.match(formatFetchPrice('tr'), /200/);
    });

    it('caps fetched participants at 500', () => {
        const items = Array.from({ length: 501 }, (_, i) => ({ name: `u${i}` }));
        const capped = capFetchedParticipants(items);
        assert.equal(capped.length, 500);
        assert.equal(capped[0].name, 'u0');
        assert.equal(capped[499].name, 'u499');
        assert.deepEqual(capFetchedParticipants([{ name: 'a' }]), [{ name: 'a' }]);
    });
});

describe('isValidEmail', () => {
    it('accepts and rejects addresses', () => {
        assert.equal(isValidEmail('a@b.co'), true);
        assert.equal(isValidEmail('  a@b.co  '), true);
        assert.equal(isValidEmail('nope'), false);
        assert.equal(isValidEmail(''), false);
    });
});

describe('analyzePaidFetchFailure', () => {
    it('never refunds and always grants one credit', () => {
        const infra = analyzePaidFetchFailure('TIMEOUT');
        assert.equal(infra.refund, false);
        assert.equal(infra.grantCredit, true);
        assert.equal(infra.category, 'infrastructure');
        assert.equal(analyzePaidFetchFailure('EMPTY_RESULT').category, 'empty');
        assert.equal(analyzePaidFetchFailure('PRIVATE_VIDEO').category, 'video');
    });
});

describe('credit token', () => {
    it('round-trips a signed entitlement', () => {
        process.env.TIKTOK_LEDGER_SECRET = 'test-ledger-secret';
        const token = createCreditToken('ent_1', 'User@Mail.com');
        const payload = verifyCreditToken(token);
        assert.equal(payload?.id, 'ent_1');
        assert.equal(payload?.email, 'user@mail.com');
        assert.equal(verifyCreditToken('ttc1.nope.nope'), null);
    });
});
