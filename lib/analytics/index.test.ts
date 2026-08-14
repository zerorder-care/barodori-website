import { describe, it, expect, beforeEach, vi } from 'vitest'
import { track, __resetForTest } from './index'

describe('analytics track', () => {
  beforeEach(() => {
    __resetForTest()
    delete (window as unknown as Record<string, unknown>).gtag
    delete (window as unknown as Record<string, unknown>).amplitude
  })

  it('no-ops when no providers configured', () => {
    expect(() => track('test_event', { foo: 'bar' })).not.toThrow()
  })

  it('forwards to gtag if present', () => {
    const gtag = vi.fn()
    ;(window as unknown as { gtag: typeof gtag }).gtag = gtag
    track('cta_install_click', { surface: 'home' })
    expect(gtag).toHaveBeenCalledWith('event', 'cta_install_click', { surface: 'home' })
  })

  it('forwards to amplitude if present', () => {
    const amp = { track: vi.fn() }
    ;(window as unknown as { amplitude: typeof amp }).amplitude = amp
    track('cta_install_click', { surface: 'home' })
    expect(amp.track).toHaveBeenCalledWith('cta_install_click', { surface: 'home' })
  })

  it('SDK 준비 전 이벤트를 버퍼에 담았다가 flush 때 순서대로 내보낸다', async () => {
    const { flushAmplitude } = await import('./index')
    track('head_test_view', { locale: 'ko' })
    track('head_test_start', { path: 'questions' })

    const amp = { track: vi.fn() }
    ;(window as unknown as { amplitude: typeof amp }).amplitude = amp
    flushAmplitude()

    expect(amp.track).toHaveBeenNthCalledWith(1, 'head_test_view', { locale: 'ko' })
    expect(amp.track).toHaveBeenNthCalledWith(2, 'head_test_start', { path: 'questions' })

    amp.track.mockClear()
    flushAmplitude()
    expect(amp.track).not.toHaveBeenCalled()
  })
})
