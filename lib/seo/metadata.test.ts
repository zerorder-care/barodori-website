import { describe, it, expect } from 'vitest'
import { buildMetadata } from './metadata'

describe('buildMetadata', () => {
  it('builds canonical with site URL + path', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'desc',
      path: '/ko/articles/foo',
      locale: 'ko',
    })
    expect(meta.alternates?.canonical).toBe('https://www.barodori.com/ko/articles/foo')
  })

  it('builds hreflang languages with x-default=ko', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'd',
      path: '/ko/articles/foo',
      locale: 'ko',
    })
    expect(meta.alternates?.languages).toEqual({
      ko: 'https://www.barodori.com/ko/articles/foo',
      en: 'https://www.barodori.com/en/articles/foo',
      'x-default': 'https://www.barodori.com/ko/articles/foo',
    })
  })

  it('marks en pages noindex', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'd',
      path: '/en/articles/foo',
      locale: 'en',
    })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })

  it('uses ogImage when provided, falls back to default', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'd',
      path: '/ko',
      locale: 'ko',
      image: '/og/custom.png',
    })
    expect(meta.openGraph?.images).toEqual([{ url: 'https://www.barodori.com/og/custom.png' }])

    const fallback = buildMetadata({ title: 'T', description: 'd', path: '/ko', locale: 'ko' })
    expect(fallback.openGraph?.images).toEqual([{ url: 'https://www.barodori.com/og/default.png' }])
  })

  it('keeps an absolute image url as it is', () => {
    const metadata = buildMetadata({
      title: '제목',
      description: '설명',
      path: '/ko/articles/11111111-1111-4111-8111-111111111111',
      locale: 'ko',
      image: 'https://api.barodori.com/api/v2/knowledge-lab/web/contents/a/revisions/b/assets/c',
    })
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://api.barodori.com/api/v2/knowledge-lab/web/contents/a/revisions/b/assets/c' },
    ])
  })

  it('still prefixes a site relative image path', () => {
    const metadata = buildMetadata({
      title: '제목',
      description: '설명',
      path: '/ko',
      locale: 'ko',
      image: '/og/x.png',
    })
    expect(metadata.openGraph?.images).toEqual([{ url: 'https://www.barodori.com/og/x.png' }])
  })
})
