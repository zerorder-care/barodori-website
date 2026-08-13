'use client'

import { useState, useSyncExternalStore } from 'react'
import { EMPTY_PERSONALIZATION, readPersonalizationSnapshot } from '@/lib/head-test/storage'
import { personalizeTip } from '@/lib/head-test/tips'
import type { AgeBand, HeadType } from '@/lib/head-test/types'
import type { Dictionary } from '@/lib/i18n/dictionary'

type ResultCopy = Dictionary['headTest']['result']

// 놀이 팁 섹션 (UX 스펙 §4.7-4).
// 테스트를 마친 기기에서는 저장된 월령·방향 응답이 반영되고, 공유 링크로 들어온 방문자는
// "3개월 이후" 기본 + 방향 폴백을 본다. 월령 토글로 언제든 바꿔볼 수 있다.

const subscribeToNothing = () => () => {}
const serverSnapshot = () => EMPTY_PERSONALIZATION

export function ResultTips({ type, copy }: { type: HeadType; copy: ResultCopy }) {
  // 저장값은 페이지 수명 동안 바뀌지 않는 외부 스토어라 hydration 불일치 없이 이 훅으로 읽는다.
  const saved = useSyncExternalStore(subscribeToNothing, readPersonalizationSnapshot, serverSnapshot)
  const [ageOverride, setAgeOverride] = useState<AgeBand | null>(null)
  const ageBand = ageOverride ?? saved.ageBand ?? 'from3m'
  const preferredSide = saved.preferredSide

  const tips = copy.types[type].tips[ageBand]
  const ageOptions: Array<{ band: AgeBand; label: string }> = [
    { band: 'under3m', label: copy.tipsAgeUnder3m },
    { band: 'from3m', label: copy.tipsAgeFrom3m },
  ]

  return (
    <section className="w-full text-left">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{copy.tipsTitle}</h2>
        <div
          role="group"
          aria-label={copy.tipsAgeToggleLabel}
          className="flex rounded-pill border border-[var(--color-border)] p-0.5"
        >
          {ageOptions.map(({ band, label }) => (
            <button
              key={band}
              type="button"
              onClick={() => setAgeOverride(band)}
              aria-pressed={ageBand === band}
              className={`rounded-pill px-3 py-1.5 text-xs font-semibold ${
                ageBand === band
                  ? 'bg-[var(--color-primary)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-5"
          >
            <h3 className="font-bold">{tip.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {personalizeTip(tip.body, copy.side, preferredSide)}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-secondary)]">{copy.tipsSafety}</p>
    </section>
  )
}
