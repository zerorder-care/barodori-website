type GtagFn = (cmd: 'event', name: string, props?: Record<string, unknown>) => void
type AmplitudeApi = {
  track: (name: string, props?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    gtag?: GtagFn
    amplitude?: AmplitudeApi
  }
}

// 앰플리튜드 SDK는 비동기로 로드되므로, 준비 전에 발생한 이벤트(첫 page_view 등)를
// 잠깐 버퍼에 담았다가 초기화 직후 flushAmplitude()로 내보낸다.
const PENDING_LIMIT = 50
let pending: Array<[string, Record<string, unknown> | undefined]> = []

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    window.gtag?.('event', event, props)
  } catch {
    /* swallow */
  }
  try {
    if (window.amplitude) {
      window.amplitude.track(event, props)
    } else if (pending.length < PENDING_LIMIT) {
      pending.push([event, props])
    }
  } catch {
    /* swallow */
  }
  if (process.env.NODE_ENV === 'development') {
    // 개발 모드에서 콘솔로 확인
    console.debug('[analytics]', event, props)
  }
}

/** SDK 초기화 직후 버퍼에 쌓인 이벤트를 순서대로 내보낸다. */
export function flushAmplitude(): void {
  if (typeof window === 'undefined' || !window.amplitude) return
  const queued = pending
  pending = []
  for (const [event, props] of queued) {
    try {
      window.amplitude.track(event, props)
    } catch {
      /* swallow */
    }
  }
}

export function __resetForTest(): void {
  pending = []
}
