import Link from 'next/link'
import { getExternalLinks } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

export function KakaoFloatingButton({ locale }: { locale: Locale }) {
  const href = getExternalLinks().kakaoChannel ?? `/${locale}/faq`
  const external = href.startsWith('http')

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE500] text-sm font-bold text-black shadow-lg shadow-black/15 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black/30 sm:h-16 sm:w-16"
      aria-label="카카오톡 문의"
    >
      톡
    </Link>
  )
}

