import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "../globals.css";
import "./admin.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { themeInitScript } from "@/lib/theme";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-jakarta",
    subsets: ["latin", "latin-ext"],
    weight: ["600", "700", "800"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    // Generic on purpose: this metadata also reaches the 404 response.
    title: "YulaSanta",
    robots: { index: false, follow: false, nocache: true },
};

// Sits outside app/[locale] so the panel has no public navbar, footer, ads or analytics.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <head>
                <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
