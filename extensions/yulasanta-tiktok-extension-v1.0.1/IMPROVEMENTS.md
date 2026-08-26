# Extension İyileştirmeler ve Bilinen Sorunlar

## v1.0.1 Eklemeler

### 🔧 Debug Logging
- `content.js` içinde console logging eklendi (Chrome DevTools → Console'da görebilirsin)
- Log seviyeleri:
  - `[YulaSanta] Comment collection started` — toplama başladı
  - `[YulaSanta] Found X new comments` — her scan'de bulunan yeni yorumlar
  - `[YulaSanta] Flushed chunk to storage` — 500 yorum chunk'ı saklandı
  - `[YulaSanta] Collection finished` — toplama bitince sebep (idle/stopped)

### ✨ UI İyileştirmeler
- "Verileri Sıfırla" butonu eklendi (popup'da)
- "✨ 500 yoruma kadar ücretsiz" bilgisi eklendi popup'da
- Açılır onay dialogu ("Toplanan tüm yorumlar silinecek. Emin misiniz?")

### 🐛 Hata Ayıklamalar
- Selector matching iyileştirildi (boş yorumları atlar)
- Invalid comment item validation eklendi (malformed DOM elemanları atlanır)

---

## Bilinen Sorunlar ve Çözümler

### Problem: Yorum sayısı eksik görünüyor

**Sebepler:**
1. TikTok yanıtları (replies) sayılmıyor — extension yalnızca top-level yorumları toplar
2. TikTok lazy-loading'te gecikmesi var — 24 boş scroll'dan sonra durur
3. Selector'lar TikTok UI update'i nedeniyle çalışmayabilir

**Çözüm:**
- Chrome DevTools → Console'da log'ları kontrol et
- "Yorumları Topla"yı tekrar çalıştır (duplicate'ler sunucu tarafında auto-filtered)
- Selector'lar çalışmıyorsa `content/selectors.js` güncelle

### Problem: "TikTok yorum alanı algılanamadı" hatası

**Sebepler:**
1. Yorum paneli açılmadı
2. TikTok DOM structure değişti
3. Selector pattern eşleşmiyor

**Çözüm:**
- `chrome://extensions` → YulaSanta → "Inspect views: service worker"
- TikTok sayfasında sağ click → Inspect → `DivCommentListContainer` ara
- Selector'ı güncelle veya Anthropic ile iletişime geç

---

## Gelecekte Yapılacaklar

### Yüksek Öncelik
- [ ] Selector strategy'lere daha fazla fallback ekle (TikTok sık değiştiği için)
- [ ] Network error retry logic (timeout/network hatası durumunda retry)
- [ ] Yorum toplama sırasında max yorum limiti uyarısı

### Orta Öncelik
- [ ] Pagination state'ine göre daha smart scroll (şu anki 1.1s fixed delay)
- [ ] Duplicate detection'da comment ID validation
- [ ] User experience iyileştirmeleri (progress % göster)

### Düşük Öncelik
- [ ] Dark mode support iyileştirmesi
- [ ] Keyboard shortcuts (Spacebar to pause/resume)
- [ ] Batch upload görselleştirmesi

---

## Debugging Checklist

Sorunda ise:

1. **Chrome Console aç** (`F12` → Console tab)
2. **TikTok videosunun linkini kontrol et** (public olmalı)
3. **Uzantı logs'unu oku** (başlayan "collection started", hata mesajları, final stats)
4. **YulaSanta tab'ını açık bırak** (auto-detect'in çalışması için)
5. **Yorum panelinin açık olduğundan emin ol** (videoya tıkla, comments simgesini tıkla)

Hata hâlâ devam ederse:
- Screenshots yapıp console output'unu kaydet
- `content/selectors.js` güncelle (TikTok DOM değişmişse)
