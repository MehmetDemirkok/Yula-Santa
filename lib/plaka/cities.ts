/**
 * Plaka Avcısı — Türkiye'nin 81 ili.
 * Client-safe: no Node/DB imports. Seed source for the `plaka_cities` table.
 */

export type PlakaRegion =
    | 'Marmara'
    | 'Ege'
    | 'Akdeniz'
    | 'İç Anadolu'
    | 'Karadeniz'
    | 'Doğu Anadolu'
    | 'Güneydoğu Anadolu';

export type PlakaDifficulty = 'kolay' | 'orta' | 'zor';

export type PlakaCity = {
    /** Plate code 1–81 (01 Adana … 81 Düzce) */
    code: number;
    name: string;
    slug: string;
    region: PlakaRegion;
    difficulty: PlakaDifficulty;
    /** Mode 4 clues — geographic/regional fact first, landmark or signature feature second. */
    hints: [string, string];
};

export const PLATE_REGIONS: PlakaRegion[] = [
    'Marmara',
    'Ege',
    'Akdeniz',
    'İç Anadolu',
    'Karadeniz',
    'Doğu Anadolu',
    'Güneydoğu Anadolu',
];

export const CITIES: PlakaCity[] = [
    { code: 1, name: 'Adana', slug: 'adana', region: 'Akdeniz', difficulty: 'kolay', hints: ['Akdeniz Bölgesi’nin Çukurova kesiminde, Seyhan Nehri kıyısındadır.', 'Türkiye’nin en meşhur kebapları ve Taşköprü’süyle bilinir.'] },
    { code: 2, name: 'Adıyaman', slug: 'adiyaman', region: 'Güneydoğu Anadolu', difficulty: 'zor', hints: ['Güneydoğu Anadolu Bölgesi’nde, Fırat’ın batısında yer alır.', 'Nemrut Dağı’ndaki dev heykeller bu ilin sınırlarındadır.'] },
    { code: 3, name: 'Afyonkarahisar', slug: 'afyonkarahisar', region: 'Ege', difficulty: 'orta', hints: ['Ege Bölgesi’nin İç Batı Anadolu bölümündedir.', 'Kaymak, sucuk ve mermeriyle ünlüdür; kalesi şehrin ortasındadır.'] },
    { code: 4, name: 'Ağrı', slug: 'agri', region: 'Doğu Anadolu', difficulty: 'zor', hints: ['Doğu Anadolu’nun en yüksek zirvesine ev sahipliği yapar.', 'Türkiye’nin çatısı sayılan Ağrı Dağı buradadır.'] },
    { code: 5, name: 'Amasya', slug: 'amasya', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz Bölgesi’nin iç kesiminde, Yeşilırmak vadisine kurulmuştur.', 'Kral kaya mezarları ve elmalarıyla tanınır.'] },
    { code: 6, name: 'Ankara', slug: 'ankara', region: 'İç Anadolu', difficulty: 'kolay', hints: ['İç Anadolu Bölgesi’nin ortasında yer alır.', 'Türkiye’nin başkentidir; Anıtkabir burada bulunur.'] },
    { code: 7, name: 'Antalya', slug: 'antalya', region: 'Akdeniz', difficulty: 'kolay', hints: ['Akdeniz’in kuzeyinde, Toroslar’ın eteğinde kurulmuştur.', 'Kaleiçi, Aspendos ve dünyaca ünlü plajlarıyla bilinir.'] },
    { code: 8, name: 'Artvin', slug: 'artvin', region: 'Karadeniz', difficulty: 'zor', hints: ['Karadeniz’in doğusunda, Gürcistan sınırına yakındır.', 'Yeşil vadileri, rafting yapılan Çoruh Nehri ve balıyla ünlüdür.'] },
    { code: 9, name: 'Aydın', slug: 'aydin', region: 'Ege', difficulty: 'kolay', hints: ['Ege Bölgesi’nde, Büyük Menderes havzasında yer alır.', 'İncir ve zeytiniyle ünlüdür; antik Efes kalıntıları yakınındadır.'] },
    { code: 10, name: 'Balıkesir', slug: 'balikesir', region: 'Marmara', difficulty: 'orta', hints: ['Marmara ile Ege’nin kesiştiği noktada yer alır.', 'Ayvalık, Cunda ve Kaz Dağları bu ilin sınırlarındadır.'] },
    { code: 11, name: 'Bilecik', slug: 'bilecik', region: 'Marmara', difficulty: 'zor', hints: ['Marmara Bölgesi’nin güneydoğusunda, Sakarya vadisine yakındır.', 'Osmanlı Devleti’nin kuruluş topraklarındadır; Söğüt ilçesi buradadır.'] },
    { code: 12, name: 'Bingöl', slug: 'bingol', region: 'Doğu Anadolu', difficulty: 'zor', hints: ['Doğu Anadolu Bölgesi’nin ortasında, dağlarla çevrili bir platoda kurulmuştur.', 'Yüzen adaları ve bal dolu yaylalarıyla tanınır.'] },
    { code: 13, name: 'Bitlis', slug: 'bitlis', region: 'Doğu Anadolu', difficulty: 'zor', hints: ['Doğu Anadolu’da Van Gölü’nün batısında yer alır.', 'Tütünü ve Nemrut Krater Gölü ile bilinir.'] },
    { code: 14, name: 'Bolu', slug: 'bolu', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz Bölgesi’nin batısında, iki büyük şehir arasındadır.', 'Abant, Yedigöller ve Kardüz yaylaları bu ilde bulunur.'] },
    { code: 15, name: 'Burdur', slug: 'burdur', region: 'Akdeniz', difficulty: 'orta', hints: ['Akdeniz Bölgesi’nin Göller Yöresi’nde yer alır.', 'Salda Gölü’nün beyaz kumları ve gülüyle ünlüdür.'] },
    { code: 16, name: 'Bursa', slug: 'bursa', region: 'Marmara', difficulty: 'kolay', hints: ['Marmara Bölgesi’nde, Uludağ’ın eteğinde yer alır.', 'Osmanlı’nın ilk başkentidir; İskender kebabı ve ipeğiyle ünlüdür.'] },
    { code: 17, name: 'Çanakkale', slug: 'canakkale', region: 'Marmara', difficulty: 'orta', hints: ['Marmara’nın batısında, boğazın iki yakasına yayılmıştır.', 'Troya ve Gelibolu şehitlikleri bu ilin topraklarındadır.'] },
    { code: 18, name: 'Çankırı', slug: 'cankiri', region: 'İç Anadolu', difficulty: 'zor', hints: ['İç Anadolu’nun kuzeyinde, Kızılırmak havzasında yer alır.', 'Kaya tuzu mağarası ve ilginç kaya oluşumlarıyla bilinir.'] },
    { code: 19, name: 'Çorum', slug: 'corum', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz Bölgesi’nin iç kesiminde, İç Anadolu’ya komşudur.', 'Hitit başkenti Hattuşa ve leblebisi bu ilin simgesidir.'] },
    { code: 20, name: 'Denizli', slug: 'denizli', region: 'Ege', difficulty: 'kolay', hints: ['Ege Bölgesi’nin iç kesiminde, Büyük Menderes’in yukarısındadır.', 'Pamukkale travertenleri ve horozuyla dünyaca tanınır.'] },
    { code: 21, name: 'Diyarbakır', slug: 'diyarbakir', region: 'Güneydoğu Anadolu', difficulty: 'kolay', hints: ['Dicle Nehri kıyısında, Güneydoğu Anadolu’nun ortasındadır.', 'Karstik bazalt surları ve karpuzuyla ünlüdür.'] },
    { code: 22, name: 'Edirne', slug: 'edirne', region: 'Marmara', difficulty: 'orta', hints: ['Marmara’nın kuzeybatısında, iki ülke sınırında yer alır.', 'Selimiye Camii ve ciğeriyle tanınır.'] },
    { code: 23, name: 'Elazığ', slug: 'elazig', region: 'Doğu Anadolu', difficulty: 'orta', hints: ['Doğu Anadolu’nun batısında, Keban Barajı yakınındadır.', 'Harput’un tarihi dokusu ve tulum peyniriyle bilinir.'] },
    { code: 24, name: 'Erzincan', slug: 'erzincan', region: 'Doğu Anadolu', difficulty: 'orta', hints: ['Doğu Anadolu’da Fırat’ın yukarı havzasında kurulmuştur.', 'Tulum peyniri ve Munzur Dağları’nın etekleriyle ünlüdür.'] },
    { code: 25, name: 'Erzurum', slug: 'erzurum', region: 'Doğu Anadolu', difficulty: 'orta', hints: ['Doğu Anadolu’nun en yüksek platolarından birinde yer alır.', 'Palandöken kayak merkezi, cağ kebabı ve oltu taşıyla bilinir.'] },
    { code: 26, name: 'Eskişehir', slug: 'eskisehir', region: 'İç Anadolu', difficulty: 'kolay', hints: ['İç Anadolu’nun kuzeybatısında, Porsuk Çayı kıyısındadır.', 'Lületaşı, tramvayları ve öğrenci şehri kimliğiyle ünlüdür.'] },
    { code: 27, name: 'Gaziantep', slug: 'gaziantep', region: 'Güneydoğu Anadolu', difficulty: 'kolay', hints: ['Güneydoğu Anadolu’nun batısında, Suriye sınırına yakındır.', 'Baklavası ve antep fıstığıyla gastronomi şehridir.'] },
    { code: 28, name: 'Giresun', slug: 'giresun', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz kıyısında, Ordu ile Trabzon arasında yer alır.', 'Fındığın başkenti sayılır; Giresun Adası kıyısındadır.'] },
    { code: 29, name: 'Gümüşhane', slug: 'gumushane', region: 'Karadeniz', difficulty: 'zor', hints: ['Karadeniz’in iç kesiminde, Doğu Karadeniz dağlarının ardındadır.', 'Tarihi gümüş madenleri ve pestiliyle anılır.'] },
    { code: 30, name: 'Hakkari', slug: 'hakkari', region: 'Doğu Anadolu', difficulty: 'zor', hints: ['Türkiye’nin en güneydoğusunda, Irak ve İran sınırında yer alır.', 'Cilo Dağları ve buzul gölleriyle bilinir.'] },
    { code: 31, name: 'Hatay', slug: 'hatay', region: 'Akdeniz', difficulty: 'kolay', hints: ['Akdeniz’in doğusunda, Suriye sınırında yer alır.', 'Künefe, humus ve Habib-i Neccar Camii ile ünlüdür.'] },
    { code: 32, name: 'Isparta', slug: 'isparta', region: 'Akdeniz', difficulty: 'orta', hints: ['Akdeniz’in Göller Yöresi’nde, Toroslar’ın kuzeyindedir.', 'Gül yağı üretiminin merkezi ve Davraz kayak merkezi buradadır.'] },
    { code: 33, name: 'Mersin', slug: 'mersin', region: 'Akdeniz', difficulty: 'kolay', hints: ['Akdeniz kıyısında, Çukurova’nın batısında yer alır.', 'Tantuni, silifke yoğurdu ve Kızkalesi ile bilinir.'] },
    { code: 34, name: 'İstanbul', slug: 'istanbul', region: 'Marmara', difficulty: 'kolay', hints: ['İki kıtayı birleştiren boğazın iki yakasına kurulmuştur.', 'Ayasofya, Topkapı Sarayı ve Galata Kulesi buradadır.'] },
    { code: 35, name: 'İzmir', slug: 'izmir', region: 'Ege', difficulty: 'kolay', hints: ['Ege Denizi kıyısında, körfezin çevresine yayılmıştır.', 'Saat Kulesi, Kordon ve boyozuyla ünlüdür.'] },
    { code: 36, name: 'Kars', slug: 'kars', region: 'Doğu Anadolu', difficulty: 'orta', hints: ['Doğu Anadolu’nun kuzeydoğusunda, Ermenistan sınırına yakındır.', 'Ani harabeleri ve gravyeriyle tanınır.'] },
    { code: 37, name: 'Kastamonu', slug: 'kastamonu', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz’in batı iç kesiminde, Küre Dağları’nın güneyindedir.', 'Tarihi konakları ve sarımsağıyla ünlüdür.'] },
    { code: 38, name: 'Kayseri', slug: 'kayseri', region: 'İç Anadolu', difficulty: 'kolay', hints: ['İç Anadolu’nun doğusunda, Erciyes Dağı’nın eteğindedir.', 'Mantısı, sucuğu ve Erciyes kayak merkeziyle bilinir.'] },
    { code: 39, name: 'Kırklareli', slug: 'kirklareli', region: 'Marmara', difficulty: 'orta', hints: ['Marmara’nın kuzeybatısında, Bulgaristan sınırındadır.', 'İğneada longoz ormanları ve peyniriyle anılır.'] },
    { code: 40, name: 'Kırşehir', slug: 'kirsehir', region: 'İç Anadolu', difficulty: 'orta', hints: ['İç Anadolu’nun ortasında, Kızılırmak kavsi içinde yer alır.', 'Ahi Evran ve Cacabey Medresesi ile tarihi bir ilim şehridir.'] },
    { code: 41, name: 'Kocaeli', slug: 'kocaeli', region: 'Marmara', difficulty: 'kolay', hints: ['Marmara’nın doğusunda, İzmit Körfezi’nin ucundadır.', 'Türkiye’nin sanayi merkezlerinden biridir; pişmaniye buradan çıkar.'] },
    { code: 42, name: 'Konya', slug: 'konya', region: 'İç Anadolu', difficulty: 'kolay', hints: ['İç Anadolu’nun güneyinde, Türkiye’nin en geniş ovalarından birindedir.', 'Mevlana Müzesi ve etli ekmeğiyle ünlüdür.'] },
    { code: 43, name: 'Kütahya', slug: 'kutahya', region: 'Ege', difficulty: 'orta', hints: ['Ege’nin İç Batı Anadolu kesiminde, dağların arasında kurulmuştur.', 'Çinisi ve porseleniyle dünyaca tanınır.'] },
    { code: 44, name: 'Malatya', slug: 'malatya', region: 'Doğu Anadolu', difficulty: 'kolay', hints: ['Doğu Anadolu’nun batısında, Fırat’ın batı yakasındadır.', 'Kayısısı ve kayısı çekirdeğiyle ünlüdür.'] },
    { code: 45, name: 'Manisa', slug: 'manisa', region: 'Ege', difficulty: 'kolay', hints: ['Ege Bölgesi’nde, Spil Dağı’nın kuzey eteğinde yer alır.', 'Üzümü, mesir macunu ve Tarzan’ıyla anılır.'] },
    { code: 46, name: 'Kahramanmaraş', slug: 'kahramanmaras', region: 'Akdeniz', difficulty: 'kolay', hints: ['Akdeniz Bölgesi’nin doğusunda, Ahır Dağı’nın eteğindedir.', 'Dondurması, biberi ve tarhanasıyla ünlüdür.'] },
    { code: 47, name: 'Mardin', slug: 'mardin', region: 'Güneydoğu Anadolu', difficulty: 'orta', hints: ['Güneydoğu Anadolu’da, Mezopotamya ovasına bakan bir tepededir.', 'Taş evleri, Deyrulzafaran Manastırı ve telkâri işçiliğiyle bilinir.'] },
    { code: 48, name: 'Muğla', slug: 'mugla', region: 'Ege', difficulty: 'orta', hints: ['Ege’nin güneyinde, Akdeniz’e geçiş noktasındadır.', 'Bodrum, Marmaris, Fethiye ve Ölüdeniz bu ilin ilçeleridir.'] },
    { code: 49, name: 'Muş', slug: 'mus', region: 'Doğu Anadolu', difficulty: 'orta', hints: ['Doğu Anadolu’nun ortasında, geniş bir ovada kurulmuştur.', 'Lalesi, Malazgirt Ovası ve bir tür peyniriyle bilinir.'] },
    { code: 50, name: 'Nevşehir', slug: 'nevsehir', region: 'İç Anadolu', difficulty: 'orta', hints: ['İç Anadolu’da, Kapadokya bölgesinin merkezindedir.', 'Peribacaları, balon turları ve testi kebabıyla ünlüdür.'] },
    { code: 51, name: 'Niğde', slug: 'nigde', region: 'İç Anadolu', difficulty: 'zor', hints: ['İç Anadolu’nun güneydoğusunda, Aladağlar’ın kuzeyindedir.', 'Elması ve Aladağlar’daki buzul gölleriyle bilinir.'] },
    { code: 52, name: 'Ordu', slug: 'ordu', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz kıyısında, Giresun ile Samsun arasındadır.', 'Fındığı ve Boztepe’den görünen körfez manzarasıyla ünlüdür.'] },
    { code: 53, name: 'Rize', slug: 'rize', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz’in doğusunda, yeşil yamaçlarla kaplıdır.', 'Çayı, Ayder Yaylası ve Fırtına Vadisi ile bilinir.'] },
    { code: 54, name: 'Sakarya', slug: 'sakarya', region: 'Marmara', difficulty: 'zor', hints: ['Marmara’nın doğusunda, Sakarya Nehri’nin denize kavuştuğu yerdedir.', 'Adapazarı ilçesi, Sapanca Gölü ve ıslama köftesiyle anılır.'] },
    { code: 55, name: 'Samsun', slug: 'samsun', region: 'Karadeniz', difficulty: 'kolay', hints: ['Karadeniz kıyısında, Anadolu’nun kuzey ucundadır.', 'Kurtuluş Savaşı’nın başladığı şehirdir; Bafra ovası buradadır.'] },
    { code: 56, name: 'Siirt', slug: 'siirt', region: 'Güneydoğu Anadolu', difficulty: 'zor', hints: ['Güneydoğu Anadolu’da, Botan Vadisi’nin yukarısındadır.', 'Fıstığı, battaniyesi ve büryan kebabıyla ünlüdür.'] },
    { code: 57, name: 'Sinop', slug: 'sinop', region: 'Karadeniz', difficulty: 'orta', hints: ['Karadeniz’in en kuzey noktasında, bir yarımada üzerindedir.', 'Hamsisi, tarihi hapishanesi ve doğal limanıyla bilinir.'] },
    { code: 58, name: 'Sivas', slug: 'sivas', region: 'İç Anadolu', difficulty: 'kolay', hints: ['İç Anadolu’nun doğusunda, geniş bir platoda yer alır.', 'Kangal köpeği, Sivas kongresi ve dikişiyle anılır.'] },
    { code: 59, name: 'Tekirdağ', slug: 'tekirdag', region: 'Marmara', difficulty: 'orta', hints: ['Marmara Denizi’nin kuzey kıyısında yer alır.', 'Köftesi ve rakısıyla ünlüdür; Uçmakdere yamaç paraşütüne ev sahipliği yapar.'] },
    { code: 60, name: 'Tokat', slug: 'tokat', region: 'Karadeniz', difficulty: 'kolay', hints: ['Karadeniz’in iç kesiminde, Yeşilırmak havzasındadır.', 'Narının yanında yetişen üzümü ve Ballıca Mağarası ile bilinir.'] },
    { code: 61, name: 'Trabzon', slug: 'trabzon', region: 'Karadeniz', difficulty: 'kolay', hints: ['Doğu Karadeniz kıyısında, tarihi bir liman şehridir.', 'Sümela Manastırı, Uzungöl ve hamsisiyle ünlüdür.'] },
    { code: 62, name: 'Tunceli', slug: 'tunceli', region: 'Doğu Anadolu', difficulty: 'orta', hints: ['Doğu Anadolu’nun ortasında, Munzur Dağları’nın eteğindedir.', 'Munzur Vadisi Milli Parkı ve endemik lalesiyle bilinir.'] },
    { code: 63, name: 'Şanlıurfa', slug: 'sanliurfa', region: 'Güneydoğu Anadolu', difficulty: 'kolay', hints: ['Güneydoğu Anadolu’da, Harran Ovası’nın kenarındadır.', 'Balıklıgöl, Göbeklitepe ve isot biberiyle ünlüdür.'] },
    { code: 64, name: 'Uşak', slug: 'usak', region: 'Ege', difficulty: 'zor', hints: ['Ege Bölgesi’nin iç kesiminde, İç Batı Anadolu’ya geçiştedir.', 'Halısı ve Ulubey Kanyonu ile bilinir.'] },
    { code: 65, name: 'Van', slug: 'van', region: 'Doğu Anadolu', difficulty: 'kolay', hints: ['Doğu Anadolu’nun doğusunda, büyük bir gölün kıyısındadır.', 'Van Gölü, Akdamar Kilisesi ve kahvaltısıyla ünlüdür.'] },
    { code: 66, name: 'Yozgat', slug: 'yozgat', region: 'İç Anadolu', difficulty: 'orta', hints: ['İç Anadolu’nun kuzeydoğusunda, Bozok platosunda yer alır.', 'Testi kebabı, Çamlık milli parkı ve termal kaynaklarıyla bilinir.'] },
    { code: 67, name: 'Zonguldak', slug: 'zonguldak', region: 'Karadeniz', difficulty: 'orta', hints: ['Batı Karadeniz kıyısında, dik yamaçlarla denize iner.', 'Kömür madenleri ve Gökgöl Mağarası ile anılır.'] },
    { code: 68, name: 'Aksaray', slug: 'aksaray', region: 'İç Anadolu', difficulty: 'orta', hints: ['İç Anadolu’nun ortasında, Tuz Gölü’nün güneydoğusundadır.', 'Ihlara Vadisi ve Sultanhanı Kervansarayı bu ilin sınırlarındadır.'] },
    { code: 69, name: 'Bayburt', slug: 'bayburt', region: 'Karadeniz', difficulty: 'zor', hints: ['Karadeniz’in iç kesiminde, Çoruh Nehri kıyısındadır.', 'Tarihi kalesi ve “yiğitler diyarı” olarak anılmasıyla bilinir.'] },
    { code: 70, name: 'Karaman', slug: 'karaman', region: 'İç Anadolu', difficulty: 'orta', hints: ['İç Anadolu’nun güneyinde, Toroslar’a yakın bir ovada yer alır.', 'Karaman koyunu, elması ve Karamanoğulları beyliğiyle anılır.'] },
    { code: 71, name: 'Kırıkkale', slug: 'kirikkale', region: 'İç Anadolu', difficulty: 'orta', hints: ['İç Anadolu’da, Kızılırmak’ın kıyısında kurulmuştur.', 'Silah sanayisi ve makarna üretimiyle tanınır.'] },
    { code: 72, name: 'Batman', slug: 'batman', region: 'Güneydoğu Anadolu', difficulty: 'kolay', hints: ['Güneydoğu Anadolu’da, Batman Çayı kıyısında yer alır.', 'Petrolü ve Hasankeyf’in tarihi dokusuyla bilinir.'] },
    { code: 73, name: 'Şırnak', slug: 'sirnak', region: 'Güneydoğu Anadolu', difficulty: 'orta', hints: ['Türkiye’nin güneydoğusunda, Irak ve Suriye sınırına yakındır.', 'Cudi Dağı ve fıstığıyla anılır.'] },
    { code: 74, name: 'Bartın', slug: 'bartin', region: 'Karadeniz', difficulty: 'orta', hints: ['Batı Karadeniz’de, denize dökülen bir nehrin ağzındadır.', 'Amasra ilçesi ve longoz ormanlarıyla ünlüdür.'] },
    { code: 75, name: 'Ardahan', slug: 'ardahan', region: 'Doğu Anadolu', difficulty: 'zor', hints: ['Doğu Anadolu’nun kuzeydoğusunda, Gürcistan sınırındadır.', 'Kaşar peyniri, balı ve Çıldır Gölü’nde kışın yapılan atlı kızakla bilinir.'] },
    { code: 76, name: 'Iğdır', slug: 'igdir', region: 'Doğu Anadolu', difficulty: 'zor', hints: ['Doğu Anadolu’nun en doğusunda, Aras Nehri vadisindedir.', 'Mikroklima sayesinde yetişen kayısısı ve Ağrı Dağı manzarasıyla bilinir.'] },
    { code: 77, name: 'Yalova', slug: 'yalova', region: 'Marmara', difficulty: 'zor', hints: ['Marmara’nın güneydoğusunda, İzmit Körfezi’nin güney kıyısındadır.', 'Termal kaplıcaları ve çiçekçiliğiyle ünlüdür.'] },
    { code: 78, name: 'Karabük', slug: 'karabuk', region: 'Karadeniz', difficulty: 'orta', hints: ['Batı Karadeniz’in iç kesiminde, Filyos Çayı vadisindedir.', 'Tarihi Safranbolu evleri ve demir-çelik fabrikalarıyla bilinir.'] },
    { code: 79, name: 'Kilis', slug: 'kilis', region: 'Güneydoğu Anadolu', difficulty: 'zor', hints: ['Güneydoğu Anadolu’nun batısında, Suriye sınırındadır.', 'Antep fıstığı, kuru üzümü ve tarihi konaklarıyla anılır.'] },
    { code: 80, name: 'Osmaniye', slug: 'osmaniye', region: 'Akdeniz', difficulty: 'orta', hints: ['Akdeniz’in doğusunda, Çukurova’nın bitiminde yer alır.', 'Yer fıstığı ve Karatepe-Aslantaş açık hava müzesiyle bilinir.'] },
    { code: 81, name: 'Düzce', slug: 'duzce', region: 'Karadeniz', difficulty: 'orta', hints: ['Batı Karadeniz’de, Bolu Dağları ile deniz arasında yer alır.', 'Fındığı, ormanları ve Sakarca yaylasıyla bilinir.'] },
];

export const CITY_BY_CODE: ReadonlyMap<number, PlakaCity> = new Map(
    CITIES.map((city) => [city.code, city])
);

export const CITY_BY_SLUG: ReadonlyMap<string, PlakaCity> = new Map(
    CITIES.map((city) => [city.slug, city])
);

/** 06, 34, 81 … */
export function formatPlate(code: number): string {
    return String(code).padStart(2, '0');
}

export function getCityByCode(code: number): PlakaCity | undefined {
    return CITY_BY_CODE.get(code);
}

export function getCitiesByDifficulty(difficulty: PlakaDifficulty): PlakaCity[] {
    return CITIES.filter((city) => city.difficulty === difficulty);
}

/** Turkish-aware lowercase used for nickname/answer comparisons. */
export function trLower(value: string): string {
    return value.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
}

export function normalizeCityName(value: string): string {
    return trLower(value.trim());
}

/** All 81 plate codes — used by dataset integrity checks/tests. */
export const ALL_PLATE_CODES: number[] = CITIES.map((city) => city.code);
