"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ThemeToggleProps {
    variant?: "icon" | "dropdown";
    className?: string;
}

export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("theme");

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (variant === "icon") {
        return (
            <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-300 
                    bg-gray-100 dark:bg-white/10 
                    text-gray-600 dark:text-gray-300 
                    hover:bg-gray-200 dark:hover:bg-white/20 
                    hover:text-santa-red dark:hover:text-gold
                    border border-gray-200 dark:border-white/10
                    ${className}`}
                aria-label={t("toggle")}
            >
                {resolvedTheme === "dark" ? (
                    <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
                ) : (
                    <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
                )}
            </button>
        );
    }

    // Dropdown variant
    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl transition-all duration-300 
                    bg-gray-100 dark:bg-white/10 
                    text-gray-600 dark:text-gray-300 
                    hover:bg-gray-200 dark:hover:bg-white/20 
                    hover:text-santa-red dark:hover:text-gold
                    border border-gray-200 dark:border-white/10"
                aria-label={t("toggle")}
            >
                {resolvedTheme === "dark" ? (
                    <Moon className="w-5 h-5" />
                ) : (
                    <Sun className="w-5 h-5" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-zoom-in">
                    <div className="p-2 space-y-1">
                        <ThemeOption
                            icon={<Sun className="w-4 h-4" />}
                            label={t("light")}
                            isActive={theme === "light"}
                            onClick={() => {
                                setTheme("light");
                                setIsOpen(false);
                            }}
                        />
                        <ThemeOption
                            icon={<Moon className="w-4 h-4" />}
                            label={t("dark")}
                            isActive={theme === "dark"}
                            onClick={() => {
                                setTheme("dark");
                                setIsOpen(false);
                            }}
                        />
                        <ThemeOption
                            icon={<Monitor className="w-4 h-4" />}
                            label={t("system")}
                            isActive={theme === "system"}
                            onClick={() => {
                                setTheme("system");
                                setIsOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface ThemeOptionProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

function ThemeOption({ icon, label, isActive, onClick }: ThemeOptionProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                    ? "bg-santa-red/10 dark:bg-santa-red/20 text-santa-red dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
        >
            <span className={isActive ? "text-santa-red dark:text-red-400" : ""}>{icon}</span>
            <span>{label}</span>
            {isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-santa-red dark:bg-red-400"></span>
            )}
        </button>
    );
}
