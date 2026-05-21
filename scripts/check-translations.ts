/**
 * i18n Key Check Script
 *
 * Compares all language files against tr.json (source of truth).
 * Exits with code 1 if any keys are missing — suitable for CI/CD.
 *
 * Usage:
 *   npx tsx scripts/check-translations.ts
 *   npx tsx scripts/check-translations.ts --fix   (logs only, no exit 1)
 */

import fs from 'fs';
import path from 'path';

function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
    const keys: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${k}` : k;
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
            keys.push(...flattenKeys(v, full));
        } else {
            keys.push(full);
        }
    }
    return keys;
}

const messagesDir = path.join(process.cwd(), 'messages');
const refLang = 'tr';
const reportOnly = process.argv.includes('--fix');

const refFile = path.join(messagesDir, `${refLang}.json`);
const refData = JSON.parse(fs.readFileSync(refFile, 'utf-8'));
const refKeys = new Set(flattenKeys(refData));

const langs = fs
    .readdirSync(messagesDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .filter((l) => l !== refLang)
    .sort();

let totalMissing = 0;

console.log(`\n🔍 i18n Key Check — referans: ${refLang}.json (${refKeys.size} key)\n`);

for (const lang of langs) {
    const data = JSON.parse(fs.readFileSync(path.join(messagesDir, `${lang}.json`), 'utf-8'));
    const keys = new Set(flattenKeys(data));
    const missing = [...refKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !refKeys.has(k));

    if (missing.length === 0 && extra.length === 0) {
        console.log(`  ✅  ${lang.padEnd(4)} — tüm keyler eşleşiyor`);
    } else {
        console.log(`  ❌  ${lang.padEnd(4)} — ${missing.length} eksik, ${extra.length} fazla`);
        for (const k of missing) {
            console.log(`        EKSIK: ${k}`);
        }
        for (const k of extra) {
            console.log(`        FAZLA: ${k}`);
        }
        totalMissing += missing.length;
    }
}

console.log('');

if (totalMissing > 0 && !reportOnly) {
    console.error(`❌ Toplam ${totalMissing} eksik key bulundu. Çevirileri senkronize edin:\n   npx tsx scripts/generate-translations.ts <dil> --sync\n`);
    process.exit(1);
} else if (totalMissing === 0) {
    console.log('✅ Tüm diller senkronize!\n');
}
