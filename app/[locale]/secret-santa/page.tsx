import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import ClientPage from './ClientPage';
import ToolSeoSection from '@/components/seo/ToolSeoSection';
import { getPageSeoCopy } from '@/lib/pageSeoCopy';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const copy = getPageSeoCopy('secretSanta', locale);
    return getSEOMetadata({
        locale,
        path: '/secret-santa',
        titleOverride: copy.title,
        descriptionOverride: copy.description,
        keywordsOverride: locale === 'tr'
            ? ['secret santa', 'online secret santa', 'yılbaşı çekilişi', 'gizli çekiliş']
            : ['secret santa', 'online secret santa', 'gift exchange'],
    });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <>
            <ClientPage />
            <ToolSeoSection locale={locale} kind="secretSanta" />
        </>
    );
}
