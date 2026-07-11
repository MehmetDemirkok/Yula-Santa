/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Contact Page - İletişim
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { locales } from '@/i18n/config';
import { getSEOMetadata, viewport } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export { viewport };

type Props = {
    params: Promise<{ locale: string }>;
};

// Generate static paths for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/contact',
        translationKey: 'contact.meta'
    });
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
        <main className="ys-page-shell py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-santa-red/10 dark:bg-santa-red/20 rounded-2xl mb-6">
                        <MessageSquare className="w-8 h-8 text-santa-red" />
                    </div>
                    <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="ys-card p-6 sm:p-8">
                        <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-santa-red rounded-full"></span>
                            {t('form.title')}
                        </h2>

                        <form action={`mailto:mehmetdemirkok@gmail.com`} method="post" encType="text/plain" className="space-y-5">
                            <div>
                                <label className="block text-label-md text-[var(--text-secondary)] mb-2">
                                    {t('form.name')}
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder={t('form.namePlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-label-md text-[var(--text-secondary)] mb-2">
                                    {t('form.email')}
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder={t('form.emailPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-label-md text-[var(--text-secondary)] mb-2">
                                    {t('form.subject')}
                                </label>
                                <Input
                                    type="text"
                                    name="subject"
                                    required
                                    placeholder={t('form.subjectPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-label-md text-[var(--text-secondary)] mb-2">
                                    {t('form.message')}
                                </label>
                                <textarea
                                    name="message"
                                    rows={5}
                                    required
                                    className="w-full px-4 sm:px-6 py-2 rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] text-base sm:text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--input-focus)] focus:outline-none transition-colors resize-none shadow-sm dark:shadow-none"
                                    placeholder={t('form.messagePlaceholder')}
                                ></textarea>
                            </div>

                            <Button type="submit" variant="default" size="lg" className="w-full">
                                <Send className="w-5 h-5" />
                                {t('form.send')}
                            </Button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                className="ys-card p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${info.color}`}>
                                        <info.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                                            {t(info.titleKey)}
                                        </h3>
                                        <p className="text-[var(--text-secondary)]">
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
