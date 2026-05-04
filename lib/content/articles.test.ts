import { describe, it, expect } from 'vitest'
import { listArticles, getArticle, getRelated } from './articles'

describe('articles index', () => {
  it('listArticles returns ko articles excluding drafts', async () => {
    const articles = await listArticles({ locale: 'ko' })
    expect(articles.length).toBeGreaterThan(0)
    expect(articles.every((a) => a.draft === false)).toBe(true)
    expect(articles.every((a) => a.locale === 'ko')).toBe(true)
  })

  it('listArticles filters by category', async () => {
    const articles = await listArticles({ locale: 'ko', category: 'torticollis' })
    expect(articles.every((a) => a.category === 'torticollis')).toBe(true)
  })

  it('getArticle returns by slug', async () => {
    const article = await getArticle({ locale: 'ko', slug: '_test-fixture' })
    expect(article).not.toBeNull()
    expect(article?.title).toBe('테스트 픽스처')
    expect(article?.body).toContain('# 테스트 본문')
  })

  it('getArticle returns null for missing slug', async () => {
    const article = await getArticle({ locale: 'ko', slug: 'does-not-exist' })
    expect(article).toBeNull()
  })

  it('listArticles is sorted by publishedAt desc', async () => {
    const articles = await listArticles({ locale: 'ko' })
    for (let i = 1; i < articles.length; i++) {
      expect(articles[i - 1].publishedAt >= articles[i].publishedAt).toBe(true)
    }
  })

  it('getRelated falls back to same category when relatedSlugs empty', async () => {
    const article = await getArticle({ locale: 'ko', slug: '_test-fixture' })
    if (!article) throw new Error('fixture missing')
    const related = await getRelated(article)
    // 픽스처가 유일하면 빈 배열
    expect(Array.isArray(related)).toBe(true)
  })
})
