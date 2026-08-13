import type { PreferredSide } from './types'

// 놀이 팁의 방향 치환 (카피 스펙 §5).
// 템플릿 토큰은 "잘 안 보던 쪽"이므로 저장된 선호 방향의 반대 단어로 바꾸고,
// 방향 정보가 없으면 문형별 폴백("양쪽에서 번갈아" 등)으로 치환한다.

export type SideCopy = {
  token: string
  left: string
  right: string
  fallbacks: string[][]
}

export function personalizeTip(
  text: string,
  side: SideCopy,
  preferredSide: PreferredSide | null | undefined,
): string {
  if (preferredSide === 'left' || preferredSide === 'right') {
    const word = preferredSide === 'left' ? side.right : side.left
    return text.split(side.token).join(word)
  }
  let result = text
  for (const [from, to] of side.fallbacks) {
    result = result.split(from).join(to)
  }
  return result
}
