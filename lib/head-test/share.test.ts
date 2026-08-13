import { describe, expect, it } from 'vitest'
import { resolveResultEntry, resolveViewSource, sharePathFor } from './share'

describe('sharePathFor', () => {
  it('결과 경로에 공유 UTM만 붙인다', () => {
    expect(sharePathFor('ko', 'jjanggu')).toBe(
      '/ko/head-test/result/jjanggu?utm_source=head_test&utm_medium=share',
    )
  })
})

describe('resolveResultEntry — own/share/direct 구분 (공유 플로우 스펙 §4)', () => {
  it('utm_medium=share면 기기 기록과 무관하게 공유 유입이다', () => {
    expect(resolveResultEntry('?utm_source=head_test&utm_medium=share', 'ttaomi', 'ttaomi')).toBe(
      'share',
    )
  })

  it('이 기기에서 같은 유형으로 완료했으면 자기 결과다', () => {
    expect(resolveResultEntry('', 'ttaomi', 'ttaomi')).toBe('own')
  })

  it('완료 기록이 없거나 다른 유형 페이지를 보면 직접 진입이다', () => {
    expect(resolveResultEntry('', null, 'ttaomi')).toBe('direct')
    expect(resolveResultEntry('', 'ttaomi', 'banguri')).toBe('direct')
  })
})

describe('resolveViewSource', () => {
  it('utm_medium 값이 있으면 그 값, 없으면 direct다', () => {
    expect(resolveViewSource('?utm_source=head_test&utm_medium=instagram')).toBe('instagram')
    expect(resolveViewSource('')).toBe('direct')
  })
})
