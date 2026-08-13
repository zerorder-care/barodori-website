'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'
import { SHARE_UTM } from '@/lib/head-test/share'
import type { HeadType } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'

// 공유 버튼 (공유 플로우 스펙 §2).
// 유형별 공유 훅 + 공통 꼬리 문구와 UTM이 붙은 결과 URL을 시스템 공유 시트로 보내고,
// 미지원 환경은 같은 내용을 클립보드에 복사한다. 이미지는 싣지 않는다(OG가 담당).

export function ShareButton({
  locale,
  type,
  label,
  copiedLabel,
  shareText,
}: {
  locale: Locale
  type: HeadType
  label: string
  copiedLabel: string
  shareText: string
}) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = `${window.location.origin}/${locale}/head-test/result/${type}?${SHARE_UTM}`
    if (navigator.share) {
      track('head_test_share_click', { locale, type, method: 'sheet' })
      await navigator.share({ text: shareText, url }).catch(() => undefined)
      return
    }
    track('head_test_share_click', { locale, type, method: 'clipboard' })
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* 클립보드도 막힌 환경에서는 조용히 둔다 */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="w-full rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold text-[var(--color-text-primary)]"
    >
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  )
}
