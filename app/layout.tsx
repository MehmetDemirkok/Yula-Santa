/**
 * Root Layout - Minimal
 * 
 * This is the absolute root layout.
 * For locale pages: /app/[locale]/layout.tsx handles html/body
 * For tools pages: this layout provides html/body
 */

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Children will be either [locale]/layout.tsx (with its own html/body)
  // or other pages that need wrapping
  return children;
}
