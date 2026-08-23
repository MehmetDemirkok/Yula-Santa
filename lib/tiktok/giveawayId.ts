import { secureRandomInt } from '@/lib/random';

/** Excludes visually ambiguous characters (0/O, 1/I). */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

export function createGiveawayId(): string {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        code += CODE_ALPHABET[secureRandomInt(CODE_ALPHABET.length)];
    }
    return `YS-TT-${code}`;
}

export function isValidGiveawayId(id: string): boolean {
    return /^YS-TT-[A-Z0-9]{8}$/.test(id);
}
