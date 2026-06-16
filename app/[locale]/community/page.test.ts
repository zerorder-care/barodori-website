import { beforeEach, describe, expect, it, vi } from 'vitest'

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

import CommunityPage, { generateMetadata } from './page'

beforeEach(() => {
  notFoundMock.mockClear()
})

describe('CommunityPage', () => {
  it('returns empty metadata while the public community surface is disabled', async () => {
    await expect(generateMetadata({ params: Promise.resolve({ locale: 'ko' }) })).resolves.toEqual({})
  })

  it('returns 404 for direct access', async () => {
    await expect(CommunityPage({ params: Promise.resolve({ locale: 'ko' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })
})
