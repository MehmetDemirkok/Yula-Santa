/**
 * Privacy notice (KVKK md. 10 aydınlatma metni), Turkish and English.
 *
 * Every claim here must match how the code actually works. Check this file
 * whenever data handling changes: storage keys, retention, third parties,
 * what is shown publicly. Turkish is the governing version; locales other than
 * `tr` see the English text with a note saying so.
 */

import { TIKTOK_COMMENT_RETENTION_DAYS } from '@/lib/tiktok/retention';

/** Google Analytics 4 is mentioned only when it is configured (see ConsentedGoogleAnalytics). */
const GA_ENABLED = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export type NoticeLink = { label: string; href: string };

export type NoticeSection = {
    id: string;
    title: string;
    paragraphs?: string[];
    items?: string[];
    links?: NoticeLink[];
};

export type PrivacyNotice = {
    effectiveDate: string;
    intro: string;
    /** Shown to locales that see a translation instead of the Turkish original. */
    governingNote: string;
    labels: { name: string; address: string; email: string; website: string; effective: string };
    sections: NoticeSection[];
};

const DAYS = TIKTOK_COMMENT_RETENTION_DAYS;

const tr: PrivacyNotice = {
    effectiveDate: '7 Kasım 2026',
    intro:
        'Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (KVKK) 10. maddesi uyarınca, YulaSanta’yı kullanırken hangi kişisel verilerin, hangi amaçla ve nasıl işlendiğini açıklar.',
    governingNote: '',
    labels: { name: 'Ad / Unvan', address: 'Adres', email: 'E-posta', website: 'Web sitesi', effective: 'Yürürlük tarihi' },
    sections: [
        {
            id: 'controller',
            title: 'Veri sorumlusu',
            paragraphs: [
                'Kişisel verileriniz, aşağıda bilgileri yer alan YulaSanta işleteni tarafından veri sorumlusu sıfatıyla işlenir.',
            ],
        },
        {
            id: 'data',
            title: 'Hangi verileri işliyoruz?',
            items: [
                'Araçlara girdiğiniz isim listeleri (isim çekilişi, Secret Santa, çark, takım oluşturucu vb.) yalnızca tarayıcınızda (localStorage) tutulur ve sunucumuza gönderilmez.',
                'Secret Santa kişisel bağlantıları; kişinin adını, kime hediye alacağını, organizatörün o kişi için yazdığı ipucunu ve etkinlik bilgilerini (grup adı, bütçe, tarih, not) bağlantının “#” işaretinden sonraki kısmında taşır. Tarayıcılar bu kısmı sunucumuza göndermez, bu yüzden bu bilgiler sunucumuza ve istatistik kayıtlarımıza ulaşmaz. Bağlantıyı alan veya bağlantıya erişen herkes bu bilgileri görebilir; ipucuna hassas kişisel bilgi yazmamanızı öneririz.',
                'PDF’den isim aktardığınızda dosya, isimleri çıkarmak için sunucumuzda işlenir ve saklanmaz.',
                'YouTube çekilişinde video bağlantısı sunucumuz üzerinden YouTube Data API’ye iletilir. Herkese açık yorumlar (kullanıcı adı ve yorum metni) çekiliş için işlenir, sunucumuzda saklanmaz.',
                'TikTok çekilişinde yapıştırdığınız yorumlar yalnızca tarayıcınızda işlenir.',
                'Hediye önerileri aracında seçtiğiniz gün, yakınlık, bütçe ve yazdığınız notlar, öneri üretmek için Google’ın Gemini yapay zeka hizmetine gönderilir. Bu bilgiler sunucumuzda saklanmaz; nota başkalarına ait kişisel bilgi yazmamanızı öneririz. Secret Santa sonucunda hediye fikri istediğinizde yalnızca organizatörün yazdığı ipucu ve bütçe metni Gemini’ye gönderilir; isimler gönderilmez.',
                `TikTok eklentisiyle gönderilen herkese açık yorumlar (kullanıcı adı, görünen ad, yorum metni ve zamanı) çekiliş yapılabilmesi için sunucumuzda saklanır ve çekilişin oluşturulmasından ${DAYS} gün sonra silinir. Çekiliş sonucu (kazanan ve yedek kullanıcı adları), doğrulama bağlantısının çalışmaya devam etmesi için saklanır. Hiç çekilişi yapılmamış kayıtlar da ${DAYS} gün sonra tamamen silinir.`,
                'İsteğe bağlı takipçi kontrolünde kanal adı ve kazanan kullanıcı adları, kontrolün yapılması için Apify’a iletilir.',
                'Paylaşılabilir sonuç/kanıt bağlantıları kazanan adlarını bağlantının içinde taşır; bağlantıyı paylaştığınız herkes bu adları görebilir.',
                'Plaka Avcısı’nda oyuncu kimliğiniz (misafirler için imzalı bir çerez, Google ile girişte e-posta adresinizden, e-posta ve şifreyle girişte hesap numaranızdan türetilen tek yönlü bir kimlik), verdiğiniz cevaplar, skorlarınız ve isteğe bağlı takma adınız saklanır. Liderlik tablosunda takma adınız (yoksa rastgele bir “Avcı” adı), size atanan araç simgesi ve skorunuz herkese açıktır. Google profil fotoğrafınız gösterilmez. Uygunsuz takma adlar kabul edilmez.',
                'Google ile giriş yaptığınızda adınız, e-posta adresiniz ve profil fotoğrafınız tarayıcınızdaki şifreli oturum çerezinde tutulur; ayrı bir kullanıcı veritabanına kaydedilmez.',
                'E-posta ve şifreyle hesap oluşturduğunuzda adınız, e-posta adresiniz, şifrenizin geri çevrilemeyen özeti (scrypt; şifrenin kendisi saklanmaz), hesabın oluşturulma ve son giriş zamanı veritabanımızda saklanır. Giriş denemeleri kötüye kullanımı önlemek için IP adresine ve e-postaya göre kısa süreli olarak sayılır; bu sayaçlar kaydedilmez. E-posta adresinizi doğrulamak ve şifre sıfırlamak için size tek kullanımlık bir bağlantı göndeririz; bağlantının yalnızca özeti saklanır, doğrulama bağlantısı 24 saat, sıfırlama bağlantısı 30 dakika geçerlidir ve süresi dolan kayıtlar silinir.',
                'Kullanım istatistikleri için görüntülenen sayfa, kullanılan araç, katılımcı ve sonuç sayısı, tıklanan adımlar (ör. kişisel bağlantının açılıp açılamadığı), ülke, dil, cihaz ve tarayıcı türü kaydedilir. IP adresiniz ham olarak saklanmaz; girdiğiniz isimler, kazananlar ve Secret Santa eşleşmeleri bu kayıtlara dahil edilmez. Çerezleri kabul ederseniz anonim bir ziyaretçi kimliği tutulur ve Google ile giriş yaptıysanız e-posta adresiniz bu kayıtlarla ilişkilendirilir. E-posta ve şifreyle açılan hesapların e-postası doğrulanmadığı için bu kayıtlarla ilişkilendirilmez.',
                'İletişim için bize yazdığınız e-postalar ve içerdiği bilgiler.',
                'Barındırma sağlayıcımız, güvenlik ve hata ayıklama amacıyla teknik kayıtlarda IP adresi ve tarayıcı bilgisini tutar.',
            ],
        },
        {
            id: 'purposes',
            title: 'Amaçlar ve hukuki sebepler',
            items: [
                'Araçları ve oyunu sunmak, çekiliş sonuçlarını göstermek ve doğrulatmak: hizmetin sunulması için zorunlu olması (KVKK md. 5/2-c).',
                'Hesap oluşturmak ve giriş yapmanızı sağlamak: sizinle kurulan üyelik ilişkisinin ifası için zorunlu olması (md. 5/2-c).',
                'Herkese açık sosyal medya yorumlarını çekiliş için işlemek: ilgili kişi tarafından alenileştirilmiş olması (md. 5/2-d).',
                'Güvenlik, kötüye kullanımın önlenmesi, hız sınırlama ve anonim kullanım istatistikleri: meşru menfaatimiz (md. 5/2-f).',
                'Kalıcı ziyaretçi kimliği ve reklam çerezleri: açık rızanız (md. 5/1). Rızanızı çerez bandından verebilir, tarayıcı verilerinizi silerek geri alabilirsiniz.',
            ],
        },
        {
            id: 'cookies',
            title: 'Çerezler ve tarayıcı depolama',
            items: [
                'Zorunlu: tema tercihi, çerez tercihiniz, oturum çerezi (Google veya e-posta ile giriş), Plaka Avcısı oyuncu çerezi (plaka_player, 1 yıl) ile tarayıcıda tutulan takma adınız ve yarım kalan oyununuzun kimliği. Bunlar onay olmadan da kullanılır, çünkü site bunlar olmadan çalışmaz.',
                'Tercihe bağlı: anonim ziyaretçi kimliği (yulasanta_vid). Yalnızca çerezleri kabul ederseniz oluşturulur; reddederseniz silinir.',
                'Reklam: Google AdSense betiği yalnızca çerezleri kabul ederseniz yüklenir. Kabul ederseniz Google ve reklam ortakları ilgi alanlarınıza göre reklam göstermek için çerez kullanabilir.',
                'Vercel Web Analytics çerez kullanmaz; yalnızca toplu sayfa görüntüleme sayıları üretir.',
                ...(GA_ENABLED
                    ? ['Google Analytics 4 yalnızca çerezleri kabul ederseniz yüklenir; ziyaret istatistikleri için çerez kullanır ve IP adresi kısaltılarak işlenir. Katılımcı isimleri veya eşleşmeler Google Analytics\'e gönderilmez.']
                    : []),
            ],
        },
        {
            id: 'transfers',
            title: 'Verilerin aktarıldığı taraflar',
            paragraphs: [
                'Verileriniz satılmaz ve reklam amacıyla paylaşılmaz. Hizmeti sunabilmek için aşağıdaki sağlayıcılarla, yalnızca gerekli olduğu ölçüde paylaşılır. Bu sağlayıcıların sunucuları Türkiye dışındadır; bu nedenle aktarım yurt dışına aktarım niteliğindedir.',
            ],
            items: [
                'Vercel Inc. (ABD): sitenin barındırılması ve teknik kayıtlar.',
                'Neon (ABD, AWS us-east-1): kullanıcı hesapları, Plaka Avcısı, TikTok eklentisi çekilişleri ve kullanım istatistikleri veritabanı.',
                `Google LLC (ABD): Google ile giriş, YouTube Data API, hediye önerileri için Gemini API ve (onay verirseniz) Google AdSense${GA_ENABLED ? ' ile Google Analytics' : ''}.`,
                'Resend (ABD; e-postalar Japonya bölgesinden gönderilir): e-posta doğrulama ve şifre sıfırlama e-postalarının gönderimi. Yalnızca e-posta adresiniz ve bağlantıyı içeren e-posta iletilir.',
                'Apify Technologies (Çekya): yalnızca takipçi kontrolünü kullandığınızda.',
            ],
        },
        {
            id: 'retention',
            title: 'Saklama süreleri',
            items: [
                'Tarayıcınızdaki listeler ve tercihler: siz silene kadar.',
                `TikTok eklentisiyle gelen yorumlar: ${DAYS} gün. Çekiliş sonucu: doğrulama bağlantısı için, silinmesini isteyene kadar.`,
                'Kullanım istatistikleri: en fazla 90 gün.',
                'Araç başına günlük toplam çekiliş sayıları (ana sayfadaki istatistik): süresiz. Bu sayılar kişi, cihaz veya isim bilgisi içermez.',
                'Plaka Avcısı skorları ve takma adlar: siz oynadıkça; giriş yaptıysanız Hesabım sayfasından kendiniz silebilir, misafirseniz bize yazarak sildirebilirsiniz. Yarım bırakılan oyunlar 1 gün sonra silinir.',
                'E-posta ve şifreyle açılan hesaplar: hesabınızı silene kadar. Hesabım sayfasından kendiniz silebilir ya da iletişim adresimize yazabilirsiniz. Silme; hesabı, Plaka Avcısı oyunlarınızı, skorlarınızı ve rozetlerinizi kaldırır ve kullanım kayıtlarındaki e-posta bağlantınızı siler.',
                'E-postalar: talebiniz sonuçlanana ve yasal yükümlülükler sona erene kadar.',
            ],
        },
        {
            id: 'rights',
            title: 'Haklarınız',
            paragraphs: ['KVKK’nın 11. maddesi uyarınca veri sorumlusuna başvurarak:'],
            items: [
                'kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,',
                'işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
                'yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,',
                'eksik veya yanlış işlenmişse düzeltilmesini isteme,',
                'KVKK md. 7 çerçevesinde silinmesini veya yok edilmesini isteme,',
                'düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
                'münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,',
                'kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.',
            ],
        },
        {
            id: 'apply',
            title: 'Başvuru',
            paragraphs: [
                'Taleplerinizi aşağıdaki e-posta adresine iletebilirsiniz. Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır (KVKK md. 13). Plaka Avcısı verilerinizin silinmesini isterseniz takma adınızı ve oyun oynadığınız tarihi belirtmeniz yeterlidir.',
            ],
        },
        {
            id: 'third-party',
            title: 'Üçüncü taraf hizmetlerin koşulları',
            paragraphs: [
                'YouTube çekilişi YouTube API Hizmetleri’ni kullanır; bu özelliği kullanarak YouTube Hizmet Şartları’nı kabul etmiş olursunuz. Google’ın verileri nasıl işlediği Google Gizlilik Politikası’nda açıklanır. YulaSanta, YouTube, Google veya TikTok ile bağlantılı değildir ve bu şirketler tarafından desteklenmez.',
            ],
            links: [
                { label: 'YouTube Hizmet Şartları', href: 'https://www.youtube.com/t/terms' },
                { label: 'Google Gizlilik Politikası', href: 'https://policies.google.com/privacy' },
                { label: 'Google hesap erişim izinleri', href: 'https://myaccount.google.com/permissions' },
            ],
        },
    ],
};

const en: PrivacyNotice = {
    effectiveDate: '7 November 2026',
    intro:
        'This notice explains which personal data is processed when you use YulaSanta, why, and how, as required by Article 10 of the Turkish Personal Data Protection Law No. 6698 (KVKK).',
    governingNote:
        'This is an English translation. The Turkish version of this notice is the governing version.',
    labels: { name: 'Name', address: 'Address', email: 'Email', website: 'Website', effective: 'Effective date' },
    sections: [
        {
            id: 'controller',
            title: 'Data controller',
            paragraphs: ['Your personal data is processed by the operator of YulaSanta, listed below, as the data controller.'],
        },
        {
            id: 'data',
            title: 'What we process',
            items: [
                'Name lists you enter in the tools (name draw, Secret Santa, wheel, team generator and so on) stay in your browser (localStorage) and are never sent to our server.',
                'Personal Secret Santa links carry the person’s name, who they buy for, the organizer’s hint about that person and the event details (group name, budget, date, note) in the part of the link after “#”. Browsers never send that part to our server, so this information does not reach our server or our usage statistics. Anyone who receives or can open the link can see it; please keep sensitive personal details out of hints.',
                'When you import names from a PDF, the file is processed on our server to extract the names and is not stored.',
                'For a YouTube giveaway, the video link is passed through our server to the YouTube Data API. Public comments (username and comment text) are processed for the draw and are not stored on our server.',
                'Comments you paste into the TikTok giveaway are processed only in your browser.',
                'In the gift suggestions tool, the occasion, relationship, budget and any notes you write are sent to Google’s Gemini AI service to generate ideas. We do not store them; please don’t put other people’s personal details in the notes. When you ask for gift ideas on a Secret Santa result, only the organizer’s hint and the budget text are sent to Gemini, never names.',
                `Public comments sent by the TikTok extension (username, display name, comment text and time) are stored on our server so the draw can run, and are deleted ${DAYS} days after the giveaway is created. The result (winner and backup usernames) is kept so the verification link keeps working. Giveaways that were never drawn are deleted entirely after ${DAYS} days.`,
                'For the optional follower check, the channel name and winner usernames are sent to Apify to run the check.',
                'Shareable result and proof links carry the winners’ names inside the link, so anyone you share it with can see them.',
                'In Plaka Avcısı we store your player ID (a signed cookie for guests, or a one-way ID derived from your email if you sign in with Google, or from your account number if you use email and password), your answers, scores and optional nickname. The leaderboard publicly shows your nickname (or a random “Avcı” name), the vehicle icon assigned to you and your score. Your Google profile picture is never shown. Offensive nicknames are rejected.',
                'When you sign in with Google, your name, email address and profile picture are kept in an encrypted session cookie in your browser and are not saved to a separate user database.',
                'When you create an account with email and password, we store your name, email address, a one-way hash of your password (scrypt; the password itself is never stored), and when the account was created and last used. Sign-in attempts are counted briefly per IP address and email to stop abuse; these counters are not saved. To confirm your email address or reset your password we email you a one-time link; we keep only a hash of it, confirmation links work for 24 hours and reset links for 30 minutes, and expired entries are deleted.',
                'For usage statistics we record the page viewed, the tool used, participant and result counts, steps taken (such as whether a personal link opened), country, language, device and browser type. Your IP address is not stored in raw form, and names, winners and Secret Santa matches are never included. If you accept cookies, an anonymous visitor ID is kept, and if you are signed in with Google your email address is linked to these records. Email addresses of email-and-password accounts are not verified, so they are never linked.',
                'Emails you send us and the information they contain.',
                'Our hosting provider keeps your IP address and browser details in technical logs for security and debugging.',
            ],
        },
        {
            id: 'purposes',
            title: 'Purposes and legal grounds',
            items: [
                'Providing the tools and the game, and showing and verifying draw results: necessary to provide the service (KVKK Art. 5/2-c).',
                'Creating your account and letting you sign in: necessary to perform the membership you signed up for (Art. 5/2-c).',
                'Processing public social media comments for a draw: data made public by the person concerned (Art. 5/2-d).',
                'Security, abuse prevention, rate limiting and anonymous usage statistics: our legitimate interest (Art. 5/2-f).',
                'Persistent visitor ID and advertising cookies: your explicit consent (Art. 5/1). You can give consent in the cookie banner and withdraw it by clearing your browser data.',
            ],
        },
        {
            id: 'cookies',
            title: 'Cookies and browser storage',
            items: [
                'Essential: theme preference, your cookie choice, the session cookie (Google or email sign-in), the Plaka Avcısı player cookie (plaka_player, 1 year), and your nickname and unfinished game ID kept in the browser. These are used without consent because the site cannot work without them.',
                'Optional: an anonymous visitor ID (yulasanta_vid), created only if you accept cookies and deleted if you decline.',
                'Advertising: the Google AdSense script loads only if you accept cookies. If you do, Google and its partners may use cookies to show ads based on your interests.',
                'Vercel Web Analytics uses no cookies and only produces aggregate page view counts.',
                ...(GA_ENABLED
                    ? ['Google Analytics 4 loads only if you accept cookies; it uses cookies for visit statistics and processes IP addresses in shortened form. Participant names and matches are never sent to Google Analytics.']
                    : []),
            ],
        },
        {
            id: 'transfers',
            title: 'Who receives your data',
            paragraphs: [
                'Your data is not sold or shared for advertising. It is shared with the providers below only as far as needed to run the service. Their servers are outside Turkey, so this counts as a transfer abroad.',
            ],
            items: [
                'Vercel Inc. (USA): hosting and technical logs.',
                'Neon (USA, AWS us-east-1): the database for user accounts, Plaka Avcısı, TikTok extension giveaways and usage statistics.',
                `Google LLC (USA): Google sign-in, the YouTube Data API, the Gemini API for gift suggestions and, with your consent, Google AdSense${GA_ENABLED ? ' and Google Analytics' : ''}.`,
                'Resend (USA; emails are sent from its Japan region): sending email confirmation and password reset emails. Only your email address and the email with the link are passed on.',
                'Apify Technologies (Czech Republic): only when you use the follower check.',
            ],
        },
        {
            id: 'retention',
            title: 'How long we keep data',
            items: [
                'Lists and preferences in your browser: until you delete them.',
                `Comments from the TikTok extension: ${DAYS} days. Draw results: kept for the verification link until you ask us to delete them.`,
                'Usage statistics: at most 90 days.',
                'Daily draw totals per tool (the homepage statistics): kept indefinitely. These numbers contain no person, device or name data.',
                'Plaka Avcısı scores and nicknames: while you play. Signed-in players can delete them on My account; guests can ask us to delete them. Unfinished games are deleted after 1 day.',
                'Email-and-password accounts: until you delete the account. You can delete it yourself on My account or write to our contact address. Deleting removes the account, your Plaka Avcısı games, scores and badges, and the link between your email and usage records.',
                'Emails: until your request is resolved and legal obligations end.',
            ],
        },
        {
            id: 'rights',
            title: 'Your rights',
            paragraphs: ['Under Article 11 of the KVKK you can ask the data controller to:'],
            items: [
                'tell you whether your personal data is processed and, if so, give you information about it,',
                'tell you the purpose of processing and whether it is used for that purpose,',
                'tell you the third parties it is transferred to in Turkey or abroad,',
                'correct it if it is incomplete or inaccurate,',
                'delete or destroy it under Article 7 of the KVKK,',
                'notify third parties it was transferred to about a correction or deletion,',
                'object to a result against you that comes solely from automated analysis,',
                'compensate you if you suffer damage from unlawful processing.',
            ],
        },
        {
            id: 'apply',
            title: 'How to apply',
            paragraphs: [
                'Send your request to the email address below. We answer free of charge within 30 days at most (KVKK Art. 13). To delete your Plaka Avcısı data, tell us your nickname and roughly when you played.',
            ],
        },
        {
            id: 'third-party',
            title: 'Third-party terms',
            paragraphs: [
                'The YouTube giveaway uses the YouTube API Services; by using it you agree to the YouTube Terms of Service. How Google handles data is described in the Google Privacy Policy. YulaSanta is not affiliated with or endorsed by YouTube, Google or TikTok.',
            ],
            links: [
                { label: 'YouTube Terms of Service', href: 'https://www.youtube.com/t/terms' },
                { label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' },
                { label: 'Google account permissions', href: 'https://myaccount.google.com/permissions' },
            ],
        },
    ],
};

export function getPrivacyNotice(locale: string): PrivacyNotice {
    return locale === 'tr' ? tr : en;
}
