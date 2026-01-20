
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };
import { TeamGeneratorClient } from "./TeamGeneratorClient";

// Generate static paths for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/team-generator',
        translationKey: 'tools.teamGeneratorMeta'
    });
}

export default function TeamGeneratorPage() {
    return <TeamGeneratorClient />;
}
