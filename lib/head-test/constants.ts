// 두상 유형 테스트 판정 기준의 단일 출처.
// 수치의 근거와 경계값 포함 규칙은 docs/specs/2026-08-07-head-type-test-scoring-design.md 를 따르며,
// 수치를 조정할 때는 이 모듈과 스펙 문서를 함께 바꾼다.
// 모든 값은 내부 판정 전용이며 어떤 화면에도 노출하지 않는다.

/** 사진 측정 판정 경계값 (스펙 §2). CVAI를 CI보다 먼저 확인한다. */
export const measurementThresholds = {
  /** CVAI가 이 값 이상이면 따옴이 (정확히 3.5 포함) */
  ttaomiCvaiMin: 3.5,
  /** CI가 이 값을 초과하면 방울이 (정확히 85는 동글이) */
  banguriCiOver: 85,
  /** CI가 이 값 미만이면 뾰족이 (정확히 75는 짱구) */
  ppyojogiCiUnder: 75,
  /** CI가 이 값 미만이면(뾰족이 아님 전제) 짱구 (정확히 80은 동글이) */
  jjangguCiUnder: 80,
} as const

/**
 * 마스크 품질 검사(sanity check) 수치 (스펙 §4).
 * 경계 구간은 하한 포함·상한 미포함으로 읽는다. 사진 플로우 티켓에서 사용한다.
 */
export const sanityThresholds = {
  /** 최대 성분 픽셀 수 ÷ 256² */
  areaRatio: { passMin: 0.18, passMax: 0.6, edgeMin: 0.12, edgeMax: 0.7 },
  /** 최대 성분 픽셀 수 ÷ 전체 마스크 픽셀 수 */
  dominance: { passMin: 0.9, edgeMin: 0.8 },
  /** 성분 면적 ÷ 볼록 껍질 면적 */
  solidity: { passMin: 0.92, edgeMin: 0.88 },
  /** 성분 무게중심과 화면 중심의 거리 ÷ 256 */
  centerOffset: { passMax: 0.15, edgeMax: 0.25 },
  /** 측정 타당성: 범위 밖이면 즉시 실패 (경계 없음) */
  measurementValidity: { ciMin: 55, ciMax: 130, cvaiMax: 15 },
} as const

/** 문항 id — 순서가 곧 노출 순서이고 messages 의 headTest.questions 배열과 index 로 대응한다. */
export const questionIds = ['shape', 'backline', 'ears', 'headSide', 'lying', 'tummy', 'age'] as const

export type QuestionId = (typeof questionIds)[number]

/**
 * 문항별 선택지 키 — messages 의 각 문항 options 배열과 index 로 대응한다.
 * 문구는 messages 가, 배점은 아래 scoreTable 이 단일 출처다.
 */
export const questionOptions = {
  shape: ['round', 'long', 'wide', 'tilted', 'unsure'],
  backline: ['pointy', 'gentle', 'flat', 'unsure'],
  ears: ['similar', 'oneForward', 'unsure'],
  headSide: ['left', 'right', 'both', 'unsure'],
  lying: ['mostly', 'varied', 'unsure'],
  tummy: ['enjoys', 'struggles', 'notYet'],
  age: ['under3m', 'from3m'],
} as const satisfies Record<QuestionId, readonly string[]>

export type OptionKey<Q extends QuestionId> = (typeof questionOptions)[Q][number]

/** 점수를 받을 수 있는 유형 (동글이는 여집합이라 점수가 없다). */
export type ScoredType = 'ttaomi' | 'banguri' | 'ppyojogi' | 'jjanggu'

/** 배점표 (스펙 §3). 표기 없는 선택지는 무배점. */
export const scoreTable: {
  [Q in QuestionId]?: Partial<Record<OptionKey<Q>, Partial<Record<ScoredType, number>>>>
} = {
  shape: {
    long: { ppyojogi: 2 },
    wide: { banguri: 2 },
    tilted: { ttaomi: 2 },
  },
  backline: {
    pointy: { jjanggu: 2 },
    flat: { banguri: 2 },
  },
  ears: {
    oneForward: { ttaomi: 2 },
  },
  headSide: {
    left: { ttaomi: 1 },
    right: { ttaomi: 1 },
  },
  lying: {
    mostly: { banguri: 1 },
  },
  tummy: {
    enjoys: { jjanggu: 1 },
  },
}

/** 1번(shape)에서 "잘 모르겠어요"를 고르면 배점이 2배가 되는 습관 문항. */
export const doubledOnUnsureShape: readonly QuestionId[] = ['lying', 'tummy']

/** 임계 확인 순서와 임계 점수 (스펙 §3). 먼저 도달한 유형으로 확정하고, 없으면 동글이. */
export const typeThresholds: ReadonlyArray<{ type: ScoredType; min: number }> = [
  { type: 'ttaomi', min: 3 },
  { type: 'banguri', min: 3 },
  { type: 'ppyojogi', min: 2 },
  { type: 'jjanggu', min: 3 },
]
