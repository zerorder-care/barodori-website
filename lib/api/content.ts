import { fetchBackendApi, getApiBaseUrl } from '@/lib/api/client'
import {
  newsroomCategories,
  newsroomPosts as fallbackNewsroomPosts,
  type NewsroomCategory,
  type NewsroomContentBlock,
  type NewsroomPost,
} from '@/lib/content/newsroom'

export type NewsroomCategoryFilter = NewsroomCategory | 'all'

export type NewsroomCategoryOption = {
  value: NewsroomCategoryFilter
  label: string
}

export type NewsroomListParams = {
  category?: NewsroomCategory
  q?: string
  page?: number
  pageSize?: number
}

export type NewsroomListResult = {
  categories: NewsroomCategoryOption[]
  posts: NewsroomPost[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
  nextPage: number | null
  source: 'api' | 'fallback'
  error?: string
}

type PublicNewsroomCategory = {
  value: NewsroomCategory
  label: string
}

type PublicNewsroomPost = {
  id: string
  category: PublicNewsroomCategory
  title: string
  excerpt: string
  thumbnailImage?: string | null
  thumbnail_image?: string | null
  externalUrl?: string | null
  external_url?: string | null
  publishedAt?: string | null
  published_at?: string | null
  content?: NewsroomContentBlock[] | null
}

type PublicNewsroomListResponse = {
  posts: PublicNewsroomPost[]
  total: number
  page: number
  pageSize?: number
  page_size?: number
}

const NEWSROOM_DEFAULT_PAGE_SIZE = 9
const NEWSROOM_MAX_PAGE_SIZE = 50

const fallbackNewsroomCategories: NewsroomCategoryOption[] = newsroomCategories.map(({ value, label }) => ({
  value,
  label,
}))

export async function listNewsroomPosts({
  category,
  q,
  page = 1,
  pageSize = NEWSROOM_DEFAULT_PAGE_SIZE,
}: NewsroomListParams = {}): Promise<NewsroomListResult> {
  const normalizedPage = normalizePositiveInteger(page, 1)
  const visiblePageSize = Math.min(normalizePositiveInteger(pageSize, NEWSROOM_DEFAULT_PAGE_SIZE) * normalizedPage, NEWSROOM_MAX_PAGE_SIZE)
  const apiBaseUrl = getApiBaseUrl()

  if (!apiBaseUrl) {
    return buildFallbackNewsroomList({ category, q, page: normalizedPage, pageSize })
  }

  const params = new URLSearchParams({
    page: '1',
    pageSize: String(visiblePageSize),
  })
  if (category) params.set('category', category)
  if (q?.trim()) params.set('q', q.trim())

  try {
    const data = await fetchBackendApi<PublicNewsroomListResponse>(
      apiBaseUrl,
      `/api/v1/content/newsroom?${params}`,
      'content_newsroom_api',
    )
    const posts = data.posts.map(mapNewsroomPost)
    const hasMore = posts.length < data.total && visiblePageSize < NEWSROOM_MAX_PAGE_SIZE

    return {
      categories: fallbackNewsroomCategories,
      posts,
      page: normalizedPage,
      pageSize: visiblePageSize,
      total: data.total,
      hasMore,
      nextPage: hasMore ? normalizedPage + 1 : null,
      source: 'api',
    }
  } catch (error) {
    return {
      categories: fallbackNewsroomCategories,
      posts: [],
      page: normalizedPage,
      pageSize: visiblePageSize,
      total: 0,
      hasMore: false,
      nextPage: null,
      source: 'api',
      error: error instanceof Error ? error.message : 'content_newsroom_api_error',
    }
  }
}

export async function getNewsroomPost(postId: string): Promise<NewsroomPost | null> {
  const apiBaseUrl = getApiBaseUrl()

  if (!apiBaseUrl) {
    return fallbackNewsroomPosts.find((post) => post.id === postId) ?? null
  }

  try {
    const data = await fetchBackendApi<PublicNewsroomPost>(
      apiBaseUrl,
      `/api/v1/content/newsroom/${postId}`,
      'content_newsroom_api',
    )
    return mapNewsroomPost(data)
  } catch {
    return null
  }
}

function buildFallbackNewsroomList({
  category,
  q,
  page = 1,
  pageSize = NEWSROOM_DEFAULT_PAGE_SIZE,
}: NewsroomListParams): NewsroomListResult {
  const normalized = q?.trim().toLowerCase()
  const normalizedPage = normalizePositiveInteger(page, 1)
  const visiblePageSize = Math.min(normalizePositiveInteger(pageSize, NEWSROOM_DEFAULT_PAGE_SIZE) * normalizedPage, NEWSROOM_MAX_PAGE_SIZE)
  const filtered = fallbackNewsroomPosts.filter((post) => {
    if (category && post.category !== category) return false
    if (!normalized) return true
    return `${post.title} ${post.excerpt}`.toLowerCase().includes(normalized)
  })
  const posts = filtered.slice(0, visiblePageSize)
  const hasMore = posts.length < filtered.length && visiblePageSize < NEWSROOM_MAX_PAGE_SIZE

  return {
    categories: fallbackNewsroomCategories,
    posts,
    page: normalizedPage,
    pageSize: visiblePageSize,
    total: filtered.length,
    hasMore,
    nextPage: hasMore ? normalizedPage + 1 : null,
    source: 'fallback',
  }
}

function mapNewsroomPost(post: PublicNewsroomPost): NewsroomPost {
  return {
    id: post.id,
    category: post.category.value,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: formatDate(post.publishedAt ?? post.published_at),
    href: post.externalUrl ?? post.external_url ?? undefined,
    thumbnail: post.thumbnailImage ?? post.thumbnail_image ?? undefined,
    content: post.content ?? undefined,
  }
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!value || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value))
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 10)
}
