import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n/config'

const PUBLIC_FILE = /\.(.*)$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 정적 파일/_next/api 패스
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // 이미 locale prefix 있음
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (hasLocale) return NextResponse.next()

  // /sitemap.xml, /robots.txt 등 metadata 라우트는 pass
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next()
  }

  // Accept-Language 또는 default 로 리다이렉트
  const accept = request.headers.get('accept-language') ?? ''
  const target = locales.find((l) => accept.toLowerCase().includes(l)) ?? defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${target}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\.).*)'],
}
