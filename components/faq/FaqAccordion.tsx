'use client'

import { useMemo, useState } from 'react'
import { faqCategories, faqItems, type FaqCategory } from '@/lib/content/faq'

type CategoryFilter = FaqCategory | 'all'

export function FaqAccordion() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [query, setQuery] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['faq-1']))

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return faqItems
      .filter((item) => category === 'all' || item.category === category)
      .filter((item) => {
        if (!normalized) return true
        return `${item.question} ${item.answer}`.toLowerCase().includes(normalized)
      })
  }, [category, query])

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="rounded-[8px] border border-[var(--color-border)] bg-white p-5">
        <label className="flex min-h-14 items-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-5">
          <span className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="질문을 검색하세요"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {faqCategories.map((item) => (
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
      </div>
      {items.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          {query ? `'${query}'에 대한 결과가 없어요. 카카오톡으로 문의해주세요.` : '등록된 질문이 없어요.'}
        </p>
      ) : (
        <div className="mt-8 divide-y divide-[var(--color-border)] rounded-[8px] border border-[var(--color-border)] bg-white">
          {items.map((item) => {
            const open = openIds.has(item.id)
            const categoryLabel = faqCategories.find((categoryItem) => categoryItem.value === item.category)?.label
            return (
              <article key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  aria-expanded={open}
                >
                  <span>
                    <span className="mb-2 block text-xs font-semibold text-[var(--color-text-secondary)]">{categoryLabel}</span>
                    <span className="font-bold">{item.question}</span>
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xl text-[var(--color-text-secondary)]">
                    {open ? '−' : '+'}
                  </span>
                </button>
                {open && <p className="px-5 pb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.answer}</p>}
              </article>
            )
          })}
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
