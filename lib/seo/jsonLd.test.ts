import { describe, it, expect } from 'vitest'
import { organizationJsonLd, articleJsonLd, mobileAppJsonLd } from './jsonLd'
import koMessages from '@/messages/ko.json'
import enMessages from '@/messages/en.json'

describe('JSON-LD generators', () => {
  it('organizationJsonLd has @context and @type', () => {
    const out = organizationJsonLd(koMessages)
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

  it('mobileAppJsonLd describes the home-care recording app', () => {
    const ld = mobileAppJsonLd('ko', koMessages)
    expect(ld['@type']).toBe('MobileApplication')
    expect(ld.description).toContain('홈케어 운동')
    expect(ld.description).toContain('목표')
    expect(ld.description).toContain('기록과 리포트')
  })

  it('mobileAppJsonLd uses the requested locale', () => {
    const ld = mobileAppJsonLd('en', enMessages)
    expect(ld.name).toBe('Barodori')
    expect(ld.description).toContain('home-care exercises')
    expect(ld.url).toContain('/en/install')
    expect(ld.inLanguage).toBe('en')
  })

  it('keeps an absolute hero image url and drops the image when there is none', () => {
    const withAbsolute = articleJsonLd({
      title: '제목',
      excerpt: '요약',
      slug: '11111111-1111-4111-8111-111111111111',
      locale: 'ko',
      author: '바로도리 콘텐츠팀',
      publishedAt: '2026-09-11T02:00:00Z',
      updatedAt: '2026-09-11T02:00:00Z',
      heroImage: 'https://api.barodori.com/asset.png',
    })
    expect(withAbsolute.image).toBe('https://api.barodori.com/asset.png')

    const withoutImage = articleJsonLd({
      title: '제목',
      excerpt: '요약',
      slug: '11111111-1111-4111-8111-111111111111',
      locale: 'ko',
      author: '바로도리 콘텐츠팀',
      publishedAt: '2026-09-11T02:00:00Z',
      updatedAt: '2026-09-11T02:00:00Z',
      heroImage: null,
    })
    expect(withoutImage.image).toBeUndefined()
  })
})
