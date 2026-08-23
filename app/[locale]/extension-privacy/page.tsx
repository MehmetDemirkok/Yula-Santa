import { getSEOMetadata, viewport } from '@/lib/seo';
import { locales } from '@/i18n/config';
export { viewport };

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getSEOMetadata({
        locale,
        path: '/extension-privacy',
        titleOverride: 'YulaSanta TikTok Chrome Extension — Gizlilik Politikası',
        descriptionOverride: 'YulaSanta TikTok Çekiliş Yardımcısı Chrome uzantısının gizlilik politikası.',
        noIndex: true,
    });
}

export default function ExtensionPrivacyPage() {
    return (
        <main className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
            <div className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:bg-[var(--card-bg)] sm:p-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    YulaSanta — TikTok Çekiliş Yardımcısı Gizlilik Politikası
                </h1>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Son güncelleme: 24 Ağustos 2026</p>

                <div className="mt-6 space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
                    <section>
                        <h2 className="mb-2 font-semibold text-[var(--text-primary)]">Uzantı ne yapar?</h2>
                        <p>
                            YulaSanta — TikTok Çekiliş Yardımcısı (&quot;Uzantı&quot;), yalnızca kullanıcının
                            açıkça başlattığı bir işlem sırasında (&quot;Yorumları Topla&quot; butonuna basıldığında)
                            açık olan bir TikTok video sayfasında, sayfada zaten görünen yorumları okur. Uzantı
                            gizli bir API&apos;ye istek atmaz, TikTok&apos;a giriş yapmaz, CAPTCHA/bot korumasını
                            aşmaya çalışmaz ve TikTok kullanıcı adınızı/şifrenizi veya oturum bilgilerinizi
                            istemez ya da okumaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-semibold text-[var(--text-primary)]">Hangi veri toplanır?</h2>
                        <p>
                            Yalnızca ilgili TikTok videosunda herkese zaten açık olan yorum verileri: yorumu
                            yazan kullanıcının adı (username), görünen adı (display name) ve yorum metni.
                            Uzantı, bunların dışında herhangi bir kişisel veri (e-posta, telefon, konum, tarama
                            geçmişi, çerezler, TikTok hesap bilgileri vb.) toplamaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-semibold text-[var(--text-primary)]">Veriler nereye gönderilir?</h2>
                        <p>
                            Toplanan yorumlar yalnızca, kullanıcının kendisinin YulaSanta üzerinde oluşturduğu
                            çekilişe (yulasanta.com.tr sunucusuna) kullanıcının kendi isteğiyle
                            (&quot;YulaSanta&apos;ya Gönder&quot; butonuna basıldığında) aktarılır. Veriler
                            üçüncü taraflarla paylaşılmaz, satılmaz veya reklam amacıyla kullanılmaz. Gönderim
                            sırasında çekilişe özel, kullanıcının kendi oluşturduğu bir &quot;İçe Aktarma
                            Kodu&quot; ile kimlik doğrulaması yapılır.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-semibold text-[var(--text-primary)]">Yerel depolama</h2>
                        <p>
                            Uzantı, çekiliş ID&apos;si, İçe Aktarma Kodu ve toplanan yorumları geçici olarak
                            yalnızca kendi tarayıcınızın <code>chrome.storage.local</code> alanında saklar. Bu
                            veriler YulaSanta&apos;ya gönderilene kadar tarayıcınızdan çıkmaz ve uzantı kaldırıldığında
                            veya elle temizlendiğinde silinir.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-semibold text-[var(--text-primary)]">İzinler neden gerekli?</h2>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                <strong>activeTab / scripting:</strong> Yalnızca kullanıcı butona bastığında,
                                aktif TikTok sekmesinde yorumları okumak için.
                            </li>
                            <li>
                                <strong>storage / unlimitedStorage:</strong> Çok sayıda yorumu (100.000+) gönderim
                                öncesi geçici olarak tarayıcıda tutabilmek için.
                            </li>
                            <li>
                                <strong>host_permissions (tiktok.com, yulasanta.com.tr):</strong> Yorumları
                                okumak ve yalnızca YulaSanta&apos;nın kendi sunucusuna aktarmak için.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-2 font-semibold text-[var(--text-primary)]">İletişim</h2>
                        <p>
                            Sorularınız için:{' '}
                            <a className="font-semibold text-santa-red underline" href="mailto:mehmetdemirkok@gmail.com">
                                mehmetdemirkok@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
