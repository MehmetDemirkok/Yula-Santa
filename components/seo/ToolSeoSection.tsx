import { getTranslations } from 'next-intl/server';
import JsonLd from '@/components/seo/JsonLd';
import SeoContent from '@/components/seo/SeoContent';
import { SITE_URL } from '@/lib/constants';
import { SECRET_SANTA_SEO_COPY } from '@/lib/secretSantaSeoCopy';

type Kind = 'raffle' | 'secretSanta';

const RAFFLE_COPY_BY_KIND: Record<
    'raffle',
    Record<
        string,
        {
            title: string;
            paragraphs: string[];
            howToTitle: string;
            steps: string[];
            faqTitle: string;
            faq: { q: string; a: string }[];
            relatedTitle: string;
            related: { path: string; label: string }[];
        }
    >
> = {
    raffle: {
        tr: {
            title: 'Ücretsiz isim çekilişi ve kura çekme',
            paragraphs: [
                'YulaSanta isim çekilişi ile listenizdeki isimler arasından adil kazanan ve yedek seçin. Kayıt yok, şifre yok — tarayıcınızda rastgele seçim yapılır.',
                'Sınıf, ofis, yayın veya arkadaş grubu için kura çekmek istiyorsanız isimleri tek tek veya toplu ekleyin. Çekiliş, kriptografik rastgelelik ile her isme eşit şans verir.',
            ],
            howToTitle: 'İsim çekilişi nasıl yapılır?',
            steps: [
                'Katılımcı isimlerini yazın veya Excel/PDF listesini yükleyin.',
                'Kazanan ve yedek sayısını seçin.',
                'Çekilişi başlatın ve sonucu paylaşın.',
            ],
            faqTitle: 'İsim çekilişi SSS',
            faq: [
                {
                    q: 'İsim çekilişi ücretsiz mi?',
                    a: 'Evet. YulaSanta isim çekilişi kayıtsız ve ücretsizdir.',
                },
                {
                    q: 'Seçim adil mi?',
                    a: 'Evet. Kazananlar tarayıcıda kriptografik rastgele sayı ve Fisher–Yates karıştırması ile seçilir; her ismin şansı eşittir.',
                },
                {
                    q: 'Instagram yorumlarından çekiliş yapabilir miyim?',
                    a: 'Otomatik Instagram yorum çekme yoktur. Yorumlardaki kullanıcı adlarını kopyalayıp bu isim çekilişine yapıştırabilirsiniz.',
                },
            ],
            relatedTitle: 'İlgili araçlar',
            related: [
                { path: '/tools/wheel-of-fortune', label: 'Çarkıfelek kullan' },
                { path: '/youtube', label: 'YouTube yorum çekilişi' },
                { path: '/tiktok', label: 'TikTok yorum çekilişi' },
                { path: '/secret-santa', label: 'Yılbaşı çekilişi yap' },
            ],
        },
        en: {
            title: 'Free name picker and raffle',
            paragraphs: [
                'Pick fair winners and backups from any name list. No signup, no password — the draw runs in your browser.',
                'Add names one by one or upload a list. Selection uses cryptographic randomness so every name has an equal chance.',
            ],
            howToTitle: 'How to run a name raffle',
            steps: [
                'Enter names or upload an Excel/PDF list.',
                'Choose how many winners and backups you need.',
                'Start the draw and share the result.',
            ],
            faqTitle: 'Name picker FAQ',
            faq: [
                {
                    q: 'Is the name picker free?',
                    a: 'Yes. YulaSanta name raffles are free and do not require an account.',
                },
                {
                    q: 'Is the draw fair?',
                    a: 'Yes. Winners are chosen with cryptographic randomness and a Fisher–Yates shuffle in your browser.',
                },
                {
                    q: 'Can I import Instagram comments?',
                    a: 'There is no automatic Instagram import. You can paste usernames from comments into this name picker.',
                },
            ],
            relatedTitle: 'Related tools',
            related: [
                { path: '/tools/wheel-of-fortune', label: 'Spin the wheel' },
                { path: '/youtube', label: 'YouTube comment giveaway' },
                { path: '/tiktok', label: 'TikTok comment giveaway' },
                { path: '/secret-santa', label: 'Run Secret Santa' },
            ],
        },
    },
};

export default async function ToolSeoSection({ locale, kind }: { locale: string; kind: Kind }) {
    const tSeo = await getTranslations({ locale, namespace: 'home.seo' });
    const santa = kind === 'secretSanta' ? SECRET_SANTA_SEO_COPY[locale] || SECRET_SANTA_SEO_COPY.en : null;
    const copy = santa || RAFFLE_COPY_BY_KIND.raffle[locale] || RAFFLE_COPY_BY_KIND.raffle.en;
    const pageUrl =
        locale === 'tr'
            ? `${SITE_URL}${kind === 'raffle' ? '/raffle' : '/secret-santa'}`
            : `${SITE_URL}/${locale}${kind === 'raffle' ? '/raffle' : '/secret-santa'}`;

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: copy.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
    };

    const howToJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: copy.howToTitle,
        step: copy.steps.map((text, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            text,
        })),
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: locale === 'tr' ? 'Ana Sayfa' : 'Home',
                item: locale === 'tr' ? SITE_URL : `${SITE_URL}/${locale}`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: santa?.pageName || copy.title,
                item: pageUrl,
            },
        ],
    };

    const webAppJsonLd = santa
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: santa.pageName,
            description: santa.paragraphs[0],
            url: pageUrl,
            applicationCategory: 'EntertainmentApplication',
            operatingSystem: 'Web',
            browserRequirements: 'Requires JavaScript',
            isAccessibleForFree: true,
            inLanguage: locale,
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'TRY',
            },
        }
        : null;

    return (
        <section className="border-t border-[var(--border-light)] bg-[var(--surface-1)]">
            <JsonLd data={faqJsonLd} />
            <JsonLd data={howToJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            {webAppJsonLd && <JsonLd data={webAppJsonLd} />}
            <SeoContent
                locale={locale}
                title={copy.title}
                paragraphs={copy.paragraphs}
                readMore={tSeo('readMore')}
                featuresTitle={santa?.featuresTitle}
                features={santa?.features}
                howToTitle={copy.howToTitle}
                steps={copy.steps}
                faqTitle={copy.faqTitle}
                faq={copy.faq}
                relatedTitle={copy.relatedTitle}
                related={copy.related}
            />
        </section>
    );
}
