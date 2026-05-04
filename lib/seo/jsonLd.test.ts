import { describe, it, expect } from 'vitest'
import { organizationJsonLd, mobileAppJsonLd, articleJsonLd } from './jsonLd'

describe('JSON-LD generators', () => {
  it('organizationJsonLd has @context and @type', () => {
    const out = organizationJsonLd()
    expect(out['@context']).toBe('https://schema.org')
    expect(out['@type']).toBe('Organization')
    expect(out.name).toBeDefined()
  })

  it('articleJsonLd reflects article fields', () => {
    const ld = articleJsonLd({
      title: 'T',
      excerpt: 'desc',
      slug: 'foo',
      locale: 'ko',
      author: 'A',
      publishedAt: '2026-05-04',
      updatedAt: '2026-05-04',
      heroImage: '/articles/foo/hero.png',
    })
    expect(ld['@type']).toBe('Article')
    expect(ld.headline).toBe('T')
    expect(ld.inLanguage).toBe('ko')
    expect(ld.image).toContain('https://')
    expect(ld.mainEntityOfPage).toContain('/ko/articles/foo')
  })
})
