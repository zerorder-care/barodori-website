import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Hero } from '@/components/marketing/Hero'
import { HomeFeatureSections } from '@/components/marketing/HomeFeatureSections'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SecondaryPaths } from '@/components/marketing/SecondaryPaths'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
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
  return buildMetadata({
    title: '바로도리 - 사경 진단 이후 홈케어 운동 기록 앱',
    description: '병원 물리치료 이후 집에서 이어가는 홈케어 운동을 목표로 세우고, 기록하고, 리포트로 확인하세요.',
    path: `/${locale}`,
    locale,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(mobileAppJsonLd()) }}
      />
      <Hero locale={loc} />
      <HomeFeatureSections />
      <SafetyNotice locale={loc} compact />
      <SecondaryPaths locale={loc} />
      <InstallCta locale={loc} surface="home_footer" />
    </>
  )
}
