
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import GiftSuggestionsClient from './GiftSuggestionsClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/gift-suggestions',
        translationKey: 'tools.giftSuggestionsMeta'
    });
}

export default function Page() {
    return <GiftSuggestionsClient />;
}
