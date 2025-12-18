import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YulaSanta - Online Yılbaşı Çekilişi Yap",
  description: "Arkadaşlarınızla, ailenizle veya iş arkadaşlarınızla saniyeler içinde ücretsiz, reklamsız ve üyeliksiz online yılbaşı çekilişi yapın! Secret Santa organizasyonunuzu kolayca yönetin.",
  keywords: ["yılbaşı çekilişi", "secret santa", "hediye çekilişi", "online çekiliş", "yulasanta", "yılbaşı hediyesi", "çekiliş yap"],
  authors: [{ name: "YulaSanta Team" }],
  creator: "YulaSanta Team",
  publisher: "YulaSanta",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://yulasanta.com",
    title: "YulaSanta - Online Yılbaşı Çekilişi",
    description: "Arkadaşlarınızla yılbaşı hediye çekilişi yapmanın en kolay yolu.",
    siteName: "YulaSanta",
  },
  twitter: {
    card: "summary_large_image",
    title: "YulaSanta - Online Yılbaşı Çekilişi",
    description: "Arkadaşlarınızla yılbaşı hediye çekilişi yapmanın en kolay yolu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
