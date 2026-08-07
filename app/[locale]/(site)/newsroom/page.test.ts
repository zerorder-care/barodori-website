import { beforeEach, describe, expect, it, vi } from 'vitest'

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

import NewsroomPage, { generateMetadata } from './page'

beforeEach(() => {
  notFoundMock.mockClear()
})

describe('NewsroomPage', () => {
  it('returns empty metadata while the public newsroom surface is disabled', async () => {
    await expect(generateMetadata({ params: Promise.resolve({ locale: 'ko' }) })).resolves.toEqual({})
  })

  it('returns 404 for direct access', async () => {
    await expect(NewsroomPage({ params: Promise.resolve({ locale: 'ko' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })
})
