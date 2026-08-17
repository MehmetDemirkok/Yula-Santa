
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import HomeClientPage from './HomeClientPage';
import HomeSeoSection from '@/components/seo/HomeSeoSection';
import { getPageSeoCopy } from '@/lib/pageSeoCopy';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = getPageSeoCopy('home', locale);
    return getSEOMetadata({
        locale,
        path: '',
        titleOverride: copy.title,
        descriptionOverride: copy.description,
    });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <>
            <HomeClientPage />
            <HomeSeoSection locale={locale} />
        </>
    );
}
