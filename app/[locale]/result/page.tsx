import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import ClientPage from './ClientPage';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/result',
        titleOverride: locale === 'tr' ? 'Çekiliş Sonucu | YulaSanta' : 'Draw Result | YulaSanta',
        descriptionOverride:
            locale === 'tr'
                ? 'Secret Santa eşleşmenizi görüntüleyin.'
                : 'View your Secret Santa match.',
        noIndex: true,
    });
}

export default function Page() {
    return <ClientPage />;
}
