'use client'

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

  if (!live) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-pill bg-[--color-bg-muted] px-6 py-3 text-sm text-[--color-text-secondary]"
        >
          App Store · 출시 예정
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-pill bg-[--color-bg-muted] px-6 py-3 text-sm text-[--color-text-secondary]"
        >
          Google Play · 출시 예정
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        href={ios ?? '#'}
        onClick={onClick('ios')}
        className="inline-flex items-center justify-center rounded-pill bg-black px-6 py-3 text-sm font-medium text-white"
      >
        App Store
      </a>
      <a
        href={android ?? '#'}
        onClick={onClick('android')}
        className="inline-flex items-center justify-center rounded-pill bg-black px-6 py-3 text-sm font-medium text-white"
      >
        Google Play
      </a>
    </div>
  )
}
