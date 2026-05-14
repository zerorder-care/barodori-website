import Link from 'next/link'
import type { FaqCategoryOption } from '@/lib/api/content'
import type { FaqItem } from '@/lib/content/faq'
import type { Locale } from '@/lib/i18n/config'

export function FaqAccordion({
  locale,
  categories,
  items,
  category,
  query,
  error,
}: {
  locale: Locale
  categories: FaqCategoryOption[]
  items: FaqItem[]
  category: string
  query: string
  error?: string
}) {
  const categoryLabelByValue = new Map(categories.map((item) => [item.value, item.label]))

  return (
    <div>
      <div className="rounded-[8px] border border-[var(--color-border)] bg-white p-5">
        <form action={`/${locale}/faq`} className="flex min-h-14 items-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-5">
          {category !== 'all' && <input type="hidden" name="category" value={category} />}
          <label htmlFor="faq-search" className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            검색
          </label>
          <input
            id="faq-search"
            name="q"
            defaultValue={query}
            placeholder="질문을 검색하세요"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link key={item.value} href={buildFaqHref(locale, item.value, query)} className={chipClass(category === item.value)}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {error && (
        <p className="mt-5 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
          FAQ 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}
      {items.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          {query ? `'${query}'에 대한 결과가 없어요. 카카오톡으로 문의해주세요.` : '등록된 질문이 없어요.'}
        </p>
      ) : (
        <div className="mt-8 divide-y divide-[var(--color-border)] rounded-[8px] border border-[var(--color-border)] bg-white">
          {items.map((item, index) => {
            const categoryLabel = categoryLabelByValue.get(item.category)
            return (
              <details key={item.id} className="group" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left">
                  <span>
                    {categoryLabel && (
                      <span className="mb-2 block text-xs font-semibold text-[var(--color-text-secondary)]">{categoryLabel}</span>
                    )}
                    <span className="font-bold">{item.question}</span>
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xl text-[var(--color-text-secondary)] group-open:hidden">
                    +
                  </span>
                  <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xl text-[var(--color-text-secondary)] group-open:grid">
                    -
                  </span>
                </summary>
                <p className="px-5 pb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.answer}</p>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}

function buildFaqHref(locale: Locale, category: string, query: string): string {
  const params = new URLSearchParams()
  if (category !== 'all') params.set('category', category)
  if (query.trim()) params.set('q', query.trim())
  const suffix = params.toString()
  return suffix ? `/${locale}/faq?${suffix}` : `/${locale}/faq`
}

function chipClass(active: boolean) {
  return `rounded-[8px] px-4 py-2 text-sm font-semibold ${
    active
      ? 'bg-[var(--color-primary)] text-white'
      : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
  }`
}
