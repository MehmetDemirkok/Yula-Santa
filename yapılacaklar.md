🚀 Sizin Yapmanız Gerekenler
Projenizin SEO başarısı için şu adımları takip etmelisiniz:

Domain Güncellemesi: Şu an kodlarda geçici olarak https://yulasanta.com adresini kullandım. Kendi domain adresinizi (örneğin https://super-cekilis.vercel.app veya https://yilbasicekilisi.com) şu dosyalarda güncellemelisiniz:
app/layout.tsx
 (openGraph url kısmı)
app/sitemap.ts
 (baseUrl değişkeni)
app/robots.ts
 (baseUrl değişkeni)
Sosyal Medya Görseli (Önemli!): Link paylaşıldığında (WhatsApp, Twitter vb.) güzel bir görsel çıkması için;
Projenizin ekran görüntüsünü veya logosunu içeren 1200x630 piksel boyutunda bir görsel hazırlayın.
Bu görselin adını opengraph-image.png yapın.
Doğrudan app/ klasörünün içine atın. Next.js bunu otomatik algılayacaktır.
Google Search Console: Sitenizi yayınladıktan (deploy) sonra Google Search Console'a gidin:
Domaininizi doğrulayın.
Sol menüden Sitemaps (Site Haritaları) kısmına gelin.
sitemap.xml yazıp gönderin.
Bu adımları tamamladığınızda Google sitenizi taramaya başlayacak ve zamanla arama sonuçlarında gösterecektir.