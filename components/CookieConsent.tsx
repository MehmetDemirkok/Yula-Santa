"use client";

import { useState, useEffect } from 'react';
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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-amber-50 p-3 rounded-xl shrink-0">
                        <Cookie className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{t.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{t.description}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={handleAccept} size="sm" className="bg-santa-red hover:bg-red-700">
                                {t.accept}
                            </Button>
                            <Button onClick={handleDecline} variant="outline" size="sm">
                                {t.decline}
                            </Button>
                            <a
                                href="/privacy"
                                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 underline px-2"
                            >
                                {t.learnMore}
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={handleDecline}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
