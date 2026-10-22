export type Theme = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const AUTO_LIGHT_START_HOUR = 7;
export const AUTO_LIGHT_END_HOUR = 19;

export function getAutoTheme(date: Date = new Date()): ResolvedTheme {
    const hour = date.getHours();
    return hour >= AUTO_LIGHT_START_HOUR && hour < AUTO_LIGHT_END_HOUR ? "light" : "dark";
}

export function resolveTheme(theme: Theme, date: Date = new Date()): ResolvedTheme {
    return theme === "auto" ? getAutoTheme(date) : theme;
}

export function isTheme(value: string | null): value is Theme {
    return value === "light" || value === "dark" || value === "auto";
}
