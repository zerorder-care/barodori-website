'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { defaultLocale, type Locale } from '@/lib/i18n/config'
import { getStaticDictionary, isLocale } from '@/lib/i18n/dictionary'

export default function HeadTestError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const dict = getStaticDictionary(locale)

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-[var(--color-primary-light)] text-3xl font-bold text-[var(--color-primary-dark)]">
        !
      </div>
      <h1 className="mt-8 text-2xl font-bold">{dict.errors.temporaryTitle}</h1>
      <p className="mt-3 max-w-md text-[var(--color-text-secondary)]">{dict.errors.temporaryBody}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={unstable_retry}
          className="rounded-pill bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--color-text-primary)]"
        >
          {dict.errors.retry}
        </button>
        <Link
          href={`/${locale}`}
          className="rounded-pill border border-[var(--color-border)] px-6 py-3 text-sm font-bold"
        >
          {dict.errors.homeCta}
        </Link>
      </div>
    </div>
  )
}

function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split('/')[1]
  return isLocale(segment) ? segment : defaultLocale
}
