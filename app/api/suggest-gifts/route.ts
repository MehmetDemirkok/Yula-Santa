import { NextResponse } from 'next/server';

interface GiftSuggestion {
    title: string;
    description: string;
}

interface SuggestRequestBody {
    occasion?: string;
    relationship?: string;
    budget?: 'low' | 'medium' | 'high';
    notes?: string;
    locale?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
    tr: 'Turkish',
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
    zh: 'Simplified Chinese',
};

const BUDGET_PHRASES: Record<string, string> = {
    low: 'a low, budget-friendly',
    medium: 'a medium, reasonable',
    high: 'a generous, high-end',
};

// Google AI Studio issues free Gemini API keys with a generous free tier
// (no credit card required): https://aistudio.google.com/apikey
// "gemini-flash-latest" auto-points to the current flash model and is
// consistently covered by the free tier, unlike pinned model names which
// sometimes report a zero free-tier quota depending on the project.
const GEMINI_MODEL = 'gemini-flash-latest';

export async function POST(request: Request) {
    let body: SuggestRequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { occasion, relationship, budget, notes, locale } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ suggestions: null, source: 'fallback', reason: 'no_api_key' });
    }

    const languageName = LANGUAGE_NAMES[locale || 'tr'] || 'Turkish';
    const budgetPhrase = BUDGET_PHRASES[budget || 'medium'] || BUDGET_PHRASES.medium;

    const prompt = `You are a thoughtful, creative gift consultant.
Suggest exactly 5 specific, non-generic gift ideas for the occasion "${occasion || 'a special day'}",
intended for "${relationship || 'a loved one'}", with ${budgetPhrase} budget.
${notes ? `Extra context about the recipient's interests: ${notes}.` : ''}
Avoid vague suggestions like "a nice gift" — name real products, brands, or experiences.
Write the "title" and "description" fields in ${languageName}.
The description should be one warm, concise sentence explaining why it fits.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.9,
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: 'OBJECT',
                            properties: {
                                suggestions: {
                                    type: 'ARRAY',
                                    items: {
                                        type: 'OBJECT',
                                        properties: {
                                            title: { type: 'STRING' },
                                            description: { type: 'STRING' },
                                        },
                                        required: ['title', 'description'],
                                    },
                                },
                            },
                            required: ['suggestions'],
                        },
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('Empty Gemini response');
        }

        const parsed = JSON.parse(text) as { suggestions?: GiftSuggestion[] };
        if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
            throw new Error('Malformed suggestions payload');
        }

        return NextResponse.json({ suggestions: parsed.suggestions, source: 'ai' });
    } catch (error) {
        console.error('Gemini gift suggestion request failed:', error);
        return NextResponse.json({ suggestions: null, source: 'fallback', reason: 'ai_error' });
    }
}
