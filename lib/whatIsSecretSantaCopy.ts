/**
 * Copy for /secret-santa/what-is (Turkish slug /secret-santa-nedir redirects
 * here). An explainer, not a tool page: what Secret Santa is, the usual rules,
 * how to run it on paper or online, and budget/gift tips. Turkish and English
 * only. Claims about YulaSanta must match the tool (see lib/secretSantaSeoCopy.ts).
 */
export type WhatIsCopy = {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    breadcrumb: string;
    h1: string;
    lead: string;
    sections: { id: string; title: string; paragraphs?: string[]; items?: string[] }[];
    ctaTitle: string;
    ctaText: string;
    cta: string;
    faqTitle: string;
    faq: { q: string; a: string }[];
    relatedTitle: string;
    related: { path: string; label: string }[];
};

export const WHAT_IS_COPY: Record<string, WhatIsCopy> = {
    tr: {
        metaTitle: 'Secret Santa Nedir? Kuralları ve Nasıl Oynanır | YulaSanta',
        metaDescription:
            'Secret Santa (yılbaşı hediye çekilişi) nedir, nasıl oynanır, kuralları nelerdir? Kağıtla ve online çekiliş, bütçe belirleme ve hediye seçimi için pratik ipuçları.',
        keywords: ['secret santa nedir', 'secret santa nasıl oynanır', 'yılbaşı hediye çekilişi nedir', 'gizli noel baba nedir', 'secret santa kuralları', 'yılbaşı hediyeleşmesi nasıl yapılır'],
        breadcrumb: 'Secret Santa nedir?',
        h1: 'Secret Santa Nedir?',
        lead:
            'Secret Santa, bir grubun her üyesine rastgele bir kişinin çıktığı ve herkesin çıkan kişiye gizlice hediye aldığı bir hediyeleşme oyunudur. Türkiye\'de çoğunlukla "yılbaşı hediye çekilişi", "yılbaşı kurası" veya "gizli Noel Baba" olarak bilinir.',
        sections: [
            {
                id: 'nasil-oynanir',
                title: 'Nasıl oynanır?',
                paragraphs: [
                    'Önce katılacak kişiler belirlenir. Ardından her katılımcıya, kendisi dışındaki kişilerden biri rastgele eşlenir. Herkes yalnızca kendi eşleşmesini bilir. Kararlaştırılan günde hediyeler verilir; hediyeyi kimin aldığı ya o gün açıklanır ya da hiç açıklanmaz.',
                    'Oyunun tadı, herkesin bir hediye alması ve bir hediye vermesinden gelir. Kimse dışarıda kalmaz ve herkes yalnızca tek bir kişiye hediye alır, bu da bütçeyi rahatlatır.',
                ],
            },
            {
                id: 'kurallar',
                title: 'Temel kurallar',
                items: [
                    'Kimse kendi adını çekmez.',
                    'Herkes tam olarak bir kişiye hediye alır ve bir kişiden hediye alır.',
                    'Eşleşmeler gizli tutulur; kimin kimi çektiği sorulmaz, söylenmez.',
                    'Herkes için aynı bütçe üst sınırı geçerlidir.',
                    'Hediyeleşme günü ve yeri önceden duyurulur.',
                    'İsteğe bağlı: eşler, kardeşler veya aynı evde yaşayanlar birbirini çekmez.',
                ],
            },
            {
                id: 'kagit-mi-online-mi',
                title: 'Kağıtla mı, online mı?',
                paragraphs: [
                    'Klasik yöntemde isimler kağıtlara yazılır, katlanır ve bir torbadan çekilir. Bu yöntem herkesin aynı yerde olmasını gerektirir. Biri kendi adını çekerse kura baştan yapılır, "birbirini çekmesin" gibi kuralları uygulamak ise neredeyse imkânsızdır.',
                    'Online çekilişte isimleri bir kez yazarsınız; kimsenin kendine çıkmadığı eşleşmeler saniyeler içinde hazırlanır ve kurallar otomatik uygulanır. Uzaktaki katılımcılar sonucu telefondan öğrenir. Telefonu olmayan öğrenciler için yazdırılabilir kartlar kullanılabilir.',
                ],
            },
            {
                id: 'butce',
                title: 'Bütçe nasıl belirlenir?',
                paragraphs: [
                    'Herkesin rahat edeceği tek bir üst sınır belirleyin ve çekilişten önce duyurun. Öğrenci gruplarında ve sınıflarda düşük, sembolik bir tutar; ofislerde ise ekibin ortak kararıyla belirlenen bir tutar genellikle iyi sonuç verir. Bütçeyi çekiliş linkine veya kartlara yazmak, sonradan çıkabilecek "ne kadarlık alalım?" sorusunu ortadan kaldırır.',
                ],
            },
            {
                id: 'hediye',
                title: 'İyi bir hediye nasıl seçilir?',
                items: [
                    'Kişinin hobilerini veya sık kullandığı şeyleri düşünün.',
                    'Organizatörden kısa bir ipucu isteyin ya da katılımcılardan birer cümlelik istek listesi toplayın.',
                    'Emin değilseniz herkesin kullanabileceği küçük ve kullanışlı bir şey seçin.',
                    'Kişisel bir not eklemek, hediyeyi bütçesinden daha değerli kılar.',
                ],
            },
        ],
        ctaTitle: 'Kendi yılbaşı çekilişini başlat',
        ctaText: 'İsimleri ekle, istersen kuralları ve bütçeyi yaz, herkese kendi linkini gönder ya da kartları yazdır. Ücretsiz ve kayıtsız.',
        cta: 'Ücretsiz Çekiliş Yap',
        faqTitle: 'Sık sorulan sorular',
        faq: [
            { q: 'Secret Santa ile yılbaşı çekilişi aynı şey mi?', a: 'Evet, hediyeleşme anlamında aynı şeydir. Ancak "yılbaşı çekilişi" Milli Piyango için de kullanıldığından, hediyeleşmeyi kastederken "yılbaşı hediye çekilişi" demek daha açıktır.' },
            { q: 'Secret Santa için en az kaç kişi gerekir?', a: 'En az 3 kişi gerekir. İki kişiyle eşleşme gizli kalamaz, çünkü herkes karşısındakini çekmiş olur.' },
            { q: 'Hediyeyi kimin aldığı açıklanmalı mı?', a: 'Bu grubun tercihine kalmıştır. Bazı gruplar hediyeleşme günü tahmin oyunu oynar, bazıları ise sırrı hiç açıklamaz.' },
            { q: 'Katılımcıların aynı yerde olması gerekir mi?', a: 'Online çekilişte hayır. Herkes kendi sonucunu telefonundan öğrenir; sadece hediyeleşme için bir araya gelmek yeterlidir.' },
        ],
        relatedTitle: 'İlgili sayfalar',
        related: [
            { path: '/secret-santa', label: 'Yılbaşı hediye çekilişi yap' },
            { path: '/secret-santa/classroom', label: 'Sınıf yılbaşı çekilişi' },
            { path: '/secret-santa/office', label: 'Ofis yılbaşı çekilişi' },
            { path: '/secret-santa/university', label: 'Üniversite ve kulüp çekilişi' },
            { path: '/tools/gift-suggestions', label: 'Hediye önerileri' },
        ],
    },
    en: {
        metaTitle: 'What Is Secret Santa? Rules and How to Play | YulaSanta',
        metaDescription:
            'What Secret Santa is, how it works and the usual rules. Paper vs online draws, setting a budget and choosing a good gift, with practical tips.',
        keywords: ['what is secret santa', 'how does secret santa work', 'secret santa rules', 'how to play secret santa', 'secret santa budget'],
        breadcrumb: 'What is Secret Santa?',
        h1: 'What Is Secret Santa?',
        lead:
            'Secret Santa is a gift exchange in which every member of a group is randomly assigned one other person and secretly buys them a gift. It is also called a gift draw, Kris Kringle or a holiday gift exchange.',
        sections: [
            {
                id: 'how-it-works',
                title: 'How it works',
                paragraphs: [
                    'First the group agrees who is taking part. Then each participant is randomly matched with someone other than themselves. Everyone knows only their own match. On the agreed day the gifts are handed over; who gave what is either revealed then or never at all.',
                    'Everyone gives one gift and gets one gift, so nobody is left out and nobody has to buy for the whole group.',
                ],
            },
            {
                id: 'rules',
                title: 'The usual rules',
                items: [
                    'Nobody draws their own name.',
                    'Everyone buys for exactly one person and receives from exactly one person.',
                    'Matches stay secret; nobody asks or tells.',
                    'The same spending limit applies to everyone.',
                    'The exchange day and place are announced in advance.',
                    'Optional: partners, siblings or flatmates do not draw each other.',
                ],
            },
            {
                id: 'paper-or-online',
                title: 'Paper or online?',
                paragraphs: [
                    'The classic way is to write names on slips of paper and draw them from a hat. Everyone has to be in the same place, the draw restarts whenever someone picks their own name, and rules like "these two must not draw each other" are almost impossible to apply.',
                    'An online draw takes the names once, makes matches where nobody gets themselves in seconds and applies the rules automatically. People far away find out on their phone, and printable cards work for students without phones.',
                ],
            },
            {
                id: 'budget',
                title: 'How to set a budget',
                paragraphs: [
                    'Pick one limit that everyone is comfortable with and announce it before the draw. Small, symbolic amounts suit students and classrooms; offices usually agree on an amount as a team. Putting the budget on the link or card avoids the "how much should I spend?" question later.',
                ],
            },
            {
                id: 'gifts',
                title: 'Choosing a good gift',
                items: [
                    'Think about their hobbies or the things they use every day.',
                    'Ask the organizer for a short hint, or collect one-line wish lists from everyone.',
                    'When unsure, choose something small and useful that anyone would like.',
                    'A personal note makes a gift worth more than its price.',
                ],
            },
        ],
        ctaTitle: 'Start your own Secret Santa',
        ctaText: 'Add the names, optionally set rules and a budget, then send everyone their own link or print cards. Free, no sign-up.',
        cta: 'Start a free draw',
        faqTitle: 'Frequently asked questions',
        faq: [
            { q: 'How many people do you need for Secret Santa?', a: 'At least 3. With two people the match cannot stay secret, since each one simply gets the other.' },
            { q: 'Should the giver be revealed?', a: 'It is up to the group. Some play a guessing game on exchange day, others never reveal it.' },
            { q: 'Does everyone need to be in the same place?', a: 'Not with an online draw. Everyone finds out on their phone, and you only meet up to exchange gifts.' },
        ],
        relatedTitle: 'Related pages',
        related: [
            { path: '/secret-santa', label: 'Run a Secret Santa draw' },
            { path: '/secret-santa/classroom', label: 'Classroom Secret Santa' },
            { path: '/secret-santa/office', label: 'Office Secret Santa' },
            { path: '/secret-santa/university', label: 'University and club Secret Santa' },
            { path: '/tools/gift-suggestions', label: 'Gift ideas' },
        ],
    },
};
