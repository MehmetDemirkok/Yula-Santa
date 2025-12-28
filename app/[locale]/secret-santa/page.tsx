
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import ClientPage from './ClientPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getSEOMetadata({ locale, path: '/secret-santa', translationKey: 'home' });
}

export default async function Page() {
    return <ClientPage />;
}
