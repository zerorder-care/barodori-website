import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  return (
    <>
      <Header locale={loc} />
      <main className="flex-1">{children}</main>
      <Footer locale={loc} />
    </>
  )
}
