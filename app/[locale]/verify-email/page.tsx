import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { MailCheck } from 'lucide-react';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { VerifyEmailStatus } from '@/components/auth/EmailFlows';

export { viewport };

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({ locale, path: '/verify-email', translationKey: 'auth.emails.verifyMeta', noIndex: true });
}

export default async function VerifyEmailPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'auth' });
    return (
        <AuthPageShell icon={<MailCheck className="w-8 h-8" />} title={t('emails.verifyTitle')}>
            <Suspense fallback={<div aria-hidden className="ys-card h-[160px]" />}>
                <VerifyEmailStatus />
            </Suspense>
        </AuthPageShell>
    );
}
