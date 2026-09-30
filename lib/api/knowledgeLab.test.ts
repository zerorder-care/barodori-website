import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EXERCISE_ATTACHMENT_ASSET_ID,
  EXERCISE_CONTENT_ID,
  EXERCISE_REVISION_ID,
  exerciseContent,
  headShapeLabCards,
  labFixtureEnvelope,
} from './__fixtures__/knowledgeLab'
import { getLabContent, labAssetUrl, listLabContents } from './knowledgeLab'

const originalEnv = process.env

type LabFetch = (url: string, init: RequestInit & { next?: unknown }) => Promise<Response>

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function withApiBase() {
  process.env = { ...originalEnv, BARODORI_API_BASE_URL: 'https://api.test' }
}

describe('knowledge lab client', () => {
  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it('reads the list envelope and sends the cache tag with a one day revalidate', async () => {
    withApiBase()
    const fetchMock = vi.fn<LabFetch>(async () =>
      jsonResponse(labFixtureEnvelope({ items: headShapeLabCards })),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab', kind: 'faq' })

    expect(result.error).toBeUndefined()
    expect(result.items).toHaveLength(headShapeLabCards.length)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(
      'https://api.test/api/v2/knowledge-lab/web/contents?market=KR&locale=ko&collection=head_shape_lab&kind=faq',
    )
    expect(init.next).toEqual({ revalidate: 86400, tags: ['lab-content'] })
    expect(init.cache).toBeUndefined()
  })

  it('returns an empty list with an error string when the request fails', async () => {
    withApiBase()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ code: 1040, message: 'content_not_found' }, 404)))

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab' })

    expect(result.items).toEqual([])
    expect(result.error).toBe('lab_api_http_404')
  })

  it('returns an empty list with an error string when the envelope code is not zero', async () => {
    withApiBase()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ code: 1011, message: 'invalid_query' })))

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab' })

    expect(result.items).toEqual([])
    expect(result.error).toBe('invalid_query')
  })

  it('returns an empty list without calling fetch when no api base url is configured', async () => {
    process.env = { ...originalEnv, BARODORI_API_BASE_URL: '', NEXT_PUBLIC_API_BASE_URL: '', VERCEL_URL: '' }
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab' })

    expect(result.items).toEqual([])
    expect(result.error).toBe('lab_api_base_url_missing')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reads the detail envelope', async () => {
    withApiBase()
    const fetchMock = vi.fn<LabFetch>(async () => jsonResponse(labFixtureEnvelope(exerciseContent)))
    vi.stubGlobal('fetch', fetchMock)

    const content = await getLabContent({ locale: 'ko', id: EXERCISE_CONTENT_ID })

    expect(content?.title).toBe(exerciseContent.title)
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}?market=KR&locale=ko`,
    )
  })

  it('does not call the backend for an id that is not a uuid', async () => {
    withApiBase()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await getLabContent({ locale: 'ko', id: 'tummy-time-guide' })).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns null when the detail request fails', async () => {
    withApiBase()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ code: 1040, message: 'content_not_found' }, 404)))

    expect(await getLabContent({ locale: 'ko', id: EXERCISE_CONTENT_ID })).toBeNull()
  })

  it('builds an asset url', () => {
    withApiBase()

    expect(
      labAssetUrl({
        contentId: EXERCISE_CONTENT_ID,
        revisionId: EXERCISE_REVISION_ID,
        assetVersionId: EXERCISE_ATTACHMENT_ASSET_ID,
        locale: 'ko',
      }),
    ).toBe(
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}` +
        `/revisions/${EXERCISE_REVISION_ID}/assets/${EXERCISE_ATTACHMENT_ASSET_ID}?market=KR&locale=ko`,
    )
  })

  it('returns an empty asset url when no api base url is configured', () => {
    process.env = { ...originalEnv, BARODORI_API_BASE_URL: '', NEXT_PUBLIC_API_BASE_URL: '', VERCEL_URL: '' }

    expect(
      labAssetUrl({
        contentId: EXERCISE_CONTENT_ID,
        revisionId: EXERCISE_REVISION_ID,
        assetVersionId: EXERCISE_ATTACHMENT_ASSET_ID,
        locale: 'ko',
      }),
    ).toBe('')
  })
})
