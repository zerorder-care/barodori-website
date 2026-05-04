import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { type Category, isCategory } from './categories'
import { type Locale, locales } from '@/lib/i18n/config'

export type Article = {
  title: string
  slug: string
  category: Category
  publishedAt: string // ISO date
  updatedAt: string
  author: string
  authorRole?: string
  excerpt: string
  heroImage: string
  heroImageAlt: string
  ogImage?: string
  readingMinutes: number
  relatedSlugs?: string[]
  draft: boolean
  locale: Locale
  body: string // raw MDX (frontmatter 제거)
}

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'articles')

let cache: Map<Locale, Article[]> | null = null

async function loadAll(): Promise<Map<Locale, Article[]>> {
  if (cache) return cache
  const map = new Map<Locale, Article[]>()
  for (const locale of locales) {
    const dir = path.join(CONTENT_ROOT, locale)
    let entries: string[] = []
    try {
      entries = await fs.readdir(dir)
    } catch {
      map.set(locale, [])
      continue
    }
    const articles: Article[] = []
    for (const entry of entries) {
      if (!entry.endsWith('.mdx')) continue
      const filePath = path.join(dir, entry)
      const raw = await fs.readFile(filePath, 'utf8')
      const { data, content } = matter(raw)
      const article = parseFrontmatter(data, content, locale)
      if (article) articles.push(article)
    }
    articles.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    map.set(locale, articles)
  }
  cache = map
  return map
}

function parseFrontmatter(
  data: Record<string, unknown>,
  body: string,
  locale: Locale,
): Article | null {
  const required = [
    'title',
    'slug',
    'category',
    'publishedAt',
    'updatedAt',
    'author',
    'excerpt',
    'heroImage',
    'heroImageAlt',
    'readingMinutes',
  ]
  for (const k of required) {
    if (data[k] == null) return null
  }
  const category = String(data.category)
  if (!isCategory(category)) return null

  return {
    title: String(data.title),
    slug: String(data.slug),
    category,
    publishedAt: toIsoDate(data.publishedAt),
    updatedAt: toIsoDate(data.updatedAt),
    author: String(data.author),
    authorRole: data.authorRole ? String(data.authorRole) : undefined,
    excerpt: String(data.excerpt),
    heroImage: String(data.heroImage),
    heroImageAlt: String(data.heroImageAlt),
    ogImage: data.ogImage ? String(data.ogImage) : undefined,
    readingMinutes: Number(data.readingMinutes),
    relatedSlugs: Array.isArray(data.relatedSlugs)
      ? (data.relatedSlugs as unknown[]).map(String)
      : undefined,
    draft: Boolean(data.draft),
    locale,
    body,
  }
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

const includeDrafts =
  process.env.NEXT_PUBLIC_INCLUDE_DRAFTS === '1' || process.env.NODE_ENV === 'development'

export async function listArticles(opts: {
  locale: Locale
  category?: Category
}): Promise<Article[]> {
  const all = await loadAll()
  let articles = all.get(opts.locale) ?? []
  if (!includeDrafts) articles = articles.filter((a) => !a.draft)
  if (opts.category) articles = articles.filter((a) => a.category === opts.category)
  return articles
}

export async function getArticle(opts: {
  locale: Locale
  slug: string
}): Promise<Article | null> {
  const articles = await listArticles({ locale: opts.locale })
  return articles.find((a) => a.slug === opts.slug) ?? null
}

export async function getRelated(article: Article, max = 2): Promise<Article[]> {
  const all = await listArticles({ locale: article.locale })
  if (article.relatedSlugs?.length) {
    return article.relatedSlugs
      .map((slug) => all.find((a) => a.slug === slug))
      .filter((a): a is Article => !!a && a.slug !== article.slug)
      .slice(0, max)
  }
  return all
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, max)
}

export async function listAllSlugs(): Promise<Array<{ locale: Locale; slug: string }>> {
  const all = await loadAll()
  const out: Array<{ locale: Locale; slug: string }> = []
  for (const [locale, articles] of all) {
    for (const a of articles) {
      if (!a.draft || includeDrafts) out.push({ locale, slug: a.slug })
    }
  }
  return out
}
