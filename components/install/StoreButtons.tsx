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
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[8px] bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm disabled:opacity-100"
        >
          <span className="h-5 w-5 rounded-[4px] bg-[#6f6f6f]" />
          <span className="text-left leading-tight">
            <span className="block text-[10px] uppercase text-[#777]">Download on the</span>
            App Store
          </span>
        </button>
        <button
          type="button"
          disabled
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[8px] bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm disabled:opacity-100"
        >
          <span className="h-5 w-5 rounded-[4px] bg-[#6f6f6f]" />
          <span className="text-left leading-tight">
            <span className="block text-[10px] uppercase text-[#777]">Get it on</span>
            Google Play
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={ios ?? '#'}
        onClick={onClick('ios')}
        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[8px] bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm"
      >
        <span className="h-5 w-5 rounded-[4px] bg-[#6f6f6f]" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase text-[#777]">Download on the</span>
          App Store
        </span>
      </a>
      <a
        href={android ?? '#'}
        onClick={onClick('android')}
        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[8px] bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm"
      >
        <span className="h-5 w-5 rounded-[4px] bg-[#6f6f6f]" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase text-[#777]">Get it on</span>
          Google Play
        </span>
      </a>
    </div>
  )
}
