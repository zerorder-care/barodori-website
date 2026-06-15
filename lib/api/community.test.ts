import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCommunityPostDetail, listCommunityPosts } from './community'

describe('community API adapter', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it('filters test-like public posts from the marketing community surface', async () => {
    process.env = {
      ...originalEnv,
      BARODORI_API_BASE_URL: 'https://api.test',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          code: 0,
          data: {
            posts: [
              publicPost({
                id: 'bad-short',
                title: 'ㅁ',
                contentPreview: '물리치료 기록 · 도리도리 외 2개 · 총 10회 · 10분\n\nㅁ',
              }),
              publicPost({
                id: 'bad-dev',
                title: '안녕하세요',
                contentPreview: '개발자입니다',
              }),
              publicPost({
                id: 'good',
                title: '터미타임을 너무 싫어할 때는 어떻게 하세요?',
                contentPreview: '하루에 조금씩 해보는데 울음이 길어져서 고민이에요.',
              }),
            ],
            nextOffset: null,
            hasMore: false,
          },
        }),
      ),
    )

    const result = await listCommunityPosts()

    expect(result.posts).toHaveLength(1)
    expect(result.posts[0]).toMatchObject({
      id: 'good',
      title: '터미타임을 너무 싫어할 때는 어떻게 하세요?',
    })
  })

  it('does not expose test-like public post details', async () => {
    process.env = {
      ...originalEnv,
      BARODORI_API_BASE_URL: 'https://api.test',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.endsWith('/comments?limit=20')) {
          return jsonResponse({ code: 0, data: { comments: [], hasMore: false } })
        }
        return jsonResponse({
          code: 0,
          data: publicPost({
            id: 'bad-dev',
            title: '안녕하세요',
            contentPreview: '개발자입니다',
          }),
        })
      }),
    )

    await expect(getCommunityPostDetail('bad-dev')).resolves.toBeNull()
  })
})

function publicPost(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'post-1',
    category: 'hope_diary',
    title: '터미타임을 너무 싫어할 때는 어떻게 하세요?',
    contentPreview: '하루에 조금씩 해보는데 울음이 길어져서 고민이에요.',
    author: { nickname: '도리맘' },
    thumbnailImage: null,
    viewCount: 1,
    likeCount: 0,
    commentCount: 0,
    isAnswered: false,
    createdAt: '2026-06-12T01:18:22.145533Z',
    updatedAt: '2026-06-12T01:18:22.145533Z',
    ...overrides,
  }
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
