import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { DrawHistoryClient } from '@/components/drawHistory/DrawHistoryClient';

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
        path: '/account/draws',
        translationKey: 'drawHistory.meta',
        noIndex: true,
    });
}

/** Static shell; the session is read in the browser by DrawHistoryClient. */
export default async function DrawHistoryPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'drawHistory' });

    return (
        <main className="ys-page-shell px-4 pb-16 pt-[88px] sm:pt-[104px]">
            <div className="mx-auto max-w-3xl space-y-6">
                <header className="space-y-2">
                    <h1 className="font-heading text-headline-lg-mobile text-[var(--text-primary)] sm:text-headline-lg">{t('title')}</h1>
                    <p className="text-body-md text-[var(--text-secondary)]">{t('subtitle')}</p>
                </header>
                <DrawHistoryClient />
            </div>
        </main>
    );
}
