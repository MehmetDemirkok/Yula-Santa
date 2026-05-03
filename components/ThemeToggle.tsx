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
                    bg-[rgba(225,210,205,0.4)] dark:bg-white/8
                    text-gray-600 dark:text-gray-300
                    hover:bg-santa-red/10 dark:hover:bg-santa-red/15
                    hover:text-santa-red dark:hover:text-gold
                    border border-[rgba(210,190,185,0.6)] dark:border-white/[0.08]
                    ${className}`}
                aria-label={t("toggle")}
            >
                {resolvedTheme === "dark" ? (
                    <Sun className="w-5 h-5 transition-transform duration-500 hover:rotate-45" />
                ) : (
                    <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
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
                    bg-[rgba(225,210,205,0.4)] dark:bg-white/8
                    text-gray-600 dark:text-gray-300
                    hover:bg-santa-red/10 dark:hover:bg-santa-red/15
                    hover:text-santa-red dark:hover:text-gold
                    border border-[rgba(210,190,185,0.6)] dark:border-white/[0.08]"
                aria-label={t("toggle")}
            >
                {resolvedTheme === "dark" ? (
                    <Moon className="w-5 h-5" />
                ) : (
                    <Sun className="w-5 h-5" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-[#1A1414]/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(100,35,25,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(225,210,205,0.6)] dark:border-white/[0.07] overflow-hidden z-50 animate-zoom-in">
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
