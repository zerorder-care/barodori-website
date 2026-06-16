# 홈 6섹션 재구성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 앱 주요 화면 6장을 폰 목업으로 보여주는 6개 스크롤 섹션으로 홈을 재구성한다.

**Architecture:** `Hero`(유지) → 신규 `HomeStorySections`(6섹션, 각각 라벨·제목·본문·칩 + `PhoneFrame` 스크린샷) → `SafetyNotice`(의료 면책) → `InstallCta`(마무리). 폰 목업은 재사용 `PhoneFrame`(긴 캡처 3장은 하단 페이드), 등장 애니메이션은 `Reveal`(`motion-safe` 페이드업, IntersectionObserver 없으면 즉시 표시).

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4(인라인 토큰), Pretendard, `next/image`, Vitest + @testing-library/react(jsdom).

**설계 문서:** `docs/superpowers/specs/2026-06-16-home-6-section-redesign-design.md`

**프로젝트 규칙(AGENTS.md):** "This is NOT the Next.js you know." 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 읽을 것. 각 태스크에 해당 문서 경로를 명시했다.

**테스트 범위 주의:** `vitest.config.ts`의 include는 `lib/**`와 `components/**/*.test.tsx`뿐이다. `app/**` 테스트는 실행되지 않으므로, 페이지(`app/[locale]/page.tsx`)는 단위 테스트 대신 typecheck·build·수동 확인으로 검증한다. 로직/구조 검증은 모두 컴포넌트 테스트로 커버한다.

**설계 대비 미세 조정(의도된 개선):** 설계 문서는 라벨·칩을 모두 `#FFF5DB` pill로 적었으나, ②⑥ 섹션 배경이 앰버 틴트(`#FFF5DB`)라 pill이 묻힌다. 따라서 **라벨 = 솔리드 앰버 pill**(`bg-primary` + 다크 텍스트), **칩 = 흰 배경 + 앰버 보더(`#FDE68A`)**로 모든 배경에서 대비를 확보한다(`#FDE68A`는 기존 `SafetyNotice` 보더와 동일 값).

---

## File Structure

| 파일 | 책임 | 신규/수정 |
|---|---|---|
| `public/images/app-screens/*.png` | 6장 스크린샷 자산 | 신규(6개) |
| `components/marketing/PhoneFrame.tsx` | 폰 목업 1개 + tall 하단 페이드 | 신규 |
| `components/marketing/PhoneFrame.test.tsx` | PhoneFrame 동작 테스트 | 신규 |
| `components/marketing/Reveal.tsx` | 스크롤 진입 페이드업(클라이언트) | 신규 |
| `components/marketing/Reveal.test.tsx` | Reveal 접근성/폴백 테스트 | 신규 |
| `components/marketing/HomeStorySections.tsx` | 6섹션 데이터+레이아웃 | 신규 |
| `components/marketing/HomeStorySections.test.tsx` | 6섹션 렌더/무링크 테스트 | 신규 |
| `app/[locale]/page.tsx` | 홈 구성 교체 | 수정 |

---

## Task 1: 6장 스크린샷 자산 추가

**Files:**
- Create: `public/images/app-screens/home.png`, `exercise-timer.png`, `session-report.png`, `calendar-report.png`, `community.png`, `parent-check.png`

- [ ] **Step 1: Downloads의 6장을 리네임 복사**

Run:
```bash
SRC="/Users/max/Downloads/'바로도리' 주요화면_6장 (수정)"
DST="public/images/app-screens"
cp "$SRC/page-home.png"                       "$DST/home.png"
cp "$SRC/onboarding-stopwatch (수정).png"      "$DST/exercise-timer.png"
cp "$SRC/flow-report-detail.png"              "$DST/session-report.png"
cp "$SRC/page-calendar-month-list (수정).png"  "$DST/calendar-report.png"
cp "$SRC/community-feed-latest.png"           "$DST/community.png"
cp "$SRC/page-parent-stress-prepare.png"      "$DST/parent-check.png"
```

- [ ] **Step 2: 6개 파일이 모두 존재하고 가로 786px인지 확인**

Run:
```bash
cd public/images/app-screens && for f in home exercise-timer session-report calendar-report community parent-check; do sips -g pixelWidth -g pixelHeight "$f.png" 2>/dev/null | awk -v n="$f" '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print n".png "w"x"h}'; done; cd -
```
Expected: 6줄 출력, 모두 `786x...` (home 786x1704, exercise-timer 786x1710, session-report 786x2360, calendar-report 786x2682, community 786x2800, parent-check 786x1704).

- [ ] **Step 3: Commit**

```bash
git add public/images/app-screens
git commit -m "$(cat <<'EOF'
홈 6섹션용 앱 스크린샷 6장 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `PhoneFrame` 컴포넌트 (폰 목업 + tall 하단 페이드)

**Files:**
- Read: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (App Router `next/image`: `fill`, `sizes`)
- Create: `components/marketing/PhoneFrame.tsx`
- Test: `components/marketing/PhoneFrame.test.tsx`

- [ ] **Step 1: next/image 문서 확인**

Run: `sed -n '1,80p' node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`
확인 포인트: `fill` 사용 시 부모가 `position: relative`여야 함, `sizes` 권장, `alt` 필수.

- [ ] **Step 2: 실패하는 테스트 작성**

Create `components/marketing/PhoneFrame.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhoneFrame } from './PhoneFrame'

describe('PhoneFrame', () => {
  it('renders the screenshot with its alt text', () => {
    render(<PhoneFrame src="/images/app-screens/home.png" alt="홈 화면 미리보기" />)
    expect(screen.getByAltText('홈 화면 미리보기')).toBeInTheDocument()
  })

  it('shows the bottom fade overlay only when tall', () => {
    const { queryByTestId, rerender } = render(<PhoneFrame src="/x.png" alt="a" />)
    expect(queryByTestId('screen-fade')).toBeNull()

    rerender(<PhoneFrame src="/x.png" alt="a" tall />)
    expect(queryByTestId('screen-fade')).not.toBeNull()
  })
})
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npx vitest run components/marketing/PhoneFrame.test.tsx`
Expected: FAIL — `Failed to resolve import './PhoneFrame'` (파일 없음).

- [ ] **Step 4: PhoneFrame 구현**

Create `components/marketing/PhoneFrame.tsx`:
```tsx
import Image from 'next/image'

export type PhoneFrameProps = {
  src: string
  alt: string
  /** 긴 전체 캡처(③④⑤)는 true → 하단을 부드럽게 페이드해 "스크롤되는 앱" 느낌 */
  tall?: boolean
}

export function PhoneFrame({ src, alt, tall = false }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[32px] bg-[#111827] p-2 shadow-[0_28px_60px_-32px_rgba(0,0,0,0.45)]">
      <div className="relative aspect-[786/1704] overflow-hidden rounded-[24px] bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 70vw, 300px"
          className="object-cover object-top"
        />
        {tall && (
          <div
            data-testid="screen-fade"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-b from-transparent to-white"
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run components/marketing/PhoneFrame.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add components/marketing/PhoneFrame.tsx components/marketing/PhoneFrame.test.tsx
git commit -m "$(cat <<'EOF'
PhoneFrame 컴포넌트 추가 (폰 목업 + tall 하단 페이드)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `Reveal` 컴포넌트 (스크롤 진입 페이드업)

**Files:**
- Read: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`
- Create: `components/marketing/Reveal.tsx`
- Test: `components/marketing/Reveal.test.tsx`

- [ ] **Step 1: use-client 문서 확인**

Run: `sed -n '1,60p' node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`
확인 포인트: 클라이언트 컴포넌트 경계, `useEffect`/`useState` 사용 가능.

- [ ] **Step 2: 실패하는 테스트 작성**

Create `components/marketing/Reveal.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { Reveal } from './Reveal'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Reveal', () => {
  it('always renders its children (content is never removed from the DOM)', () => {
    render(
      <Reveal>
        <p>보이는 내용</p>
      </Reveal>,
    )
    expect(screen.getByText('보이는 내용')).toBeInTheDocument()
  })

  it('falls back to visible when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { container } = render(
      <Reveal>
        <p>폴백</p>
      </Reveal>,
    )
    expect(container.firstChild).toHaveAttribute('data-visible', 'true')
  })
})
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npx vitest run components/marketing/Reveal.test.tsx`
Expected: FAIL — `Failed to resolve import './Reveal'`.

- [ ] **Step 4: Reveal 구현**

Create `components/marketing/Reveal.tsx`:
```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode
  className?: string
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 접근성/폴백: IntersectionObserver가 없으면 즉시 표시한다.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition duration-700 ease-out motion-safe:translate-y-3 motion-safe:opacity-0 motion-safe:data-[visible=true]:translate-y-0 motion-safe:data-[visible=true]:opacity-100 ${className}`}
    >
      {children}
    </div>
  )
}
```
참고: 숨김은 `motion-safe`에서만 적용되므로 `prefers-reduced-motion` 사용자는 항상 표시된다. 또한 텍스트는 항상 DOM에 있어 크롤러·스크린리더가 읽으며(opacity는 AT 가시성에 영향 없음), IO 미지원 환경에선 즉시 표시된다.

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run components/marketing/Reveal.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add components/marketing/Reveal.tsx components/marketing/Reveal.test.tsx
git commit -m "$(cat <<'EOF'
Reveal 컴포넌트 추가 (motion-safe 스크롤 페이드업, 접근성 폴백)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `HomeStorySections` (6섹션)

**Files:**
- Create: `components/marketing/HomeStorySections.tsx`
- Test: `components/marketing/HomeStorySections.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `components/marketing/HomeStorySections.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HomeStorySections } from './HomeStorySections'

describe('HomeStorySections', () => {
  it('renders all six section titles', () => {
    render(<HomeStorySections />)
    expect(screen.getByText('앱을 열면, 오늘 뭘 할지 바로 보여요')).toBeInTheDocument()
    expect(screen.getByText('동요 틀고, 도리랑 같이 운동해요')).toBeInTheDocument()
    expect(screen.getByText('방금 한 운동이, 좌우 횟수까지 그대로 남아요')).toBeInTheDocument()
    expect(screen.getByText('쌓인 기록이, 이번 주 흐름을 보여줘요')).toBeInTheDocument()
    expect(screen.getByText('혼자가 아니라는 걸, 여기서 느껴요')).toBeInTheDocument()
    expect(screen.getByText('아이를 돌본 만큼, 보호자님도 살펴요')).toBeInTheDocument()
  })

  it('renders each app screenshot via alt text', () => {
    render(<HomeStorySections />)
    expect(screen.getAllByRole('img')).toHaveLength(6)
    expect(screen.getByAltText(/홈 화면/)).toBeInTheDocument()
    expect(screen.getByAltText(/커뮤니티/)).toBeInTheDocument()
    expect(screen.getByAltText(/보호자 컨디션 셀프 체크/)).toBeInTheDocument()
  })

  it('contains no links (community is showcase-only, no CTAs anywhere)', () => {
    render(<HomeStorySections />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run components/marketing/HomeStorySections.test.tsx`
Expected: FAIL — `Failed to resolve import './HomeStorySections'`.

- [ ] **Step 3: HomeStorySections 구현**

Create `components/marketing/HomeStorySections.tsx`:
```tsx
import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { Reveal } from '@/components/marketing/Reveal'

type StorySection = {
  id: string
  label: string
  title: string
  body: string
  chips: readonly string[]
  screen: { src: string; alt: string; tall?: boolean }
  bg: string
}

const sections: readonly StorySection[] = [
  {
    id: 'home',
    label: '오늘의 홈',
    title: '앱을 열면, 오늘 뭘 할지 바로 보여요',
    body: '오늘 운동 기록과 이번 주 목표, 다른 보호자들의 이야기까지 한 화면에 담았어요. 복잡하게 헤매지 않아도 돼요.',
    chips: ['오늘의 운동기록', '이번 주 목표', '스트레스 체크'],
    screen: {
      src: '/images/app-screens/home.png',
      alt: '바로도리 홈 화면 — 오늘의 운동 기록과 이번 주 목표를 한눈에 보여줘요',
    },
    bg: 'bg-white',
  },
  {
    id: 'exercise',
    label: '운동하기',
    title: '동요 틀고, 도리랑 같이 운동해요',
    body: '시작 버튼을 누르면 시간이 흐르고 동요가 흘러나와요. 몇 번 했는지는 끝나고 바로 적으면 되니까, 운동하는 동안엔 아이만 봐요.',
    chips: ['스톱워치', '동요 재생', '끝나고 횟수 기록'],
    screen: {
      src: '/images/app-screens/exercise-timer.png',
      alt: '바로도리 운동 화면 — 도리 캐릭터와 운동 타이머, 동요 재생',
    },
    bg: 'bg-[var(--color-primary-light)]',
  },
  {
    id: 'record',
    label: '기록',
    title: '방금 한 운동이, 좌우 횟수까지 그대로 남아요',
    body: '도리도리 좌 12번·우 10번, 터미타임 4분 30초. 숫자만이 아니라 ‘오른쪽은 잘 따라왔어요’ 같은 메모와 사진도 같이 담겨요. 다음 진료 때 그대로 보여드리면 돼요.',
    chips: ['좌·우 횟수', '오늘의 메모', '사진·영상'],
    screen: {
      src: '/images/app-screens/session-report.png',
      alt: '바로도리 운동 리포트 — 운동별 좌우 횟수와 메모, 사진 기록',
      tall: true,
    },
    bg: 'bg-white',
  },
  {
    id: 'flow',
    label: '흐름',
    title: '쌓인 기록이, 이번 주 흐름을 보여줘요',
    body: '운동한 날, 물리치료 다녀온 날이 달력에 색으로 남아요. 이번 주 목표는 얼마나 채웠는지, 무슨 운동을 많이 했는지 한눈에 정리돼요.',
    chips: ['예약·운동 달력', '주간 목표 달성률', '운동별 비중'],
    screen: {
      src: '/images/app-screens/calendar-report.png',
      alt: '바로도리 달력과 주간 리포트 — 운동·물리치료 기록과 목표 달성률',
      tall: true,
    },
    bg: 'bg-[var(--color-bg-muted)]',
  },
  {
    id: 'community',
    label: '함께',
    title: '혼자가 아니라는 걸, 여기서 느껴요',
    body: '터미타임을 어떻게 나눴는지, 고개 돌리기를 며칠 만에 따라왔는지. 먼저 지나온 보호자들의 진짜 이야기가 매일 올라와요.',
    chips: ['도리 이야기', '도리 운동일지', '댓글로 응원'],
    screen: {
      src: '/images/app-screens/community.png',
      alt: '바로도리 커뮤니티 — 보호자들이 운동 기록과 경험을 나누는 피드',
      tall: true,
    },
    bg: 'bg-white',
  },
  {
    id: 'parent',
    label: '보호자님',
    title: '아이를 돌본 만큼, 보호자님도 살펴요',
    body: '1분만 카메라를 보면 오늘 마음이 좋아요·괜찮아요·조금 지쳐있어요·힘들어요 중 어디쯤인지 알려드려요. 잘 돌보려면, 보호자님부터 괜찮아야 하니까요.',
    chips: ['1분 셀프 체크', '4단계 안내', '기록으로 흐름 보기'],
    screen: {
      src: '/images/app-screens/parent-check.png',
      alt: '바로도리 보호자 컨디션 셀프 체크 — 1분 카메라로 오늘 상태를 4단계로 안내',
    },
    bg: 'bg-[var(--color-primary-light)]',
  },
]

export function HomeStorySections() {
  return (
    <>
      {sections.map((section, index) => (
        <section
          key={section.id}
          aria-labelledby={`story-${section.id}-title`}
          className={`${section.bg} py-20 sm:py-28`}
        >
          <Container>
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <Reveal>
                <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {section.label}
                </p>
                <h2
                  id={`story-${section.id}-title`}
                  className="mt-5 text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl"
                >
                  {section.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
                  {section.body}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">
                  {section.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-pill border border-[#FDE68A] bg-white px-3 py-1"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delayMs={120}>
                <PhoneFrame
                  src={section.screen.src}
                  alt={section.screen.alt}
                  tall={section.screen.tall}
                />
              </Reveal>
            </div>
          </Container>
        </section>
      ))}
    </>
  )
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run components/marketing/HomeStorySections.test.tsx`
Expected: PASS (3 tests). `getAllByRole('img')`가 6을 반환(섹션당 1장).

- [ ] **Step 5: Commit**

```bash
git add components/marketing/HomeStorySections.tsx components/marketing/HomeStorySections.test.tsx
git commit -m "$(cat <<'EOF'
HomeStorySections 추가 (앱 화면 6장 기반 스크롤 섹션)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: 홈 페이지 구성 교체

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: page.tsx 재작성**

`app/[locale]/page.tsx`를 아래로 교체(메타데이터·JSON-LD·`dynamic`은 유지, 가운데 섹션만 신규 구성으로):
```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Hero } from '@/components/marketing/Hero'
import { HomeStorySections } from '@/components/marketing/HomeStorySections'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { InstallCta } from '@/components/marketing/InstallCta'
import { organizationJsonLd, mobileAppJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import type { Locale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '바로도리 - 아기·영유아 홈케어 운동 기록 앱',
    description: '병원에서 안내받은 홈케어 운동을 오늘의 목표로 정하고, 시간·횟수·아이 반응을 달력과 리포트로 확인하세요.',
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
      <HomeStorySections />
      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="home" />
    </>
  )
}
```
주의: `HomeTogetherSection`/`HomeFeatureSections`/`SecondaryPaths` import·렌더는 제거됐다(파일 자체는 삭제하지 않음). `SafetyNotice`는 async 서버 컴포넌트라 그대로 렌더 가능.

- [ ] **Step 2: 타입체크**

Run: `npm run typecheck`
Expected: 에러 없이 통과(미사용 import가 남아 있지 않은지도 확인됨).

- [ ] **Step 3: 린트**

Run: `npm run lint`
Expected: 에러 없음. (미사용 import가 있으면 제거.)

- [ ] **Step 4: 전체 테스트 스위트**

Run: `npm test`
Expected: 기존 + 신규 테스트 전부 PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/page.tsx"
git commit -m "$(cat <<'EOF'
홈을 6섹션 스토리 구성으로 교체

Hero → HomeStorySections → SafetyNotice → InstallCta.
기존 가운데 블록(함께/기능3/보조경로)은 홈에서 제거(파일은 보존).

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: 빌드 + 시각 검증

**Files:** (없음 — 검증 전용)

- [ ] **Step 1: 프로덕션 빌드**

Run: `npm run build`
Expected: 빌드 성공, `app/[locale]/page` 라우트 정상.

- [ ] **Step 2: 개발 서버에서 수동 확인**

Run: `npm run dev` 후 브라우저로 `http://localhost:3000/ko` 접속.
체크리스트:
- Hero 아래로 6섹션이 `홈 → 운동 → 기록 → 흐름 → 커뮤니티 → 보호자` 순서로 보인다.
- 각 섹션: 솔리드 앰버 라벨 + 제목 + 본문 + 칩 3개, 폰 목업 안에 실제 스크린샷.
- 텍스트↔폰이 섹션마다 좌우로 번갈아 배치된다(데스크탑 폭).
- 긴 3장(기록·흐름·커뮤니티)은 폰 하단이 부드럽게 페이드된다.
- ②운동·⑥보호자 섹션 배경이 옅은 앰버, 라벨·칩이 묻히지 않는다.
- 스크롤 시 섹션이 페이드업으로 등장한다.
- 커뮤니티 섹션에 클릭 가능한 링크가 없다.
- 보호자 섹션 아래 의료 면책(`이용 안내`) 박스가 보인다.
- 맨 아래 다크 설치 CTA(`InstallCta`)가 보인다.
- 모바일 폭(개발자도구)에서 1열로 깔끔히 쌓인다.
- (선택) OS 모션 줄이기 설정 시 페이드업 없이 즉시 표시된다.

- [ ] **Step 3: 빌드 산출물이 git에 들어가지 않았는지 확인**

Run: `git status`
Expected: `.next/` 등 빌드 산출물이 추적되지 않음(기존 `.gitignore` 적용). 추가 커밋 불필요.

---

## Self-Review (작성자 점검 결과)

**1. Spec coverage:** 설계 문서 각 항목 대응 —
- 구조(§2) → Task 5. 6섹션 카피(§3) → Task 4 데이터. 타이포 시스템(§4) → Task 4 className(라벨/제목/본문/칩). 컴포넌트 아키텍처(§5) → Task 2·3·4·5. 에셋(§6) → Task 1. 톤(§7) → Task 4 카피 확정본. 안전·면책(§8) → Task 5 `SafetyNotice`. 접근성·모션(§9) → Task 3 `Reveal` + `aria-labelledby`/`alt`. 영향 파일(§10) → File Structure 표. 성공 기준(§12) → Task 6 체크리스트. 누락 없음.
- 설계의 "라벨/칩 = `#FFF5DB` pill" 한 가지는 앰버 틴트 섹션과 충돌하여 **헤더의 '설계 대비 미세 조정'대로 라벨=솔리드 앰버, 칩=흰 배경+`#FDE68A` 보더**로 구현(의도된 개선).

**2. Placeholder scan:** "TBD/TODO/적절히 처리" 등 없음. 모든 코드 단계에 완전한 코드 포함.

**3. Type consistency:** `PhoneFrame` props(`src/alt/tall`)가 정의(Task 2)와 사용(Task 4)에서 일치. `StorySection.screen.tall?`(boolean 옵셔널) → `PhoneFrame tall?`로 그대로 전달. `Reveal`(`children/className/delayMs`) 정의(Task 3)와 사용(Task 4: `delayMs={120}`)이 일치. import 경로(`@/components/marketing/*`, `@/components/ui/Container`)는 기존 alias(`@` → 루트)와 일치.
