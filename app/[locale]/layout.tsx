import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { notFound } from 'next/navigation'
import { isLocale, getDictionary } from '@/lib/i18n/dictionary'
import { locales, indexableLocales, type Locale } from '@/lib/i18n/config'
import { getSiteUrl } from '@/lib/seo/siteUrl'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import '../globals.css'

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
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: 'Barodori',
      template: '%s | Barodori',
    },
    description: 'Home-care exercise records with goals and reports after hospital therapy',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicons/favicon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicons/favicon-48.png', sizes: '48x48', type: 'image/png' },
        { url: '/favicons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      shortcut: '/favicon.ico',
    },
    manifest: '/site.webmanifest',
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
  const loc = locale as Locale
  // dict 는 children에 props로 못 내리므로 server component tree에서 fetch
  await getDictionary(loc)
  return (
    <html lang={loc} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AnalyticsProvider />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
