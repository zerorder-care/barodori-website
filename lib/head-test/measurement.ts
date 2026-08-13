// head_measurement_service.dart (0e2467a3) 직역.
// 컨투어 추출(렌더링 전용)은 스파이크 범위에서 제외했다.

export const MASK_SIZE = 256;
export const CI_NORMAL_MIN = 75.0;
export const CI_NORMAL_MAX = 85.0;
export const CVAI_NORMAL_THRESHOLD = 3.5;

export interface HeadMeasurementResult {
  ci: number;
  cvai: number;
  ap: number;
  ml: number;
  d1: number;
  d2: number;
  center: { x: number; y: number };
  isCiNormal: boolean;
  isCvaiNormal: boolean;
}

// Dart의 double.round()는 절반을 0에서 먼 쪽으로 올림(-0.5 → -1).
// JS Math.round는 +∞ 쪽(-0.5 → -0)이라 음수에서 어긋나므로 부호 분리.
const dartRound = (v: number): number => (v < 0 ? -Math.round(-v) : Math.round(v));

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

export function measure(binaryMask: Uint8Array): HeadMeasurementResult | null {
  if (binaryMask.length !== MASK_SIZE * MASK_SIZE) return null;

  // 1. Area centroid (전체 마스크 픽셀 무게중심)
  let cx = 0, cy = 0, count = 0;
  for (let i = 0; i < binaryMask.length; i++) {
    if (!binaryMask[i]) continue;
    cx += i % MASK_SIZE;
    cy += Math.floor(i / MASK_SIZE);
    count++;
  }
  if (count === 0) return null;
  cx /= count;
  cy /= count;

  // 2. Ray-trace: AP (수직), ML (수평)
  const ap = rayTraceLength(binaryMask, cx, cy, Math.PI / 2);
  const ml = rayTraceLength(binaryMask, cx, cy, 0);
  if (ap < 5 || ml < 5) return null;

  // 3. CI
  const ci = (ml / ap) * 100;

  // 4. CVAI 대각선 (수직 AP축 기준 ±30°)
  const apAngle = Math.PI / 2;
  const offsetRad = (30 * Math.PI) / 180;
  const d1 = rayTraceLength(binaryMask, cx, cy, apAngle + offsetRad);
  const d2 = rayTraceLength(binaryMask, cx, cy, apAngle - offsetRad);

  const maxD = Math.max(d1, d2);
  const cvai = maxD > 0 ? (Math.abs(d1 - d2) / maxD) * 100 : 0.0;

  return {
    ci: clamp(ci, 70.0, 110.0),
    cvai: clamp(cvai, 0.0, 20.0),
    ap,
    ml,
    d1,
    d2,
    center: { x: cx, y: cy },
    isCiNormal: ci >= CI_NORMAL_MIN && ci <= CI_NORMAL_MAX,
    isCvaiNormal: cvai < CVAI_NORMAL_THRESHOLD,
  };
}

/// 중심에서 angle 방향 양쪽으로 가장 먼 마스크 픽셀까지의 전체 길이.
/// 마스크 내부 구멍을 건너뛰고 최외곽까지 측정한다.
function rayTraceLength(mask: Uint8Array, cx: number, cy: number, angle: number): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  let fwd = 0;
  for (let r = 0; r < MASK_SIZE; r += 0.5) {
    const x = dartRound(cx + r * dx);
    const y = dartRound(cy + r * dy);
    if (x < 0 || x >= MASK_SIZE || y < 0 || y >= MASK_SIZE) break;
    if (mask[y * MASK_SIZE + x]) fwd = r;
  }

  let bwd = 0;
  for (let r = 0; r < MASK_SIZE; r += 0.5) {
    const x = dartRound(cx - r * dx);
    const y = dartRound(cy - r * dy);
    if (x < 0 || x >= MASK_SIZE || y < 0 || y >= MASK_SIZE) break;
    if (mask[y * MASK_SIZE + x]) bwd = r;
  }

  return fwd + bwd;
}
