import { describe, expect, it } from 'vitest'
import { analyzeProbabilityMap, imageDataToTensor } from './analyze'
import { MASK_SIZE } from './measurement'
import { measure } from './measurement'
import { checkMaskQuality } from './quality'

// 합성 마스크 유틸 — 타원과 절단(납작한 부분)으로 스펙 §4의 각 검사 항목을 자극한다.

function blank(): Uint8Array {
  return new Uint8Array(MASK_SIZE * MASK_SIZE)
}

function drawEllipse(
  mask: Uint8Array,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  cut?: { angleDeg: number; distance: number },
): Uint8Array {
  const cutDx = cut ? Math.cos((cut.angleDeg * Math.PI) / 180) : 0
  const cutDy = cut ? Math.sin((cut.angleDeg * Math.PI) / 180) : 0
  for (let y = 0; y < MASK_SIZE; y++) {
    for (let x = 0; x < MASK_SIZE; x++) {
      const u = (x - cx) / rx
      const v = (y - cy) / ry
      if (u * u + v * v > 1) continue
      if (cut && (x - cx) * cutDx + (y - cy) * cutDy > cut.distance) continue
      mask[y * MASK_SIZE + x] = 1
    }
  }
  return mask
}

function countPixels(mask: Uint8Array): number {
  let n = 0
  for (const v of mask) if (v) n++
  return n
}

function quality(mask: Uint8Array) {
  return checkMaskQuality(mask, countPixels(mask), measure(mask))
}

// 래스터화된 타원은 축 길이가 반픽셀씩 깎이므로 CI가 80을 안전하게 넘도록 rx를 잡는다.
const centered = () => drawEllipse(blank(), 127.5, 127.5, 82, 100)

describe('checkMaskQuality — 스펙 §4 다섯 항목', () => {
  it('화면을 알맞게 채운 중앙 타원은 전부 통과한다', () => {
    const report = quality(centered())
    expect(report.checks).toEqual({
      areaRatio: 'pass',
      dominance: 'pass',
      solidity: 'pass',
      centerOffset: 'pass',
      measurementValidity: 'pass',
    })
    expect(report.grade).toBe('pass')
  })

  it('너무 작은 마스크는 면적비 실패, 조금 작은 마스크는 경계다', () => {
    expect(quality(drawEllipse(blank(), 127.5, 127.5, 30, 35)).checks.areaRatio).toBe('fail')
    const edge = quality(drawEllipse(blank(), 127.5, 127.5, 55, 60))
    expect(edge.checks.areaRatio).toBe('edge')
    expect(edge.grade).toBe('edge')
  })

  it('떨어져 있는 오검출 덩어리는 성분 지배율을 떨어뜨린다', () => {
    const component = centered()
    const satellite = drawEllipse(blank(), 45, 45, 30, 32)
    const main = countPixels(component)
    const total = main + countPixels(satellite)
    const report = checkMaskQuality(component, total, measure(component))
    expect(main / total).toBeLessThan(0.9)
    expect(main / total).toBeGreaterThanOrEqual(0.8)
    expect(report.checks.dominance).toBe('edge')
  })

  it('십자형처럼 오목한 마스크는 솔리디티 실패다', () => {
    const mask = blank()
    for (let y = 48; y < 208; y++) {
      for (let x = 108; x < 148; x++) mask[y * MASK_SIZE + x] = 1
    }
    for (let y = 108; y < 148; y++) {
      for (let x = 48; x < 208; x++) mask[y * MASK_SIZE + x] = 1
    }
    expect(quality(mask).checks.solidity).toBe('fail')
  })

  it('중심 이탈률은 이탈 정도에 따라 통과·경계·실패로 갈린다', () => {
    expect(quality(drawEllipse(blank(), 127.5, 127.5, 80, 100)).checks.centerOffset).toBe('pass')
    expect(quality(drawEllipse(blank(), 85, 127.5, 70, 90)).checks.centerOffset).toBe('edge')
    const far = quality(drawEllipse(blank(), 58, 127.5, 55, 90))
    expect(far.checks.centerOffset).toBe('fail')
    expect(far.grade).toBe('fail')
  })

  it('해부학적으로 불가능한 측정값은 타당성 실패다', () => {
    const report = quality(drawEllipse(blank(), 127.5, 127.5, 110, 40))
    expect(report.checks.measurementValidity).toBe('fail')
    expect(report.grade).toBe('fail')
  })

  it('빈 마스크는 실패다', () => {
    expect(quality(blank()).grade).toBe('fail')
  })
})

function probabilityFrom(mask: Uint8Array): Float32Array {
  const probability = new Float32Array(mask.length)
  for (let i = 0; i < mask.length; i++) probability[i] = mask[i] ? 0.9 : 0.1
  return probability
}

describe('analyzeProbabilityMap — 파이프라인', () => {
  it('CI 80 부근의 대칭 타원은 동글이로 판정한다', () => {
    const result = analyzeProbabilityMap(probabilityFrom(centered()))
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.type).toBe('donggeuri')
    expect(result.quality).toBe('pass')
    expect(result.preferredSide).toBe('unknown')
  })

  it('뒤통수 왼쪽이 납작한 마스크는 따옴이 + 왼쪽 선호로 판정한다', () => {
    // "코가 위로" 규약에서 아래-왼쪽(120°) 방향 절단 = 아기 왼쪽 뒤통수가 납작한 경우
    const mask = drawEllipse(blank(), 127.5, 127.5, 82, 100, { angleDeg: 120, distance: 75 })
    const result = analyzeProbabilityMap(probabilityFrom(mask))
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.type).toBe('ttaomi')
    expect(result.preferredSide).toBe('left')
  })

  it('뒤통수 오른쪽이 납작하면 오른쪽 선호다', () => {
    const mask = drawEllipse(blank(), 127.5, 127.5, 82, 100, { angleDeg: 60, distance: 75 })
    const result = analyzeProbabilityMap(probabilityFrom(mask))
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.type).toBe('ttaomi')
    expect(result.preferredSide).toBe('right')
  })

  it('작은 오검출 성분은 최대 성분만 남겨 판정하고, 품질 실패면 폴백 신호를 준다', () => {
    const withSatellite = centered()
    drawEllipse(withSatellite, 30, 30, 8, 8)
    const ok = analyzeProbabilityMap(probabilityFrom(withSatellite))
    expect(ok.status).toBe('ok')

    const tiny = drawEllipse(blank(), 127.5, 127.5, 30, 35)
    const fail = analyzeProbabilityMap(probabilityFrom(tiny))
    expect(fail.status).toBe('quality-fail')
    if (fail.status === 'quality-fail') {
      expect(fail.report.checks.areaRatio).toBe('fail')
    }
  })
})

describe('imageDataToTensor', () => {
  it('RGBA를 0~1 RGB 텐서로 바꾼다', () => {
    const data = new Uint8ClampedArray(MASK_SIZE * MASK_SIZE * 4)
    data[0] = 255
    data[1] = 128
    data[2] = 0
    data[3] = 255
    const tensor = imageDataToTensor({ data, width: MASK_SIZE, height: MASK_SIZE } as ImageData)
    expect(tensor).toHaveLength(MASK_SIZE * MASK_SIZE * 3)
    expect(tensor[0]).toBeCloseTo(1)
    expect(tensor[1]).toBeCloseTo(128 / 255)
    expect(tensor[2]).toBe(0)
  })
})
