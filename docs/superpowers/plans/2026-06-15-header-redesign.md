# 헤더 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 헤더에서 낡은 출시전 CTA를 제거하고 우측 액션을 "시작하기" 단일 소셜 로그인 버튼으로 통합하며, 심볼+워드마크 로고와 A+C 플로팅 캡슐 비주얼로 재디자인한다.

**Architecture:** 기존 `HeaderNav`(client component)를 리라이트한다. 브랜드 심볼은 새 인라인 SVG 컴포넌트 `BarodoriMark`로 분리한다. i18n에 `nav.start` 키를 추가한다. 로그인 상태 폴링·로그아웃·로케일 스왑·모바일 토글 등 기존 동작은 보존한다.

**Tech Stack:** Next.js(App Router) · React client component · Tailwind CSS v4(테마 토큰 CSS 변수) · vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-06-15-header-redesign-design.md`

---

## File Structure

- `messages/ko.json`, `messages/en.json` — `nav.start` 추가.
- `components/layout/BarodoriMark.tsx` — 신규. 브랜드 심볼 인라인 SVG.
- `components/layout/BarodoriMark.test.tsx` — 신규. 심볼 렌더 테스트.
- `components/layout/HeaderNav.tsx` — 리라이트. 컨테이너/로고/내비/우측/모바일 + CTA 제거.
- `components/layout/HeaderNav.test.tsx` — 신규. 동작 회귀 테스트.
- `app/globals.css` — `scroll-padding-top` 상향.
- (변경 없음) `components/layout/Header.tsx`, `components/layout/LocaleSwitcher.tsx`, `components/install/QrInstallModal.tsx`(삭제하지 않음, 헤더 렌더만 사라짐).

---

## Task 1: i18n — `nav.start` 키 추가

**Files:**
- Modify: `messages/ko.json` (`nav` 블록)
- Modify: `messages/en.json` (`nav` 블록)

> 두 파일 모두에 추가해야 한다. `Dictionary` 타입은 `typeof koMessages`라서 ko에만 추가하면 en 누락으로 타입 에러가 난다.

- [ ] **Step 1: ko.json에 `start` 추가**

`messages/ko.json`의 `nav` 안 `"install": "앱 시작하기"` 줄을 다음으로 교체(끝에 `start` 추가):

```json
    "install": "앱 시작하기",
    "start": "시작하기"
```

- [ ] **Step 2: en.json에 `start` 추가**

`messages/en.json`의 `nav` 안 `"install": "Start the app"` 줄을 다음으로 교체:

```json
    "install": "Start the app",
    "start": "Get started"
```

- [ ] **Step 3: 타입체크로 검증**

Run: `npm run typecheck`
Expected: 통과(에러 없음). `dict.nav.start`가 양쪽 로케일에 존재.

- [ ] **Step 4: Commit**

```bash
git add messages/ko.json messages/en.json
git commit -m "i18n: add nav.start label for unified header CTA"
```

---

## Task 2: `BarodoriMark` 심볼 컴포넌트

**Files:**
- Create: `components/layout/BarodoriMark.tsx`
- Test: `components/layout/BarodoriMark.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`components/layout/BarodoriMark.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BarodoriMark } from './BarodoriMark'

describe('BarodoriMark', () => {
  it('renders an svg and forwards className', () => {
    const { container } = render(<BarodoriMark className="h-7 w-7" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveClass('h-7', 'w-7')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run components/layout/BarodoriMark.test.tsx`
Expected: FAIL — `BarodoriMark` 모듈/컴포넌트 없음.

- [ ] **Step 3: 컴포넌트 구현**

`components/layout/BarodoriMark.tsx`:

```tsx
export function BarodoriMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="16.5" fill="#A9C3EA" stroke="#111827" strokeWidth="3" />
      <path
        d="M12.5 25.5 C 16 19.5, 23.5 17.5, 28.5 15.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run components/layout/BarodoriMark.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/layout/BarodoriMark.tsx components/layout/BarodoriMark.test.tsx
git commit -m "feat: add BarodoriMark brand symbol component"
```

---

## Task 3: `HeaderNav` 리라이트 (CTA 제거 + 시작하기 통합 + 비주얼)

**Files:**
- Modify(전면 교체): `components/layout/HeaderNav.tsx`
- Test: `components/layout/HeaderNav.test.tsx`

- [ ] **Step 1: 실패하는 동작 테스트 작성**

`components/layout/HeaderNav.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HeaderNav } from './HeaderNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/ko',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const labels = {
  home: '홈',
  product: '기능 소개',
  reviews: '후기',
  community: '커뮤니티',
  articles: '홈케어 노트',
  newsroom: '소식',
  faq: '자주 묻는 질문',
  login: '로그인',
  logout: '로그아웃',
  mypage: '마이페이지',
  install: '앱 시작하기',
  start: '시작하기',
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ authenticated: false }) })),
  )
})

describe('HeaderNav', () => {
  it('logged out: shows a "시작하기" action linking to /login', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    const cta = await screen.findByRole('link', { name: '시작하기' })
    expect(cta).toHaveAttribute('href', '/ko/login')
  })

  it('does not render the outdated launch CTA or dead status label', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    await screen.findByRole('link', { name: '기능 소개' })
    expect(screen.queryByText('오픈 소식 받기')).toBeNull()
    expect(screen.queryByText('홈케어 운동 기록 앱')).toBeNull()
  })

  it('renders the primary nav items', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    expect(await screen.findByRole('link', { name: '커뮤니티' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈케어 노트' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run components/layout/HeaderNav.test.tsx`
Expected: FAIL — 현재 헤더는 "시작하기" 링크가 없고 "오픈 소식 받기"/"홈케어 운동 기록 앱"이 존재.

- [ ] **Step 3: `HeaderNav.tsx` 전면 교체**

`components/layout/HeaderNav.tsx` 전체를 다음으로 교체:

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarodoriMark } from '@/components/layout/BarodoriMark'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'
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
  logout: string
  mypage: string
  install: string
  start: string
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
        <Link href={`/${locale}`} aria-label={appName} className="inline-flex items-center gap-2">
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
                className={`relative whitespace-nowrap py-1.5 font-medium ${
                  active
                    ? 'font-semibold text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run components/layout/HeaderNav.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: 타입체크 + 린트**

Run: `npm run typecheck && npm run lint`
Expected: 통과. (제거된 `isAppLive`/`getExternalLinks`/`launchCopy`/`QrInstallModal` import이 사라져 unused 경고도 없음.)

- [ ] **Step 6: Commit**

```bash
git add components/layout/HeaderNav.tsx components/layout/HeaderNav.test.tsx
git commit -m "feat: redesign header — unify CTA to 시작하기, floating capsule, symbol logo"
```

---

## Task 4: 플로팅 캡슐에 맞춰 `scroll-padding-top` 상향

**Files:**
- Modify: `app/globals.css`

> 떠 있는 캡슐(상단 여백 12px + 캡슐 62px ≈ 74px + 여유)을 고려해 앵커 스크롤 시 캡슐에 가리지 않도록 한다.

- [ ] **Step 1: 값 변경**

`app/globals.css`의 다음 줄

```css
  scroll-padding-top: 72px;
```

을 다음으로 교체:

```css
  scroll-padding-top: 88px;
```

- [ ] **Step 2: 검증**

Run: `npm run build`
Expected: 빌드 성공.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: bump scroll-padding-top for floating header capsule"
```

---

## Task 5: 최종 검증 (전체 스위트 + 수동 확인)

**Files:** 없음 (검증만)

- [ ] **Step 1: 전체 테스트 + 타입 + 린트**

Run: `npm test && npm run typecheck && npm run lint`
Expected: 모두 통과.

- [ ] **Step 2: 수동 확인 (dev 서버)**

Run: `npm run dev` 후 `http://localhost:3000/ko` 확인.
Expected:
- 떠 있는 둥근 캡슐 헤더, 심볼+"바로도리" 로고, 활성 메뉴 옐로우 인디케이터.
- 우측에 "시작하기" 솔리드 옐로우 버튼 1개(클릭 → `/ko/login`).
- "오픈 소식 받기" 버튼·"홈케어 운동 기록 앱" 라벨 없음.
- 스크롤 시 그림자 진해짐.
- 모바일 폭(<1024px): 햄버거 → 둥근 패널, 활성 메뉴 옐로우 배경, 하단 "시작하기" 풀폭 버튼.
- 로그인 후: "시작하기" 자리가 마이페이지·로그아웃으로 전환(세션 쿠키가 있을 때).

- [ ] **Step 3: 마무리**

`superpowers:finishing-a-development-branch` 스킬로 통합 방식(현재 `main`이므로 그대로 둘지, 별도 처리할지)을 결정한다.

---

## Self-Review (작성자 점검 결과)

**Spec coverage:**
- 낡은 CTA 제거(베타 폼+상태 라벨+QR) → Task 3 (HeaderNav에서 `HeaderCta` 삭제). ✔
- "시작하기" 단일 버튼(→ /login) → Task 3 `AuthArea`. ✔
- 로그인 후 마이페이지·로그아웃 → Task 3. ✔
- 심볼+워드마크 로고 → Task 2 + Task 3. ✔
- 플로팅 캡슐 + 블러 + 스크롤 그림자 + 옐로우 인디케이터 → Task 3. ✔
- 내비 5개 + 후기 숨김 → Task 3 `navKeys`. ✔
- i18n `nav.start` (ko/en) → Task 1. ✔
- 동작 보존(세션 폴링/로그아웃/로케일/모바일 토글/aria) → Task 3 코드에 포함. ✔
- `scroll-padding-top` 상향 → Task 4. ✔
- `QrInstallModal`·`launchCopy` 삭제 안 함(헤더 참조만 제거) → Task 3는 import만 제거. ✔

**Placeholder scan:** 모든 코드 단계에 완전한 코드/명령/기대결과 포함. 플레이스홀더 없음. ✔

**Type consistency:** `NavLabels`에 `start: string` 추가, `AuthArea`는 `Pick<NavLabels,'logout'|'mypage'|'start'>` 사용. `BarodoriMark`는 `{ className?: string }` — Task 2 정의와 Task 3 사용(`className="h-7 w-7"`) 일치. ✔
