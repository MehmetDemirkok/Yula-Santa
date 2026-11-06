# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

YulaSanta is a Next.js 16 (App Router) app offering a family of free draw/giveaway tools: Secret Santa, raffle, YouTube giveaway picker, TikTok comment-picker giveaway, a set of small standalone tools (coin flip, dice, wheel of fortune, team generator, short straw, random number, gift suggestions), and the Plaka Avcısı quiz game. The UI is localized into 12 languages. Every tool is free. The TikTok giveaway takes pasted comments or comments from a companion browser extension. The canonical site URL is `SITE_URL` in `lib/constants.ts` (`https://www.yulasanta.com.tr`).

`README.md` is the short public overview: features, commands, env variables, and AdSense setup. `AGENTS.md` is a condensed version of this file for other agents, so keep the two consistent.

## Commands

```bash
npm run dev              # start dev server (localhost:3000)
npm run build             # production build
npm start                 # run production build
npm run lint               # eslint
npm test                   # run tests/**/*.test.ts via tsx --test (node:test + node:assert)
npm run i18n:check         # verify every messages/*.json has the same keys as tr.json; exits 1 on mismatch (CI-suitable)
npx tsx scripts/generate-translations.ts <locale|all> --sync  # AI-generate missing translations from tr.json via OpenAI (needs OPENAI_API_KEY)
npm run indexnow           # submit sitemap URLs to IndexNow; run after deploy. Scope with `-- --url /raffle` or `-- --secret-santa`; preview with `-- --dry-run`
npm run theme:on           # force seasonal theme on (sets THEME_OVERRIDE = "on" in components/NewYearTheme/config.ts)
npm run theme:off          # force it off (sets THEME_OVERRIDE = "off")
```

`npm run i18n:sync` on its own exits with an error because it passes no locale argument; use the `npx` form above. `i18n:check --fix` only reports and never exits 1.

Run a single test file directly: `npx tsx --test tests/tiktok/tiktok-module.test.ts`. Tests use Node's built-in `node:test`/`node:assert`, not Jest/Vitest.

There is no standalone typecheck script; `npm run build` type-checks.

There is no test/build step that touches the real Neon DB or Apify; those are exercised only through live API routes.

## Architecture

### Routing and locales

- App Router with a locale segment: almost every user-facing page lives under `app/[locale]/...` and is powered by `next-intl`. `middleware.ts` handles locale detection/routing (URL path → cookie → default; `localePrefix: 'as-needed'`, so Turkish, the default locale, has no `/tr` prefix while others do, e.g. `/en/youtube`). Accept-Language detection is deliberately off (`localeDetection: false`) so crawlers are never redirected; the middleware's header comment still lists it, but that is out of date.
- Two i18n APIs coexist: newer code calls next-intl's `useTranslations()` directly, while `useLanguage()` from `lib/i18n/LanguageContext.tsx` is a legacy wrapper still used by `LanguageSelector`, `CookieConsent`, `RaffleBoard`, and the `raffle`/`result`/`youtube`/`tiktok` client pages. `lib/i18n/translations.ts` holds locale constants and types, not strings.
- Turkish-slug SEO redirects (e.g. `/isim-cekilisi` → `/raffle`) are hardcoded in `next.config.ts`.
- `i18n/config.ts` is the source of truth for supported locales (`tr, en, de, fr, es, it, pt, ru, ar, ja, ko, zh`), default locale (`tr`), and RTL locales (`ar`). `i18n/request.ts` / `i18n/navigation.ts` wire this into next-intl.
- Translation strings live in `messages/{locale}.json`, one file per locale, with `tr.json` as the source of truth. Never let locale files drift — run `npm run i18n:check` after editing translations, and add new keys to `tr.json` first.
- `lib/localePath.ts` builds locale-aware links given the `as-needed` prefix strategy — use it instead of hand-rolling `/${locale}/...` paths (it must omit the prefix for `tr`).
- Most route folders follow a `page.tsx` (server, metadata/SEO) + `ClientPage.tsx` or `<Name>Client.tsx` (client component, interactive logic) split — keep that split when adding pages so SEO metadata stays server-rendered.
- `middleware.ts`'s matcher deliberately excludes `api`, `_next`, `_vercel`, and static files from locale rewriting.

### Draw/giveaway tools

- Client-only tools (Secret Santa, raffle, coin flip, dice, wheel, team generator, short straw, random number) keep all participant data in the browser (no server persistence) — see `lib/random.ts`, `lib/celebrate.ts`, `lib/downloadWinnerCard.ts`, `components/RaffleBoard.tsx`, `components/Reveal.tsx`.
- `lib/giveawayProof.ts` encodes a draw result into a URL-safe base64 token (no DB) so results can be shared/verified via `/proof?d=...` and `app/[locale]/verify/[id]/page.tsx`.
- `lib/giveawayFilters.ts` contains shared filter logic (keyword requirement, exclude lists, one-entry-per-user) used across the giveaway pickers.

### TikTok giveaway (free)

Read `lib/tiktok/` before touching it. The earlier paid flow (PayTR checkout, credit ledger, Apify comment fetch) has been removed, so don't reintroduce pricing copy or payment assumptions:

- Comments arrive in two ways: pasted into `app/[locale]/tiktok/ClientPage.tsx` (browser only, no server), or collected by the extension through `app/api/tiktok/giveaway/*` and `lib/tiktok/giveawayStore.ts` (Neon).
- `lib/tiktok/index.ts` is the **client-safe** barrel export (types, normalization, URL parsing, manual import). It deliberately excludes anything that imports Node or Neon so it can be imported from client components; `giveawayStore.ts` is server-only.
- `app/api/tiktok/followers` is the only remaining Apify use: an optional follower check on winners, which needs `APIFY_API_TOKEN`.
- `lib/rateLimit.ts` is an in-memory (per-instance) rate limiter keyed by IP + route name; route-specific limits are defined in its `MAX_REQUESTS` map (e.g. `tiktok`, `tiktok-giveaway-create`, `tiktok-giveaway-import`, `youtube`). Apply it in new API routes the same way existing `app/api/tiktok/*` and `app/api/youtube/*` routes do.
- `extensions/yulasanta-tiktok-extension-v1.0.1/` is a separate, non-Next.js browser extension (manifest + vanilla JS) that feeds comments into the extension-collected giveaway flow via `giveawayStore.ts`'s API; it is not built/bundled by the Next.js app.

### Wheel of fortune

- `app/[locale]/tools/wheel-of-fortune/WheelClient.tsx` owns list, history and result state (saved to `localStorage` under `yulasanta_wheel_v1`). `components/wheel/WheelStage.tsx` is a 2D canvas engine with no WebGL, and `lib/wheel/wheelMath.ts` holds the pure, tested logic.
- The winner comes only from `secureRandomInt` in `WheelClient`. Flick strength and landing jitter change how the spin looks, never who wins.

### Mobile CSS gotchas

`app/globals.css` sets `html { font-size: 14px }` at 640px and below, so rem-based Tailwind sizes shrink 12.5% on phones (`h-11` renders at 38.5px). It also applies an unlayered `min-height: 44px` to buttons, which beats every `min-h-*` utility. Use pixel sizes such as `h-[56px]` for touch targets. The fixed navbar is 72px tall on phones, but `main` only reserves `pt-14` (49px), so a page must add its own top padding.

### Plaka Avcısı (Turkey plate quiz game)

- Pages: `app/[locale]/oyun/plaka-avcisi/` (server `page.tsx` for SEO/JSON-LD + `PlakaAvcisiClient.tsx`) and `/oyun/plaka-avcisi/liderlik` (noindex live rankings). UI copy is Turkish by design (`lang="tr"` on the game shell); translated strings in `messages/*.json` are limited to the tools card + page metadata (`tools.plakaAvcisi`, `plakaAvcisiShort`, `plakaAvcisiMeta`).
- Static data: `lib/plaka/cities.ts` holds all 81 provinces (code, region, difficulty, two hints). `lib/plaka/questions.ts` builds question sets server-side; the daily challenge is deterministic from the UTC date seed.
- Client-safe modules: `cities.ts`, `game.ts` (modes/scoring/combo), `achievements.ts`, `contracts.ts` (API types). **Never** import `store.ts`, `player.ts` or `questions.ts` from a client component — they use Neon/Node and are imported by API routes only.
- Server: `lib/plaka/store.ts` owns the Neon schema (`plaka_cities`, `plaka_game_modes`, `plaka_sessions`, `plaka_questions`, `plaka_answers`, `plaka_player_stats`, `plaka_achievements`, `plaka_player_achievements`, plus the `plaka_leaderboard` view), scoring and achievement evaluation. Correct answers never leave the server; the client submits `position` + `optionIndex` and receives only the verdict.
- `lib/plaka/player.ts` resolves identity: Google sessions are hashed to `user_<sha256>`, guests get an HMAC-signed httpOnly `plaka_player` cookie. Guest scores/leaderboard entries are anonymous but persistent.
- API: `app/api/plaka/{session,answer,finish,leaderboard,stats}`; rate limits live in `lib/rateLimit.ts` (`plaka-session`, `plaka-answer`, `plaka-finish`, `plaka-leaderboard`, `plaka-stats`). Answering is guarded by `answered = false` in SQL, position must match `current_index`, and sessions expire after 45 minutes.
- Tests: `tests/plaka/plaka-game.test.ts` covers dataset integrity (81 unique codes), scoring/combo math, question generation and daily determinism. It does not touch the DB.

### Auth

- `auth.ts` configures Auth.js (NextAuth v5) with Google as the only provider and **JWT-only sessions — there is no users table / DB adapter yet**. Don't assume persisted user records exist anywhere in the app.

### Env / secrets

`.env.local` (not committed) holds: Google OAuth (`AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`), Neon/Postgres (`DATABASE_URL*`, `PG*`, `POSTGRES_*`), `APIFY_API_TOKEN`, and `YOUTUBE_API_KEY`. Treat any route touching these as server-only and never expose them to client components. Any `PAYTR_*` values still in the file are no longer read.

The code also reads these optional variables, which are not currently in `.env.local`:

- `PLAKA_SECRET`: guest cookie signing (`lib/plaka/player.ts`), with fallbacks
- `OPENAI_API_KEY`: translation script only

`/api/suggest-gifts` serves a static list and makes no AI call.

### Ads / SEO

- AdSense infra lives in `components/ads/` + `lib/ads/config.ts`, gated behind `NEXT_PUBLIC_ADSENSE_CLIENT_ID` / `NEXT_PUBLIC_AD_SLOT_*` env vars (see README for the full list).
- `components/seo/` (JsonLd, per-tool/per-page SEO sections) and `lib/seo.ts` / `lib/pageSeoCopy.ts` centralize structured data and per-page SEO copy (`lib/secretSantaSeoCopy.ts` holds the long `/secret-santa` copy per locale; its claims must match how the tool works); `app/sitemap.ts` / `app/robots.ts` generate the sitemap/robots files.

### Themes

Two independent systems share the word "theme":

- **Light/dark:** `lib/theme.ts` and `lib/ThemeContext.tsx`. The stored preference is `light`, `dark`, or `auto`; `auto` is time-based (light from 07:00 to 19:00 local time), not OS-based, and re-evaluates while the page is open.
- **Seasonal:** `components/NewYearTheme/` (snowfall, confetti, fireworks, glitter overlay, countdown banner) is active when `isNewYearThemeActive()` returns true — normally calendar-driven (Nov 30 → Jan 10) in `components/NewYearTheme/config.ts`. `THEME_OVERRIDE` (`"on"` / `"off"` / `"auto"`) manually suspends that automation until `THEME_AUTOMATION_RESUME`; flip it with `npm run theme:on` / `npm run theme:off`, or set it to `"auto"` to hand control back to the calendar. Add `?ny=1` to a URL to preview it. Consumers: `app/[locale]/ClientLayout.tsx`, `HomeClientPage.tsx`, `secret-santa/ClientPage.tsx`.

## Design system

`design.md` defines the brand's design tokens (colors, typography, spacing, elevation, shape) — "Corporate Modern with a festive edge": Navy-Black primary, vibrant Red secondary/CTA, Indigo tertiary accent, Plus Jakarta Sans for headlines, Inter for body/UI text, 8px spacing base, 0.5rem base border radius. Consult it before introducing new colors/type styles/components.
