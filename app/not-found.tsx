/**
 * Global 404 — Markalı "Sayfa Bulunamadı" sayfası.
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Youtube, Home, Search } from "lucide-react";

const LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'ja', 'ko', 'zh'];

const T: Record<string, { title: string; desc: string; home: string; draw: string }> = {
    tr: { title: 'Sayfa Bulunamadı', desc: 'Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.', home: 'Ana Sayfa', draw: 'YouTube Çekilişi' },
    en: { title: 'Page Not Found', desc: 'The page you are looking for may have moved or never existed.', home: 'Home', draw: 'YouTube Giveaway' },
    de: { title: 'Seite nicht gefunden', desc: 'Die gesuchte Seite wurde möglicherweise verschoben oder existierte nie.', home: 'Startseite', draw: 'YouTube-Verlosung' },
    fr: { title: 'Page introuvable', desc: 'La page que vous recherchez a peut-être été déplacée ou n’a jamais existé.', home: 'Accueil', draw: 'Tirage YouTube' },
    es: { title: 'Página no encontrada', desc: 'La página que buscas pudo haberse movido o nunca existió.', home: 'Inicio', draw: 'Sorteo de YouTube' },
    it: { title: 'Pagina non trovata', desc: 'La pagina che cerchi potrebbe essere stata spostata o non è mai esistita.', home: 'Home', draw: 'Giveaway YouTube' },
    pt: { title: 'Página não encontrada', desc: 'A página que procura pode ter sido movida ou nunca existiu.', home: 'Início', draw: 'Sorteio YouTube' },
    ru: { title: 'Страница не найдена', desc: 'Запрашиваемая страница могла быть перемещена или никогда не существовала.', home: 'Главная', draw: 'Розыгрыш YouTube' },
    ar: { title: 'الصفحة غير موجودة', desc: 'قد تكون الصفحة التي تبحث عنها قد نُقلت أو لم تكن موجودة أصلاً.', home: 'الرئيسية', draw: 'سحب يوتيوب' },
    ja: { title: 'ページが見つかりません', desc: 'お探しのページは移動したか、存在しない可能性があります。', home: 'ホーム', draw: 'YouTube抽選' },
    ko: { title: '페이지를 찾을 수 없습니다', desc: '찾으시는 페이지가 이동되었거나 존재하지 않을 수 있습니다.', home: '홈', draw: 'YouTube 추첨' },
    zh: { title: '页面未找到', desc: '您要查找的页面可能已被移动或从未存在。', home: '首页', draw: 'YouTube抽奖' },
};

export default function NotFound() {
    const pathname = usePathname();
    const seg = pathname?.split('/').filter(Boolean)[0];
    const locale = seg && LOCALES.includes(seg) ? seg : 'tr';
    const t = T[locale] || T.tr;
    const homeHref = locale === 'tr' ? '/' : `/${locale}`;
    const youtubeHref = `${homeHref === '/' ? '' : homeHref}/youtube`;

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <body className="antialiased">
                <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-[#FFF5F5] to-white dark:from-gray-950 dark:to-gray-900">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-200/40 dark:bg-red-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-green-200/40 dark:bg-green-500/10 rounded-full blur-[100px]" />

                    <div className="relative z-10 max-w-md">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white dark:bg-gray-800 shadow-xl ring-4 ring-white dark:ring-gray-700 mb-6">
                            <Search className="w-10 h-10 text-santa-red" />
                        </div>
                        <p className="text-7xl sm:text-8xl font-black text-santa-red/90 mb-2 tracking-tight">404</p>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">{t.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{t.desc}</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href={homeHref}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-santa-red hover:bg-red-600 text-white font-bold rounded-full shadow-lg transition-all hover:-translate-y-0.5"
                            >
                                <Home className="w-5 h-5" /> {t.home}
                            </Link>
                            <Link
                                href={youtubeHref}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-full shadow-sm transition-all hover:-translate-y-0.5"
                            >
                                <Youtube className="w-5 h-5 text-santa-red" /> {t.draw}
                            </Link>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
