/**
 * Service worker. The only piece of the extension that talks to the network —
 * content scripts run inside TikTok's page (subject to TikTok's CSP), while
 * this background context, with host_permissions granted, can call the
 * YulaSanta API directly without a CORS preflight.
 */
const DEFAULT_API_BASE = 'https://www.yulasanta.com.tr';
const UPLOAD_BATCH_SIZE = 500;
const MAX_ATTEMPTS = 3;

async function getSettings() {
    const data = await chrome.storage.local.get(['ys_giveaway_id', 'ys_owner_token', 'ys_api_base']);
    return {
        giveawayId: data.ys_giveaway_id || '',
        ownerToken: data.ys_owner_token || '',
        apiBase: (data.ys_api_base || DEFAULT_API_BASE).replace(/\/+$/, ''),
    };
}

async function readAllCollectedComments() {
    const { ys_collect_meta: meta } = await chrome.storage.local.get('ys_collect_meta');
    if (!meta || !Array.isArray(meta.chunkKeys) || meta.chunkKeys.length === 0) return [];
    const stored = await chrome.storage.local.get(meta.chunkKeys);
    const all = [];
    for (const key of meta.chunkKeys) {
        if (Array.isArray(stored[key])) all.push(...stored[key]);
    }
    return all;
}

async function postBatch(apiBase, giveawayId, ownerToken, batch) {
    let lastError = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
            const res = await fetch(`${apiBase}/api/tiktok/giveaway/${giveawayId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-owner-token': ownerToken },
                body: JSON.stringify({ comments: batch }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status} (${apiBase})`);
            return data;
        } catch (err) {
            lastError = err;
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
    }
    if (lastError instanceof TypeError) {
        // fetch() throws a bare TypeError for network/CORS/DNS failures — no HTTP
        // response was ever received, so surface the URL to make it diagnosable.
        throw new Error(`Sunucuya ulaşılamadı: ${apiBase}. Sunucu adresini kontrol edin (popup'ta "değiştir").`);
    }
    throw lastError instanceof Error ? lastError : new Error('Bilinmeyen ağ hatası');
}

async function uploadComments(onProgress) {
    const { giveawayId, ownerToken, apiBase } = await getSettings();
    if (!giveawayId || !ownerToken) {
        return { ok: false, error: 'Çekiliş ID veya İçe Aktarma Kodu girilmemiş.' };
    }

    const comments = await readAllCollectedComments();
    if (comments.length === 0) {
        return { ok: false, error: 'Önce "Yorumları Topla" ile yorum toplayın.' };
    }

    let sent = 0;
    let totalInserted = 0;
    let totalDuplicates = 0;
    let totalInvalidUsername = 0;
    let totalEmptyComment = 0;
    for (let i = 0; i < comments.length; i += UPLOAD_BATCH_SIZE) {
        const batch = comments.slice(i, i + UPLOAD_BATCH_SIZE);
        try {
            const data = await postBatch(apiBase, giveawayId, ownerToken, batch);
            totalInserted += data.inserted || 0;
            totalDuplicates += data.duplicates || 0;
            totalInvalidUsername += data.invalidUsername || 0;
            totalEmptyComment += data.emptyComment || 0;
        } catch (err) {
            return {
                ok: false,
                error: err instanceof Error ? err.message : 'Gönderim başarısız oldu.',
                sent,
                total: comments.length,
            };
        }
        sent += batch.length;
        onProgress({ sent, total: comments.length });
    }

    return {
        ok: true,
        sent,
        total: comments.length,
        totalInserted,
        totalDuplicates,
        totalInvalidUsername,
        totalEmptyComment,
    };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SEND_TO_YULASANTA') {
        uploadComments((progress) => {
            chrome.runtime.sendMessage({ type: 'UPLOAD_PROGRESS', ...progress }).catch(() => {});
        }).then(sendResponse);
        return true; // keep the message channel open for the async response
    }
    return false;
});
