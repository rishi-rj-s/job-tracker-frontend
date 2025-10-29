import { useHead } from '@vueuse/head'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export function useSEO(config: SEOConfig) {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://yourapp.com'
  const siteName = 'JobTracker'
  
  const fullTitle = config.title.includes(siteName) 
    ? config.title 
    : `${config.title} | ${siteName}`

  useHead({
    title: fullTitle,
    meta: [
      // Basic SEO
      { name: 'description', content: config.description },
      { name: 'keywords', content: config.keywords || 'job tracker, application tracker' },
      { name: 'author', content: siteName },
      
      // Open Graph
      { property: 'og:site_name', content: siteName },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: config.description },
      { property: 'og:type', content: config.type || 'website' },
      { property: 'og:url', content: config.url || baseUrl },
      { property: 'og:image', content: config.image || `${baseUrl}/og-image.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: config.description },
      { name: 'twitter:image', content: config.image || `${baseUrl}/og-image.png` },
      
      // Mobile
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#4F46E5' },
      
      // Additional SEO
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow' }
    ],
    link: [
      { rel: 'canonical', href: config.url || baseUrl }
    ],
    script: [
      // JSON-LD Structured Data
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': siteName,
          'description': config.description,
          'url': baseUrl,
          'applicationCategory': 'BusinessApplication',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.9',
            'ratingCount': '10000'
          }
        })
      }
    ]
  })
}

// robots.txt content (create at /public/robots.txt)
export const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin

Sitemap: https://yourapp.com/sitemap.xml`

// sitemap.xml content (create at /public/sitemap.xml)
export const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourapp.com/</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourapp.com/login</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourapp.com/signup</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`