/**
 * Root Layout - Minimal
 * 
 * This is the absolute root layout. 
 * Most content is rendered inside /app/[locale]/layout.tsx
 */

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
