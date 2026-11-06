import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import ClientPage from './ClientPage';
import ToolSeoSection from '@/components/seo/ToolSeoSection';
import { getPageSeoCopy } from '@/lib/pageSeoCopy';
import { getTargetYear } from '@/components/NewYearTheme/config';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const copy = getPageSeoCopy('secretSanta', locale);
    return getSEOMetadata({
        locale,
        path: '/secret-santa',
        titleOverride: copy.title.replace('{year}', String(getTargetYear())),
        ogImage: { path: locale === 'tr' ? '/og-secret-santa-tr.jpg' : '/og-secret-santa-en.jpg', width: 1200, height: 630 },
        descriptionOverride: copy.description,
        keywordsOverride: locale === 'tr'
            ? [
                'yılbaşı hediye çekilişi',
                'yılbaşı çekilişi',
                'yılbaşı kurası',
                'isim çekme',
                'gizli noel baba',
                'online yılbaşı çekilişi',
                'yılbaşı çekilişi nasıl yapılır',
                'secret santa',
                'online secret santa',
                'gizli çekiliş',
                'gizli hediye çekilişi',
                'hediye çekilişi',
                'kura çekme',
                'sınıf yılbaşı çekilişi',
                'okul yılbaşı çekilişi',
                'ofis yılbaşı çekilişi',
                'noel çekilişi',
            ]
            : ['secret santa', 'online secret santa', 'gift exchange', 'holiday gift draw'],
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
