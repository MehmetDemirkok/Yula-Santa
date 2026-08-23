import { Suspense } from 'react';
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
        path: '/tiktok/extension',
        titleOverride: 'TikTok Chrome Extension ile Ücretsiz Yorum Çekilişi | YulaSanta',
        descriptionOverride:
            'YulaSanta Chrome Extension ile TikTok videonuzdaki yorumları kendi tarayıcınızda toplayın, ücretsiz ve adil kripto-güvenli kazanan seçin.',
    });
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-[60vh]" />}>
            <ClientPage />
        </Suspense>
    );
}
