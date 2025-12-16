import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "flex h-12 w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-2 text-lg ring-offset-white placeholder:text-gray-400 focus:border-christmas-green focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm",
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
