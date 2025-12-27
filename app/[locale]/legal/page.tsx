
import { getSEOMetadata } from '@/lib/seo';
import LegalClient from './ClientPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getSEOMetadata({ locale, path: '/legal', translationKey: 'legal' });
}

export default async function Page() {
    return <LegalClient />;
}
