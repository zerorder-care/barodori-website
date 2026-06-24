'use client'

import Image from 'next/image'
import { getStoreLinks } from '@/lib/install/storeLinks'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  surface: string
  locale: Locale
  /** 배경에 맞춘 글자색. dark 섹션 위에 올릴 때 'dark'를 쓴다. */
  tone?: 'light' | 'dark'
  /** 래퍼에 추가할 클래스. 노출 분기(예: hidden sm:flex)는 호출부에서 지정한다. */
  className?: string
}

const QR_CODES = [
  { key: 'ios', label: 'App Store', src: '/images/store/qr-app-store.svg' },
  { key: 'android', label: 'Google Play', src: '/images/store/qr-google-play.svg' },
] as const

export function StoreQrCodes({ surface, locale, tone = 'light', className = '' }: Props) {
  const links = getStoreLinks()
  const textColor = tone === 'dark' ? 'text-white/70' : 'text-[var(--color-text-secondary)]'

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <p className={`text-xs ${textColor}`}>휴대폰 카메라로 QR을 스캔해 설치하세요</p>
      <div className="flex items-start justify-center gap-6">
        {QR_CODES.map((qr) => {
          const href = links[qr.key]
          return (
            <a
              key={qr.key}
              href={href ?? undefined}
              onClick={() => track('cta_install_click', { surface, platform: `qr_${qr.key}`, locale, live: true })}
              className="flex flex-col items-center gap-2"
            >
              <span className="rounded-lg border border-[var(--color-border)] bg-white p-3">
                <Image
                  src={qr.src}
                  alt={`${qr.label} 다운로드 QR 코드`}
                  width={112}
                  height={112}
                  className="h-28 w-28"
                />
              </span>
              <span className={`text-xs font-medium ${textColor}`}>{qr.label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
