import { describe, it, expect } from 'vitest'
import { getDictionary, t, isLocale } from './dictionary'

describe('i18n dictionary', () => {
  it('isLocale validates supported locales', () => {
    expect(isLocale('ko')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('ja')).toBe(false)
    expect(isLocale('')).toBe(false)
  })

  it('getDictionary returns ko messages', async () => {
    const dict = await getDictionary('ko')
    expect(dict.common.appName).toBe('바로도리')
  })

  it('getDictionary returns en messages', async () => {
    const dict = await getDictionary('en')
    expect(dict.common.appName).toBe('BaroDori')
  })

  it('t looks up nested keys with dot notation', async () => {
    const dict = await getDictionary('ko')
    expect(t(dict, 'common.appName')).toBe('바로도리')
  })

  it('t falls back to key string when missing', async () => {
    const dict = await getDictionary('ko')
    expect(t(dict, 'nonexistent.key')).toBe('nonexistent.key')
  })
})
