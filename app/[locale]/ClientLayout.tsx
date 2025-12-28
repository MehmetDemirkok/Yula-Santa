/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Client Layout Wrapper
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bu bileşen client-side komponentleri (NewYearTheme gibi) içeren bir wrapper.
 * Server component olan layout.tsx'ten çağrılır.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { NewYearTheme } from "@/components/NewYearTheme";
import { CookieConsent } from "@/components/CookieConsent";
import { SupportButton } from "@/components/SupportButton";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/lib/ThemeContext";

interface ClientLayoutProps {
    children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <ThemeProvider>
            {/* Yılbaşı Teması - Kar, Konfeti (Countdown ayrı olarak sayfalarda gösterilecek) */}
            <NewYearTheme
                showSnowfall={true}
                showFireworks={false}
                showConfetti={true}
                showCountdown={false}
                showGlitter={true}
            />

            {/* Navbar - Fixed at top */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col pt-14 sm:pt-16 lg:pt-20">
                <div className="flex-1">
                    {children}
                </div>

                {/* Footer is part of the scrollable content or fixed? 
                    Usually it's at the end of content. If it needs to be 'fixed' like Navbar, 
                    we would move it out. But here we keep it in the flex flow to scroll with content 
                    while Navbar stays fixed. This is the most professional 'sabit' layout. */}
                <Footer />
            </main>

            {/* Cookie Consent & Support */}
            <CookieConsent />
            <SupportButton />

            {/* Analytics */}
            <Analytics />
        </ThemeProvider>
    );
}
