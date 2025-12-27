import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Araçlar | YulaSanta",
    description: "YulaSanta ücretsiz online araçlar - Zar atma, yazı tura, rastgele sayı seçici ve daha fazlası.",
};

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
                <div className="min-h-screen">
                    {children}
                </div>
            </body>
        </html>
    );
}
