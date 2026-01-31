import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/auth/', '/api/', '/insight/'],
    },
    sitemap: 'https://copilot.gohire.work/sitemap.xml',
  }
}
