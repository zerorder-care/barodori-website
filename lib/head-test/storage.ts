import type { AgeBand, PreferredSide, TummyReaction } from './types'

// 놀이 팁 개인화 값(방향·월령·엎드려 놀기 반응)은 기기 안에서만 쓰고 서버로 보내지 않는다.
// sessionStorage 라서 탭을 닫으면 사라지고, 공유 링크로 들어온 방문자는 아무 값도 갖지 않는다.

const KEYS = {
  preferredSide: 'headTest.preferredSide',
  ageBand: 'headTest.ageBand',
  tummyReaction: 'headTest.tummyReaction',
} as const

export type Personalization = {
  preferredSide: PreferredSide | null
  ageBand: AgeBand | null
  tummyReaction: TummyReaction | null
}

export const EMPTY_PERSONALIZATION: Personalization = {
  preferredSide: null,
  ageBand: null,
  tummyReaction: null,
}

// useSyncExternalStore의 getSnapshot은 같은 값이면 같은 참조를 돌려줘야 하므로
// 읽기 결과를 캐시하고, 새 값이 저장될 때만 비운다.
let snapshot: Personalization | null = null

export function readPersonalizationSnapshot(): Personalization {
  if (snapshot === null) snapshot = readPersonalization()
  return snapshot
}

export function savePersonalization(values: {
  preferredSide?: PreferredSide
  ageBand?: AgeBand
  tummyReaction?: TummyReaction
}): void {
  if (typeof window === 'undefined') return
  snapshot = null
  try {
    // 사진 경로는 엎드려 놀기 응답이 없는 식으로, 경로마다 아는 값만 남긴다.
    if (values.preferredSide) window.sessionStorage.setItem(KEYS.preferredSide, values.preferredSide)
    if (values.ageBand) window.sessionStorage.setItem(KEYS.ageBand, values.ageBand)
    if (values.tummyReaction) window.sessionStorage.setItem(KEYS.tummyReaction, values.tummyReaction)
  } catch {
    /* 프라이빗 모드 등 저장 불가 환경에서는 개인화 없이 진행한다 */
  }
}

export function readPersonalization(): Personalization {
  if (typeof window === 'undefined') {
    return { preferredSide: null, ageBand: null, tummyReaction: null }
  }
  try {
    return {
      preferredSide: read<PreferredSide>(KEYS.preferredSide, ['left', 'right', 'unknown']),
      ageBand: read<AgeBand>(KEYS.ageBand, ['under3m', 'from3m']),
      tummyReaction: read<TummyReaction>(KEYS.tummyReaction, ['enjoys', 'struggles', 'notYet']),
    }
  } catch {
    return { preferredSide: null, ageBand: null, tummyReaction: null }
  }
}

function read<T extends string>(key: string, allowed: readonly T[]): T | null {
  const value = window.sessionStorage.getItem(key)
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : null
}
