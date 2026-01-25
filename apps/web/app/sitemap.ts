import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://schoolkids.kz'
  const languages = ['ru', 'kz', 'en']
  const pages = ['', '/about', '/services', '/contacts']
  
  const urls: MetadataRoute.Sitemap = []
  
  // Home page
  urls.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
  })
  
  // Language-specific pages
  languages.forEach(lang => {
    pages.forEach(page => {
      urls.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 0.9 : 0.8,
      })
    })
  })
  
  return urls
}
