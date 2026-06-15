import { NextResponse, type NextRequest } from 'next/server'
import { isLocale } from '@/lib/i18n/dictionary'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params
  const targetLocale = isLocale(locale) ? locale : 'ko'
  const url = new URL(`/${targetLocale}`, request.url)
  url.hash = 'home-features'
  return NextResponse.redirect(url, 308)
}
