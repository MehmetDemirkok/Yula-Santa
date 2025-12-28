/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Contact Page - İletişim
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'contact' });

    return {
        title: t('meta.title'),
        description: t('meta.description'),
    };
}

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'contact' });

    const contactInfo = [
        { icon: Mail, titleKey: 'info.email.title', valueKey: 'info.email.value', color: 'text-santa-red bg-red-50 dark:bg-red-500/10' },
        { icon: Clock, titleKey: 'info.hours.title', valueKey: 'info.hours.value', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
        { icon: MapPin, titleKey: 'info.location.title', valueKey: 'info.location.value', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
    ];

    return (
        <main className="min-h-screen py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-[#FFF5F5] to-white dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-santa-red/10 dark:bg-santa-red/20 rounded-2xl mb-6">
                        <MessageSquare className="w-8 h-8 text-santa-red" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50 dark:border-white/10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-santa-red rounded-full"></span>
                            {t('form.title')}
                        </h2>

                        <form action={`mailto:mehmetdemirkok@gmail.com`} method="post" encType="text/plain" className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('form.name')}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-santa-red dark:focus:border-gold focus:outline-none transition-colors"
                                    placeholder={t('form.namePlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('form.email')}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-santa-red dark:focus:border-gold focus:outline-none transition-colors"
                                    placeholder={t('form.emailPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('form.subject')}
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-santa-red dark:focus:border-gold focus:outline-none transition-colors"
                                    placeholder={t('form.subjectPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('form.message')}
                                </label>
                                <textarea
                                    name="message"
                                    rows={5}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-santa-red dark:focus:border-gold focus:outline-none transition-colors resize-none"
                                    placeholder={t('form.messagePlaceholder')}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-santa-red hover:bg-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <Send className="w-5 h-5" />
                                {t('form.send')}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 dark:border-white/10"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${info.color}`}>
                                        <info.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                            {t(info.titleKey)}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {t(info.valueKey)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* FAQ Teaser */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">{t('faq.title')}</h3>
                            <p className="text-white/90 text-sm leading-relaxed mb-4">
                                {t('faq.desc')}
                            </p>
                            <div className="space-y-3">
                                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                    <p className="font-medium text-sm">{t('faq.q1')}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                    <p className="font-medium text-sm">{t('faq.q2')}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                    <p className="font-medium text-sm">{t('faq.q3')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
