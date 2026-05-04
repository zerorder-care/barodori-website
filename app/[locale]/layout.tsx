import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, getDictionary } from '@/lib/i18n/dictionary'
import { locales, indexableLocales, type Locale } from '@/lib/i18n/config'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const noindex = !indexableLocales.includes(locale as Locale)
  return {
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  // dict 는 children에 props로 못 내리므로 server component tree에서 fetch
  await getDictionary(locale)
  return (
    <>
      <AnalyticsProvider />
      <Header locale={locale as Locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale as Locale} />
    </>
  )
}
