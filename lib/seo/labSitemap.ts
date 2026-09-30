import type { MetadataRoute } from 'next'
import { listLabContents, type LabCard } from '@/lib/api/knowledgeLab'
import { defaultLocale } from '@/lib/i18n/config'

/** 한 콘텐츠가 두 컬렉션에 배치될 수 있으므로 id로 한 번만 넣는다. */
export function buildArticleSitemapEntries(siteUrl: string, cards: LabCard[]): MetadataRoute.Sitemap {
  const seen = new Set<string>()
  const entries: MetadataRoute.Sitemap = []

  for (const card of cards) {
    if (seen.has(card.id)) continue
    seen.add(card.id)
    const url = `${siteUrl}/${defaultLocale}/articles/${card.id}`
    entries.push({
      url,
      lastModified: card.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: { [defaultLocale]: url } },
    })
  }

  return entries
}

/** 두 컬렉션을 병렬로 읽는다. 실패하면 빈 배열이라 sitemap은 정적 경로만 남는다. */
export async function loadArticleSitemapCards(): Promise<LabCard[]> {
  const [lab, monthly] = await Promise.all([
    listLabContents({ locale: defaultLocale, collection: 'head_shape_lab' }),
    listLabContents({ locale: defaultLocale, collection: 'home_monthly_information' }),
  ])
  return [...lab.items, ...monthly.items]
}
