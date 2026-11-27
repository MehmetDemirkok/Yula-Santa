# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

YulaSanta is a Next.js 16 (App Router) app offering a family of free draw/giveaway tools: Secret Santa, raffle, YouTube giveaway picker, TikTok comment-picker giveaway, a set of small standalone tools (coin flip, dice, wheel of fortune, team generator, short straw, random number, gift suggestions), and the Plaka Avcısı quiz game. The UI is localized into 12 languages. Every tool is free. The TikTok giveaway takes pasted comments or comments from a companion browser extension. The canonical site URL is `SITE_URL` in `lib/constants.ts` (`https://www.yulasanta.com.tr`).

`README.md` is the short public overview: features, commands, env variables, and AdSense setup. `AGENTS.md` is a condensed version of this file for other agents, so keep the two consistent.

## Commands

```bash
npm run dev              # dev server on localhost:3000 only (keeps ADMIN_DEV_BYPASS off the network). Do not use -H 127.0.0.1: next-intl's rewrite then goes to "localhost" and loops with a 307
npm run dev:lan          # dev server on all interfaces, for phone testing; turn ADMIN_DEV_BYPASS off first
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
- `lib/giveawayFilters.ts` contains shared filter logic (keyword requirement, exclude lists, one-entry-per-user) used across the giveaway pickers. Its `requiredPool()` sets how many eligible people a draw needs: every winner and backup, and never fewer than two.
- `components/tools/RelatedTools.tsx`, rendered by `app/[locale]/tools/layout.tsx`, links every tool page to the others and, in the New Year season, leads with a Secret Santa card.

### TikTok giveaway (free)

Read `lib/tiktok/` before touching it. The earlier paid flow (PayTR checkout, credit ledger, Apify comment fetch) has been removed, so don't reintroduce pricing copy or payment assumptions:

- Comments arrive in two ways: pasted into `app/[locale]/tiktok/ClientPage.tsx` (browser only, no server), or collected by the extension through `app/api/tiktok/giveaway/*` and `lib/tiktok/giveawayStore.ts` (Neon).
- `lib/tiktok/index.ts` is the **client-safe** barrel export (types, normalization, URL parsing, manual import). It deliberately excludes anything that imports Node or Neon so it can be imported from client components; `giveawayStore.ts` is server-only.
- `app/api/tiktok/followers` is the only remaining Apify use: an optional follower check on winners, which needs `APIFY_API_TOKEN`.
- `lib/rateLimit.ts` is an in-memory (per-instance) rate limiter keyed by IP + route name; route-specific limits are defined in its `MAX_REQUESTS` map (e.g. `tiktok`, `tiktok-giveaway-create`, `tiktok-giveaway-import`, `youtube`). Apply it in new API routes the same way existing `app/api/tiktok/*` and `app/api/youtube/*` routes do.
- `extensions/yulasanta-tiktok-extension-v1.0.1/` is a separate, non-Next.js browser extension (manifest + vanilla JS) that feeds comments into the extension-collected giveaway flow via `giveawayStore.ts`'s API; it is not built/bundled by the Next.js app.

### Secret Santa

- Logic lives in `lib/secretSanta/`: `draw.ts` (matching with "must not draw each other" rules, both directions; uniform rejection sampling first, capped backtracking as fallback, which also reports `impossible`), `link.ts` (personal links, `.ics`, `wa.me` URLs) and `storage.ts` (localStorage keys). Tests: `tests/secret-santa/`.
- After the reveal, `/s` shows `components/secretSanta/StartOwnDrawCard.tsx`, inviting participants to run their own draw; its clicks are `cta_click` on the `/s` path, which the admin panel counts as link-to-draw conversion. `/result`'s link view has a "send to next" WhatsApp button and an all-sent state. The "advertise here" invite is hidden on `/`, `/s` and `/result` (`NO_INVITE_PATHS` in `ClientLayout.tsx`).
- Personal links are `/s#<token>`: base64url JSON with the giver, receiver, the organizer's hint and event details. The token sits in the URL fragment so it never reaches the server, logs or analytics; it is not encrypted, and the organizer can open anyone's link (the UI says so). `/s` is static and noindex, so the WhatsApp preview is the same for everyone.
- Rules: pairwise exclusions plus groups (`SantaGroup`; nobody draws someone in their own group, and `oversizedGroup` rejects a group bigger than everyone else combined).
- `/result` offers "send everyone a link" (WhatsApp, e-mail via `mailto:`, SMS on touch devices, Web Share, copy), "show on this screen" (each name locks after one reveal) or "print cards". AI gift ideas send only the hint and budget text to `/api/suggest-gifts`, never names.
- Printable cards (`components/secretSanta/PrintCards.tsx`) are three-panel fold-over strips, 5 per A4 page; a print-only copy is portalled into `<body>` and the `.ys-santa-print` rules in `app/globals.css` hide the rest of the site while printing. Keep the card height in `print.module.css` so five still fit.
- Audience landing pages share `components/secretSanta/SantaLandingPage.tsx` (copy type in `lib/santaLandingCopy.ts`): `/secret-santa/classroom` for schools (12 locales, `lib/classroomSeoCopy.ts`), `/secret-santa/office` and `/secret-santa/university` (tr, en, ru, `lib/officeUniversitySeoCopy.ts`; `dynamicParams = false` makes other locales 404, and `getSEOMetadata`'s `alternateLocales` and the sitemap's `only` limit hreflang to those). `/secret-santa/what-is` is an explainer article (tr, en, ru; `lib/whatIsSecretSantaCopy.ts`). The locale list for all three is `LANDING_LOCALES` in `lib/secretSanta/landingLocales.ts` (client-safe); adding a locale there needs copy in all three files plus `SantaLandingSections`. Turkish slugs (`/sinif-yilbasi-cekilisi`, `/ofis-yilbasi-cekilisi`, `/universite-yilbasi-cekilisi`, `/secret-santa-nedir`, ...) redirect in `next.config.ts`. All are in the sitemap and in `npm run indexnow -- --secret-santa`.
- Under the tool, `/secret-santa` renders `components/secretSanta/SantaLandingSections.tsx` (steps, audiences, features, privacy; tr, en and ru). The hero H1/subtitle for Turkish come from `SECRET_SANTA_H1` and `SECRET_SANTA_SUBTITLE` in `lib/pageSeoCopy.ts`.

### Wheel of fortune

- `app/[locale]/tools/wheel-of-fortune/WheelClient.tsx` owns list, history and result state (saved to `localStorage` under `yulasanta_wheel_v1`). `components/wheel/WheelStage.tsx` is a 2D canvas engine with no WebGL, and `lib/wheel/wheelMath.ts` holds the pure, tested logic.
- The winner comes only from `secureRandomInt` in `WheelClient`. Flick strength and landing jitter change how the spin looks, never who wins.

### Mobile CSS gotchas

`app/globals.css` sets `html { font-size: 14px }` at 640px and below, so rem-based Tailwind sizes shrink 12.5% on phones (`h-11` renders at 38.5px). It also applies an unlayered `min-height: 44px` to buttons, which beats every `min-h-*` utility. Use pixel sizes such as `h-[56px]` for touch targets. The fixed navbar is 72px tall on phones, but `main` only reserves `pt-14` (49px), so a page must add its own top padding.

### Navbar

`components/Navbar.tsx` does not use a fixed breakpoint for the desktop links: label widths differ too much between locales. It measures two hidden copies of the links and picks `full` (icons and labels), `compact` (labels, tighter padding) or `menu` (hamburger), so a long translation falls back instead of pushing the language switcher off screen. Below `lg` it is always the hamburger. Keep the hidden copies in step with the visible links when adding one.

### Plaka Avcısı (Turkey plate quiz game)

- Pages: `app/[locale]/oyun/plaka-avcisi/` (server `page.tsx` for SEO/JSON-LD + `PlakaAvcisiClient.tsx`) and `/oyun/plaka-avcisi/liderlik` (noindex live rankings). UI copy is Turkish by design (`lang="tr"` on the game shell); translated strings in `messages/*.json` are limited to the tools card + page metadata (`tools.plakaAvcisi`, `plakaAvcisiShort`, `plakaAvcisiMeta`).
- Static data: `lib/plaka/cities.ts` holds all 81 provinces (code, region, difficulty, two hints). `lib/plaka/questions.ts` builds question sets server-side; the daily challenge is deterministic from the Europe/Istanbul date seed. Standard and daily rounds are 20 questions (`STANDARD_QUESTION_COUNT`, `DAILY_QUESTION_COUNT` in `game.ts`), and a level exhausts its own tier before borrowing from the nearest one, since `zor` has only 18 cities.
- Client-safe modules: `cities.ts`, `game.ts` (modes/scoring/combo), `achievements.ts`, `contracts.ts` (API types). **Never** import `store.ts`, `player.ts` or `questions.ts` from a client component — they use Neon/Node and are imported by API routes only.
- Server: `lib/plaka/store.ts` owns the Neon schema (`plaka_cities`, `plaka_game_modes`, `plaka_sessions`, `plaka_questions`, `plaka_answers`, `plaka_player_stats`, `plaka_achievements`, `plaka_player_achievements`), scoring and achievement evaluation. Local dev and production share one database: DDL runs only when the marker comment on `plaka_cities` is out of date (bump `SCHEMA_REVISION` when DDL changes), and new DDL must stay compatible with the deployed code. Nothing queries the old `plaka_leaderboard` view any more. Correct answers never leave the server; the client submits `position` + `optionIndex` and receives only the verdict.
- Map mode (`harita`) draws `lib/plaka/turkeyMap.ts` (Natural Earth, public domain, generated data; regenerate rather than hand-edit) with `components/plaka/TurkeyMap.tsx`. Its questions have no options: the client sends the tapped plate code as `optionIndex` and `correct_index` stores the city's code.
- Leaderboard names and avatars go through `publicName`/`publicAvatar` in `store.ts`: Google photos are never shown, and nicknames pass the client-safe filter in `lib/plaka/nickname.ts`. Untimed runs resume after a reload via `/api/plaka/resume` and the `plaka_avcisi_active_session` localStorage key.
- `lib/plaka/player.ts` resolves identity: Google sessions are hashed to `user_<sha256>`, guests get an HMAC-signed httpOnly `plaka_player` cookie. Guest scores/leaderboard entries are anonymous but persistent.
- API: `app/api/plaka/{session,resume,answer,finish,leaderboard,stats}`; rate limits live in `lib/rateLimit.ts` (`plaka-session`, `plaka-resume`, `plaka-answer`, `plaka-finish`, `plaka-leaderboard`, `plaka-stats`). Answering is guarded by `answered = false` in SQL, position must match `current_index`, sessions expire after 45 minutes, and timed runs stop accepting answers 5 seconds after the 60-second countdown.
- Tests: `tests/plaka/plaka-game.test.ts` covers dataset integrity (81 unique codes), scoring/combo math, question generation and daily determinism. It also checks that no hint names its own city. It does not touch the DB.

### Admin panel and analytics

- `/admin` lives in `app/admin/`, outside `app/[locale]`, so it has no public navbar, ads or tracking. `middleware.ts` excludes it from locale routing. UI copy is Turkish only.
- `requireAdmin()` in `lib/admin/guard.ts` must be the first call in anything under `/admin`. Anyone who is not the admin gets a plain 404. The rules live in `lib/admin/access.ts`: the Google e-mail must be verified, listed in `ADMIN_EMAILS`, and signed in within 12 hours. An empty list means nobody gets in. Next.js middleware does not cover `/api`, so never rely on it for admin checks.
- `ADMIN_DEV_BYPASS=1` skips the check only under `next dev`.
- `/admin/marketing` (`components/admin/marketing/`) is a campaign studio: four campaigns × Instagram story, Instagram post, A4 poster and A4 QR poster, drawn as SVG at full size with PNG/SVG download and A4 print. Copy and QR target URLs live in `lib/marketing/campaigns.ts`; QR codes use the `qrcode` package.
- Events go from `lib/analytics/client.ts` to `POST /api/analytics/collect`, a write-only endpoint, and into `analytics_events` through `lib/analytics/store.ts` (server-only). `lib/analytics/events.ts` is an allowlist with no free-text field. **Never send participant names, winners or matches**: the privacy page and Secret Santa copy promise they stay out of these records.
- New tools must call `trackDraw(tool, counts)` when a draw finishes, and the tool name must be added to `TOOLS`. Funnel steps go through `trackAction` with an allowlisted name (`cta_click` via `components/analytics/TrackedLink.tsx`, `list_imported`, `card_printed`, `whatsapp_share` once per result-page visit, `qr_generated`, `santa_link_opened`/`santa_link_invalid` once per `/s` visit, because page analytics never see the fragment, and `santa_links_all_sent` once per draw when the last personal link goes out); new names go into `EVENT_NAMES` and the labels in `lib/analytics/store.ts` and `AdminDashboard.tsx`.
- Optional GA4: with `NEXT_PUBLIC_GA_MEASUREMENT_ID` set, `components/analytics/ConsentedGoogleAnalytics.tsx` loads gtag only after cookie consent, with automatic page views off; `lib/analytics/client.ts` mirrors our events and sends page views with the pathname only, because `/s#...` and `/proof?d=...` carry draw data. `lib/legal/privacyNotice.ts` mentions GA4 only while the variable is set. Secret Santa sends one `trackShare` per draw (first link sent, or printing). The admin tool table ranks tools by distinct users, since one visitor can roll dice hundreds of times.
- Raw IPs and user agents are not stored. Without consent, the visitor key changes daily. A persistent browser ID and the signed-in e-mail are used only after cookies are accepted (`yulasanta_cookie_consent_v2`).
- Rows carry `env` (`VERCEL_ENV`, else `development`), so localhost traffic stays apart from production. Rows older than 90 days are purged by a 1% chance on each write, as there is no cron job.
- The landing page's live draw stats (`components/home/DrawStats.tsx`) read `GET /api/stats/draws`, which sums `draw_stats_daily` (env, day, tool, draws). `insertEvents` increments it for every `draw_completed`, and `ensureSchema` rebuilds the last 3 days from `analytics_events` with `GREATEST`. The table has no visitor data, so it is not purged. Counting starts at `PUBLIC_STATS_START`; dice, coin flip, random number and gift ideas are excluded, and the section stays hidden below `PUBLIC_STATS_MIN_TOTAL` except under `next dev` (`lib/analytics/publicStats.ts`).

### Auth

- `auth.ts` configures Auth.js (NextAuth v5) with **JWT sessions** and two providers: Google (stored nowhere but the session cookie) and e-mail + password (`credentials`). Password accounts live in `auth_users` on Neon (`lib/auth/userStore.ts`, server-only); passwords are scrypt hashes (`lib/auth/password.ts`), validation rules are shared by the forms and API (`lib/auth/credentials.ts`), sign-up is `POST /api/auth/register`, and sign-in attempts are rate limited per IP and per e-mail (`auth-login`, `auth-login-email`, `auth-register` in `lib/rateLimit.ts`).
- Password e-mails start **unverified**. Sessions carry `provider`, `accountId` and `emailProven`; anything that trusts an e-mail must check them. The admin gate needs `emailVerified` (Google only), analytics links only verified e-mails, and Plaka keys password accounts by `credentials:<accountId>` (`lib/auth/accountKey.ts`), so nobody can sign up with someone else's Gmail and take their scores. A Google user can add a password at `/account` (`POST /api/auth/password`, Google session required); that row is marked `email_verified`, takes over any unverified sign-up with the same address, and its sessions get `emailProven`, sharing the Google identity in Plaka. A password account's address becomes proven (`email_verified`, session `emailProven`) when the user clicks the sign-up confirmation link (`/verify-email`, `POST /api/auth/verify-email`; resend with `PUT`) or resets the password from an e-mailed link (`/forgot-password` → `POST /api/auth/forgot`, which answers the same whether or not the account exists; `/reset-password` → `POST /api/auth/reset`). Links are one-time tokens in `auth_tokens` (only a SHA-256 is stored; verify 24 h, reset 30 min) built by `lib/auth/emailLinks.ts`, which uses `SITE_URL` in production so a forged Host header can't redirect them. `emailProven` never grants admin: the gate still needs a Google `emailVerified`.
- E-mail goes through Resend's REST API (`lib/email/send.ts`, no SDK). The account e-mails' words live in `auth.mail` in every `messages/*.json` (`lib/email/templates.ts` renders them, right-to-left for Arabic; `lib/auth/accountEmails.ts` issues the token and sends in the visitor's locale). The delete-account confirm word is per locale (`DELETE_WORDS` in `lib/auth/deletion.ts`, kept equal to `auth.accountPage.deleteWord` by a test).
- Auth pages must render without waiting: `/login`, `/register` and the e-mail pages show their form in the static HTML and read `?callbackUrl`, `?error` and `?token` after hydration through `components/auth/useQueryParam.ts` (no `useSearchParams`, which would force a Suspense fallback). Links between auth pages use `next/link`, not `<a>`. The Resend key is send-only and limited to `yulasanta.com.tr`, which is verified in Resend.
- The session is read in the browser: `SessionProvider` wraps `ClientLayout`, so pages stay static. `components/auth/AccountMenu.tsx` puts "Log in" (or the avatar with log out) in the navbar and the phone menu; the login link carries `?callbackUrl=` for the current page. `/login` and `/register` render `components/auth/AuthPanel.tsx` (Google button, a welcome view when signed in, Auth.js errors via `pages` in `auth.ts`). Return paths go through `safeRedirect` in `lib/auth/redirect.ts` (same-site only, never back to the sign-in pages; tests in `tests/auth/`). Signing in only links Plaka Avcısı scores to the account; every draw tool works signed out, and the copy must keep saying so.
- `/account` (`components/auth/AccountClient.tsx`, static shell, noindex): profile (password accounts can rename via `PATCH /api/auth/profile`; the jwt callback re-reads the name on `update()`), set or change password (`POST /api/auth/password`; password accounts must send the current one), Plaka report card from `/api/plaka/stats`, "my recent draws" from this browser's localStorage only (`lib/account/deviceDraws.ts`, counts and dates, never names), an admin link when `session.isAdmin` (same rule as the admin gate, display only), help links, and self-serve deletion (`DELETE /api/auth/account`: removes the password row, all Plaka data via `deletePlayerData`, and the e-mail link on `analytics_events` via `forgetEmail`; password accounts must give their password, Google accounts must have signed in within 15 minutes, and the user types "SİL", see `lib/auth/deletion.ts`). The navbar account menu links to each section (`#plaka`, `#cihaz`).

### Env / secrets

`.env.local` (not committed) holds: Google OAuth (`AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`), Neon/Postgres (`DATABASE_URL*`, `PG*`, `POSTGRES_*`), `APIFY_API_TOKEN`, and `YOUTUBE_API_KEY`. Treat any route touching these as server-only and never expose them to client components. Any `PAYTR_*` values still in the file are no longer read.

The code also reads these optional variables; `PLAKA_SECRET` and `OPENAI_API_KEY` are not currently in `.env.local`:

- `PLAKA_SECRET`: guest cookie signing (`lib/plaka/player.ts`), with fallbacks
- `OPENAI_API_KEY`: translation script only
- `GEMINI_API_KEY`: AI gift suggestions; without it the static list is served
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: optional GA4 property (`G-...`); loads only after cookie consent
- `ADMIN_EMAILS`: comma-separated admin allowlist; empty closes `/admin` for everyone
- `ADMIN_DEV_BYPASS`: set to `1` to skip the admin check under `next dev`; ignored in production
- `RESEND_API_KEY`: account e-mails (verification, password reset); without it sign-up still works but no mail is sent and `/api/auth/forgot` answers 503
- `EMAIL_FROM`: sender, default `YulaSanta <no-reply@yulasanta.com.tr>`

`/api/suggest-gifts` asks Gemini (`GEMINI_API_KEY`, set in Vercel for production and preview, not in `.env.local`) for five ideas and falls back to a static list; logic and the prompt live in `lib/gifts/suggest.ts`. Both callers depend on its shape: the gift tool shows AI results only when `source === 'ai'`, and `/result` shows `suggestions` as-is, so every response must carry a list. It is rate limited (`suggest-gifts`).

### Legal / privacy

- `/privacy` renders `lib/legal/privacyNotice.ts` (KVKK aydınlatma metni, Turkish governing plus English for every other locale), not `messages/*.json`. Its claims must match the code: update it whenever storage, retention, third parties or public display change.
- `lib/legal/operator.ts` holds the operator's identity for `/privacy` and `/legal`; empty fields are hidden.
- AdSense loads only after cookie consent (`components/ads/ConsentedAdSenseScript.tsx`, listening for `CONSENT_EVENT`). The `google-adsense-account` meta tag stays for site verification.
- Extension-collected TikTok comments are purged after `TIKTOK_COMMENT_RETENTION_DAYS` (`lib/tiktok/retention.ts`) on each giveaway create; drawn results are kept for `/verify`.

### Ads / SEO

- AdSense infra lives in `components/ads/` + `lib/ads/config.ts`, gated behind `NEXT_PUBLIC_ADSENSE_CLIENT_ID` / `NEXT_PUBLIC_AD_SLOT_*` env vars (see README for the full list).
- `components/seo/` (JsonLd, per-tool/per-page SEO sections) and `lib/seo.ts` / `lib/pageSeoCopy.ts` centralize structured data and per-page SEO copy (`lib/secretSantaSeoCopy.ts` holds the long `/secret-santa` copy per locale; its claims must match how the tool works); `app/sitemap.ts` / `app/robots.ts` generate the sitemap/robots files.

### Themes

Two independent systems share the word "theme":

- **Light/dark:** `lib/theme.ts` and `lib/ThemeContext.tsx`. The stored preference is `light`, `dark`, or `auto`; `auto` is time-based (light from 07:00 to 19:00 local time), not OS-based, and re-evaluates while the page is open.
- **Seasonal:** `components/NewYearTheme/` (snowfall, confetti, fireworks, glitter overlay, countdown banner) is active when `isNewYearThemeActive()` returns true — normally calendar-driven (Nov 30 → Jan 10) in `components/NewYearTheme/config.ts`. `THEME_OVERRIDE` (`"on"` / `"off"` / `"auto"`) manually suspends that automation until `THEME_AUTOMATION_RESUME`; flip it with `npm run theme:on` / `npm run theme:off`, or set it to `"auto"` to hand control back to the calendar. Add `?ny=1` to a URL to preview it. Consumers: `app/[locale]/ClientLayout.tsx`, `HomeClientPage.tsx`, `secret-santa/ClientPage.tsx`.

## Design system

`design.md` defines the brand's design tokens (colors, typography, spacing, elevation, shape) — "Corporate Modern with a festive edge": Navy-Black primary, vibrant Red secondary/CTA, Indigo tertiary accent, Plus Jakarta Sans for headlines, Inter for body/UI text, 8px spacing base, 0.5rem base border radius. Consult it before introducing new colors/type styles/components.
