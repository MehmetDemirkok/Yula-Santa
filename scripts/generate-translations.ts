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

async function generateTranslation(targetLocale: string) {
    console.log(`\n🌍 Generating translation for: ${targetLocale} (${LANGUAGE_NAMES[targetLocale] || targetLocale})\n`);

    // Read source file (Turkish)
    const sourcePath = path.join(process.cwd(), 'messages', 'tr.json');
    const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
    const sourceJson = JSON.parse(sourceContent);

    // Translate each section separately to avoid token limits
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
            // Use source as fallback
            translatedJson[section] = sourceJson[section];
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Write translated file
    const targetPath = path.join(process.cwd(), 'messages', `${targetLocale}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(translatedJson, null, 2), 'utf-8');

    console.log(`\n✅ Translation saved to: messages/${targetLocale}.json\n`);
}

// Main execution
const targetLocale = process.argv[2];

if (!targetLocale) {
    console.error('Usage: npx tsx scripts/generate-translations.ts <locale>');
    console.error('Example: npx tsx scripts/generate-translations.ts fr');
    process.exit(1);
}

if (targetLocale === 'tr') {
    console.error('Cannot translate to Turkish - it is the source language');
    process.exit(1);
}

generateTranslation(targetLocale).catch(console.error);
