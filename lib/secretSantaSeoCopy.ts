/**
 * Long-form SEO copy for /secret-santa, one entry per locale. Every claim here must match how the
 * tool actually works: the draw runs in the browser, each person can get a personal link whose match
 * sits in the URL fragment (never sent to the server), "must not draw each other" rules are supported,
 * "same group" rules, printable fold-over cards (5 per A4 page), e-mail/SMS/WhatsApp sending,
 * and only PDF uploads and optional AI gift ideas (hint + budget, no names) reach the server.
 * In Turkish, "yılbaşı çekilişi" alone also means the Milli Piyango lottery, so the copy says "hediye".
 */
export type SecretSantaSeoCopy = {
    pageName: string;
    title: string;
    paragraphs: string[];
    howToTitle: string;
    steps: string[];
    featuresTitle?: string;
    features?: { title: string; desc: string }[];
    faqTitle: string;
    faq: { q: string; a: string }[];
    relatedTitle: string;
    related: { path: string; label: string }[];
};

const RAFFLE = '/raffle';
const GIFTS = '/tools/gift-suggestions';
const WHEEL = '/tools/wheel-of-fortune';
const YOUTUBE = '/youtube';
const TIKTOK = '/tiktok';
const CLASSROOM = '/secret-santa/classroom';

export const SECRET_SANTA_SEO_COPY: Record<string, SecretSantaSeoCopy> = {
    tr: {
        pageName: 'Yılbaşı Hediye Çekilişi',
        title: 'Online yılbaşı hediye çekilişi (Secret Santa) nasıl yapılır?',
        paragraphs: [
            'YulaSanta ile arkadaşlarınız, aileniz, sınıfınız veya ofisinizle saniyeler içinde yılbaşı hediye çekilişi yapın. Gizli kurayı başlatın, herkes kime hediye alacağını öğrensin. Kayıt, e-posta veya ödeme gerekmez.',
            'Yılbaşı hediye çekilişi, Secret Santa veya gizli Noel Baba olarak da bilinir: Her katılımcıya rastgele bir kişi çıkar ve o kişiye hediye alır. Hediyeyi kimin aldığı yılbaşı gününe kadar sürpriz kalır. Kağıda isim yazıp torbadan çekmeye gerek kalmaz ve kimse kendi adını çekmez.',
            'İsimleri tek tek yazabilir ya da Excel, CSV veya PDF listesi yükleyebilirsiniz. Eşleşmeler tarayıcınızda hesaplanır ve cihazınızda saklanır. Excel ve CSV dosyaları da tarayıcıda okunur; PDF dosyası yalnızca isimleri çıkarmak için sunucuda işlenir ve kaydedilmez.',
        ],
        howToTitle: 'Yılbaşı çekilişi nasıl yapılır?',
        steps: [
            'Katılımcı isimlerini ekleyin (gizli çekiliş için en az 3 kişi) veya Excel, CSV ya da PDF listesi yükleyin.',
            'İsterseniz "birbirini çekmesin" kuralları ekleyin, bütçe ve tarihi yazın, ardından "Yılbaşı Çekilişi" modunda çekilişi başlatın.',
            'Herkese WhatsApp\'tan kendi linkini gönderin ya da aynı ortamdaysanız aynı ekrandan sırayla bakın. Herkes yalnızca kendi sonucunu görür.',
        ],
        featuresTitle: 'Kimler için uygun?',
        features: [
            { title: 'Sınıf ve okul', desc: 'Öğretmenler sınıf listesini yükleyip her öğrenci için katlanabilir kart yazdırabilir. Telefon veya öğrenci hesabı gerekmez.' },
            { title: 'Ofis ve iş yeri', desc: 'Ekibinizin listesini yapıştırın, ofis yılbaşı çekilişini toplantıda birkaç dakikada bitirin.' },
            { title: 'Aile', desc: 'Kalabalık ailede her haneyi bir gruba koyun; aynı evdekiler birbirine çıkmaz.' },
            { title: 'Arkadaş grubu', desc: 'Herkes farklı şehirde olsa bile kişisel linkleri WhatsApp\'tan gönderin.' },
        ],
        faqTitle: 'Yılbaşı hediye çekilişi hakkında sık sorulan sorular',
        faq: [
            { q: 'Yılbaşı çekilişi ücretsiz mi?', a: 'Evet. Online yılbaşı hediye çekilişi tamamen ücretsizdir; kayıt, e-posta veya ödeme gerekmez.' },
            { q: 'Bu sayfa Milli Piyango yılbaşı çekilişi mi?', a: 'Hayır. YulaSanta, arkadaşlar, aileler, sınıflar ve ofisler arasında yapılan hediye çekilişi aracıdır. Bilet veya ikramiye yoktur.' },
            { q: 'Secret Santa nedir?', a: 'Her katılımcının rastgele çıkan bir kişiye gizlice hediye aldığı gelenektir. Türkiye\'de yılbaşı hediye çekilişi olarak da bilinir.' },
            { q: 'Kaç kişi gerekir?', a: 'Gizli çekiliş için en az 3 kişi gerekir. Üst sınır yoktur; kalabalık sınıf ve ofislerde de kullanılabilir. Direkt eşleşme modunda ise kişi sayısı çift olmalıdır.' },
            { q: 'Birisi kendine çıkar mı?', a: 'Hayır. Algoritma herkese başka birini atar; kimse kendi adını çekmez.' },
            { q: 'Çekiliş sonucu nasıl gizli kalır?', a: 'Her katılımcıya ayrı bir link gönderebilirsiniz; mesajda kimi çektiği yazmaz, sonucu yalnızca linki açan görür. Aynı ekrandan sırayla baktığınızda da herkes sonucunu bir kez görür, sonra adı listede kilitlenir.' },
            { q: 'Uzaktaki arkadaşlarımla çekiliş yapabilir miyim?', a: 'Evet. Çekilişten sonra her kişinin linkini WhatsApp\'tan gönderin ya da kopyalayıp paylaşın. Linkleri organizatör oluşturduğu için başkasının linkini açarsa o sonucu görebilir; bu yüzden linkleri açmadan göndermesi yeterlidir.' },
            { q: 'Eşler veya kardeşler birbirini çekmesin diye ayar var mı?', a: 'Evet. "Kurallar ve detaylar" bölümünden birbirini çekmemesi gereken kişileri seçebilirsiniz. Kurallarla çekiliş mümkün değilse site bunu söyler.' },
            { q: 'Okul veya sınıf için uygun mu?', a: 'Evet. Çekilişten sonra "Kart yazdır"ı seçin: her öğrenci için ismi dışarıda, sonucu içeride kalan katlanabilir bir kart çıkar. Bir A4 sayfaya 5 kart sığar, telefon gerekmez.' },
            { q: 'Kalabalık ailede aynı evdekiler birbirini çekmesin diye ne yapabilirim?', a: '"Aynı gruptakiler birbirini çekmesin" bölümünde her hane veya ekip için bir grup oluşturun. Aynı gruptakiler birbirine çıkmaz.' },
            { q: 'Sonuçları e-posta veya SMS ile gönderebilir miyim?', a: 'Evet. Link ekranında her kişi için WhatsApp, e-posta ve (telefonda) SMS butonları vardır. Mesajda kimi çektiği yazmaz.' },
            { q: 'Hediye bütçesi ne kadar olmalı?', a: 'Çekilişten önce herkesin rahat edeceği tek bir üst sınır belirleyin. Fikir bulamayanlar hediye önerileri aracımıza bakabilir.' },
            { q: 'Sonuçlar sitede yayınlanır mı?', a: 'Hayır. Eşleşmeler yalnızca sizin tarayıcınızda saklanır ve sitede yayınlanmaz.' },
        ],
        relatedTitle: 'İlgili araçlar',
        related: [
            { path: CLASSROOM, label: 'Sınıf yılbaşı çekilişi (kart yazdır)' },
            { path: GIFTS, label: 'Yılbaşı hediye önerileri' },
            { path: RAFFLE, label: 'İsim çekilişi yap' },
            { path: WHEEL, label: 'Çarkıfelek çevir' },
            { path: YOUTUBE, label: 'YouTube çekilişi' },
            { path: TIKTOK, label: 'TikTok çekilişi' },
        ],
    },
    en: {
        pageName: 'Online Secret Santa',
        title: 'How online Secret Santa works',
        paragraphs: [
            'Run a free Secret Santa draw with friends, family, a classroom or your office in seconds. Start the secret draw and everyone finds out who to buy a gift for. No account, email or payment needed.',
            'In Secret Santa, each person is randomly assigned someone to buy a gift for, and who gave what stays a surprise. There are no paper slips to draw, and nobody gets their own name.',
            'Type names one by one or upload an Excel, CSV or PDF list. Matches are computed and stored in your browser. Excel and CSV files are read in the browser too; a PDF is processed on the server only to extract names and is not saved.',
        ],
        howToTitle: 'How to run Secret Santa',
        steps: [
            'Add participant names (at least 3 for a secret draw) or upload an Excel, CSV or PDF list.',
            'Optionally add "must not draw each other" rules, a budget and a date, then start the secret draw.',
            'Send each person their own link on WhatsApp, or take turns on one screen if you are together. Everyone sees only their own result.',
        ],
        featuresTitle: 'Who it is for',
        features: [
            { title: 'Classrooms', desc: 'Teachers can upload a class list and print a fold-over card for each student. No phones or student accounts needed.' },
            { title: 'Offices', desc: 'Paste your team list and finish the office gift exchange in a few minutes.' },
            { title: 'Families', desc: 'Put each household in a group so people living together never draw each other.' },
            { title: 'Friends', desc: 'Even when everyone lives in a different city, send personal links on WhatsApp.' },
        ],
        faqTitle: 'Secret Santa FAQ',
        faq: [
            { q: 'Is online Secret Santa free?', a: 'Yes. No account, email or payment is required.' },
            { q: 'How many people do I need?', a: 'At least 3 for a secret draw. There is no upper limit. Direct match mode needs an even number of people.' },
            { q: 'Can someone draw themselves?', a: 'No. Everyone is assigned a different person.' },
            { q: 'How do results stay secret?', a: 'Send each person their own link: the message does not say who they drew, and only whoever opens the link sees it. When taking turns on one screen, each person sees their result once and then their name is locked.' },
            { q: 'Can I run it with people who are far away?', a: 'Yes. After the draw, send each person their link on WhatsApp or copy and share it. The organizer creates the links, so opening someone else\'s would show that result; just send them without opening.' },
            { q: 'Can I stop couples or siblings drawing each other?', a: 'Yes. Under "Rules and details", pick people who must not draw each other. If the rules make the draw impossible, the site tells you.' },
            { q: 'Can I use it in a classroom?', a: 'Yes. After the draw, choose "Print cards": each student gets a fold-over card with their name outside and their result inside. Five cards fit on an A4 page, no phones needed.' },
            { q: 'Can I send results by email or text?', a: 'Yes. The links screen has WhatsApp, email and (on phones) SMS buttons for each person. The message does not say who they drew.' },
            { q: 'Are results published on the site?', a: 'No. Matches are stored only in your browser.' },
        ],
        relatedTitle: 'Related tools',
        related: [
            { path: CLASSROOM, label: 'Classroom Secret Santa (printable cards)' },
            { path: GIFTS, label: 'Gift suggestions' },
            { path: RAFFLE, label: 'Use the name picker' },
            { path: WHEEL, label: 'Spin the wheel' },
            { path: YOUTUBE, label: 'YouTube giveaway' },
            { path: TIKTOK, label: 'TikTok giveaway' },
        ],
    },
    de: {
        pageName: 'Online Wichteln',
        title: 'So funktioniert Wichteln online',
        paragraphs: [
            'Wichteln Sie kostenlos und in Sekunden mit Freunden, Familie, Schulklasse oder Büro. Starten Sie die geheime Auslosung, und jeder erfährt, wen er beschenkt. Ohne Konto, E-Mail oder Zahlung.',
            'Geben Sie die Namen einzeln ein oder laden Sie eine Excel-, CSV- oder PDF-Liste hoch. Die Zuordnungen werden in Ihrem Browser berechnet und gespeichert. Eine PDF-Datei wird nur zum Auslesen der Namen auf dem Server verarbeitet und nicht gespeichert.',
        ],
        howToTitle: 'So geht Wichteln',
        steps: [
            'Fügen Sie die Namen hinzu (mindestens 3 Personen) oder laden Sie eine Liste hoch.',
            'Starten Sie die geheime Auslosung.',
            'Senden Sie jeder Person ihren eigenen Link per WhatsApp oder geben Sie das Gerät herum. Jede Person sieht nur ihr eigenes Ergebnis.',
        ],
        faqTitle: 'Häufige Fragen zum Wichteln',
        faq: [
            { q: 'Ist Online-Wichteln kostenlos?', a: 'Ja. Konto, E-Mail oder Zahlung sind nicht nötig.' },
            { q: 'Wie viele Personen braucht man?', a: 'Für die geheime Auslosung mindestens 3. Eine Obergrenze gibt es nicht.' },
            { q: 'Kann jemand sich selbst ziehen?', a: 'Nein. Jede Person bekommt jemand anderen zugeteilt.' },
            { q: 'Geht es auch aus der Ferne?', a: 'Ja. Senden Sie nach der Auslosung jeder Person ihren persönlichen Link, etwa per WhatsApp. Paare oder Geschwister können Sie per Regel voneinander ausschließen.' },
            { q: 'Geht es auch in der Schulklasse?', a: 'Ja. Nach der Auslosung „Karten drucken“ wählen: Jedes Kind bekommt eine Faltkarte, 5 Karten pro A4-Seite, ganz ohne Handy.' },
        ],
        relatedTitle: 'Ähnliche Tools',
        related: [
            { path: CLASSROOM, label: 'Wichteln in der Klasse (Karten drucken)' },
            { path: GIFTS, label: 'Geschenkideen' },
            { path: RAFFLE, label: 'Namensauslosung' },
            { path: WHEEL, label: 'Glücksrad drehen' },
        ],
    },
    fr: {
        pageName: 'Père Noël Secret en ligne',
        title: 'Comment fonctionne le Père Noël Secret en ligne',
        paragraphs: [
            'Organisez gratuitement un Père Noël Secret en quelques secondes entre amis, en famille, en classe ou au bureau. Lancez le tirage secret et chacun découvre à qui offrir un cadeau. Sans compte, e-mail ni paiement.',
            'Saisissez les noms un par un ou importez une liste Excel, CSV ou PDF. Les associations sont calculées et enregistrées dans votre navigateur. Un fichier PDF est traité sur le serveur uniquement pour extraire les noms et n\'est pas conservé.',
        ],
        howToTitle: 'Comment organiser le tirage',
        steps: [
            'Ajoutez les noms (au moins 3 personnes) ou importez une liste.',
            'Lancez le tirage secret.',
            'Envoyez à chacun son propre lien par WhatsApp, ou faites passer l\'appareil. Chacun ne voit que son propre résultat.',
        ],
        faqTitle: 'Questions fréquentes sur le Père Noël Secret',
        faq: [
            { q: 'Le Père Noël Secret en ligne est-il gratuit ?', a: 'Oui. Aucun compte, e-mail ni paiement n\'est nécessaire.' },
            { q: 'Combien de personnes faut-il ?', a: 'Au moins 3 pour un tirage secret. Il n\'y a pas de limite maximale.' },
            { q: 'Peut-on se tirer soi-même ?', a: 'Non. Chacun se voit attribuer une autre personne.' },
            { q: 'Peut-on l\'organiser à distance ?', a: 'Oui. Après le tirage, envoyez à chacun son lien personnel, par exemple sur WhatsApp. Vous pouvez aussi empêcher des couples ou des frères et sœurs de se tirer.' },
            { q: 'Peut-on l\'utiliser en classe ?', a: 'Oui. Après le tirage, choisissez « Imprimer des cartes » : chaque élève reçoit une carte pliable, 5 cartes par page A4, sans téléphone.' },
        ],
        relatedTitle: 'Outils similaires',
        related: [
            { path: CLASSROOM, label: 'Père Noël Secret en classe (cartes à imprimer)' },
            { path: GIFTS, label: 'Idées de cadeaux' },
            { path: RAFFLE, label: 'Tirage de noms' },
            { path: WHEEL, label: 'Faire tourner la roue' },
        ],
    },
    es: {
        pageName: 'Amigo Invisible online',
        title: 'Cómo funciona el Amigo Invisible online',
        paragraphs: [
            'Organiza gratis un Amigo Invisible en segundos con amigos, familia, clase u oficina. Inicia el sorteo secreto y cada persona descubre a quién debe regalar. Sin cuenta, correo ni pago.',
            'Escribe los nombres uno a uno o sube una lista en Excel, CSV o PDF. Las parejas se calculan y se guardan en tu navegador. Un archivo PDF se procesa en el servidor solo para extraer los nombres y no se guarda.',
        ],
        howToTitle: 'Cómo hacer el sorteo',
        steps: [
            'Añade los nombres (al menos 3 personas) o sube una lista.',
            'Inicia el sorteo secreto.',
            'Envía a cada persona su propio enlace por WhatsApp o pasa el dispositivo. Cada uno ve solo su propio resultado.',
        ],
        faqTitle: 'Preguntas frecuentes sobre el Amigo Invisible',
        faq: [
            { q: '¿El Amigo Invisible online es gratis?', a: 'Sí. No necesitas cuenta, correo ni pago.' },
            { q: '¿Cuántas personas hacen falta?', a: 'Al menos 3 para el sorteo secreto. No hay límite máximo.' },
            { q: '¿Puede tocarle a alguien su propio nombre?', a: 'No. A cada persona se le asigna otra distinta.' },
            { q: '¿Se puede hacer a distancia?', a: 'Sí. Tras el sorteo, envía a cada persona su enlace personal, por ejemplo por WhatsApp. También puedes evitar que parejas o hermanos se toquen entre sí.' },
            { q: '¿Sirve para una clase?', a: 'Sí. Tras el sorteo elige «Imprimir tarjetas»: cada alumno recibe una tarjeta plegable, 5 por hoja A4, sin móviles.' },
        ],
        relatedTitle: 'Herramientas relacionadas',
        related: [
            { path: CLASSROOM, label: 'Amigo Invisible en clase (tarjetas imprimibles)' },
            { path: GIFTS, label: 'Ideas de regalos' },
            { path: RAFFLE, label: 'Sorteo de nombres' },
            { path: WHEEL, label: 'Girar la ruleta' },
        ],
    },
    it: {
        pageName: 'Babbo Natale Segreto online',
        title: 'Come funziona il Babbo Natale Segreto online',
        paragraphs: [
            'Organizza gratis un Babbo Natale Segreto in pochi secondi con amici, famiglia, classe o ufficio. Avvia l\'estrazione segreta e ognuno scopre a chi fare il regalo. Senza account, email o pagamento.',
            'Inserisci i nomi uno alla volta o carica un elenco Excel, CSV o PDF. Gli abbinamenti vengono calcolati e salvati nel tuo browser. Un file PDF viene elaborato sul server solo per estrarre i nomi e non viene salvato.',
        ],
        howToTitle: 'Come fare l\'estrazione',
        steps: [
            'Aggiungi i nomi (almeno 3 persone) o carica un elenco.',
            'Avvia l\'estrazione segreta.',
            'Invia a ognuno il proprio link su WhatsApp o passa il dispositivo. Ognuno vede solo il proprio risultato.',
        ],
        faqTitle: 'Domande frequenti sul Babbo Natale Segreto',
        faq: [
            { q: 'Il Babbo Natale Segreto online è gratis?', a: 'Sì. Non servono account, email o pagamenti.' },
            { q: 'Quante persone servono?', a: 'Almeno 3 per l\'estrazione segreta. Non c\'è un limite massimo.' },
            { q: 'Si può estrarre il proprio nome?', a: 'No. A ogni persona viene assegnata una persona diversa.' },
            { q: 'Si può fare a distanza?', a: 'Sì. Dopo l\'estrazione, invia a ognuno il suo link personale, ad esempio su WhatsApp. Puoi anche evitare che coppie o fratelli si estraggano a vicenda.' },
            { q: 'Si può usare in classe?', a: 'Sì. Dopo l\'estrazione scegli «Stampa biglietti»: ogni alunno riceve un biglietto pieghevole, 5 per foglio A4, senza telefoni.' },
        ],
        relatedTitle: 'Strumenti correlati',
        related: [
            { path: CLASSROOM, label: 'Babbo Natale Segreto in classe (biglietti da stampare)' },
            { path: GIFTS, label: 'Idee regalo' },
            { path: RAFFLE, label: 'Estrazione nomi' },
            { path: WHEEL, label: 'Gira la ruota' },
        ],
    },
    pt: {
        pageName: 'Amigo Secreto online',
        title: 'Como funciona o Amigo Secreto online',
        paragraphs: [
            'Faça um Amigo Secreto grátis em segundos com amigos, família, turma ou escritório. Inicie o sorteio secreto e cada pessoa descobre para quem dar o presente. Sem conta, e-mail ou pagamento.',
            'Digite os nomes um a um ou envie uma lista em Excel, CSV ou PDF. Os pares são calculados e salvos no seu navegador. Um arquivo PDF é processado no servidor apenas para extrair os nomes e não é salvo.',
        ],
        howToTitle: 'Como fazer o sorteio',
        steps: [
            'Adicione os nomes (pelo menos 3 pessoas) ou envie uma lista.',
            'Inicie o sorteio secreto.',
            'Envie a cada pessoa o próprio link pelo WhatsApp ou passe o dispositivo. Cada um vê só o próprio resultado.',
        ],
        faqTitle: 'Perguntas frequentes sobre o Amigo Secreto',
        faq: [
            { q: 'O Amigo Secreto online é grátis?', a: 'Sim. Não é preciso conta, e-mail ou pagamento.' },
            { q: 'Quantas pessoas são necessárias?', a: 'Pelo menos 3 para o sorteio secreto. Não há limite máximo.' },
            { q: 'Alguém pode tirar o próprio nome?', a: 'Não. Cada pessoa recebe uma pessoa diferente.' },
            { q: 'Dá para fazer à distância?', a: 'Sim. Depois do sorteio, envie a cada pessoa o link pessoal, por exemplo pelo WhatsApp. Também dá para impedir que casais ou irmãos tirem um ao outro.' },
            { q: 'Dá para usar na escola?', a: 'Sim. Depois do sorteio, escolha «Imprimir cartões»: cada aluno recebe um cartão dobrável, 5 por folha A4, sem celular.' },
        ],
        relatedTitle: 'Ferramentas relacionadas',
        related: [
            { path: CLASSROOM, label: 'Amigo Secreto na escola (cartões para imprimir)' },
            { path: GIFTS, label: 'Ideias de presentes' },
            { path: RAFFLE, label: 'Sorteio de nomes' },
            { path: WHEEL, label: 'Girar a roleta' },
        ],
    },
    ru: {
        pageName: 'Тайный Санта онлайн',
        title: 'Как работает Тайный Санта онлайн',
        paragraphs: [
            'Проведите бесплатную жеребьёвку Тайного Санты за секунды с друзьями, семьёй, классом или коллегами. Запустите тайную жеребьёвку, и каждый узнает, кому дарить подарок. Без аккаунта, почты и оплаты.',
            'Вводите имена по одному или загрузите список Excel, CSV или PDF. Пары рассчитываются и хранятся в вашем браузере. PDF-файл обрабатывается на сервере только для извлечения имён и не сохраняется.',
        ],
        howToTitle: 'Как провести жеребьёвку',
        steps: [
            'Добавьте имена (минимум 3 человека) или загрузите список.',
            'Запустите тайную жеребьёвку.',
            'Отправьте каждому личную ссылку в WhatsApp или передавайте устройство по кругу. Каждый видит только свой результат.',
        ],
        faqTitle: 'Частые вопросы о Тайном Санте',
        faq: [
            { q: 'Тайный Санта онлайн бесплатный?', a: 'Да. Аккаунт, почта и оплата не нужны.' },
            { q: 'Сколько нужно человек?', a: 'Минимум 3 для тайной жеребьёвки. Верхнего предела нет.' },
            { q: 'Может ли человеку выпасть он сам?', a: 'Нет. Каждому назначается другой человек.' },
            { q: 'Можно ли провести её удалённо?', a: 'Да. После жеребьёвки отправьте каждому личную ссылку, например в WhatsApp. Можно также запретить парам или родственникам вытягивать друг друга.' },
            { q: 'Подходит ли для школьного класса?', a: 'Да. После жеребьёвки выберите «Распечатать карточки»: каждый ученик получит складную карточку, 5 штук на листе A4, без телефонов.' },
        ],
        relatedTitle: 'Похожие инструменты',
        related: [
            { path: CLASSROOM, label: 'Тайный Санта в классе (карточки для печати)' },
            { path: GIFTS, label: 'Идеи подарков' },
            { path: RAFFLE, label: 'Розыгрыш имён' },
            { path: WHEEL, label: 'Крутить колесо фортуны' },
        ],
    },
    ar: {
        pageName: 'سانتا السري عبر الإنترنت',
        title: 'كيف يعمل سانتا السري عبر الإنترنت',
        paragraphs: [
            'أجرِ قرعة سانتا السري مجانًا خلال ثوانٍ مع الأصدقاء أو العائلة أو الصف أو زملاء العمل. ابدأ القرعة السرية ليعرف كل شخص لمن سيقدّم هديته. بدون حساب أو بريد إلكتروني أو دفع.',
            'اكتب الأسماء واحدًا تلو الآخر أو حمّل قائمة Excel أو CSV أو PDF. تُحسب النتائج وتُحفظ في متصفحك. تتم معالجة ملف PDF على الخادم لاستخراج الأسماء فقط ولا يتم حفظه.',
        ],
        howToTitle: 'كيفية إجراء القرعة',
        steps: [
            'أضف الأسماء (3 أشخاص على الأقل) أو حمّل قائمة.',
            'ابدأ القرعة السرية.',
            'أرسل لكل شخص رابطه الخاص عبر واتساب أو مرّر الجهاز. يرى كل شخص نتيجته فقط.',
        ],
        faqTitle: 'الأسئلة الشائعة حول سانتا السري',
        faq: [
            { q: 'هل سانتا السري عبر الإنترنت مجاني؟', a: 'نعم. لا حاجة إلى حساب أو بريد إلكتروني أو دفع.' },
            { q: 'كم عدد الأشخاص المطلوب؟', a: '3 أشخاص على الأقل للقرعة السرية. لا يوجد حد أقصى.' },
            { q: 'هل يمكن أن يسحب شخص اسمه؟', a: 'لا. يُعيَّن لكل شخص شخص آخر.' },
            { q: 'هل يمكن إجراؤها عن بُعد؟', a: 'نعم. بعد القرعة أرسل لكل شخص رابطه الشخصي، عبر واتساب مثلًا. ويمكنك أيضًا منع الأزواج أو الإخوة من سحب بعضهم بعضًا.' },
            { q: 'هل يناسب الصفوف المدرسية؟', a: 'نعم. بعد القرعة اختر «طباعة البطاقات»: يحصل كل طالب على بطاقة قابلة للطي، 5 بطاقات في صفحة A4، دون هواتف.' },
        ],
        relatedTitle: 'أدوات ذات صلة',
        related: [
            { path: CLASSROOM, label: 'سانتا السري في الصف (بطاقات للطباعة)' },
            { path: GIFTS, label: 'أفكار الهدايا' },
            { path: RAFFLE, label: 'سحب الأسماء' },
            { path: WHEEL, label: 'تدوير عجلة الحظ' },
        ],
    },
    ja: {
        pageName: 'オンラインシークレットサンタ',
        title: 'オンラインシークレットサンタの使い方',
        paragraphs: [
            '友人、家族、クラス、職場で、シークレットサンタの抽選を無料で数秒で行えます。抽選を始めると、各自が誰にプレゼントを贈るのかわかります。アカウント、メール、支払いは不要です。',
            '名前を1つずつ入力するか、Excel、CSV、PDFのリストをアップロードしてください。組み合わせはブラウザで計算・保存されます。PDFファイルは名前を取り出すためだけにサーバーで処理され、保存されません。',
        ],
        howToTitle: '抽選のやり方',
        steps: [
            '名前を追加する(3人以上)か、リストをアップロードします。',
            '秘密の抽選を始めます。',
            '一人ひとりにWhatsAppで専用リンクを送るか、端末を順番に回します。各自は自分の結果だけを見られます。',
        ],
        faqTitle: 'シークレットサンタのよくある質問',
        faq: [
            { q: 'オンラインシークレットサンタは無料ですか?', a: 'はい。アカウント、メール、支払いは不要です。' },
            { q: '何人必要ですか?', a: '秘密の抽選には3人以上必要です。上限はありません。' },
            { q: '自分の名前が当たることはありますか?', a: 'いいえ。必ず別の人が割り当てられます。' },
            { q: '離れた場所でも使えますか?', a: 'はい。抽選後、WhatsAppなどで一人ひとりに専用リンクを送れます。夫婦や兄弟どうしが当たらないルールも設定できます。' },
            { q: '学校のクラスでも使えますか?', a: 'はい。抽選後に「カードを印刷」を選ぶと、生徒ごとに折りたたみカードを印刷できます。A4用紙1枚に5枚、スマホは不要です。' },
        ],
        relatedTitle: '関連ツール',
        related: [
            { path: CLASSROOM, label: 'クラスでシークレットサンタ(カード印刷)' },
            { path: GIFTS, label: 'プレゼントのアイデア' },
            { path: RAFFLE, label: '名前抽選' },
            { path: WHEEL, label: 'ルーレットを回す' },
        ],
    },
    ko: {
        pageName: '온라인 시크릿 산타',
        title: '온라인 시크릿 산타 사용 방법',
        paragraphs: [
            '친구, 가족, 학급, 직장 동료와 시크릿 산타 추첨을 몇 초 만에 무료로 진행하세요. 비밀 추첨을 시작하면 각자 누구에게 선물할지 알 수 있습니다. 계정, 이메일, 결제가 필요 없습니다.',
            '이름을 하나씩 입력하거나 Excel, CSV, PDF 목록을 업로드하세요. 결과는 브라우저에서 계산되고 저장됩니다. PDF 파일은 이름을 추출하기 위해서만 서버에서 처리되며 저장되지 않습니다.',
        ],
        howToTitle: '추첨 방법',
        steps: [
            '이름을 추가하거나(최소 3명) 목록을 업로드하세요.',
            '비밀 추첨을 시작하세요.',
            '각자에게 WhatsApp으로 개인 링크를 보내거나 기기를 돌려 가며 확인하세요. 각자 자기 결과만 볼 수 있습니다.',
        ],
        faqTitle: '시크릿 산타 자주 묻는 질문',
        faq: [
            { q: '온라인 시크릿 산타는 무료인가요?', a: '네. 계정, 이메일, 결제가 필요 없습니다.' },
            { q: '몇 명이 필요한가요?', a: '비밀 추첨에는 최소 3명이 필요합니다. 최대 인원 제한은 없습니다.' },
            { q: '자기 이름이 나올 수도 있나요?', a: '아니요. 항상 다른 사람이 배정됩니다.' },
            { q: '멀리 있는 사람과도 할 수 있나요?', a: '네. 추첨 후 WhatsApp 등으로 각자에게 개인 링크를 보내면 됩니다. 부부나 형제자매가 서로 뽑지 않도록 규칙도 정할 수 있습니다.' },
            { q: '학교 학급에서도 쓸 수 있나요?', a: '네. 추첨 후 「카드 인쇄」를 선택하면 학생마다 접이식 카드가 인쇄됩니다. A4 한 장에 5장, 휴대폰이 필요 없습니다.' },
        ],
        relatedTitle: '관련 도구',
        related: [
            { path: CLASSROOM, label: '학급 시크릿 산타 (카드 인쇄)' },
            { path: GIFTS, label: '선물 아이디어' },
            { path: RAFFLE, label: '이름 추첨' },
            { path: WHEEL, label: '룰렛 돌리기' },
        ],
    },
    zh: {
        pageName: '在线秘密圣诞老人',
        title: '在线秘密圣诞老人怎么玩',
        paragraphs: [
            '与朋友、家人、同学或同事一起,几秒钟内免费完成秘密圣诞老人抽签。开始秘密抽签后,每个人都会知道要给谁送礼物。无需账号、邮箱或付款。',
            '您可以逐个输入姓名,也可以上传 Excel、CSV 或 PDF 名单。配对结果在您的浏览器中计算并保存。PDF 文件仅在服务器上用于提取姓名,不会被保存。',
        ],
        howToTitle: '如何进行抽签',
        steps: [
            '添加姓名(至少 3 人)或上传名单。',
            '开始秘密抽签。',
            '通过 WhatsApp 给每个人发送专属链接,或依次传递设备。每个人只能看到自己的结果。',
        ],
        faqTitle: '秘密圣诞老人常见问题',
        faq: [
            { q: '在线秘密圣诞老人免费吗?', a: '免费。无需账号、邮箱或付款。' },
            { q: '需要多少人?', a: '秘密抽签至少需要 3 人,没有人数上限。' },
            { q: '会抽到自己吗?', a: '不会。每个人都会被分配给另一个人。' },
            { q: '可以远程进行吗?', a: '可以。抽签后可通过 WhatsApp 等给每个人发送专属链接。还可以设置规则,避免夫妻或兄弟姐妹互相抽到。' },
            { q: '可以在学校班级里使用吗?', a: '可以。抽签后选择“打印卡片”,每位学生都会得到一张折叠卡片,一张 A4 纸可打印 5 张,无需手机。' },
        ],
        relatedTitle: '相关工具',
        related: [
            { path: CLASSROOM, label: '班级秘密圣诞老人(打印卡片)' },
            { path: GIFTS, label: '礼物创意' },
            { path: RAFFLE, label: '姓名抽奖' },
            { path: WHEEL, label: '转动幸运转盘' },
        ],
    },
};
