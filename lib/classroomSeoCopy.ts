/**
 * Copy for /secret-santa/classroom, a landing page for teachers and schools.
 * Every claim must match the tool: printable fold-over cards (5 per A4 page),
 * "same group must not draw each other" rules, no student accounts or phones,
 * names stay in the teacher's browser (only PDF imports reach the server).
 */
export type ClassroomCopy = {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    h1: string;
    intro: string;
    cta: string;
    sampleTitle: string;
    sample: { brand: string; giver: string; cardFor: string; pattern: string; giftFor: string; receiver: string; hint: string };
    whyTitle: string;
    why: { title: string; desc: string }[];
    howToTitle: string;
    steps: string[];
    faqTitle: string;
    faq: { q: string; a: string }[];
    breadcrumb: string;
};

export const CLASSROOM_SEO_COPY: Record<string, ClassroomCopy> = {
    tr: {
        metaTitle: 'Sınıf Yılbaşı Çekilişi: Yazdırılabilir Kartlarla Ücretsiz | YulaSanta',
        metaDescription:
            'Öğretmenler için ücretsiz sınıf yılbaşı hediye çekilişi. Sınıf listesini yükleyin, katlanınca sonucu gizleyen kartları yazdırın ve dağıtın. Öğrenci hesabı veya telefon gerekmez.',
        keywords: [
            'sınıf yılbaşı çekilişi',
            'okul yılbaşı çekilişi',
            'sınıf hediye çekilişi',
            'öğrenciler arası yılbaşı çekilişi',
            'yazdırılabilir çekiliş kartı',
            'kura kağıdı yazdır',
            'öğretmen yılbaşı çekilişi',
            'ilkokul yılbaşı çekilişi',
            'sınıfta yılbaşı hediyeleşmesi',
            'yılbaşı kura kartı',
        ],
        h1: 'Sınıf yılbaşı çekilişi',
        intro:
            'Sınıf listesini ekleyin, çekilişi yapın ve her öğrenci için katlanınca sonucu gizleyen bir kart yazdırın. Kartları kesip dağıtın; her öğrenci kendi kartını açınca kime hediye alacağını görür. Öğrencilerin telefona veya hesaba ihtiyacı yok.',
        cta: 'Sınıf çekilişini başlat',
        sampleTitle: 'Kart böyle görünür',
        sample: {
            brand: '🎁 5-A Sınıfı',
            giver: 'Elif',
            cardFor: 'Bu kart sana özel. Açınca kimseye gösterme 🤫',
            pattern: 'Gizlilik deseni',
            giftFor: 'Hediye alacağın kişi',
            receiver: 'Mert',
            hint: '💡 Lego ve resim yapmayı sever',
        },
        whyTitle: 'Öğretmenler neden kullanıyor?',
        why: [
            { title: 'Telefon gerekmez', desc: 'Kartları yazdırıp dağıtırsınız. Telefonu olmayan küçük öğrenciler için idealdir.' },
            { title: 'Katlanınca gizli kalır', desc: 'Sonuç, desenli bölümün altında kalır; ışığa tutulsa bile okunmaz. Bir A4 sayfaya 5 kart sığar.' },
            { title: 'Kardeşler birbirini çekmez', desc: 'Aynı sınıftaki kardeşleri veya ikizleri bir gruba koyun, birbirlerine çıkmazlar.' },
            { title: 'Listeyi hızlı ekleyin', desc: 'Sınıf listesini Excel, CSV veya PDF olarak yükleyin ya da isimleri yapıştırın.' },
            { title: 'Bütçe ve tarih kartta', desc: 'Hediye bütçesini, hediyeleşme gününü ve kısa bir notu her karta yazdırın.' },
            { title: 'Ücretsiz ve kayıtsız', desc: 'Hesap açmanız gerekmez. İsimler tarayıcınızda kalır, sunucumuza kaydedilmez.' },
        ],
        howToTitle: 'Sınıfta yılbaşı çekilişi nasıl yapılır?',
        steps: [
            'Yılbaşı çekilişi sayfasında öğrenci isimlerini ekleyin veya sınıf listesini yükleyin.',
            'İsterseniz "Kurallar ve detaylar" bölümünden kardeşleri bir gruba koyun, bütçe ve tarihi yazın.',
            'Çekilişi başlatın ve "Kart yazdır"ı seçin.',
            'Kartları kesik çizgiden kesin, önce hediye bölümünü desenin üstüne, sonra isim önde kalacak şekilde ikiye katlayın.',
            'Kartları öğrencilere dağıtın. Herkes kendi kartını açar ve sürprizi saklar.',
        ],
        faqTitle: 'Sınıf yılbaşı çekilişi hakkında sorular',
        faq: [
            { q: 'Öğrencilerin telefonu yoksa nasıl yaparım?', a: 'Çekilişten sonra "Kart yazdır"ı seçin. Her öğrenci için ismi dışarıda, sonucu içeride kalan katlanabilir bir kart yazdırılır.' },
            { q: 'Kartları yazdırırken sonuçları görmem gerekir mi?', a: 'Hayır. Ekrandaki önizlemede sonuçlar bulanık görünür; isterseniz açıp kontrol edebilirsiniz. Çıktıda sonuçlar tam yazılır.' },
            { q: 'Bir sayfaya kaç kart sığar?', a: 'A4 sayfaya 5 kart sığar. 30 kişilik bir sınıf için 6 sayfa yeterlidir.' },
            { q: 'Kardeşler veya ikizler birbirini çekmesin istiyorum.', a: '"Aynı gruptakiler birbirini çekmesin" bölümünden bir grup oluşturup kardeşleri seçin. Aynı gruptakiler birbirine çıkmaz.' },
            { q: 'Kimse kendi adını çeker mi?', a: 'Hayır. Algoritma herkese başka bir öğrenci atar.' },
            { q: 'Öğrenci isimleri bir yere kaydediliyor mu?', a: 'Hayır. İsimler ve eşleşmeler yalnızca sizin tarayıcınızda tutulur. Yalnızca PDF listesi yüklerseniz dosya, isimleri çıkarmak için sunucuda işlenir ve kaydedilmez.' },
            { q: 'Ücretli mi?', a: 'Hayır. Sınıf çekilişi ve kart yazdırma tamamen ücretsizdir; kayıt da gerekmez.' },
        ],
        breadcrumb: 'Sınıf yılbaşı çekilişi',
    },
    en: {
        metaTitle: 'Classroom Secret Santa with Printable Cards (Free) | YulaSanta',
        metaDescription:
            'Free classroom Secret Santa for teachers. Add your class list, print fold-over cards that hide each result, and hand them out. No student accounts or phones needed.',
        keywords: [
            'classroom secret santa',
            'secret santa for students',
            'school secret santa',
            'printable secret santa cards',
            'secret santa name slips',
            'teacher secret santa generator',
            'class gift exchange',
            'secret santa without phones',
        ],
        h1: 'Classroom Secret Santa',
        intro:
            'Add your class list, run the draw and print a fold-over card for every student that hides who they drew. Cut the cards and hand them out; each student opens their own card to see who they are buying for. Students need no phone or account.',
        cta: 'Start the class draw',
        sampleTitle: 'What a card looks like',
        sample: {
            brand: '🎁 Class 5A',
            giver: 'Emma',
            cardFor: "This card is just for you. Don't show anyone 🤫",
            pattern: 'Privacy pattern',
            giftFor: "You're buying a gift for",
            receiver: 'Noah',
            hint: '💡 Loves Lego and drawing',
        },
        whyTitle: 'Why teachers use it',
        why: [
            { title: 'No phones needed', desc: 'Print the cards and hand them out. Ideal for younger students without phones.' },
            { title: 'Hidden once folded', desc: 'The result sits under a patterned flap and stays unreadable even against the light. Five cards fit on an A4 page.' },
            { title: "Siblings don't draw each other", desc: "Put siblings or twins in the same class into a group and they won't be matched." },
            { title: 'Add the list fast', desc: 'Upload your class list as Excel, CSV or PDF, or paste the names.' },
            { title: 'Budget and date on the card', desc: 'Print the gift budget, the exchange day and a short note on every card.' },
            { title: 'Free, no sign-up', desc: 'No account needed. Names stay in your browser and are not saved on our server.' },
        ],
        howToTitle: 'How to run Secret Santa in class',
        steps: [
            'On the Secret Santa page, add student names or upload your class list.',
            'Optionally put siblings in a group under "Rules and details" and add a budget and date.',
            'Start the draw and choose "Print cards".',
            'Cut along the dashed lines, fold the gift part over the pattern, then fold in half with the name on the front.',
            'Hand out the cards. Everyone opens their own and keeps the surprise.',
        ],
        faqTitle: 'Classroom Secret Santa FAQ',
        faq: [
            { q: "How do I run it if students don't have phones?", a: 'After the draw, choose "Print cards". Each student gets a fold-over card with their name outside and their result inside.' },
            { q: 'Do I have to see the results while printing?', a: 'No. The on-screen preview blurs the results, and you can reveal them to check. The printout shows them in full.' },
            { q: 'How many cards fit on a page?', a: 'Five cards fit on an A4 page, so six pages cover a class of 30.' },
            { q: 'Can I keep siblings or twins from drawing each other?', a: 'Yes. Create a group under "Same group must not draw each other" and pick the siblings.' },
            { q: 'Can anyone draw themselves?', a: 'No. Every student is assigned someone else.' },
            { q: 'Are student names stored anywhere?', a: 'No. Names and matches stay in your browser. Only if you upload a PDF list is the file processed on our server to read the names, and it is not saved.' },
            { q: 'Is it free?', a: 'Yes. The class draw and card printing are completely free, with no sign-up.' },
        ],
        breadcrumb: 'Classroom Secret Santa',
    },
    de: {
        metaTitle: 'Wichteln in der Schulklasse mit Druckkarten (kostenlos) | YulaSanta',
        metaDescription:
            'Kostenloses Klassenwichteln für Lehrkräfte. Klassenliste eingeben, faltbare Karten drucken, die das Ergebnis verbergen, und verteilen. Ohne Schülerkonten oder Handys.',
        keywords: ['wichteln schule', 'wichteln klasse', 'klassenwichteln', 'wichtelkarten drucken', 'wichteln ohne handy', 'wichteln lehrer'],
        h1: 'Wichteln in der Schulklasse',
        intro:
            'Klassenliste eingeben, auslosen und für jedes Kind eine faltbare Karte drucken, die das Ergebnis verbirgt. Ausschneiden, verteilen, fertig: Jedes Kind öffnet seine eigene Karte. Kein Handy und kein Konto nötig.',
        cta: 'Klassenwichteln starten',
        sampleTitle: 'So sieht eine Karte aus',
        sample: { brand: '🎁 Klasse 5a', giver: 'Lena', cardFor: 'Diese Karte ist nur für dich. Zeig sie niemandem 🤫', pattern: 'Sichtschutzmuster', giftFor: 'Du beschenkst', receiver: 'Paul', hint: '💡 Mag Lego und Malen' },
        whyTitle: 'Warum Lehrkräfte es nutzen',
        why: [
            { title: 'Ohne Handy', desc: 'Karten drucken und verteilen – ideal für jüngere Kinder.' },
            { title: 'Gefaltet unsichtbar', desc: 'Das Ergebnis liegt unter einem Muster und ist selbst gegen das Licht nicht lesbar. 5 Karten pro A4-Seite.' },
            { title: 'Geschwister ziehen sich nicht', desc: 'Geschwister oder Zwillinge in eine Gruppe legen, dann werden sie nicht zugeordnet.' },
            { title: 'Kostenlos, ohne Anmeldung', desc: 'Die Namen bleiben in Ihrem Browser und werden nicht auf unserem Server gespeichert.' },
        ],
        howToTitle: 'So geht Wichteln in der Klasse',
        steps: [
            'Namen eingeben oder die Klassenliste hochladen.',
            'Bei Bedarf Geschwister unter „Regeln und Details“ in eine Gruppe legen.',
            'Auslosen und „Karten drucken“ wählen.',
            'Ausschneiden, den Geschenkteil über das Muster falten, dann mit dem Namen nach vorne falten und verteilen.',
        ],
        faqTitle: 'Häufige Fragen zum Klassenwichteln',
        faq: [
            { q: 'Wie geht es ohne Handys?', a: 'Nach der Auslosung „Karten drucken“ wählen. Jedes Kind bekommt eine Faltkarte mit dem Namen außen und dem Ergebnis innen.' },
            { q: 'Wie viele Karten passen auf eine Seite?', a: 'Fünf Karten pro A4-Seite.' },
            { q: 'Werden die Namen gespeichert?', a: 'Nein. Namen und Zuordnungen bleiben in Ihrem Browser.' },
            { q: 'Ist es kostenlos?', a: 'Ja, komplett kostenlos und ohne Anmeldung.' },
        ],
        breadcrumb: 'Wichteln in der Klasse',
    },
    fr: {
        metaTitle: 'Père Noël Secret en classe avec cartes à imprimer (gratuit) | YulaSanta',
        metaDescription:
            'Père Noël Secret gratuit pour les enseignants. Ajoutez la liste de la classe, imprimez des cartes pliables qui cachent le résultat et distribuez-les. Sans compte ni téléphone.',
        keywords: ['père noël secret classe', 'père noël secret école', 'cartes père noël secret à imprimer', 'tirage au sort classe noël', 'échange de cadeaux en classe'],
        h1: 'Père Noël Secret en classe',
        intro:
            'Ajoutez la liste de la classe, lancez le tirage et imprimez pour chaque élève une carte pliable qui cache son résultat. Découpez, distribuez : chacun ouvre sa propre carte. Ni téléphone ni compte nécessaires.',
        cta: 'Lancer le tirage de la classe',
        sampleTitle: 'À quoi ressemble une carte',
        sample: { brand: '🎁 Classe de CM2', giver: 'Léa', cardFor: 'Cette carte est rien que pour toi. Ne la montre à personne 🤫', pattern: 'Motif de confidentialité', giftFor: 'Tu offres un cadeau à', receiver: 'Hugo', hint: '💡 Aime les Lego et le dessin' },
        whyTitle: 'Pourquoi les enseignants l’utilisent',
        why: [
            { title: 'Sans téléphone', desc: 'Imprimez et distribuez les cartes, idéal pour les plus jeunes.' },
            { title: 'Caché une fois plié', desc: 'Le résultat est sous un motif, illisible même à contre-jour. 5 cartes par page A4.' },
            { title: 'Les frères et sœurs ne se tirent pas', desc: 'Placez frères, sœurs ou jumeaux dans un groupe.' },
            { title: 'Gratuit, sans inscription', desc: 'Les noms restent dans votre navigateur et ne sont pas enregistrés sur notre serveur.' },
        ],
        howToTitle: 'Comment faire le tirage en classe',
        steps: [
            'Ajoutez les noms ou importez la liste de la classe.',
            'Si besoin, regroupez les frères et sœurs dans « Règles et détails ».',
            'Lancez le tirage et choisissez « Imprimer des cartes ».',
            'Découpez, pliez la partie cadeau sur le motif, puis en deux avec le nom devant, et distribuez.',
        ],
        faqTitle: 'Questions sur le Père Noël Secret en classe',
        faq: [
            { q: 'Comment faire si les élèves n’ont pas de téléphone ?', a: 'Après le tirage, choisissez « Imprimer des cartes » : chaque élève reçoit une carte pliable avec son nom dehors et son résultat dedans.' },
            { q: 'Combien de cartes par page ?', a: 'Cinq cartes par page A4.' },
            { q: 'Les noms sont-ils enregistrés ?', a: 'Non. Les noms et les associations restent dans votre navigateur.' },
            { q: 'Est-ce gratuit ?', a: 'Oui, entièrement gratuit et sans inscription.' },
        ],
        breadcrumb: 'Père Noël Secret en classe',
    },
    es: {
        metaTitle: 'Amigo Invisible en clase con tarjetas imprimibles (gratis) | YulaSanta',
        metaDescription:
            'Amigo Invisible gratis para docentes. Añade la lista de la clase, imprime tarjetas plegables que ocultan el resultado y repártelas. Sin cuentas ni móviles.',
        keywords: ['amigo invisible en clase', 'amigo invisible colegio', 'tarjetas amigo invisible imprimir', 'amigo invisible alumnos', 'sorteo amigo invisible sin móvil'],
        h1: 'Amigo Invisible en clase',
        intro:
            'Añade la lista de la clase, haz el sorteo e imprime para cada alumno una tarjeta plegable que oculta su resultado. Recorta y reparte: cada uno abre su propia tarjeta. Sin móviles ni cuentas.',
        cta: 'Empezar el sorteo de la clase',
        sampleTitle: 'Así es una tarjeta',
        sample: { brand: '🎁 5.º A', giver: 'Lucía', cardFor: 'Esta tarjeta es solo para ti. No se la enseñes a nadie 🤫', pattern: 'Dibujo de privacidad', giftFor: 'Te toca regalar a', receiver: 'Hugo', hint: '💡 Le encantan los Lego y dibujar' },
        whyTitle: 'Por qué lo usan los docentes',
        why: [
            { title: 'Sin móviles', desc: 'Imprime y reparte las tarjetas, ideal para los más pequeños.' },
            { title: 'Oculto al doblar', desc: 'El resultado queda bajo un dibujo y no se lee ni a contraluz. 5 tarjetas por hoja A4.' },
            { title: 'Los hermanos no se tocan', desc: 'Pon a hermanos o gemelos en un grupo.' },
            { title: 'Gratis y sin registro', desc: 'Los nombres se quedan en tu navegador y no se guardan en nuestro servidor.' },
        ],
        howToTitle: 'Cómo hacer el Amigo Invisible en clase',
        steps: [
            'Añade los nombres o sube la lista de la clase.',
            'Si quieres, agrupa a los hermanos en «Reglas y detalles».',
            'Haz el sorteo y elige «Imprimir tarjetas».',
            'Recorta, dobla la parte del regalo sobre el dibujo y luego por la mitad con el nombre delante, y reparte.',
        ],
        faqTitle: 'Preguntas sobre el Amigo Invisible en clase',
        faq: [
            { q: '¿Cómo lo hago si los alumnos no tienen móvil?', a: 'Tras el sorteo elige «Imprimir tarjetas»: cada alumno recibe una tarjeta plegable con su nombre fuera y el resultado dentro.' },
            { q: '¿Cuántas tarjetas caben por hoja?', a: 'Cinco tarjetas por hoja A4.' },
            { q: '¿Se guardan los nombres?', a: 'No. Los nombres y las parejas se quedan en tu navegador.' },
            { q: '¿Es gratis?', a: 'Sí, totalmente gratis y sin registro.' },
        ],
        breadcrumb: 'Amigo Invisible en clase',
    },
    it: {
        metaTitle: 'Babbo Natale Segreto in classe con biglietti da stampare (gratis) | YulaSanta',
        metaDescription:
            'Babbo Natale Segreto gratuito per insegnanti. Inserisci l’elenco della classe, stampa biglietti pieghevoli che nascondono il risultato e distribuiscili. Senza account né telefoni.',
        keywords: ['babbo natale segreto classe', 'babbo natale segreto scuola', 'biglietti babbo natale segreto da stampare', 'scambio regali in classe'],
        h1: 'Babbo Natale Segreto in classe',
        intro:
            'Inserisci l’elenco della classe, fai l’estrazione e stampa per ogni alunno un biglietto pieghevole che nasconde il risultato. Ritaglia e distribuisci: ognuno apre il proprio biglietto. Niente telefoni né account.',
        cta: 'Avvia l’estrazione della classe',
        sampleTitle: 'Ecco un biglietto',
        sample: { brand: '🎁 Classe 5ªA', giver: 'Giulia', cardFor: 'Questo biglietto è solo per te. Non mostrarlo a nessuno 🤫', pattern: 'Motivo di riservatezza', giftFor: 'Fai il regalo a', receiver: 'Marco', hint: '💡 Ama i Lego e disegnare' },
        whyTitle: 'Perché lo usano gli insegnanti',
        why: [
            { title: 'Senza telefoni', desc: 'Stampa e distribuisci i biglietti, ideale per i più piccoli.' },
            { title: 'Nascosto quando è piegato', desc: 'Il risultato sta sotto un motivo e non si legge nemmeno controluce. 5 biglietti per foglio A4.' },
            { title: 'I fratelli non si estraggono', desc: 'Metti fratelli o gemelli in un gruppo.' },
            { title: 'Gratis, senza registrazione', desc: 'I nomi restano nel tuo browser e non vengono salvati sul nostro server.' },
        ],
        howToTitle: 'Come fare il Babbo Natale Segreto in classe',
        steps: [
            'Aggiungi i nomi o carica l’elenco della classe.',
            'Se serve, raggruppa i fratelli in «Regole e dettagli».',
            'Fai l’estrazione e scegli «Stampa biglietti».',
            'Ritaglia, piega la parte del regalo sul motivo e poi a metà con il nome davanti, quindi distribuisci.',
        ],
        faqTitle: 'Domande sul Babbo Natale Segreto in classe',
        faq: [
            { q: 'Come faccio se gli alunni non hanno il telefono?', a: 'Dopo l’estrazione scegli «Stampa biglietti»: ogni alunno riceve un biglietto pieghevole con il nome fuori e il risultato dentro.' },
            { q: 'Quanti biglietti per foglio?', a: 'Cinque biglietti per foglio A4.' },
            { q: 'I nomi vengono salvati?', a: 'No. Nomi e abbinamenti restano nel tuo browser.' },
            { q: 'È gratis?', a: 'Sì, completamente gratis e senza registrazione.' },
        ],
        breadcrumb: 'Babbo Natale Segreto in classe',
    },
    pt: {
        metaTitle: 'Amigo Secreto na escola com cartões para imprimir (grátis) | YulaSanta',
        metaDescription:
            'Amigo Secreto grátis para professores. Adicione a lista da turma, imprima cartões dobráveis que escondem o resultado e distribua. Sem contas nem celulares.',
        keywords: ['amigo secreto na escola', 'amigo secreto turma', 'cartões amigo secreto para imprimir', 'sorteio amigo secreto alunos', 'amigo secreto sem celular'],
        h1: 'Amigo Secreto na escola',
        intro:
            'Adicione a lista da turma, faça o sorteio e imprima para cada aluno um cartão dobrável que esconde o resultado. Recorte e distribua: cada um abre o próprio cartão. Sem celular nem conta.',
        cta: 'Começar o sorteio da turma',
        sampleTitle: 'Como é um cartão',
        sample: { brand: '🎁 Turma 5º A', giver: 'Ana', cardFor: 'Este cartão é só seu. Não mostre para ninguém 🤫', pattern: 'Estampa de privacidade', giftFor: 'Você vai presentear', receiver: 'Pedro', hint: '💡 Adora Lego e desenhar' },
        whyTitle: 'Por que os professores usam',
        why: [
            { title: 'Sem celular', desc: 'Imprima e distribua os cartões, ideal para os menores.' },
            { title: 'Escondido ao dobrar', desc: 'O resultado fica sob uma estampa e não aparece nem contra a luz. 5 cartões por folha A4.' },
            { title: 'Irmãos não se tiram', desc: 'Coloque irmãos ou gêmeos em um grupo.' },
            { title: 'Grátis, sem cadastro', desc: 'Os nomes ficam no seu navegador e não são salvos no nosso servidor.' },
        ],
        howToTitle: 'Como fazer o Amigo Secreto na turma',
        steps: [
            'Adicione os nomes ou envie a lista da turma.',
            'Se quiser, agrupe os irmãos em «Regras e detalhes».',
            'Faça o sorteio e escolha «Imprimir cartões».',
            'Recorte, dobre a parte do presente sobre a estampa e depois ao meio com o nome na frente, e distribua.',
        ],
        faqTitle: 'Perguntas sobre o Amigo Secreto na escola',
        faq: [
            { q: 'Como faço se os alunos não têm celular?', a: 'Depois do sorteio, escolha «Imprimir cartões»: cada aluno recebe um cartão dobrável com o nome por fora e o resultado por dentro.' },
            { q: 'Quantos cartões cabem por folha?', a: 'Cinco cartões por folha A4.' },
            { q: 'Os nomes são salvos?', a: 'Não. Nomes e pares ficam no seu navegador.' },
            { q: 'É grátis?', a: 'Sim, totalmente grátis e sem cadastro.' },
        ],
        breadcrumb: 'Amigo Secreto na escola',
    },
    ru: {
        metaTitle: 'Тайный Санта в классе с карточками для печати (бесплатно) | YulaSanta',
        metaDescription:
            'Бесплатный Тайный Санта для учителей. Добавьте список класса, распечатайте складные карточки, скрывающие результат, и раздайте. Без аккаунтов и телефонов.',
        keywords: ['тайный санта в классе', 'тайный санта в школе', 'карточки тайный санта распечатать', 'жеребьёвка подарков в классе'],
        h1: 'Тайный Санта в классе',
        intro:
            'Добавьте список класса, проведите жеребьёвку и распечатайте каждому ученику складную карточку, скрывающую результат. Вырежьте и раздайте: каждый откроет свою карточку. Телефоны и аккаунты не нужны.',
        cta: 'Начать жеребьёвку класса',
        sampleTitle: 'Так выглядит карточка',
        sample: { brand: '🎁 5 «А» класс', giver: 'Аня', cardFor: 'Эта карточка только для тебя. Никому не показывай 🤫', pattern: 'Защитный узор', giftFor: 'Ты даришь подарок', receiver: 'Миша', hint: '💡 Любит Lego и рисовать' },
        whyTitle: 'Почему учителя выбирают это',
        why: [
            { title: 'Без телефонов', desc: 'Распечатайте и раздайте карточки — удобно для младших школьников.' },
            { title: 'Скрыто в сложенном виде', desc: 'Результат под узором и не читается даже на просвет. 5 карточек на листе A4.' },
            { title: 'Братья и сёстры не вытянут друг друга', desc: 'Объедините братьев, сестёр или близнецов в группу.' },
            { title: 'Бесплатно, без регистрации', desc: 'Имена остаются в вашем браузере и не сохраняются на нашем сервере.' },
        ],
        howToTitle: 'Как провести Тайного Санту в классе',
        steps: [
            'Добавьте имена или загрузите список класса.',
            'При желании объедините братьев и сестёр в группу в разделе «Правила и детали».',
            'Проведите жеребьёвку и выберите «Распечатать карточки».',
            'Вырежьте, сложите часть с подарком поверх узора, затем пополам именем наружу и раздайте.',
        ],
        faqTitle: 'Вопросы о Тайном Санте в классе',
        faq: [
            { q: 'Как провести, если у учеников нет телефонов?', a: 'После жеребьёвки выберите «Распечатать карточки»: каждый получит складную карточку с именем снаружи и результатом внутри.' },
            { q: 'Сколько карточек помещается на лист?', a: 'Пять карточек на лист A4.' },
            { q: 'Имена где-то сохраняются?', a: 'Нет. Имена и пары остаются в вашем браузере.' },
            { q: 'Это бесплатно?', a: 'Да, полностью бесплатно и без регистрации.' },
        ],
        breadcrumb: 'Тайный Санта в классе',
    },
    ar: {
        metaTitle: 'سانتا السري في الصف مع بطاقات للطباعة (مجانًا) | YulaSanta',
        metaDescription:
            'سانتا السري مجانًا للمعلمين. أضف قائمة الصف واطبع بطاقات قابلة للطي تخفي النتيجة ثم وزّعها. دون حسابات أو هواتف.',
        keywords: ['سانتا السري في الصف', 'سانتا السري في المدرسة', 'بطاقات سانتا السري للطباعة', 'تبادل الهدايا في الصف'],
        h1: 'سانتا السري في الصف',
        intro:
            'أضف قائمة الصف وأجرِ القرعة واطبع لكل طالب بطاقة قابلة للطي تخفي نتيجته. قصّ البطاقات ووزّعها؛ يفتح كل طالب بطاقته. لا حاجة إلى هاتف أو حساب.',
        cta: 'ابدأ قرعة الصف',
        sampleTitle: 'هكذا تبدو البطاقة',
        sample: { brand: '🎁 الصف الخامس', giver: 'ليلى', cardFor: 'هذه البطاقة لك وحدك. لا تُرِها لأحد 🤫', pattern: 'نقش الخصوصية', giftFor: 'ستقدّم هديتك إلى', receiver: 'عمر', hint: '💡 يحب الليغو والرسم' },
        whyTitle: 'لماذا يستخدمه المعلمون',
        why: [
            { title: 'دون هواتف', desc: 'اطبع البطاقات ووزّعها، وهذا مثالي للطلاب الصغار.' },
            { title: 'مخفية عند الطي', desc: 'تبقى النتيجة تحت نقش ولا تُقرأ حتى عند تعريضها للضوء. 5 بطاقات في صفحة A4.' },
            { title: 'الإخوة لا يسحب بعضهم بعضًا', desc: 'ضع الإخوة أو التوائم في مجموعة واحدة.' },
            { title: 'مجاني ودون تسجيل', desc: 'تبقى الأسماء في متصفحك ولا تُحفظ على خادمنا.' },
        ],
        howToTitle: 'كيفية إجراء سانتا السري في الصف',
        steps: [
            'أضف الأسماء أو حمّل قائمة الصف.',
            'إن شئت، ضع الإخوة في مجموعة من قسم «القواعد والتفاصيل».',
            'أجرِ القرعة واختر «طباعة البطاقات».',
            'قصّ البطاقات واطوِ جزء الهدية فوق النقش ثم إلى نصفين مع بقاء الاسم في الأمام، ثم وزّعها.',
        ],
        faqTitle: 'أسئلة حول سانتا السري في الصف',
        faq: [
            { q: 'كيف أجريها إذا لم يكن لدى الطلاب هواتف؟', a: 'بعد القرعة اختر «طباعة البطاقات»: يحصل كل طالب على بطاقة قابلة للطي اسمه في الخارج ونتيجته في الداخل.' },
            { q: 'كم بطاقة تتسع لها الصفحة؟', a: 'خمس بطاقات في صفحة A4.' },
            { q: 'هل تُحفظ الأسماء؟', a: 'لا. تبقى الأسماء والنتائج في متصفحك.' },
            { q: 'هل هو مجاني؟', a: 'نعم، مجاني تمامًا ودون تسجيل.' },
        ],
        breadcrumb: 'سانتا السري في الصف',
    },
    ja: {
        metaTitle: 'クラスでシークレットサンタ|印刷できるカード付き(無料)| YulaSanta',
        metaDescription:
            '先生のための無料シークレットサンタ。クラス名簿を入れて、折ると結果が隠れるカードを印刷して配るだけ。生徒のアカウントやスマホは不要です。',
        keywords: ['シークレットサンタ クラス', 'シークレットサンタ 学校', 'シークレットサンタ カード 印刷', 'クラス プレゼント交換'],
        h1: 'クラスでシークレットサンタ',
        intro:
            'クラス名簿を入れて抽選し、結果が隠れる折りたたみカードを生徒ごとに印刷しましょう。切って配れば、各自が自分のカードを開いて確認できます。スマホもアカウントも不要です。',
        cta: 'クラスの抽選を始める',
        sampleTitle: 'カードの見本',
        sample: { brand: '🎁 5年1組', giver: 'さくら', cardFor: 'このカードはあなた専用です。誰にも見せないでね 🤫', pattern: '目隠し模様', giftFor: 'プレゼントを贈る相手', receiver: 'はると', hint: '💡 レゴとお絵かきが好き' },
        whyTitle: '先生に選ばれる理由',
        why: [
            { title: 'スマホ不要', desc: 'カードを印刷して配るだけ。低学年にもぴったりです。' },
            { title: '折れば見えない', desc: '結果は模様の下に隠れ、光に透かしても読めません。A4用紙1枚に5枚。' },
            { title: 'きょうだいは当たらない', desc: '同じクラスのきょうだいや双子をグループにまとめられます。' },
            { title: '無料・登録不要', desc: '名前はブラウザ内にとどまり、サーバーには保存されません。' },
        ],
        howToTitle: 'クラスでのやり方',
        steps: [
            '名前を入力するか、クラス名簿をアップロードします。',
            '必要なら「ルールと詳細」できょうだいをグループにします。',
            '抽選して「カードを印刷」を選びます。',
            '切り取り、プレゼント部分を模様の上に折り、名前が表に来るよう半分に折って配ります。',
        ],
        faqTitle: 'クラスでのシークレットサンタ よくある質問',
        faq: [
            { q: '生徒がスマホを持っていない場合は?', a: '抽選後に「カードを印刷」を選ぶと、外側に名前、内側に結果がある折りたたみカードを一人ずつ印刷できます。' },
            { q: '1ページに何枚入りますか?', a: 'A4用紙1枚に5枚入ります。' },
            { q: '名前は保存されますか?', a: 'いいえ。名前と組み合わせはブラウザ内にとどまります。' },
            { q: '無料ですか?', a: 'はい。完全無料で登録も不要です。' },
        ],
        breadcrumb: 'クラスでシークレットサンタ',
    },
    ko: {
        metaTitle: '학급 시크릿 산타 | 인쇄용 카드 제공 (무료) | YulaSanta',
        metaDescription:
            '선생님을 위한 무료 학급 시크릿 산타. 학급 명단을 넣고 접으면 결과가 가려지는 카드를 인쇄해 나눠 주세요. 학생 계정이나 휴대폰이 필요 없습니다.',
        keywords: ['학급 시크릿 산타', '학교 시크릿 산타', '시크릿 산타 카드 인쇄', '교실 선물 교환'],
        h1: '학급 시크릿 산타',
        intro:
            '학급 명단을 넣고 추첨한 뒤, 결과가 가려지는 접이식 카드를 학생마다 인쇄하세요. 잘라서 나눠 주면 각자 자기 카드를 열어 확인합니다. 휴대폰도 계정도 필요 없습니다.',
        cta: '학급 추첨 시작하기',
        sampleTitle: '카드 예시',
        sample: { brand: '🎁 5학년 1반', giver: '서연', cardFor: '이 카드는 당신만을 위한 거예요. 아무에게도 보여 주지 마세요 🤫', pattern: '가림 무늬', giftFor: '선물할 사람', receiver: '민준', hint: '💡 레고와 그림 그리기를 좋아해요' },
        whyTitle: '선생님들이 사용하는 이유',
        why: [
            { title: '휴대폰 불필요', desc: '카드를 인쇄해 나눠 주기만 하면 됩니다. 저학년에게 딱 좋아요.' },
            { title: '접으면 안 보여요', desc: '결과가 무늬 아래에 가려져 빛에 비춰도 읽히지 않습니다. A4 한 장에 5장.' },
            { title: '형제자매끼리 안 뽑혀요', desc: '같은 반 형제자매나 쌍둥이를 한 그룹으로 묶으세요.' },
            { title: '무료, 가입 불필요', desc: '이름은 브라우저에만 남고 서버에 저장되지 않습니다.' },
        ],
        howToTitle: '학급에서 진행하는 방법',
        steps: [
            '이름을 입력하거나 학급 명단을 업로드하세요.',
            '필요하면 「규칙 및 세부 정보」에서 형제자매를 그룹으로 묶으세요.',
            '추첨하고 「카드 인쇄」를 선택하세요.',
            '잘라서 선물 부분을 무늬 위로 접고, 이름이 앞에 오도록 반으로 접어 나눠 주세요.',
        ],
        faqTitle: '학급 시크릿 산타 자주 묻는 질문',
        faq: [
            { q: '학생들에게 휴대폰이 없으면 어떻게 하나요?', a: '추첨 후 「카드 인쇄」를 선택하면 바깥에 이름, 안쪽에 결과가 있는 접이식 카드가 인쇄됩니다.' },
            { q: '한 장에 몇 장이 들어가나요?', a: 'A4 한 장에 5장이 들어갑니다.' },
            { q: '이름이 저장되나요?', a: '아니요. 이름과 결과는 브라우저에만 남습니다.' },
            { q: '무료인가요?', a: '네, 완전히 무료이며 가입도 필요 없습니다.' },
        ],
        breadcrumb: '학급 시크릿 산타',
    },
    zh: {
        metaTitle: '班级秘密圣诞老人|可打印卡片(免费)| YulaSanta',
        metaDescription:
            '面向老师的免费班级秘密圣诞老人。添加班级名单,打印折起来就能遮住结果的卡片并分发。无需学生账号或手机。',
        keywords: ['班级秘密圣诞老人', '学校秘密圣诞老人', '秘密圣诞老人卡片打印', '班级交换礼物'],
        h1: '班级秘密圣诞老人',
        intro:
            '添加班级名单,完成抽签,再为每位学生打印一张折起来就能遮住结果的卡片。剪下分发,每个人打开自己的卡片即可查看。无需手机或账号。',
        cta: '开始班级抽签',
        sampleTitle: '卡片示例',
        sample: { brand: '🎁 五年级一班', giver: '小雨', cardFor: '这张卡片只属于你,别给任何人看 🤫', pattern: '防窥花纹', giftFor: '你要送礼物给', receiver: '浩然', hint: '💡 喜欢乐高和画画' },
        whyTitle: '老师们为什么选择它',
        why: [
            { title: '无需手机', desc: '打印卡片并分发即可,非常适合低年级学生。' },
            { title: '折起来看不见', desc: '结果藏在花纹下面,对着光也看不到。一张 A4 纸可打印 5 张。' },
            { title: '兄弟姐妹不会互相抽到', desc: '把同班的兄弟姐妹或双胞胎放进同一组即可。' },
            { title: '免费,无需注册', desc: '姓名只保存在你的浏览器中,不会存到我们的服务器。' },
        ],
        howToTitle: '如何在班级里进行',
        steps: [
            '输入姓名或上传班级名单。',
            '如有需要,在“规则和详情”中把兄弟姐妹分到同一组。',
            '开始抽签并选择“打印卡片”。',
            '剪下卡片,先把礼物部分折到花纹上,再对折让名字朝外,然后分发。',
        ],
        faqTitle: '班级秘密圣诞老人常见问题',
        faq: [
            { q: '学生没有手机怎么办?', a: '抽签后选择“打印卡片”,每位学生会得到一张外面写名字、里面写结果的折叠卡片。' },
            { q: '一页能打印几张?', a: '一张 A4 纸可打印 5 张。' },
            { q: '姓名会被保存吗?', a: '不会。姓名和配对结果只保存在你的浏览器中。' },
            { q: '免费吗?', a: '是的,完全免费,无需注册。' },
        ],
        breadcrumb: '班级秘密圣诞老人',
    },
};

export function getClassroomCopy(locale: string): ClassroomCopy {
    return CLASSROOM_SEO_COPY[locale] || CLASSROOM_SEO_COPY.en;
}
