'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { isAppLive, getBetaFormUrl } from '@/lib/install/storeLinks'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  surface: string
  locale: Locale
  children: React.ReactNode // 트리거 버튼 텍스트
}

export function QrInstallModal({ surface, locale, children }: Props) {
  const [open, setOpen] = useState(false)
  const live = isAppLive()
  const beta = getBetaFormUrl()

  const onTriggerClick = () => {
    track('cta_install_click', { surface, platform: 'qr', locale, live })
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onTriggerClick}
        className="inline-flex items-center justify-center rounded-pill bg-[--color-primary] px-6 py-3 text-sm font-semibold text-black"
      >
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} ariaLabel="앱 설치 안내">
        {live ? (
          <div>
            <h2 className="text-lg font-semibold">QR 코드로 설치</h2>
            <p className="mt-2 text-sm text-[--color-text-secondary]">
              모바일로 QR 코드를 스캔하면 앱스토어로 이동합니다.
            </p>
            {/* 실제 QR 이미지는 출시 시 추가. MVP는 placeholder */}
            <div className="mx-auto mt-4 grid h-40 w-40 place-items-center rounded-lg border border-dashed border-[--color-border] text-xs text-[--color-text-secondary]">
              QR 이미지 (출시 시 업데이트)
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold">출시 예정</h2>
            <p className="mt-2 text-sm leading-relaxed text-[--color-text-secondary]">
              바로도리는 2026-05-20 베타 출시 예정입니다. 베타 서포터즈로 미리 만나보세요.
            </p>
            {beta && (
              <a
                href={beta}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('cta_beta_form_click', { surface: `${surface}:modal`, locale })}
                className="mt-4 inline-flex w-full items-center justify-center rounded-pill bg-[--color-primary] px-6 py-3 text-sm font-semibold text-black"
              >
                베타 서포터즈 신청
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
