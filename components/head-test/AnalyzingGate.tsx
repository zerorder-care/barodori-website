'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { questionOptions } from '@/lib/head-test/constants'
import type { AgeBand } from '@/lib/head-test/types'
import type { Dictionary } from '@/lib/i18n/dictionary'

type HeadTestCopy = Dictionary['headTest']

// 월령 질문 + 분석 중 화면 (UX 스펙 §4.4).
// 분석은 뒤에서 돌고, 화면은 월령 1문항이 체감 로딩을 흡수한다. 응답 후에도 분석이
// 진행 중이면 캐릭터 애니메이션과 로테이션 문구만 보여준다. 사진은 표시하지 않는다.

export function AnalyzingGate({
  copy,
  ageAnswered,
  onAgeAnswer,
}: {
  copy: HeadTestCopy
  ageAnswered: boolean
  onAgeAnswer: (ageBand: AgeBand) => void
}) {
  const ageQuestion = copy.questions[copy.questions.length - 1]

  if (!ageAnswered) {
    return (
      <div className="flex flex-1 flex-col px-6 pt-14">
        <h2 className="text-[22px] font-bold leading-snug">{ageQuestion.text}</h2>
        <div className="mt-8 flex flex-col gap-3">
          {ageQuestion.options.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => onAgeAnswer(questionOptions.age[index])}
              className="flex min-h-[52px] items-center rounded-2xl border border-[var(--color-border)] bg-white px-5 py-3.5 text-left text-[15px] font-medium hover:bg-[var(--color-bg-muted)]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return <AnalyzingSpinner messages={copy.photo.analyzing} />
}

export function AnalyzingSpinner({ messages }: { messages: readonly string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % messages.length),
      1800,
    )
    return () => window.clearInterval(timer)
  }, [messages.length])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <Image
        src="/images/head-test/donggeuri.png"
        alt=""
        aria-hidden
        width={140}
        height={140}
        className="motion-safe:animate-bounce"
      />
      <p aria-live="polite" className="mt-6 text-lg font-semibold">
        {messages[index]}
      </p>
    </div>
  )
}
