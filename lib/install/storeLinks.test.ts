import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('storeLinks', () => {
  const orig = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...orig }
    delete process.env.NEXT_PUBLIC_IOS_APP_URL
    delete process.env.NEXT_PUBLIC_ANDROID_APP_URL
  })

  it('isAppLive=false when both unset', async () => {
    const { isAppLive } = await import('./storeLinks')
    expect(isAppLive()).toBe(false)
  })

  it('isAppLive=false when only one set', async () => {
    process.env.NEXT_PUBLIC_IOS_APP_URL = 'https://apps.apple.com/x'
    const { isAppLive } = await import('./storeLinks')
    expect(isAppLive()).toBe(false)
  })

  it('isAppLive=true when both set', async () => {
    process.env.NEXT_PUBLIC_IOS_APP_URL = 'https://apps.apple.com/x'
    process.env.NEXT_PUBLIC_ANDROID_APP_URL = 'https://play.google.com/x'
    const { isAppLive } = await import('./storeLinks')
    expect(isAppLive()).toBe(true)
  })
})
