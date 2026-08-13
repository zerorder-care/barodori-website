import { sanityThresholds } from './constants'
import { MASK_SIZE, type HeadMeasurementResult } from './measurement'

// 마스크 품질 검사(sanity check) — 판정 기준 스펙 §4.
// 경계 구간은 하한 포함·상한 미포함으로 읽는다. 하나라도 실패면 품질 실패 폴백,
// 실패 없이 경계만 있으면 "간신히 통과"다.

export type QualityGrade = 'pass' | 'edge' | 'fail'

export type QualityCheckId =
  | 'areaRatio'
  | 'dominance'
  | 'solidity'
  | 'centerOffset'
  | 'measurementValidity'

export type QualityReport = {
  grade: QualityGrade
  checks: Record<QualityCheckId, QualityGrade>
}

export function checkMaskQuality(
  component: Uint8Array,
  totalMaskPixels: number,
  measurement: HeadMeasurementResult | null,
): QualityReport {
  const stats = componentStats(component)
  const t = sanityThresholds

  const checks: Record<QualityCheckId, QualityGrade> = {
    areaRatio: gradeAreaRatio(stats.pixels / (MASK_SIZE * MASK_SIZE)),
    dominance:
      totalMaskPixels === 0
        ? 'fail'
        : gradeLowerIsBad(stats.pixels / totalMaskPixels, t.dominance.passMin, t.dominance.edgeMin),
    solidity: gradeLowerIsBad(solidityOf(stats), t.solidity.passMin, t.solidity.edgeMin),
    centerOffset: gradeHigherIsBad(
      stats.pixels === 0 ? Number.POSITIVE_INFINITY : centerOffsetOf(stats),
      t.centerOffset.passMax,
      t.centerOffset.edgeMax,
    ),
    measurementValidity: gradeMeasurementValidity(measurement),
  }

  const grades = Object.values(checks)
  const grade: QualityGrade = grades.includes('fail')
    ? 'fail'
    : grades.includes('edge')
      ? 'edge'
      : 'pass'
  return { grade, checks }
}

function gradeAreaRatio(ratio: number): QualityGrade {
  const { passMin, passMax, edgeMin, edgeMax } = sanityThresholds.areaRatio
  if (ratio >= passMin && ratio < passMax) return 'pass'
  if ((ratio >= edgeMin && ratio < passMin) || (ratio >= passMax && ratio < edgeMax)) return 'edge'
  return 'fail'
}

function gradeLowerIsBad(value: number, passMin: number, edgeMin: number): QualityGrade {
  if (value >= passMin) return 'pass'
  if (value >= edgeMin) return 'edge'
  return 'fail'
}

function gradeHigherIsBad(value: number, passMax: number, edgeMax: number): QualityGrade {
  if (value <= passMax) return 'pass'
  if (value < edgeMax) return 'edge'
  return 'fail'
}

function gradeMeasurementValidity(measurement: HeadMeasurementResult | null): QualityGrade {
  if (measurement === null) return 'fail'
  const { ciMin, ciMax, cvaiMax } = sanityThresholds.measurementValidity
  // measure()는 CI·CVAI를 표시용 범위로 클램프하므로 타당성은 축 길이에서 다시 계산한 원값으로 본다.
  const rawCi = (measurement.ml / measurement.ap) * 100
  const maxD = Math.max(measurement.d1, measurement.d2)
  const rawCvai = maxD > 0 ? (Math.abs(measurement.d1 - measurement.d2) / maxD) * 100 : 0
  return rawCi >= ciMin && rawCi < ciMax && rawCvai < cvaiMax ? 'pass' : 'fail'
}

type ComponentStats = {
  pixels: number
  cx: number
  cy: number
  /** 행별 최소·최대 x — 볼록 껍질 계산용 경계점 */
  rowSpans: Array<{ y: number; minX: number; maxX: number }>
}

function componentStats(component: Uint8Array): ComponentStats {
  let pixels = 0
  let sumX = 0
  let sumY = 0
  const rowSpans: ComponentStats['rowSpans'] = []
  for (let y = 0; y < MASK_SIZE; y++) {
    let minX = -1
    let maxX = -1
    let rowCount = 0
    let rowSumX = 0
    for (let x = 0; x < MASK_SIZE; x++) {
      if (!component[y * MASK_SIZE + x]) continue
      if (minX < 0) minX = x
      maxX = x
      rowCount++
      rowSumX += x
    }
    if (minX >= 0) {
      rowSpans.push({ y, minX, maxX })
      pixels += rowCount
      sumX += rowSumX
      sumY += rowCount * y
    }
  }
  return {
    pixels,
    cx: pixels ? sumX / pixels : 0,
    cy: pixels ? sumY / pixels : 0,
    rowSpans,
  }
}

function centerOffsetOf(stats: ComponentStats): number {
  const mid = (MASK_SIZE - 1) / 2
  return Math.hypot(stats.cx - mid, stats.cy - mid) / MASK_SIZE
}

/** 성분 면적 ÷ 볼록 껍질 면적. 껍질은 행별 경계점의 모노톤 체인으로 만든다. */
function solidityOf(stats: ComponentStats): number {
  if (stats.pixels === 0) return 0
  const points: Array<[number, number]> = []
  for (const { y, minX, maxX } of stats.rowSpans) {
    // 픽셀을 단위 정사각형으로 보고 네 모서리를 후보점으로 넣어 픽셀 면적과 비교 가능하게 한다.
    points.push([minX, y], [minX, y + 1], [maxX + 1, y], [maxX + 1, y + 1])
  }
  const hull = convexHull(points)
  const hullArea = polygonArea(hull)
  if (hullArea <= 0) return 0
  return Math.min(1, stats.pixels / hullArea)
}

function convexHull(points: Array<[number, number]>): Array<[number, number]> {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (sorted.length <= 2) return sorted
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Array<[number, number]> = []
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop()
    }
    lower.push(p)
  }
  const upper: Array<[number, number]> = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop()
    }
    upper.push(p)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

function polygonArea(polygon: Array<[number, number]>): number {
  let area = 0
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i]
    const [x2, y2] = polygon[(i + 1) % polygon.length]
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area) / 2
}
