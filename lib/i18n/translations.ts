// Supported languages
export const SUPPORTED_LOCALES = [
    'tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'ja', 'ko', 'zh'
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_NAMES: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية',
    ja: '日本語',
    ko: '한국어',
    zh: '中文'
};

export const LOCALE_FLAGS: Record<Locale, string> = {
    tr: '🇹🇷',
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷',
    es: '🇪🇸',
    it: '🇮🇹',
    pt: '🇵🇹',
    ru: '🇷🇺',
    ar: '🇸🇦',
    ja: '🇯🇵',
    ko: '🇰🇷',
    zh: '🇨🇳'
};

export interface Translation {
    // Meta
    meta: {
        title: string;
        description: string;
        keywords: string[];
    };
    // Home page
    home: {
        title: string;
        subtitle: string;
        secretDraw: string;
        directMatch: string;
        inputPlaceholder: string;
        noParticipants: string;
        uploadList: string;
        uploading: string;
        clearList: string;
        startDraw: string;
        match: string;
        happyNewYear: string;
        minPeople3: string;
        minPeople2: string;
        evenNumber: string;
        nameExists: string;
        namesAdded: string;
        totalCount: string;
        startDrawConfirm: string;
        notEnoughPeople: string;
        noNamesFound: string;
        uploadError: string;
        unsupportedFormat: string;
        secretDrawMinError: string;
        directMatchMinError: string;
        directMatchEvenError: string;
        drawError: string;
    };
    // Result page
    result: {
        whoGetsGift: string;
        selectName: string;
        matchList: string;
        christmasMatches: string;
        giftRecipient: string;
        keepSecret: string;
        seeGiftIdeas: string;
        aiSuggestions: string;
        noSuggestions: string;
        someoneElse: string;
        newDraw: string;
        seeResult: string;
        selectYourName: string;
        backToHome: string;
    };
    // Common
    common: {
        loading: string;
        error: string;
        confirm: string;
        cancel: string;
        yes: string;
        no: string;
        clearConfirm: string;
    };
}

export const translations: Record<Locale, Translation> = {
    // Turkish
    tr: {
        meta: {
            title: "YulaSanta - Online Yılbaşı Çekilişi Yap",
            description: "Arkadaşlarınızla, ailenizle veya iş arkadaşlarınızla saniyeler içinde ücretsiz, reklamsız ve üyeliksiz online yılbaşı çekilişi yapın!",
            keywords: ["yılbaşı çekilişi", "secret santa", "hediye çekilişi", "online çekiliş", "yılbaşı hediyesi"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "Arkadaşlarını ekle, çekilişi başlat!",
            secretDraw: "Gizli Çekiliş 🤫",
            directMatch: "Direkt Eşleşme 🤝",
            inputPlaceholder: "İsim giriniz...",
            noParticipants: "Henüz kimse eklenmedi",
            uploadList: "Toplu Liste Yükle (Excel/PDF)",
            uploading: "Yükleniyor...",
            clearList: "Listeyi Temizle",
            startDraw: "Çekilişi Yap",
            match: "Eşleştir",
            happyNewYear: "🎄 Mutlu Yıllar!",
            minPeople3: "En az 3 kişi eklemelisiniz",
            minPeople2: "En az 2 kişi eklemelisiniz",
            evenNumber: "Kişi sayısı çift olmalıdır",
            nameExists: "Bu isim zaten ekli!",
            namesAdded: "isim eklendi",
            totalCount: "Toplam",
            startDrawConfirm: "Çekilişi başlatmak istiyor musunuz?",
            notEnoughPeople: "Çekiliş için yeterli kişi yok.",
            noNamesFound: "Dosyadan isim okunamadı.",
            uploadError: "Dosya yüklenirken bir hata oluştu.",
            unsupportedFormat: "Desteklenmeyen dosya formatı. Lütfen Excel (.xlsx) veya PDF kullanın.",
            secretDrawMinError: "Gizli Çekiliş için en az 3 kişi gerekli!",
            directMatchMinError: "Eşleştirme için en az 2 kişi gerekli!",
            directMatchEvenError: "Direkt eşleştirme için kişi sayısı çift olmalıdır! Lütfen bir kişi ekleyin veya çıkarın.",
            drawError: "Bir hata oluştu, lütfen tekrar deneyin."
        },
        result: {
            whoGetsGift: "Kime Hediye Alacağım?",
            selectName: "İsminizi seçin ve sonucu görün. 🎁",
            matchList: "Eşleşme Listesi",
            christmasMatches: "İşte yılbaşı eşleşmeleri! 🎄",
            giftRecipient: "HEDİYE ALACAĞIN KİŞİ",
            keepSecret: "Bu bilgiyi sakın unutma! Kimseye söyleme, sürprizi bozma. 🤫",
            seeGiftIdeas: "Hediye Fikirleri Gör",
            aiSuggestions: "AI Hediye Önerileri",
            noSuggestions: "Öneri bulunamadı.",
            someoneElse: "Başka biri baksın",
            newDraw: "Yeni Çekiliş Yap",
            seeResult: "Sonucu Gör",
            selectYourName: "İsminizi seçin...",
            backToHome: "Ana Ekrana Dön"
        },
        common: {
            loading: "Yükleniyor...",
            error: "Hata",
            confirm: "Onayla",
            cancel: "İptal",
            yes: "Evet",
            no: "Hayır",
            clearConfirm: "Tüm listeyi silmek istediğinize emin misiniz?"
        }
    },

    // English
    en: {
        meta: {
            title: "YulaSanta - Online Secret Santa Draw",
            description: "Create free, ad-free online Secret Santa draws with friends, family, or colleagues in seconds!",
            keywords: ["secret santa", "gift exchange", "christmas draw", "online raffle", "holiday gift"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "Add your friends, start the draw!",
            secretDraw: "Secret Draw 🤫",
            directMatch: "Direct Match 🤝",
            inputPlaceholder: "Enter a name...",
            noParticipants: "No one added yet",
            uploadList: "Upload List (Excel/PDF)",
            uploading: "Uploading...",
            clearList: "Clear List",
            startDraw: "Start Draw",
            match: "Match",
            happyNewYear: "🎄 Happy New Year!",
            minPeople3: "Add at least 3 people",
            minPeople2: "Add at least 2 people",
            evenNumber: "Number of people must be even",
            nameExists: "This name already exists!",
            namesAdded: "names added",
            totalCount: "Total",
            startDrawConfirm: "Do you want to start the draw?",
            notEnoughPeople: "Not enough people for the draw.",
            noNamesFound: "Could not read names from file.",
            uploadError: "An error occurred while uploading.",
            unsupportedFormat: "Unsupported file format. Please use Excel (.xlsx) or PDF.",
            secretDrawMinError: "Secret Draw requires at least 3 people!",
            directMatchMinError: "Matching requires at least 2 people!",
            directMatchEvenError: "Direct matching requires an even number of people! Please add or remove someone.",
            drawError: "An error occurred, please try again."
        },
        result: {
            whoGetsGift: "Who Do I Buy a Gift For?",
            selectName: "Select your name and see the result. 🎁",
            matchList: "Match List",
            christmasMatches: "Here are the holiday matches! 🎄",
            giftRecipient: "YOUR GIFT RECIPIENT",
            keepSecret: "Don't forget this! Keep it secret, don't spoil the surprise. 🤫",
            seeGiftIdeas: "See Gift Ideas",
            aiSuggestions: "AI Gift Suggestions",
            noSuggestions: "No suggestions found.",
            someoneElse: "Let someone else check",
            newDraw: "Start New Draw",
            seeResult: "See Result",
            selectYourName: "Select your name...",
            backToHome: "Back to Home"
        },
        common: {
            loading: "Loading...",
            error: "Error",
            confirm: "Confirm",
            cancel: "Cancel",
            yes: "Yes",
            no: "No",
            clearConfirm: "Are you sure you want to clear the entire list?"
        }
    },

    // German
    de: {
        meta: {
            title: "YulaSanta - Online Wichteln",
            description: "Erstellen Sie kostenlose, werbefreie Online-Wichtel-Ziehungen mit Freunden, Familie oder Kollegen in Sekunden!",
            keywords: ["wichteln", "geschenkaustausch", "weihnachtsziehung", "online verlosung", "weihnachtsgeschenk"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "Füge deine Freunde hinzu, starte die Ziehung!",
            secretDraw: "Geheime Ziehung 🤫",
            directMatch: "Direktes Matching 🤝",
            inputPlaceholder: "Name eingeben...",
            noParticipants: "Noch niemand hinzugefügt",
            uploadList: "Liste hochladen (Excel/PDF)",
            uploading: "Hochladen...",
            clearList: "Liste löschen",
            startDraw: "Ziehung starten",
            match: "Zuordnen",
            happyNewYear: "🎄 Frohes neues Jahr!",
            minPeople3: "Mindestens 3 Personen hinzufügen",
            minPeople2: "Mindestens 2 Personen hinzufügen",
            evenNumber: "Die Anzahl muss gerade sein",
            nameExists: "Dieser Name existiert bereits!",
            namesAdded: "Namen hinzugefügt",
            totalCount: "Gesamt",
            startDrawConfirm: "Möchten Sie die Ziehung starten?",
            notEnoughPeople: "Nicht genug Personen für die Ziehung.",
            noNamesFound: "Konnte keine Namen aus der Datei lesen.",
            uploadError: "Fehler beim Hochladen.",
            unsupportedFormat: "Nicht unterstütztes Format. Bitte Excel (.xlsx) oder PDF verwenden.",
            secretDrawMinError: "Geheime Ziehung benötigt mindestens 3 Personen!",
            directMatchMinError: "Zuordnung benötigt mindestens 2 Personen!",
            directMatchEvenError: "Direktes Matching benötigt eine gerade Anzahl! Bitte jemanden hinzufügen oder entfernen.",
            drawError: "Ein Fehler ist aufgetreten, bitte erneut versuchen."
        },
        result: {
            whoGetsGift: "Für wen kaufe ich ein Geschenk?",
            selectName: "Wähle deinen Namen und sieh das Ergebnis. 🎁",
            matchList: "Zuordnungsliste",
            christmasMatches: "Hier sind die Weihnachtszuordnungen! 🎄",
            giftRecipient: "DEIN BESCHENKTER",
            keepSecret: "Vergiss das nicht! Erzähl niemandem, verdirb nicht die Überraschung. 🤫",
            seeGiftIdeas: "Geschenkideen ansehen",
            aiSuggestions: "KI-Geschenkvorschläge",
            noSuggestions: "Keine Vorschläge gefunden.",
            someoneElse: "Jemand anderen schauen lassen",
            newDraw: "Neue Ziehung starten",
            seeResult: "Ergebnis anzeigen",
            selectYourName: "Wähle deinen Namen...",
            backToHome: "Zurück zur Startseite"
        },
        common: {
            loading: "Laden...",
            error: "Fehler",
            confirm: "Bestätigen",
            cancel: "Abbrechen",
            yes: "Ja",
            no: "Nein",
            clearConfirm: "Sind Sie sicher, dass Sie die gesamte Liste löschen möchten?"
        }
    },

    // French
    fr: {
        meta: {
            title: "YulaSanta - Tirage au Sort Père Noël Secret",
            description: "Créez des tirages au sort de Père Noël Secret gratuits, sans publicité avec vos amis, famille ou collègues en quelques secondes!",
            keywords: ["père noël secret", "échange de cadeaux", "tirage de noël", "tirage en ligne", "cadeau de noël"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "Ajoutez vos amis, lancez le tirage!",
            secretDraw: "Tirage Secret 🤫",
            directMatch: "Correspondance Directe 🤝",
            inputPlaceholder: "Entrez un nom...",
            noParticipants: "Personne n'a encore été ajouté",
            uploadList: "Télécharger la liste (Excel/PDF)",
            uploading: "Téléchargement...",
            clearList: "Effacer la liste",
            startDraw: "Lancer le tirage",
            match: "Associer",
            happyNewYear: "🎄 Bonne Année!",
            minPeople3: "Ajoutez au moins 3 personnes",
            minPeople2: "Ajoutez au moins 2 personnes",
            evenNumber: "Le nombre doit être pair",
            nameExists: "Ce nom existe déjà!",
            namesAdded: "noms ajoutés",
            totalCount: "Total",
            startDrawConfirm: "Voulez-vous lancer le tirage?",
            notEnoughPeople: "Pas assez de personnes pour le tirage.",
            noNamesFound: "Impossible de lire les noms du fichier.",
            uploadError: "Une erreur s'est produite lors du téléchargement.",
            unsupportedFormat: "Format non supporté. Veuillez utiliser Excel (.xlsx) ou PDF.",
            secretDrawMinError: "Le tirage secret nécessite au moins 3 personnes!",
            directMatchMinError: "La correspondance nécessite au moins 2 personnes!",
            directMatchEvenError: "La correspondance directe nécessite un nombre pair! Veuillez ajouter ou retirer quelqu'un.",
            drawError: "Une erreur s'est produite, veuillez réessayer."
        },
        result: {
            whoGetsGift: "À qui dois-je offrir un cadeau?",
            selectName: "Sélectionnez votre nom et voyez le résultat. 🎁",
            matchList: "Liste des correspondances",
            christmasMatches: "Voici les correspondances de Noël! 🎄",
            giftRecipient: "VOTRE DESTINATAIRE",
            keepSecret: "N'oubliez pas! Gardez le secret, ne gâchez pas la surprise. 🤫",
            seeGiftIdeas: "Voir les idées cadeaux",
            aiSuggestions: "Suggestions IA de cadeaux",
            noSuggestions: "Aucune suggestion trouvée.",
            someoneElse: "Laisser quelqu'un d'autre regarder",
            newDraw: "Nouveau tirage",
            seeResult: "Voir le résultat",
            selectYourName: "Sélectionnez votre nom...",
            backToHome: "Retour à l'accueil"
        },
        common: {
            loading: "Chargement...",
            error: "Erreur",
            confirm: "Confirmer",
            cancel: "Annuler",
            yes: "Oui",
            no: "Non",
            clearConfirm: "Êtes-vous sûr de vouloir effacer toute la liste?"
        }
    },

    // Spanish
    es: {
        meta: {
            title: "YulaSanta - Sorteo de Amigo Invisible Online",
            description: "¡Crea sorteos de Amigo Invisible gratuitos, sin anuncios con amigos, familia o colegas en segundos!",
            keywords: ["amigo invisible", "intercambio de regalos", "sorteo navideño", "sorteo online", "regalo de navidad"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "¡Añade a tus amigos, inicia el sorteo!",
            secretDraw: "Sorteo Secreto 🤫",
            directMatch: "Emparejamiento Directo 🤝",
            inputPlaceholder: "Introduce un nombre...",
            noParticipants: "Nadie añadido todavía",
            uploadList: "Subir lista (Excel/PDF)",
            uploading: "Subiendo...",
            clearList: "Limpiar lista",
            startDraw: "Iniciar sorteo",
            match: "Emparejar",
            happyNewYear: "🎄 ¡Feliz Año Nuevo!",
            minPeople3: "Añade al menos 3 personas",
            minPeople2: "Añade al menos 2 personas",
            evenNumber: "El número debe ser par",
            nameExists: "¡Este nombre ya existe!",
            namesAdded: "nombres añadidos",
            totalCount: "Total",
            startDrawConfirm: "¿Quieres iniciar el sorteo?",
            notEnoughPeople: "No hay suficientes personas para el sorteo.",
            noNamesFound: "No se pudieron leer nombres del archivo.",
            uploadError: "Ocurrió un error al subir.",
            unsupportedFormat: "Formato no soportado. Por favor usa Excel (.xlsx) o PDF.",
            secretDrawMinError: "¡El sorteo secreto requiere al menos 3 personas!",
            directMatchMinError: "¡El emparejamiento requiere al menos 2 personas!",
            directMatchEvenError: "¡El emparejamiento directo requiere un número par! Por favor añade o quita a alguien.",
            drawError: "Ocurrió un error, por favor intenta de nuevo."
        },
        result: {
            whoGetsGift: "¿A quién le compro un regalo?",
            selectName: "Selecciona tu nombre y ve el resultado. 🎁",
            matchList: "Lista de emparejamientos",
            christmasMatches: "¡Aquí están los emparejamientos navideños! 🎄",
            giftRecipient: "TU DESTINATARIO",
            keepSecret: "¡No lo olvides! Guarda el secreto, no arruines la sorpresa. 🤫",
            seeGiftIdeas: "Ver ideas de regalos",
            aiSuggestions: "Sugerencias IA de regalos",
            noSuggestions: "No se encontraron sugerencias.",
            someoneElse: "Deja que otro mire",
            newDraw: "Nuevo sorteo",
            seeResult: "Ver resultado",
            selectYourName: "Selecciona tu nombre...",
            backToHome: "Volver al inicio"
        },
        common: {
            loading: "Cargando...",
            error: "Error",
            confirm: "Confirmar",
            cancel: "Cancelar",
            yes: "Sí",
            no: "No",
            clearConfirm: "¿Estás seguro de que quieres borrar toda la lista?"
        }
    },

    // Italian
    it: {
        meta: {
            title: "YulaSanta - Estrazione Babbo Natale Segreto Online",
            description: "Crea estrazioni gratuite di Babbo Natale Segreto senza pubblicità con amici, famiglia o colleghi in pochi secondi!",
            keywords: ["babbo natale segreto", "scambio regali", "estrazione natalizia", "estrazione online", "regalo di natale"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "Aggiungi i tuoi amici, inizia l'estrazione!",
            secretDraw: "Estrazione Segreta 🤫",
            directMatch: "Abbinamento Diretto 🤝",
            inputPlaceholder: "Inserisci un nome...",
            noParticipants: "Nessuno ancora aggiunto",
            uploadList: "Carica lista (Excel/PDF)",
            uploading: "Caricamento...",
            clearList: "Cancella lista",
            startDraw: "Inizia estrazione",
            match: "Abbina",
            happyNewYear: "🎄 Buon Anno!",
            minPeople3: "Aggiungi almeno 3 persone",
            minPeople2: "Aggiungi almeno 2 persone",
            evenNumber: "Il numero deve essere pari",
            nameExists: "Questo nome esiste già!",
            namesAdded: "nomi aggiunti",
            totalCount: "Totale",
            startDrawConfirm: "Vuoi iniziare l'estrazione?",
            notEnoughPeople: "Non ci sono abbastanza persone per l'estrazione.",
            noNamesFound: "Impossibile leggere i nomi dal file.",
            uploadError: "Si è verificato un errore durante il caricamento.",
            unsupportedFormat: "Formato non supportato. Per favore usa Excel (.xlsx) o PDF.",
            secretDrawMinError: "L'estrazione segreta richiede almeno 3 persone!",
            directMatchMinError: "L'abbinamento richiede almeno 2 persone!",
            directMatchEvenError: "L'abbinamento diretto richiede un numero pari! Per favore aggiungi o rimuovi qualcuno.",
            drawError: "Si è verificato un errore, per favore riprova."
        },
        result: {
            whoGetsGift: "A chi compro un regalo?",
            selectName: "Seleziona il tuo nome e vedi il risultato. 🎁",
            matchList: "Lista abbinamenti",
            christmasMatches: "Ecco gli abbinamenti natalizi! 🎄",
            giftRecipient: "IL TUO DESTINATARIO",
            keepSecret: "Non dimenticarlo! Mantieni il segreto, non rovinare la sorpresa. 🤫",
            seeGiftIdeas: "Vedi idee regalo",
            aiSuggestions: "Suggerimenti IA per regali",
            noSuggestions: "Nessun suggerimento trovato.",
            someoneElse: "Lascia guardare qualcun altro",
            newDraw: "Nuova estrazione",
            seeResult: "Vedi risultato",
            selectYourName: "Seleziona il tuo nome...",
            backToHome: "Torna alla home"
        },
        common: {
            loading: "Caricamento...",
            error: "Errore",
            confirm: "Conferma",
            cancel: "Annulla",
            yes: "Sì",
            no: "No",
            clearConfirm: "Sei sicuro di voler cancellare l'intera lista?"
        }
    },

    // Portuguese
    pt: {
        meta: {
            title: "YulaSanta - Sorteio de Amigo Secreto Online",
            description: "Crie sorteios gratuitos de Amigo Secreto sem anúncios com amigos, família ou colegas em segundos!",
            keywords: ["amigo secreto", "troca de presentes", "sorteio de natal", "sorteio online", "presente de natal"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "Adicione seus amigos, inicie o sorteio!",
            secretDraw: "Sorteio Secreto 🤫",
            directMatch: "Correspondência Direta 🤝",
            inputPlaceholder: "Digite um nome...",
            noParticipants: "Ninguém adicionado ainda",
            uploadList: "Carregar lista (Excel/PDF)",
            uploading: "Carregando...",
            clearList: "Limpar lista",
            startDraw: "Iniciar sorteio",
            match: "Corresponder",
            happyNewYear: "🎄 Feliz Ano Novo!",
            minPeople3: "Adicione pelo menos 3 pessoas",
            minPeople2: "Adicione pelo menos 2 pessoas",
            evenNumber: "O número deve ser par",
            nameExists: "Este nome já existe!",
            namesAdded: "nomes adicionados",
            totalCount: "Total",
            startDrawConfirm: "Você quer iniciar o sorteio?",
            notEnoughPeople: "Não há pessoas suficientes para o sorteio.",
            noNamesFound: "Não foi possível ler nomes do arquivo.",
            uploadError: "Ocorreu um erro ao carregar.",
            unsupportedFormat: "Formato não suportado. Por favor use Excel (.xlsx) ou PDF.",
            secretDrawMinError: "O sorteio secreto requer pelo menos 3 pessoas!",
            directMatchMinError: "A correspondência requer pelo menos 2 pessoas!",
            directMatchEvenError: "A correspondência direta requer um número par! Por favor adicione ou remova alguém.",
            drawError: "Ocorreu um erro, por favor tente novamente."
        },
        result: {
            whoGetsGift: "Para quem eu compro um presente?",
            selectName: "Selecione seu nome e veja o resultado. 🎁",
            matchList: "Lista de correspondências",
            christmasMatches: "Aqui estão as correspondências de Natal! 🎄",
            giftRecipient: "SEU DESTINATÁRIO",
            keepSecret: "Não esqueça! Guarde segredo, não estrague a surpresa. 🤫",
            seeGiftIdeas: "Ver ideias de presentes",
            aiSuggestions: "Sugestões IA de presentes",
            noSuggestions: "Nenhuma sugestão encontrada.",
            someoneElse: "Deixe outra pessoa olhar",
            newDraw: "Novo sorteio",
            seeResult: "Ver resultado",
            selectYourName: "Selecione seu nome...",
            backToHome: "Voltar ao início"
        },
        common: {
            loading: "Carregando...",
            error: "Erro",
            confirm: "Confirmar",
            cancel: "Cancelar",
            yes: "Sim",
            no: "Não",
            clearConfirm: "Tem certeza de que deseja limpar toda a lista?"
        }
    },

    // Russian
    ru: {
        meta: {
            title: "YulaSanta - Онлайн Тайный Санта",
            description: "Создавайте бесплатные жеребьёвки Тайного Санты без рекламы с друзьями, семьёй или коллегами за секунды!",
            keywords: ["тайный санта", "обмен подарками", "новогодняя жеребьёвка", "онлайн розыгрыш", "новогодний подарок"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "Добавьте друзей, начните жеребьёвку!",
            secretDraw: "Тайная Жеребьёвка 🤫",
            directMatch: "Прямое Сопоставление 🤝",
            inputPlaceholder: "Введите имя...",
            noParticipants: "Пока никто не добавлен",
            uploadList: "Загрузить список (Excel/PDF)",
            uploading: "Загрузка...",
            clearList: "Очистить список",
            startDraw: "Начать жеребьёвку",
            match: "Сопоставить",
            happyNewYear: "🎄 С Новым Годом!",
            minPeople3: "Добавьте минимум 3 человека",
            minPeople2: "Добавьте минимум 2 человека",
            evenNumber: "Количество должно быть чётным",
            nameExists: "Это имя уже существует!",
            namesAdded: "имён добавлено",
            totalCount: "Всего",
            startDrawConfirm: "Хотите начать жеребьёвку?",
            notEnoughPeople: "Недостаточно людей для жеребьёвки.",
            noNamesFound: "Не удалось прочитать имена из файла.",
            uploadError: "Произошла ошибка при загрузке.",
            unsupportedFormat: "Неподдерживаемый формат. Пожалуйста, используйте Excel (.xlsx) или PDF.",
            secretDrawMinError: "Тайная жеребьёвка требует минимум 3 человека!",
            directMatchMinError: "Сопоставление требует минимум 2 человека!",
            directMatchEvenError: "Прямое сопоставление требует чётное количество! Пожалуйста, добавьте или удалите кого-то.",
            drawError: "Произошла ошибка, пожалуйста, попробуйте снова."
        },
        result: {
            whoGetsGift: "Кому я покупаю подарок?",
            selectName: "Выберите своё имя и увидите результат. 🎁",
            matchList: "Список сопоставлений",
            christmasMatches: "Вот новогодние сопоставления! 🎄",
            giftRecipient: "ВАШ ПОЛУЧАТЕЛЬ",
            keepSecret: "Не забудьте! Храните секрет, не портите сюрприз. 🤫",
            seeGiftIdeas: "Посмотреть идеи подарков",
            aiSuggestions: "ИИ-предложения подарков",
            noSuggestions: "Предложения не найдены.",
            someoneElse: "Пусть посмотрит кто-то другой",
            newDraw: "Новая жеребьёвка",
            seeResult: "Посмотреть результат",
            selectYourName: "Выберите своё имя...",
            backToHome: "Вернуться на главную"
        },
        common: {
            loading: "Загрузка...",
            error: "Ошибка",
            confirm: "Подтвердить",
            cancel: "Отмена",
            yes: "Да",
            no: "Нет",
            clearConfirm: "Вы уверены, что хотите очистить весь список?"
        }
    },

    // Arabic
    ar: {
        meta: {
            title: "YulaSanta - قرعة بابا نويل السري عبر الإنترنت",
            description: "أنشئ قرعات بابا نويل السري مجانية وبدون إعلانات مع الأصدقاء والعائلة أو الزملاء في ثوانٍ!",
            keywords: ["بابا نويل السري", "تبادل الهدايا", "قرعة عيد الميلاد", "قرعة عبر الإنترنت", "هدية عيد الميلاد"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "أضف أصدقاءك، ابدأ القرعة!",
            secretDraw: "قرعة سرية 🤫",
            directMatch: "مطابقة مباشرة 🤝",
            inputPlaceholder: "أدخل اسماً...",
            noParticipants: "لم يُضف أحد بعد",
            uploadList: "تحميل القائمة (Excel/PDF)",
            uploading: "جاري التحميل...",
            clearList: "مسح القائمة",
            startDraw: "بدء القرعة",
            match: "مطابقة",
            happyNewYear: "🎄 سنة جديدة سعيدة!",
            minPeople3: "أضف 3 أشخاص على الأقل",
            minPeople2: "أضف شخصين على الأقل",
            evenNumber: "يجب أن يكون العدد زوجياً",
            nameExists: "هذا الاسم موجود بالفعل!",
            namesAdded: "أسماء مضافة",
            totalCount: "المجموع",
            startDrawConfirm: "هل تريد بدء القرعة؟",
            notEnoughPeople: "لا يوجد عدد كافٍ من الأشخاص للقرعة.",
            noNamesFound: "تعذر قراءة الأسماء من الملف.",
            uploadError: "حدث خطأ أثناء التحميل.",
            unsupportedFormat: "تنسيق غير مدعوم. يرجى استخدام Excel (.xlsx) أو PDF.",
            secretDrawMinError: "القرعة السرية تتطلب 3 أشخاص على الأقل!",
            directMatchMinError: "المطابقة تتطلب شخصين على الأقل!",
            directMatchEvenError: "المطابقة المباشرة تتطلب عدداً زوجياً! يرجى إضافة أو إزالة شخص.",
            drawError: "حدث خطأ، يرجى المحاولة مرة أخرى."
        },
        result: {
            whoGetsGift: "لمن أشتري هدية؟",
            selectName: "اختر اسمك وشاهد النتيجة. 🎁",
            matchList: "قائمة المطابقات",
            christmasMatches: "إليك مطابقات العيد! 🎄",
            giftRecipient: "مستلم هديتك",
            keepSecret: "لا تنسَ! احفظ السر، لا تفسد المفاجأة. 🤫",
            seeGiftIdeas: "شاهد أفكار الهدايا",
            aiSuggestions: "اقتراحات الذكاء الاصطناعي للهدايا",
            noSuggestions: "لم يتم العثور على اقتراحات.",
            someoneElse: "دع شخصاً آخر ينظر",
            newDraw: "قرعة جديدة",
            seeResult: "شاهد النتيجة",
            selectYourName: "اختر اسمك...",
            backToHome: "العودة للرئيسية"
        },
        common: {
            loading: "جاري التحميل...",
            error: "خطأ",
            confirm: "تأكيد",
            cancel: "إلغاء",
            yes: "نعم",
            no: "لا",
            clearConfirm: "هل أنت متأكد أنك تريد مسح القائمة بأكملها؟"
        }
    },

    // Japanese
    ja: {
        meta: {
            title: "YulaSanta - オンラインシークレットサンタ抽選",
            description: "友達、家族、同僚と無料で広告なしのシークレットサンタ抽選を数秒で作成しましょう！",
            keywords: ["シークレットサンタ", "プレゼント交換", "クリスマス抽選", "オンライン抽選", "クリスマスプレゼント"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "友達を追加して、抽選を開始！",
            secretDraw: "シークレット抽選 🤫",
            directMatch: "ダイレクトマッチ 🤝",
            inputPlaceholder: "名前を入力...",
            noParticipants: "まだ誰も追加されていません",
            uploadList: "リストをアップロード (Excel/PDF)",
            uploading: "アップロード中...",
            clearList: "リストをクリア",
            startDraw: "抽選開始",
            match: "マッチ",
            happyNewYear: "🎄 新年おめでとう！",
            minPeople3: "最低3人追加してください",
            minPeople2: "最低2人追加してください",
            evenNumber: "人数は偶数でなければなりません",
            nameExists: "この名前は既に存在します！",
            namesAdded: "名前が追加されました",
            totalCount: "合計",
            startDrawConfirm: "抽選を開始しますか？",
            notEnoughPeople: "抽選に十分な人数がいません。",
            noNamesFound: "ファイルから名前を読み取れませんでした。",
            uploadError: "アップロード中にエラーが発生しました。",
            unsupportedFormat: "サポートされていない形式です。Excel (.xlsx) または PDF を使用してください。",
            secretDrawMinError: "シークレット抽選には最低3人必要です！",
            directMatchMinError: "マッチングには最低2人必要です！",
            directMatchEvenError: "ダイレクトマッチには偶数の人数が必要です！誰かを追加または削除してください。",
            drawError: "エラーが発生しました。もう一度お試しください。"
        },
        result: {
            whoGetsGift: "誰にプレゼントを買う？",
            selectName: "名前を選択して結果を見てください。 🎁",
            matchList: "マッチリスト",
            christmasMatches: "クリスマスマッチです！ 🎄",
            giftRecipient: "あなたの贈り先",
            keepSecret: "忘れないで！秘密を守って、サプライズを台無しにしないで。 🤫",
            seeGiftIdeas: "ギフトアイデアを見る",
            aiSuggestions: "AIギフト提案",
            noSuggestions: "提案が見つかりませんでした。",
            someoneElse: "他の人に見てもらう",
            newDraw: "新しい抽選",
            seeResult: "結果を見る",
            selectYourName: "名前を選択...",
            backToHome: "ホームに戻る"
        },
        common: {
            loading: "読み込み中...",
            error: "エラー",
            confirm: "確認",
            cancel: "キャンセル",
            yes: "はい",
            no: "いいえ",
            clearConfirm: "リスト全体を削除してもよろしいですか？"
        }
    },

    // Korean
    ko: {
        meta: {
            title: "YulaSanta - 온라인 시크릿 산타 추첨",
            description: "친구, 가족, 동료와 함께 무료로 광고 없이 시크릿 산타 추첨을 몇 초 만에 만드세요!",
            keywords: ["시크릿 산타", "선물 교환", "크리스마스 추첨", "온라인 추첨", "크리스마스 선물"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "친구를 추가하고 추첨을 시작하세요!",
            secretDraw: "비밀 추첨 🤫",
            directMatch: "직접 매칭 🤝",
            inputPlaceholder: "이름을 입력하세요...",
            noParticipants: "아직 아무도 추가되지 않았습니다",
            uploadList: "목록 업로드 (Excel/PDF)",
            uploading: "업로드 중...",
            clearList: "목록 지우기",
            startDraw: "추첨 시작",
            match: "매칭",
            happyNewYear: "🎄 새해 복 많이 받으세요!",
            minPeople3: "최소 3명을 추가하세요",
            minPeople2: "최소 2명을 추가하세요",
            evenNumber: "인원이 짝수여야 합니다",
            nameExists: "이 이름은 이미 존재합니다!",
            namesAdded: "이름이 추가됨",
            totalCount: "총",
            startDrawConfirm: "추첨을 시작하시겠습니까?",
            notEnoughPeople: "추첨에 충분한 인원이 없습니다.",
            noNamesFound: "파일에서 이름을 읽을 수 없습니다.",
            uploadError: "업로드 중 오류가 발생했습니다.",
            unsupportedFormat: "지원되지 않는 형식입니다. Excel (.xlsx) 또는 PDF를 사용하세요.",
            secretDrawMinError: "비밀 추첨에는 최소 3명이 필요합니다!",
            directMatchMinError: "매칭에는 최소 2명이 필요합니다!",
            directMatchEvenError: "직접 매칭에는 짝수 인원이 필요합니다! 누군가를 추가하거나 제거하세요.",
            drawError: "오류가 발생했습니다. 다시 시도해 주세요."
        },
        result: {
            whoGetsGift: "누구에게 선물을 사나요?",
            selectName: "이름을 선택하고 결과를 확인하세요. 🎁",
            matchList: "매칭 목록",
            christmasMatches: "크리스마스 매칭입니다! 🎄",
            giftRecipient: "선물 받는 사람",
            keepSecret: "잊지 마세요! 비밀을 지키고, 서프라이즈를 망치지 마세요. 🤫",
            seeGiftIdeas: "선물 아이디어 보기",
            aiSuggestions: "AI 선물 추천",
            noSuggestions: "추천을 찾을 수 없습니다.",
            someoneElse: "다른 사람이 확인하게 하기",
            newDraw: "새 추첨",
            seeResult: "결과 보기",
            selectYourName: "이름을 선택하세요...",
            backToHome: "홈으로 돌아가기"
        },
        common: {
            loading: "로딩 중...",
            error: "오류",
            confirm: "확인",
            cancel: "취소",
            yes: "예",
            no: "아니오",
            clearConfirm: "전체 목록을 삭제하시겠습니까?"
        }
    },

    // Chinese
    zh: {
        meta: {
            title: "YulaSanta - 在线神秘圣诞老人抽签",
            description: "与朋友、家人或同事在几秒钟内创建免费、无广告的神秘圣诞老人抽签！",
            keywords: ["神秘圣诞老人", "礼物交换", "圣诞抽签", "在线抽签", "圣诞礼物"]
        },
        home: {
            title: "YulaSanta",
            subtitle: "添加朋友，开始抽签！",
            secretDraw: "秘密抽签 🤫",
            directMatch: "直接配对 🤝",
            inputPlaceholder: "输入姓名...",
            noParticipants: "还没有添加任何人",
            uploadList: "上传列表 (Excel/PDF)",
            uploading: "上传中...",
            clearList: "清除列表",
            startDraw: "开始抽签",
            match: "配对",
            happyNewYear: "🎄 新年快乐！",
            minPeople3: "至少添加3人",
            minPeople2: "至少添加2人",
            evenNumber: "人数必须是偶数",
            nameExists: "此名字已存在！",
            namesAdded: "个名字已添加",
            totalCount: "总计",
            startDrawConfirm: "要开始抽签吗？",
            notEnoughPeople: "抽签人数不足。",
            noNamesFound: "无法从文件中读取名字。",
            uploadError: "上传时发生错误。",
            unsupportedFormat: "不支持的格式。请使用 Excel (.xlsx) 或 PDF。",
            secretDrawMinError: "秘密抽签至少需要3人！",
            directMatchMinError: "配对至少需要2人！",
            directMatchEvenError: "直接配对需要偶数人数！请添加或移除一人。",
            drawError: "发生错误，请重试。"
        },
        result: {
            whoGetsGift: "我给谁买礼物？",
            selectName: "选择你的名字并查看结果。 🎁",
            matchList: "配对列表",
            christmasMatches: "这是圣诞配对！ 🎄",
            giftRecipient: "你的礼物接收者",
            keepSecret: "别忘了！保守秘密，不要破坏惊喜。 🤫",
            seeGiftIdeas: "查看礼物创意",
            aiSuggestions: "AI礼物建议",
            noSuggestions: "未找到建议。",
            someoneElse: "让其他人查看",
            newDraw: "新抽签",
            seeResult: "查看结果",
            selectYourName: "选择你的名字...",
            backToHome: "返回首页"
        },
        common: {
            loading: "加载中...",
            error: "错误",
            confirm: "确认",
            cancel: "取消",
            yes: "是",
            no: "否",
            clearConfirm: "确定要清除整个列表吗？"
        }
    }
};

export default translations;
