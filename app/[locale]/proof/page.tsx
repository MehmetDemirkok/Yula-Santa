import { Suspense } from "react";
import { getSEOMetadata, viewport } from "@/lib/seo";
import { locales } from "@/i18n/config";
export { viewport };
import ClientPage from "./ClientPage";

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: "/proof",
        titleOverride: locale === "tr" ? "Çekiliş Kanıtı | YulaSanta" : "Draw Proof | YulaSanta",
        descriptionOverride:
            locale === "tr"
                ? "YulaSanta adil çekiliş kanıtını görüntüleyin."
                : "View a YulaSanta fair draw proof.",
        noIndex: true,
    });
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-[50vh]" />}>
            <ClientPage />
        </Suspense>
    );
}
