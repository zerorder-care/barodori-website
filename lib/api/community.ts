import {
  communityPosts as fallbackCommunityPosts,
  type CommunityCategory,
  type CommunityComment,
  type CommunityPost,
  type CommunitySort,
} from '@/lib/content/community'

type ApiEnvelope<T> = {
  code?: number
  message?: string
  data?: T
}

type PublicAuthor = {
  nickname: string
  profileImage?: string | null
  isAnonymous?: boolean
}

type PublicPostListItem = {
  id: string
  category: CommunityCategory
  subCategory?: string | null
  title: string
  contentPreview?: string | null
  author: PublicAuthor
  thumbnailImage?: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  isAnswered: boolean
  createdAt: string
}

type PublicPostListResponse = {
  posts: PublicPostListItem[]
  nextOffset?: number | null
  hasMore: boolean
}

type PublicContentBlock = {
  type?: string
  content?: string
  text?: string
  imageUrl?: string | null
  thumbnailUrl?: string | null
  [key: string]: unknown
}

type PublicPostDetail = PublicPostListItem & {
  content?: PublicContentBlock[] | null
  media?: Array<{
    id: string
    mediaType: string
    image: string
    thumbnailImage?: string | null
    sortOrder: number
  }>
  updatedAt: string
}

type PublicComment = {
  id: string
  postId: string
  parentId?: string | null
  author: PublicAuthor
  content: string
  isDeleted: boolean
  likeCount: number
  replyCount: number
  replies?: PublicComment[]
  createdAt: string
}

type PublicCommentListResponse = {
  comments: PublicComment[]
  nextCursor?: string | null
  hasMore: boolean
}

export type CommunityListResult = {
  posts: CommunityPost[]
  nextOffset: number | null
  hasMore: boolean
  source: 'api' | 'fallback'
  error?: string
}

export type CommunityListParams = {
  category?: CommunityCategory
  q?: string
  sort?: CommunitySort
  offset?: number
  limit?: number
}

const DEFAULT_VERCEL_API_BASE_URL = 'https://staging.api.barodori.com'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.barodori.com'

export async function listCommunityPosts({
  category,
  q,
  sort = 'popular',
  offset = 0,
  limit = 20,
}: CommunityListParams = {}): Promise<CommunityListResult> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) {
    return buildFallbackList({ category, q, sort, offset, limit })
  }

  const params = new URLSearchParams({
    sort,
    offset: String(offset),
    limit: String(limit),
  })
  if (category) params.set('category', category)
  if (q?.trim()) params.set('q', q.trim())

  try {
    const data = await fetchApi<PublicPostListResponse>(apiBaseUrl, `/api/v1/community/public/posts?${params}`)
    return {
      posts: data.posts.map(mapListItem),
      nextOffset: data.nextOffset ?? null,
      hasMore: data.hasMore,
      source: 'api',
    }
  } catch (error) {
    return {
      posts: [],
      nextOffset: null,
      hasMore: false,
      source: 'api',
      error: error instanceof Error ? error.message : 'community_api_error',
    }
  }
}

export async function getCommunityPostDetail(postId: string): Promise<CommunityPost | null> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) {
    return fallbackCommunityPosts.find((post) => post.id === postId) ?? null
  }

  try {
    const [post, comments] = await Promise.all([
      fetchApi<PublicPostDetail>(apiBaseUrl, `/api/v1/community/public/posts/${postId}`),
      fetchApi<PublicCommentListResponse>(apiBaseUrl, `/api/v1/community/public/posts/${postId}/comments?limit=20`).catch(
        () => ({ comments: [], hasMore: false }),
      ),
    ])

    return {
      ...mapListItem(post),
      body: contentBlocksToParagraphs(post.content),
      comments: comments.comments.map(mapComment),
    }
  } catch {
    return null
  }
}

function getApiBaseUrl(): string | null {
  const configured = process.env.BARODORI_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
  if (configured) return configured.replace(/\/$/, '')
  if (process.env.VERCEL_URL?.endsWith('.vercel.app')) return DEFAULT_VERCEL_API_BASE_URL
  if (process.env.NODE_ENV === 'production') return DEFAULT_PRODUCTION_API_BASE_URL
  return null
}

async function fetchApi<T>(apiBaseUrl: string, path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`community_api_http_${response.status}`)
  }

  const payload = (await response.json()) as ApiEnvelope<T>
  if (payload.code !== undefined && payload.code !== 0) {
    throw new Error(payload.message ?? `community_api_code_${payload.code}`)
  }
  if (!payload.data) {
    throw new Error('community_api_empty_data')
  }
  return payload.data
}

function buildFallbackList({
  category,
  q,
  sort = 'popular',
  offset = 0,
  limit = 20,
}: CommunityListParams): CommunityListResult {
  const normalized = q?.trim().toLowerCase()
  const filtered = fallbackCommunityPosts
    .filter((post) => !category || post.category === category)
    .filter((post) => {
      if (!normalized) return true
      return `${post.title} ${post.preview} ${post.author}`.toLowerCase().includes(normalized)
    })
    .sort((a, b) => {
      if (sort === 'popular') return b.likeCount + b.commentCount - (a.likeCount + a.commentCount)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const posts = filtered.slice(offset, offset + limit)
  const nextOffset = offset + limit < filtered.length ? offset + limit : null
  return {
    posts,
    nextOffset,
    hasMore: nextOffset !== null,
    source: 'fallback',
  }
}

function mapListItem(post: PublicPostListItem): CommunityPost {
  return {
    id: post.id,
    category: post.category,
    author: post.author.nickname,
    title: post.title,
    preview: post.contentPreview ?? '',
    body: post.contentPreview ? [post.contentPreview] : [],
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    thumbnail: post.thumbnailImage ?? undefined,
    comments: [],
  }
}

function mapComment(comment: PublicComment): CommunityComment {
  return {
    id: comment.id,
    author: comment.author.nickname,
    content: comment.isDeleted ? '삭제된 댓글입니다.' : comment.content,
    likeCount: comment.likeCount,
    createdAt: comment.createdAt,
    replies: comment.replies?.map(mapComment),
  }
}

function contentBlocksToParagraphs(content: PublicContentBlock[] | null | undefined): string[] {
  if (!content?.length) return []

  return content
    .map((block) => {
      if (typeof block.content === 'string') return block.content.trim()
      if (typeof block.text === 'string') return block.text.trim()
      return ''
    })
    .filter(Boolean)
}
