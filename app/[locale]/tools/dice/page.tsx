
import { Metadata } from 'next';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import DiceClient from './DiceClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/tools/dice',
        translationKey: 'tools.diceMeta'
    });
}

export default function Page() {
    return <DiceClient />;
}
