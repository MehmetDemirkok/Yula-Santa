import { Printer, Users, EyeOff, FileUp, Wallet, Gift } from 'lucide-react';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
import { getClassroomCopy } from '@/lib/classroomSeoCopy';
import SantaLandingPage from '@/components/secretSanta/SantaLandingPage';
export { viewport };

const PATH = '/secret-santa/classroom';
const WHY_ICONS = [Printer, EyeOff, Users, FileUp, Wallet, Gift];

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const copy = getClassroomCopy(locale);
    return getSEOMetadata({
        locale,
        path: PATH,
        titleOverride: copy.metaTitle,
        descriptionOverride: copy.metaDescription,
        keywordsOverride: copy.keywords,
        ogImage: { path: locale === 'tr' ? '/og-secret-santa-tr.jpg' : '/og-secret-santa-en.jpg', width: 1200, height: 630 },
    });
}

/** Landing page for teachers: what the printable cards look like and how to run a class draw. */
export default async function ClassroomPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <SantaLandingPage
            locale={locale}
            path={PATH}
            copy={getClassroomCopy(locale)}
            badgeIcon={Printer}
            whyIcons={WHY_ICONS}
            howToExtras={{
                tool: [{ '@type': 'HowToTool', name: 'Printer' }],
                supply: [{ '@type': 'HowToSupply', name: 'A4 paper' }],
            }}
        />
    );
}
