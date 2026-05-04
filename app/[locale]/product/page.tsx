import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { ProductDetail } from '@/components/marketing/ProductDetail'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '제품 소개 - 바로도리',
    description: '바로도리 앱의 핵심 기능: AI 머리 모양 진단, 맞춤 가정 운동, 진료 가이드',
    path: `/${locale}/product`,
    locale,
  })
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  return (
    <>
      <section className="bg-[--color-primary-light] py-16">
        <Container className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">바로도리는 어떻게 도와줄까요?</h1>
          <p className="mt-3 text-[--color-text-secondary]">사경/사두를 위한 가정 케어, 한 앱에서.</p>
        </Container>
      </section>
      <ProductDetail />
      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="product_footer" />
    </>
  )
}
