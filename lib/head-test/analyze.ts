import { measure, MASK_SIZE, type HeadMeasurementResult } from './measurement'
import { applyLargestBlob } from './postprocess'
import { checkMaskQuality, type QualityReport } from './quality'
import { classifyMeasurement } from './scoring'
import type { HeadType, PreferredSide } from './types'

// 사진 판정 파이프라인 — 판정 기준 스펙 §2·§4.
// threshold 0.5 이진화 → 최대 연결 성분 → 품질 검사 → 축 측정 → 유형 판정.
// 사진과 마스크는 이 모듈 밖으로 나가지 않으며 어디에도 저장·전송하지 않는다.

export type PhotoAnalysis =
  | {
      status: 'ok'
      type: HeadType
      preferredSide: PreferredSide
      /** edge면 "간신히 통과" — 조준선이 꺼져 있었다면 재촬영 권유 분기를 탄다 */
      quality: 'pass' | 'edge'
      measurement: HeadMeasurementResult
    }
  | { status: 'quality-fail'; report: QualityReport }

/** 캔버스에서 뽑은 256×256 RGBA ImageData를 모델 입력([1,256,256,3], 0~1)으로 바꾼다. */
export function imageDataToTensor(image: ImageData): Float32Array {
  const input = new Float32Array(MASK_SIZE * MASK_SIZE * 3)
  const { data } = image
  for (let i = 0; i < MASK_SIZE * MASK_SIZE; i++) {
    input[i * 3] = data[i * 4] / 255
    input[i * 3 + 1] = data[i * 4 + 1] / 255
    input[i * 3 + 2] = data[i * 4 + 2] / 255
  }
  return input
}

/** 모델 확률맵(256×256)을 받아 품질 검사와 유형 판정까지 수행한다. 순수 함수라 테스트 가능하다. */
export function analyzeProbabilityMap(probability: Float32Array): PhotoAnalysis {
  const mask = new Uint8Array(MASK_SIZE * MASK_SIZE)
  let totalMaskPixels = 0
  for (let i = 0; i < mask.length; i++) {
    if (probability[i] >= 0.5) {
      mask[i] = 1
      totalMaskPixels++
    }
  }

  const component = applyLargestBlob(mask)
  const measurement = measure(component)
  const report = checkMaskQuality(component, totalMaskPixels, measurement)
  if (report.grade === 'fail' || measurement === null) {
    return { status: 'quality-fail', report }
  }

  const type = classifyMeasurement(measurement.ci, measurement.cvai)
  return {
    status: 'ok',
    type,
    preferredSide: preferredSideOf(type, measurement),
    quality: report.grade,
    measurement,
  }
}

/**
 * 따옴이 방향 판정 (판정 기준 스펙 §2).
 * d1은 화면 아래-왼쪽(뒤통수 왼쪽), d2는 아래-오른쪽 대각선이고, "코가 위로" 정수리 뷰에서
 * 화면 왼쪽이 아기 왼쪽이다. 짧은 대각선이 지나는 뒤통수 쪽이 납작한 쪽 = 선호하던 쪽.
 * 따옴이가 아니면 대각선 차이가 잡음 수준이라 방향을 남기지 않는다.
 */
function preferredSideOf(type: HeadType, measurement: HeadMeasurementResult): PreferredSide {
  if (type !== 'ttaomi') return 'unknown'
  if (measurement.d1 === measurement.d2) return 'unknown'
  return measurement.d1 < measurement.d2 ? 'left' : 'right'
}
