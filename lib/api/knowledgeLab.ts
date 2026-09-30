import { getApiBaseUrl, type ApiEnvelope } from '@/lib/api/client'
import type { Locale } from '@/lib/i18n/config'

export type LabKind = 'exercise_guide' | 'disease_info' | 'faq'
export type LabCollection = 'head_shape_lab' | 'home_monthly_information'
export type LabTrack = 'head_shape' | 'torticollis'
export type LabMarket = 'KR' | 'US' | 'JP'

export type LabPlacement = {
  collection: LabCollection
  order: number
  monthMin: number | null
  monthMax: number | null
}

export type LabHeroAsset = {
  assetVersionId: string
  contentType: string
}

export type LabCard = {
  id: string
  revisionId: string
  kind: LabKind
  title: string
  summary: string | null
  thumbnailUrl: string | null
  durationSeconds: number | null
  targetTracks: LabTrack[]
  placements: LabPlacement[]
  publishedAt: string
  heroAsset: LabHeroAsset | null
}

export type LabBlock = {
  type: 'paragraph' | 'heading'
  text: string
}

export type LabRenderNode =
  | { type: 'markdown'; markdown: string }
  | { type: 'disclosure'; title: string; children: LabRenderNode[] }
  | { type: 'callout'; icon: string | null; children: LabRenderNode[] }

export type LabAsset = {
  assetVersionId: string
  filename: string
  contentType: string
  byteLength: number
  sha256: string
  role: 'image' | 'attachment'
}

type LabContentBase = {
  id: string
  revisionId: string
  releaseId: string
  generation: number
  kind: LabKind
  locale: Locale | string
  market: LabMarket
  title: string
  summary: string | null
  thumbnailUrl: string | null
  durationSeconds: number | null
  targetTracks: LabTrack[]
  placements: LabPlacement[]
  publishedAt: string
}

export type LabBlocksContent = LabContentBase & {
  schemaVersion: 1
  blocks: LabBlock[]
}

export type LabMarkdownContent = LabContentBase & {
  schemaVersion: 2
  rendererVersion: string
  renderDocument: LabRenderNode[]
  markdownAssets: LabAsset[]
}

export type LabContent = LabBlocksContent | LabMarkdownContent

export type LabListResult = {
  items: LabCard[]
  error?: string
}

/** 웹은 지금 한국 시장만 읽는다. 시장을 바꿀 일이 생기면 locale과 함께 인자로 올린다. */
const LAB_MARKET: LabMarket = 'KR'
const LAB_PATH_PREFIX = '/api/v2/knowledge-lab/web'
const LAB_REVALIDATE_SECONDS = 86400

export const LAB_CACHE_TAG = 'lab-content'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isLabContentId(value: string): boolean {
  return UUID_PATTERN.test(value)
}

type LabFetchResult<T> = { data: T } | { error: string }

async function fetchLabApi<T>(path: string): Promise<LabFetchResult<T>> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) return { error: 'lab_api_base_url_missing' }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: LAB_REVALIDATE_SECONDS, tags: [LAB_CACHE_TAG] },
    })
    if (!response.ok) return { error: `lab_api_http_${response.status}` }

    const payload = (await response.json()) as ApiEnvelope<T>
    if (payload.code !== undefined && payload.code !== 0) {
      return { error: payload.message ?? `lab_api_code_${payload.code}` }
    }
    if (payload.data === undefined || payload.data === null) return { error: 'lab_api_empty_data' }
    return { data: payload.data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'lab_api_error' }
  }
}

export async function listLabContents(params: {
  locale: Locale
  collection: LabCollection
  kind?: LabKind
}): Promise<LabListResult> {
  const search = new URLSearchParams({
    market: LAB_MARKET,
    locale: params.locale,
    collection: params.collection,
  })
  if (params.kind) search.set('kind', params.kind)

  const result = await fetchLabApi<{ items: LabCard[] }>(`${LAB_PATH_PREFIX}/contents?${search}`)
  if ('error' in result) return { items: [], error: result.error }
  return { items: result.data.items ?? [] }
}

export async function getLabContent(params: { locale: Locale; id: string }): Promise<LabContent | null> {
  if (!isLabContentId(params.id)) return null

  const search = new URLSearchParams({ market: LAB_MARKET, locale: params.locale })
  const result = await fetchLabApi<LabContent>(`${LAB_PATH_PREFIX}/contents/${params.id}?${search}`)
  if ('error' in result) return null
  return result.data
}

export function labAssetUrl(params: {
  contentId: string
  revisionId: string
  assetVersionId: string
  locale: Locale
}): string {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) return ''

  const search = new URLSearchParams({ market: LAB_MARKET, locale: params.locale })
  return (
    `${apiBaseUrl}${LAB_PATH_PREFIX}/contents/${params.contentId}` +
    `/revisions/${params.revisionId}/assets/${params.assetVersionId}?${search}`
  )
}
