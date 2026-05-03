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
                    "rounded-xl sm:rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "dark:focus-visible:ring-offset-[#100C0C]",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "active:scale-[0.97]",
                    "min-h-[44px] select-none",

                    // Variants
                    variant === "default" && [
                        "bg-santa-red text-white shadow-md hover:shadow-lg",
                        "hover:brightness-110",
                        "focus-visible:ring-santa-red",
                    ],
                    variant === "secondary" && [
                        "bg-christmas-green text-white shadow-md hover:shadow-lg",
                        "hover:brightness-110",
                        "focus-visible:ring-christmas-green",
                    ],
                    variant === "outline" && [
                        "border-2 border-current text-gold hover:bg-gold hover:text-white",
                        "dark:text-gold dark:hover:text-gray-900 shadow-sm hover:shadow-md",
                        "focus-visible:ring-gold",
                    ],
                    variant === "ghost" && [
                        "text-gray-700 dark:text-gray-300",
                        "hover:bg-gray-100 dark:hover:bg-white/10",
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
