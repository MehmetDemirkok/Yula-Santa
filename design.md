---
name: Trustworthy Celebration
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#45464c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#b61722'
  on-secondary: '#ffffff'
  secondary-container: '#da3437'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#07006c'
  on-tertiary-container: '#7073ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ad'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930013'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  surface-cream: '#FDFBF8'
  indigo-accent: '#4F46E5'
  success-green: '#10B981'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
---

## Brand & Style

The design system is built for a platform that balances the excitement of chance with the reliability of a professional tool. The brand personality is "fun yet reliable," targeting users who value transparency and ease of use in raffle management.

The chosen style is **Corporate Modern with a festive edge**. It prioritizes high-quality visual hierarchy through generous whitespace and a "surface-on-surface" architecture. The aesthetic avoids the cluttered tropes of gaming sites in favor of a clean, SaaS-like interface that lends institutional credibility to every draw. Elements are crisp, utilizing subtle depth and a refined color palette to guide the user's journey from setup to the "big reveal."

## Colors

The color strategy uses a deep, authoritative foundation to establish trust. The primary color is a rich Navy-Black (`#111827`), used for text and core structural elements. The secondary color is a vibrant Red (`#EF4444`), reserved for high-energy touchpoints, festive accents, and primary calls to action.

To soften the interface and provide a sophisticated "paper" feel, a cream-white (`#FDFBF8`) is used for primary cards, while a cool gray (`#F9FAFB`) defines background surfaces. A tertiary Indigo is introduced to provide a modern, tech-forward contrast to the red, used for secondary actions and interactive states.

## Typography

This design system employs a dual-font strategy to balance character and utility. **Plus Jakarta Sans** is used for headlines; its friendly, geometric curves inject the "fun" aspect of the brand into the UI. For body copy and interface labels, **Inter** provides maximum legibility and a systematic, reliable feel.

Type scales are generous to ensure accessibility. Large display styles use tighter letter spacing and heavier weights to create a strong visual anchor for hero sections and win-state announcements.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop, centered within a 1200px container to maintain focus and readability. On mobile devices, it shifts to a fluid 4-column layout with 16px side margins.

A strict 8px spacing system governs all internal padding and margins, ensuring a consistent rhythm. Significant whitespace is intentionally used between major sections to prevent cognitive overload, particularly when users are managing large lists of participants.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**. 

The background uses a flat, neutral gray. Interactive cards and "draw" panels sit on the next level up, using a pure white or cream surface with a soft, highly diffused shadow (e.g., 0px 10px 30px rgba(0,0,0,0.04)). Active elements or "winner" announcements utilize a more pronounced elevation with a slight glow effect using a tinted shadow (e.g., a subtle red or indigo tint) to draw the eye without feeling aggressive.

## Shapes

The shape language is consistently "Rounded," utilizing a 0.5rem (8px) base radius. This creates an approachable, modern feel that avoids the sterility of sharp corners while remaining more professional than fully pill-shaped "bubble" designs. Larger components like cards and modal dialogs use the `rounded-xl` (1.5rem) setting to emphasize their container status.

## Components

- **Buttons:** Primary buttons use a solid Red background with white text and a subtle 1px inner light border. Secondary buttons use a light Indigo tint or a ghost-style outline for lower-priority actions.
- **Cards:** The hallmark of the system. Cards feature a 1px border in a very light neutral gray, a soft shadow, and 24px internal padding. Headers within cards should be separated by a subtle horizontal rule.
- **Input Fields:** Designed with a focus on utility; they use a 2px stroke when focused, utilizing the primary Navy-Black color to indicate active state clearly.
- **Chips:** Used for tagging raffle categories or status (e.g., "Active," "Completed"). These should have low-saturation background tints of success-green or indigo-accent.
- **Winner Reveal Component:** A specialized component featuring a slight gradient background (Secondary to Tertiary) and "floating" typography to create a sense of celebration.
- **List Items:** Participant lists should use alternate row shading (Zebra striping) using the Neutral color to maintain readability in high-density data views.