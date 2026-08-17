import JsonLd from '@/components/seo/JsonLd';
import RelatedLinks from '@/components/seo/RelatedLinks';
import { SITE_URL } from '@/lib/constants';

type Kind = 'raffle' | 'secretSanta';

const COPY: Record<
    Kind,
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
                { path: '/secret-santa', label: 'Secret Santa yap' },
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
    secretSanta: {
        tr: {
            title: 'Online Secret Santa nasıl çalışır?',
            paragraphs: [
                'YulaSanta Secret Santa (gizli / yılbaşı çekilişi) katılımcıları rastgele eşler. Her kişi yalnızca kime hediye alacağını görür.',
                'Eşleşmeler tarayıcınızda tutulur; çekiliş sonrası herkes kendi adını seçerek sonucunu açar. En az 3 kişi gerekir. Kendine çıkma olmaz.',
            ],
            howToTitle: 'Secret Santa nasıl yapılır?',
            steps: [
                'Katılımcı isimlerini ekleyin (en az 3 kişi).',
                'Gizli çekilişi başlatın.',
                'Telefonu sırayla verin; herkes kendi adını seçip hediye alacağı kişiyi görsün.',
            ],
            faqTitle: 'Secret Santa SSS',
            faq: [
                {
                    q: 'Online Secret Santa ücretsiz mi?',
                    a: 'Evet. Kayıt veya e-posta zorunlu değildir.',
                },
                {
                    q: 'Birisi kendine çıkar mı?',
                    a: 'Hayır. Algoritma herkese başka birini atar.',
                },
                {
                    q: 'Sonuçlar sitede yayınlanır mı?',
                    a: 'Hayır. Eşleşmeler sizin tarayıcınızda saklanır; her katılımcı yalnızca kendi sonucunu görür.',
                },
            ],
            relatedTitle: 'İlgili araçlar',
            related: [
                { path: '/raffle', label: 'İsim çekilişi yap' },
                { path: '/tools/gift-suggestions', label: 'Hediye önerileri' },
                { path: '/youtube', label: 'YouTube çekilişi' },
            ],
        },
        en: {
            title: 'How online Secret Santa works',
            paragraphs: [
                'YulaSanta Secret Santa randomly matches participants. Each person only sees who they should buy a gift for.',
                'Matches stay in your browser. After the draw, everyone selects their own name to reveal their recipient. You need at least 3 people. Nobody is matched to themselves.',
            ],
            howToTitle: 'How to run Secret Santa',
            steps: [
                'Add participant names (at least 3).',
                'Start the secret draw.',
                'Pass the device around so each person opens only their own result.',
            ],
            faqTitle: 'Secret Santa FAQ',
            faq: [
                {
                    q: 'Is online Secret Santa free?',
                    a: 'Yes. No account or email is required.',
                },
                {
                    q: 'Can someone draw themselves?',
                    a: 'No. Everyone is assigned a different person.',
                },
                {
                    q: 'Are results published on the site?',
                    a: 'No. Matches stay in your browser. Each participant only sees their own recipient.',
                },
            ],
            relatedTitle: 'Related tools',
            related: [
                { path: '/raffle', label: 'Use the name picker' },
                { path: '/tools/gift-suggestions', label: 'Gift suggestions' },
                { path: '/youtube', label: 'YouTube giveaway' },
            ],
        },
    },
};

export default function ToolSeoSection({ locale, kind }: { locale: string; kind: Kind }) {
    const copy = COPY[kind][locale] || COPY[kind].en;
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
                name: copy.title,
                item: pageUrl,
            },
        ],
    };

    return (
        <section className="border-t border-[var(--border-light)] bg-[var(--surface-1)]">
            <JsonLd data={faqJsonLd} />
            <JsonLd data={howToJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 space-y-12">
                <div>
                    <h2 className="font-heading text-3xl tracking-tight text-[var(--text-primary)] mb-5 sm:text-[2rem]">
                        {copy.title}
                    </h2>
                    <div className="space-y-4 text-base text-[var(--text-secondary)] leading-relaxed">
                        {copy.paragraphs.map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-heading text-2xl tracking-tight text-[var(--text-primary)] mb-5">
                        {copy.howToTitle}
                    </h3>
                    <ol className="space-y-4">
                        {copy.steps.map((step, i) => (
                            <li key={step} className="flex gap-4 text-base text-[var(--text-secondary)]">
                                <span className="shrink-0 w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center bg-santa-red/10 text-santa-red">
                                    {i + 1}
                                </span>
                                <span className="pt-1.5 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
                <div>
                    <h3 className="font-heading text-2xl tracking-tight text-[var(--text-primary)] mb-5">
                        {copy.faqTitle}
                    </h3>
                    <div className="space-y-4">
                        {copy.faq.map((item) => (
                            <details
                                key={item.q}
                                className="group rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] px-5 py-4"
                            >
                                <summary className="cursor-pointer list-none font-bold text-[var(--text-primary)] pr-6 relative">
                                    {item.q}
                                    <span className="absolute right-0 top-0 text-[var(--text-muted)] group-open:rotate-45 transition-transform">
                                        +
                                    </span>
                                </summary>
                                <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
                <RelatedLinks locale={locale} title={copy.relatedTitle} items={copy.related} />
            </div>
        </section>
    );
}
