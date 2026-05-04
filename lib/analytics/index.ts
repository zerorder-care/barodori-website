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

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    window.gtag?.('event', event, props)
  } catch {
    /* swallow */
  }
  try {
    window.amplitude?.track(event, props)
  } catch {
    /* swallow */
  }
  if (process.env.NODE_ENV === 'development') {
    // 개발 모드에서 콘솔로 확인
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props)
  }
}

export function __resetForTest(): void {
  /* placeholder; 모듈 상태 없음 */
}
