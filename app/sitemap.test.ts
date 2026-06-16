import { describe, expect, it, vi } from 'vitest'
import sitemap from './sitemap'

vi.mock('@/lib/api/articles', () => ({
  listArticlePosts: vi.fn(async () => ({ articles: [] })),
}))

vi.mock('@/lib/seo/siteUrl', () => ({
  getSiteUrl: () => 'https://www.barodori.com',
}))

describe('sitemap', () => {
  it('does not expose the community route while community is disabled', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(urls).not.toContain('https://www.barodori.com/ko/community')
  })

  it('does not expose the newsroom route while newsroom is disabled', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(urls).not.toContain('https://www.barodori.com/ko/newsroom')
  })
})
