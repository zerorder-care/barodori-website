import { describe, expect, it } from 'vitest'
import koMessages from '@/messages/ko.json'
import enMessages from '@/messages/en.json'
import { personalizeTip, type SideCopy } from './tips'
import { headTypes } from './types'

const koSide = koMessages.headTest.result.side as SideCopy
const enSide = enMessages.headTest.result.side as SideCopy

describe('personalizeTip — {쪽} 치환 (카피 스펙 §5)', () => {
  const tip = koMessages.headTest.result.types.ttaomi.tips.under3m[0].body

  it('선호 방향의 반대쪽 단어로 치환한다', () => {
    expect(personalizeTip(tip, koSide, 'left')).toContain('오른쪽에서')
    expect(personalizeTip(tip, koSide, 'right')).toContain('왼쪽에서')
  })

  it('방향 정보가 없으면 문형별 폴백을 쓴다', () => {
    expect(personalizeTip(tip, koSide, 'unknown')).toContain('양쪽에서 번갈아')
    expect(personalizeTip(tip, koSide, null)).toContain('양쪽에서 번갈아')
  })

  it('영문 팁도 같은 규칙으로 치환된다', () => {
    const enTip = enMessages.headTest.result.types.ttaomi.tips.under3m[0].body
    expect(personalizeTip(enTip, enSide, 'left')).toContain('on the right side')
    expect(personalizeTip(enTip, enSide, null)).toContain('on both sides in turn')
  })

  it.each([
    ['ko', koMessages, koSide],
    ['en', enMessages, enSide],
  ] as const)('%s 전체 팁이 어떤 분기에서도 토큰을 남기지 않는다', (_, messages, side) => {
    for (const type of headTypes) {
      const { tips } = messages.headTest.result.types[type]
      for (const band of ['under3m', 'from3m'] as const) {
        expect(tips[band]).toHaveLength(2)
        for (const tip of tips[band]) {
          for (const preferred of ['left', 'right', 'unknown', null] as const) {
            expect(personalizeTip(tip.body, side, preferred)).not.toContain(side.token)
          }
        }
      }
    }
  })
})
