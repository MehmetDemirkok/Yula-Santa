/**
 * Plaka Avcısı — nickname filter (client-safe).
 *
 * Nicknames are shown on the public leaderboard, so obvious profanity and slurs
 * are rejected at entry and hidden on display. This is a basic list, not a
 * moderation system: it trades completeness for few false positives, which is
 * why short or ambiguous words only match as whole words (Amina, Nigar, Nazif,
 * "oynayarak", Ashita and Dickens must all stay allowed).
 */

const LEET: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i',
};

const FOLD: Record<string, string> = {
    ı: 'i', ğ: 'g', ü: 'u', ş: 's', ö: 'o', ç: 'c', â: 'a', î: 'i', û: 'u',
};

/** Long enough to be unambiguous anywhere inside a name. */
const ANYWHERE = [
    'orospu', 'orosbu', 'siktir', 'sikerim', 'sikeyim', 'aminakoy', 'aminako', 'amcik',
    'pezevenk', 'kahpe', 'kaltak', 'serefsiz', 'gerizekali', 'yavsak', 'dalyarak', 'yarrak',
    'fuck', 'bitch', 'nigger', 'faggot', 'whore', 'asshole', 'pussy', 'porn', 'hitler',
];

/** Only as a whole word. */
const WHOLE_WORD = new Set([
    'amk', 'amq', 'aq', 'sik', 'pic', 'yarak', 'tasak', 'tassak', 'pust', 'ibne', 'gavat',
    'nazi', 'cunt', 'dick', 'shit', 'nigga',
]);

/** As the start of a word. */
const WORD_START = ['sikis', 'sikik', 'yarag', 'ibnel', 'shitt'];

function normalize(value: string): string {
    return value
        .toLocaleLowerCase('tr-TR')
        .split('')
        .map((ch) => FOLD[ch] ?? LEET[ch] ?? ch)
        .join('');
}

/** "orrrospu" → "orospu". */
const collapse = (value: string) => value.replace(/(.)\1+/g, '$1');
/** "yarrrrak" → "yarrak": keeps real double letters, so "oynayarak" never turns into a match. */
const squeeze = (value: string) => value.replace(/(.)\1{2,}/g, '$1$1');
const hasDouble = (value: string) => /(.)\1/.test(value);

/** Terms with a double letter only match forms that keep double letters. */
function containsTerm(compact: string, term: string): boolean {
    if (compact.includes(term) || squeeze(compact).includes(term)) return true;
    return !hasDouble(term) && collapse(compact).includes(term);
}

export function isOffensiveNickname(value: string): boolean {
    const normalized = normalize(value);
    const words = normalized.split(/[^a-z]+/).filter(Boolean);
    const compact = words.join('');

    if (ANYWHERE.some((term) => containsTerm(compact, term))) return true;
    for (const word of words) {
        for (const form of new Set([word, squeeze(word), collapse(word)])) {
            if (WHOLE_WORD.has(form)) return true;
            if (WORD_START.some((start) => form.startsWith(start))) return true;
        }
    }
    return false;
}

export const NICKNAME_REJECTED_MESSAGE = 'Bu takma ad uygun değil. Lütfen başka bir ad seç.';
