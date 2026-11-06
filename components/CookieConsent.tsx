"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getConsent, setConsent } from '@/lib/analytics/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CookieConsentTranslations {
    title: string;
    description: string;
    accept: string;
    decline: string;
    learnMore: string;
}

const cookieTranslations: Record<string, CookieConsentTranslations> = {
    tr: {
        title: 'Çerez Kullanımı 🍪',
        description: 'Size daha iyi bir deneyim sunmak, siteyi nasıl kullandığınızı ölçmek ve reklamları kişiselleştirmek için çerezleri ve anonim bir ziyaretçi kimliğini kullanıyoruz.',
        accept: 'Kabul Et',
        decline: 'Reddet',
        learnMore: 'Daha Fazla Bilgi'
    },
    en: {
        title: 'Cookie Usage 🍪',
        description: 'We use cookies and an anonymous visitor ID to provide a better experience, measure how the site is used and personalize ads.',
        accept: 'Accept',
        decline: 'Decline',
        learnMore: 'Learn More'
    },
    de: {
        title: 'Cookie-Nutzung 🍪',
        description: 'Wir verwenden Cookies und eine anonyme Besucher-ID, um ein besseres Erlebnis zu bieten, die Nutzung der Website zu messen und Werbung zu personalisieren.',
        accept: 'Akzeptieren',
        decline: 'Ablehnen',
        learnMore: 'Mehr erfahren'
    },
    fr: {
        title: 'Utilisation des cookies 🍪',
        description: 'Nous utilisons des cookies et un identifiant de visiteur anonyme pour offrir une meilleure expérience, mesurer l\'utilisation du site et personnaliser les publicités.',
        accept: 'Accepter',
        decline: 'Refuser',
        learnMore: 'En savoir plus'
    },
    es: {
        title: 'Uso de cookies 🍪',
        description: 'Usamos cookies y un identificador anónimo de visitante para ofrecer una mejor experiencia, medir el uso del sitio y personalizar los anuncios.',
        accept: 'Aceptar',
        decline: 'Rechazar',
        learnMore: 'Más información'
    },
    it: {
        title: 'Utilizzo dei cookie 🍪',
        description: 'Utilizziamo i cookie e un ID visitatore anonimo per offrire un\'esperienza migliore, misurare l\'uso del sito e personalizzare gli annunci.',
        accept: 'Accetta',
        decline: 'Rifiuta',
        learnMore: 'Scopri di più'
    },
    pt: {
        title: 'Uso de cookies 🍪',
        description: 'Usamos cookies e um ID de visitante anónimo para oferecer uma melhor experiência, medir a utilização do site e personalizar anúncios.',
        accept: 'Aceitar',
        decline: 'Recusar',
        learnMore: 'Saiba mais'
    },
    ru: {
        title: 'Использование cookie 🍪',
        description: 'Мы используем cookie и анонимный идентификатор посетителя, чтобы улучшать работу сайта, измерять его использование и персонализировать рекламу.',
        accept: 'Принять',
        decline: 'Отклонить',
        learnMore: 'Узнать больше'
    },
    ar: {
        title: 'استخدام ملفات تعريف الارتباط 🍪',
        description: 'نستخدم ملفات تعريف الارتباط ومعرّف زائر مجهول لتقديم تجربة أفضل وقياس استخدام الموقع وتخصيص الإعلانات.',
        accept: 'قبول',
        decline: 'رفض',
        learnMore: 'معرفة المزيد'
    },
    ja: {
        title: 'Cookieの使用 🍪',
        description: 'より良い体験の提供、サイト利用状況の測定、広告のパーソナライズのために、Cookieと匿名の訪問者IDを使用しています。',
        accept: '同意する',
        decline: '拒否する',
        learnMore: '詳細'
    },
    ko: {
        title: '쿠키 사용 🍪',
        description: '더 나은 경험을 제공하고 사이트 이용 현황을 측정하며 광고를 맞춤화하기 위해 쿠키와 익명 방문자 ID를 사용합니다.',
        accept: '동의',
        decline: '거부',
        learnMore: '자세히 보기'
    },
    zh: {
        title: 'Cookie使用 🍪',
        description: '我们使用Cookie和匿名访客标识来提供更好的体验、衡量网站使用情况并个性化广告。',
        accept: '接受',
        decline: '拒绝',
        learnMore: '了解更多'
    }
};

export function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const { locale } = useLanguage();
    const t = cookieTranslations[locale] || cookieTranslations.en;

    useEffect(() => {
        // The stored key is versioned: answers given to the old ads-only text do not count here.
        if (getConsent() === 'unset') {
            // Show banner after a short delay
            const timer = setTimeout(() => setShowBanner(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setConsent('accepted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        setConsent('declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[70] p-2 sm:p-3 animate-in slide-in-from-bottom duration-300 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 dark:bg-amber-500/15 p-2 rounded-lg shrink-0 hidden sm:block">
                        <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm leading-snug">
                            <span className="font-bold">{t.title}</span>{' '}
                            <span className="text-gray-500 dark:text-gray-400">{t.description}</span>{' '}
                            <Link href="/privacy" className="text-santa-red hover:underline whitespace-nowrap">
                                {t.learnMore}
                            </Link>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button onClick={handleDecline} variant="outline" size="sm" className="hidden sm:inline-flex">
                            {t.decline}
                        </Button>
                        <Button onClick={handleAccept} size="sm" className="bg-santa-red hover:bg-red-700 text-white">
                            {t.accept}
                        </Button>
                        <button
                            onClick={handleDecline}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 sm:hidden"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
