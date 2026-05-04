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
    expect(meta.alternates?.canonical).toBe('https://barodori.com/ko/articles/foo')
  })

  it('builds hreflang languages with x-default=ko', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'd',
      path: '/ko/articles/foo',
      locale: 'ko',
    })
    expect(meta.alternates?.languages).toEqual({
      ko: 'https://barodori.com/ko/articles/foo',
      en: 'https://barodori.com/en/articles/foo',
      'x-default': 'https://barodori.com/ko/articles/foo',
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
    expect(meta.openGraph?.images).toEqual([{ url: 'https://barodori.com/og/custom.png' }])

    const fallback = buildMetadata({ title: 'T', description: 'd', path: '/ko', locale: 'ko' })
    expect(fallback.openGraph?.images).toEqual([{ url: 'https://barodori.com/og/default.png' }])
  })
})
