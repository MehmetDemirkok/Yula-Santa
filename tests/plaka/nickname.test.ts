import test from 'node:test';
import assert from 'node:assert/strict';

import { isOffensiveNickname } from '../../lib/plaka/nickname';

test('rejects common Turkish and English profanity, including disguised spellings', () => {
    for (const name of [
        'orospu', 'OROSPU çocuğu', 'Or0spu', 'orrrospu', 'o.r.o.s.p.u', 'siktir git', 'S1ktir',
        'amk', 'AMK Avcı', 'aq', 'piç', 'Yarrak', 'pezevenk', 'şerefsiz', 'Gerizekalı', 'yavşak',
        'ibne', 'fuck you', 'FuCk', 'bitch', 'nigger', 'Hitler', 'shit', 'dick',
    ]) {
        assert.ok(isOffensiveNickname(name), `should reject: ${name}`);
    }
});

test('keeps ordinary names and words that only contain a bad word by accident', () => {
    for (const name of [
        'Ali Kaya', 'Plaka Ustası', 'Amina', 'Nigar', 'Nazif', 'Oynayarak', 'Müsik', 'Kısıkım',
        'Ashita', 'Scunthorpe', 'Dickens', 'Shiitake', 'Gotik', 'Avcı 1234', 'Sibel', 'Ibrahim',
        'Mehmet', 'Zeynep', 'İstanbul 34', 'Niger', 'Kahraman', 'Basketbol',
    ]) {
        assert.ok(!isOffensiveNickname(name), `should allow: ${name}`);
    }
});
