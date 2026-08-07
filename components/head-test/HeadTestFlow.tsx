'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { MiniHeader } from '@/components/head-test/MiniHeader'
import { questionIds, questionOptions, type OptionKey, type QuestionId } from '@/lib/head-test/constants'
import { scoreAnswers, type Answers } from '@/lib/head-test/scoring'
import { savePersonalization } from '@/lib/head-test/storage'
import { headTypes } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'

type HeadTestCopy = Dictionary['headTest']

type Step = 'intro' | 'questions' | 'judging'

export function HeadTestFlow({
  locale,
  copy,
  homeLabel,
}: {
  locale: Locale
  copy: HeadTestCopy
  homeLabel: string
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const judgeTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (judgeTimer.current !== null) window.clearTimeout(judgeTimer.current)
    }
  }, [])

  function selectOption(optionIndex: number) {
    const questionId = questionIds[index]
    const next = { ...answers, [questionId]: questionOptions[questionId][optionIndex] }
    setAnswers(next)
    if (index < questionIds.length - 1) {
      setIndex(index + 1)
    } else {
      finish(next as Answers)
    }
  }

  function finish(all: Answers) {
    setStep('judging')
    const result = scoreAnswers(all)
    savePersonalization({
      preferredSide: result.preferredSide,
      ageBand: result.ageBand,
      tummyReaction: result.tummyReaction,
    })
    // 판정 전환 화면은 1초 내외 (UX 스펙 §4.6). 모션 축소 환경은 짧게 지나간다.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    judgeTimer.current = window.setTimeout(
      () => router.push(`/${locale}/head-test/result/${result.type}`),
      reduced ? 300 : 1100,
    )
  }

  function goBack() {
    if (index === 0) {
      setStep('intro')
    } else {
      setIndex(index - 1)
    }
  }

  if (step === 'intro') {
    return (
      <Intro
        locale={locale}
        copy={copy}
        homeLabel={homeLabel}
        onStart={() => {
          setIndex(0)
          setStep('questions')
        }}
      />
    )
  }

  if (step === 'judging') {
    return <Judging copy={copy} />
  }

  const questionId = questionIds[index]
  return (
    <Question
      copy={copy}
      index={index}
      questionId={questionId}
      selected={answers[questionId]}
      onSelect={selectOption}
      onBack={goBack}
    />
  )
}

function Intro({
  locale,
  copy,
  homeLabel,
  onStart,
}: {
  locale: Locale
  copy: HeadTestCopy
  homeLabel: string
  onStart: () => void
}) {
  return (
    <div className="flex flex-1 flex-col">
      <MiniHeader locale={locale} homeLabel={homeLabel} />
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <div role="img" aria-label={copy.intro.charactersAlt} className="flex items-end justify-center">
          {headTypes.map((type, i) => (
            <Image
              key={type}
              src={`/images/head-test/${type}.png`}
              alt=""
              aria-hidden
              width={76}
              height={76}
              className={i === 0 ? '' : '-ml-3'}
              priority={i < 3}
            />
          ))}
        </div>
        <h1 className="mt-7 text-[27px] font-bold leading-snug">{copy.intro.title}</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{copy.intro.subtitle}</p>
        <button
          type="button"
          onClick={onStart}
          className="mt-8 w-full rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold text-[var(--color-text-primary)]"
        >
          {copy.intro.questionCta}
        </button>
        <p className="mt-6 text-xs text-[var(--color-text-secondary)]">{copy.intro.privacyNote}</p>
        <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">{copy.intro.disclaimerShort}</p>
      </div>
    </div>
  )
}

function Question({
  copy,
  index,
  questionId,
  selected,
  onSelect,
  onBack,
}: {
  copy: HeadTestCopy
  index: number
  questionId: QuestionId
  selected: OptionKey<QuestionId> | undefined
  onSelect: (optionIndex: number) => void
  onBack: () => void
}) {
  const question = copy.questions[index]
  const progressLabel = copy.flow.progressLabel.replace('{current}', String(index + 1))
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-14 items-center gap-4 px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={copy.flow.backLabel}
          className="grid h-11 w-11 place-items-center rounded-full text-xl hover:bg-[var(--color-bg-muted)]"
        >
          ←
        </button>
        <div
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={1}
          aria-valuemax={questionIds.length}
          aria-valuenow={index + 1}
          className="flex flex-1 gap-1.5 pr-4"
        >
          {questionIds.map((id, i) => (
            <span
              key={id}
              className={`h-1.5 flex-1 rounded-full ${
                i <= index ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pt-8">
        <h2 className="text-[22px] font-bold leading-snug">{question.text}</h2>
        {question.helper !== '' && (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{question.helper}</p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          {question.options.map((label, optionIndex) => {
            const isSelected = selected === questionOptions[questionId][optionIndex]
            return (
              <button
                key={label}
                type="button"
                onClick={() => onSelect(optionIndex)}
                aria-pressed={isSelected}
                className={`flex min-h-[52px] items-center justify-between rounded-2xl border px-5 py-3.5 text-left text-[15px] font-medium ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                    : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-muted)]'
                }`}
              >
                <span>{label}</span>
                {isSelected && <span aria-hidden>✓</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Judging({ copy }: { copy: HeadTestCopy }) {
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
        {copy.flow.judging}
      </p>
    </div>
  )
}
