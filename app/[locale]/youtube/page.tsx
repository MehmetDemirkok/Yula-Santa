
import { getSEOMetadata } from '@/lib/seo';
import ClientPage from './ClientPage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'giveaway' });

    return getSEOMetadata({
        locale,
        path: '/youtube',
        titleOverride: t('youtubeTitle'),
        descriptionOverride: t('youtubeDesc')
    });
}

export default async function Page() {
    return <ClientPage />;
}
