import type { Locale } from '@/lib/i18n/config'
import { getSiteUrl } from '@/lib/seo/siteUrl'

const SITE_URL = getSiteUrl()

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '제로더 (Zerorder)',
    url: SITE_URL,
    logo: `${SITE_URL}/og/default.png`,
  } as const
}

export function mobileAppJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: '바로도리',
    operatingSystem: 'iOS, Android',
    applicationCategory: 'HealthApplication',
    description: '병원에서 안내받은 아기·영유아 홈케어 운동을 목표로 세우고, 기록과 리포트로 꾸준히 확인할 수 있도록 돕는 앱입니다.',
    url: `${SITE_URL}/ko/install`,
    audience: {
      '@type': 'PeopleAudience',
      audienceType: '아기와 영유아의 홈케어 운동을 기록하는 보호자',
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
  heroImage: string
}) {
  const url = `${SITE_URL}/${input.locale}/articles/${input.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.excerpt,
    image: `${SITE_URL}${input.heroImage}`,
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
