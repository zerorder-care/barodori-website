import { fetchBackendApi, getApiBaseUrl } from '@/lib/api/client'
import {
  faqCategories as fallbackFaqCategories,
  faqItems as fallbackFaqItems,
  type FaqItem,
} from '@/lib/content/faq'
import {
  newsroomCategories,
  newsroomPosts as fallbackNewsroomPosts,
  type NewsroomCategory,
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

export type FaqCategoryOption = {
  value: string
  label: string
  id?: string
  sortOrder?: number
}

export type FaqContentParams = {
  category?: string
  q?: string
}

export type FaqContentResult = {
  categories: FaqCategoryOption[]
  items: FaqItem[]
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
}

type PublicNewsroomListResponse = {
  posts: PublicNewsroomPost[]
  total: number
  page: number
  pageSize?: number
  page_size?: number
}

type PublicFaqCategory = {
  id: string
  slug: string
  label: string
  sortOrder?: number
  sort_order?: number
}

type PublicFaqCategoryListResponse = {
  categories: PublicFaqCategory[]
}

type PublicFaqItem = {
  id: string
  category: PublicFaqCategory
  question: string
  answer: string
  sortOrder?: number
  sort_order?: number
}

type PublicFaqListResponse = {
  faqs: PublicFaqItem[]
}

const NEWSROOM_DEFAULT_PAGE_SIZE = 9
const NEWSROOM_MAX_PAGE_SIZE = 50

const fallbackNewsroomCategories: NewsroomCategoryOption[] = newsroomCategories.map(({ value, label }) => ({
  value,
  label,
}))

const fallbackFaqCategoryOptions: FaqCategoryOption[] = fallbackFaqCategories.map(({ value, label }) => ({
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

export async function getFaqContent({ category, q }: FaqContentParams = {}): Promise<FaqContentResult> {
  const apiBaseUrl = getApiBaseUrl()

  if (!apiBaseUrl) {
    return buildFallbackFaqContent({ category, q })
  }

  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (q?.trim()) params.set('q', q.trim())
  const faqPath = params.size > 0 ? `/api/v1/content/faqs?${params}` : '/api/v1/content/faqs'

  try {
    const [categoryData, faqData] = await Promise.all([
      fetchBackendApi<PublicFaqCategoryListResponse>(apiBaseUrl, '/api/v1/content/faq-categories', 'content_faq_api'),
      fetchBackendApi<PublicFaqListResponse>(apiBaseUrl, faqPath, 'content_faq_api'),
    ])

    return {
      categories: buildFaqCategories(categoryData.categories),
      items: faqData.faqs.map(mapFaqItem),
      source: 'api',
    }
  } catch (error) {
    return {
      categories: fallbackFaqCategoryOptions,
      items: [],
      source: 'api',
      error: error instanceof Error ? error.message : 'content_faq_api_error',
    }
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

function buildFallbackFaqContent({ category, q }: FaqContentParams): FaqContentResult {
  const normalized = q?.trim().toLowerCase()
  const items = fallbackFaqItems
    .filter((item) => !category || category === 'all' || item.category === category)
    .filter((item) => {
      if (!normalized) return true
      return `${item.question} ${item.answer}`.toLowerCase().includes(normalized)
    })

  return {
    categories: fallbackFaqCategoryOptions,
    items,
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
  }
}

function mapFaqItem(item: PublicFaqItem): FaqItem {
  return {
    id: item.id,
    category: item.category.slug,
    question: item.question,
    answer: item.answer,
  }
}

function buildFaqCategories(categories: PublicFaqCategory[]): FaqCategoryOption[] {
  const activeCategories = categories
    .slice()
    .sort((a, b) => getSortOrder(a) - getSortOrder(b))
    .map((category) => ({
      value: category.slug,
      label: category.label,
      id: category.id,
      sortOrder: getSortOrder(category),
    }))

  return [{ value: 'all', label: '전체' }, ...activeCategories]
}

function getSortOrder(category: PublicFaqCategory): number {
  return category.sortOrder ?? category.sort_order ?? 0
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!value || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value))
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 10)
}
