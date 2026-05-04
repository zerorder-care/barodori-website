import type { Metadata } from 'next'
import { defaultLocale, indexableLocales, locales, type Locale } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'
const DEFAULT_OG = '/og/default.png'

export function buildMetadata(params: {
  title: string
  description: string
  path: string // 항상 leading "/" 포함, locale 포함된 절대 경로
  locale: Locale
  image?: string
}): Metadata {
  const { title, description, path, locale, image } = params
  const canonical = `${SITE_URL}${path}`
  const ogUrl = `${SITE_URL}${image ?? DEFAULT_OG}`

  // 같은 path 의 locale 변형 매핑
  const languages: Record<string, string> = {}
  for (const l of locales) {
    languages[l] = `${SITE_URL}${swapLocaleInPath(path, locale, l)}`
  }
  languages['x-default'] = `${SITE_URL}${swapLocaleInPath(path, locale, defaultLocale)}`

  const noindex = !indexableLocales.includes(locale)

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogUrl }],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}

export function swapLocaleInPath(path: string, from: Locale, to: Locale): string {
  if (path === `/${from}`) return `/${to}`
  if (path.startsWith(`/${from}/`)) return path.replace(`/${from}/`, `/${to}/`)
  return path
}
