import { getTranslations } from 'next-intl/server';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
import ClientPage from './ClientPage';
export { viewport };

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

/**
 * Personal Secret Santa link. The match lives in the URL fragment, which never
 * reaches the server, so this page is static and its metadata (and the
 * WhatsApp link preview built from it) is the same for everyone.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'santa' });
    return getSEOMetadata({
        locale,
        path: '/s',
        titleOverride: t('metaTitle'),
        descriptionOverride: t('metaDescription'),
        ogImage: { path: locale === 'tr' ? '/og-secret-santa-tr.jpg' : '/og-secret-santa-en.jpg', width: 1200, height: 630 },
        noIndex: true,
    });
}

export default function Page() {
    return <ClientPage />;
}
