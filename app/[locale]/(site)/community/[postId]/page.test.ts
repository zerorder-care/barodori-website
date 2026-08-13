import { beforeEach, describe, expect, it, vi } from 'vitest'

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

import CommunityDetailPage, { generateMetadata } from './page'

beforeEach(() => {
  notFoundMock.mockClear()
})

describe('CommunityDetailPage', () => {
  it('returns empty metadata while the public community surface is disabled', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ locale: 'ko', postId: 'community-1' }) }),
    ).resolves.toEqual({})
  })

  it('returns 404 for direct access', async () => {
    await expect(
      CommunityDetailPage({ params: Promise.resolve({ locale: 'ko', postId: 'community-1' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })
})
