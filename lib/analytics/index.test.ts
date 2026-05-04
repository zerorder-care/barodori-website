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
})
