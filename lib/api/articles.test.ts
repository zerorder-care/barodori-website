import { afterEach, describe, expect, it, vi } from 'vitest'
import { getArticlePost, listArticlePosts } from './articles'

describe('article API adapter', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it('loads articles from official community content', async () => {
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
              id: 'post-1',
              category: 'official_content',
              title: '집에서 따라 하는 터미타임 운동',
              contentPreview: '터미타임을 짧게 자주 시도하는 방법입니다.',
              author: { nickname: '바로도리' },
              thumbnailImage: 'https://cdn.test/article.png',
              viewCount: 10,
              likeCount: 3,
              commentCount: 1,
              isAnswered: false,
              createdAt: '2026-05-14T09:00:00+09:00',
            },
          ],
          nextOffset: 20,
          hasMore: true,
        },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await listArticlePosts({ locale: 'ko', q: '터미타임', limit: 20 })

    expect(result.source).toBe('api')
    expect(result.hasMore).toBe(true)
    expect(result.nextOffset).toBe(20)
    expect(result.articles[0]).toMatchObject({
      slug: 'post-1',
      title: '집에서 따라 하는 터미타임 운동',
      category: 'exercise',
      author: '바로도리',
      heroImage: 'https://cdn.test/article.png',
    })
    const requestedUrl = String(fetchMock.mock.calls[0][0])
    expect(requestedUrl).toContain('/api/v1/community/public/posts?')
    expect(requestedUrl).toContain('category=official_content')
  })

  it('loads article detail from the public community post endpoint', async () => {
    process.env = {
      ...originalEnv,
      BARODORI_API_BASE_URL: 'https://api.test',
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(input).toBeDefined()
      return jsonResponse({
        code: 0,
        data: {
          id: 'post-1',
          category: 'official_content',
          title: '우리 아이 두상 체크',
          contentPreview: '두상 변화를 확인하는 방법입니다.',
          content: [
            { type: 'text', content: '## 두상 체크 방법\n\n정면과 옆면을 함께 확인합니다.' },
            { type: 'image', imageUrl: 'https://cdn.test/detail.png', alt: '두상 체크 화면' },
          ],
          author: { nickname: '바로도리' },
          thumbnailImage: null,
          viewCount: 10,
          likeCount: 3,
          commentCount: 1,
          isAnswered: false,
          createdAt: '2026-05-14T09:00:00+09:00',
          updatedAt: '2026-05-14T10:00:00+09:00',
        },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const article = await getArticlePost({ locale: 'ko', slug: 'post-1' })

    expect(article).toMatchObject({
      slug: 'post-1',
      title: '우리 아이 두상 체크',
      category: 'head-shape',
      heroImage: '/og/default.png',
      updatedAt: '2026-05-14',
    })
    expect(article?.body).toContain('## 두상 체크 방법')
    expect(article?.body).toContain('![두상 체크 화면](https://cdn.test/detail.png)')
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.test/api/v1/community/public/posts/post-1')
  })
})

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
