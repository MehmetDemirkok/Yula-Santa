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
- `README.md` predates locale routing and the paid TikTok product — its project tree is stale (shows `app/privacy`/`app/result` at root, no `[locale]`, and points to `lib/i18n/` for translation strings, which live in `messages/`). Trust `CLAUDE.md` and the code over it.
- SEO pattern: each route folder = server `page.tsx` (metadata) + client `*Client.tsx`. Keep that split.
- `@/*` path alias maps to the repo root.
- Turkish-slug → English path redirects are hardcoded in `next.config.ts`.

## TikTok subsystem (paid, most complex)

- Client-safe barrel `lib/tiktok/index.ts` must stay free of Node/Apify/Neon imports; server-only code lives in `server.ts`, `apifyProvider.ts`, `giveawayStore.ts`, `paidFetch.ts`, `paytrCheckout.ts`, `ledger.ts`.
- Two independent flows share one Neon DB but different tables: paid Apify/PayTR (ledger-based) and extension-collected (`giveawayStore.ts`). Changing one does not affect the other.
- Apply `lib/rateLimit.ts` (in-memory, per-instance; limits in its `MAX_REQUESTS` map) in new API routes, like existing `app/api/tiktok/*`.

## Other

- Auth (`auth.ts`): Auth.js v5 with Google only, JWT-only sessions — there is no users table.
- Secrets live in `.env.local` (gitignored): Neon, Apify, PayTR, YouTube, Gemini, Google OAuth, Instagram. Never expose to client components.
- AdSense is gated behind `NEXT_PUBLIC_ADSENSE_CLIENT_ID` / `NEXT_PUBLIC_AD_SLOT_*` env vars (`components/ads/`, `lib/ads/config.ts`); sitemap/robots via `app/sitemap.ts` / `app/robots.ts`.
- `extensions/yulasanta-tiktok-extension-*/` is a standalone vanilla-JS browser extension, not built by the Next app.
