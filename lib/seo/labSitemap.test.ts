import { describe, expect, it } from 'vitest'
import { headShapeLabCards, monthlyCards } from '@/lib/api/__fixtures__/knowledgeLab'
import { buildArticleSitemapEntries } from './labSitemap'

const SITE_URL = 'https://www.barodori.com'

describe('buildArticleSitemapEntries', () => {
  it('lists every article detail url with the published date as lastModified', () => {
    const entries = buildArticleSitemapEntries(SITE_URL, [...headShapeLabCards, ...monthlyCards])
    expect(entries).toHaveLength(headShapeLabCards.length + monthlyCards.length)
    expect(entries[0]).toMatchObject({
      url: `${SITE_URL}/ko/articles/${headShapeLabCards[0].id}`,
      lastModified: headShapeLabCards[0].publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  })

  it('lists an article that sits in both collections once', () => {
    const duplicated = [...headShapeLabCards, headShapeLabCards[0]]
    expect(buildArticleSitemapEntries(SITE_URL, duplicated)).toHaveLength(headShapeLabCards.length)
  })

  it('returns an empty list when the api gave nothing', () => {
    expect(buildArticleSitemapEntries(SITE_URL, [])).toEqual([])
  })
})
