'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarodoriMark } from '@/components/layout/BarodoriMark'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'
import type { Locale } from '@/lib/i18n/config'

type NavLabels = {
  community: string
  articles: string
  newsroom: string
  faq: string
  logout: string
  mypage: string
  start: string
}

const navKeys = [
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
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const navItems = navKeys.map((key) => ({
    key,
    href: `/${locale}/${key}`,
    label: labels[key],
  }))

  useEffect(() => {
    let mounted = true
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => {
        if (mounted) setAuthenticated(Boolean(data.authenticated))
      })
      .catch(() => {
        if (mounted) setAuthenticated(false)
      })

    return () => {
      mounted = false
    }
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 브라우저 뒤로/앞으로(popstate) 시 모바일 메뉴를 닫는다. (링크 클릭은 각 onClick에서 처리)
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => null)
    setAuthenticated(false)
    setOpen(false)
    if (pathname.startsWith(`/${locale}/mypage`)) {
      router.push(`/${locale}/login`)
    }
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6">
      <div
        className={`mx-auto flex h-[62px] w-full max-w-[1056px] items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 backdrop-blur transition-shadow sm:px-5 ${
          scrolled
            ? 'shadow-[0_10px_30px_rgba(17,24,39,0.10)]'
            : 'shadow-[0_4px_16px_rgba(17,24,39,0.05)]'
        }`}
      >
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <BarodoriMark className="h-7 w-7" />
          <span className="text-[17px] font-bold tracking-tight text-[var(--color-text-primary)]">
            {appName}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative whitespace-nowrap py-1.5 ${
                  active
                    ? 'font-semibold text-[var(--color-text-primary)]'
                    : 'font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LocaleSwitcher current={locale} />
          <AuthArea
            authenticated={authenticated}
            locale={locale}
            labels={labels}
            onLogout={handleLogout}
          />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-xl lg:hidden"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '×' : '≡'}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 w-full max-w-[1056px] rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-[0_12px_30px_rgba(17,24,39,0.10)] lg:hidden">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-[10px] px-3.5 py-3 text-base font-semibold ${
                    active
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="my-2 h-px bg-[var(--color-border)]" />

          <div className="flex items-center justify-between px-2 py-1">
            <LocaleSwitcher current={locale} />
            {authenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                {labels.logout}
              </button>
            )}
          </div>

          {authenticated ? (
            <Link
              href={`/${locale}/mypage`}
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl border border-[var(--color-border)] px-4 py-3 text-center text-base font-semibold text-[var(--color-text-primary)]"
            >
              {labels.mypage}
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl bg-[var(--color-primary)] px-4 py-3 text-center text-base font-bold text-[var(--color-text-primary)]"
            >
              {labels.start}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

function AuthArea({
  authenticated,
  locale,
  labels,
  onLogout,
}: {
  authenticated: boolean
  locale: Locale
  labels: Pick<NavLabels, 'logout' | 'mypage' | 'start'>
  onLogout: () => void
}) {
  if (!authenticated) {
    return (
      <Link
        href={`/${locale}/login`}
        className="inline-flex h-[38px] items-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-text-primary)]"
      >
        {labels.start}
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/${locale}/mypage`}
        className="rounded-pill px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]"
      >
        {labels.mypage}
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-pill px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]"
      >
        {labels.logout}
      </button>
    </div>
  )
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
