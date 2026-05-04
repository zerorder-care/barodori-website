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
    expect(articles.length).toBeGreaterThan(0)
  })

  it('getArticle returns by slug', async () => {
    const article = await getArticle({ locale: 'ko', slug: 'torticollis-symptoms' })
    expect(article).not.toBeNull()
    expect(article?.title).toBe('영아 사경, 이런 증상이 보인다면')
    expect(article?.body).toContain('## 사경')
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

  it('getRelated returns related articles when relatedSlugs set', async () => {
    const article = await getArticle({ locale: 'ko', slug: 'torticollis-symptoms' })
    if (!article) throw new Error('fixture missing')
    const related = await getRelated(article)
    expect(related.length).toBeGreaterThan(0)
    expect(related[0].slug).toBe('tummy-time-guide')
  })
})
