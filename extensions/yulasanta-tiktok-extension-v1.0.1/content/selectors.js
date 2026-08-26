/**
 * Centralized TikTok DOM selectors.
 *
 * Verified against TikTok's live desktop DOM (web app build hash 7937d88b):
 * comment rows are NOT rendered until the user (or `content.js`) opens the
 * comments panel via the comment-icon button — the panel is lazy-mounted.
 *
 * TikTok changes its markup often. If comment collection stops working,
 * this is the ONLY file that needs updating — everything else in content.js
 * is selector-agnostic. Strategies are tried in order; the first one that
 * finds a comment list on the page wins.
 *
 * We never fabricate data: if a field can't be read from the DOM, it comes
 * back empty/null rather than guessed.
 */
(function () {
    'use strict';

    const STRATEGIES = [
        {
            // Verified live structure (see comment above). TikTok's build hash
            // changes, but the "Div<Role>Wrapper/Container" naming survives it —
            // matched here via substring since the full class also carries a
            // per-build hash prefix (e.g. "tiktok-1i2ou4d-7937d88b--Div...").
            name: 'verified-2026',
            commentList: 'div[class*="DivCommentListContainer"]',
            commentItem: 'div[class*="DivCommentItemWrapper"]',
            username: 'a[href^="/@"]',
            // The nickname is the first <p> inside the username block (a second,
            // empty <p> sibling also exists — querySelector's first-match wins).
            displayName: '[data-e2e="comment-username-1"] p',
            // data-e2e="comment-level-1" is the comment TEXT node itself, not a
            // container — the element's own textContent is the comment.
            text: '[data-e2e="comment-level-1"]',
        },
        {
            // Loose fallback if TikTok renames the Div* classes but keeps a
            // recognizable substring somewhere in the generated name.
            name: 'generic-heuristic',
            commentList: 'div[class*="CommentList"]',
            commentItem: 'div[class*="CommentItem"]',
            username: 'a[href^="/@"]',
            displayName: null,
            text: '[data-e2e="comment-level-1"], span[class*="TUXText"]',
        },
    ];

    /** The comments panel is lazy-mounted — this opens it if it isn't already. */
    function openCommentsPanelIfNeeded() {
        if (document.querySelector('div[class*="DivCommentListContainer"]')) return false;
        const icon = document.querySelector('[data-e2e="comment-icon"]');
        const clickable = icon && (icon.closest('button') || icon.closest('[role="button"]') || icon);
        if (clickable) {
            clickable.click();
            return true;
        }
        return false;
    }

    function findCommentList() {
        for (const strategy of STRATEGIES) {
            const list = document.querySelector(strategy.commentList);
            if (list) return { strategy, list };
        }
        return null;
    }

    function extractUsername(node, strategy) {
        const el = strategy.username ? node.querySelector(strategy.username) : null;
        if (!el) return '';
        const href = el.getAttribute && el.getAttribute('href');
        if (href) {
            const match = href.match(/\/@([^/?#]+)/);
            if (match) return decodeURIComponent(match[1]);
        }
        return (el.textContent || '').trim().replace(/^@/, '');
    }

    function extractDisplayName(node, strategy) {
        if (!strategy.displayName) return '';
        const el = node.querySelector(strategy.displayName);
        return el ? (el.textContent || '').trim() : '';
    }

    function extractText(node, strategy) {
        const el = strategy.text ? node.querySelector(strategy.text) : null;
        return el ? (el.textContent || '').trim() : '';
    }

    /**
     * Best-effort id. TikTok's public DOM does not expose its internal comment id;
     * when it isn't available the server falls back to username+comment for dedupe.
     */
    function extractCommentId(node) {
        const raw = (node.getAttribute && (node.getAttribute('data-comment-id') || node.id)) || '';
        return /\d{5,}/.test(raw) ? raw : null;
    }

    function extractComments(listInfo) {
        const { strategy, list } = listInfo;
        const items = list.querySelectorAll(strategy.commentItem);
        const out = [];
        let skipped = 0;

        items.forEach((node) => {
            const username = extractUsername(node, strategy);
            if (!username) {
                skipped++;
                return;
            }
            const comment = extractText(node, strategy);
            // Skip empty comments (they might be placeholders or loading states)
            if (!comment || comment.length === 0) {
                skipped++;
                return;
            }
            out.push({
                username,
                displayName: extractDisplayName(node, strategy) || username,
                comment: comment,
                commentId: extractCommentId(node),
                timestamp: null,
            });
        });

        if (skipped > 0) {
            console.log('[YulaSanta] Skipped', skipped, 'invalid comment items (no username or empty text)');
        }
        return out;
    }

    window.__yulaSantaSelectors = { findCommentList, extractComments, openCommentsPanelIfNeeded };
})();
