import Image from 'next/image'
import type { Locale } from '@/lib/i18n/config'

const LOCKUP: Record<Locale, { src: string; width: number; height: number }> = {
  ko: { src: '/images/home-v2/logo-ko.png', width: 891, height: 240 },
  en: { src: '/images/home-v2/logo-en.png', width: 1070, height: 240 },
}

/** 도리 마스코트와 워드마크 lockup. 높이는 호출부의 className으로 정한다. */
export function BarodoriLogo({
  locale,
  label,
  className = 'h-7 w-auto',
}: {
  locale: Locale
  label: string
  className?: string
}) {
  const lockup = LOCKUP[locale]
  return (
    <Image
      src={lockup.src}
      alt={label}
      width={lockup.width}
      height={lockup.height}
      loading="eager"
      className={className}
    />
  )
}
