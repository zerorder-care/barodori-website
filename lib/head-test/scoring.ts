import {
  measurementThresholds,
  scoreTable,
  doubledOnUnsureShape,
  typeThresholds,
  type OptionKey,
  type QuestionId,
  type ScoredType,
} from './constants'
import type { AgeBand, HeadType, PreferredSide, TummyReaction } from './types'

/** 판정은 소수점 둘째 자리로 반올림한 값 기준 (스펙 §2). */
export function roundForJudgment(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * 사진 측정값(CI·CVAI)으로 유형을 판정한다.
 * CVAI를 먼저 확인하고, 순서대로 먼저 조건을 만족한 유형으로 확정한다 (스펙 §2).
 */
export function classifyMeasurement(ci: number, cvai: number): HeadType {
  const c = roundForJudgment(ci)
  const v = roundForJudgment(cvai)
  if (v >= measurementThresholds.ttaomiCvaiMin) return 'ttaomi'
  if (c > measurementThresholds.banguriCiOver) return 'banguri'
  if (c < measurementThresholds.ppyojogiCiUnder) return 'ppyojogi'
  if (c < measurementThresholds.jjangguCiUnder) return 'jjanggu'
  return 'donggeuri'
}

export type Answers = { [Q in QuestionId]: OptionKey<Q> }

export type QuestionResult = {
  type: HeadType
  points: Record<ScoredType, number>
  preferredSide: PreferredSide
  ageBand: AgeBand
  tummyReaction: TummyReaction
}

/**
 * 7문항 응답으로 유형을 판정한다 (스펙 §3).
 * 1번에서 "잘 모르겠어요"를 골랐다면 습관 문항(5·6)의 배점을 2배로 계산하고,
 * 임계 확인 순서(따옴이→방울이→뾰족이→짱구)에서 먼저 도달한 유형으로 확정한다. 없으면 동글이.
 */
export function scoreAnswers(answers: Answers): QuestionResult {
  const points: Record<ScoredType, number> = { ttaomi: 0, banguri: 0, ppyojogi: 0, jjanggu: 0 }
  const doubled = answers.shape === 'unsure'

  for (const [questionId, optionMap] of Object.entries(scoreTable) as Array<
    [QuestionId, Record<string, Partial<Record<ScoredType, number>>>]
  >) {
    const selected = answers[questionId]
    const awards = optionMap[selected]
    if (!awards) continue
    const factor = doubled && doubledOnUnsureShape.includes(questionId) ? 2 : 1
    for (const [type, score] of Object.entries(awards) as Array<[ScoredType, number]>) {
      points[type] += score * factor
    }
  }

  let type: HeadType = 'donggeuri'
  for (const { type: candidate, min } of typeThresholds) {
    if (points[candidate] >= min) {
      type = candidate
      break
    }
  }

  const preferredSide: PreferredSide =
    answers.headSide === 'left' || answers.headSide === 'right' ? answers.headSide : 'unknown'

  return {
    type,
    points,
    preferredSide,
    ageBand: answers.age,
    tummyReaction: answers.tummy,
  }
}
