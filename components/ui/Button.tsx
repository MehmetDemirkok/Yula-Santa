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
                    "cursor-pointer inline-flex items-center justify-center rounded-xl sm:rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-md hover:shadow-lg min-h-[44px]",
                    {
                        "bg-santa-red text-white hover:bg-[#b01e20] dark:hover:bg-red-600 focus:ring-santa-red": variant === "default",
                        "bg-christmas-green text-white hover:bg-[#114626] dark:hover:bg-green-600 focus:ring-christmas-green": variant === "secondary",
                        "border-2 border-gold text-gold hover:bg-gold hover:text-white dark:text-gold dark:hover:text-gray-900": variant === "outline",
                        "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 shadow-none hover:shadow-none": variant === "ghost",
                        "px-3 sm:px-4 py-2 text-xs sm:text-sm": size === "sm",
                        "px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base": size === "md",
                        "px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
