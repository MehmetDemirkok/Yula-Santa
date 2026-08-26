(function () {
    'use strict';

    const GIVEAWAY_ID_REGEX = /^YS-TT-[A-Z0-9]{8}$/i;
    const DEFAULT_API_BASE = 'https://www.yulasanta.com.tr';

    const el = {
        connectionDot: document.getElementById('ys-connection-dot'),
        connectionText: document.getElementById('ys-connection-text'),
        setup: document.getElementById('ys-setup'),
        detect: document.getElementById('ys-detect'),
        detectLabel: document.getElementById('ys-detect-label'),
        giveawayIdInput: document.getElementById('ys-giveaway-id'),
        ownerTokenInput: document.getElementById('ys-owner-token'),
        apiBaseInput: document.getElementById('ys-api-base'),
        save: document.getElementById('ys-save'),
        setupError: document.getElementById('ys-setup-error'),
        active: document.getElementById('ys-active'),
        activeId: document.getElementById('ys-active-id'),
        activeServer: document.getElementById('ys-active-server'),
        change: document.getElementById('ys-change'),
        collected: document.getElementById('ys-collected'),
        unique: document.getElementById('ys-unique'),
        progressWrap: document.getElementById('ys-progress-wrap'),
        progressLabel: document.getElementById('ys-progress-label'),
        progressBar: document.getElementById('ys-progress-bar'),
        actionError: document.getElementById('ys-action-error'),
        actionSuccess: document.getElementById('ys-action-success'),
        collect: document.getElementById('ys-collect'),
        stop: document.getElementById('ys-stop'),
        send: document.getElementById('ys-send'),
        reset: document.getElementById('ys-reset'),
    };

    let activeTabId = null;
    let giveawayId = '';
    let ownerToken = '';
    let collecting = false;

    function showError(target, message) {
        target.textContent = message;
        target.hidden = !message;
    }

    function fmt(n) {
        return Number(n || 0).toLocaleString('tr-TR');
    }

    async function detectTikTokTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) {
            el.connectionDot.className = 'ys-dot bad';
            el.connectionText.textContent = 'TikTok sekmesi bulunamadı';
            return;
        }
        activeTabId = tab.id;
        const isTikTok = /^https:\/\/www\.tiktok\.com\//.test(tab.url);
        el.connectionDot.className = `ys-dot ${isTikTok ? 'ok' : 'bad'}`;
        el.connectionText.textContent = isTikTok ? 'TikTok algılandı' : 'TikTok sayfası açık değil';
        el.collect.disabled = !isTikTok;
    }

    async function loadStoredSettings() {
        const data = await chrome.storage.local.get([
            'ys_giveaway_id',
            'ys_owner_token',
            'ys_api_base',
            'ys_collect_meta',
        ]);
        giveawayId = data.ys_giveaway_id || '';
        ownerToken = data.ys_owner_token || '';
        const apiBase = data.ys_api_base || DEFAULT_API_BASE;

        if (giveawayId && ownerToken) {
            el.setup.hidden = true;
            el.active.hidden = false;
            el.activeId.textContent = giveawayId;
            el.activeServer.textContent = `Sunucu: ${apiBase}`;
        } else {
            el.setup.hidden = false;
            el.active.hidden = true;
            el.apiBaseInput.value = data.ys_api_base || '';
        }

        const meta = data.ys_collect_meta;
        if (meta && meta.giveawayId === giveawayId) {
            el.collected.textContent = fmt(meta.totalCollected);
            // Unique-user count isn't tracked in storage meta (only content.js's live Set knows it);
            // show the same number until a fresh collection run reports a precise figure.
            el.unique.textContent = fmt(meta.totalCollected);
        }
    }

    /**
     * Instead of asking the user to copy/paste the ID + owner token (which is
     * awkward — clicking the other tab closes this popup before you can type),
     * pull them straight out of an already-open YulaSanta giveaway tab.
     * Requires no focus change, so the popup never closes mid-detection.
     */
    async function findYulaSantaGiveawayTab() {
        const patterns = ['https://www.yulasanta.com.tr/*', 'http://localhost/*', 'http://127.0.0.1/*'];
        let tabs = [];
        try {
            tabs = await chrome.tabs.query({ url: patterns });
        } catch {
            return null;
        }
        for (const tab of tabs) {
            if (!tab.url) continue;
            try {
                const u = new URL(tab.url);
                const id = u.searchParams.get('g');
                if (u.pathname.includes('/tiktok/extension') && id) {
                    return { tabId: tab.id, giveawayId: id.trim().toUpperCase(), origin: u.origin };
                }
            } catch {
                // ignore malformed URLs
            }
        }
        return null;
    }

    async function readOwnerTokenFromTab(tabId, id) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: (storageKey) => {
                    try {
                        return window.localStorage.getItem(storageKey);
                    } catch {
                        return null;
                    }
                },
                args: [`ys_tt_ext_owner:${id}`],
            });
            return results && results[0] ? results[0].result : null;
        } catch {
            return null;
        }
    }

    async function runAutoDetect(isManualClick) {
        if (isManualClick) {
            el.detectLabel.textContent = 'Algılanıyor…';
            el.detect.disabled = true;
            showError(el.setupError, '');
        }

        const found = await findYulaSantaGiveawayTab();
        const token = found ? await readOwnerTokenFromTab(found.tabId, found.giveawayId) : null;

        if (found && token) {
            // The tab we detected from is also the source of truth for which
            // YulaSanta instance to upload to (production vs. a local dev server) —
            // no manual "server address" step needed for the common case.
            await chrome.storage.local.set({
                ys_giveaway_id: found.giveawayId,
                ys_owner_token: token,
                ys_api_base: found.origin,
            });
            await loadStoredSettings();
            showError(el.actionSuccess, 'Çekiliş YulaSanta sekmesinden algılandı.');
        } else if (isManualClick) {
            showError(
                el.setupError,
                'Açık bir YulaSanta çekiliş sekmesi bulunamadı. Sayfayı açık bırakıp tekrar deneyin veya aşağıya elle girin.'
            );
        }

        if (isManualClick) {
            el.detectLabel.textContent = 'YulaSanta sekmesinden algıla';
            el.detect.disabled = false;
        }
        return Boolean(found && token);
    }

    el.detect.addEventListener('click', () => runAutoDetect(true));

    el.save.addEventListener('click', async () => {
        const idValue = el.giveawayIdInput.value.trim().toUpperCase();
        const tokenValue = el.ownerTokenInput.value.trim();
        const apiBaseValue = el.apiBaseInput.value.trim().replace(/\/+$/, '');

        if (!GIVEAWAY_ID_REGEX.test(idValue)) {
            showError(el.setupError, 'Geçersiz Çekiliş ID. Örnek: YS-TT-XXXXXXXX');
            return;
        }
        if (!tokenValue) {
            showError(el.setupError, 'İçe Aktarma Kodu boş olamaz.');
            return;
        }
        if (apiBaseValue && !/^https?:\/\//i.test(apiBaseValue)) {
            showError(el.setupError, 'Sunucu adresi http:// veya https:// ile başlamalı.');
            return;
        }

        showError(el.setupError, '');
        const toSave = { ys_giveaway_id: idValue, ys_owner_token: tokenValue };
        // Blank field = keep whatever server was previously set (or the production default).
        if (apiBaseValue) toSave.ys_api_base = apiBaseValue;
        await chrome.storage.local.set(toSave);
        await loadStoredSettings();
    });

    el.change.addEventListener('click', async () => {
        const data = await chrome.storage.local.get('ys_api_base');
        el.giveawayIdInput.value = giveawayId;
        el.ownerTokenInput.value = ownerToken;
        el.apiBaseInput.value = data.ys_api_base || '';
        el.setup.hidden = false;
        el.active.hidden = true;
    });

    el.reset.addEventListener('click', async () => {
        if (confirm('Toplanan tüm yorumlar silinecek. Emin misiniz?')) {
            await chrome.storage.local.remove('ys_collect_meta');
            el.collected.textContent = '0';
            el.unique.textContent = '0';
            showError(el.actionSuccess, 'Veriler sıfırlandı.');
            showError(el.actionError, '');
        }
    });

    function setCollectingUI(isCollecting) {
        collecting = isCollecting;
        el.collect.hidden = isCollecting;
        el.stop.hidden = !isCollecting;
        el.send.disabled = isCollecting;
    }

    el.collect.addEventListener('click', async () => {
        if (!activeTabId) return;
        showError(el.actionError, '');
        showError(el.actionSuccess, '');
        el.progressWrap.hidden = false;
        el.progressLabel.textContent = 'Yorumlar toplanıyor…';
        el.progressBar.style.width = '5%';
        setCollectingUI(true);

        chrome.tabs.sendMessage(activeTabId, { type: 'START_COLLECT', giveawayId }, (response) => {
            if (chrome.runtime.lastError || !response || !response.ok) {
                showError(
                    el.actionError,
                    'TikTok sayfasıyla bağlantı kurulamadı. Sayfayı yenileyip tekrar deneyin.'
                );
                setCollectingUI(false);
                el.progressWrap.hidden = true;
            }
        });
    });

    el.stop.addEventListener('click', async () => {
        if (!activeTabId) return;
        chrome.tabs.sendMessage(activeTabId, { type: 'STOP_COLLECT' }, () => {
            void chrome.runtime.lastError;
        });
    });

    el.send.addEventListener('click', async () => {
        showError(el.actionError, '');
        showError(el.actionSuccess, '');
        el.send.disabled = true;
        el.progressWrap.hidden = false;
        el.progressLabel.textContent = 'YulaSanta’ya gönderiliyor…';
        el.progressBar.style.width = '0%';

        chrome.runtime.sendMessage({ type: 'SEND_TO_YULASANTA' }, (result) => {
            el.send.disabled = false;
            if (chrome.runtime.lastError) {
                showError(el.actionError, 'Gönderim başlatılamadı. Popup’ı yeniden açıp deneyin.');
                return;
            }
            if (!result || !result.ok) {
                showError(el.actionError, (result && result.error) || 'Gönderim başarısız oldu.');
                return;
            }
            el.progressBar.style.width = '100%';

            const skipped = result.sent - result.totalInserted;
            let msg = `${fmt(result.sent)} yorum gönderildi → ${fmt(result.totalInserted)} yeni katılımcı eklendi.`;
            if (skipped > 0) {
                const reasons = [];
                if (result.totalDuplicates) reasons.push(`${fmt(result.totalDuplicates)} zaten vardı (aynı kullanıcı + aynı yorum metni)`);
                if (result.totalInvalidUsername) reasons.push(`${fmt(result.totalInvalidUsername)} geçersiz kullanıcı adı`);
                if (result.totalEmptyComment) reasons.push(`${fmt(result.totalEmptyComment)} boş yorum`);
                msg += ` ${fmt(skipped)} eklenmedi — sebep: ${reasons.join(', ') || 'bilinmiyor'}.`;
            }
            showError(el.actionSuccess, msg);
        });
    });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'COLLECT_PROGRESS') {
            if (message.error === 'SELECTOR_NOT_FOUND') {
                showError(
                    el.actionError,
                    message.message || 'TikTok yorum alanı algılanamadı. Sayfanın tamamen yüklenmesini bekleyip tekrar deneyin.'
                );
                setCollectingUI(false);
                el.progressWrap.hidden = true;
                return;
            }

            el.collected.textContent = fmt(message.collected);
            el.unique.textContent = fmt(message.unique);
            el.progressLabel.textContent = `Yorumlar toplanıyor… ${fmt(message.collected)} yorum`;
            el.progressBar.style.width = message.done ? '100%' : '60%';

            if (message.done) {
                setCollectingUI(false);
                if (message.possiblyIncomplete) {
                    showError(
                        el.actionSuccess,
                        `Toplama durdu: ${fmt(message.collected)} yorum. TikTok'ta yazan toplam sayıyla ` +
                            'karşılaştırın — düşükse "Yorumları Topla"yı tekrar deneyin (TikTok yüklemeyi ' +
                            'yavaşlatmış olabilir), ya da fark yanıt (reply) yorumlarından kaynaklanıyor olabilir.'
                    );
                } else {
                    setTimeout(() => {
                        el.progressWrap.hidden = true;
                    }, 1200);
                }
            }
        } else if (message.type === 'UPLOAD_PROGRESS') {
            const pct = message.total ? Math.round((message.sent / message.total) * 100) : 0;
            el.progressBar.style.width = `${pct}%`;
            el.progressLabel.textContent = `${fmt(message.sent)} / ${fmt(message.total)}`;
        }
    });

    (async () => {
        detectTikTokTab();
        await loadStoredSettings();
        if (!giveawayId || !ownerToken) {
            await runAutoDetect(false);
        }
    })();
})();
