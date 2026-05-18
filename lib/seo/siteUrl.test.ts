import { describe, expect, it } from 'vitest'
import { DEFAULT_SITE_URL, normalizeSiteUrl } from './siteUrl'

describe('siteUrl', () => {
  it('normalizes apex barodori domain to www', () => {
    expect(normalizeSiteUrl('https://barodori.com')).toBe(DEFAULT_SITE_URL)
    expect(normalizeSiteUrl('barodori.com')).toBe(DEFAULT_SITE_URL)
  })

  it('keeps the canonical www origin', () => {
    expect(normalizeSiteUrl('https://www.barodori.com/ko')).toBe(DEFAULT_SITE_URL)
  })
})
