import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import {
    GEMINI_MODELS,
    GEMINI_PER_MODEL_TIMEOUT_MS,
    GEMINI_TIMEOUT_MS,
    buildGiftPrompt,
    geminiRequestBody,
    parseGeminiResponse,
    parseGiftRequest,
    shouldTryNextModel,
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

    const prompt = buildGiftPrompt(input);
    const deadline = AbortSignal.timeout(GEMINI_TIMEOUT_MS);
    const callGemini = (model: string, fast: boolean) =>
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            // Header rather than ?key=, so the key never lands in URL logs.
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify(geminiRequestBody(prompt, fast)),
            signal: AbortSignal.any([deadline, AbortSignal.timeout(GEMINI_PER_MODEL_TIMEOUT_MS)]),
        });

    /** One model, retried without the thinking setting if it rejects that with a 400. */
    const askModel = async (model: string) => {
        const response = await callGemini(model, true);
        if (response.status !== 400) return response;
        console.error(`[suggest-gifts] ${model} 400 with thinking off: ${(await response.text().catch(() => '')).slice(0, 300)}`);
        return callGemini(model, false);
    };

    try {
        const startedAt = Date.now();
        let response: Response | null = null;
        let usedModel: string = GEMINI_MODELS[0];
        for (const model of GEMINI_MODELS) {
            if (deadline.aborted) break;
            usedModel = model;
            try {
                response = await askModel(model);
            } catch (error) {
                // This model timed out or the network failed; the next one may still answer.
                console.error(`[suggest-gifts] ${model} failed:`, error instanceof Error ? error.name : error);
                response = null;
                continue;
            }
            if (response.ok || !shouldTryNextModel(response.status)) break;
            console.error(`[suggest-gifts] ${model} ${response.status}: ${(await response.text().catch(() => '')).slice(0, 200)}`);
            response = null;
        }

        if (!response) return fallback(input.budget, 'ai_error');

        if (!response.ok) {
            const detail = (await response.text().catch(() => '')).slice(0, 300);
            console.error(`[suggest-gifts] ${usedModel} ${response.status}: ${detail}`);
            return fallback(input.budget, 'ai_error');
        }

        const suggestions = parseGeminiResponse(await response.json());
        if (!suggestions) {
            console.error('[suggest-gifts] Gemini returned no usable suggestions');
            return fallback(input.budget, 'ai_error');
        }

        console.info(`[suggest-gifts] ${usedModel} answered in ${Date.now() - startedAt} ms`);
        return NextResponse.json(
            { suggestions, source: 'ai' },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('[suggest-gifts] Gemini request failed:', error);
        return fallback(input.budget, 'ai_error');
    }
}
