'use client'

import { useMemo, useState } from 'react'
import { newsroomCategories, newsroomPosts, type NewsroomCategory } from '@/lib/content/newsroom'

type CategoryFilter = NewsroomCategory | 'all'

export function NewsroomBoard() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [query, setQuery] = useState('')

  const posts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return newsroomPosts
      .filter((post) => category === 'all' || post.category === category)
      .filter((post) => {
        if (!normalized) return true
        return `${post.title} ${post.excerpt}`.toLowerCase().includes(normalized)
      })
  }, [category, query])

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-[var(--color-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {newsroomCategories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={chipClass(category === item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="flex min-h-12 min-w-0 items-center rounded-[8px] border border-[var(--color-border)] bg-white px-4 lg:w-72">
          <span className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="소식 검색"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      {posts.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          {query ? `'${query}'에 대한 결과가 없어요.` : '아직 등록된 소식이 없어요.'}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white transition hover:shadow-md">
              <div className="grid aspect-[16/9] place-items-center border-b border-dashed border-[#b9b9b9] bg-[#e6e6e6] text-xs text-[var(--color-text-secondary)]">
                대표 이미지
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-[4px] bg-[#efefef] px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    {newsroomCategories.find((item) => item.value === post.category)?.label}
                  </span>
                  <time className="text-xs text-[var(--color-text-secondary)]" dateTime={post.publishedAt}>
                    {post.publishedAt}
                  </time>
                </div>
                <h2 className="mt-5 min-h-14 text-lg font-bold leading-snug">{post.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      {posts.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--color-text-primary)] px-6 text-sm font-bold"
          >
            더보기 +
          </button>
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
