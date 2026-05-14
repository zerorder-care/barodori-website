import Link from 'next/link'
import { communityCategories, type CommunityCategory, type CommunityPost, type CommunitySort } from '@/lib/content/community'
import type { Locale } from '@/lib/i18n/config'

type CategoryFilter = CommunityCategory | 'all'

export function CommunityBoard({
  locale,
  posts,
  category,
  sort,
  query,
  nextOffset,
  hasMore,
  error,
}: {
  locale: Locale
  posts: CommunityPost[]
  category: CategoryFilter
  sort: CommunitySort
  query: string
  nextOffset: number | null
  hasMore: boolean
  error?: string
}) {
  return (
    <div>
      <div className="border-y border-[var(--color-border)] py-5">
        <div className="flex flex-wrap gap-2">
          {communityCategories.map((item) => (
            <Link
              key={item.value}
              href={buildCommunityHref(locale, { category: item.value, sort, q: query })}
              className={chipClass(category === item.value)}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <form action={`/${locale}/community`} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {category !== 'all' && <input type="hidden" name="category" value={category} />}
          <input type="hidden" name="sort" value={sort} />
          <label className="flex min-h-12 flex-1 items-center rounded-[8px] border border-[var(--color-border)] bg-white px-4">
            <span className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">검색</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="궁금한 키워드를 입력하세요"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[var(--color-border)] bg-white px-5 text-sm font-bold"
          >
            검색
          </button>
          <div className="flex rounded-[8px] border border-[var(--color-border)] bg-white p-1">
            {(['popular', 'latest'] as const).map((value) => (
              <Link
                key={value}
                href={buildCommunityHref(locale, { category, sort: value, q: query })}
                className={`rounded-[6px] px-4 py-2 text-sm font-semibold ${
                  sort === value ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {value === 'popular' ? '인기순' : '최신순'}
              </Link>
            ))}
          </div>
        </form>
      </div>
      {error && (
        <p className="mt-6 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
          커뮤니티 게시글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}
      {posts.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          {query ? `'${query}'에 대한 결과가 없어요.` : '아직 등록된 글이 없어요.'}
        </p>
      ) : (
        <div className="mt-8 grid gap-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-[8px] border border-[var(--color-border)] bg-white p-5 transition hover:shadow-md">
              <div className="grid gap-5 sm:grid-cols-[1fr_136px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span className="rounded-[4px] bg-[#efefef] px-2 py-1 font-semibold text-[var(--color-text-secondary)]">
                      {communityCategories.find((item) => item.value === post.category)?.label}
                    </span>
                    <span>
                      {post.author}
                      {post.babyAge ? ` · 아이 ${post.babyAge}` : ''}
                    </span>
                    <time dateTime={post.createdAt}>{formatRelative(post.createdAt)}</time>
                  </div>
                  <Link href={`/${locale}/community/${post.id}`} className="mt-3 block text-xl font-bold leading-snug hover:underline">
                    {post.title}
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{post.preview}</p>
                  <div className="mt-5 flex gap-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                    <span>마음 {post.likeCount}</span>
                    <span>댓글 {post.commentCount}</span>
                    {typeof post.viewCount === 'number' && <span>조회 {post.viewCount}</span>}
                  </div>
                </div>
                {post.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="hidden h-28 w-full rounded-[8px] border border-[var(--color-border)] object-cover sm:block"
                  />
                ) : (
                  <div className="hidden min-h-28 rounded-[8px] border border-dashed border-[#b9b9b9] bg-[#e6e6e6] text-xs text-[var(--color-text-secondary)] sm:grid sm:place-items-center">
                    썸네일
                  </div>
                )}
              </div>
              {post.recentComment && (
                <p className="mt-5 rounded-[8px] bg-[var(--color-bg-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  최근 댓글 · {post.recentComment}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
      {posts.length > 0 && (
        <div className="mt-10 flex justify-center">
          {hasMore && nextOffset !== null ? (
            <Link
              href={buildCommunityHref(locale, { category, sort, q: query, offset: nextOffset })}
              className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--color-text-primary)] px-6 text-sm font-bold"
            >
              다음 게시글 보기 +
            </Link>
          ) : (
            <span className="text-sm text-[var(--color-text-secondary)]">마지막 게시글입니다</span>
          )}
        </div>
      )}
    </div>
  )
}

function chipClass(active: boolean) {
  return `rounded-[8px] px-4 py-2 text-sm font-semibold ${
    active
      ? 'bg-[var(--color-primary)] text-white'
      : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
  }`
}

function buildCommunityHref(
  locale: Locale,
  params: {
    category: CategoryFilter
    sort: CommunitySort
    q?: string
    offset?: number
  },
) {
  const search = new URLSearchParams()
  if (params.category !== 'all') search.set('category', params.category)
  if (params.sort !== 'popular') search.set('sort', params.sort)
  if (params.q?.trim()) search.set('q', params.q.trim())
  if (params.offset) search.set('offset', String(params.offset))
  const queryString = search.toString()
  return queryString ? `/${locale}/community?${queryString}` : `/${locale}/community`
}

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const hours = Math.max(1, Math.floor(diff / 1000 / 60 / 60))
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}
