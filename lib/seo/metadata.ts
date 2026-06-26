import type { Metadata } from 'next'
import { defaultLocale, indexableLocales, locales, type Locale } from '@/lib/i18n/config'
import { getSiteUrl } from '@/lib/seo/siteUrl'

const SITE_URL = getSiteUrl()
const DEFAULT_OG = '/og/default.png'

// 사경·사두 검색 유입은 메타데이터 한정으로만 유도한다.
// 의료용 앱이 아니므로 가시 본문에는 넣지 않고, <meta keywords>/구조화 데이터에만 노출한다.
export const TORTICOLLIS_KEYWORDS = [
  '사경',
  '영아 사경',
  '아기 사경',
  '사두',
  '두상 비대칭',
  '터미타임',
  '홈케어 운동',
  '아기 운동 기록',
  '영유아 홈케어',
] as const

export function buildMetadata(params: {
  title: string
  description: string
  path: string // 항상 leading "/" 포함, locale 포함된 절대 경로
  locale: Locale
  image?: string
  keywords?: readonly string[]
}): Metadata {
  const { title, description, path, locale, image, keywords } = params
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
    keywords: keywords ? [...keywords] : undefined,
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
