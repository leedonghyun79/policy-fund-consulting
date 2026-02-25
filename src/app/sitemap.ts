import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://btccompany.co.kr',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://btccompany.co.kr/admin',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
  ]
}
