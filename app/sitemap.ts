
import { MetadataRoute } from 'next';

const SITE_URL = 'https://yulasanta.com';
const LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'ja', 'ko', 'zh'];

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/youtube',
        '/instagram',
        '/twitter',
    ];

    const sitemap: MetadataRoute.Sitemap = [];

    routes.forEach(route => {
        // Add default (x-default)
        sitemap.push({
            url: `${SITE_URL}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: route === '' ? 1 : 0.8,
        });

        // Add localized versions
        LOCALES.forEach(locale => {
            sitemap.push({
                url: `${SITE_URL}${route}?lang=${locale}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: route === '' ? 0.9 : 0.7,
            });
        });
    });

    return sitemap;
}
