/**
 * Copy for /secret-santa/office and /secret-santa/university. Only Turkish and
 * English exist, so these pages are published in those two locales only
 * (see LANDING_LOCALES). Every claim must match the tool: Excel/CSV/PDF import,
 * "must not draw each other" and "same group" rules, personal links sent by
 * WhatsApp, e-mail or SMS (the organizer can open any link), printable cards,
 * budget/date/note on links and cards, and names kept in the organizer's browser.
 */
import type { SantaLandingCopy } from '@/lib/santaLandingCopy';

export const LANDING_LOCALES = ['tr', 'en'] as const;

const SHARED_RELATED_TR = [
    { path: '/secret-santa', label: 'Yılbaşı hediye çekilişi yap' },
    { path: '/secret-santa/classroom', label: 'Sınıf yılbaşı çekilişi' },
    { path: '/tools/gift-suggestions', label: 'Hediye önerileri' },
    { path: '/tools/team-generator', label: 'Takım oluşturucu' },
];
const SHARED_RELATED_EN = [
    { path: '/secret-santa', label: 'Run a Secret Santa draw' },
    { path: '/secret-santa/classroom', label: 'Classroom Secret Santa' },
    { path: '/tools/gift-suggestions', label: 'Gift ideas' },
    { path: '/tools/team-generator', label: 'Team generator' },
];

const PRIVACY_TR = [
    'Katılımcıların hesap açması veya uygulama indirmesi gerekmez. Çekilişi yalnızca organizatör yapar.',
    'İsimler ve eşleşmeler organizatörün tarayıcısında hesaplanır ve saklanır; sunucumuza gönderilmez.',
    'Kişisel linkte eşleşme, adresin # işaretinden sonraki kısmında durur. Bu kısım sunucuya gönderilmez, ama şifreli de değildir: linki açan herkes sonucu görür.',
    'Linkleri organizatör oluşturduğu için isterse açıp bakabilir. Herkesin sürprizi korumak için linkleri açmadan göndermesi yeterlidir.',
];
const PRIVACY_EN = [
    'Participants need no account or app. Only the organizer runs the draw.',
    "Names and matches are computed and stored in the organizer's browser and are not sent to our server.",
    'In a personal link the match sits after the # in the address. That part never reaches the server, but it is not encrypted either: anyone who opens the link sees the result.',
    'The organizer creates the links, so they could open one. To keep the surprise, just send the links without opening them.',
];

export const OFFICE_SEO_COPY: Record<string, SantaLandingCopy> = {
    tr: {
        metaTitle: 'Ofis Yılbaşı Çekilişi: Ücretsiz Online Secret Santa | YulaSanta',
        metaDescription:
            'Ofisiniz ve ekibiniz için ücretsiz yılbaşı hediye çekilişi. Listeyi Excel ile yükleyin, ekipleri kurallarla ayırın, herkese WhatsApp veya e-postayla kişisel link gönderin.',
        keywords: [
            'ofis yılbaşı çekilişi',
            'iş yeri yılbaşı çekilişi',
            'şirket yılbaşı hediye çekilişi',
            'ofis secret santa',
            'iş arkadaşları yılbaşı çekilişi',
            'ekip yılbaşı hediyeleşmesi',
            'insan kaynakları yılbaşı etkinliği',
        ],
        h1: 'Ofisinizde Secret Santa Heyecanını Başlatın!',
        intro:
            'Ofis yılbaşı çekilişini toplantı arasında bitirin. Çalışan listesini yapıştırın veya Excel ile yükleyin, kuralları belirleyin ve herkese kendi sonucunu gösteren kişisel bir link gönderin. Kimsenin hesap açması gerekmez.',
        cta: 'Ofis çekilişini başlat',
        whyTitle: 'İK ekipleri ve organizatörler için',
        why: [
            { title: 'Listeyi tek seferde ekleyin', desc: 'Çalışan listesini Excel, CSV veya PDF olarak yükleyin ya da isimleri tablodan kopyalayıp yapıştırın.' },
            { title: 'Departman kuralları', desc: 'Aynı ekipteki kişileri bir gruba koyun, birbirlerine çıkmazlar. Birbirini çekmemesi gereken çiftleri de ayrıca seçebilirsiniz.' },
            { title: 'Herkese kişisel link', desc: 'Her çalışana WhatsApp, e-posta veya SMS ile kendi linkini gönderin. Mesajda kimi çektiği yazmaz.' },
            { title: 'Bütçe, tarih ve not', desc: 'Hediye üst sınırını, hediyeleşme gününü ve kısa bir notu girin; linklerde ve kartlarda görünür. Linkten takvime ekleme dosyası da indirilebilir.' },
            { title: 'Uzaktan çalışanlar dahil', desc: 'Farklı şehirdeki veya evden çalışan ekip arkadaşları linkini telefonundan açar.' },
            { title: 'Ücretsiz ve kayıtsız', desc: 'Ödeme, abonelik veya hesap yoktur. Çalışan isimleri sunucumuza kaydedilmez.' },
        ],
        howToTitle: 'Ofiste yılbaşı çekilişi nasıl organize edilir?',
        steps: [
            'Yılbaşı çekilişi sayfasında çalışan isimlerini ekleyin veya Excel listesini yükleyin.',
            '"Kurallar ve detaylar" bölümünde ekipleri gruplayın, bütçe, tarih ve etkinlik adını yazın.',
            'Çekilişi başlatın ve "Herkese link gönder"i seçin.',
            'Her çalışanın linkini WhatsApp, e-posta veya SMS ile gönderin. Hangi linklerin gönderildiği listede işaretlenir.',
            'Hediyeleşme günü herkes hediyesini getirir, sürpriz o gün ortaya çıkar.',
        ],
        privacyTitle: 'Çalışan bilgileri ve gizlilik',
        privacy: PRIVACY_TR,
        faqTitle: 'Ofis yılbaşı çekilişi hakkında sorular',
        faq: [
            { q: 'Çalışanların kayıt olması gerekiyor mu?', a: 'Hayır. Çekilişi organizatör yapar; çalışanlar yalnızca kendilerine gönderilen linki açar.' },
            { q: 'Aynı ekiptekiler birbirini çekmesin istiyorum.', a: '"Aynı gruptakiler birbirini çekmesin" bölümünde her ekip için bir grup oluşturun. Bir grup, geri kalan herkesten kalabalıksa çekiliş yapılamaz ve site bunu söyler.' },
            { q: 'Kaç kişiyle çekiliş yapılabilir?', a: 'En az 3 kişi gerekir. Sabit bir üst sınır yoktur; kalabalık ekiplerde de kullanılabilir.' },
            { q: 'Sonuçları e-postayla gönderebilir miyim?', a: 'Evet. Her kişinin yanında e-posta butonu vardır; kendi e-posta uygulamanızda kişinin linkini içeren bir taslak açılır.' },
            { q: 'Herkes aynı ofisteyse ne yapabilirim?', a: '"Bu ekranda göster" seçeneğiyle herkes sırayla aynı ekrandan sonucuna bakar ya da "Kart yazdır" ile katlanabilir kartlar dağıtırsınız.' },
            { q: 'Ücretli bir sürüm var mı?', a: 'Hayır. Ofis çekilişi dahil tüm özellikler ücretsizdir.' },
        ],
        breadcrumb: 'Ofis yılbaşı çekilişi',
        relatedTitle: 'İlgili sayfalar',
        related: [...SHARED_RELATED_TR.slice(0, 2), { path: '/secret-santa/university', label: 'Üniversite ve kulüp çekilişi' }, ...SHARED_RELATED_TR.slice(2)],
    },
    en: {
        metaTitle: 'Office Secret Santa Generator: Free for Teams | YulaSanta',
        metaDescription:
            'Free Secret Santa for your office or team. Import the staff list from Excel, keep teams apart with rules and send everyone a personal link by WhatsApp or e-mail.',
        keywords: [
            'office secret santa',
            'workplace secret santa',
            'secret santa for coworkers',
            'company gift exchange',
            'team secret santa generator',
            'hr holiday gift exchange',
        ],
        h1: 'Start Secret Santa at Your Office',
        intro:
            'Finish the office gift exchange between meetings. Paste the staff list or upload it from Excel, set your rules and send everyone a personal link that shows only their own match. Nobody needs an account.',
        cta: 'Start the office draw',
        whyTitle: 'Built for HR teams and organizers',
        why: [
            { title: 'Add the whole list at once', desc: 'Upload the staff list as Excel, CSV or PDF, or copy the names from a spreadsheet and paste them.' },
            { title: 'Team rules', desc: "Put people from the same team in a group and they won't draw each other. You can also pick pairs who must not be matched." },
            { title: 'A personal link for everyone', desc: "Send each colleague their own link by WhatsApp, e-mail or SMS. The message doesn't say who they drew." },
            { title: 'Budget, date and note', desc: 'Add a spending limit, the exchange day and a short note; they appear on the links and cards. The link also offers a calendar file.' },
            { title: 'Remote colleagues included', desc: 'People in another city or working from home open their link on their phone.' },
            { title: 'Free, no sign-up', desc: 'No payment, subscription or account. Staff names are not saved on our server.' },
        ],
        howToTitle: 'How to organize Secret Santa at the office',
        steps: [
            'On the Secret Santa page, add the names or upload your Excel list.',
            'Under "Rules and details", group teams and add a budget, a date and an event name.',
            'Start the draw and choose to send everyone a link.',
            'Send each link by WhatsApp, e-mail or SMS. Sent links are ticked off in the list.',
            'On exchange day everyone brings their gift and the surprise is revealed.',
        ],
        privacyTitle: 'Staff data and privacy',
        privacy: PRIVACY_EN,
        faqTitle: 'Office Secret Santa FAQ',
        faq: [
            { q: 'Do employees need to sign up?', a: 'No. The organizer runs the draw; employees only open the link sent to them.' },
            { q: "Can I keep people on the same team from drawing each other?", a: 'Yes. Create a group for each team under "Same group must not draw each other". If one group is larger than everyone else combined, the draw is impossible and the site tells you.' },
            { q: 'How many people can join?', a: 'At least 3. There is no fixed upper limit, so large teams work too.' },
            { q: 'Can I send the results by e-mail?', a: "Yes. Each person has an e-mail button that opens a draft with their link in your own e-mail app." },
            { q: 'What if everyone is in the same office?', a: 'Use "Show on this screen" so people take turns on one screen, or print fold-over cards and hand them out.' },
            { q: 'Is there a paid plan?', a: 'No. Every feature, office draws included, is free.' },
        ],
        breadcrumb: 'Office Secret Santa',
        relatedTitle: 'Related pages',
        related: [...SHARED_RELATED_EN.slice(0, 2), { path: '/secret-santa/university', label: 'University and club Secret Santa' }, ...SHARED_RELATED_EN.slice(2)],
    },
};

export const UNIVERSITY_SEO_COPY: Record<string, SantaLandingCopy> = {
    tr: {
        metaTitle: 'Üniversite ve Öğrenci Kulübü Yılbaşı Çekilişi | YulaSanta',
        metaDescription:
            'Yurt, ev arkadaşları, bölüm ve öğrenci kulüpleri için ücretsiz yılbaşı hediye çekilişi. Kişisel linkleri WhatsApp grubuna gerek kalmadan tek tek gönderin.',
        keywords: [
            'üniversite yılbaşı çekilişi',
            'öğrenci kulübü yılbaşı çekilişi',
            'yurt yılbaşı çekilişi',
            'ev arkadaşları yılbaşı çekilişi',
            'bölüm yılbaşı hediyeleşmesi',
            'öğrenci secret santa',
        ],
        h1: 'Kampüste Yılbaşı Hediye Çekilişi',
        intro:
            'Kulüp, bölüm, yurt odası veya ev arkadaşlarınızla yılbaşı hediye çekilişini birkaç dakikada yapın. Herkes kendi linkini telefonundan açar; kimin kimi çektiği hediyeleşme gününe kadar sürpriz kalır.',
        cta: 'Ücretsiz çekiliş yap',
        whyTitle: 'Öğrenciler için neden kullanışlı?',
        why: [
            { title: 'Herkes telefonundan bakar', desc: 'Her kişiye kendi linkini WhatsApp ile gönderin. Tatile çıkmış ya da başka şehirde olan arkadaşlar da katılır.' },
            { title: 'Öğrenci bütçesine uygun', desc: 'Herkesin rahat edeceği bir üst sınır girin; linkte bütçe ve hediyeleşme tarihi görünür.' },
            { title: 'Çiftler birbirini çekmesin', desc: 'Sevgilileri veya oda arkadaşlarını "birbirini çekmesin" kuralıyla ayırın.' },
            { title: 'Kalabalık kulüpler için', desc: 'Üye listesini Excel veya CSV olarak yükleyin. Alt ekipleri gruplara ayırabilirsiniz.' },
            { title: 'İpucu ve hediye fikirleri', desc: 'Herkes için kısa bir ipucu yazın. Linki açan kişi, ipucuna ve bütçeye göre hediye fikirleri de görebilir.' },
            { title: 'Ücretsiz, uygulama yok', desc: 'İndirme, kayıt veya ödeme gerekmez; tarayıcıda çalışır.' },
        ],
        howToTitle: 'Kulüpte veya yurtta yılbaşı çekilişi nasıl yapılır?',
        steps: [
            'Yılbaşı çekilişi sayfasında isimleri yazın ya da üye listesini yükleyin.',
            'İsterseniz birbirini çekmemesi gerekenleri seçin, bütçe ve tarihi girin.',
            'Çekilişi başlatın ve herkese kendi linkini WhatsApp\'tan gönderin.',
            'Linki açan, kime hediye alacağını ve varsa ipucunu görür.',
        ],
        privacyTitle: 'Linkler ve gizlilik',
        privacy: PRIVACY_TR,
        faqTitle: 'Üniversite yılbaşı çekilişi hakkında sorular',
        faq: [
            { q: 'Linki WhatsApp grubuna atabilir miyim?', a: 'Hayır, her linki yalnızca ilgili kişiye gönderin. Linki açan herkes o kişinin sonucunu görür.' },
            { q: 'Arkadaşlarımın kayıt olması gerekiyor mu?', a: 'Hayır. Linki açmak yeterlidir; hesap veya uygulama gerekmez.' },
            { q: 'Organizatör de çekilişe katılabilir mi?', a: 'Evet, kendi adınızı da listeye ekleyin. Linkleri açmadan gönderirseniz sizin için de sürpriz kalır.' },
            { q: 'Ev arkadaşları birbirini çekmesin istiyorum.', a: 'Aynı evdekileri bir gruba koyun; aynı gruptakiler birbirine çıkmaz.' },
            { q: 'Ücretsiz mi?', a: 'Evet, tamamen ücretsizdir.' },
        ],
        breadcrumb: 'Üniversite yılbaşı çekilişi',
        relatedTitle: 'İlgili sayfalar',
        related: [...SHARED_RELATED_TR.slice(0, 2), { path: '/secret-santa/office', label: 'Ofis yılbaşı çekilişi' }, ...SHARED_RELATED_TR.slice(2)],
    },
    en: {
        metaTitle: 'University & Student Club Secret Santa | YulaSanta',
        metaDescription:
            'Free Secret Santa for dorms, flatmates, departments and student clubs. Send each person their own link instead of posting results in the group chat.',
        keywords: [
            'university secret santa',
            'student club secret santa',
            'dorm secret santa',
            'flatmate secret santa',
            'college gift exchange',
        ],
        h1: 'Secret Santa on Campus',
        intro:
            'Run a gift exchange with your club, department, dorm or flatmates in a few minutes. Everyone opens their own link on their phone, and who drew whom stays a surprise until exchange day.',
        cta: 'Start a free draw',
        whyTitle: 'Why students use it',
        why: [
            { title: 'Everyone checks on their phone', desc: 'Send each person their own link on WhatsApp. Friends who are away or in another city can join too.' },
            { title: 'Student-friendly budget', desc: 'Set a limit everyone is happy with; the budget and exchange date appear on the link.' },
            { title: "Couples don't draw each other", desc: 'Keep partners or roommates apart with a "must not draw each other" rule.' },
            { title: 'For big clubs', desc: 'Upload the member list as Excel or CSV and split sub-teams into groups.' },
            { title: 'Hints and gift ideas', desc: 'Write a short hint for each person. Whoever opens the link can also get gift ideas based on the hint and budget.' },
            { title: 'Free, no app', desc: 'Nothing to download, no account, no payment; it runs in the browser.' },
        ],
        howToTitle: 'How to run Secret Santa in a club or dorm',
        steps: [
            'On the Secret Santa page, type the names or upload the member list.',
            'Optionally pick who must not draw each other and add a budget and date.',
            'Start the draw and send everyone their own link on WhatsApp.',
            'Whoever opens a link sees who to buy for, plus the hint if there is one.',
        ],
        privacyTitle: 'Links and privacy',
        privacy: PRIVACY_EN,
        faqTitle: 'University Secret Santa FAQ',
        faq: [
            { q: 'Can I post the links in the group chat?', a: "No, send each link only to its owner. Anyone who opens a link sees that person's result." },
            { q: 'Do my friends need to sign up?', a: 'No. Opening the link is enough; no account or app needed.' },
            { q: 'Can the organizer join the draw?', a: 'Yes, add your own name. If you send the links without opening them, your match stays a surprise too.' },
            { q: "Can I keep flatmates from drawing each other?", a: 'Put everyone from the same flat in a group; people in the same group are never matched.' },
            { q: 'Is it free?', a: 'Yes, completely free.' },
        ],
        breadcrumb: 'University Secret Santa',
        relatedTitle: 'Related pages',
        related: [...SHARED_RELATED_EN.slice(0, 2), { path: '/secret-santa/office', label: 'Office Secret Santa' }, ...SHARED_RELATED_EN.slice(2)],
    },
};
