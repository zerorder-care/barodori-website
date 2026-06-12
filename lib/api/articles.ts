import { fetchBackendApi, getApiBaseUrl } from '@/lib/api/client'
import {
  getArticle as getFallbackArticle,
  getRelated as getFallbackRelated,
  listArticles as listFallbackArticles,
  type Article,
} from '@/lib/content/articles'
import { type Category, isCategory } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

type PublicAuthor = {
  nickname: string
  profileImage?: string | null
  isAnonymous?: boolean
}

type PublicPostListItem = {
  id: string
  category: 'official_content'
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
  alt?: string
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

export type ArticleListParams = {
  locale: Locale
  category?: Category
  q?: string
  offset?: number
  limit?: number
}

export type ArticleListResult = {
  articles: Article[]
  nextOffset: number | null
  hasMore: boolean
  source: 'api' | 'fallback'
  error?: string
}

const ARTICLE_FALLBACK_IMAGE = '/og/default.png'

export async function listArticlePosts({
  locale,
  category,
  q,
  offset = 0,
  limit = 20,
}: ArticleListParams): Promise<ArticleListResult> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) {
    return buildFallbackList({ locale, category, q, offset, limit })
  }

  const params = new URLSearchParams({
    category: 'official_content',
    sort: 'latest',
    offset: '0',
    limit: String(offset + limit),
  })
  if (q?.trim()) params.set('q', q.trim())

  try {
    const data = await fetchBackendApi<PublicPostListResponse>(
      apiBaseUrl,
      `/api/v1/community/public/posts?${params}`,
      'article_community_api',
    )
    const apiArticles = data.posts
      .map((post) => mapPostToArticle(post, locale))
      .filter((article) => !category || article.category === category)
    const fallbackArticles = await listFilteredFallbackArticles({ locale, category, q })
    const combined = mergeArticles(apiArticles, fallbackArticles)
    const articles = combined.slice(offset, offset + limit)
    const nextOffset = offset + limit < combined.length || data.hasMore ? offset + limit : null

    return {
      articles,
      nextOffset,
      hasMore: nextOffset !== null,
      source: 'api',
    }
  } catch (error) {
    const fallback = await buildFallbackList({ locale, category, q, offset, limit })
    return {
      ...fallback,
      error: error instanceof Error ? error.message : 'article_community_api_error',
    }
  }
}

export async function getArticlePost({
  locale,
  slug,
}: {
  locale: Locale
  slug: string
}): Promise<Article | null> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) {
    return getFallbackArticle({ locale, slug })
  }

  try {
    const post = await fetchBackendApi<PublicPostDetail>(
      apiBaseUrl,
      `/api/v1/community/public/posts/${slug}`,
      'article_community_api',
    )
    if (post.category !== 'official_content') {
      return getFallbackArticle({ locale, slug })
    }
    return mapPostToArticle(post, locale, contentBlocksToMdx(post))
  } catch {
    return getFallbackArticle({ locale, slug })
  }
}

export async function getRelatedArticlePosts(article: Article, max = 2): Promise<Article[]> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) {
    return getFallbackRelated(article, max)
  }

  const result = await listArticlePosts({
    locale: article.locale,
    category: article.category,
    limit: max + 1,
  })

  return result.articles.filter((item) => item.slug !== article.slug).slice(0, max)
}

async function buildFallbackList({
  locale,
  category,
  q,
  offset = 0,
  limit = 20,
}: ArticleListParams): Promise<ArticleListResult> {
  const filtered = await listFilteredFallbackArticles({ locale, category, q })
  const articles = filtered.slice(offset, offset + limit)
  const nextOffset = offset + limit < filtered.length ? offset + limit : null

  return {
    articles,
    nextOffset,
    hasMore: nextOffset !== null,
    source: 'fallback',
  }
}

async function listFilteredFallbackArticles({
  locale,
  category,
  q,
}: Pick<ArticleListParams, 'locale' | 'category' | 'q'>): Promise<Article[]> {
  const normalized = q?.trim().toLowerCase()
  const all = await listFallbackArticles({ locale })
  return all
    .filter((article) => !category || article.category === category)
    .filter((article) => {
      if (!normalized) return true
      return `${article.title} ${article.excerpt}`.toLowerCase().includes(normalized)
    })
}

function mergeArticles(primary: Article[], fallback: Article[]): Article[] {
  const seen = new Set<string>()
  const merged: Article[] = []
  for (const article of [...primary, ...fallback]) {
    if (seen.has(article.slug)) continue
    seen.add(article.slug)
    merged.push(article)
  }
  return merged.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

function mapPostToArticle(post: PublicPostListItem, locale: Locale, body?: string): Article {
  const excerpt = post.contentPreview?.trim() || `${post.title} 내용을 바로도리 콘텐츠에서 확인해보세요.`
  const markdown = body ?? excerpt
  const category = mapArticleCategory(post.subCategory, `${post.title} ${excerpt}`)
  const updatedAt = 'updatedAt' in post && typeof post.updatedAt === 'string' ? post.updatedAt : post.createdAt

  return {
    title: post.title,
    slug: post.id,
    category,
    publishedAt: formatDate(post.createdAt),
    updatedAt: formatDate(updatedAt),
    author: post.author.nickname || '바로도리',
    authorRole: post.author.nickname === '바로도리' ? '운영진 콘텐츠' : undefined,
    excerpt,
    heroImage: post.thumbnailImage ?? ARTICLE_FALLBACK_IMAGE,
    heroImageAlt: post.title,
    readingMinutes: estimateReadingMinutes(markdown),
    draft: false,
    locale,
    body: markdown,
  }
}

function mapArticleCategory(subCategory: string | null | undefined, searchableText: string): Category {
  if (subCategory && isCategory(subCategory)) return subCategory

  const text = searchableText.toLowerCase()
  if (text.includes('사두') || text.includes('두상') || text.includes('머리 모양')) return 'head-shape'
  if (text.includes('운동') || text.includes('터미타임') || text.includes('도리도리') || text.includes('스트레칭')) return 'exercise'
  if (text.includes('월령') || text.includes('개월')) return 'by-month'
  return 'torticollis'
}

function contentBlocksToMdx(post: PublicPostDetail): string {
  const blocks = post.content ?? []
  const parts = blocks
    .map((block) => {
      if (block.type === 'image') {
        const src = block.imageUrl ?? block.thumbnailUrl
        if (!src) return ''
        return `![${block.alt ?? post.title}](${src})`
      }
      if (typeof block.content === 'string') return block.content.trim()
      if (typeof block.text === 'string') return block.text.trim()
      return ''
    })
    .filter(Boolean)

  return parts.length > 0 ? parts.join('\n\n') : (post.contentPreview ?? '')
}

function estimateReadingMinutes(markdown: string): number {
  const compactLength = markdown.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(compactLength / 500))
}

function formatDate(value: string): string {
  return value.slice(0, 10)
}
