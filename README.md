# YulaSanta - Online Secret Santa Draw 🎅

A free, beautiful, and multilingual Secret Santa draw application. Create gift exchanges with friends, family, or colleagues in seconds!

## Features

- 🎁 **Secret Santa Draw** - Random gift assignment where each person gives a gift to one other person
- 🤝 **Direct Matching** - Pair matching for gift exchanges
- 🌍 **12 Languages** - TR, EN, DE, FR, ES, IT, PT, RU, AR, JA, KO, ZH
- 📱 **Responsive Design** - Works on all devices
- 📄 **File Upload** - Import participants from Excel/PDF
- 🔒 **Privacy First** - All data stored locally in browser

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
npm run build
npm start
```

## Google AdSense Integration

This project includes full AdSense infrastructure. To enable ads:

### 1. Get AdSense Approval

1. Apply for Google AdSense at [https://www.google.com/adsense](https://www.google.com/adsense)
2. Add your site URL (yulasanta.com)
3. Wait for approval (usually 1-14 days)

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
# Your AdSense Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Ad Slot IDs (create ad units in AdSense dashboard)
NEXT_PUBLIC_AD_SLOT_BANNER_TOP=1234567890
NEXT_PUBLIC_AD_SLOT_BANNER_BOTTOM=1234567891
NEXT_PUBLIC_AD_SLOT_RECTANGLE=2345678901
NEXT_PUBLIC_AD_SLOT_IN_ARTICLE=3456789012
```

### 3. Add Ads to Pages

```tsx
import { BannerAd, InArticleAd, AdWrapper } from '@/components/ads';
import { AD_SLOTS } from '@/lib/ads/config';

// Banner ad at top
<AdWrapper position="top">
  <BannerAd adSlot={AD_SLOTS.BANNER_TOP} />
</AdWrapper>

// In-article ad
<AdWrapper position="inline">
  <InArticleAd adSlot={AD_SLOTS.IN_ARTICLE} />
</AdWrapper>
```

### 4. Verify Your Site

In `app/layout.tsx`, update the verification code:

```tsx
verification: {
  google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE",
},
```

## Available Ad Components

| Component | Description | Best For |
|-----------|-------------|----------|
| `BannerAd` | Horizontal banner | Top/Bottom of page |
| `RectangleAd` | 300x250 rectangle | Sidebar, in-content |
| `InArticleAd` | Native in-content | Between content sections |
| `AutoAd` | Auto-sizing responsive | Flexible placements |

## GDPR Compliance

- ✅ Cookie Consent Banner (12 languages)
- ✅ Privacy Policy Page (`/privacy`)
- ✅ Local Storage Only (no server data)

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Analytics**: Vercel Analytics
- **Ads**: Google AdSense
- **Deployment**: Vercel

## Project Structure

```
├── app/
│   ├── layout.tsx          # Main layout with AdSense script
│   ├── ClientLayout.tsx    # Client-side layout wrapper
│   ├── page.tsx            # Home page
│   ├── result/             # Result page
│   └── privacy/            # Privacy policy
├── components/
│   ├── ads/                # AdSense components
│   ├── ui/                 # UI components
│   ├── LanguageSelector.tsx
│   └── CookieConsent.tsx
├── lib/
│   ├── ads/config.ts       # Ad configuration
│   └── i18n/               # Translations
└── public/
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/yulasanta)

Set these environment variables in Vercel:

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_AD_SLOT_BANNER_TOP`
- `NEXT_PUBLIC_AD_SLOT_RECTANGLE`
- `NEXT_PUBLIC_AD_SLOT_IN_ARTICLE`

## License

MIT License

---

Made with ❤️ for the holiday season 🎄
