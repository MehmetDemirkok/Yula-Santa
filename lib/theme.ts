export type Theme = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const AUTO_LIGHT_START_HOUR = 7;
export const AUTO_LIGHT_END_HOUR = 19;

/** Runs before paint in each root layout, so the page never flashes the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="system")t="auto";if(t!=="light"&&t!=="dark"){var h=new Date().getHours();t=(h>=${AUTO_LIGHT_START_HOUR}&&h<${AUTO_LIGHT_END_HOUR})?"light":"dark";}var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t;}catch(e){}})();`;

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
