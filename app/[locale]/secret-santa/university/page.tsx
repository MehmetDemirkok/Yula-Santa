import { notFound } from 'next/navigation';
import { GraduationCap, Smartphone, Wallet, Ban, FileUp, Lightbulb, Gift } from 'lucide-react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { LANDING_LOCALES, UNIVERSITY_SEO_COPY } from '@/lib/officeUniversitySeoCopy';
import SantaLandingPage from '@/components/secretSanta/SantaLandingPage';
export { viewport };

const PATH = '/secret-santa/university';
const WHY_ICONS = [Smartphone, Wallet, Ban, FileUp, Lightbulb, Gift];

// Only Turkish and English copy exists; other locales 404 instead of showing English under /de/...
export const dynamicParams = false;

export function generateStaticParams() {
    return LANDING_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = UNIVERSITY_SEO_COPY[locale];
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

export default async function UniversityPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = UNIVERSITY_SEO_COPY[locale];
    if (!copy) notFound();
    return <SantaLandingPage locale={locale} path={PATH} copy={copy} badgeIcon={GraduationCap} whyIcons={WHY_ICONS} />;
}
