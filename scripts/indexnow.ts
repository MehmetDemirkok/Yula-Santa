/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IndexNow — anında URL bildirimi (Bing · Yandex · Seznam · Naver)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Google IndexNow'u kullanmaz (sitemap + GSC), ancak IndexNow Bing/Yandex gibi
 * motorlarda indekslemeyi hızlandırır. Anahtar dosyası `public/<KEY>.txt`
 * içinde yayında olmalı:  https://www.yulasanta.com.tr/<KEY>.txt
 *
 * KULLANIM (deploy SONRASI çalıştır — anahtar dosyası canlıda olmalı):
 *   npm run indexnow                    # sitemap'teki tüm URL'ler
 *   npm run indexnow -- --secret-santa  # yalnızca /secret-santa (12 dil)
 *   npm run indexnow -- --url /raffle   # tek/çok URL (göreli veya tam)
 *   npm run indexnow -- --dry-run       # istek atmadan payload'ı göster
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SITE_URL = 'https://www.yulasanta.com.tr';
const INDEXNOW_KEY = '72f2c3fbd5643c046db2e1380c1f90fa';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10_000;
const LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'ja', 'ko', 'zh'];

function resolveUrl(input: string): string {
    if (/^https?:\/\//i.test(input)) return input;
    return input.startsWith('/') ? `${SITE_URL}${input}` : `${SITE_URL}/${input}`;
}

async function fetchSitemapUrls(): Promise<string[]> {
    const res = await fetch(`${SITE_URL}/sitemap.xml`);
    if (!res.ok) throw new Error(`sitemap.xml alınamadı: HTTP ${res.status}`);
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const urls: string[] = [];

    if (args.includes('--secret-santa')) {
        for (const l of LOCALES) {
            urls.push(l === 'tr' ? `${SITE_URL}/secret-santa` : `${SITE_URL}/${l}/secret-santa`);
        }
    }

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--url' && args[i + 1]) urls.push(resolveUrl(args[++i]));
    }

    if (urls.length === 0) urls.push(...(await fetchSitemapUrls()));

    const unique = [...new Set(urls)].slice(0, MAX_URLS);
    const payload = {
        host: SITE_URL.replace(/^https?:\/\//, ''),
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: unique,
    };

    console.log(`\n🔎 IndexNow — ${unique.length} URL\n`);
    unique.slice(0, 10).forEach((u) => console.log(`  • ${u}`));
    if (unique.length > 10) console.log(`  … +${unique.length - 10} daha`);

    if (dryRun) {
        console.log('\n(dry-run) payload:\n' + JSON.stringify(payload, null, 2));
        return;
    }

    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
    });

    console.log(`\nHTTP ${res.status} ${res.statusText}`);
    if (res.status === 200 || res.status === 202) {
        console.log('✅ URL\'ler IndexNow\'a gönderildi (Bing / Yandex / Seznam / Naver).');
    } else {
        console.error(`❌ Gönderim başarısız — anahtar dosyası canlıda mı? ${KEY_LOCATION}`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
