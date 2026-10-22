"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { resolveTheme, isTheme, THEME_STORAGE_KEY, Theme, ResolvedTheme } from "@/lib/theme";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("auto");
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage ("system" is the legacy auto value)
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (isTheme(savedTheme)) {
                setThemeState(savedTheme);
            } else if (savedTheme === "system") {
                setThemeState("auto");
            }
        } catch {
            // localStorage may be unavailable (private mode); fall back to auto
        }
        setMounted(true);
    }, []);

    // Apply theme and update resolvedTheme
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        let lastApplied: ResolvedTheme | null = null;

        const updateTheme = () => {
            const current = resolveTheme(theme);
            if (current === lastApplied) return;
            lastApplied = current;

            setResolvedTheme(current);
            root.classList.toggle("dark", current === "dark");
            root.style.colorScheme = current;
        };

        updateTheme();

        if (theme !== "auto") return;

        // Re-evaluate while the page stays open so 07:00 / 19:00 switches happen live
        const interval = window.setInterval(updateTheme, 30_000);
        const handleVisibility = () => {
            if (!document.hidden) updateTheme();
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", updateTheme);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", updateTheme);
        };
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch {
            // ignore storage failures
        }
    };

    const toggleTheme = () => {
        // resolvedTheme üzerinden değil, o anki duruma göre tersini seç
        const next = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(next);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
