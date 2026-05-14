import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'),
  title: {
    default: '바로도리',
    template: '%s | 바로도리',
  },
  description: '영아 사경/사두를 위한 가정 케어 앱',
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
