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
  description: '아기 운동 기록과 영유아 홈케어 루틴을 달력·리포트로 확인하는 아이 운동 다이어리',
  icons: {
    icon: [
      { url: '/favicons/barodori-icon-16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicons/barodori-icon-32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/favicons/barodori-icon-48.svg', sizes: '48x48', type: 'image/svg+xml' },
    ],
    shortcut: '/favicons/barodori-icon-32.svg',
  },
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
