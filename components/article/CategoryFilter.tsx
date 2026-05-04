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
        className={`rounded-pill px-4 py-1.5 text-sm ${
          current === null ? 'bg-black text-white' : 'bg-[--color-bg-muted]'
        }`}
      >
        전체
      </Link>
      {categories.map((c) => (
        <Link
          key={c}
          href={`/${locale}/articles?cat=${c}`}
          className={`rounded-pill px-4 py-1.5 text-sm ${
            current === c ? 'bg-black text-white' : 'bg-[--color-bg-muted]'
          }`}
        >
          {categoryLabels[c][locale]}
        </Link>
      ))}
    </nav>
  )
}
