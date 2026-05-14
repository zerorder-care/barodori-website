import Link from 'next/link'
import Image from 'next/image'
import type { NewsroomCategoryOption } from '@/lib/api/content'
import type { NewsroomCategory, NewsroomPost } from '@/lib/content/newsroom'
import type { Locale } from '@/lib/i18n/config'

type CategoryFilter = NewsroomCategory | 'all'

export function NewsroomBoard({
  locale,
  categories,
  posts,
  category,
  query,
  nextPage,
  error,
}: {
  locale: Locale
  categories: NewsroomCategoryOption[]
  posts: NewsroomPost[]
  category: CategoryFilter
  query: string
  nextPage: number | null
  error?: string
}) {
  const categoryLabelByValue = new Map(categories.map((item) => [item.value, item.label]))

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-[var(--color-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link key={item.value} href={buildNewsroomHref(locale, item.value, query)} className={chipClass(category === item.value)}>
              {item.label}
            </Link>
          ))}
        </div>
        <form action={`/${locale}/newsroom`} className="flex min-h-12 min-w-0 items-center rounded-[8px] border border-[var(--color-border)] bg-white px-4 lg:w-72">
          {category !== 'all' && <input type="hidden" name="category" value={category} />}
          <label htmlFor="newsroom-search" className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            검색
          </label>
          <input
            id="newsroom-search"
            name="q"
            defaultValue={query}
            placeholder="소식 검색"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>
      </div>
      {error && (
        <p className="mt-5 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
          뉴스룸 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}
      {posts.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          {query ? `'${query}'에 대한 결과가 없어요.` : '아직 등록된 소식이 없어요.'}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <NewsroomCard
              key={post.id}
              locale={locale}
              post={post}
              categoryLabel={categoryLabelByValue.get(post.category) ?? post.category}
            />
          ))}
        </div>
      )}
      {nextPage && (
        <div className="mt-10 flex justify-center">
          <Link
            href={buildNewsroomHref(locale, category, query, nextPage)}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--color-text-primary)] px-6 text-sm font-bold"
          >
            더보기 +
          </Link>
        </div>
      )}
    </div>
  )
}

function NewsroomCard({
  locale,
  post,
  categoryLabel,
}: {
  locale: Locale
  post: NewsroomPost
  categoryLabel: string
}) {
  const content = (
    <>
      {post.thumbnail ? (
        <div
          aria-hidden="true"
          className="aspect-[16/9] w-full border-b border-[var(--color-border)] bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(post.thumbnail)})` }}
        />
      ) : (
        <div className="relative aspect-[16/9] w-full border-b border-[var(--color-border)]">
          <Image
            src="/images/newsroom-fallback.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-[4px] bg-[#efefef] px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
            {categoryLabel}
          </span>
          {post.publishedAt && (
            <time className="text-xs text-[var(--color-text-secondary)]" dateTime={post.publishedAt}>
              {post.publishedAt}
            </time>
          )}
        </div>
        <h2 className="mt-5 min-h-14 text-lg font-bold leading-snug">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{post.excerpt}</p>
      </div>
    </>
  )

  if (post.href) {
    return (
      <a
        href={post.href}
        target="_blank"
        rel="noopener noreferrer"
        className="overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white transition hover:shadow-md"
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={`/${locale}/newsroom/${post.id}`}
      className="overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white transition hover:shadow-md"
    >
      {content}
    </Link>
  )
}

function buildNewsroomHref(locale: Locale, category: CategoryFilter, query: string, page?: number): string {
  const params = new URLSearchParams()
  if (category !== 'all') params.set('category', category)
  if (query.trim()) params.set('q', query.trim())
  if (page && page > 1) params.set('page', String(page))
  const suffix = params.toString()
  return suffix ? `/${locale}/newsroom?${suffix}` : `/${locale}/newsroom`
}

function chipClass(active: boolean) {
  return `rounded-[8px] px-4 py-2 text-sm font-semibold ${
    active
      ? 'bg-[var(--color-primary)] text-white'
      : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
  }`
}
