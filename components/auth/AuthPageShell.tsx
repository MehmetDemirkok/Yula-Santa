import type { ReactNode } from "react";

/** Shared static frame for the small account pages (forgot / reset password, verify e-mail). */
export function AuthPageShell({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle?: string; children: ReactNode }) {
    return (
        <main className="ys-page-shell py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-santa-red/10 dark:bg-santa-red/20 rounded-2xl mb-5 text-santa-red">
                        {icon}
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)]">{title}</h1>
                    {subtitle && <p className="mt-3 text-body-md text-[var(--text-secondary)]">{subtitle}</p>}
                </div>
                {children}
            </div>
        </main>
    );
}
