import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { getSiteUrl } from '@/lib/seo/siteUrl'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: '바로도리',
    template: '%s | 바로도리',
  },
  description: '병원 물리치료 이후 집에서 이어가는 홈케어 운동을 목표·기록·리포트로 확인하는 앱',
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
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
