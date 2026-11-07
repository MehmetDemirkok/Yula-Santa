import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildGiftPrompt,
    parseGeminiResponse,
    parseGiftRequest,
    staticSuggestions,
} from '../../lib/gifts/suggest';

const geminiReply = (payload: unknown) => ({
    candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
});

test('request input is bounded and defaults are safe', () => {
    const input = parseGiftRequest({
        occasion: 'Yılbaşı\n\n',
        relationship: 'x'.repeat(500),
        budget: 'unlimited',
        notes: 'n'.repeat(1000),
        locale: 'xx',
    });
    assert.equal(input.occasion, 'Yılbaşı');
    assert.equal(input.relationship.length, 60);
    assert.equal(input.notes.length, 300);
    assert.equal(input.budget, 'medium');
    assert.equal(input.locale, 'tr');
    assert.deepEqual(parseGiftRequest(null), { occasion: '', relationship: '', budget: 'medium', notes: '', locale: 'tr' });
});

test('the result page request shape still works', () => {
    const input = parseGiftRequest({ gender: 'uni-sex', budget: 'medium', relationship: 'friend' });
    assert.equal(input.relationship, 'friend');
    assert.match(buildGiftPrompt(input), /intended for "friend"/);
});

test('prompt carries the occasion, budget and language', () => {
    const prompt = buildGiftPrompt(parseGiftRequest({ occasion: 'Doğum günü', budget: 'high', notes: 'kamp sever', locale: 'de' }));
    assert.match(prompt, /"Doğum günü"/);
    assert.match(prompt, /generous, high-end/);
    assert.match(prompt, /in German/);
    assert.match(prompt, /"kamp sever"/);
});

test('Gemini replies are validated and trimmed', () => {
    const ok = parseGeminiResponse(
        geminiReply({
            suggestions: [
                { title: ' Kamp Sandalyesi ', description: 'Hafif ve katlanır.' },
                { title: '', description: 'boş başlık atılır' },
                { title: 'Eksik açıklama' },
                ...Array.from({ length: 6 }, (_, i) => ({ title: `Fikir ${i}`, description: 'Açıklama' })),
            ],
        })
    );
    assert.ok(ok);
    assert.equal(ok.length, 5);
    assert.deepEqual(ok[0], { title: 'Kamp Sandalyesi', description: 'Hafif ve katlanır.' });

    assert.equal(parseGeminiResponse({}), null);
    assert.equal(parseGeminiResponse({ candidates: [{ content: { parts: [{ text: 'not json' }] } }] }), null);
    assert.equal(parseGeminiResponse(geminiReply({ suggestions: [] })), null);
});

test('static fallback always has three ideas for any budget', () => {
    for (const budget of ['low', 'medium', 'high'] as const) {
        const list = staticSuggestions(budget);
        assert.equal(list.length, 3);
        assert.ok(list.every((item) => item.title && item.description));
    }
});
