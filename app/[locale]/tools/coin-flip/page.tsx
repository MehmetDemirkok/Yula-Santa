
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import CoinFlipClient from './CoinFlipClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/coin-flip',
        translationKey: 'tools.coinFlipMeta'
    });
}

export default function Page() {
    return <CoinFlipClient />;
}
