import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    // Base
                    "cursor-pointer inline-flex items-center justify-center font-bold transition-all duration-200",
                    "rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "dark:focus-visible:ring-offset-[#121316]",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "active:scale-[0.97]",
                    "min-h-[44px] select-none",

                    // Variants — see design.md "Components" section
                    variant === "default" && [
                        // Primary: solid red, white text, subtle 1px inner light border
                        "bg-santa-red text-white border border-white/15",
                        "shadow-[0_4px_16px_rgba(182,23,34,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]",
                        "hover:shadow-[0_8px_24px_rgba(182,23,34,0.32),inset_0_1px_0_rgba(255,255,255,0.25)]",
                        "hover:brightness-110",
                        "focus-visible:ring-santa-red",
                    ],
                    variant === "secondary" && [
                        // Secondary: light indigo tint
                        "bg-indigo-accent/10 text-indigo-accent border border-indigo-accent/25",
                        "hover:bg-indigo-accent/15 shadow-sm hover:shadow-md",
                        "focus-visible:ring-indigo-accent",
                    ],
                    variant === "outline" && [
                        "border-2 border-current text-gold hover:bg-gold hover:text-white",
                        "dark:text-gold dark:hover:text-gray-900 shadow-sm hover:shadow-md",
                        "focus-visible:ring-gold",
                    ],
                    variant === "ghost" && [
                        "text-[var(--text-secondary)]",
                        "hover:bg-[var(--surface-2)]",
                        "shadow-none hover:shadow-none",
                        "focus-visible:ring-gray-400",
                    ],

                    // Sizes
                    size === "sm" && "px-3 sm:px-4 py-1.5 text-xs sm:text-sm gap-1",
                    size === "md" && "px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base gap-1.5",
                    size === "lg" && "px-7 sm:px-10 py-3 sm:py-4 text-base sm:text-lg gap-2",

                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
