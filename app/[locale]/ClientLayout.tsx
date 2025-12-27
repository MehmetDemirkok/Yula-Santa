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

interface ClientLayoutProps {
    children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <>
            {/* Yılbaşı Teması - Kar, Konfeti (Countdown ayrı olarak sayfalarda gösterilecek) */}
            <NewYearTheme
                showSnowfall={true}
                showFireworks={false}
                showConfetti={true}
                showCountdown={false}
                showGlitter={true}
            />

            {/* Main Content */}
            {children}

            {/* Cookie Consent & Support */}
            <CookieConsent />
            <SupportButton />

            {/* Footer */}
            <Footer />

            {/* Analytics */}
            <Analytics />
        </>
    );
}
