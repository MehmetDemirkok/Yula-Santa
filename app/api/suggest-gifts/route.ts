import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import {
    GEMINI_MODEL,
    GEMINI_TIMEOUT_MS,
    buildGiftPrompt,
    geminiRequestBody,
    parseGeminiResponse,
    parseGiftRequest,
    staticSuggestions,
    type Budget,
} from '@/lib/gifts/suggest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * AI gift ideas from Gemini, with the static list as a fallback.
 *
 * Callers: the gift suggestions tool shows AI results only when `source` is
 * `ai` and otherwise its own fallback view; the /result page shows whatever
 * `suggestions` holds, so every response carries a usable list.
 */
function fallback(budget: Budget, reason: string, status = 200) {
    return NextResponse.json(
        { suggestions: staticSuggestions(budget), source: 'fallback', reason },
        { status, headers: { 'Cache-Control': 'no-store' } }
    );
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const input = parseGiftRequest(body);

    // Each AI call spends the site's Gemini quota, so cap it per visitor.
    if (!rateLimit(request, 'suggest-gifts').allowed) {
        return fallback(input.budget, 'rate_limited', 429);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return fallback(input.budget, 'no_api_key');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                // Header rather than ?key=, so the key never lands in URL logs.
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify(geminiRequestBody(buildGiftPrompt(input))),
                signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
            }
        );

        if (!response.ok) {
            const detail = (await response.text().catch(() => '')).slice(0, 300);
            console.error(`[suggest-gifts] Gemini ${response.status}: ${detail}`);
            return fallback(input.budget, 'ai_error');
        }

        const suggestions = parseGeminiResponse(await response.json());
        if (!suggestions) {
            console.error('[suggest-gifts] Gemini returned no usable suggestions');
            return fallback(input.budget, 'ai_error');
        }

        return NextResponse.json(
            { suggestions, source: 'ai' },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('[suggest-gifts] Gemini request failed:', error);
        return fallback(input.budget, 'ai_error');
    }
}
