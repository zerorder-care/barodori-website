'use client'

import { useMemo, useState } from 'react'
import {
  parentReviews,
  reviewAgeGroups,
  reviewConditions,
  type ReviewAgeGroup,
  type ReviewCondition,
} from '@/lib/content/reviews'

type AgeFilter = ReviewAgeGroup | 'all'
type ConditionFilter = ReviewCondition | 'all'

export function ReviewsBoard() {
  const [age, setAge] = useState<AgeFilter>('all')
  const [condition, setCondition] = useState<ConditionFilter>('all')

  const reviews = useMemo(
    () =>
      parentReviews.filter((review) => {
        const ageMatches = age === 'all' || review.ageGroup === age
        const conditionMatches = condition === 'all' || review.condition === condition
        return ageMatches && conditionMatches
      }),
    [age, condition],
  )

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
              필터
            </p>
            <h2 className="mt-3 text-2xl font-bold">보호자 후기 둘러보기</h2>
          </div>
          <span className="text-sm text-[var(--color-text-secondary)]">최신순 ·</span>
        </div>
        <FilterGroup label="아이 개월 수">
          {reviewAgeGroups.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAge(item.value)}
              className={chipClass(age === item.value)}
            >
              {item.label}
            </button>
          ))}
        </FilterGroup>
        <FilterGroup label="증상">
          {reviewConditions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCondition(item.value)}
              className={chipClass(condition === item.value)}
            >
              {item.label}
            </button>
          ))}
        </FilterGroup>
      </div>
      {reviews.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          곧 다양한 보호자들의 후기를 만나보실 수 있습니다.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="min-h-80 rounded-[8px] border border-[var(--color-border)] bg-white p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex rounded-[4px] bg-[#efefef] px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  {review.babyAge}
                </p>
                <p className="text-sm font-bold">{'★'.repeat(review.rating)}</p>
              </div>
              <h2 className="mt-5 text-lg font-bold leading-snug">“{review.title}”</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{review.body}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span>{review.duration}</span>
                <time dateTime={review.writtenAt}>{review.writtenAt}</time>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="min-w-20 text-sm font-bold">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function chipClass(active: boolean) {
  return `rounded-pill px-4 py-2 text-sm font-semibold ${
    active
      ? 'bg-[var(--color-primary)] text-white'
      : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
  }`
}
