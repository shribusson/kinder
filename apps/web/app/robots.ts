import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/crm/', '/api/'],
    },
    sitemap: 'http://localhost:3002/sitemap.xml',
  }
}
