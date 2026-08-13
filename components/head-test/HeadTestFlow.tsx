'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnalyzingGate, AnalyzingSpinner } from '@/components/head-test/AnalyzingGate'
import { MiniHeader } from '@/components/head-test/MiniHeader'
import { PhotoCapture } from '@/components/head-test/PhotoCapture'
import { RotateAlign } from '@/components/head-test/RotateAlign'
import { track } from '@/lib/analytics'
import { analyzeProbabilityMap, imageDataToTensor, type PhotoAnalysis } from '@/lib/head-test/analyze'
import { questionIds, questionOptions, type OptionKey, type QuestionId } from '@/lib/head-test/constants'
import { runSegmentation } from '@/lib/head-test/model'
import { scoreAnswers, type Answers } from '@/lib/head-test/scoring'
import { resolveViewSource } from '@/lib/head-test/share'
import { saveCompletedType, savePersonalization } from '@/lib/head-test/storage'
import { headTypes, type AgeBand } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'

type HeadTestCopy = Dictionary['headTest']

type Step =
  | 'intro'
  | 'questions'
  | 'judging'
  | 'photo'
  | 'align'
  | 'analyzing'
  | 'barely'
  | 'photo-fail'
  | 'model-fail'

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
  const [galleryFile, setGalleryFile] = useState<File | null>(null)
  const [ageAnswered, setAgeAnswered] = useState(false)
  const analysisRef = useRef<PhotoAnalysis | 'error' | null>(null)
  const photoAgeRef = useRef<AgeBand | null>(null)
  const guideOnAtCapture = useRef(true)
  const judgeTimer = useRef<number | null>(null)
  const analysisRun = useRef(0)

  useEffect(() => {
    track('head_test_view', { locale, source: resolveViewSource(window.location.search) })
    const run = analysisRun
    return () => {
      if (judgeTimer.current !== null) window.clearTimeout(judgeTimer.current)
      run.current += 1
    }
  }, [locale])

  // 사진 경로의 전환 규칙 (UX 스펙 §4.4·§4.5):
  // 실패 계열은 즉시 전환하고, 성공은 월령 응답까지 기다렸다가 결과(또는 재촬영 권유)로 간다.
  // 분석 완료와 월령 응답 어느 쪽이 먼저 와도 되도록 두 이벤트 핸들러가 같은 판단을 거친다.
  function advancePhotoFlow() {
    const analysis = analysisRef.current
    if (analysis === null) return
    if (analysis === 'error') {
      track('head_test_photo_fallback', { locale, reason: 'model' })
      setStep('model-fail')
      return
    }
    if (analysis.status === 'quality-fail') {
      track('head_test_photo_fallback', { locale, reason: 'quality' })
      setStep('photo-fail')
      return
    }
    if (photoAgeRef.current === null) return
    if (analysis.quality === 'edge' && !guideOnAtCapture.current) {
      setStep('barely')
      return
    }
    goToPhotoResult(analysis)
  }

  function selectOption(optionIndex: number) {
    const questionId = questionIds[index]
    const next = { ...answers, [questionId]: questionOptions[questionId][optionIndex] }
    setAnswers(next)
    if (index < questionIds.length - 1) {
      setIndex(index + 1)
    } else {
      finishQuestions(next as Answers)
    }
  }

  function finishQuestions(all: Answers) {
    setStep('judging')
    const result = scoreAnswers(all)
    track('head_test_complete', { locale, type: result.type, path: 'questions' })
    saveCompletedType(result.type)
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

  function startAnalysis(image: ImageData, guideOn: boolean) {
    guideOnAtCapture.current = guideOn
    analysisRef.current = null
    setStep('analyzing')
    const run = ++analysisRun.current
    const tensor = imageDataToTensor(image)
    runSegmentation(tensor)
      .then((probability) => {
        if (analysisRun.current !== run) return
        analysisRef.current = analyzeProbabilityMap(probability)
        advancePhotoFlow()
      })
      .catch(() => {
        if (analysisRun.current !== run) return
        analysisRef.current = 'error'
        advancePhotoFlow()
      })
  }

  function answerPhotoAge(ageBand: AgeBand) {
    photoAgeRef.current = ageBand
    setAgeAnswered(true)
    advancePhotoFlow()
  }

  function goToPhotoResult(result: Extract<PhotoAnalysis, { status: 'ok' }>) {
    track('head_test_complete', {
      locale,
      type: result.type,
      path: 'photo',
      quality: result.quality,
    })
    saveCompletedType(result.type)
    savePersonalization({
      preferredSide: result.preferredSide,
      ageBand: photoAgeRef.current ?? undefined,
    })
    router.push(`/${locale}/head-test/result/${result.type}`)
  }

  function startQuestions() {
    setIndex(0)
    setStep('questions')
  }

  function goBack() {
    if (index === 0) {
      setStep('intro')
    } else {
      setIndex(index - 1)
    }
  }

  switch (step) {
    case 'intro':
      return (
        <Intro
          locale={locale}
          copy={copy}
          homeLabel={homeLabel}
          onPhoto={() => {
            track('head_test_start', { locale, path: 'photo' })
            setStep('photo')
          }}
          onQuestions={() => {
            track('head_test_start', { locale, path: 'questions' })
            startQuestions()
          }}
        />
      )
    case 'photo':
      return (
        <PhotoCapture
          copy={copy.photo}
          onCaptured={startAnalysis}
          onGallery={(file) => {
            setGalleryFile(file)
            setStep('align')
          }}
          onUseQuestions={startQuestions}
          onPermissionDenied={() => track('head_test_photo_fallback', { locale, reason: 'permission' })}
          onBack={() => setStep('intro')}
        />
      )
    case 'align':
      return galleryFile ? (
        <RotateAlign
          copy={copy.photo}
          file={galleryFile}
          // 갤러리 사진은 촬영 조준선 없이 찍혔으므로 "간신히 통과" 시 재촬영 권유 분기를 탄다.
          onConfirm={(image) => startAnalysis(image, false)}
          onBack={() => setStep('photo')}
        />
      ) : null
    case 'analyzing':
      return <AnalyzingGate copy={copy} ageAnswered={ageAnswered} onAgeAnswer={answerPhotoAge} />
    case 'barely':
      return (
        <FallbackScreen
          title={copy.photo.barelyTitle}
          primaryLabel={copy.photo.proceed}
          onPrimary={() => {
            const analysis = analysisRef.current
            if (analysis !== null && analysis !== 'error' && analysis.status === 'ok') {
              goToPhotoResult(analysis)
            }
          }}
          secondaryLabel={copy.photo.retake}
          onSecondary={() => {
            track('head_test_photo_fallback', { locale, reason: 'barely_retake' })
            setStep('photo')
          }}
        />
      )
    case 'photo-fail':
      return (
        <FallbackScreen
          title={copy.photo.qualityFailTitle}
          body={copy.photo.qualityFailBody}
          primaryLabel={copy.photo.continueWithQuestions}
          onPrimary={startQuestions}
          secondaryLabel={copy.photo.retake}
          onSecondary={() => setStep('photo')}
        />
      )
    case 'model-fail':
      return (
        <FallbackScreen
          title={copy.photo.modelFailTitle}
          body={copy.photo.modelFailBody}
          primaryLabel={copy.photo.useQuestions}
          onPrimary={startQuestions}
        />
      )
    case 'judging':
      return <AnalyzingSpinner messages={[copy.flow.judging]} />
    case 'questions': {
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
  }
}

function Intro({
  locale,
  copy,
  homeLabel,
  onPhoto,
  onQuestions,
}: {
  locale: Locale
  copy: HeadTestCopy
  homeLabel: string
  onPhoto: () => void
  onQuestions: () => void
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
          onClick={onPhoto}
          className="mt-8 w-full rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold text-[var(--color-text-primary)]"
        >
          {copy.intro.photoCta}
        </button>
        <button
          type="button"
          onClick={onQuestions}
          className="mt-3 w-full rounded-pill border border-[var(--color-border)] px-6 py-4 text-base font-bold"
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

function FallbackScreen({
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  title: string
  body?: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
      <h2 className="text-xl font-bold leading-snug">{title}</h2>
      {body && <p className="mt-3 text-[var(--color-text-secondary)]">{body}</p>}
      <button
        type="button"
        onClick={onPrimary}
        className="mt-8 w-full rounded-pill bg-[var(--color-primary)] px-6 py-4 text-base font-bold"
      >
        {primaryLabel}
      </button>
      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          className="mt-3 w-full rounded-pill border border-[var(--color-border)] px-6 py-4 text-base font-bold"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  )
}
