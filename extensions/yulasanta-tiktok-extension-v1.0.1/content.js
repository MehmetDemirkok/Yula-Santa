/**
 * Runs only in response to the user pressing "Yorumları Topla" in the popup.
 * Reads comments that are already visible on the page (no hidden endpoints,
 * no auth, no CAPTCHA bypass) and scrolls the comment pane to reveal more.
 */
(function () {
    'use strict';

    const CHUNK_SIZE = 500;
    // TikTok's infinite-scroll fetch has real network latency and can pause for
    // several seconds between pages — a short idle window gives up on comments
    // that would have loaded a few seconds later. Generous by design.
    const MAX_IDLE_SCROLLS = 24;
    const SCROLL_DELAY_MS = 1100;
    // Every few scrolls, jump straight to the bottom of the pane rather than a
    // partial step — some infinite-scroll implementations only fire their
    // "load more" trigger within a small margin of the true bottom.
    const HARD_BOTTOM_EVERY = 4;

    let collecting = false;
    let stopRequested = false;

    function getScrollableAncestor(el) {
        let node = el;
        while (node && node !== document.body) {
            const style = window.getComputedStyle(node);
            if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
                return node;
            }
            node = node.parentElement;
        }
        return document.scrollingElement || document.documentElement;
    }

    function scrollStep(container, hardBottom) {
        const isPage = container === document.scrollingElement || container === document.documentElement;
        if (hardBottom) {
            if (isPage) {
                window.scrollTo(0, document.body.scrollHeight);
            } else {
                container.scrollTop = container.scrollHeight;
            }
            return;
        }
        if (isPage) {
            window.scrollBy(0, Math.round(window.innerHeight * 0.8));
        } else {
            container.scrollTop += Math.round(container.clientHeight * 0.8);
        }
    }

    async function flushChunk(giveawayId, chunk) {
        if (chunk.length === 0) return;
        const { ys_collect_meta: meta } = await chrome.storage.local.get('ys_collect_meta');
        const current = meta && meta.giveawayId === giveawayId ? meta : { giveawayId, chunkKeys: [], totalCollected: 0 };
        const chunkKey = `ys_chunk_${current.chunkKeys.length}`;
        await chrome.storage.local.set({
            [chunkKey]: chunk,
            ys_collect_meta: {
                giveawayId,
                chunkKeys: [...current.chunkKeys, chunkKey],
                totalCollected: current.totalCollected + chunk.length,
            },
        });
    }

    function notifyPopup(payload) {
        chrome.runtime.sendMessage({ type: 'COLLECT_PROGRESS', ...payload }).catch(() => {});
    }

    /**
     * TikTok lazy-mounts the comments panel — it doesn't exist in the DOM until
     * the comment button is clicked. Try opening it ourselves before giving up.
     */
    async function findCommentListWithRetry(selectors) {
        let listInfo = selectors.findCommentList();
        if (listInfo) return listInfo;

        const opened = selectors.openCommentsPanelIfNeeded();
        if (!opened) return null;

        for (let attempt = 0; attempt < 5; attempt++) {
            await new Promise((r) => setTimeout(r, 600));
            listInfo = selectors.findCommentList();
            if (listInfo) return listInfo;
        }
        return null;
    }

    async function collectLoop(giveawayId) {
        const selectors = window.__yulaSantaSelectors;
        const listInfo = selectors ? await findCommentListWithRetry(selectors) : null;

        if (!listInfo) {
            collecting = false;
            console.error('[YulaSanta] Selectors not found or comments panel could not be opened');
            notifyPopup({
                error: 'SELECTOR_NOT_FOUND',
                message: 'TikTok yorum alanı algılanamadı. Sayfanın tamamen yüklenmesini bekleyip tekrar deneyin.',
            });
            return;
        }

        console.log('[YulaSanta] Comment collection started', { giveawayId, strategy: listInfo.strategy?.name });

        // Fresh run — clear any previously staged chunks for this giveaway.
        await chrome.storage.local.set({ ys_collect_meta: { giveawayId, chunkKeys: [], totalCollected: 0 } });

        const seen = new Set();
        let pendingChunk = [];
        let idleScrolls = 0;
        let lastUniqueCount = 0;
        let scrollTicks = 0;
        const scrollTarget = getScrollableAncestor(listInfo.list);

        while (collecting && !stopRequested && idleScrolls < MAX_IDLE_SCROLLS) {
            const found = selectors.extractComments(listInfo);
            let newCount = 0;
            for (const c of found) {
                const key = `${c.username}|${c.commentId || ''}|${c.comment}`;
                if (seen.has(key)) continue;
                seen.add(key);
                pendingChunk.push(c);
                newCount++;
            }

            if (newCount > 0) {
                console.log('[YulaSanta] Found', newCount, 'new comments | Total:', seen.size, '| Idle scrolls:', idleScrolls);
            }

            if (pendingChunk.length >= CHUNK_SIZE) {
                await flushChunk(giveawayId, pendingChunk.splice(0, pendingChunk.length));
                console.log('[YulaSanta] Flushed chunk to storage');
            }

            notifyPopup({ collected: seen.size, unique: new Set([...seen].map((k) => k.split('|')[0])).size });

            if (seen.size === lastUniqueCount) {
                idleScrolls++;
            } else {
                idleScrolls = 0;
            }
            lastUniqueCount = seen.size;

            scrollTicks++;
            scrollStep(scrollTarget, scrollTicks % HARD_BOTTOM_EVERY === 0);
            // Small jitter so requests aren't perfectly periodic (kinder to
            // TikTok's rate limiting than a metronomic fixed interval).
            await new Promise((r) => setTimeout(r, SCROLL_DELAY_MS + Math.random() * 400));
        }

        if (pendingChunk.length > 0) {
            await flushChunk(giveawayId, pendingChunk);
            console.log('[YulaSanta] Flushed final chunk with', pendingChunk.length, 'comments');
        }

        const finished = !stopRequested;
        const hitIdleLimit = finished && idleScrolls >= MAX_IDLE_SCROLLS;
        const uniqueUsers = new Set([...seen].map((k) => k.split('|')[0])).size;
        collecting = false;

        console.log('[YulaSanta] Collection finished', {
            totalCollected: seen.size,
            uniqueUsers,
            reason: stopRequested ? 'stopped' : hitIdleLimit ? 'idle_limit' : 'unknown',
            idleScrolls,
        });

        notifyPopup({
            done: true,
            stopped: stopRequested,
            collected: seen.size,
            unique: uniqueUsers,
            finished,
            possiblyIncomplete: hitIdleLimit,
        });
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === 'START_COLLECT') {
            if (collecting) {
                sendResponse({ ok: false, error: 'ALREADY_RUNNING' });
                return false;
            }
            collecting = true;
            stopRequested = false;
            collectLoop(message.giveawayId);
            sendResponse({ ok: true });
            return false;
        }
        if (message.type === 'STOP_COLLECT') {
            stopRequested = true;
            sendResponse({ ok: true });
            return false;
        }
        if (message.type === 'PING_TIKTOK') {
            sendResponse({ ok: true, host: location.hostname });
            return false;
        }
        return false;
    });
})();
