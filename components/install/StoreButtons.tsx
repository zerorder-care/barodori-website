'use client'

import Image from 'next/image'
import { getStoreLinks, isAppLive } from '@/lib/install/storeLinks'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  surface: string
  locale: Locale
}

export function StoreButtons({ surface, locale }: Props) {
  const live = isAppLive()
  const { ios, android } = getStoreLinks()

  const onClick = (platform: 'ios' | 'android') => () => {
    track('cta_install_click', { surface, platform, locale, live })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <StoreBadge
        href={ios}
        disabled={!live}
        onClick={onClick('ios')}
        label="App Store에서 다운로드"
        src="/images/store/app-store.svg"
        width={120}
        height={40}
      />
      <StoreBadge
        href={android}
        disabled={!live}
        onClick={onClick('android')}
        label="Google Play에서 다운로드"
        src="/images/store/google-play.png"
        width={155}
        height={60}
        imageClassName="h-[54px] w-auto max-w-none object-contain"
      />
    </div>
  )
}

function StoreBadge({
  href,
  disabled,
  onClick,
  label,
  src,
  width,
  height,
  imageClassName = 'h-10 w-auto object-contain',
}: {
  href: string | null
  disabled: boolean
  onClick: () => void
  label: string
  src: string
  width: number
  height: number
  imageClassName?: string
}) {
  const image = (
    <Image
      src={src}
      alt={label}
      width={width}
      height={height}
      className={imageClassName}
    />
  )

  if (disabled || !href) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${label} - 출시 예정`}
        className="inline-flex h-10 items-center justify-center overflow-hidden opacity-60"
      >
        {image}
      </button>
    )
  }

  return (
    <a
      href={href}
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-10 items-center justify-center overflow-hidden transition hover:opacity-85"
    >
      {image}
    </a>
  )
}
