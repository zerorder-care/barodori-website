import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Hero } from '@/components/marketing/Hero'
import { SymptomGrid } from '@/components/marketing/SymptomGrid'
import { ActionGuide } from '@/components/marketing/ActionGuide'
import { ProductFeatures } from '@/components/marketing/ProductFeatures'
import { InstallCta } from '@/components/marketing/InstallCta'
import { HomePreviewSections } from '@/components/marketing/HomePreviewSections'
import { ArticleTeaserGrid } from '@/components/marketing/ArticleTeaserGrid'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { listCommunityPosts } from '@/lib/api/community'
import { listNewsroomPosts } from '@/lib/api/content'
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
    description: '아기 운동 기록, 영유아 홈케어 루틴, 물리치료 방문과 아이 반응을 달력·리포트로 확인하세요.',
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
  const [communityPreview, newsroomPreview] = await Promise.all([
    listCommunityPosts({ sort: 'popular', limit: 3 }),
    listNewsroomPosts({ pageSize: 3 }),
  ])

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
      <SymptomGrid />
      <ProductFeatures locale={loc} />
      <ActionGuide />
      <SafetyNotice locale={loc} />
      <ArticleTeaserGrid locale={loc} />
      <HomePreviewSections locale={loc} communityPosts={communityPreview.posts} newsroomPosts={newsroomPreview.posts} />
      <InstallCta locale={loc} surface="home_footer" />
    </>
  )
}
