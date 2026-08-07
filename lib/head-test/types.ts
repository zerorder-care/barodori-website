export const headTypes = ['ttaomi', 'banguri', 'ppyojogi', 'jjanggu', 'donggeuri'] as const

export type HeadType = (typeof headTypes)[number]

export function isHeadType(value: string): value is HeadType {
  return (headTypes as readonly string[]).includes(value)
}

/** 아기 입장 기준 선호(잘 보던) 방향. 사진·문항 두 경로가 같은 필드를 쓴다. */
export type PreferredSide = 'left' | 'right' | 'unknown'

/** 놀이 팁 분기용 월령 구분. 판정에는 쓰지 않는다. */
export type AgeBand = 'under3m' | 'from3m'

/** 엎드려 놀기(문항 6) 응답. 놀이 팁 선택 로직에 쓴다. */
export type TummyReaction = 'enjoys' | 'struggles' | 'notYet'
