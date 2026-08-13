'use client'

import { useState } from 'react'

// 공유 버튼 슬롯 (UX 스펙 §4.7-5).
// 기본 동작은 시스템 공유 시트, 미지원 환경은 링크 복사다.
// 유형별 공유 훅 문구·딥링크 파라미터·계측은 공유·앱 진입 플로우 티켓에서 붙인다.

export function ShareButton({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ url }).catch(() => undefined)
      return
    }
    try {
      await navigator.clipboard.writeText(url)
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
