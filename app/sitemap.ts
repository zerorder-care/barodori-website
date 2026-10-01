import type { MetadataRoute } from 'next'
import { defaultLocale } from '@/lib/i18n/config'
import { buildArticleSitemapEntries, loadArticleSitemapCards } from '@/lib/seo/labSitemap'
import { getSiteUrl } from '@/lib/seo/siteUrl'
import { siteFeatures } from '@/lib/site/features'

const SITE_URL = getSiteUrl()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ko 만 인덱싱
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/${defaultLocale}`, changeFrequency: 'weekly', priority: 1 },
    ...(siteFeatures.reviews
      ? ([{ url: `${SITE_URL}/${defaultLocale}/reviews`, changeFrequency: 'monthly', priority: 0.7 }] as MetadataRoute.Sitemap)
      : []),
    { url: `${SITE_URL}/${defaultLocale}/articles`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/${defaultLocale}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/${defaultLocale}/install`, changeFrequency: 'monthly', priority: 0.7 },
  ]
  const cards = await loadArticleSitemapCards()
  return [...staticRoutes, ...buildArticleSitemapEntries(SITE_URL, cards)]
}
