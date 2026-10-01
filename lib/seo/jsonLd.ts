import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { getSiteUrl } from '@/lib/seo/siteUrl'

const SITE_URL = getSiteUrl()

export function organizationJsonLd(dict: Dictionary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: dict.structuredData.organizationName,
    url: SITE_URL,
    logo: `${SITE_URL}/og/default.png`,
  } as const
}

export function mobileAppJsonLd(locale: Locale, dict: Dictionary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: dict.structuredData.mobileAppName,
    operatingSystem: 'iOS, Android',
    applicationCategory: 'HealthApplication',
    description: dict.structuredData.mobileAppDescription,
    keywords: dict.structuredData.mobileAppKeywords,
    url: `${SITE_URL}/${locale}/install`,
    inLanguage: locale,
    audience: {
      '@type': 'PeopleAudience',
      audienceType: dict.structuredData.mobileAppAudience,
    },
  } as const
}

export function articleJsonLd(input: {
  title: string
  excerpt: string
  slug: string
  locale: Locale
  author: string
  publishedAt: string
  updatedAt: string
  heroImage: string | null
}) {
  const url = `${SITE_URL}/${input.locale}/articles/${input.slug}`
  // 백엔드 자산은 절대 URL로 오고, 저장소 이미지는 사이트 상대 경로로 온다.
  const image = input.heroImage
    ? /^https?:\/\//i.test(input.heroImage)
      ? input.heroImage
      : `${SITE_URL}${input.heroImage}`
    : undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.excerpt,
    image,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { '@type': 'Person', name: input.author },
    inLanguage: input.locale,
    mainEntityOfPage: url,
  } as const
}

export function jsonLdScript(payload: Record<string, unknown>): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c')
}
