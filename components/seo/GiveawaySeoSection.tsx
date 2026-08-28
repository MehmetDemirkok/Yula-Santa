import { getTranslations } from 'next-intl/server';
import JsonLd from '@/components/seo/JsonLd';
import RelatedLinks from '@/components/seo/RelatedLinks';
import { SITE_URL } from '@/lib/constants';

type Platform = 'tiktok' | 'youtube';

const HOME_LABELS: Record<string, string> = {
    tr: 'Ana Sayfa',
    en: 'Home',
    ar: 'الصفحة الرئيسية',
    de: 'Startseite',
    es: 'Inicio',
    fr: 'Accueil',
    it: 'Home',
    ja: 'ホーム',
    ko: '홈',
    pt: 'Início',
    ru: 'Главная',
    zh: '首页',
};

interface Props {
    locale: string;
    platform: Platform;
}

const RELATED: Record<Platform, Record<string, { title: string; items: { path: string; label: string }[] }>> = {
    youtube: {
        tr: {
            title: 'İlgili araçlar',
            items: [
                { path: '/tiktok', label: 'Ücretsiz TikTok yorum çekilişi yap' },
                { path: '/raffle', label: 'İsim çekilişi kullan' },
                { path: '/tools/wheel-of-fortune', label: 'Çarkıfelek çevir' },
            ],
        },
        en: {
            title: 'Related tools',
            items: [
                { path: '/tiktok', label: 'Run a TikTok comment giveaway' },
                { path: '/raffle', label: 'Use the name picker' },
                { path: '/tools/wheel-of-fortune', label: 'Spin the wheel' },
            ],
        },
        ar: {
            title: 'أدوات ذات صلة',
            items: [
                { path: '/tiktok', label: 'إجراء سحب تعليقات تيك توك' },
                { path: '/raffle', label: 'استخدام أداة سحب الأسماء' },
                { path: '/tools/wheel-of-fortune', label: 'تدوير عجلة الحظ' },
            ],
        },
        de: {
            title: 'Ähnliche Tools',
            items: [
                { path: '/tiktok', label: 'TikTok-Kommentar-Gewinnspiel starten' },
                { path: '/raffle', label: 'Namensgenerator verwenden' },
                { path: '/tools/wheel-of-fortune', label: 'Glücksrad drehen' },
            ],
        },
        es: {
            title: 'Herramientas relacionadas',
            items: [
                { path: '/tiktok', label: 'Hacer un sorteo de comentarios de TikTok' },
                { path: '/raffle', label: 'Usar el sorteador de nombres' },
                { path: '/tools/wheel-of-fortune', label: 'Girar la ruleta' },
            ],
        },
        fr: {
            title: 'Outils similaires',
            items: [
                { path: '/tiktok', label: 'Faire un tirage au sort de commentaires TikTok' },
                { path: '/raffle', label: 'Utiliser le tirage au sort de noms' },
                { path: '/tools/wheel-of-fortune', label: 'Faire tourner la roue' },
            ],
        },
        it: {
            title: 'Strumenti correlati',
            items: [
                { path: '/tiktok', label: "Fai un'estrazione commenti TikTok" },
                { path: '/raffle', label: "Usa l'estrattore di nomi" },
                { path: '/tools/wheel-of-fortune', label: 'Gira la ruota' },
            ],
        },
        ja: {
            title: '関連ツール',
            items: [
                { path: '/tiktok', label: 'TikTokコメント抽選を行う' },
                { path: '/raffle', label: '名前抽選ツールを使う' },
                { path: '/tools/wheel-of-fortune', label: 'ルーレットを回す' },
            ],
        },
        ko: {
            title: '관련 도구',
            items: [
                { path: '/tiktok', label: '틱톡 댓글 추첨하기' },
                { path: '/raffle', label: '이름 추첨기 사용하기' },
                { path: '/tools/wheel-of-fortune', label: '룰렛 돌리기' },
            ],
        },
        pt: {
            title: 'Ferramentas relacionadas',
            items: [
                { path: '/tiktok', label: 'Fazer um sorteio de comentários do TikTok' },
                { path: '/raffle', label: 'Usar o sorteador de nomes' },
                { path: '/tools/wheel-of-fortune', label: 'Girar a roleta' },
            ],
        },
        ru: {
            title: 'Похожие инструменты',
            items: [
                { path: '/tiktok', label: 'Провести розыгрыш по комментариям TikTok' },
                { path: '/raffle', label: 'Использовать генератор имён' },
                { path: '/tools/wheel-of-fortune', label: 'Крутить колесо фортуны' },
            ],
        },
        zh: {
            title: '相关工具',
            items: [
                { path: '/tiktok', label: '进行TikTok评论抽奖' },
                { path: '/raffle', label: '使用姓名抽奖工具' },
                { path: '/tools/wheel-of-fortune', label: '转动幸运转盘' },
            ],
        },
    },
    tiktok: {
        tr: {
            title: 'İlgili araçlar',
            items: [
                { path: '/youtube', label: 'YouTube yorum çekilişi yap' },
                { path: '/raffle', label: 'İsim çekilişi kullan' },
                { path: '/tools/wheel-of-fortune', label: 'Çarkıfelek çevir' },
            ],
        },
        en: {
            title: 'Related tools',
            items: [
                { path: '/youtube', label: 'Run a YouTube comment giveaway' },
                { path: '/raffle', label: 'Use the name picker' },
                { path: '/tools/wheel-of-fortune', label: 'Spin the wheel' },
            ],
        },
        ar: {
            title: 'أدوات ذات صلة',
            items: [
                { path: '/youtube', label: 'إجراء سحب تعليقات يوتيوب' },
                { path: '/raffle', label: 'استخدام أداة سحب الأسماء' },
                { path: '/tools/wheel-of-fortune', label: 'تدوير عجلة الحظ' },
            ],
        },
        de: {
            title: 'Ähnliche Tools',
            items: [
                { path: '/youtube', label: 'YouTube-Kommentar-Gewinnspiel starten' },
                { path: '/raffle', label: 'Namensgenerator verwenden' },
                { path: '/tools/wheel-of-fortune', label: 'Glücksrad drehen' },
            ],
        },
        es: {
            title: 'Herramientas relacionadas',
            items: [
                { path: '/youtube', label: 'Hacer un sorteo de comentarios de YouTube' },
                { path: '/raffle', label: 'Usar el sorteador de nombres' },
                { path: '/tools/wheel-of-fortune', label: 'Girar la ruleta' },
            ],
        },
        fr: {
            title: 'Outils similaires',
            items: [
                { path: '/youtube', label: 'Faire un tirage au sort de commentaires YouTube' },
                { path: '/raffle', label: 'Utiliser le tirage au sort de noms' },
                { path: '/tools/wheel-of-fortune', label: 'Faire tourner la roue' },
            ],
        },
        it: {
            title: 'Strumenti correlati',
            items: [
                { path: '/youtube', label: "Fai un'estrazione commenti YouTube" },
                { path: '/raffle', label: "Usa l'estrattore di nomi" },
                { path: '/tools/wheel-of-fortune', label: 'Gira la ruota' },
            ],
        },
        ja: {
            title: '関連ツール',
            items: [
                { path: '/youtube', label: 'YouTubeコメント抽選を行う' },
                { path: '/raffle', label: '名前抽選ツールを使う' },
                { path: '/tools/wheel-of-fortune', label: 'ルーレットを回す' },
            ],
        },
        ko: {
            title: '관련 도구',
            items: [
                { path: '/youtube', label: '유튜브 댓글 추첨하기' },
                { path: '/raffle', label: '이름 추첨기 사용하기' },
                { path: '/tools/wheel-of-fortune', label: '룰렛 돌리기' },
            ],
        },
        pt: {
            title: 'Ferramentas relacionadas',
            items: [
                { path: '/youtube', label: 'Fazer um sorteio de comentários do YouTube' },
                { path: '/raffle', label: 'Usar o sorteador de nomes' },
                { path: '/tools/wheel-of-fortune', label: 'Girar a roleta' },
            ],
        },
        ru: {
            title: 'Похожие инструменты',
            items: [
                { path: '/youtube', label: 'Провести розыгрыш по комментариям YouTube' },
                { path: '/raffle', label: 'Использовать генератор имён' },
                { path: '/tools/wheel-of-fortune', label: 'Крутить колесо фортуны' },
            ],
        },
        zh: {
            title: '相关工具',
            items: [
                { path: '/youtube', label: '进行YouTube评论抽奖' },
                { path: '/raffle', label: '使用姓名抽奖工具' },
                { path: '/tools/wheel-of-fortune', label: '转动幸运转盘' },
            ],
        },
    },
};

export default async function GiveawaySeoSection({ locale, platform }: Props) {
    const t = await getTranslations({ locale, namespace: `giveaway.seo.${platform}` });

    if (!t.has('contentTitle')) return null;

    const paragraphs = t.raw('contentParagraphs') as string[];
    const steps = t.raw('howToSteps') as string[];
    const faq = t.raw('faq') as Array<{ q: string; a: string }>;
    const related = RELATED[platform][locale] || RELATED[platform].en;
    const path = platform === 'youtube' ? '/youtube' : '/tiktok';
    const pageUrl = locale === 'tr' ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;

    const faqJsonLd =
        Array.isArray(faq) && faq.length > 0
            ? {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faq.map((item) => ({
                      '@type': 'Question',
                      name: item.q,
                      acceptedAnswer: { '@type': 'Answer', text: item.a },
                  })),
              }
            : null;

    const howToJsonLd = Array.isArray(steps) && steps.length > 0
        ? {
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: t('howToTitle'),
              step: steps.map((text, i) => ({
                  '@type': 'HowToStep',
                  position: i + 1,
                  text,
              })),
          }
        : null;

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: HOME_LABELS[locale] || HOME_LABELS.en,
                item: locale === 'tr' ? SITE_URL : `${SITE_URL}/${locale}`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: t('contentTitle'),
                item: pageUrl,
            },
        ],
    };

    return (
        <section className="border-t border-[var(--border-light)] bg-[var(--surface-1)]">
            {faqJsonLd && <JsonLd data={faqJsonLd} />}
            {howToJsonLd && <JsonLd data={howToJsonLd} />}
            <JsonLd data={breadcrumbJsonLd} />
            <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 space-y-12">
                <div>
                    <h2 className="font-heading text-3xl tracking-tight text-[var(--text-primary)] mb-5 sm:text-[2rem]">
                        {t('contentTitle')}
                    </h2>
                    <div className="space-y-4 text-base text-[var(--text-secondary)] leading-relaxed">
                        {paragraphs.map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-heading text-2xl tracking-tight text-[var(--text-primary)] mb-5">
                        {t('howToTitle')}
                    </h3>
                    <ol className="space-y-4">
                        {steps.map((step, i) => (
                            <li key={step} className="flex gap-4 text-base text-[var(--text-secondary)]">
                                <span className="shrink-0 w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center bg-santa-red/10 text-santa-red">
                                    {i + 1}
                                </span>
                                <span className="pt-1.5 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {Array.isArray(faq) && faq.length > 0 && (
                    <div>
                        <h3 className="font-heading text-2xl tracking-tight text-[var(--text-primary)] mb-5">
                            {t('faqTitle')}
                        </h3>
                        <div className="space-y-4">
                            {faq.map((item) => (
                                <details
                                    key={item.q}
                                    className="group rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] px-5 py-4"
                                >
                                    <summary className="cursor-pointer list-none font-bold text-[var(--text-primary)] pr-6 relative">
                                        {item.q}
                                        <span className="absolute right-0 top-0 text-[var(--text-muted)] group-open:rotate-45 transition-transform">+</span>
                                    </summary>
                                    <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                )}

                <RelatedLinks locale={locale} title={related.title} items={related.items} />
            </div>
        </section>
    );
}
