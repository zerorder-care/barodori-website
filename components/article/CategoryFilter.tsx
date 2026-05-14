'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { categories, categoryLabels, type Category } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export function CategoryFilter({ locale }: { locale: Locale }) {
  const params = useSearchParams()
  const current = params.get('cat') as Category | null
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href={`/${locale}/articles`}
        className={`rounded-[8px] px-4 py-2 text-sm font-semibold ${
          current === null
            ? 'bg-[var(--color-primary)] text-white'
            : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]'
        }`}
      >
        전체
      </Link>
      {categories.map((c) => (
        <Link
          key={c}
          href={`/${locale}/articles?cat=${c}`}
          className={`rounded-[8px] px-4 py-2 text-sm font-semibold ${
            current === c
              ? 'bg-[var(--color-primary)] text-white'
              : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]'
          }`}
        >
          {categoryLabels[c][locale]}
        </Link>
      ))}
    </nav>
  )
}
