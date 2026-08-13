import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { measure } from './measurement'
import { process as postProcess, type PostProcessMode } from './postprocess'
import { classifyMeasurement } from './scoring'

// 스파이크에서 확정한 Dart 골든(테스트 마스크 6종 × 후처리 4모드 = 24케이스)과의 동등성을 잠근다.
// cos() 1-ulp 차이로 d1이 레이 스텝(0.5) 하나, CVAI가 최대 0.27 어긋날 수 있다는 것까지가
// 스파이크에서 검증된 결과이며, 그 범위를 넘는 변화는 이 테스트가 실패로 잡는다.

type GoldenEntry = {
  case: string
  mode: PostProcessMode
  result: {
    ci: number
    cvai: number
    ap: number
    ml: number
    d1: number
    d2: number
    cx: number
    cy: number
    ciNormal: boolean
    cvaiNormal: boolean
  } | null
}

const fixturesDir = join(process.cwd(), 'lib', 'head-test', 'fixtures')
const golden: GoldenEntry[] = JSON.parse(readFileSync(join(fixturesDir, 'dart-golden.json'), 'utf8'))

const masks = new Map<string, Uint8Array>()
function maskOf(name: string): Uint8Array {
  let mask = masks.get(name)
  if (!mask) {
    mask = new Uint8Array(readFileSync(join(fixturesDir, `${name}.bin`)))
    masks.set(name, mask)
  }
  return mask
}

describe('TS 포트 ↔ Dart 골든 동등성', () => {
  it('골든이 24케이스를 모두 담고 있다', () => {
    expect(golden).toHaveLength(24)
  })

  it.each(golden.map((entry) => [entry.case, entry.mode, entry] as const))(
    '%s / %s',
    (_name, mode, entry) => {
      const processed = postProcess(maskOf(entry.case), mode)
      const result = measure(processed)

      if (entry.result === null) {
        expect(result).toBeNull()
        return
      }
      expect(result).not.toBeNull()
      const r = result!

      expect(r.ci).toBeCloseTo(entry.result.ci, 9)
      expect(r.ap).toBeCloseTo(entry.result.ap, 9)
      expect(r.ml).toBeCloseTo(entry.result.ml, 9)
      expect(r.center.x).toBeCloseTo(entry.result.cx, 9)
      expect(r.center.y).toBeCloseTo(entry.result.cy, 9)
      // 레이 스텝 하나(0.5)와 그로 인한 CVAI 편차(≤0.27)는 스파이크에서 확인된 허용 범위다.
      expect(Math.abs(r.d1 - entry.result.d1)).toBeLessThanOrEqual(0.5)
      expect(Math.abs(r.d2 - entry.result.d2)).toBeLessThanOrEqual(0.5)
      expect(Math.abs(r.cvai - entry.result.cvai)).toBeLessThanOrEqual(0.3)

      expect(r.isCiNormal).toBe(entry.result.ciNormal)
      expect(r.isCvaiNormal).toBe(entry.result.cvaiNormal)
      // 최종 유형 판정까지 골든과 일치해야 한다.
      expect(classifyMeasurement(r.ci, r.cvai)).toBe(
        classifyMeasurement(entry.result.ci, entry.result.cvai),
      )
    },
  )
})
