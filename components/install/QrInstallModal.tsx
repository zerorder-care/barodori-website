'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { isAppLive, getBetaFormUrl } from '@/lib/install/storeLinks'
import { track } from '@/lib/analytics'
import { launchCopy } from '@/lib/site/config'
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
        className="inline-flex items-center justify-center rounded-pill bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
      >
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} ariaLabel="앱 설치 안내">
        {live ? (
          <div>
            <h2 className="text-lg font-semibold">QR 코드로 설치</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              모바일로 QR 코드를 스캔하면 앱스토어로 이동해요.
            </p>
            {/* 실제 QR 이미지는 스토어 링크 오픈 시 추가합니다. */}
            <div className="mx-auto mt-4 grid h-40 w-40 place-items-center rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
              QR 이미지 (오픈 시 업데이트)
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold">앱 오픈 준비 중</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              바로도리는 병원에서 안내받은 홈케어 운동을 목표로 세우고, 기록과 리포트로 확인하는 앱이에요.
              오픈 소식을 받아보거나 베타 참여 가능 여부를 확인해 주세요.
            </p>
            {beta && (
              <a
                href={beta}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('cta_beta_form_click', { surface: `${surface}:modal`, locale })}
                className="mt-4 inline-flex w-full items-center justify-center rounded-pill bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
              >
                {launchCopy.pendingCta}
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
