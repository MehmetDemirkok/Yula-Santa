/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI Translation Generator Script
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This script automatically generates translations using OpenAI's GPT API.
 * 
 * USAGE:
 * 1. Set OPENAI_API_KEY environment variable
 * 2. Run: npx tsx scripts/generate-translations.ts <locale>
 * 
 * EXAMPLE:
 * npx tsx scripts/generate-translations.ts fr
 * npx tsx scripts/generate-translations.ts es
 * 
 * HOW IT WORKS:
 * 1. Reads the source file (tr.json - Turkish is the source of truth)
 * 2. Sends each section to OpenAI for translation
 * 3. Preserves the JSON structure and keys
 * 4. Writes the translated content to messages/<locale>.json
 * 
 * REQUIREMENTS:
 * - OpenAI API key (set as OPENAI_API_KEY environment variable)
 * - Node.js 18+ (for fetch API)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Language names for prompts
const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    ar: 'Arabic',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Simplified Chinese'
};

async function translateWithOpenAI(text: string, targetLanguage: string): Promise<string> {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional translator. Translate the following JSON values from Turkish to ${targetLanguage}. 
IMPORTANT RULES:
- Keep all JSON keys exactly the same (do not translate keys)
- Only translate the string values
- Preserve any placeholders like {count}, {name}, etc.
- Preserve any emoji characters
- Keep the JSON structure intact
- Return ONLY valid JSON, no explanations`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

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

function getNestedValue(obj: Record<string, any>, keyPath: string): any {
    return keyPath.split('.').reduce((acc, k) => acc?.[k], obj);
}

function setNestedValue(obj: Record<string, any>, keyPath: string, value: any): void {
    const parts = keyPath.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') {
            cur[parts[i]] = {};
        }
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
}

async function generateTranslation(targetLocale: string, syncMode = false) {
    const sourcePath = path.join(process.cwd(), 'messages', 'tr.json');
    const targetPath = path.join(process.cwd(), 'messages', `${targetLocale}.json`);
    const sourceJson = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

    if (syncMode) {
        // SYNC MODE: Translate only keys missing in the target file
        console.log(`\n🔄 Sync mode: ${targetLocale} (${LANGUAGE_NAMES[targetLocale] || targetLocale})\n`);

        let targetJson: Record<string, any> = {};
        if (fs.existsSync(targetPath)) {
            targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
        }

        const sourceKeys = flattenKeys(sourceJson);
        const targetKeys = new Set(flattenKeys(targetJson));
        const missingKeys = sourceKeys.filter((k) => !targetKeys.has(k));

        if (missingKeys.length === 0) {
            console.log(`  ✅ ${targetLocale} zaten senkronize, eksik key yok.\n`);
            return;
        }

        console.log(`  📋 ${missingKeys.length} eksik key çevriliyor...\n`);

        for (const key of missingKeys) {
            const sourceValue = getNestedValue(sourceJson, key);
            if (typeof sourceValue !== 'string') continue;

            const miniJson = JSON.stringify({ [key]: sourceValue });
            try {
                const translated = await translateWithOpenAI(miniJson, LANGUAGE_NAMES[targetLocale] || targetLocale);
                const parsed = JSON.parse(translated);
                const translatedValue = parsed[key] ?? sourceValue;
                setNestedValue(targetJson, key, translatedValue);
                console.log(`  ✅ ${key}: "${translatedValue}"`);
            } catch {
                setNestedValue(targetJson, key, sourceValue);
                console.warn(`  ⚠️  ${key}: çeviri başarısız, kaynak değer kullanıldı`);
            }

            await new Promise((r) => setTimeout(r, 300));
        }

        fs.writeFileSync(targetPath, JSON.stringify(targetJson, null, 2), 'utf-8');
        console.log(`\n✅ Sync tamamlandı: messages/${targetLocale}.json\n`);
        return;
    }

    // FULL MODE: Translate entire file from scratch
    console.log(`\n🌍 Generating translation for: ${targetLocale} (${LANGUAGE_NAMES[targetLocale] || targetLocale})\n`);

    const translatedJson: Record<string, any> = {};
    const sections = Object.keys(sourceJson);

    for (const section of sections) {
        console.log(`  📝 Translating section: ${section}...`);

        const sectionContent = JSON.stringify({ [section]: sourceJson[section] }, null, 2);

        try {
            const translated = await translateWithOpenAI(sectionContent, LANGUAGE_NAMES[targetLocale] || targetLocale);
            const parsedTranslation = JSON.parse(translated);
            translatedJson[section] = parsedTranslation[section];
            console.log(`  ✅ Section "${section}" translated successfully`);
        } catch (error) {
            console.error(`  ❌ Error translating section "${section}":`, error);
            translatedJson[section] = sourceJson[section];
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    fs.writeFileSync(targetPath, JSON.stringify(translatedJson, null, 2), 'utf-8');
    console.log(`\n✅ Translation saved to: messages/${targetLocale}.json\n`);
}

// Main execution
const targetLocale = process.argv[2];
const syncMode = process.argv.includes('--sync');
const allMode = targetLocale === 'all';

if (!targetLocale) {
    console.error('Usage: npx tsx scripts/generate-translations.ts <locale|all> [--sync]');
    console.error('  Full:  npx tsx scripts/generate-translations.ts fr');
    console.error('  Sync:  npx tsx scripts/generate-translations.ts fr --sync');
    console.error('  All:   npx tsx scripts/generate-translations.ts all --sync');
    process.exit(1);
}

if (targetLocale === 'tr') {
    console.error('Cannot translate to Turkish - it is the source language');
    process.exit(1);
}

if (allMode) {
    const allLangs = Object.keys(LANGUAGE_NAMES);
    (async () => {
        for (const lang of allLangs) {
            await generateTranslation(lang, syncMode);
        }
    })().catch(console.error);
} else {
    generateTranslation(targetLocale, syncMode).catch(console.error);
}
