export const locales = ['ko', 'en'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'ko'

export const localeLabels: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
}

// 영문 셸은 noindex (콘텐츠 부족)
export const indexableLocales: Locale[] = ['ko']
