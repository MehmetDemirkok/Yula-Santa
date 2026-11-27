import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { AccountClient } from '@/components/auth/AccountClient';

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
        path: '/account',
        translationKey: 'auth.accountPage.meta',
        noIndex: true,
    });
}

/** Static shell; the session is read in the browser by AccountClient. */
export default async function AccountPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'auth' });

    return (
        <main className="ys-page-shell px-4 pb-16 pt-[88px] sm:pt-[104px]">
            <div className="mx-auto max-w-5xl">
                {/* The profile card shows the title visually. */}
                <h1 className="sr-only">{t('accountPage.title')}</h1>
                <AccountClient />
            </div>
        </main>
    );
}
