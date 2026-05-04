import { locales, type Locale } from './config'
import koMessages from '@/messages/ko.json'
import enMessages from '@/messages/en.json'

const dictionaries = {
  ko: koMessages,
  en: enMessages,
} as const

export type Dictionary = typeof koMessages

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]
}

export function t(dict: Dictionary, key: string): string {
  const segments = key.split('.')
  let cur: unknown = dict
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in cur) {
      cur = (cur as Record<string, unknown>)[seg]
    } else {
      return key
    }
  }
  return typeof cur === 'string' ? cur : key
}
