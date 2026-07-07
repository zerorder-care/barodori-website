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
    expect(dict.common.appName).toBe('Barodori')
  })

  it('t looks up nested keys with dot notation', async () => {
    const dict = await getDictionary('ko')
    expect(t(dict, 'common.appName')).toBe('바로도리')
  })

  it('t falls back to key string when missing', async () => {
    const dict = await getDictionary('ko')
    expect(t(dict, 'nonexistent.key')).toBe('nonexistent.key')
  })

  it('keeps ko and en message shapes aligned', async () => {
    const ko = await getDictionary('ko')
    const en = await getDictionary('en')
    expect(shapeOf(en)).toEqual(shapeOf(ko))
  })
})

function shapeOf(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shapeOf)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, shapeOf(child)]),
    )
  }
  return typeof value
}
