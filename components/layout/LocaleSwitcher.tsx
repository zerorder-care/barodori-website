'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-2 text-sm">
      {locales.map((l) => {
        const target = swapLocale(pathname, current, l)
        return (
          <Link
            key={l}
            href={target}
            className={l === current ? 'font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}
          >
            {l.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}

function swapLocale(pathname: string, from: Locale, to: Locale): string {
  if (pathname === `/${from}`) return `/${to}`
  if (pathname.startsWith(`/${from}/`)) return pathname.replace(`/${from}/`, `/${to}/`)
  return `/${to}`
}
