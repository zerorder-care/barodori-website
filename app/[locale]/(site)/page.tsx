import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata, TORTICOLLIS_KEYWORDS } from '@/lib/seo/metadata'
import { HeroV2 } from '@/components/marketing/HeroV2'
import { FeatureSections } from '@/components/marketing/FeatureSections'
import { TogetherCards } from '@/components/marketing/TogetherCards'
import { PricingSection } from '@/components/marketing/PricingSection'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { InstallCta } from '@/components/marketing/InstallCta'
import { organizationJsonLd, mobileAppJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import type { Locale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.home.seo.title,
    description: dict.home.seo.description,
    path: `/${locale}`,
    locale,
    keywords: locale === 'ko' ? TORTICOLLIS_KEYWORDS : undefined,
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const dict = await getDictionary(loc)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd(dict)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(mobileAppJsonLd(loc, dict)) }}
      />
      <HeroV2 locale={loc} copy={dict.home.hero} />
      <FeatureSections locale={loc} features={dict.home.features} />
      <TogetherCards copy={dict.home.together} />
      <PricingSection locale={loc} copy={dict.home.pricing} />
      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="home" />
    </>
  )
}
