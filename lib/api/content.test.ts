import { afterEach, describe, expect, it, vi } from 'vitest'
import { getFaqContent, getNewsroomPost, listNewsroomPosts } from './content'

describe('content API adapter', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it('maps newsroom list items without external links as internal posts', async () => {
    process.env = {
      ...originalEnv,
      BARODORI_API_BASE_URL: 'https://api.test',
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(input).toBeDefined()
      return jsonResponse({
        code: 0,
        data: {
          posts: [
            {
              id: 'news-1',
              category: { value: 'notice', label: '공지' },
              title: '바로도리 공지',
              excerpt: '공지 본문 요약입니다.',
              thumbnailImage: null,
              externalUrl: null,
              publishedAt: '2026-05-14T09:00:00+09:00',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 9,
        },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await listNewsroomPosts()

    expect(result.posts[0]).toMatchObject({
      id: 'news-1',
      category: 'notice',
      title: '바로도리 공지',
      publishedAt: '2026-05-14',
    })
    expect(result.posts[0].href).toBeUndefined()
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/v1/content/newsroom?')
  })

  it('loads newsroom detail content', async () => {
    process.env = {
      ...originalEnv,
      BARODORI_API_BASE_URL: 'https://api.test',
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(input).toBeDefined()
      return jsonResponse({
        code: 0,
        data: {
          id: 'news-1',
          category: { value: 'press', label: '보도자료' },
          title: '바로도리 보도자료',
          excerpt: '보도자료 요약입니다.',
          content: [
            { type: 'text', content: '## 제목\n\n본문입니다.' },
            { type: 'image', imageUrl: 'https://cdn.test/news.png', alt: '보도자료 이미지' },
          ],
          thumbnailImage: 'https://cdn.test/thumb.png',
          externalUrl: null,
          publishedAt: '2026-05-14T09:00:00+09:00',
        },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const post = await getNewsroomPost('news-1')

    expect(post).toMatchObject({
      id: 'news-1',
      category: 'press',
      title: '바로도리 보도자료',
      publishedAt: '2026-05-14',
      thumbnail: 'https://cdn.test/thumb.png',
      content: [
        { type: 'text', content: '## 제목\n\n본문입니다.' },
        { type: 'image', imageUrl: 'https://cdn.test/news.png', alt: '보도자료 이미지' },
      ],
    })
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.test/api/v1/content/newsroom/news-1')
  })

  it('replaces unsafe automatic workout guidance from the FAQ API', async () => {
    process.env = {
      ...originalEnv,
      BARODORI_API_BASE_URL: 'https://api.test',
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/api/v1/content/faq-categories')) {
        return jsonResponse({
          code: 0,
          data: {
            categories: [{ id: 'workout', slug: 'workout', label: '운동', sortOrder: 0 }],
          },
        })
      }
      return jsonResponse({
        code: 0,
        data: {
          faqs: [
            {
              id: 'faq-1',
              category: { id: 'workout', slug: 'workout', label: '운동', sortOrder: 0 },
              question: '어떤 운동을 해야하나요?',
              answer: '아이의 사경 유형과 방향에 따라 맞춤형 운동이 자동으로 추천됩니다. 홈 화면의 운동 시작 버튼을 눌러 시작하세요.',
              sortOrder: 0,
            },
          ],
        },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getFaqContent()

    expect(result.items[0].answer).toContain('자동 처방하지 않아요')
    expect(result.items[0].answer).toContain('담당 전문의·치료사와 정한 운동')
    expect(result.items[0].answer).not.toContain('자동으로 추천')
  })
})

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
