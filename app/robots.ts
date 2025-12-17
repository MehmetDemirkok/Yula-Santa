import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://yulasanta.com' // Lütfen burayı kendi domaininizle değiştirin

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/', // Eğer gizli klasörleriniz varsa buraya ekleyin
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
