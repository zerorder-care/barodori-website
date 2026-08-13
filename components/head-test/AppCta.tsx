'use client'

import { useSyncExternalStore } from 'react'
import { StoreQrCodes } from '@/components/install/StoreQrCodes'
import { track } from '@/lib/analytics'
import { APP_CTA_UTM } from '@/lib/head-test/share'
import { getStoreLinks, resolveStorePlatform, type StorePlatform } from '@/lib/install/storeLinks'
import type { HeadType } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'

// 결과 화면 앱 CTA (UX 스펙 §4.7-6).
// 모바일은 기기 스토어로 바로 가는 큰 버튼 하나로 전환을 유도하고,
// 데스크톱은 폰으로 이어가도록 스토어 QR 두 개를 보여준다.

const subscribeToNothing = () => () => {}
const serverPlatform = (): StorePlatform => 'unknown'

function platformSnapshot(): StorePlatform {
  return resolveStorePlatform(window.navigator.userAgent)
}

export function AppCta({
  locale,
  type,
  head,
  sub,
  buttonLabel,
  storeLabels,
}: {
  locale: Locale
  type: HeadType
  head: string
  sub: string
  buttonLabel: string
  storeLabels: Dictionary['store']
}) {
  const platform = useSyncExternalStore(subscribeToNothing, platformSnapshot, serverPlatform)
  const links = getStoreLinks()
  const storeHref = platform === 'ios' ? links.ios : platform === 'android' ? links.android : null

  return (
    <section className="w-full rounded-2xl bg-[var(--color-bg-muted)] p-6">
      <h2 className="text-lg font-bold leading-snug">{head}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{sub}</p>

      {/* 모바일: 기기 스토어 직행 버튼 (판별 불가 기기는 설치 페이지 폴백) */}
      <a
        href={storeHref ?? `/${locale}/install?${APP_CTA_UTM}`}
        target={storeHref ? '_blank' : undefined}
        rel={storeHref ? 'noopener noreferrer' : undefined}
        onClick={() => track('head_test_app_cta_click', { locale, type, platform })}
        className="mt-5 flex w-full items-center justify-center rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold text-[var(--color-text-primary)] shadow-[0_6px_18px_rgba(255,183,0,0.35)] sm:hidden"
      >
        {buttonLabel}
      </a>

      {/* 데스크톱: 폰으로 이어가는 스토어 QR */}
      <StoreQrCodes
        surface="head_test_result"
        locale={locale}
        labels={storeLabels}
        className="mt-6 hidden sm:flex"
      />
    </section>
  )
}
