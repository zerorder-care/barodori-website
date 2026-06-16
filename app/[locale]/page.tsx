import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Hero } from '@/components/marketing/Hero'
import { HomeStorySections } from '@/components/marketing/HomeStorySections'
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
  return buildMetadata({
    title: '바로도리 - 아기·영유아 홈케어 운동 기록 앱',
    description: '병원에서 안내받은 홈케어 운동을 오늘의 목표로 정하고, 시간·횟수·아이 반응을 달력과 리포트로 확인하세요.',
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
      <HomeStorySections />
      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="home" />
    </>
  )
}
