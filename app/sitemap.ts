import type { MetadataRoute } from 'next'
import { listArticles } from '@/lib/content/articles'
import { defaultLocale } from '@/lib/i18n/config'
import { siteFeatures } from '@/lib/site/features'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ko 만 인덱싱
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/${defaultLocale}`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/${defaultLocale}/product`, changeFrequency: 'monthly', priority: 0.8 },
    ...(siteFeatures.reviews
      ? ([{ url: `${SITE_URL}/${defaultLocale}/reviews`, changeFrequency: 'monthly', priority: 0.7 }] as MetadataRoute.Sitemap)
      : []),
    { url: `${SITE_URL}/${defaultLocale}/community`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/${defaultLocale}/articles`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/${defaultLocale}/newsroom`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/${defaultLocale}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/${defaultLocale}/install`, changeFrequency: 'monthly', priority: 0.7 },
  ]
  const articles = await listArticles({ locale: defaultLocale })
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${defaultLocale}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: {
      languages: { ko: `${SITE_URL}/ko/articles/${a.slug}` },
    },
  }))
  return [...staticRoutes, ...articleRoutes]
}
