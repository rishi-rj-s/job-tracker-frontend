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
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://localhost:5173'
  const siteName = 'ApplyLog'
  
  const fullTitle = config.title.includes(siteName) 
    ? config.title 
    : `${config.title} | ${siteName}`

  useHead({
    title: fullTitle,
    meta: [
      // Basic SEO
      { name: 'description', content: config.description },
      { name: 'keywords', content: config.keywords || 'job application tracker, apply log, application logger, job search organizer' },
      { name: 'author', content: siteName },
      
      // Open Graph (Facebook, LinkedIn)
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
          }
        })
      }
    ]
  })
}