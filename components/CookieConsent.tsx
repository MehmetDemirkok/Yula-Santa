"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const COOKIE_CONSENT_KEY = 'yulasanta_cookie_consent';

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
        description: 'Size daha iyi bir deneyim sunmak ve reklamları kişiselleştirmek için çerezleri kullanıyoruz.',
        accept: 'Kabul Et',
        decline: 'Reddet',
        learnMore: 'Daha Fazla Bilgi'
    },
    en: {
        title: 'Cookie Usage 🍪',
        description: 'We use cookies to provide a better experience and personalize ads.',
        accept: 'Accept',
        decline: 'Decline',
        learnMore: 'Learn More'
    },
    de: {
        title: 'Cookie-Nutzung 🍪',
        description: 'Wir verwenden Cookies, um ein besseres Erlebnis zu bieten und Werbung zu personalisieren.',
        accept: 'Akzeptieren',
        decline: 'Ablehnen',
        learnMore: 'Mehr erfahren'
    },
    fr: {
        title: 'Utilisation des cookies 🍪',
        description: 'Nous utilisons des cookies pour offrir une meilleure expérience et personnaliser les publicités.',
        accept: 'Accepter',
        decline: 'Refuser',
        learnMore: 'En savoir plus'
    },
    es: {
        title: 'Uso de cookies 🍪',
        description: 'Usamos cookies para ofrecer una mejor experiencia y personalizar los anuncios.',
        accept: 'Aceptar',
        decline: 'Rechazar',
        learnMore: 'Más información'
    },
    it: {
        title: 'Utilizzo dei cookie 🍪',
        description: 'Utilizziamo i cookie per offrire un\'esperienza migliore e personalizzare gli annunci.',
        accept: 'Accetta',
        decline: 'Rifiuta',
        learnMore: 'Scopri di più'
    },
    pt: {
        title: 'Uso de cookies 🍪',
        description: 'Usamos cookies para oferecer uma melhor experiência e personalizar anúncios.',
        accept: 'Aceitar',
        decline: 'Recusar',
        learnMore: 'Saiba mais'
    },
    ru: {
        title: 'Использование cookie 🍪',
        description: 'Мы используем cookie для улучшения опыта и персонализации рекламы.',
        accept: 'Принять',
        decline: 'Отклонить',
        learnMore: 'Узнать больше'
    },
    ar: {
        title: 'استخدام ملفات تعريف الارتباط 🍪',
        description: 'نستخدم ملفات تعريف الارتباط لتقديم تجربة أفضل وتخصيص الإعلانات.',
        accept: 'قبول',
        decline: 'رفض',
        learnMore: 'معرفة المزيد'
    },
    ja: {
        title: 'Cookieの使用 🍪',
        description: 'より良い体験を提供し、広告をパーソナライズするためにCookieを使用しています。',
        accept: '同意する',
        decline: '拒否する',
        learnMore: '詳細'
    },
    ko: {
        title: '쿠키 사용 🍪',
        description: '더 나은 경험을 제공하고 광고를 맞춤화하기 위해 쿠키를 사용합니다.',
        accept: '동의',
        decline: '거부',
        learnMore: '자세히 보기'
    },
    zh: {
        title: 'Cookie使用 🍪',
        description: '我们使用Cookie来提供更好的体验并个性化广告。',
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
        // Check if user has already given consent
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Show banner after a short delay
            const timer = setTimeout(() => setShowBanner(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setShowBanner(false);

        // Enable personalized ads
        if (typeof window !== 'undefined' && window.adsbygoogle) {
            // AdSense personalization is enabled by default
        }
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        setShowBanner(false);

        // Disable personalized ads (Non-personalized ads will still show)
        // You may need to implement additional logic based on your requirements
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 animate-in slide-in-from-bottom duration-300 pointer-events-none">
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
