"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
        setMounted(true);
    }, []);

    // Apply theme and update resolvedTheme
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateTheme = () => {
            const root = document.documentElement;
            let current: "light" | "dark";

            if (theme === "system") {
                current = mediaQuery.matches ? "dark" : "light";
            } else {
                current = theme as "light" | "dark";
            }

            setResolvedTheme(current);

            if (current === "dark") {
                root.classList.add("dark");
                root.style.colorScheme = "dark";
            } else {
                root.classList.remove("dark");
                root.style.colorScheme = "light";
            }
        };

        updateTheme();
        mediaQuery.addEventListener("change", updateTheme);
        return () => mediaQuery.removeEventListener("change", updateTheme);
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
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
