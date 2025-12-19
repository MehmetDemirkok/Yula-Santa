"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

export function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <LanguageSelector />
            {children}
        </LanguageProvider>
    );
}
