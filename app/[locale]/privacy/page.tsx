"use client";

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

const privacyContent: Record<string, { title: string; lastUpdated: string; sections: { heading: string; content: string }[] }> = {
    tr: {
        title: 'Gizlilik Politikası',
        lastUpdated: 'Son güncelleme: Aralık 2024',
        sections: [
            {
                heading: 'Toplanan Bilgiler',
                content: 'YulaSanta, çekiliş oluşturmak için girdiğiniz isimleri yalnızca tarayıcınızın yerel depolamasında (localStorage) saklar. Bu veriler sunucularımıza gönderilmez ve yalnızca sizin cihazınızda kalır.'
            },
            {
                heading: 'Çerezler ve Reklam',
                content: 'Sitemizde Google AdSense reklamları gösterilmektedir. Google ve reklam ortakları, ilgi alanlarınıza dayalı reklamlar göstermek için çerezler kullanabilir. Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.'
            },
            {
                heading: 'Üçüncü Taraf Hizmetler',
                content: 'Google AdSense ve Google Analytics gibi üçüncü taraf hizmetler kullanmaktayız. Bu hizmetlerin kendi gizlilik politikaları vardır ve bunları incelemenizi öneririz.'
            },
            {
                heading: 'Veri Güvenliği',
                content: 'Verileriniz yalnızca tarayıcınızda saklandığı için, tarayıcı verilerinizi temizlediğinizde tüm bilgiler silinir. Sunucularımızda kişisel veri saklamıyoruz.'
            },
            {
                heading: 'İletişim',
                content: 'Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz.'
            }
        ]
    },
    en: {
        title: 'Privacy Policy',
        lastUpdated: 'Last updated: December 2024',
        sections: [
            {
                heading: 'Information Collected',
                content: 'YulaSanta only stores the names you enter for creating draws in your browser\'s local storage (localStorage). This data is not sent to our servers and remains only on your device.'
            },
            {
                heading: 'Cookies and Advertising',
                content: 'Our site displays Google AdSense advertisements. Google and advertising partners may use cookies to show ads based on your interests. You can change your cookie preferences at any time.'
            },
            {
                heading: 'Third-Party Services',
                content: 'We use third-party services such as Google AdSense and Google Analytics. These services have their own privacy policies, and we recommend reviewing them.'
            },
            {
                heading: 'Data Security',
                content: 'Since your data is only stored in your browser, all information is deleted when you clear your browser data. We do not store personal data on our servers.'
            },
            {
                heading: 'Contact',
                content: 'For questions about our privacy policy, you can contact us.'
            }
        ]
    },
    de: {
        title: 'Datenschutzrichtlinie',
        lastUpdated: 'Zuletzt aktualisiert: Dezember 2024',
        sections: [
            {
                heading: 'Erfasste Informationen',
                content: 'YulaSanta speichert die Namen, die Sie für Ziehungen eingeben, nur im lokalen Speicher Ihres Browsers (localStorage). Diese Daten werden nicht an unsere Server gesendet und verbleiben nur auf Ihrem Gerät.'
            },
            {
                heading: 'Cookies und Werbung',
                content: 'Unsere Website zeigt Google AdSense-Anzeigen an. Google und Werbepartner können Cookies verwenden, um Anzeigen basierend auf Ihren Interessen zu zeigen.'
            },
            {
                heading: 'Dienste Dritter',
                content: 'Wir verwenden Dienste Dritter wie Google AdSense und Google Analytics. Diese Dienste haben ihre eigenen Datenschutzrichtlinien.'
            },
            {
                heading: 'Datensicherheit',
                content: 'Da Ihre Daten nur in Ihrem Browser gespeichert werden, werden alle Informationen gelöscht, wenn Sie Ihre Browserdaten löschen.'
            },
            {
                heading: 'Kontakt',
                content: 'Bei Fragen zu unserer Datenschutzrichtlinie können Sie uns kontaktieren.'
            }
        ]
    }
};

export default function PrivacyPage() {
    const { locale } = useLanguage();
    const content = privacyContent[locale] || privacyContent.en;

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {locale === 'tr' ? 'Ana Sayfa' : 'Home'}
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">{content.title}</h1>
                            <p className="text-sm text-gray-500">{content.lastUpdated}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {content.sections.map((section, index) => (
                            <div key={index}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">{section.heading}</h2>
                                <p className="text-gray-600 leading-relaxed">{section.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500 text-center">
                            © {new Date().getFullYear()} YulaSanta. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
