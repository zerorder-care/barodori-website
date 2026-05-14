import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Hero } from '@/components/marketing/Hero'
import { SymptomGrid } from '@/components/marketing/SymptomGrid'
import { ActionGuide } from '@/components/marketing/ActionGuide'
import { ProductFeatures } from '@/components/marketing/ProductFeatures'
import { InstallCta } from '@/components/marketing/InstallCta'
import { HomePreviewSections } from '@/components/marketing/HomePreviewSections'
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
    title: '바로도리 - 영아 사경/사두 가정 케어',
    description: '아기의 작은 고개, 바로도리에서 함께 살펴봐요. 영아 사경/사두 의심부터 가정 운동까지.',
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
      <HomePreviewSections locale={loc} communityPosts={communityPreview.posts} newsroomPosts={newsroomPreview.posts} />
      <InstallCta locale={loc} surface="home_footer" />
    </>
  )
}
