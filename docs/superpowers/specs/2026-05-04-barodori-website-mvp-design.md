# 바로도리 제품 웹사이트 MVP — 설계 문서

**작성일**: 2026-05-04
**대상 베타**: 2026-05-20
**도메인**: barodori.com
**근거 PRD**: `docs/start/start.md`
**참고 mockup**: `docs/start/*.png` (AI 생성, 레이아웃 참고용 — 색/폰트는 앱 토큰 기준)

## 1. 목적과 범위

영아 사경/사두를 의심하는 보호자가 바로도리 앱 설치 전 신뢰성을 확인하고, 사경 관련 정보를 SEO로 발견할 수 있도록 하는 마케팅 + 콘텐츠 사이트의 MVP.

**MVP 한 줄**: Next.js 16 App Router + 순수 SSG + 레포 내 MDX 아티클 + GA4/Amplitude + 한국어 우선 i18n 인프라 + 외부 Google Form 베타 신청.

## 2. 결정 요약

| 항목 | 결정 | 근거 |
|---|---|---|
| 콘텐츠 관리 | 레포 내 MDX | SEO/속도 최상, 운영 자유도 충분 (PR로 추가) |
| 베타 신청 폼 | 외부 Google Form 링크 | 폼 이미 운영 중, 백엔드 의존 0 |
| 출시 시 아티클 | mock 1~2건 | 디자인/인프라 검증 우선 |
| 분석 | GA4 + Amplitude | 운영팀 표준 + 제품 분석 동시 |
| 앱스토어 링크 | env 기반, 미출시는 "출시 예정" | 시장 출시 전 |
| i18n | ko default, en 셸만 (영문 noindex) | 1차 사용자가 국내 보호자 |
| 디자인 토큰 | 앱 `DsColors` (primary `#FFB700`) 재사용 | 브랜드 일관성, mockup은 AI 생성물이라 참고만 |
| 정책 본문 | placeholder + noindex, 추후 교체 | 법무 검토 진행 중 |
| 렌더링 | 순수 SSG (ISR/SSR 없음) | 가장 빠른 LCP, 최저 운영 비용 |

## 3. 라우팅 & i18n

```
/                       → /ko (308, default)
/ko                     홈
/ko/product             제품 소개
/ko/articles            아티클 목록
/ko/articles/[slug]     아티클 상세 (MDX)
/ko/install             앱 설치 (스토어 + QR + 베타)
/ko/legal/privacy       개인정보처리방침 (placeholder, noindex)
/ko/legal/terms         이용약관 (placeholder, noindex)
/en                     영문 셸 (noindex)
/en/...                 동일 라우트, "Coming soon" 또는 영문 ko fallback
sitemap.xml             ko routes만
robots.txt              전체 allow (페이지별 noindex 메타로 제어)
```

- `app/[locale]/...` 동적 segment + `generateStaticParams` 로 ko/en 전체 사전 생성
- `app/[locale]/articles/[slug]/page.tsx` 도 모든 MDX slug SSG
- locale config: `lib/i18n/config.ts` — `locales = ['ko', 'en']`, `defaultLocale = 'ko'`
- 메시지 dictionary: `messages/ko.json`, `messages/en.json` (자체 30줄 헬퍼; next-intl 사용 안 함)
- `generateMetadata` 에서 `alternates: { languages: { ko, en, 'x-default': ko } }`
- root middleware (`/middleware.ts`): `/` 접근 시 Accept-Language 또는 default(`ko`)로 308 리다이렉트
- 영문 페이지는 `<head>` 에 `<meta name="robots" content="noindex">`, sitemap에서도 제외

## 4. 페이지 구성

### 4.1 홈 (`/ko`)
1. **Hero** — "아기의 작은 고개, 바로도리에서 함께 살펴봐요" + 앱 스크린샷 + 설치 CTA
2. **Stats Strip** — 1/250 (영아 사경 빈도), 0–6개월 (권장 진단 시기), 90% (조기 조치 시 회복률) ※ 통계 출처 footnote 명시 필수
3. **Symptoms** — "이런 모습이 보이면 사경을 의심해보세요" 6 카드
4. **Action Guide** — 의심되면 어떻게 — 5단계
5. **Product Teaser** — 핵심 기능 3개 + `/ko/product` 링크
6. **Article Teaser** — 최신 아티클 3건 + `/ko/articles` 링크
7. **Safety Notice** — PRD §9 의료 고지
8. **Footer CTA** — 모바일은 스토어 버튼, 데스크탑은 QR 모달 트리거

### 4.2 제품 소개 (`/ko/product`)
홈 §5 확장판. 기능 상세 + 스크린샷.

### 4.3 아티클 목록 (`/ko/articles`)
- 카테고리 필터: `사경 | 두상 | 운동 | 월령` (client component)
- 카드 그리드 (3열 데스크탑, 1열 모바일)
- 검색은 MVP 제외

### 4.4 아티클 상세 (`/ko/articles/[slug]`)
- ArticleHeader (카테고리 배지, 제목, 발행일, 작성자, 읽기 시간)
- TOC (`h2`/`h3` 자동 추출)
- MDX 본문 (whitelisted 컴포넌트만)
- 표준 `<MedicalNotice>` 자동 삽입 (본문 하단)
- 관련 아티클 (frontmatter `relatedSlugs` 또는 동일 카테고리 fallback 2건)
- 설치 CTA

### 4.5 앱 설치 (`/ko/install`)
- iOS / Android 스토어 버튼 (env 기반 분기 — §7 참고)
- 데스크탑 QR 모달 (모바일에서는 직접 스토어 이동)
- 베타 서포터즈 섹션 — 외부 Google Form 링크 CTA

### 4.6 정책 (`/ko/legal/privacy`, `/ko/legal/terms`)
- placeholder 본문
- `<meta name="robots" content="noindex">` 적용
- 법무 본문 들어오면 별도 PR 로 placeholder 제거 + noindex 해제

### 4.7 데스크탑 QR 모달
모든 설치 CTA 클릭 시:
- 모바일 (`window.matchMedia('(pointer: coarse)')` + width < 1024):
  - `isAppLive=true`: 플랫폼별 스토어로 직접 이동 (UA로 iOS/Android 분기)
  - `isAppLive=false`: 같은 페이지 내 "출시 예정" 안내 영역으로 스크롤 + 토스트
- 데스크탑: QR 모달 오픈 (`isAppLive=false`면 모달 내 "출시 예정" 안내 + 베타 폼 링크)

## 5. MDX 콘텐츠 모델

### 5.1 파일 구조
```
content/articles/
  ko/
    torticollis-symptoms.mdx
    tummy-time-guide.mdx
  en/   # 빈 폴더, 추후
```

### 5.2 Frontmatter
```yaml
---
title: 영아 사경, 이런 증상이 있다면
slug: torticollis-symptoms          # 파일명과 일치 필수
category: torticollis               # torticollis | head-shape | exercise | by-month
publishedAt: 2026-05-04
updatedAt: 2026-05-04
author: 바로도리 콘텐츠팀
authorRole: 전문가 검토 완료         # optional
excerpt: 한쪽으로만 고개를 돌리는 아기, ...
heroImage: /articles/torticollis-symptoms/hero.png
heroImageAlt: ...
ogImage: /articles/torticollis-symptoms/og.png   # optional, fallback=heroImage
readingMinutes: 4
relatedSlugs: [tummy-time-guide]    # optional
draft: false
locale: ko
---
```

### 5.3 인덱싱
- `lib/content/articles.ts`: 빌드 타임에 `content/articles/{locale}/*.mdx` 모두 읽어 frontmatter 파싱 → `Article[]` 인덱스
- export: `listArticles({ locale, category? })`, `getArticle({ locale, slug })`, `getRelated(article)`
- `draft: true` 는 production 빌드에서 제외, `NEXT_PUBLIC_INCLUDE_DRAFTS=1` 또는 dev 모드에선 포함

### 5.4 MDX 컴포넌트 화이트리스트
- 기본: `h2`, `h3`, `p`, `ul`, `ol`, `blockquote`
- `img` → `next/image` 래핑 (자동 변환)
- `<Callout type="info|warning|medical">` — 본문 주의 박스
- `<MedicalNotice>` — 표준 의료 고지 (수동 삽입 + 본문 하단 자동 1회 보장)
- `<ExerciseCard title... duration... cautions...>` — 가정 운동 카드
- `<RelatedArticles slugs={[...]}>` — 인라인 관련 글 모음

화이트리스트 외 임의 HTML 금지 (rehype-sanitize).

## 6. 디자인 토큰 + 컴포넌트

### 6.1 토큰 (`app/globals.css`)
```css
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
}
```

`lib/design/tokens.ts` 에 동일 값 TS 상수로 mirror (JS 측 사용처 대비).

### 6.2 Typography
- **Pretendard** (한글/본문) — `next/font/local` 셀프 호스트, `public/fonts/Pretendard-*.woff2`
- **Geist** (영문/숫자 보조) — `next/font/google`
- 본문 `--font-sans: Pretendard, Geist, system-ui, sans-serif`

### 6.3 Tailwind v4
`@theme inline { --color-primary: var(--color-primary); ... }` 로 토큰을 utility class로 노출. 추가 의존성 없음 (`tailwindcss@^4`, `@tailwindcss/postcss` 이미 존재).

### 6.4 컴포넌트 트리
```
components/
  layout/{Header,Footer,InstallCtaBar}.tsx
  marketing/{Hero,StatStrip,SymptomGrid,ProductFeatures,ArticleTeaserGrid,SafetyNotice,InstallCta}.tsx
  install/{StoreButtons,QrInstallModal}.tsx
  article/{ArticleCard,ArticleList,CategoryFilter,ArticleHeader,Toc,RelatedArticles}.tsx
  article/mdx/{Callout,MedicalNotice,ExerciseCard,mdxComponents.tsx}
  ui/{Button,Container,Modal,Badge}.tsx
  analytics/{AnalyticsProvider,TrackedLink}.tsx
```

**원칙**:
- 마케팅 섹션은 server component 기본, 인터랙션 있는 곳만 `'use client'` (`Modal`, `CategoryFilter`, locale switcher)
- 이미지 전체 `next/image`
- 모든 CTA는 `<TrackedLink>` 또는 `<TrackedButton>` 으로 이벤트 자동 발사

## 7. 앱 설치 분기 (스토어 미출시 상태)

```ts
// lib/install/storeLinks.ts
export const storeLinks = {
  ios: process.env.NEXT_PUBLIC_IOS_APP_URL ?? null,
  android: process.env.NEXT_PUBLIC_ANDROID_APP_URL ?? null,
}
export const isAppLive = !!(storeLinks.ios && storeLinks.android)
```

- `<StoreButtons>`:
  - `isAppLive=false`: 버튼 disabled + "2026-05-20 출시 예정" 라벨
  - `isAppLive=true`: 실 링크
  - 어느 경우든 `cta_install_click` 이벤트 발사 (props 에 `live: boolean`)
- `<QrInstallModal>` (데스크탑): live 전에는 "출시 예정" 안내 + 베타 폼 링크
- 출시 후 env 만 갈아끼우면 자동 활성화

## 8. 분석 (GA4 + Amplitude)

### 8.1 초기화
- `<AnalyticsProvider>` (client) 가 `app/[locale]/layout.tsx` 에 마운트
- `next/script` `afterInteractive` 전략으로 GA4 + Amplitude 로드
- env 키 미설정 또는 `NODE_ENV=development` 시 console 로그 no-op

### 8.2 통합 인터페이스
```ts
// lib/analytics/index.ts
export const track = (event: string, props?: Record<string, unknown>) => {
  ga.track(event, props)
  amplitude.track(event, props)
}
```

### 8.3 MVP 이벤트
| 이벤트 | 발사 시점 | props |
|---|---|---|
| `page_view` | 라우트 변경 (router event hook) | `path`, `locale` |
| `cta_install_click` | 스토어 버튼/QR/sticky CTA 클릭 | `surface`, `platform: 'ios'\|'android'\|'qr'`, `locale`, `live` |
| `cta_beta_form_click` | 베타 폼 외부 이동 | `surface`, `locale` |
| `article_view` | 아티클 상세 마운트 | `slug`, `category`, `locale` |
| `article_to_product_click` | 아티클 내 제품 링크 | `slug`, `locale` |

### 8.4 비범위 (추후)
스크롤 깊이, 실 설치 추적(Firebase 연동), 페이지 체류 시간, A/B.

### 8.5 개인정보
- GA: `anonymize_ip: true`
- Amplitude: `defaultTracking: { sessions: true, pageViews: false }` (라우트 변경은 우리가 수동 트리거)
- UTM 자동 캡처는 GA/Amplitude 기본 동작에 위임

## 9. SEO

- `metadata` API로 페이지별 title/description/OG 설정 — `lib/seo/metadata.ts` 헬퍼 (`buildMetadata({ title, description, path, locale, image })`)
- **OG 이미지**: 정적. `/public/og/default.png` + 아티클별 frontmatter `ogImage`. 동적 OG는 비범위.
- **sitemap** (`app/sitemap.ts`): ko routes 전체 + 모든 ko 아티클 slug
- **robots** (`app/robots.ts`): 전체 allow, 페이지별 `noindex` 메타로 영문 셸/정책/draft 제어
- **JSON-LD** (`lib/seo/jsonLd.ts`):
  - 홈/제품: `Organization` + `MobileApplication`
  - 아티클: `Article` (headline/datePublished/dateModified/author/image/inLanguage)
- **canonical**: 페이지별 `alternates.canonical` 명시 (UTM 노이즈 제거)
- **hreflang**: ko/en 페어 + `x-default=ko`
- **Lighthouse CI**: PRD 95점은 출시 시점 목표. MVP에서는 manual run, 자동화 비범위

## 10. 환경변수

`.env.example`:
```
NEXT_PUBLIC_SITE_URL=https://barodori.com
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_AMPLITUDE_KEY=
NEXT_PUBLIC_IOS_APP_URL=
NEXT_PUBLIC_ANDROID_APP_URL=
NEXT_PUBLIC_BETA_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSdtjPH3oBmPJHYUsV7pv_sQJTbqicq8EQi-ELSUp2ScLH9-jw/viewform
```

키 미설정 시 동작:
- `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_AMPLITUDE_KEY` 미설정 → analytics no-op
- `NEXT_PUBLIC_IOS_APP_URL`/`NEXT_PUBLIC_ANDROID_APP_URL` 미설정 → "출시 예정" 상태
- `NEXT_PUBLIC_BETA_FORM_URL` 미설정 → 베타 CTA 숨김

## 11. 폴더 구조 (최종)

```
barodori-website/
  app/
    [locale]/
      layout.tsx
      page.tsx
      product/page.tsx
      articles/
        page.tsx
        [slug]/page.tsx
      install/page.tsx
      legal/{privacy,terms}/page.tsx
      not-found.tsx
    layout.tsx
    globals.css
    sitemap.ts
    robots.ts
  middleware.ts
  components/...                     # §6.4
  content/articles/{ko,en}/*.mdx
  lib/
    content/{articles.ts,categories.ts}
    i18n/{config.ts,dictionary.ts}
    analytics/{index.ts,ga.ts,amplitude.ts}
    design/tokens.ts
    install/storeLinks.ts
    seo/{metadata.ts,jsonLd.ts}
  messages/{ko,en}.json
  public/
    fonts/Pretendard-*.woff2
    og/default.png
    images/...
    articles/{slug}/...
  docs/
    start/                           # 기존 PRD/mockup
    superpowers/{specs,plans}
  .env.example
  next.config.ts                     # MDX 플러그인
  package.json
```

## 12. 비범위 (Out of scope)

- 헤드리스 CMS 연동
- 영문 콘텐츠 (UI/아티클)
- 동적 OG 이미지
- 사이트 검색
- 댓글/리액션
- A/B 테스트
- 스크롤 깊이/실 설치 추적/체류 시간 이벤트
- Lighthouse CI 자동화
- 실제 정책 본문 (별도 PR로 교체)
- Firebase Analytics 연동 (실 설치 추적은 그때)

## 13. 인수 기준

- [ ] `pnpm install && pnpm dev` 무오류
- [ ] `pnpm build` 통과 — 모든 ko 라우트 + en 셸 + 모든 ko 아티클 SSG
- [ ] mockup의 페이지 7종(홈/제품/아티클 목록/아티클 상세/설치/정책 2종) 라우팅 + 섹션 구성 모두 존재
- [ ] 디자인 토큰: 앱 `DsColors` 기반 (primary `#FFB700`)
- [ ] 모바일 (375) / 태블릿 (768) / 데스크탑 (1280) 반응형
- [ ] 데스크탑 설치 CTA → QR 모달, 모바일 → 스토어 분기 (env 미설정 시 "출시 예정")
- [ ] mock 아티클 1~2건 작성 + 정상 렌더링
- [ ] 아티클 상세 하단 `<MedicalNotice>` 자동 노출
- [ ] 베타 CTA → Google Form 새 탭, `cta_beta_form_click` 발사
- [ ] sitemap.xml: ko routes만, robots.txt: 전체 allow
- [ ] `<head>` 에 hreflang ko/en/x-default + canonical
- [ ] 영문 셸 `noindex`, 정책 페이지 `noindex`
- [ ] env 미설정 시 analytics no-op, 설정 시 5종 이벤트 발사 (`page_view`, `cta_install_click`, `cta_beta_form_click`, `article_view`, `article_to_product_click`)
- [ ] Lighthouse 모바일 SEO ≥ 95, Performance ≥ 80 (베타 권고선; PRD 95는 출시 시점)
- [ ] `pnpm lint` 통과

## 14. 의존성 추가 예정

- `next-mdx-remote` 또는 `@next/mdx` (App Router 호환 검증 필요 — Next.js 16 가이드 확인)
- `gray-matter` — frontmatter 파싱
- `rehype-slug`, `rehype-autolink-headings` — TOC anchor
- `rehype-sanitize` — MDX HTML 화이트리스트
- `remark-gfm` — GFM 문법

(정확한 패키지 셋은 implementation plan 단계에서 Next.js 16 docs 검증 후 확정)
