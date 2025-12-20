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
    // Giveaway
    giveaway: {
        links: string;
        rules: string;
        participants: string;
        giveawayName: string;
        winnerCount: string;
        backupCount: string;
        startGiveaway: string;
        newGiveaway: string;
        copyResults: string;
        copied: string;
        comments: string;
        likes: string;
        subscribers: string;
        retweets: string;
        replies: string;
        followers: string;
        tags: string;
        fetchComments: string;
        fetching: string;
        linkInputPlaceholder: string;
        addParticipant: string;
        bulkAdd: string;
        clearAll: string;
        results: string;
        winners: string;
        backups: string;
        youtubeTitle: string;
        instagramTitle: string;
        twitterTitle: string;
        youtubeDesc: string;
        instagramDesc: string;
        twitterDesc: string;
        requireSubscription: string;
        requireNotification: string;
        requireFollow: string;
        requireRetweet: string;
        requireLike: string;
        countUserOnce: string;
        inputError: string;
        fetchError: string;
        apiLimitation: string;
        manualMode: string;
        autoMode: string;
        manualDesc: string;
        autoDesc: string;
        pasteComments: string;
        parse: string;
        parsed: string;
    };
    // Support
    support: {
        button: string;
        title: string;
        description: string;
        subject: string;
        message: string;
        send: string;
        contact: string;
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

const enTranslation: Translation = {
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
    giveaway: {
        links: "Links",
        rules: "Rules",
        participants: "Participants",
        giveawayName: "Giveaway Name",
        winnerCount: "Winner Count",
        backupCount: "Backup Count",
        startGiveaway: "Start Giveaway",
        newGiveaway: "New Giveaway",
        copyResults: "Copy Results",
        copied: "Copied!",
        comments: "Comments",
        likes: "Likes",
        subscribers: "Subscribers",
        retweets: "Retweets",
        replies: "Replies",
        followers: "Followers",
        tags: "Tags",
        fetchComments: "Fetch Comments",
        fetching: "Fetching...",
        linkInputPlaceholder: "Paste Link",
        addParticipant: "Add Participant",
        bulkAdd: "Bulk Add",
        clearAll: "Clear All",
        results: "Results",
        winners: "Winners",
        backups: "Backups",
        youtubeTitle: "Free YouTube Giveaway",
        instagramTitle: "Instagram Giveaway Tool",
        twitterTitle: "Free Twitter/X Giveaway",
        youtubeDesc: "Easily draw from comments, likes, and subscribers on your YouTube videos.",
        instagramDesc: "Easily draw from comments and likes on your Instagram posts.",
        twitterDesc: "Easily draw from retweets, likes, and replies on Twitter/X.",
        requireSubscription: "Require Subscription",
        requireNotification: "Require Notification",
        requireFollow: "Require Follow",
        requireRetweet: "Require Retweet",
        requireLike: "Require Like",
        countUserOnce: "Count User Once",
        inputError: "Please enter a valid link!",
        fetchError: "Could not fetch data.",
        apiLimitation: "Automatic fetching is currently unavailable due to platform limitations. Please use manual entry.",
        manualMode: "Manual Entry (Free)",
        autoMode: "Automatic Fetch (Apify)",
        manualDesc: "Best for small giveaways (50-100 comments). Paste comments directly.",
        autoDesc: "Best for large giveaways. Requires Apify set up.",
        pasteComments: "Paste comments here (One per line)",
        parse: "Parse Comments",
        parsed: "{count} participants parsed"
    },
    support: {
        button: "Support",
        title: "Contact Support",
        description: "Have feedback or need help? We are here.",
        subject: "Subject",
        message: "Message",
        send: "Send Email",
        contact: "Contact us at"
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
};

export const translations: Record<Locale, Translation> = {
    // Turkish
    tr: {
        meta: {
            title: "YulaSanta - Online Çekiliş Yap",
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
        giveaway: {
            links: "Linkler",
            rules: "Kurallar",
            participants: "Katılımcılar",
            giveawayName: "Çekiliş Adı",
            winnerCount: "Kazanan Sayısı",
            backupCount: "Yedek Sayısı",
            startGiveaway: "Çekilişi Başlat",
            newGiveaway: "Yeni Çekiliş",
            copyResults: "Sonuçları Kopyala",
            copied: "Kopyalandı!",
            comments: "Yorumlar",
            likes: "Beğeniler",
            subscribers: "Aboneler",
            retweets: "Retweetler",
            replies: "Yanıtlar",
            followers: "Takipçiler",
            tags: "Etiketler",
            fetchComments: "Yorumları Getir",
            fetching: "Çekiliyor...",
            linkInputPlaceholder: "Linki Yapıştırın",
            addParticipant: "Katılımcı Ekle",
            bulkAdd: "Toplu Ekle",
            clearAll: "Tümünü Sil",
            results: "Sonuçlar",
            winners: "Kazananlar",
            backups: "Yedekler",
            youtubeTitle: "Ücretsiz YouTube Çekiliş Aracı",
            instagramTitle: "Instagram Çekiliş Aracı",
            twitterTitle: "Ücretsiz Twitter/X Çekiliş Aracı",
            youtubeDesc: "YouTube videolarınızdaki yorumlar ve beğeniler arasından kolayca çekiliş yapın.",
            instagramDesc: "Instagram gönderilerinizdeki yorumlar ve beğeniler arasından kolayca çekiliş yapın.",
            twitterDesc: "Twitter/X'teki retweet ve beğeniler arasından kolayca çekiliş yapın.",
            requireSubscription: "Abone Olma Şartı",
            requireNotification: "Bildirim Şartı",
            requireFollow: "Takip Şartı",
            requireRetweet: "Retweet Şartı",
            requireLike: "Beğeni Şartı",
            countUserOnce: "Her Kullanıcıyı 1 Kere Say",
            inputError: "Lütfen geçerli bir link giriniz!",
            fetchError: "Veriler çekilemedi.",
            apiLimitation: "Platform kısıtlamaları nedeniyle otomatik veri çekme şu anda kullanılamıyor. Lütfen manuel giriş yapınız.",
            manualMode: "Manuel Giriş (Ücretsiz)",
            autoMode: "Otomatik Çekim (Apify)",
            manualDesc: "Küçük çekilişler (50-100 yorum) için ideal. Yorumları direkt yapıştırın.",
            autoDesc: "Büyük çekilişler için ideal. Apify kurulumu gerektirir.",
            pasteComments: "Yorumları buraya yapıştırın (Her satıra bir tane)",
            parse: "Yorumları Ayrıştır",
            parsed: "{count} kişi ayrıştırıldı"
        },
        support: {
            button: "Destek",
            title: "Destek & İletişim",
            description: "Görüşleriniz için bize ulaşın.",
            subject: "Konu",
            message: "Mesaj",
            send: "Gönder",
            contact: "İletişim"
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
    en: enTranslation,

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
        giveaway: {
            links: "Links",
            rules: "Regeln",
            participants: "Teilnehmer",
            giveawayName: "Gewinnspiel Name",
            winnerCount: "Anzahl Gewinner",
            backupCount: "Anzahl Ersatz",
            startGiveaway: "Gewinnspiel Starten",
            newGiveaway: "Neues Gewinnspiel",
            copyResults: "Ergebnisse Kopieren",
            copied: "Kopiert!",
            comments: "Kommentare",
            likes: "Likes",
            subscribers: "Abonnenten",
            retweets: "Retweets",
            replies: "Antworten",
            followers: "Follower",
            tags: "Tags",
            fetchComments: "Kommentare Laden",
            fetching: "Laden...",
            linkInputPlaceholder: "Link Einfügen",
            addParticipant: "Teilnehmer Hinzufügen",
            bulkAdd: "Masseneingabe",
            clearAll: "Alles Löschen",
            results: "Ergebnisse",
            winners: "Gewinner",
            backups: "Ersatz",
            youtubeTitle: "YouTube Gewinnspiel",
            instagramTitle: "Instagram Gewinnspiel",
            twitterTitle: "Twitter Gewinnspiel",
            youtubeDesc: "Aus Kommentaren ziehen",
            instagramDesc: "Aus Kommentaren ziehen",
            twitterDesc: "Aus Retweets/Antworten ziehen",
            requireSubscription: "Abo erforderlich",
            requireNotification: "Benachrichtigung an",
            requireFollow: "Follow erforderlich",
            requireRetweet: "Retweet erforderlich",
            requireLike: "Like erforderlich",
            countUserOnce: "Benutzer einmal zählen",
            inputError: "Bitte geben Sie einen gültigen Link ein!",
            fetchError: "Daten konnten nicht abgerufen werden.",
            apiLimitation: "Das automatische Abrufen ist aufgrund von Plattformbeschränkungen derzeit nicht verfügbar. Bitte verwenden Sie die manuelle Eingabe.",
            manualMode: "Manuel Entry (Free)",
            autoMode: "Auto Fetch (Apify)",
            manualDesc: "Best for small giveaways. Paste comments.",
            autoDesc: "Best for large giveaways. Requires Apify.",
            pasteComments: "Paste comments here",
            parse: "Parse Comments",
            parsed: "{count} participants parsed"
        },
        support: {
            button: "Support",
            title: "Kontakt",
            description: "Haben Sie Fragen?",
            subject: "Betreff",
            message: "Nachricht",
            send: "Senden",
            contact: "Kontaktieren Sie uns"
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
        giveaway: {
            links: "Liens",
            rules: "Règles",
            participants: "Participants",
            giveawayName: "Nom du tirage",
            winnerCount: "Nombre de gagnants",
            backupCount: "Nombre de remplaçants",
            startGiveaway: "Lancer le tirage",
            newGiveaway: "Nouveau tirage",
            copyResults: "Copier",
            copied: "Copié!",
            comments: "Commentaires",
            likes: "J'aime",
            subscribers: "Abonnés",
            retweets: "Retweets",
            replies: "Réponses",
            followers: "Abonnés",
            tags: "Tags",
            fetchComments: "Récupérer",
            fetching: "Chargement...",
            linkInputPlaceholder: "Coller le lien",
            addParticipant: "Ajouter participant",
            bulkAdd: "Ajout groupé",
            clearAll: "Tout effacer",
            results: "Résultats",
            winners: "Gagnants",
            backups: "Remplaçants",
            youtubeTitle: "Tirage YouTube",
            instagramTitle: "Tirage Instagram",
            twitterTitle: "Tirage Twitter",
            youtubeDesc: "Tirage via commentaires YouTube",
            instagramDesc: "Tirage via commentaires Instagram",
            twitterDesc: "Tirage via Retweets/Réponses",
            requireSubscription: "Abonnement requis",
            requireNotification: "Notification requise",
            requireFollow: "Suivi requis",
            requireRetweet: "Retweet requis",
            requireLike: "J'aime requis",
            countUserOnce: "Compter utilisateur une fois",
            inputError: "Veuillez entrer un lien valide!",
            fetchError: "Impossible de récupérer les données.",
            apiLimitation: "La récupération automatique est actuellement indisponible en raison des limitations de la plateforme. Veuillez utiliser la saisie manuelle.",
            manualMode: "Manuel Entry (Free)",
            autoMode: "Auto Fetch (Apify)",
            manualDesc: "Best for small giveaways. Paste comments.",
            autoDesc: "Best for large giveaways. Requires Apify.",
            pasteComments: "Paste comments here",
            parse: "Parse Comments",
            parsed: "{count} participants parsed"
        },
        support: {
            button: "Support",
            title: "Contact",
            description: "Avez-vous des questions?",
            subject: "Sujet",
            message: "Message",
            send: "Envoyer",
            contact: "Contactez-nous"
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

    // Other languages (Fallback to English for now)
    es: enTranslation,
    it: enTranslation,
    pt: enTranslation,
    ru: enTranslation,
    ar: enTranslation,
    ja: enTranslation,
    ko: enTranslation,
    zh: enTranslation
};

export default translations;
