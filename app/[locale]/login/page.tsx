/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Login Page - Giriş Yap
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { LogIn } from 'lucide-react';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { LoginForm } from '@/components/auth/LoginForm';

export { viewport };

type Props = {
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/login',
        translationKey: 'auth.login.meta',
        noIndex: true,
    });
}

export default async function LoginPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'auth' });

    return (
        <main className="ys-page-shell py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-santa-red/10 dark:bg-santa-red/20 rounded-2xl mb-6">
                        <LogIn className="w-8 h-8 text-santa-red" />
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] mb-3">
                        {t('login.title')}
                    </h1>
                    <p className="text-body-md text-[var(--text-secondary)]">
                        {t('login.subtitle')}
                    </p>
                </div>

                <div className="ys-card p-6 sm:p-8">
                    <LoginForm />
                </div>
            </div>
        </main>
    );
}
