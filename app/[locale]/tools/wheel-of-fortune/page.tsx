
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { WheelClient } from "./WheelClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'tools.wheelOfFortuneMeta' });

    return {
        title: t('title'),
        description: t('description'),
        keywords: t.raw('keywords')
    };
}

export default function WheelPage() {
    return <WheelClient />;
}
