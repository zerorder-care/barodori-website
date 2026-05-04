# 바로도리 웹사이트 MVP 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 바로도리 제품 마케팅 사이트 MVP 구현 — 홈/제품/아티클(목록·상세)/설치/정책 페이지, 한국어 우선 i18n 셸, MDX 기반 아티클, GA4+Amplitude 분석, 외부 Google Form 베타 신청.

**Architecture:** Next.js 16 App Router 풀-SSG. `app/[locale]/...` 동적 segment + `proxy.ts` 루트 리다이렉트. MDX는 `@next/mdx`로 파일-라우트 매핑 대신 콘텐츠 디렉토리(`content/articles/{locale}/*.mdx`)를 frontmatter 인덱스로 빌드 타임 로드 → `[slug]` 동적 라우트 SSG. 디자인 토큰은 Flutter `DsColors`(primary `#FFB700`) 재사용, Tailwind v4 + Pretendard.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript 5, Tailwind v4, `@next/mdx` + `gray-matter` + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`, vitest (lib 단위 테스트), Pretendard 셀프호스트, GA4 + Amplitude.

**기준 spec:** `docs/superpowers/specs/2026-05-04-barodori-website-mvp-design.md`

---

## ⚠ Next.js 16 핵심 변경 (모든 task가 따라야 함)

1. **`middleware.ts` deprecated → `proxy.ts`** 루트에 위치
2. **`params`/`searchParams` 는 모두 Promise** — page/layout/`generateMetadata` 모두 `await params`
3. **MDX**: `@next/mdx` + 루트의 `mdx-components.tsx` (`useMDXComponents()`) 파일 필수
4. **i18n 빌트인 없음** — `app/[locale]/...` + `proxy.ts` 패턴
5. **JSON-LD**: `next/script` 사용 금지, raw `<script type="application/ld+json">` + `dangerouslySetInnerHTML`
6. **`sitemap.ts` / `robots.ts`** 의 리턴 타입은 `MetadataRoute.Sitemap` / `MetadataRoute.Robots`

---

## Task 0: 보일러플레이트 정리 + 의존성 설치

**Files:**
- Delete: `app/page.tsx` (create-next-app boilerplate), `app/favicon.ico` (placeholder)
- Modify: `app/layout.tsx`, `app/globals.css`, `package.json`, `next.config.ts`
- Create: `vitest.config.ts`, `tsconfig.json`(paths), `.env.example`, `.gitignore` 업데이트

- [ ] **Step 1: 의존성 설치**

```bash
cd /Users/bob/Projects/zerorder/barodori-website
npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter remark-gfm rehype-slug rehype-autolink-headings reading-time
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/mdx
```

- [ ] **Step 2: 보일러플레이트 삭제**

```bash
rm app/page.tsx app/favicon.ico public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

- [ ] **Step 3: `tsconfig.json` 에 경로 alias 추가**

`compilerOptions.paths` 에 다음 추가:
```json
{
  "paths": {
    "@/*": ["./*"],
    "@/components/*": ["./components/*"],
    "@/lib/*": ["./lib/*"],
    "@/content/*": ["./content/*"],
    "@/messages/*": ["./messages/*"]
  }
}
```

- [ ] **Step 4: `next.config.ts` 작성**

```ts
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})

export default withMDX(nextConfig)
```

- [ ] **Step 5: `vitest.config.ts` 작성**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['lib/**/*.test.ts', 'lib/**/*.test.tsx', 'components/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
```

`vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: `.env.example` 작성**

```
NEXT_PUBLIC_SITE_URL=https://barodori.com
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_AMPLITUDE_KEY=
NEXT_PUBLIC_IOS_APP_URL=
NEXT_PUBLIC_ANDROID_APP_URL=
NEXT_PUBLIC_BETA_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSdtjPH3oBmPJHYUsV7pv_sQJTbqicq8EQi-ELSUp2ScLH9-jw/viewform
```

- [ ] **Step 7: `.gitignore` 업데이트**

기존에 추가:
```
.env*.local
.idea/
*.tsbuildinfo
```

- [ ] **Step 8: `package.json` scripts 보강**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 9: 빌드 검증은 다음 task로 미룸**

`app/page.tsx` 가 삭제되어 현재 라우트 0개. Next.js 16 은 라우트 0인 상태에서 `next build` 가 실패할 수 있음. 첫 빌드 검증은 Task 3 (locale 라우팅 도입) 에서 수행. 이 task는 의존성/설정만 추가하고 commit.

```bash
npm run typecheck   # 타입 체크는 통과해야 함
npm run test        # 아직 테스트 파일 없음 — "no tests found" OK
```

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts vitest.setup.ts .env.example .gitignore app/ public/
git commit -m "chore: bootstrap MDX/vitest deps, strip create-next-app boilerplate"
```

---

## Task 1: 디자인 토큰 + 글로벌 CSS + Pretendard

**Files:**
- Create: `lib/design/tokens.ts`, `public/fonts/` (Pretendard subset)
- Modify: `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Pretendard 셀프호스트**

```bash
mkdir -p public/fonts
curl -L -o public/fonts/Pretendard-Regular.woff2 https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/static/woff2-subset/Pretendard-Regular.subset.woff2
curl -L -o public/fonts/Pretendard-Medium.woff2 https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/static/woff2-subset/Pretendard-Medium.subset.woff2
curl -L -o public/fonts/Pretendard-SemiBold.woff2 https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/static/woff2-subset/Pretendard-SemiBold.subset.woff2
curl -L -o public/fonts/Pretendard-Bold.woff2 https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/static/woff2-subset/Pretendard-Bold.subset.woff2
ls -la public/fonts/
```

받은 파일 크기 > 0 확인. 다운로드 실패하면 `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/...` 로 대체.

- [ ] **Step 2: `lib/design/tokens.ts` 작성**

```ts
export const colors = {
  primary: '#FFB700',
  primaryLight: '#FFF3D6',
  primaryDark: '#E6A500',
  bg: '#FFFFFF',
  bgMuted: '#F8FAFC',
  textPrimary: '#000000',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
} as const

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 9999,
} as const

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const
```

- [ ] **Step 3: `app/globals.css` 전체 교체**

```css
@import "tailwindcss";

@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/Pretendard-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/Pretendard-SemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/Pretendard-Bold.woff2') format('woff2');
}

:root {
  --color-primary: #FFB700;
  --color-primary-light: #FFF3D6;
  --color-primary-dark: #E6A500;
  --color-bg: #FFFFFF;
  --color-bg-muted: #F8FAFC;
  --color-text-primary: #000000;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  --color-success: #10B981;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 9999px;
  --font-sans: 'Pretendard', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

@theme inline {
  --color-primary: var(--color-primary);
  --color-primary-light: var(--color-primary-light);
  --color-primary-dark: var(--color-primary-dark);
  --color-bg: var(--color-bg);
  --color-bg-muted: var(--color-bg-muted);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-border: var(--color-border);
  --color-danger: var(--color-danger);
  --color-warning: var(--color-warning);
  --color-success: var(--color-success);
  --font-sans: var(--font-sans);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
}

html, body {
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
```

- [ ] **Step 4: `app/layout.tsx` 단순화 (locale 무관 셸만 유지)**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'),
  title: {
    default: '바로도리',
    template: '%s | 바로도리',
  },
  description: '영아 사경/사두를 위한 가정 케어 앱',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
```

`<html>` 의 `lang` 은 `app/[locale]/layout.tsx` 에서 set (locale별).

- [ ] **Step 5: 빌드 통과 확인**

```bash
npm run build
```

라우트는 여전히 0이지만 globals/font 설정 빌드 통과 확인.

- [ ] **Step 6: Commit**

```bash
git add public/fonts app/globals.css app/layout.tsx lib/design/
git commit -m "feat(design): add Pretendard font + DsColors-based design tokens"
```

---

## Task 2: i18n config + dictionary loader (TDD)

**Files:**
- Create: `lib/i18n/config.ts`, `lib/i18n/dictionary.ts`, `lib/i18n/dictionary.test.ts`, `messages/ko.json`, `messages/en.json`

- [ ] **Step 1: 실패 테스트 작성**

`lib/i18n/dictionary.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getDictionary, t, isLocale } from './dictionary'

describe('i18n dictionary', () => {
  it('isLocale validates supported locales', () => {
    expect(isLocale('ko')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('ja')).toBe(false)
    expect(isLocale('')).toBe(false)
  })

  it('getDictionary returns ko messages', async () => {
    const dict = await getDictionary('ko')
    expect(dict.common.appName).toBe('바로도리')
  })

  it('getDictionary returns en messages', async () => {
    const dict = await getDictionary('en')
    expect(dict.common.appName).toBe('BaroDori')
  })

  it('t looks up nested keys with dot notation', async () => {
    const dict = await getDictionary('ko')
    expect(t(dict, 'common.appName')).toBe('바로도리')
  })

  it('t falls back to key string when missing', async () => {
    const dict = await getDictionary('ko')
    expect(t(dict, 'nonexistent.key')).toBe('nonexistent.key')
  })
})
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

```bash
npm run test
```

Expected: `Cannot find module './dictionary'`

- [ ] **Step 3: `lib/i18n/config.ts` 작성**

```ts
export const locales = ['ko', 'en'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'ko'

export const localeLabels: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
}

// 영문 셸은 noindex (콘텐츠 부족)
export const indexableLocales: Locale[] = ['ko']
```

- [ ] **Step 4: 메시지 파일 시드**

`messages/ko.json`:
```json
{
  "common": {
    "appName": "바로도리",
    "install": "앱 설치",
    "comingSoon": "출시 예정",
    "betaSignup": "베타 서포터즈 신청"
  },
  "nav": {
    "home": "홈",
    "product": "제품 소개",
    "articles": "사경 아티클",
    "install": "앱 설치"
  },
  "footer": {
    "tagline": "아기의 작은 고개, 바로도리에서 함께 살펴봐요",
    "privacy": "개인정보처리방침",
    "terms": "이용약관",
    "copyright": "© {year} 제로더(Zerorder)"
  },
  "medical": {
    "title": "의료 안내",
    "body": "바로도리는 의료기관의 진단을 대체하지 않습니다. 통증, 강한 울음, 발열, 호흡 이상, 신경학적 이상이 있으면 즉시 병원 진료를 받으세요."
  },
  "comingSoonNotice": "2026-05-20 베타 출시 예정입니다. 베타 서포터즈로 먼저 만나보세요."
}
```

`messages/en.json`:
```json
{
  "common": {
    "appName": "BaroDori",
    "install": "Install app",
    "comingSoon": "Coming soon",
    "betaSignup": "Join beta supporters"
  },
  "nav": {
    "home": "Home",
    "product": "Product",
    "articles": "Articles",
    "install": "Install"
  },
  "footer": {
    "tagline": "Care for your baby's little neck, together with BaroDori",
    "privacy": "Privacy",
    "terms": "Terms",
    "copyright": "© {year} Zerorder"
  },
  "medical": {
    "title": "Medical Notice",
    "body": "BaroDori does not replace medical diagnosis. If your baby shows signs of pain, intense crying, fever, breathing issues, or neurological symptoms, seek medical attention immediately."
  },
  "comingSoonNotice": "Launching beta on 2026-05-20. Sign up as a supporter to get early access."
}
```

- [ ] **Step 5: `lib/i18n/dictionary.ts` 작성**

```ts
import { locales, type Locale } from './config'
import koMessages from '@/messages/ko.json'
import enMessages from '@/messages/en.json'

const dictionaries = {
  ko: koMessages,
  en: enMessages,
} as const

export type Dictionary = typeof koMessages

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]
}

export function t(dict: Dictionary, key: string): string {
  const segments = key.split('.')
  let cur: unknown = dict
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in cur) {
      cur = (cur as Record<string, unknown>)[seg]
    } else {
      return key
    }
  }
  return typeof cur === 'string' ? cur : key
}
```

`tsconfig.json` 에 `"resolveJsonModule": true` 가 이미 next 기본값으로 켜져있음. 안 되면 추가.

- [ ] **Step 6: 테스트 통과 확인**

```bash
npm run test
```

Expected: 5 tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/i18n messages
git commit -m "feat(i18n): add locale config + dictionary loader (TDD)"
```

---

## Task 3: `proxy.ts` 루트 리다이렉트 + `[locale]` 셸

**Files:**
- Create: `proxy.ts`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx` (임시 placeholder)
- Delete: `app/page.tsx` 가 이미 없으면 skip

- [ ] **Step 1: `proxy.ts` 작성**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n/config'

const PUBLIC_FILE = /\.(.*)$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 정적 파일/_next/api 패스
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // 이미 locale prefix 있음
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (hasLocale) return NextResponse.next()

  // /sitemap.xml, /robots.txt 등 metadata 라우트는 pass
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next()
  }

  // Accept-Language 또는 default 로 리다이렉트
  const accept = request.headers.get('accept-language') ?? ''
  const target = locales.find((l) => accept.toLowerCase().includes(l)) ?? defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${target}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\.).*)'],
}
```

- [ ] **Step 2: `app/[locale]/layout.tsx` 작성**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, getDictionary } from '@/lib/i18n/dictionary'
import { locales, indexableLocales, type Locale } from '@/lib/i18n/config'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const noindex = !indexableLocales.includes(locale as Locale)
  return {
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  // dict 는 children에 props로 못 내리므로 server component tree에서 fetch
  await getDictionary(locale)
  return <>{children}</>
}
```

`<html lang>` 은 root layout 한 번만 set 가능 (App Router 제약). 따라서 root layout에서 미들웨어로 lang을 동적으로 설정 못함 → 대안: root layout 에서 placeholder `lang="ko"` 두고, 클라이언트에서 `useEffect` 로 교체… 는 SSR 깨짐. **결정**: `app/layout.tsx` 에서 `lang="ko"` 고정 (default), 영문 페이지에서 `<html lang>` 차이는 SEO에 미세 영향이라 hreflang 으로 보완. 영문 콘텐츠 본격 도입 시 layout 분기 재검토.

`app/layout.tsx` 수정:
```tsx
<html lang="ko" className="h-full antialiased">
```

- [ ] **Step 3: `app/[locale]/page.tsx` 임시 placeholder**

```tsx
import { isLocale } from '@/lib/i18n/dictionary'
import { notFound } from 'next/navigation'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">바로도리 ({locale})</h1>
      <p>홈 페이지 — Task 11에서 완성됩니다.</p>
    </main>
  )
}
```

- [ ] **Step 4: 빌드 + 동작 확인**

```bash
npm run build
npm run dev
```

다른 터미널에서:
```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/ko
curl -I http://localhost:3000/en
```

Expected: `/` → 308 → `/ko`, `/ko` 200, `/en` 200 (HTML 안에 `<meta name="robots" content="noindex">`).

- [ ] **Step 5: 빌드 결과 확인**

`next build` 출력에 `● /[locale]` (static) 으로 표시되는지 확인. ko/en 양쪽이 generateStaticParams 로 사전 생성되는지.

- [ ] **Step 6: Commit**

```bash
git add proxy.ts app/[locale] app/layout.tsx
git commit -m "feat(i18n): add proxy.ts root redirect + [locale] segment shell"
```

---

## Task 4: MDX 컴포넌트 화이트리스트 + `mdx-components.tsx`

**Files:**
- Create: `mdx-components.tsx` (루트), `components/article/mdx/Callout.tsx`, `components/article/mdx/MedicalNotice.tsx`, `components/article/mdx/ExerciseCard.tsx`, `components/article/mdx/RelatedArticlesInline.tsx`

- [ ] **Step 1: `components/article/mdx/Callout.tsx`**

```tsx
import type { ReactNode } from 'react'

type Props = {
  type?: 'info' | 'warning' | 'medical'
  children: ReactNode
}

const styles: Record<NonNullable<Props['type']>, string> = {
  info: 'border-l-4 border-[--color-primary] bg-[--color-primary-light] text-[--color-text-primary]',
  warning: 'border-l-4 border-[--color-warning] bg-amber-50 text-[--color-text-primary]',
  medical: 'border-l-4 border-[--color-danger] bg-red-50 text-[--color-text-primary]',
}

export function Callout({ type = 'info', children }: Props) {
  return (
    <aside className={`my-6 rounded-md p-4 ${styles[type]}`} role="note">
      {children}
    </aside>
  )
}
```

- [ ] **Step 2: `components/article/mdx/MedicalNotice.tsx`**

```tsx
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

export async function MedicalNotice({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return (
    <aside
      role="note"
      aria-label={dict.medical.title}
      className="my-8 rounded-lg border border-[--color-danger] bg-red-50 p-5"
    >
      <p className="font-semibold text-[--color-danger]">{dict.medical.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[--color-text-primary]">
        {dict.medical.body}
      </p>
    </aside>
  )
}
```

- [ ] **Step 3: `components/article/mdx/ExerciseCard.tsx`**

```tsx
import type { ReactNode } from 'react'

type Props = {
  title: string
  duration?: string
  cautions?: ReactNode
  children?: ReactNode
}

export function ExerciseCard({ title, duration, cautions, children }: Props) {
  return (
    <section className="my-6 rounded-lg border border-[--color-border] bg-white p-5 shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-lg font-semibold">{title}</h3>
        {duration && (
          <span className="text-sm text-[--color-text-secondary]">{duration}</span>
        )}
      </header>
      {children && <div className="mt-3 text-sm leading-relaxed">{children}</div>}
      {cautions && (
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-[--color-text-primary]">
          ⚠ {cautions}
        </p>
      )}
    </section>
  )
}
```

- [ ] **Step 4: `mdx-components.tsx` (루트)**

```tsx
import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import { Callout } from '@/components/article/mdx/Callout'
import { MedicalNotice } from '@/components/article/mdx/MedicalNotice'
import { ExerciseCard } from '@/components/article/mdx/ExerciseCard'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h2: (props) => <h2 className="mt-10 mb-3 text-2xl font-bold" {...props} />,
    h3: (props) => <h3 className="mt-8 mb-2 text-xl font-semibold" {...props} />,
    p: (props) => <p className="my-4 leading-relaxed" {...props} />,
    ul: (props) => <ul className="my-4 ml-6 list-disc leading-relaxed" {...props} />,
    ol: (props) => <ol className="my-4 ml-6 list-decimal leading-relaxed" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-4 border-l-4 border-[--color-border] pl-4 italic text-[--color-text-secondary]"
        {...props}
      />
    ),
    img: (props) => (
      // MDX img → next/image (width/height required, but src 알 수 없으므로 fill)
      <span className="block relative my-6 aspect-[16/9] overflow-hidden rounded-lg">
        <Image
          src={props.src ?? ''}
          alt={props.alt ?? ''}
          fill
          className="object-cover"
        />
      </span>
    ),
    Callout,
    MedicalNotice,
    ExerciseCard,
  }
}
```

- [ ] **Step 5: 빌드 통과 확인**

```bash
npm run build
```

MDX 컴포넌트는 아직 사용처 없으므로 빌드 영향 없음. 통과만 확인.

- [ ] **Step 6: Commit**

```bash
git add mdx-components.tsx components/article/mdx
git commit -m "feat(mdx): register custom MDX components (Callout/MedicalNotice/ExerciseCard)"
```

---

## Task 5: 콘텐츠 인덱스 빌더 (TDD)

**Files:**
- Create: `lib/content/categories.ts`, `lib/content/articles.ts`, `lib/content/articles.test.ts`, `content/articles/ko/_test-fixture.mdx` (테스트용)

- [ ] **Step 1: 카테고리 정의 `lib/content/categories.ts`**

```ts
export const categories = ['torticollis', 'head-shape', 'exercise', 'by-month'] as const
export type Category = typeof categories[number]

export const categoryLabels: Record<Category, { ko: string; en: string }> = {
  torticollis: { ko: '사경', en: 'Torticollis' },
  'head-shape': { ko: '두상', en: 'Head shape' },
  exercise: { ko: '운동', en: 'Exercise' },
  'by-month': { ko: '월령', en: 'By month' },
}

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value)
}
```

- [ ] **Step 2: 테스트용 픽스처 MDX 생성**

`content/articles/ko/_test-fixture.mdx`:
```mdx
---
title: 테스트 픽스처
slug: _test-fixture
category: torticollis
publishedAt: 2026-05-04
updatedAt: 2026-05-04
author: 바로도리 콘텐츠팀
excerpt: 테스트용 픽스처 글입니다.
heroImage: /articles/_test-fixture/hero.png
heroImageAlt: 테스트
readingMinutes: 1
draft: false
locale: ko
---

# 테스트 본문

본문 내용입니다.
```

- [ ] **Step 3: 실패 테스트 작성**

`lib/content/articles.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { listArticles, getArticle, getRelated } from './articles'

describe('articles index', () => {
  it('listArticles returns ko articles excluding drafts', async () => {
    const articles = await listArticles({ locale: 'ko' })
    expect(articles.length).toBeGreaterThan(0)
    expect(articles.every((a) => a.draft === false)).toBe(true)
    expect(articles.every((a) => a.locale === 'ko')).toBe(true)
  })

  it('listArticles filters by category', async () => {
    const articles = await listArticles({ locale: 'ko', category: 'torticollis' })
    expect(articles.every((a) => a.category === 'torticollis')).toBe(true)
  })

  it('getArticle returns by slug', async () => {
    const article = await getArticle({ locale: 'ko', slug: '_test-fixture' })
    expect(article).not.toBeNull()
    expect(article?.title).toBe('테스트 픽스처')
    expect(article?.body).toContain('# 테스트 본문')
  })

  it('getArticle returns null for missing slug', async () => {
    const article = await getArticle({ locale: 'ko', slug: 'does-not-exist' })
    expect(article).toBeNull()
  })

  it('listArticles is sorted by publishedAt desc', async () => {
    const articles = await listArticles({ locale: 'ko' })
    for (let i = 1; i < articles.length; i++) {
      expect(articles[i - 1].publishedAt >= articles[i].publishedAt).toBe(true)
    }
  })

  it('getRelated falls back to same category when relatedSlugs empty', async () => {
    const article = await getArticle({ locale: 'ko', slug: '_test-fixture' })
    if (!article) throw new Error('fixture missing')
    const related = await getRelated(article)
    // 픽스처가 유일하면 빈 배열
    expect(Array.isArray(related)).toBe(true)
  })
})
```

- [ ] **Step 4: 테스트 실행 — FAIL**

```bash
npm run test
```

Expected: 모듈 not found.

- [ ] **Step 5: `lib/content/articles.ts` 작성**

```ts
import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { type Category, isCategory } from './categories'
import { type Locale, locales } from '@/lib/i18n/config'

export type Article = {
  title: string
  slug: string
  category: Category
  publishedAt: string // ISO date
  updatedAt: string
  author: string
  authorRole?: string
  excerpt: string
  heroImage: string
  heroImageAlt: string
  ogImage?: string
  readingMinutes: number
  relatedSlugs?: string[]
  draft: boolean
  locale: Locale
  body: string // raw MDX (frontmatter 제거)
}

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'articles')

let cache: Map<Locale, Article[]> | null = null

async function loadAll(): Promise<Map<Locale, Article[]>> {
  if (cache) return cache
  const map = new Map<Locale, Article[]>()
  for (const locale of locales) {
    const dir = path.join(CONTENT_ROOT, locale)
    let entries: string[] = []
    try {
      entries = await fs.readdir(dir)
    } catch {
      map.set(locale, [])
      continue
    }
    const articles: Article[] = []
    for (const entry of entries) {
      if (!entry.endsWith('.mdx')) continue
      const filePath = path.join(dir, entry)
      const raw = await fs.readFile(filePath, 'utf8')
      const { data, content } = matter(raw)
      const article = parseFrontmatter(data, content, locale)
      if (article) articles.push(article)
    }
    articles.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    map.set(locale, articles)
  }
  cache = map
  return map
}

function parseFrontmatter(
  data: Record<string, unknown>,
  body: string,
  locale: Locale,
): Article | null {
  const required = ['title', 'slug', 'category', 'publishedAt', 'updatedAt', 'author', 'excerpt', 'heroImage', 'heroImageAlt', 'readingMinutes']
  for (const k of required) {
    if (data[k] == null) return null
  }
  const category = String(data.category)
  if (!isCategory(category)) return null

  return {
    title: String(data.title),
    slug: String(data.slug),
    category,
    publishedAt: toIsoDate(data.publishedAt),
    updatedAt: toIsoDate(data.updatedAt),
    author: String(data.author),
    authorRole: data.authorRole ? String(data.authorRole) : undefined,
    excerpt: String(data.excerpt),
    heroImage: String(data.heroImage),
    heroImageAlt: String(data.heroImageAlt),
    ogImage: data.ogImage ? String(data.ogImage) : undefined,
    readingMinutes: Number(data.readingMinutes),
    relatedSlugs: Array.isArray(data.relatedSlugs)
      ? (data.relatedSlugs as unknown[]).map(String)
      : undefined,
    draft: Boolean(data.draft),
    locale,
    body,
  }
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

const includeDrafts = process.env.NEXT_PUBLIC_INCLUDE_DRAFTS === '1' || process.env.NODE_ENV === 'development'

export async function listArticles(opts: {
  locale: Locale
  category?: Category
}): Promise<Article[]> {
  const all = await loadAll()
  let articles = all.get(opts.locale) ?? []
  if (!includeDrafts) articles = articles.filter((a) => !a.draft)
  if (opts.category) articles = articles.filter((a) => a.category === opts.category)
  return articles
}

export async function getArticle(opts: {
  locale: Locale
  slug: string
}): Promise<Article | null> {
  const articles = await listArticles({ locale: opts.locale })
  return articles.find((a) => a.slug === opts.slug) ?? null
}

export async function getRelated(article: Article, max = 2): Promise<Article[]> {
  const all = await listArticles({ locale: article.locale })
  if (article.relatedSlugs?.length) {
    return article.relatedSlugs
      .map((slug) => all.find((a) => a.slug === slug))
      .filter((a): a is Article => !!a && a.slug !== article.slug)
      .slice(0, max)
  }
  return all
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, max)
}

export async function listAllSlugs(): Promise<Array<{ locale: Locale; slug: string }>> {
  const all = await loadAll()
  const out: Array<{ locale: Locale; slug: string }> = []
  for (const [locale, articles] of all) {
    for (const a of articles) {
      if (!a.draft || includeDrafts) out.push({ locale, slug: a.slug })
    }
  }
  return out
}
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
npm run test
```

Expected: 6 tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/content content/articles
git commit -m "feat(content): add MDX article index builder with frontmatter parsing (TDD)"
```

---

## Task 6: SEO 헬퍼 (TDD)

**Files:**
- Create: `lib/seo/metadata.ts`, `lib/seo/metadata.test.ts`, `lib/seo/jsonLd.ts`, `lib/seo/jsonLd.test.ts`

- [ ] **Step 1: 실패 테스트 — `lib/seo/metadata.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { buildMetadata } from './metadata'

describe('buildMetadata', () => {
  it('builds canonical with site URL + path', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'desc',
      path: '/ko/articles/foo',
      locale: 'ko',
    })
    expect(meta.alternates?.canonical).toBe('https://barodori.com/ko/articles/foo')
  })

  it('builds hreflang languages with x-default=ko', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'd',
      path: '/ko/articles/foo',
      locale: 'ko',
    })
    expect(meta.alternates?.languages).toEqual({
      ko: 'https://barodori.com/ko/articles/foo',
      en: 'https://barodori.com/en/articles/foo',
      'x-default': 'https://barodori.com/ko/articles/foo',
    })
  })

  it('marks en pages noindex', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'd',
      path: '/en/articles/foo',
      locale: 'en',
    })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })

  it('uses ogImage when provided, falls back to default', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'd',
      path: '/ko',
      locale: 'ko',
      image: '/og/custom.png',
    })
    expect(meta.openGraph?.images).toEqual([{ url: 'https://barodori.com/og/custom.png' }])

    const fallback = buildMetadata({ title: 'T', description: 'd', path: '/ko', locale: 'ko' })
    expect(fallback.openGraph?.images).toEqual([{ url: 'https://barodori.com/og/default.png' }])
  })
})
```

- [ ] **Step 2: 테스트 FAIL 확인**

```bash
npm run test
```

- [ ] **Step 3: `lib/seo/metadata.ts` 작성**

```ts
import type { Metadata } from 'next'
import { defaultLocale, indexableLocales, locales, type Locale } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'
const DEFAULT_OG = '/og/default.png'

export function buildMetadata(params: {
  title: string
  description: string
  path: string // 항상 leading "/" 포함, locale 포함된 절대 경로
  locale: Locale
  image?: string
}): Metadata {
  const { title, description, path, locale, image } = params
  const canonical = `${SITE_URL}${path}`
  const ogUrl = `${SITE_URL}${image ?? DEFAULT_OG}`

  // 같은 path 의 locale 변형 매핑
  const languages: Record<string, string> = {}
  for (const l of locales) {
    languages[l] = `${SITE_URL}${swapLocaleInPath(path, locale, l)}`
  }
  languages['x-default'] = `${SITE_URL}${swapLocaleInPath(path, locale, defaultLocale)}`

  const noindex = !indexableLocales.includes(locale)

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogUrl }],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}

function swapLocaleInPath(path: string, from: Locale, to: Locale): string {
  if (path === `/${from}`) return `/${to}`
  if (path.startsWith(`/${from}/`)) return path.replace(`/${from}/`, `/${to}/`)
  return path
}
```

- [ ] **Step 4: 테스트 통과**

```bash
npm run test
```

- [ ] **Step 5: JSON-LD 테스트 작성 `lib/seo/jsonLd.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { organizationJsonLd, mobileAppJsonLd, articleJsonLd } from './jsonLd'

describe('JSON-LD generators', () => {
  it('organizationJsonLd has @context and @type', () => {
    const out = organizationJsonLd()
    expect(out['@context']).toBe('https://schema.org')
    expect(out['@type']).toBe('Organization')
    expect(out.name).toBeDefined()
  })

  it('articleJsonLd reflects article fields', () => {
    const ld = articleJsonLd({
      title: 'T',
      excerpt: 'desc',
      slug: 'foo',
      locale: 'ko',
      author: 'A',
      publishedAt: '2026-05-04',
      updatedAt: '2026-05-04',
      heroImage: '/articles/foo/hero.png',
    })
    expect(ld['@type']).toBe('Article')
    expect(ld.headline).toBe('T')
    expect(ld.inLanguage).toBe('ko')
    expect(ld.image).toContain('https://')
    expect(ld.mainEntityOfPage).toContain('/ko/articles/foo')
  })
})
```

- [ ] **Step 6: 테스트 FAIL → `lib/seo/jsonLd.ts` 작성**

```ts
import type { Locale } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '제로더 (Zerorder)',
    url: SITE_URL,
    logo: `${SITE_URL}/og/default.png`,
  } as const
}

export function mobileAppJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: '바로도리',
    operatingSystem: 'iOS, Android',
    applicationCategory: 'HealthApplication',
    url: `${SITE_URL}/ko/install`,
  } as const
}

export function articleJsonLd(input: {
  title: string
  excerpt: string
  slug: string
  locale: Locale
  author: string
  publishedAt: string
  updatedAt: string
  heroImage: string
}) {
  const url = `${SITE_URL}/${input.locale}/articles/${input.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.excerpt,
    image: `${SITE_URL}${input.heroImage}`,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { '@type': 'Person', name: input.author },
    inLanguage: input.locale,
    mainEntityOfPage: url,
  } as const
}

export function jsonLdScript(payload: Record<string, unknown>): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c')
}
```

- [ ] **Step 7: 테스트 통과 + Commit**

```bash
npm run test
git add lib/seo
git commit -m "feat(seo): add metadata + JSON-LD helpers (TDD)"
```

---

## Task 7: `sitemap.ts` + `robots.ts`

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`

- [ ] **Step 1: `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { listArticles } from '@/lib/content/articles'
import { defaultLocale } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ko 만 인덱싱
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/${defaultLocale}`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/${defaultLocale}/product`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/${defaultLocale}/articles`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/${defaultLocale}/install`, changeFrequency: 'monthly', priority: 0.7 },
  ]
  const articles = await listArticles({ locale: defaultLocale })
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${defaultLocale}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: {
      languages: { ko: `${SITE_URL}/ko/articles/${a.slug}` },
    },
  }))
  return [...staticRoutes, ...articleRoutes]
}
```

- [ ] **Step 2: `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barodori.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: 빌드 + 동작 확인**

```bash
npm run dev
# 다른 터미널
curl http://localhost:3000/sitemap.xml | head -40
curl http://localhost:3000/robots.txt
```

Expected: ko 라우트만 (en 없음). 픽스처 아티클 1건이 sitemap에 포함되어야 함.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): add sitemap.xml + robots.txt (ko-only indexing)"
```

---

## Task 8: 분석 — track 헬퍼 + Provider (TDD + 컴포넌트)

**Files:**
- Create: `lib/analytics/index.ts`, `lib/analytics/index.test.ts`, `components/analytics/AnalyticsProvider.tsx`, `components/analytics/TrackedLink.tsx`

- [ ] **Step 1: `lib/analytics/index.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { track, __resetForTest } from './index'

describe('analytics track', () => {
  beforeEach(() => {
    __resetForTest()
    delete (window as unknown as Record<string, unknown>).gtag
    delete (window as unknown as Record<string, unknown>).amplitude
  })

  it('no-ops when no providers configured', () => {
    expect(() => track('test_event', { foo: 'bar' })).not.toThrow()
  })

  it('forwards to gtag if present', () => {
    const gtag = vi.fn()
    ;(window as unknown as { gtag: typeof gtag }).gtag = gtag
    track('cta_install_click', { surface: 'home' })
    expect(gtag).toHaveBeenCalledWith('event', 'cta_install_click', { surface: 'home' })
  })

  it('forwards to amplitude if present', () => {
    const amp = { track: vi.fn() }
    ;(window as unknown as { amplitude: typeof amp }).amplitude = amp
    track('cta_install_click', { surface: 'home' })
    expect(amp.track).toHaveBeenCalledWith('cta_install_click', { surface: 'home' })
  })
})
```

- [ ] **Step 2: 테스트 FAIL → `lib/analytics/index.ts`**

```ts
type GtagFn = (cmd: 'event', name: string, props?: Record<string, unknown>) => void
type AmplitudeApi = {
  track: (name: string, props?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    gtag?: GtagFn
    amplitude?: AmplitudeApi
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    window.gtag?.('event', event, props)
  } catch {
    /* swallow */
  }
  try {
    window.amplitude?.track(event, props)
  } catch {
    /* swallow */
  }
  if (process.env.NODE_ENV === 'development') {
    // 개발 모드 에서 콘솔로 확인
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props)
  }
}

export function __resetForTest(): void {
  /* placeholder; 모듈 상태 없음 */
}
```

- [ ] **Step 3: 테스트 통과 확인**

```bash
npm run test
```

- [ ] **Step 4: `components/analytics/AnalyticsProvider.tsx`**

```tsx
'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const AMP_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_KEY

export function AnalyticsProvider() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    track('page_view', { path: pathname })
  }, [pathname])

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: false });`}
          </Script>
        </>
      )}
      {AMP_KEY && (
        <Script id="amplitude-init" strategy="afterInteractive">
          {`!(function(){var e=window.amplitude||{_q:[],_iq:{}};e.invoked=true;e._q=[];window.amplitude=e;})();
          import('https://cdn.amplitude.com/libs/analytics-browser-2.11.0-min.js.gz').then(function(m){
            var a = m.default || m;
            a.init('${AMP_KEY}', undefined, { defaultTracking: { sessions: true, pageViews: false } });
            window.amplitude = a;
          }).catch(function(){});`}
        </Script>
      )}
    </>
  )
}
```

(Amplitude 로딩 방식은 CDN 버전. 패키지 사용을 원하면 추후 `@amplitude/analytics-browser` 추가 + `useEffect` 에서 init.)

- [ ] **Step 5: `components/analytics/TrackedLink.tsx`**

```tsx
'use client'

import Link, { type LinkProps } from 'next/link'
import { type ReactNode } from 'react'
import { track } from '@/lib/analytics'

type Props = LinkProps & {
  event: string
  eventProps?: Record<string, unknown>
  className?: string
  children: ReactNode
  external?: boolean
}

export function TrackedLink({ event, eventProps, external, children, ...rest }: Props) {
  const onClick = () => track(event, eventProps)
  if (external) {
    return (
      <a
        href={String(rest.href)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={rest.className}
      >
        {children}
      </a>
    )
  }
  return (
    <Link {...rest} onClick={onClick}>
      {children}
    </Link>
  )
}
```

- [ ] **Step 6: `app/[locale]/layout.tsx` 에 `<AnalyticsProvider>` 마운트**

`app/[locale]/layout.tsx` 의 return 을 다음으로 교체:
```tsx
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'

// ...

  return (
    <>
      <AnalyticsProvider />
      {children}
    </>
  )
```

- [ ] **Step 7: 빌드 + commit**

```bash
npm run build
npm run test
git add lib/analytics components/analytics app/[locale]/layout.tsx
git commit -m "feat(analytics): add GA4+Amplitude provider, track helper, TrackedLink (TDD)"
```

---

## Task 9: 설치 분기 로직 (TDD) + StoreButtons + QrInstallModal

**Files:**
- Create: `lib/install/storeLinks.ts`, `lib/install/storeLinks.test.ts`, `components/install/StoreButtons.tsx`, `components/install/QrInstallModal.tsx`, `components/ui/Modal.tsx`

- [ ] **Step 1: `lib/install/storeLinks.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('storeLinks', () => {
  const orig = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...orig }
    delete process.env.NEXT_PUBLIC_IOS_APP_URL
    delete process.env.NEXT_PUBLIC_ANDROID_APP_URL
  })

  it('isAppLive=false when both unset', async () => {
    const { isAppLive } = await import('./storeLinks')
    expect(isAppLive()).toBe(false)
  })

  it('isAppLive=false when only one set', async () => {
    process.env.NEXT_PUBLIC_IOS_APP_URL = 'https://apps.apple.com/x'
    const { isAppLive } = await import('./storeLinks')
    expect(isAppLive()).toBe(false)
  })

  it('isAppLive=true when both set', async () => {
    process.env.NEXT_PUBLIC_IOS_APP_URL = 'https://apps.apple.com/x'
    process.env.NEXT_PUBLIC_ANDROID_APP_URL = 'https://play.google.com/x'
    const { isAppLive } = await import('./storeLinks')
    expect(isAppLive()).toBe(true)
  })
})
```

- [ ] **Step 2: 테스트 FAIL → `lib/install/storeLinks.ts`**

```ts
export function getStoreLinks() {
  return {
    ios: process.env.NEXT_PUBLIC_IOS_APP_URL || null,
    android: process.env.NEXT_PUBLIC_ANDROID_APP_URL || null,
  }
}

export function isAppLive(): boolean {
  const { ios, android } = getStoreLinks()
  return Boolean(ios && android)
}

export function getBetaFormUrl(): string | null {
  return process.env.NEXT_PUBLIC_BETA_FORM_URL || null
}
```

- [ ] **Step 3: 테스트 통과**

```bash
npm run test
```

- [ ] **Step 4: `components/ui/Modal.tsx` (간단한 dialog)**

```tsx
'use client'

import { useEffect } from 'react'

export function Modal({
  open,
  onClose,
  children,
  ariaLabel,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  ariaLabel: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl leading-none text-[--color-text-secondary]"
          aria-label="닫기"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `components/install/StoreButtons.tsx`**

```tsx
'use client'

import { getStoreLinks, isAppLive } from '@/lib/install/storeLinks'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  surface: string
  locale: Locale
}

export function StoreButtons({ surface, locale }: Props) {
  const live = isAppLive()
  const { ios, android } = getStoreLinks()

  const onClick = (platform: 'ios' | 'android') => () => {
    track('cta_install_click', { surface, platform, locale, live })
  }

  if (!live) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-pill bg-[--color-bg-muted] px-6 py-3 text-sm text-[--color-text-secondary]"
        >
          App Store · 출시 예정
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-pill bg-[--color-bg-muted] px-6 py-3 text-sm text-[--color-text-secondary]"
        >
          Google Play · 출시 예정
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        href={ios ?? '#'}
        onClick={onClick('ios')}
        className="inline-flex items-center justify-center rounded-pill bg-black px-6 py-3 text-sm font-medium text-white"
      >
        App Store
      </a>
      <a
        href={android ?? '#'}
        onClick={onClick('android')}
        className="inline-flex items-center justify-center rounded-pill bg-black px-6 py-3 text-sm font-medium text-white"
      >
        Google Play
      </a>
    </div>
  )
}
```

- [ ] **Step 6: `components/install/QrInstallModal.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { isAppLive, getBetaFormUrl } from '@/lib/install/storeLinks'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  surface: string
  locale: Locale
  children: React.ReactNode // 트리거 버튼 텍스트
}

export function QrInstallModal({ surface, locale, children }: Props) {
  const [open, setOpen] = useState(false)
  const live = isAppLive()
  const beta = getBetaFormUrl()

  const onTriggerClick = () => {
    track('cta_install_click', { surface, platform: 'qr', locale, live })
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onTriggerClick}
        className="inline-flex items-center justify-center rounded-pill bg-[--color-primary] px-6 py-3 text-sm font-semibold text-black"
      >
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} ariaLabel="앱 설치 안내">
        {live ? (
          <div>
            <h2 className="text-lg font-semibold">QR 코드로 설치</h2>
            <p className="mt-2 text-sm text-[--color-text-secondary]">
              모바일로 QR 코드를 스캔하면 앱스토어로 이동합니다.
            </p>
            {/* 실제 QR 이미지는 출시 시 추가. MVP는 placeholder */}
            <div className="mx-auto mt-4 grid h-40 w-40 place-items-center rounded-lg border border-dashed border-[--color-border] text-xs text-[--color-text-secondary]">
              QR 이미지 (출시 시 업데이트)
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold">출시 예정</h2>
            <p className="mt-2 text-sm leading-relaxed text-[--color-text-secondary]">
              바로도리는 2026-05-20 베타 출시 예정입니다. 베타 서포터즈로 미리 만나보세요.
            </p>
            {beta && (
              <a
                href={beta}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('cta_beta_form_click', { surface: `${surface}:modal`, locale })}
                className="mt-4 inline-flex w-full items-center justify-center rounded-pill bg-[--color-primary] px-6 py-3 text-sm font-semibold text-black"
              >
                베타 서포터즈 신청
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
```

- [ ] **Step 7: 빌드 + Commit**

```bash
npm run build
npm run test
git add lib/install components/install components/ui/Modal.tsx
git commit -m "feat(install): add storeLinks (TDD) + StoreButtons + QrInstallModal"
```

---

## Task 10: UI 프리미티브 + Layout (Header, Footer)

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Container.tsx`, `components/ui/Badge.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `components/layout/LocaleSwitcher.tsx`

- [ ] **Step 1: `components/ui/Container.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>
}
```

- [ ] **Step 2: `components/ui/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-[--color-primary] text-black hover:bg-[--color-primary-dark]',
  secondary: 'bg-[--color-bg-muted] text-[--color-text-primary] hover:bg-[--color-border]',
  ghost: 'bg-transparent text-[--color-text-primary] hover:bg-[--color-bg-muted]',
}

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-pill px-6 py-3 text-sm font-semibold disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: `components/ui/Badge.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Badge({ children, tone = 'primary' }: { children: ReactNode; tone?: 'primary' | 'neutral' }) {
  const cls =
    tone === 'primary'
      ? 'bg-[--color-primary-light] text-[--color-primary-dark]'
      : 'bg-[--color-bg-muted] text-[--color-text-secondary]'
  return <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium ${cls}`}>{children}</span>
}
```

- [ ] **Step 4: `components/layout/LocaleSwitcher.tsx`**

```tsx
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
            className={l === current ? 'font-semibold text-[--color-text-primary]' : 'text-[--color-text-secondary]'}
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
```

- [ ] **Step 5: `components/layout/Header.tsx`**

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { LocaleSwitcher } from './LocaleSwitcher'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

export async function Header({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return (
    <header className="sticky top-0 z-40 border-b border-[--color-border] bg-white/90 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href={`/${locale}`} className="text-base font-bold">
          {dict.common.appName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <Link href={`/${locale}/product`}>{dict.nav.product}</Link>
          <Link href={`/${locale}/articles`}>{dict.nav.articles}</Link>
          <Link href={`/${locale}/install`} className="font-semibold text-[--color-primary-dark]">
            {dict.nav.install}
          </Link>
        </nav>
        <LocaleSwitcher current={locale} />
      </Container>
    </header>
  )
}
```

- [ ] **Step 6: `components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

export async function Footer({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  const year = new Date().getFullYear()
  return (
    <footer className="mt-20 border-t border-[--color-border] bg-[--color-bg-muted] py-10 text-sm text-[--color-text-secondary]">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>{dict.footer.copyright.replace('{year}', String(year))}</p>
        <nav className="flex gap-4">
          <Link href={`/${locale}/legal/privacy`}>{dict.footer.privacy}</Link>
          <Link href={`/${locale}/legal/terms`}>{dict.footer.terms}</Link>
        </nav>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 7: `app/[locale]/layout.tsx` 에 Header/Footer 마운트**

`app/[locale]/layout.tsx` 의 children 감싸기:
```tsx
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// ...
  return (
    <>
      <AnalyticsProvider />
      <Header locale={locale as Locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale as Locale} />
    </>
  )
```

(`as Locale` cast 는 위에서 `notFound()` 로 검증된 후 사용)

- [ ] **Step 8: 빌드 + 시각 확인**

```bash
npm run build
npm run dev
```

브라우저에서 `http://localhost:3000/ko` → Header/Footer 노출, locale switcher 동작 확인.

- [ ] **Step 9: Commit**

```bash
git add components/ui components/layout app/[locale]/layout.tsx
git commit -m "feat(layout): add Header, Footer, LocaleSwitcher, UI primitives"
```

---

## Task 11: 마케팅 섹션 컴포넌트 (홈에 사용)

**Files:**
- Create: `components/marketing/Hero.tsx`, `components/marketing/StatStrip.tsx`, `components/marketing/SymptomGrid.tsx`, `components/marketing/ActionGuide.tsx`, `components/marketing/ProductFeatures.tsx`, `components/marketing/ArticleTeaserGrid.tsx`, `components/marketing/SafetyNotice.tsx`, `components/marketing/InstallCta.tsx`, `public/images/hero-app.png` (placeholder), `public/og/default.png` (placeholder)

- [ ] **Step 1: 임시 placeholder 이미지 생성**

```bash
mkdir -p public/images public/og
# 1x1 투명 PNG 생성 (placeholder, 추후 실 이미지 교체)
node -e "require('fs').writeFileSync('public/images/hero-app.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'))"
node -e "require('fs').writeFileSync('public/og/default.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'))"
```

(추후 Theo 가 실 이미지 교체. 현 단계는 빌드 통과용 1x1 투명 PNG.)

- [ ] **Step 2: `components/marketing/Hero.tsx`**

```tsx
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { QrInstallModal } from '@/components/install/QrInstallModal'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="bg-[--color-primary-light] py-16 sm:py-20">
      <Container className="grid items-center gap-10 sm:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            아기의 작은 고개,
            <br />
            바로도리에서 함께 살펴봐요
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[--color-text-secondary]">
            영아 사경/사두 의심부터 가정 케어까지. 보호자를 위한 신뢰 기반 가이드.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="hidden sm:block">
              <QrInstallModal surface="hero" locale={locale}>
                지금 시작하기
              </QrInstallModal>
            </div>
            <div className="sm:hidden">
              <StoreButtons surface="hero" locale={locale} />
            </div>
          </div>
        </div>
        <div className="relative aspect-[3/4] w-full max-w-xs sm:ml-auto">
          <Image
            src="/images/hero-app.png"
            alt="바로도리 앱 화면"
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-contain"
            priority
          />
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 3: `components/marketing/StatStrip.tsx`**

```tsx
import { Container } from '@/components/ui/Container'

const stats = [
  { value: '1/250', label: '영아 사경 빈도', source: 'Pediatrics, 2018' },
  { value: '0–6개월', label: '권장 진단 시기' },
  { value: '90%', label: '조기 조치 시 회복률' },
] as const

export function StatStrip() {
  return (
    <section aria-label="핵심 통계" className="border-y border-[--color-border] bg-white py-10">
      <Container className="grid grid-cols-3 gap-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-[--color-primary-dark] sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-[--color-text-secondary] sm:text-sm">{s.label}</p>
            {s.source && (
              <p className="mt-0.5 text-[10px] text-[--color-text-secondary]/70">출처: {s.source}</p>
            )}
          </div>
        ))}
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: `components/marketing/SymptomGrid.tsx`**

```tsx
import { Container } from '@/components/ui/Container'

const symptoms = [
  { title: '한쪽으로만 고개를 돌려요', icon: '↻' },
  { title: '머리 모양이 비대칭이에요', icon: '◐' },
  { title: '한쪽으로 누워 자기를 좋아해요', icon: '☾' },
  { title: '특정 방향으로만 시선을 둬요', icon: '◉' },
  { title: '목 옆에 단단한 멍울이 만져져요', icon: '●' },
  { title: '수유 시 한쪽 자세를 거부해요', icon: '✕' },
] as const

export function SymptomGrid() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">이런 모습이 보이면 사경을 의심해보세요</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {symptoms.map((s) => (
            <article key={s.title} className="rounded-lg border border-[--color-border] bg-white p-5">
              <div className="text-2xl text-[--color-primary]">{s.icon}</div>
              <p className="mt-3 text-sm font-medium leading-relaxed">{s.title}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 5: `components/marketing/ActionGuide.tsx`**

```tsx
import { Container } from '@/components/ui/Container'

const steps = [
  '아기의 정면/측면 사진을 찍어 비교해보세요',
  '하루 동안 머리 방향을 기록해보세요',
  '수유/수면 자세에 변화를 주세요',
  '소아청소년과 또는 재활의학과를 방문하세요',
  '가정 운동은 전문가 검토 가이드만 따르세요',
]

export function ActionGuide() {
  return (
    <section className="bg-[--color-bg-muted] py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">의심되면 이렇게 시작해보세요</h2>
        <ol className="mx-auto mt-8 grid max-w-3xl gap-3">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-4 rounded-lg bg-white p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[--color-primary] text-sm font-bold">
                {i + 1}
              </span>
              <p className="self-center text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
```

- [ ] **Step 6: `components/marketing/ProductFeatures.tsx`**

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'

const features = [
  { title: 'AI 머리 모양 진단', desc: '사진 한 장으로 비대칭 정도를 객관 수치로 확인' },
  { title: '맞춤 가정 운동', desc: '월령별/증상별로 전문가 검토를 거친 운동 가이드' },
  { title: '진료 가이드', desc: '병원 방문 전 체크리스트와 의료진 문의 시나리오' },
] as const

export function ProductFeatures({ locale }: { locale: Locale }) {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">바로도리는 이렇게 도와줘요</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="rounded-lg border border-[--color-border] bg-white p-5">
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[--color-text-secondary]">{f.desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href={`/${locale}/product`} className="text-sm font-semibold text-[--color-primary-dark] underline">
            제품 자세히 보기 →
          </Link>
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 7: `components/marketing/ArticleTeaserGrid.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { listArticles } from '@/lib/content/articles'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export async function ArticleTeaserGrid({ locale }: { locale: Locale }) {
  const articles = (await listArticles({ locale })).slice(0, 3)
  if (articles.length === 0) return null
  return (
    <section className="bg-[--color-bg-muted] py-16">
      <Container>
        <h2 className="text-center text-2xl font-bold sm:text-3xl">최신 사경 아티클</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${locale}/articles/${a.slug}`}
              className="block overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/9] bg-[--color-bg-muted]">
                <Image src={a.heroImage} alt={a.heroImageAlt} fill className="object-cover" />
              </div>
              <div className="p-4">
                <Badge>{categoryLabels[a.category][locale]}</Badge>
                <h3 className="mt-2 text-base font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-[--color-text-secondary]">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href={`/${locale}/articles`} className="text-sm font-semibold text-[--color-primary-dark] underline">
            전체 아티클 보기 →
          </Link>
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 8: `components/marketing/SafetyNotice.tsx`**

```tsx
import { Container } from '@/components/ui/Container'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function SafetyNotice({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return (
    <section className="py-12">
      <Container>
        <aside
          role="note"
          className="rounded-lg border border-[--color-danger] bg-red-50 p-5"
          aria-label={dict.medical.title}
        >
          <p className="font-semibold text-[--color-danger]">{dict.medical.title}</p>
          <p className="mt-2 text-sm leading-relaxed">{dict.medical.body}</p>
        </aside>
      </Container>
    </section>
  )
}
```

- [ ] **Step 9: `components/marketing/InstallCta.tsx`**

```tsx
import { Container } from '@/components/ui/Container'
import { QrInstallModal } from '@/components/install/QrInstallModal'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function InstallCta({ locale, surface }: { locale: Locale; surface: string }) {
  return (
    <section className="bg-[--color-primary] py-12 text-black">
      <Container className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">우리 아기 두상, 오늘부터 바로도리와 함께</h2>
        <div className="hidden sm:block">
          <QrInstallModal surface={surface} locale={locale}>지금 설치하기</QrInstallModal>
        </div>
        <div className="sm:hidden">
          <StoreButtons surface={surface} locale={locale} />
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 10: 빌드 + Commit**

```bash
npm run build
git add components/marketing public/images public/og
git commit -m "feat(marketing): add Hero, StatStrip, SymptomGrid, ActionGuide, ProductFeatures, ArticleTeaserGrid, SafetyNotice, InstallCta"
```

---

## Task 12: 홈 페이지 조립

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: 홈 페이지 작성**

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Hero } from '@/components/marketing/Hero'
import { StatStrip } from '@/components/marketing/StatStrip'
import { SymptomGrid } from '@/components/marketing/SymptomGrid'
import { ActionGuide } from '@/components/marketing/ActionGuide'
import { ProductFeatures } from '@/components/marketing/ProductFeatures'
import { ArticleTeaserGrid } from '@/components/marketing/ArticleTeaserGrid'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { InstallCta } from '@/components/marketing/InstallCta'
import { organizationJsonLd, mobileAppJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '바로도리 - 영아 사경/사두 가정 케어',
    description: '아기의 작은 고개, 바로도리에서 함께 살펴봐요. 영아 사경/사두 의심부터 가정 운동까지.',
    path: `/${locale}`,
    locale,
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(mobileAppJsonLd()) }}
      />
      <Hero locale={loc} />
      <StatStrip />
      <SymptomGrid />
      <ActionGuide />
      <ProductFeatures locale={loc} />
      <ArticleTeaserGrid locale={loc} />
      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="home_footer" />
    </>
  )
}
```

- [ ] **Step 2: 시각 확인**

```bash
npm run dev
```

`http://localhost:3000/ko` → 모든 섹션 정상 노출, 콘솔 에러 0건. 모바일 사이즈(375px)/태블릿(768px)/데스크탑(1280px)에서 깨짐 없는지 dev tools 로 확인.

- [ ] **Step 3: 빌드 통과 확인**

```bash
npm run build
```

`/[locale]` 가 SSG 로 표시되는지 확인.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(home): assemble home page sections"
```

---

## Task 13: 제품 소개 페이지

**Files:**
- Create: `app/[locale]/product/page.tsx`, `components/marketing/ProductDetail.tsx`

- [ ] **Step 1: `components/marketing/ProductDetail.tsx`**

홈의 `ProductFeatures` 확장판. 기능 별 스크린샷 + 설명. 이미지는 hero-app.png 재사용 (출시 시 교체).

```tsx
import Image from 'next/image'
import { Container } from '@/components/ui/Container'

const sections = [
  {
    title: 'AI 머리 모양 진단',
    desc: '아이 정면/측면 사진을 찍으면 AI가 비대칭 지수를 산출합니다. 시간 흐름에 따른 변화를 그래프로 추적하세요.',
    image: '/images/hero-app.png',
  },
  {
    title: '맞춤 가정 운동',
    desc: '월령별/증상별로 전문가 검토를 거친 가정 운동을 제공합니다. 동작은 영상과 단계별 설명으로 안내합니다.',
    image: '/images/hero-app.png',
  },
  {
    title: '진료 가이드',
    desc: '병원 방문 전 체크리스트, 의료진 문의 시나리오, 진료 후 기록까지. 보호자가 헷갈리지 않도록.',
    image: '/images/hero-app.png',
  },
] as const

export function ProductDetail() {
  return (
    <div className="py-16">
      {sections.map((s, i) => (
        <Container key={s.title} className="my-12">
          <div className={`grid items-center gap-10 sm:grid-cols-2 ${i % 2 === 1 ? 'sm:[&>*:first-child]:order-2' : ''}`}>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-[--color-text-secondary]">{s.desc}</p>
            </div>
            <div className="relative aspect-[3/4] w-full max-w-xs sm:mx-auto">
              <Image src={s.image} alt={s.title} fill className="object-contain" />
            </div>
          </div>
        </Container>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: `app/[locale]/product/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { ProductDetail } from '@/components/marketing/ProductDetail'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '제품 소개 - 바로도리',
    description: '바로도리 앱의 핵심 기능: AI 머리 모양 진단, 맞춤 가정 운동, 진료 가이드',
    path: `/${locale}/product`,
    locale,
  })
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  return (
    <>
      <section className="bg-[--color-primary-light] py-16">
        <Container className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">바로도리는 어떻게 도와줄까요?</h1>
          <p className="mt-3 text-[--color-text-secondary]">사경/사두를 위한 가정 케어, 한 앱에서.</p>
        </Container>
      </section>
      <ProductDetail />
      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="product_footer" />
    </>
  )
}
```

- [ ] **Step 3: 시각 + 빌드 + Commit**

```bash
npm run build
git add app/[locale]/product components/marketing/ProductDetail.tsx
git commit -m "feat(product): add product detail page"
```

---

## Task 14: 아티클 목록 페이지 + CategoryFilter

**Files:**
- Create: `app/[locale]/articles/page.tsx`, `components/article/ArticleCard.tsx`, `components/article/CategoryFilter.tsx`

- [ ] **Step 1: `components/article/ArticleCard.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Article } from '@/lib/content/articles'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/${article.locale}/articles/${article.slug}`}
      className="group block overflow-hidden rounded-lg border border-[--color-border] bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] bg-[--color-bg-muted]">
        <Image src={article.heroImage} alt={article.heroImageAlt} fill className="object-cover" />
      </div>
      <div className="p-4">
        <Badge>{categoryLabels[article.category][article.locale]}</Badge>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold group-hover:underline">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-[--color-text-secondary]">{article.excerpt}</p>
        <p className="mt-2 text-xs text-[--color-text-secondary]">{article.publishedAt} · {article.readingMinutes}분</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: `components/article/CategoryFilter.tsx`**

```tsx
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
```

- [ ] **Step 3: `app/[locale]/articles/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { CategoryFilter } from '@/components/article/CategoryFilter'
import { ArticleCard } from '@/components/article/ArticleCard'
import { listArticles } from '@/lib/content/articles'
import { isCategory, type Category } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '사경 아티클 - 바로도리',
    description: '영아 사경, 두상 비대칭, 가정 운동, 월령별 관리 정보',
    path: `/${locale}/articles`,
    locale,
  })
}

export default async function ArticlesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const category: Category | undefined = sp.cat && isCategory(sp.cat) ? sp.cat : undefined
  const articles = await listArticles({ locale: loc, category })

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold">사경 아티클</h1>
      <p className="mt-2 text-[--color-text-secondary]">바로도리 사용자가 자주 묻는 정보를 모았어요.</p>
      <div className="mt-6">
        <CategoryFilter locale={loc} />
      </div>
      {articles.length === 0 ? (
        <p className="mt-8 text-center text-[--color-text-secondary]">아직 등록된 아티클이 없어요.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </Container>
  )
}
```

- [ ] **Step 4: 시각 + 빌드 + Commit**

```bash
npm run build
git add app/[locale]/articles components/article
git commit -m "feat(articles): add article list page with category filter"
```

---

## Task 15: 아티클 상세 페이지 (MDX 렌더 + TOC + 자동 의료 고지 + 관련 글)

**Files:**
- Create: `app/[locale]/articles/[slug]/page.tsx`, `components/article/ArticleHeader.tsx`, `components/article/Toc.tsx`, `components/article/RelatedArticles.tsx`

- [ ] **Step 1: `components/article/ArticleHeader.tsx`**

```tsx
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Article } from '@/lib/content/articles'

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="mb-8">
      <Badge>{categoryLabels[article.category][article.locale]}</Badge>
      <h1 className="mt-3 text-3xl font-bold leading-snug sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-[--color-text-secondary]">{article.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[--color-text-secondary]">
        <span>{article.author}</span>
        {article.authorRole && <span className="text-[--color-primary-dark]">· {article.authorRole}</span>}
        <span>· {article.publishedAt}</span>
        <span>· {article.readingMinutes}분 읽기</span>
      </div>
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg bg-[--color-bg-muted]">
        <Image src={article.heroImage} alt={article.heroImageAlt} fill priority className="object-cover" />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: `components/article/Toc.tsx`**

본문에서 h2/h3 추출하는 간단한 TOC. raw markdown 파싱:

```tsx
type Heading = { level: 2 | 3; text: string; id: string }

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
}

export function Toc({ markdown }: { markdown: string }) {
  const headings: Heading[] = []
  const re = /^(##|###)\s+(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown)) !== null) {
    const level = m[1].length === 2 ? 2 : 3
    const text = m[2].trim()
    headings.push({ level: level as 2 | 3, text, id: slugify(text) })
  }
  if (headings.length < 2) return null
  return (
    <nav aria-label="목차" className="mb-8 rounded-lg bg-[--color-bg-muted] p-4 text-sm">
      <p className="font-semibold">목차</p>
      <ul className="mt-2 space-y-1">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'ml-4' : ''}>
            <a href={`#${h.id}`} className="text-[--color-text-secondary] hover:text-[--color-text-primary]">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

(rehype-slug 가 같은 slugify 룰을 쓰지 않을 수 있어 미세한 mismatch 가능. MVP 허용 범위. 정밀화는 추후.)

- [ ] **Step 3: `components/article/RelatedArticles.tsx`**

```tsx
import { ArticleCard } from './ArticleCard'
import type { Article } from '@/lib/content/articles'

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section className="mt-12 border-t border-[--color-border] pt-8">
      <h2 className="text-xl font-bold">관련 아티클</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: `next-mdx-remote` 설치 (RSC에서 raw MDX body 렌더용)**

```bash
npm install next-mdx-remote
```

`@next/mdx` 는 파일-라우트용. 우리는 콘텐츠 인덱스로부터 raw body를 동적 렌더하므로 `next-mdx-remote/rsc` 를 추가. 두 패키지는 공존 가능 (전자는 `mdx-components.tsx` 컴포넌트 매핑 인프라, 후자는 RSC에서 실 렌더).

- [ ] **Step 5: `app/[locale]/articles/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { ArticleHeader } from '@/components/article/ArticleHeader'
import { Toc } from '@/components/article/Toc'
import { RelatedArticles } from '@/components/article/RelatedArticles'
import { MedicalNotice } from '@/components/article/mdx/MedicalNotice'
import { InstallCta } from '@/components/marketing/InstallCta'
import { getArticle, getRelated, listAllSlugs } from '@/lib/content/articles'
import { useMDXComponents } from '@/mdx-components'
import { articleJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import type { Locale } from '@/lib/i18n/config'

export async function generateStaticParams() {
  return listAllSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const article = await getArticle({ locale, slug })
  if (!article) return {}
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/${locale}/articles/${slug}`,
    locale,
    image: article.ogImage ?? article.heroImage,
  })
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const article = await getArticle({ locale: loc, slug })
  if (!article) notFound()
  const related = await getRelated(article)
  const mdxComponents = useMDXComponents({})

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              title: article.title,
              excerpt: article.excerpt,
              slug: article.slug,
              locale: article.locale,
              author: article.author,
              publishedAt: article.publishedAt,
              updatedAt: article.updatedAt,
              heroImage: article.heroImage,
            }),
          ),
        }}
      />
      <Container className="py-12">
        <article className="mx-auto max-w-3xl">
          <ArticleHeader article={article} />
          <Toc markdown={article.body} />
          <div className="prose prose-neutral max-w-none">
            <MDXRemote
              source={article.body}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
                },
              }}
            />
          </div>
          {/* 본문 하단 자동 의료 고지 */}
          <MedicalNotice locale={loc} />
          <RelatedArticles articles={related} />
        </article>
      </Container>
      <InstallCta locale={loc} surface={`article:${slug}`} />
    </>
  )
}
```

⚠ `useMDXComponents` 는 React hook 이름이지만 RSC 에서도 동기 함수로 호출 가능 (실제로는 일반 함수). `next-mdx-remote/rsc` 의 `components` prop 에 직접 전달.

- [ ] **Step 6: article_view + article_to_product_click 이벤트 발사**

`app/[locale]/articles/[slug]/page.tsx` 에 클라이언트 트래커 추가. 별도 컴포넌트로 분리:

`components/article/ArticleViewTracker.tsx`:
```tsx
'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

export function ArticleViewTracker({ slug, category, locale }: { slug: string; category: string; locale: Locale }) {
  useEffect(() => {
    track('article_view', { slug, category, locale })
  }, [slug, category, locale])
  return null
}
```

`page.tsx` 의 `<Container>` 안 첫 줄에 추가:
```tsx
<ArticleViewTracker slug={article.slug} category={article.category} locale={loc} />
```

(`import` 문도 추가)

추가로, 본문 하단 자동 의료 고지 위에 제품 소개 인라인 링크 추가 (article_to_product_click 이벤트 surface):

`page.tsx` 의 MDX render 직후 (의료 고지 직전) 에 추가:
```tsx
<aside className="my-8 rounded-lg border border-[--color-primary] bg-[--color-primary-light] p-5 text-sm leading-relaxed">
  <p>
    바로도리 앱은 이 글에서 다룬 신호를 객관 수치로 확인하고 운동까지 안내합니다.{' '}
    <TrackedLink
      href={`/${loc}/product`}
      event="article_to_product_click"
      eventProps={{ slug: article.slug, locale: loc }}
      className="font-semibold text-[--color-primary-dark] underline"
    >
      제품 알아보기 →
    </TrackedLink>
  </p>
</aside>
```

상단 import에 추가:
```tsx
import { TrackedLink } from '@/components/analytics/TrackedLink'
```

- [ ] **Step 7: 빌드 + 시각 확인**

```bash
npm run build
npm run dev
```

`http://localhost:3000/ko/articles/_test-fixture` → 본문 렌더링, TOC, 의료 고지, 관련 글 확인.

- [ ] **Step 8: Commit**

```bash
git add app/[locale]/articles components/article package.json package-lock.json
git commit -m "feat(articles): add detail page with MDX rendering, TOC, auto medical notice, related"
```

---

## Task 16: 앱 설치 페이지 (베타 폼 CTA 포함)

**Files:**
- Create: `app/[locale]/install/page.tsx`, `components/install/BetaSection.tsx`

- [ ] **Step 1: `components/install/BetaSection.tsx`**

```tsx
'use client'

import { Container } from '@/components/ui/Container'
import { track } from '@/lib/analytics'
import { getBetaFormUrl } from '@/lib/install/storeLinks'
import type { Locale } from '@/lib/i18n/config'

export function BetaSection({ locale }: { locale: Locale }) {
  const url = getBetaFormUrl()
  if (!url) return null
  const onClick = () => track('cta_beta_form_click', { surface: 'install_page', locale })
  return (
    <section className="bg-[--color-primary-light] py-16">
      <Container className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">베타 서포터즈가 되어주세요</h2>
        <p className="mx-auto mt-3 max-w-xl text-[--color-text-secondary]">
          정식 출시 전, 바로도리를 먼저 사용하고 피드백을 남겨줄 보호자를 모집합니다. 운영팀이 직접 답변드립니다.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="mt-6 inline-flex items-center justify-center rounded-pill bg-black px-8 py-3 text-sm font-semibold text-white"
        >
          구글폼으로 신청하기 →
        </a>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: `app/[locale]/install/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { BetaSection } from '@/components/install/BetaSection'
import { isAppLive } from '@/lib/install/storeLinks'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '바로도리 앱 설치',
    description: 'iOS, Android에서 바로도리를 만나보세요',
    path: `/${locale}/install`,
    locale,
  })
}

export default async function InstallPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const live = isAppLive()
  return (
    <>
      <section className="py-16">
        <Container className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">바로도리 앱 설치</h1>
          <p className="mt-3 text-[--color-text-secondary]">
            {live
              ? '앱스토어에서 바로 다운로드하세요.'
              : '2026-05-20 베타 출시 예정입니다. 베타 서포터즈로 먼저 만나보세요.'}
          </p>
          <div className="mt-8 flex justify-center">
            <StoreButtons surface="install_page" locale={loc} />
          </div>
          {!live && (
            <div
              id="coming-soon"
              className="mx-auto mt-10 max-w-md rounded-lg border border-[--color-border] bg-[--color-bg-muted] p-5 text-sm text-[--color-text-secondary]"
            >
              QR 코드 / 스토어 링크는 정식 출시 시 활성화됩니다.
            </div>
          )}
        </Container>
      </section>
      <BetaSection locale={loc} />
    </>
  )
}
```

- [ ] **Step 3: 시각 + 빌드 + Commit**

```bash
npm run build
git add app/[locale]/install components/install/BetaSection.tsx
git commit -m "feat(install): add install page with store buttons + beta supporter CTA"
```

---

## Task 17: 정책 페이지 (placeholder + noindex)

**Files:**
- Create: `app/[locale]/legal/privacy/page.tsx`, `app/[locale]/legal/terms/page.tsx`

- [ ] **Step 1: `app/[locale]/legal/privacy/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { Container } from '@/components/ui/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '바로도리 개인정보처리방침',
  robots: { index: false, follow: false },
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-[--color-text-secondary]">시행일: 작성 중</p>
      <div className="mt-8 rounded-lg border border-dashed border-[--color-border] bg-[--color-bg-muted] p-6 text-sm leading-relaxed text-[--color-text-secondary]">
        본 페이지는 placeholder 입니다. 정식 본문은 법무 검토 후 업데이트됩니다.
        문의: <a href="mailto:contact@barodori.com" className="underline">contact@barodori.com</a>
      </div>
    </Container>
  )
}
```

- [ ] **Step 2: `app/[locale]/legal/terms/page.tsx`** (위 패턴 동일, 제목/내용만 "이용약관"으로)

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { Container } from '@/components/ui/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
  description: '바로도리 이용약관',
  robots: { index: false, follow: false },
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold">이용약관</h1>
      <p className="mt-2 text-sm text-[--color-text-secondary]">시행일: 작성 중</p>
      <div className="mt-8 rounded-lg border border-dashed border-[--color-border] bg-[--color-bg-muted] p-6 text-sm leading-relaxed text-[--color-text-secondary]">
        본 페이지는 placeholder 입니다. 정식 본문은 법무 검토 후 업데이트됩니다.
      </div>
    </Container>
  )
}
```

- [ ] **Step 3: 빌드 + 페이지 head에 noindex 들어갔는지 확인**

```bash
npm run build
npm run dev
curl -s http://localhost:3000/ko/legal/privacy | grep -i 'noindex'
```

Expected: `<meta name="robots" content="noindex,nofollow"/>` 발견.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/legal
git commit -m "feat(legal): add privacy/terms placeholder pages with noindex"
```

---

## Task 18: Mock 아티클 콘텐츠 1~2건 작성

**Files:**
- Delete: `content/articles/ko/_test-fixture.mdx` (테스트용 픽스처는 유지하되 `draft: true` 로 변경하거나 production 빌드에서 제외)
- Create: `content/articles/ko/torticollis-symptoms.mdx`, `content/articles/ko/tummy-time-guide.mdx`
- Create: `public/articles/torticollis-symptoms/hero.png`, `public/articles/tummy-time-guide/hero.png` (placeholder)

- [ ] **Step 1: 픽스처 정리 — production 빌드 제외**

`content/articles/ko/_test-fixture.mdx` frontmatter 의 `draft: false` 를 `draft: true` 로 변경. Production (`NODE_ENV=production`) 빌드에선 자동 제외.

- [ ] **Step 2: 아티클 1 — 사경 증상**

`content/articles/ko/torticollis-symptoms.mdx`:
```mdx
---
title: 영아 사경, 이런 증상이 보인다면
slug: torticollis-symptoms
category: torticollis
publishedAt: 2026-05-04
updatedAt: 2026-05-04
author: 바로도리 콘텐츠팀
authorRole: 전문가 검토 완료
excerpt: 한쪽으로만 고개를 돌리는 아기, 어떤 신호를 살펴봐야 할까요? 사경 의심 증상과 병원 방문 기준을 정리했습니다.
heroImage: /articles/torticollis-symptoms/hero.png
heroImageAlt: 사경 증상 일러스트
readingMinutes: 4
relatedSlugs: [tummy-time-guide]
draft: false
locale: ko
---

## 사경(torticollis)이란?

영아 사경은 목 한쪽 근육(특히 흉쇄유돌근)이 짧아지면서 머리가 한쪽으로 기울어지는 증상입니다. 신생아 250명 중 1명 꼴로 나타난다고 알려져 있습니다.

## 의심 증상 6가지

- 한쪽으로만 고개를 돌리려고 한다
- 머리 모양이 비대칭이다 (한쪽 뒤통수가 납작)
- 한쪽으로만 누워 자기를 좋아한다
- 특정 방향의 자극에만 시선을 둔다
- 목 옆에 단단한 멍울이 만져진다
- 수유 시 한쪽 자세를 거부한다

## 병원에 가야 하는 신호

<Callout type="medical">
다음 중 하나라도 해당되면 즉시 소아청소년과 또는 재활의학과 진료를 받으세요.

- 통증을 호소하거나 강한 울음이 동반된다
- 발열, 호흡 이상, 신경학적 이상이 있다
- 움직임이 갑자기 제한된다
- 4주 이상 같은 증상이 지속된다
</Callout>

## 집에서 시작할 수 있는 것

전문가 진료 전에는 무리한 스트레칭은 피하고, 자는 방향을 매일 바꿔주는 것부터 시작해보세요.

<RelatedArticles slugs={["tummy-time-guide"]} />
```

- [ ] **Step 3: 아티클 2 — 터미타임 가이드**

`content/articles/ko/tummy-time-guide.mdx`:
```mdx
---
title: 안전한 터미타임, 이렇게 시작하세요
slug: tummy-time-guide
category: exercise
publishedAt: 2026-05-03
updatedAt: 2026-05-03
author: 바로도리 콘텐츠팀
authorRole: 전문가 검토 완료
excerpt: 터미타임은 영아 두상 비대칭 예방의 첫걸음입니다. 안전 수칙과 시작 가이드를 알려드려요.
heroImage: /articles/tummy-time-guide/hero.png
heroImageAlt: 터미타임 일러스트
readingMinutes: 3
relatedSlugs: [torticollis-symptoms]
draft: false
locale: ko
---

## 터미타임이 왜 중요한가요?

깨어있는 시간 동안 아기를 엎드린 자세로 두는 것을 터미타임이라고 합니다. 두상 비대칭 예방, 목 근육 발달, 운동 발달에 도움이 됩니다.

## 시작 가이드

<ExerciseCard title="입문 단계" duration="1회 3분 × 하루 3회" cautions="호흡 이상이 보이면 즉시 중단하세요.">

1. 단단한 매트 위에 아기를 엎드리게 둡니다.
2. 보호자가 정면에서 아기와 눈을 맞추세요.
3. 처음에는 짧게, 점차 시간을 늘립니다.

</ExerciseCard>

## 안전 수칙

- 잠든 아기는 절대 엎드리게 두지 마세요
- 매트는 단단하고 평평한 것을 사용하세요
- 푹신한 베개나 인형을 주변에 두지 마세요

<MedicalNotice locale="ko" />
```

(주의: 위 마지막 `<MedicalNotice locale="ko" />` 는 본문 내 수동 삽입 예시. 페이지에서 자동으로도 한 번 더 노출되므로 중복 방지 위해 위 줄 제거 가능 — 더 직관적인 건 본문엔 넣지 않는 것. 결정: **본문 자동 삽입에 일임**, 위 라인 삭제.)

→ 본 step 에서는 `<MedicalNotice />` 라인 제거 후 저장.

- [ ] **Step 4: placeholder 이미지**

```bash
mkdir -p public/articles/torticollis-symptoms public/articles/tummy-time-guide
node -e "require('fs').writeFileSync('public/articles/torticollis-symptoms/hero.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'))"
node -e "require('fs').writeFileSync('public/articles/tummy-time-guide/hero.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'))"
```

- [ ] **Step 5: 빌드 + 시각 확인**

```bash
npm run build
npm run dev
```

`http://localhost:3000/ko/articles` → 2개 아티클 카드. 각 상세 페이지 정상 렌더링. TOC, MDX 컴포넌트 (Callout, ExerciseCard, RelatedArticles), 자동 의료 고지, 관련 글 확인.

- [ ] **Step 6: 테스트 통과 확인 (픽스처 변경으로 깨지지 않는지)**

```bash
npm run test
```

`articles.test.ts` 의 `_test-fixture` 가 `draft: true` 가 되었으므로 dev/prod 분기에서 통과 여부 확인. dev 모드에선 통과해야 함 (테스트 환경 `NODE_ENV=test` → `includeDrafts` false). 

> **테스트 회귀**: 기존 articles.test.ts는 `_test-fixture` 가 `listArticles` 결과에 들어있다고 가정. `draft: true` 로 바뀌면 `_test-fixture` 가 production 에선 제외, test 환경(`NODE_ENV=test`)에서도 `includeDrafts=false` 이므로 제외 → 테스트 깨짐.
>
> 해결: 픽스처를 별도 디렉토리(`content/articles/__fixtures__/`)로 옮기고 테스트에서만 별도 로드, 또는 production 아티클 2건이 들어왔으니 테스트를 production 아티클 기준으로 변경. **결정**: 후자. 픽스처 파일 삭제, 테스트는 실제 아티클(`torticollis-symptoms`)을 사용하도록 수정.

- [ ] **Step 7: 픽스처 제거 + 테스트 수정**

```bash
rm content/articles/ko/_test-fixture.mdx
```

`lib/content/articles.test.ts` 수정:
```ts
import { describe, it, expect } from 'vitest'
import { listArticles, getArticle, getRelated } from './articles'

describe('articles index', () => {
  it('listArticles returns ko articles excluding drafts', async () => {
    const articles = await listArticles({ locale: 'ko' })
    expect(articles.length).toBeGreaterThan(0)
    expect(articles.every((a) => a.draft === false)).toBe(true)
    expect(articles.every((a) => a.locale === 'ko')).toBe(true)
  })

  it('listArticles filters by category', async () => {
    const articles = await listArticles({ locale: 'ko', category: 'torticollis' })
    expect(articles.every((a) => a.category === 'torticollis')).toBe(true)
    expect(articles.length).toBeGreaterThan(0)
  })

  it('getArticle returns by slug', async () => {
    const article = await getArticle({ locale: 'ko', slug: 'torticollis-symptoms' })
    expect(article).not.toBeNull()
    expect(article?.title).toBe('영아 사경, 이런 증상이 보인다면')
    expect(article?.body).toContain('## 사경')
  })

  it('getArticle returns null for missing slug', async () => {
    const article = await getArticle({ locale: 'ko', slug: 'does-not-exist' })
    expect(article).toBeNull()
  })

  it('listArticles is sorted by publishedAt desc', async () => {
    const articles = await listArticles({ locale: 'ko' })
    for (let i = 1; i < articles.length; i++) {
      expect(articles[i - 1].publishedAt >= articles[i].publishedAt).toBe(true)
    }
  })

  it('getRelated returns related articles when relatedSlugs set', async () => {
    const article = await getArticle({ locale: 'ko', slug: 'torticollis-symptoms' })
    if (!article) throw new Error('fixture missing')
    const related = await getRelated(article)
    expect(related.length).toBeGreaterThan(0)
    expect(related[0].slug).toBe('tummy-time-guide')
  })
})
```

- [ ] **Step 8: 테스트 통과 확인**

```bash
npm run test
```

Expected: 6 tests pass.

- [ ] **Step 9: Commit**

```bash
git add content/articles public/articles lib/content/articles.test.ts
git commit -m "feat(content): add 2 mock articles (torticollis-symptoms, tummy-time-guide), drop test fixture"
```

---

## Task 19: 최종 QA — 빌드, 린트, 라이트하우스, 수동 체크리스트

**Files:**
- 변경 없음 (수정사항이 발생하면 별 task)

- [ ] **Step 1: 풀 빌드 + 린트 + 타입 체크 + 테스트**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

모두 통과 확인. 실패 시 fix → 재실행.

- [ ] **Step 2: 빌드 산출물 점검**

`next build` 출력에서 다음 확인:
- `/[locale]` SSG (ko, en 모두)
- `/[locale]/product` SSG
- `/[locale]/articles` SSG
- `/[locale]/articles/[slug]` SSG (모든 ko slug 사전 생성: 2건)
- `/[locale]/install` SSG
- `/[locale]/legal/privacy`, `/legal/terms` SSG
- `/sitemap.xml`, `/robots.txt` 정적

Dynamic 으로 표시된 라우트가 있다면 원인 추적 (대개 `searchParams` 사용 시 발생 — 아티클 목록의 `cat` 쿼리는 dynamic으로 떨어져도 OK).

- [ ] **Step 3: 수동 시각 체크리스트**

```bash
npm run dev
```

각 페이지를 모바일(375)/태블릿(768)/데스크탑(1280) 사이즈로 확인:
- [ ] `/` → `/ko` 308 리다이렉트
- [ ] `/ko` 홈: 모든 섹션 (Hero, Stats, Symptoms, Action, Features, Articles, Safety, InstallCta) 렌더링
- [ ] `/ko/product` 제품 소개 페이지 정상
- [ ] `/ko/articles` 목록 + 카테고리 필터 동작
- [ ] `/ko/articles?cat=torticollis` 필터 결과 1건
- [ ] `/ko/articles/torticollis-symptoms` 상세: TOC, Callout, RelatedArticles 컴포넌트, 자동 의료 고지, 관련 글
- [ ] `/ko/articles/tummy-time-guide` 상세: ExerciseCard 정상
- [ ] `/ko/install` 설치 페이지: env 미설정 시 "출시 예정" 상태, 베타 폼 CTA 정상
- [ ] `/ko/legal/privacy` placeholder + `<head>` 에 noindex
- [ ] `/ko/legal/terms` placeholder + noindex
- [ ] `/en` 영문 셸: noindex 메타, copyright "Zerorder", locale switcher 동작
- [ ] 모든 페이지: Header, Footer, 모바일 햄버거(없음 — sm: 이상에서만 nav, 모바일은 메뉴 생략 OK?) 상태 확인. 만약 모바일에서 nav가 사라져 navigation impossible 이면 별 task로 모바일 메뉴 추가. MVP는 모바일 nav 없이 갈 수 있음.
- [ ] CTA 클릭 시 콘솔에 `[analytics] cta_install_click ...` (env 키 없을 때 dev 콘솔 디버그) 노출
- [ ] 베타 폼 CTA 클릭 시 새 탭으로 Google Form 이동
- [ ] 데스크탑 hero/InstallCta 의 "지금 시작하기/지금 설치하기" 클릭 시 QR 모달 오픈, esc/외부 클릭 시 닫힘

- [ ] **Step 4: SEO 메타 검증**

```bash
curl -s http://localhost:3000/ko/articles/torticollis-symptoms | grep -E '<title>|description|canonical|hreflang|og:|twitter:|ld\\+json' | head -20
```

확인:
- canonical: `https://barodori.com/ko/articles/torticollis-symptoms`
- hreflang ko/en/x-default
- OG title/description/image
- JSON-LD `Article` 스키마

- [ ] **Step 5: sitemap.xml 검증**

```bash
curl -s http://localhost:3000/sitemap.xml
```

ko 라우트만 + 아티클 2건 포함 확인.

- [ ] **Step 6: Lighthouse (선택, 환경에 따라)**

`pnpm dlx lighthouse http://localhost:3000/ko --view` 또는 Chrome DevTools Lighthouse 모바일 측정.

목표 (베타 권고):
- SEO ≥ 95
- Performance ≥ 80
- Accessibility ≥ 90

미달 시 우선순위:
1. Performance: 폰트 preload, 이미지 width/height 명시, hero priority 확인
2. Accessibility: alt text, color contrast, aria-label
3. SEO: canonical/title/description/hreflang 누락 점검

- [ ] **Step 7: README 작성**

`README.md` 전면 교체:
```markdown
# 바로도리 제품 웹사이트

영아 사경/사두 케어 앱 바로도리(BaroDori)의 제품 소개 + 사경 아티클 사이트. (https://barodori.com)

## 스택
- Next.js 16 (App Router, 풀-SSG)
- React 19, TypeScript 5
- Tailwind v4 + Pretendard
- MDX 기반 아티클 (`content/articles/{locale}/*.mdx`)
- GA4 + Amplitude

## 개발

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 → /ko 로 리다이렉트.

## 스크립트

- `npm run dev` 개발 서버
- `npm run build` 정적 빌드
- `npm run start` 빌드 결과 서빙
- `npm run lint` ESLint
- `npm run typecheck` TypeScript 검사
- `npm run test` Vitest 단위 테스트

## 콘텐츠 추가

`content/articles/ko/<slug>.mdx` 생성 → frontmatter 작성 → 이미지는 `public/articles/<slug>/` → `npm run build` → 자동 sitemap 등록.

## 환경변수
`.env.example` 참고. 모든 키는 미설정 가능하며, 그에 따라 동작이 달라집니다 (스토어 링크 미설정 시 "출시 예정" 상태 등).

## 설계 문서
- 설계 spec: `docs/superpowers/specs/2026-05-04-barodori-website-mvp-design.md`
- 구현 플랜: `docs/superpowers/plans/2026-05-04-barodori-website-mvp.md`
```

- [ ] **Step 8: Commit + 인수 기준 체크**

```bash
git add README.md
git commit -m "docs: update README with stack, scripts, content authoring guide"
```

spec `13. 인수 기준` 의 모든 항목을 다시 한번 점검 — 미충족 항목이 있다면 별 task 생성.

---

## 의존성 추가 요약

```
프로덕션:
  @next/mdx
  @mdx-js/loader
  @mdx-js/react
  next-mdx-remote
  gray-matter
  remark-gfm
  rehype-slug
  rehype-autolink-headings
  reading-time

개발:
  vitest
  @vitejs/plugin-react
  @testing-library/react
  @testing-library/jest-dom
  jsdom
  @types/mdx
```

## Out-of-Scope (spec §12 재확인)

- 헤드리스 CMS, 영문 콘텐츠, 동적 OG, 사이트 검색, 댓글, A/B 테스트, 스크롤 깊이/실 설치 추적/체류 시간, Lighthouse CI 자동화, 실제 정책 본문, Firebase 연동.
- 모바일 햄버거 메뉴 (현 MVP는 sm: 이상에서만 nav 노출)

## 자체 검토 결과

- **Spec 커버리지**: spec §3 라우팅, §4 페이지 7종, §5 MDX 모델, §6 토큰/컴포넌트, §7 설치 분기, §8 분석 5종 이벤트, §9 SEO (sitemap/robots/JSON-LD/canonical/hreflang/noindex), §10 env, §11 폴더 구조, §13 인수 기준 — 모두 task에 매핑됨
- **placeholder 없음**: 모든 step에 코드/명령 포함
- **타입 일관성**: `Locale`/`Category`/`Article` 시그니처가 task 1~18 에서 일관, `track(event, props?)` 시그니처 일관
- **알려진 한계**:
  - Toc 의 slugify 와 rehype-slug 결과가 미세 차이 가능 (한글 처리) — MVP 허용, 정밀화는 추후
  - 모바일 nav 미구현 — MVP 의도적 제외
  - Pretendard CDN 다운로드 실패 시 jsdelivr fallback 필요할 수 있음
  - Amplitude CDN 동적 import 방식이라 환경에 따라 차단될 수 있음 — 차단 시 `@amplitude/analytics-browser` 패키지 도입으로 전환

