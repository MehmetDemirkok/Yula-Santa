
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import ClientPage from './ClientPage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'giveaway' });

    return getSEOMetadata({
        locale,
        path: '/twitter',
        translationKey: 'giveaway.meta.twitter'
    });
}

export default async function Page() {
    return <ClientPage />;
}
