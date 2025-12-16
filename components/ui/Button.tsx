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
                    "cursor-pointer inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-md hover:shadow-lg",
                    {
                        "bg-santa-red text-white hover:bg-[#b01e20] focus:ring-santa-red": variant === "default",
                        "bg-christmas-green text-white hover:bg-[#114626] focus:ring-christmas-green": variant === "secondary",
                        "border-2 border-gold text-gold hover:bg-gold hover:text-white": variant === "outline",
                        "hover:bg-gray-100 text-gray-700 shadow-none hover:shadow-none": variant === "ghost",
                        "px-4 py-2 text-sm": size === "sm",
                        "px-8 py-3 text-base": size === "md",
                        "px-10 py-4 text-lg": size === "lg",
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
