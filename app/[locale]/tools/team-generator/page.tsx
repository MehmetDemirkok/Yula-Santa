
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { TeamGeneratorClient } from "./TeamGeneratorClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'tools.teamGeneratorMeta' });

    return {
        title: t('title'),
        description: t('description'),
        keywords: t.raw('keywords')
    };
}

export default function TeamGeneratorPage() {
    return <TeamGeneratorClient />;
}
