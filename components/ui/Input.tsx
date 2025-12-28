import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "flex h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 sm:px-6 py-2 text-base sm:text-lg text-gray-900 dark:text-white ring-offset-white dark:ring-offset-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-christmas-green dark:focus:border-gold focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm dark:shadow-none",
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
