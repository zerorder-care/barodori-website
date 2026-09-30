import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'

export type FaqItem = {
  id: string
  question: string
  answer: string
  href: string
}

export type FaqAccordionLabels = {
  searchLabel: string
  searchPlaceholder: string
  loadError: string
  empty: string
  emptyWithQuery: string
  readMore: string
}

export function FaqAccordion({
  locale,
  items,
  query,
  error,
  labels,
}: {
  locale: Locale
  items: FaqItem[]
  query: string
  error?: string
  labels: FaqAccordionLabels
}) {
  return (
    <div>
      <div className="rounded-[8px] border border-[var(--color-border)] bg-white p-5">
        <form
          action={`/${locale}/faq`}
          className="flex min-h-14 items-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-5"
        >
          <label htmlFor="faq-search" className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            {labels.searchLabel}
          </label>
          <input
            id="faq-search"
            name="q"
            defaultValue={query}
            placeholder={labels.searchPlaceholder}
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>
      </div>
      {error && (
        <p className="mt-5 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
          {labels.loadError}
        </p>
      )}
      {items.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          {query ? labels.emptyWithQuery.replace('{query}', query) : labels.empty}
        </p>
      ) : (
        <div className="mt-8 divide-y divide-[var(--color-border)] rounded-[8px] border border-[var(--color-border)] bg-white">
          {items.map((item, index) => (
            <details key={item.id} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left">
                <span className="font-bold">{item.question}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xl text-[var(--color-text-secondary)] group-open:hidden">
                  +
                </span>
                <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xl text-[var(--color-text-secondary)] group-open:grid">
                  -
                </span>
              </summary>
              <div className="px-5 pb-6">
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.answer}</p>
                <Link
                  href={item.href}
                  aria-label={`${item.question} ${labels.readMore}`}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--color-primary-dark)] underline"
                >
                  {labels.readMore}
                </Link>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
