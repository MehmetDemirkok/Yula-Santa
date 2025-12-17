import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://yulasanta.com' // Lütfen burayı kendi domaininizle değiştirin

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        // Eğer başka sayfalarınız varsa buraya ekleyebilirsiniz, örneğin:
        // {
        //   url: `${baseUrl}/result`,
        //   lastModified: new Date(),
        //   changeFrequency: 'always',
        //   priority: 0.5,
        // },
    ]
}
