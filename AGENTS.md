# AGENTS.md

YulaSanta (yulasanta.com): Next.js 16 App Router + TypeScript, Tailwind v4, next-intl.
Full architecture notes live in `CLAUDE.md`; design tokens in `design.md` — read those before large changes.

## Commands

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint` — eslint flat config. No standalone typecheck; `next build` type-checks.
- `npm test` — `tsx --test tests/**/*.test.ts`, using Node's built-in `node:test` + `node:assert` (not Jest/Vitest). Only `lib/tiktok` is tested; the free tools have no tests.
- Single file: `npx tsx --test tests/tiktok/tiktok-module.test.ts`
- `npm run i18n:check` — verifies every `messages/*.json` matches `tr.json`; exits 1 on mismatch. `--fix` is report-only (logs, never exits 1).
- `npm run i18n:sync` alone **fails** (no locale arg). Use `npx tsx scripts/generate-translations.ts <locale|all> --sync` (needs `OPENAI_API_KEY`).
- `npm run indexnow` — posts URLs to IndexNow (Bing/Yandex/Seznam/Naver). No arg = all sitemap URLs; `-- --secret-santa` or `-- --url <path>` to scope it; `-- --dry-run` prints the payload. Run **after** deploy: key file `public/<key>.txt` must be live. Does not affect Google (use sitemap + GSC there).
- `npm run theme:on` / `theme:off` — sets `THEME_OVERRIDE` (`"on"`/`"off"`) in `components/NewYearTheme/config.ts` via sed. Seasonal theme is normally date-driven (`isNewYearThemeActive`: Nov 30 → Jan 10); `THEME_OVERRIDE !== "auto"` suspends that automation until `THEME_AUTOMATION_RESUME` (currently 1 Jun 2027). To hand control back to the calendar, set it to `"auto"`.

## Gotchas

- **Pre-existing test failures**: `tests/tiktok/tiktok-module.test.ts` has 2 failing tests about the participant cap (expected 500, actual 1000/501), so `npm test` exits non-zero on a clean checkout. Don't assume you broke it.
- Locale routing: pages live under `app/[locale]/`. `tr` (default) has **no** URL prefix (`localePrefix: 'as-needed'`), others are `/en/...`. `middleware.ts` disables Accept-Language redirects. Build links with `lib/localePath.ts`, never hand-roll `/tr/...`.
- i18n source of truth is `messages/tr.json`. Add keys there first, then run `i18n:check`.
- Two i18n APIs coexist: new pages use next-intl `useTranslations()` directly; `lib/i18n/LanguageContext.tsx` is a legacy `useLanguage()` wrapper still used by `LanguageSelector`, `CookieConsent`, `RaffleBoard`, and the `result`/`raffle`/`youtube`/`tiktok` client pages. `lib/i18n/translations.ts` holds only locale constants/types, not strings.
- `README.md` is the short public overview: features, commands, env variables, and AdSense setup. For architecture details, use `CLAUDE.md` and the code.
- SEO pattern: each route folder = server `page.tsx` (metadata) + client `*Client.tsx`. Keep that split.
- `@/*` path alias maps to the repo root.
- Turkish-slug → English path redirects are hardcoded in `next.config.ts`.

## TikTok subsystem (free)

- Client-safe barrel `lib/tiktok/index.ts` must stay free of Node/Neon imports; server-only code lives in `giveawayStore.ts`.
- Comments arrive by manual paste (browser only) or the Chrome extension (`giveawayStore.ts`, Neon). The paid PayTR/credit flow was removed; do not reintroduce pricing copy.
- Apply `lib/rateLimit.ts` (in-memory, per-instance; limits in its `MAX_REQUESTS` map) in new API routes, like existing `app/api/tiktok/*`.

## Plaka Avcısı (plate quiz game)

- Routes: `/oyun/plaka-avcisi` (+ `/liderlik`); tool card on `/tools`; sitemap entry; `/plaka-avcisi` redirects to the game.
- Data/UI: `lib/plaka/cities.ts` (81 provinces), `lib/plaka/game.ts` (modes, scoring), `components/plaka/` (client screens). UI copy is Turkish by design.
- Server-only: `lib/plaka/store.ts` (Neon tables `plaka_*`, scoring, leaderboard, achievements), `lib/plaka/player.ts` (Google hash / signed guest cookie), `lib/plaka/questions.ts`. Points and answers are validated server-side via `app/api/plaka/*`; add new API routes to the `MAX_REQUESTS` map in `lib/rateLimit.ts`.
- Rounds: standard and daily rounds are 20 questions (`STANDARD_QUESTION_COUNT`, `DAILY_QUESTION_COUNT`). A level uses all of its own tier before borrowing from the nearest (`zor` has only 18 cities). Timed runs are enforced on the server.
- Tests: `npx tsx --test tests/plaka/plaka-game.test.ts` (pure logic, no DB).

## Other

- Auth (`auth.ts`): Auth.js v5 with Google only, JWT-only sessions — there is no users table.
- Secrets live in `.env.local` (gitignored): Neon, Apify (follower check only), YouTube, Google OAuth. Never expose to client components.
- AdSense is gated behind `NEXT_PUBLIC_ADSENSE_CLIENT_ID` / `NEXT_PUBLIC_AD_SLOT_*` env vars (`components/ads/`, `lib/ads/config.ts`); sitemap/robots via `app/sitemap.ts` / `app/robots.ts`.
- `extensions/yulasanta-tiktok-extension-*/` is a standalone vanilla-JS browser extension, not built by the Next app.

### Admin panel and analytics

- `/admin` lives in `app/admin/`, outside `app/[locale]`, so it has no public navbar, ads or tracking. `middleware.ts` excludes it from locale routing. UI copy is Turkish only.
- `requireAdmin()` in `lib/admin/guard.ts` must be the first call in anything under `/admin`. Anyone who is not the admin gets a plain 404. The rules live in `lib/admin/access.ts`: the Google e-mail must be verified, listed in `ADMIN_EMAILS`, and signed in within 12 hours. An empty list means nobody gets in. Next.js middleware does not cover `/api`, so never rely on it for admin checks.
- `ADMIN_DEV_BYPASS=1` skips the check only under `next dev`.
- Events go from `lib/analytics/client.ts` to `POST /api/analytics/collect`, a write-only endpoint, and into `analytics_events` through `lib/analytics/store.ts` (server-only). `lib/analytics/events.ts` is an allowlist with no free-text field. **Never send participant names, winners or matches**: the privacy page and Secret Santa copy promise they stay out of these records.
- New tools must call `trackDraw(tool, counts)` when a draw finishes, and the tool name must be added to `TOOLS`.
- Raw IPs and user agents are not stored. Without consent, the visitor key changes daily. A persistent browser ID and the signed-in e-mail are used only after cookies are accepted (`yulasanta_cookie_consent_v2`).
- Rows carry `env` (`VERCEL_ENV`, else `development`), so localhost traffic stays apart from production. Rows older than 90 days are purged by a 1% chance on each write, as there is no cron job.
