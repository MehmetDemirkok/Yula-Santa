# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

YulaSanta (yulasanta.com) is a Next.js 16 (App Router) app offering a family of free draw/giveaway tools: Secret Santa, raffle, YouTube giveaway picker, TikTok comment-picker giveaway, and a set of small standalone tools (coin flip, dice, wheel of fortune, team generator, short straw, random number, gift suggestions). The whole UI is localized into 12 languages. The TikTok giveaway tool is a paid product with its own credit ledger, Apify-based scraping, PayTR checkout, and a companion browser extension.

## Commands

```bash
npm run dev              # start dev server (localhost:3000)
npm run build             # production build
npm start                 # run production build
npm run lint               # eslint
npm test                   # run tests/**/*.test.ts via tsx --test (node:test + node:assert)
npm run i18n:check         # verify every messages/*.json has the same keys as tr.json; exits 1 on mismatch (CI-suitable)
npm run i18n:sync          # AI-generate missing translations from tr.json via OpenAI (needs OPENAI_API_KEY)
npm run theme:on           # force seasonal theme on (sets THEME_OVERRIDE = "on" in components/NewYearTheme/config.ts)
npm run theme:off          # force it off (sets THEME_OVERRIDE = "off")
```

Run a single test file directly: `npx tsx --test tests/tiktok/tiktok-module.test.ts`. Tests use Node's built-in `node:test`/`node:assert`, not Jest/Vitest.

There is no test/build step that touches the real Neon DB, Apify, or PayTR — those are exercised only through live API routes.

## Architecture

### Routing and locales

- App Router with a locale segment: almost every user-facing page lives under `app/[locale]/...` and is powered by `next-intl`. `middleware.ts` handles locale detection/routing (URL path → cookie → default; `localePrefix: 'as-needed'`, so Turkish, the default locale, has no `/tr` prefix while others do, e.g. `/en/youtube`).
- `i18n/config.ts` is the source of truth for supported locales (`tr, en, de, fr, es, it, pt, ru, ar, ja, ko, zh`), default locale (`tr`), and RTL locales (`ar`). `i18n/request.ts` / `i18n/navigation.ts` wire this into next-intl.
- Translation strings live in `messages/{locale}.json`, one file per locale, with `tr.json` as the source of truth. Never let locale files drift — run `npm run i18n:check` after editing translations, and add new keys to `tr.json` first.
- `lib/localePath.ts` builds locale-aware links given the `as-needed` prefix strategy — use it instead of hand-rolling `/${locale}/...` paths (it must omit the prefix for `tr`).
- Most route folders follow a `page.tsx` (server, metadata/SEO) + `ClientPage.tsx` or `<Name>Client.tsx` (client component, interactive logic) split — keep that split when adding pages so SEO metadata stays server-rendered.
- `middleware.ts`'s matcher deliberately excludes `api`, `_next`, `_vercel`, and static files from locale rewriting.

### Draw/giveaway tools

- Client-only tools (Secret Santa, raffle, coin flip, dice, wheel, team generator, short straw, random number) keep all participant data in the browser (no server persistence) — see `lib/random.ts`, `lib/celebrate.ts`, `lib/downloadWinnerCard.ts`, `components/RaffleBoard.tsx`, `components/Reveal.tsx`.
- `lib/giveawayProof.ts` encodes a draw result into a URL-safe base64 token (no DB) so results can be shared/verified via `/proof?d=...` and `app/[locale]/verify/[id]/page.tsx`.
- `lib/giveawayFilters.ts` contains shared filter logic (keyword requirement, exclude lists, one-entry-per-user) used across the giveaway pickers.

### TikTok giveaway (paid feature)

This is the most complex subsystem — read `lib/tiktok/` before touching it:

- **Two independent flows share one Neon Postgres instance but different tables** (see the header comment in `lib/tiktok/giveawayStore.ts`): the paid Apify/PayTR flow (ledger-based) and the extension-collected flow (`giveawayStore.ts`). Changes to one must not assume they affect the other.
- `lib/tiktok/index.ts` is the **client-safe** barrel export (types, normalization, URL parsing, pricing, error mapping) — it deliberately excludes anything that imports Node/Apify/Neon so it can be imported from client components. Server-only logic (Apify calls, DB, payment) lives in `lib/tiktok/server.ts`, `apifyProvider.ts`, `giveawayStore.ts`, `paidFetch.ts`, `paytrCheckout.ts`, `ledger.ts`.
- Payment/credit flow: `app/api/tiktok/checkout` (PayTR) → `app/api/tiktok/run` (consumes an `orderId` or a `creditToken`) → `lib/tiktok/paidFetch.ts` orchestrates the Apify fetch and, on failure, issues a refund credit (`lib/tiktok/entitlement.ts` signs/verifies opaque credit tokens with HMAC; `lib/tiktok/failureAnalysis.ts` decides why a fetch failed and whether to credit/email the user).
- `lib/rateLimit.ts` is an in-memory (per-instance) rate limiter keyed by IP + route name; route-specific limits are defined in its `MAX_REQUESTS` map (e.g. `tiktok`, `tiktok-giveaway-create`, `tiktok-giveaway-import`, `youtube`). Apply it in new API routes the same way existing `app/api/tiktok/*` and `app/api/youtube/*` routes do.
- `extensions/yulasanta-tiktok-extension-v1.0.1/` is a separate, non-Next.js browser extension (manifest + vanilla JS) that feeds comments into the extension-collected giveaway flow via `giveawayStore.ts`'s API; it is not built/bundled by the Next.js app.

### Auth

- `auth.ts` configures Auth.js (NextAuth v5) with Google as the only provider and **JWT-only sessions — there is no users table / DB adapter yet**. Don't assume persisted user records exist anywhere in the app.

### Env / secrets

`.env.local` (not committed) holds: Google OAuth (`AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`), Neon/Postgres (`DATABASE_URL*`, `PG*`, `POSTGRES_*`), `APIFY_API_TOKEN`, PayTR (`PAYTR_MERCHANT_ID/KEY/SALT`, `PAYTR_TEST_MODE`), `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, and Instagram credentials. Treat any route touching these as server-only and never expose them to client components.

### Ads / SEO

- AdSense infra lives in `components/ads/` + `lib/ads/config.ts`, gated behind `NEXT_PUBLIC_ADSENSE_CLIENT_ID` / `NEXT_PUBLIC_AD_SLOT_*` env vars (see README for the full list).
- `components/seo/` (JsonLd, per-tool/per-page SEO sections) and `lib/seo.ts` / `lib/pageSeoCopy.ts` centralize structured data and per-page SEO copy; `app/sitemap.ts` / `app/robots.ts` generate the sitemap/robots files.

### Seasonal theme

`components/NewYearTheme/` (snowfall, confetti, fireworks, glitter overlay, countdown banner) is active when `isNewYearThemeActive()` returns true — normally calendar-driven (Nov 30 → Jan 10) in `components/NewYearTheme/config.ts`. `THEME_OVERRIDE` (`"on"` / `"off"` / `"auto"`) manually suspends that automation until `THEME_AUTOMATION_RESUME`; flip it with `npm run theme:on` / `npm run theme:off`, or set it to `"auto"` to hand control back to the calendar. Consumers: `app/[locale]/ClientLayout.tsx`, `HomeClientPage.tsx`, `secret-santa/ClientPage.tsx`.

## Design system

`design.md` defines the brand's design tokens (colors, typography, spacing, elevation, shape) — "Corporate Modern with a festive edge": Navy-Black primary, vibrant Red secondary/CTA, Indigo tertiary accent, Plus Jakarta Sans for headlines, Inter for body/UI text, 8px spacing base, 0.5rem base border radius. Consult it before introducing new colors/type styles/components.
