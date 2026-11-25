import { notFound } from 'next/navigation';
import { Briefcase, FileUp, Users, Link2, CalendarDays, Globe, Gift } from 'lucide-react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { LANDING_LOCALES, OFFICE_SEO_COPY } from '@/lib/officeUniversitySeoCopy';
import SantaLandingPage from '@/components/secretSanta/SantaLandingPage';
export { viewport };

const PATH = '/secret-santa/office';
const WHY_ICONS = [FileUp, Users, Link2, CalendarDays, Globe, Gift];

// Only Turkish, English and Russian copy exists (LANDING_LOCALES); other locales 404 instead of showing English under /de/...
export const dynamicParams = false;

export function generateStaticParams() {
    return LANDING_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = OFFICE_SEO_COPY[locale];
    if (!copy) return {};
    return getSEOMetadata({
        locale,
        path: PATH,
        titleOverride: copy.metaTitle,
        descriptionOverride: copy.metaDescription,
        keywordsOverride: copy.keywords,
        alternateLocales: LANDING_LOCALES,
        ogImage: { path: locale === 'tr' ? '/og-secret-santa-tr.jpg' : '/og-secret-santa-en.jpg', width: 1200, height: 630 },
    });
}

export default async function OfficePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = OFFICE_SEO_COPY[locale];
    if (!copy) notFound();
    return <SantaLandingPage locale={locale} path={PATH} copy={copy} badgeIcon={Briefcase} whyIcons={WHY_ICONS} />;
}
