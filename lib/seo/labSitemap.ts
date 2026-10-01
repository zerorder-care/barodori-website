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

/**
 * 두 컬렉션을 병렬로 읽는다. 한쪽이라도 실패하면 던진다. 빈 목록을 돌려주면 sitemap이
 * 정상 응답으로 끝나고 하루짜리 fetch 캐시에 그 빈 결과가 그대로 굳어, 검색엔진은 글이
 * 사라진 줄 안다. 실패로 끝내면 검색엔진이 나중에 다시 가져간다.
 */
export async function loadArticleSitemapCards(): Promise<LabCard[]> {
  const [lab, monthly] = await Promise.all([
    listLabContents({ locale: defaultLocale, collection: 'head_shape_lab' }),
    listLabContents({ locale: defaultLocale, collection: 'home_monthly_information' }),
  ])
  const error = lab.error ?? monthly.error
  if (error) throw new Error(error)
  return [...lab.items, ...monthly.items]
}
