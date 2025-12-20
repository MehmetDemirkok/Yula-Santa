"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CookieConsent } from "@/components/CookieConsent";
import { SupportButton } from "@/components/SupportButton";

export function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <LanguageSelector />
            {children}
            <SupportButton />
            <CookieConsent />
        </LanguageProvider>
    );
}
