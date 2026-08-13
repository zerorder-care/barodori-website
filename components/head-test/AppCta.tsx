'use client'

import Image from 'next/image'
import { track } from '@/lib/analytics'
import { appLinkUrl } from '@/lib/head-test/share'
import type { HeadType } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'

// 결과 화면 앱 CTA (UX 스펙 §4.7-6).
// 모바일은 MMP 트래킹 링크로 바로 가는 큰 버튼 하나로 전환을 유도하고,
// 데스크톱은 폰으로 이어가도록 같은 링크의 QR을 보여준다. 스토어 선택과
// 설치 어트리뷰션은 MMP 링크가 처리한다.

export function AppCta({
  locale,
  type,
  head,
  sub,
  buttonLabel,
  qrScanLabel,
  qrAlt,
}: {
  locale: Locale
  type: HeadType
  head: string
  sub: string
  buttonLabel: string
  qrScanLabel: string
  qrAlt: string
}) {
  const href = appLinkUrl()

  return (
    <section className="w-full rounded-2xl bg-[var(--color-bg-muted)] p-6">
      <h2 className="text-lg font-bold leading-snug">{head}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{sub}</p>

      {/* 모바일: MMP 링크 직행 버튼 */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('head_test_app_cta_click', { locale, type, method: 'button' })}
        className="mt-5 flex w-full items-center justify-center rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold text-[var(--color-text-primary)] shadow-[0_6px_18px_rgba(255,183,0,0.35)] sm:hidden"
      >
        {buttonLabel}
      </a>

      {/* 데스크톱: 같은 링크의 QR — 스캔하면 폰에서 이어진다.
          모니터 스캔은 모아레·반사에 취약해서 에러 정정 H 고해상도 PNG를 160px로 크게 보여준다. */}
      <div className="mt-6 hidden flex-col items-center gap-3 sm:flex">
        <p className="text-xs text-[var(--color-text-secondary)]">{qrScanLabel}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('head_test_app_cta_click', { locale, type, method: 'qr' })}
          className="rounded-lg border border-[var(--color-border)] bg-white p-4"
        >
          <Image
            src="/images/head-test/qr-app-link.png"
            alt={qrAlt}
            width={160}
            height={160}
            className="h-40 w-40"
            // 손실 변환 없이 원본 픽셀을 그대로 내려 스캔 대비를 지킨다
            unoptimized
          />
        </a>
      </div>
    </section>
  )
}
