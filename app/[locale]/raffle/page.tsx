import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import ClientPage from './ClientPage';
import ToolSeoSection from '@/components/seo/ToolSeoSection';
import { getPageSeoCopy } from '@/lib/pageSeoCopy';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = getPageSeoCopy('raffle', locale);
    return getSEOMetadata({
        locale,
        path: '/raffle',
        titleOverride: copy.title,
        descriptionOverride: copy.description,
        keywordsOverride: locale === 'tr'
            ? ['isim çekilişi', 'rastgele isim seçici', 'kura çekme', 'ücretsiz kura çekme', 'online kura']
            : ['name picker', 'random name picker', 'online raffle'],
    });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <>
            <ClientPage />
            <ToolSeoSection locale={locale} kind="raffle" />
        </>
    );
}
