import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('storeLinks', () => {
  const orig = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...orig }
    delete process.env.NEXT_PUBLIC_IOS_APP_URL
    delete process.env.NEXT_PUBLIC_ANDROID_APP_URL
  })

  it('ships store links by default, so the app is live', async () => {
    const { isAppLive, getStoreLinks } = await import('./storeLinks')
    const { ios, android } = getStoreLinks()
    expect(ios).toContain('apps.apple.com')
    expect(android).toContain('play.google.com')
    expect(isAppLive()).toBe(true)
  })

  it('env vars override the default store links', async () => {
    process.env.NEXT_PUBLIC_IOS_APP_URL = 'https://apps.apple.com/x'
    process.env.NEXT_PUBLIC_ANDROID_APP_URL = 'https://play.google.com/x'
    const { getStoreLinks, isAppLive } = await import('./storeLinks')
    expect(getStoreLinks()).toEqual({
      ios: 'https://apps.apple.com/x',
      android: 'https://play.google.com/x',
    })
    expect(isAppLive()).toBe(true)
  })
})
