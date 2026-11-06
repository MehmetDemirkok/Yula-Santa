# YulaSanta

A family of draw and giveaway tools, localized into 12 languages. All tools are free, and most run entirely in the browser.

Live site: [www.yulasanta.com.tr](https://www.yulasanta.com.tr)

## Features

**Draws and giveaways**

- **Secret Santa**: random gift assignment, with participant import from Excel or PDF
- **Raffle**: name draw with a shareable result
- **YouTube giveaway**: pick winners from video comments
- **TikTok giveaway**: pick winners from comments that you paste or collect with the browser extension

**Small tools**: coin flip, dice, wheel of fortune, team generator, short straw, random number, gift suggestions

**Game**: Plaka Avcısı, a Turkish license plate quiz with a daily challenge and leaderboard

**Across the site**

- 12 languages: TR, EN, DE, FR, ES, IT, PT, RU, AR (RTL), JA, KO, ZH
- Shareable and verifiable draw results through `/proof` and `/verify/[id]`
- Light, dark, and time-based themes, plus a seasonal New Year theme

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages that only use client-side tools work without any configuration. Features that call an API need the matching variables below.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build, which also type-checks |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with `node:test` through `tsx` |
| `npm run i18n:check` | Check that every locale has the same keys as `tr.json` |
| `npx tsx scripts/generate-translations.ts <locale\|all> --sync` | Generate missing translations (needs `OPENAI_API_KEY`) |
| `npm run indexnow` | Submit sitemap URLs to IndexNow after a deploy (`-- --dry-run` to preview) |
| `npm run theme:on` / `npm run theme:off` | Force the seasonal theme on or off |

Run one test file with `npx tsx --test tests/tiktok/tiktok-module.test.ts`.

Two tests in `tests/tiktok/tiktok-module.test.ts` currently fail because they still expect a cap of 500.

## Environment variables

Create a `.env.local` file for local development. It is gitignored. Everything except the `NEXT_PUBLIC_*` values is server-only and must never reach client components.

| Feature | Variables |
|---------|-----------|
| Google sign-in | `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Database (Neon Postgres) | `DATABASE_URL` |
| YouTube giveaway | `YOUTUBE_API_KEY` |
| Admin panel (`/admin`) | `ADMIN_EMAILS`, plus `DATABASE_URL` for analytics |
| TikTok follower check | `APIFY_API_TOKEN` |
| Plaka Avcısı guest cookie (optional) | `PLAKA_SECRET` |
| Translation script | `OPENAI_API_KEY` |
| Ads and site verification | See [Google AdSense](#google-adsense) |

## Project structure

```text
├── app/
│   ├── [locale]/        # Localized pages (Turkish has no URL prefix)
│   ├── api/             # plaka, tiktok, youtube, auth, parse-pdf, suggest-gifts
│   ├── robots.ts
│   └── sitemap.ts
├── components/          # Shared UI, plus ads/, seo/, plaka/, tiktok/, wheel/
├── extensions/          # TikTok browser extension (not part of the Next.js build)
├── i18n/                # Supported locales and next-intl setup
├── lib/                 # Tool logic, plus plaka/, tiktok/, wheel/, ads/
├── messages/            # One file per locale; tr.json is the source of truth
├── public/              # Icons, images, ads.txt, IndexNow key
├── scripts/             # Translation, IndexNow, and theme scripts
└── tests/
```

See [CLAUDE.md](CLAUDE.md) for architecture notes and [design.md](design.md) for the design tokens.

## Translations

Add new keys to `messages/tr.json` first, then generate the other locales and run `npm run i18n:check`.

## Google AdSense

The ad components render only in production and need a publisher ID.

### 1. Set the variables

Apply at [Google AdSense](https://www.google.com/adsense), create your ad units, then set:

```env
# Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Ad slot IDs
NEXT_PUBLIC_AD_SLOT_BANNER_TOP=1234567890
NEXT_PUBLIC_AD_SLOT_BANNER_BOTTOM=1234567891
NEXT_PUBLIC_AD_SLOT_RECTANGLE=2345678901
NEXT_PUBLIC_AD_SLOT_IN_ARTICLE=3456789012
NEXT_PUBLIC_AD_SLOT_AUTO=4567890123

# Google Search Console verification code
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```

### 2. Add ads to a page

```tsx
import { BannerAd, InArticleAd, AdWrapper } from '@/components/ads';
import { AD_SLOTS } from '@/lib/ads/config';

<AdWrapper position="top">
  <BannerAd adSlot={AD_SLOTS.BANNER_TOP} />
</AdWrapper>

<AdWrapper position="inline">
  <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
</AdWrapper>
```

### Ad components

| Component | Description | Best for |
|-----------|-------------|----------|
| `BannerAd` | Horizontal banner | Top or bottom of a page |
| `RectangleAd` | 300x250 rectangle | Sidebar or in-content |
| `InArticleAd` | Native in-content ad | Between content sections |
| `AutoAd` | Auto-sizing responsive ad | Flexible placements |

## Privacy

- Client-only tools such as Secret Santa, raffle, and the small tools keep participant data in the browser.
- Features that need a server use the Neon database or third-party APIs: extension-collected TikTok giveaways, the TikTok follower check, and Plaka Avcısı scores.
- The site includes a cookie consent banner in all 12 languages and a privacy policy at `/privacy`.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Localization**: next-intl
- **Auth**: Auth.js (NextAuth v5) with Google, using JWT sessions and no users table
- **Database**: Neon Postgres
- **Integrations**: Apify, YouTube Data API
- **3D**: Three.js and cannon-es (coin flip and dice)
- **Analytics and ads**: Vercel Analytics, Google AdSense
- **Deployment**: Vercel

## Deployment

The site deploys on Vercel. Set the variables above in the project settings. `.vercelignore` keeps env files and the `extensions/` folder out of uploads. After a production deploy, run `npm run indexnow`.

## License

MIT License
