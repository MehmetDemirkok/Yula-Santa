import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { KeyRound } from 'lucide-react';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { ForgotPasswordForm } from '@/components/auth/EmailFlows';

export { viewport };

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({ locale, path: '/forgot-password', translationKey: 'auth.emails.forgotMeta', noIndex: true });
}

export default async function ForgotPasswordPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'auth' });
    return (
        <AuthPageShell icon={<KeyRound className="w-8 h-8" />} title={t('emails.forgotTitle')} subtitle={t('emails.forgotSubtitle')}>
            <ForgotPasswordForm />
        </AuthPageShell>
    );
}
