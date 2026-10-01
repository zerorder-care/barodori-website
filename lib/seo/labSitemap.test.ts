import { beforeEach, describe, expect, it, vi } from 'vitest'
import { headShapeLabCards, monthlyCards } from '@/lib/api/__fixtures__/knowledgeLab'
import { listLabContents, type LabListResult } from '@/lib/api/knowledgeLab'
import { buildArticleSitemapEntries, loadArticleSitemapCards } from './labSitemap'

vi.mock('@/lib/api/knowledgeLab', () => ({
  listLabContents: vi.fn(),
}))

const listMock = vi.mocked(listLabContents)

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

describe('loadArticleSitemapCards', () => {
  beforeEach(() => {
    listMock.mockReset()
  })

  function answer(...results: LabListResult[]) {
    for (const result of results) listMock.mockResolvedValueOnce(result)
  }

  it('joins both collections when neither reported an error', async () => {
    answer({ items: headShapeLabCards }, { items: monthlyCards })
    await expect(loadArticleSitemapCards()).resolves.toEqual([...headShapeLabCards, ...monthlyCards])
  })

  it('throws when one collection reported an error', async () => {
    answer({ items: [], error: 'lab_api_http_500' }, { items: monthlyCards })
    await expect(loadArticleSitemapCards()).rejects.toThrow('lab_api_http_500')
  })

  it('throws when the other collection reported an error', async () => {
    answer({ items: headShapeLabCards }, { items: [], error: 'lab_api_network_error' })
    await expect(loadArticleSitemapCards()).rejects.toThrow('lab_api_network_error')
  })
})
