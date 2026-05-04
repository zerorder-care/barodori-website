import type { Locale } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'

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
    url: `${SITE_URL}/ko/install`,
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
