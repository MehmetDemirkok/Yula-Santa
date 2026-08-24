# YulaSanta — TikTok Çekiliş Yardımcısı (Chrome Extension)

TikTok videonuzdaki yorumları **kendi tarayıcınızda**, kullanıcının açıkça
başlattığı bir işlemle toplayıp YulaSanta'ya aktarmanızı sağlayan Manifest V3
uzantısı. Apify/Bright Data gibi ücretli scraper kullanmaz, TikTok'un resmi
olmayan endpointlerine istek atmaz, CAPTCHA/bot bypass yapmaz, TikTok
şifrenizi veya oturum bilgilerinizi istemez — yalnızca sayfada zaten
**görünen** yorumları okur.

## Kurulum

1. Bu klasörde ekstra bir derleme adımı yoktur (saf JS/HTML/CSS) — `npm install`/`npm run build` gerekmez.
2. Chrome'da `chrome://extensions` adresini açın.
3. Sağ üstten **Geliştirici modu**'nu (Developer mode) açın.
4. **Paketlenmemiş öğe yükle** (Load unpacked) butonuna basın.
5. Bu klasörü (`extensions/yulasanta-tiktok`) seçin.
6. Uzantı simgesi araç çubuğunda görünecektir.

## Kullanım

1. YulaSanta'da `/tiktok/extension` sayfasından bir çekiliş oluşturun ve o
   sekmeyi açık bırakın.
2. TikTok video sayfasını başka bir sekmede açın.
3. Uzantı simgesine tıklayın. YulaSanta sekmesi hâlâ açıksa **"YulaSanta
   sekmesinden algıla"** butonuyla Çekiliş ID ve İçe Aktarma Kodu otomatik
   doldurulur — kopyala/yapıştır gerekmez (ve popup, sekme değiştirmediğiniz
   için kapanmaz). YulaSanta sekmesi açık değilse ID ve kodu elle
   yapıştırıp **Kaydet**'e basabilirsiniz (bir kere yeterli; tarayıcıda saklanır).
4. **Yorumları Topla** butonuna basın. Uzantı yorum panelini otomatik
   kaydırarak görünen yorumları okur ve tekilleştirir.
5. Toplama bittiğinde (veya istediğiniz an **Durdur**'a basınca) **YulaSanta'ya
   Gönder** butonuna basın. Yorumlar 500'lük gruplar halinde YulaSanta'ya
   aktarılır ve ilerleme `1.500 / 12.000` şeklinde gösterilir.
6. YulaSanta sayfasındaki katılımcı sayısı otomatik güncellenir (birkaç
   saniyede bir yoklama/polling ile). Çekilişi oradan başlatabilirsiniz.

## Web uygulaması ↔ Extension nasıl haberleşir?

- Uzantı, TikTok sayfasına **hiçbir zaman** doğrudan istek atmaz; sadece
  sayfadaki DOM'u okur (`content.js` + `content/selectors.js`).
- Toplanan yorumlar önce `chrome.storage.local` içinde 500'lük parçalar
  halinde geçici olarak saklanır (`manifest.json`'da `unlimitedStorage`
  izniyle, 100.000+ yorumu sorunsuz tutabilmek için).
- **YulaSanta'ya Gönder**'e basıldığında bu iş `background.js` (service
  worker) tarafından devralınır ve `POST /api/tiktok/giveaway/:id/comments`
  uç noktasına 500'lük batch'ler halinde, `x-owner-token` header'ı ile
  gönderilir. `manifest.json`'daki `host_permissions` sayesinde bu istekler
  CORS'a takılmaz (tarayıcı sayfası değil, extension'ın kendi arka plan
  bağlamı istek attığı için).
- Sahiplik (ownership) kontrolü sunucu tarafında sabit zamanlı (timing-safe)
  karşılaştırma ile yapılır; İçe Aktarma Kodu olmadan hiçbir çekilişe yorum
  eklenemez veya çekiliş yapılamaz.

## Yayın için ayarlandı — production'a sabit

Chrome Web Store'a gönderilecek sürüm yalnızca `https://www.tiktok.com/*` ve
`https://www.yulasanta.com.tr/*` için host_permissions içerir (gereksiz geniş
izin istememek için `localhost`/`127.0.0.1` çıkarıldı — mağaza incelemesi
açısından da daha temiz). Varsayılan API adresi `https://www.yulasanta.com.tr`.

## Yerelde (localhost) test etmek istersen

1. `manifest.json`'daki `host_permissions` dizisine geçici olarak
   `"http://localhost/*"` ve `"http://127.0.0.1/*"` ekleyip uzantıyı
   `chrome://extensions`'ta yeniden yükle.
2. Popup'taki "değiştir" → "Sunucu adresi" alanına `http://localhost:3000`
   yaz ve kaydet (veya `/tiktok/extension` sayfasını localhost'ta açıkken
   "YulaSanta sekmesinden algıla"yı kullan — sunucu adresini o sekmeden
   otomatik alır).
3. Mağazaya göndermeden önce bu iki host_permissions satırını tekrar kaldır.

Gönderim "Sunucuya ulaşılamadı" hatası verirse popup'taki **"Sunucu:"**
satırını kontrol et — neredeyse her zaman yanlış/eksik bir sunucu adresine
işaret eder.

## "Topla" ve "Gönder" sayıları neden farklı?

**"Gönder"e bastıktan sonra gösterilen sayı, toplanan sayıdan düşükse** bu veri
kaybı değildir — popup artık nedenini açıkça yazar: kaç tanesi zaten mevcuttu
(aynı kullanıcı + birebir aynı yorum metni — TikTok gerçek bir yorum kimliği
göstermediği için bu ikisi eşleşen yorumlar "aynı yorum" sayılır, örn. bir
kullanıcının "😂😂😂" gibi kısa bir metni tekrar tekrar yazması), kaçı geçersiz
kullanıcı adıydı, kaçı boş yorumdu. Toplama aşamasında hiçbir şey silinmez;
fark yalnızca **sunucu tarafında** olur.

## Toplanan yorum sayısı TikTok'ta yazandan az mı?

Bu genelde iki sebepten biri:

1. **Yanıtlar (reply) sayılmaz.** TikTok'un gösterdiği toplam yorum sayısı
   genelde yanıtları da içerir; extension yalnızca üst düzey (top-level)
   yorumları toplar. 584 yorum yazıp 245 üst-düzey + çok sayıda yanıt olması
   yaygındır.
2. **TikTok yüklemeyi geçici olarak yavaşlatmış/durdurmuş olabilir**
   (özellikle oturum açmadan gezinirken). Extension art arda ~24 taramada
   yeni yorum gelmezse durur — bu "kesinlikle bitti" değil, "şu an başka
   yorum gelmiyor" demektir. **"Yorumları Topla"yı tekrar çalıştırmak
   güvenlidir** — sunucu zaten daha önce gönderilenleri otomatik atlar
   (`ON CONFLICT DO NOTHING`), sadece yeni bulunanlar eklenir.

## Dosya yapısı

```
manifest.json        — Manifest V3 tanımı, izinler, host_permissions
popup.html/.js        — Uzantı arayüzü
content/selectors.js  — TikTok DOM seçicileri (merkezi, tek dosya)
content.js            — Yorum toplama döngüsü (scroll + oku + tekilleştir)
background.js         — YulaSanta API'sine batch gönderim (service worker)
styles.css            — Popup görünümü (YulaSanta marka renkleri)
icons/                — Araç çubuğu simgeleri
```

## Sınırlamalar

- TikTok'un DOM yapısı değişirse `content/selectors.js` güncellenmelidir;
  seçici bulunamazsa uzantı kullanıcıya Türkçe bir hata gösterir.
- TikTok yorum zaman damgasını yalnızca göreli olarak gösterdiği için
  (`"2s"`, `"3g"` gibi) uzantı mutlak bir zaman damgası **uydurmaz**;
  tekilleştirme bu durumda kullanıcı adı + yorum metnine göre yapılır.
