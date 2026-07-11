import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "flex h-11 sm:h-12 w-full rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-4 sm:px-6 py-2 text-base sm:text-lg text-[var(--text-primary)] ring-offset-white dark:ring-offset-gray-900 placeholder:text-[var(--text-muted)] focus:border-[var(--input-focus)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm dark:shadow-none",
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
