'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { QrInstallModal } from '@/components/install/QrInstallModal'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'
import { isAppLive } from '@/lib/install/storeLinks'
import { getExternalLinks, launchCopy } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

type NavLabels = {
  home: string
  product: string
  reviews: string
  community: string
  articles: string
  newsroom: string
  faq: string
  login: string
  install: string
}

const navKeys = [
  'product',
  // 'reviews', // 실제 후기 데이터 연동 전까지 숨김
  'community',
  'articles',
  'newsroom',
  'faq',
] as const

export function HeaderNav({
  locale,
  appName,
  labels,
}: {
  locale: Locale
  appName: string
  labels: NavLabels
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const live = isAppLive()
  const links = getExternalLinks()

  const navItems = navKeys.map((key) => ({
    key,
    href: `/${locale}/${key === 'product' ? 'product' : key}`,
    label: labels[key],
  }))

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e7e7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[70px] w-full max-w-[1056px] items-center justify-between px-5 sm:px-6">
        <Link
          href={`/${locale}`}
          className="inline-flex h-8 items-center rounded-sm border border-[#cfcfcf] px-4 text-sm font-bold tracking-normal"
        >
          {appName}
        </Link>
        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`whitespace-nowrap font-medium ${
                isActive(pathname, item.href)
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[#8a8a8a] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher current={locale} />
          <Link
            href={`/${locale}/login`}
            className="rounded-pill px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]"
          >
            {labels.login}
          </Link>
          <HeaderCta live={live} locale={locale} betaForm={links.betaForm} installLabel={labels.install} />
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-xl lg:hidden"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '×' : '≡'}
        </button>
      </div>
      {open && (
        <div className="border-t border-[var(--color-border)] bg-white lg:hidden">
          <nav className="mx-auto flex w-full max-w-[1056px] flex-col px-5 py-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-sm px-2 py-3 text-base font-semibold ${
                  isActive(pathname, item.href)
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
              <LocaleSwitcher current={locale} />
              <Link href={`/${locale}/login`} onClick={() => setOpen(false)} className="text-sm font-semibold">
                {labels.login}
              </Link>
            </div>
            <div className="mt-4">
              <HeaderCta live={live} locale={locale} betaForm={links.betaForm} installLabel={labels.install} />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function HeaderCta({
  live,
  locale,
  betaForm,
  installLabel,
}: {
  live: boolean
  locale: Locale
  betaForm: string | null
  installLabel: string
}) {
  if (live) {
    return (
      <QrInstallModal surface="header" locale={locale}>
        {installLabel}
      </QrInstallModal>
    )
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
      <a
        href={betaForm ?? `/${locale}/install`}
        target={betaForm ? '_blank' : undefined}
        rel={betaForm ? 'noopener noreferrer' : undefined}
        className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white"
      >
        베타 신청
      </a>
      <span className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-[8px] bg-[#e9e9e9] px-5 py-2 text-center text-xs font-semibold leading-tight text-[var(--color-text-secondary)]">
        {launchCopy.betaLabel}
      </span>
    </div>
  )
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
