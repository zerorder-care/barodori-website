import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { HeadTestFlow } from '@/components/head-test/HeadTestFlow'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.headTest.seo.title,
    description: dict.headTest.seo.description,
    path: `/${locale}/head-test`,
    locale,
  })
}

export default async function HeadTestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const dict = await getDictionary(loc)
  return <HeadTestFlow locale={loc} copy={dict.headTest} homeLabel={dict.common.home} />
}
