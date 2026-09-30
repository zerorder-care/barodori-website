# 한국어 홈 리모델링 (앱 2.0.0 세계관 정렬) Implementation Plan

> **실행 안내:** 이 저장소의 작업 절차를 따르고 아래 체크리스트를 작업 단위로 수행한다. 각 태스크는 실패하는 테스트를 먼저 쓰고, 통과시킨 뒤, 바로 커밋한다.

**Goal:** 한국어 홈을 앱 2.0.0과 같은 세계관(도리 워드마크, 크림 무대 히어로, 홈케어 기록과 인사이트, 두상 비교, 가격)으로 다시 짠다.

**Architecture:** `HeaderNav`(로고와 CTA 교체) → `HeroV2`(폰 세 대와 캐릭터) → `FeatureSections`(4섹션, 사전 배열을 map) → `TogetherCards` → `PricingSection` → `SafetyNotice` → `InstallCta`(옅은 노랑). 카피와 금액은 전부 `messages/*.json`에 두고, 화면 파일과 배경, 배치 방향은 컴포넌트 안 메타 배열이 id로 짝을 맞춘다. 등장 애니메이션 `Reveal`은 정지 상태에서 보이도록 고친다.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4(인라인 토큰), Pretendard, `next/image`, Vitest + @testing-library/react(jsdom).

**설계 문서:** `docs/specs/2026-09-29-home-ko-remodel-v2-design.md`

**프로젝트 규칙(AGENTS.md):** "This is NOT the Next.js you know." 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다. 이 계획에서 쓰는 API는 `next/image`(`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`)와 `next/link`(같은 폴더 `link.md`)뿐이다.

**문장 부호 규칙:** 카피, 주석, 커밋 메시지 어디에도 원형 글자 배지, 가운데점, em-dash를 쓰지 않는다. 나열은 쉼표나 "와/과"로 잇는다.

**테스트 범위 주의:** `vitest.config.ts`의 include는 `lib/**`와 `components/**/*.test.tsx`뿐이다. `app/**`는 단위 테스트가 돌지 않으므로 페이지 조립은 typecheck와 headless 스크린샷으로 검증한다.

**타입 주의:** `Dictionary` 타입은 `messages/ko.json`에서 추론된다. 배열 항목은 모든 원소가 같은 키를 가져야 하므로 선택 필드는 빈 문자열 `""`로 채우고 렌더 시 비어 있으면 건너뛴다. `en.json`은 항상 `ko.json`과 같은 키 구조를 유지한다.

**진행 순서 원칙:** 사전에는 새 키를 먼저 추가하고(Task 3), 옛 키는 옛 컴포넌트를 지울 때(Task 12) 함께 지운다. 그래야 모든 커밋에서 typecheck가 통과한다.

---

## File Structure

| 파일 | 책임 | 신규/수정/삭제 |
| --- | --- | --- |
| `public/images/home-v2/*.png` | 로고, 캐릭터, 폰 화면 자산 | 신규 |
| `app/globals.css` | 2.0.0 토큰 추가 | 수정 |
| `messages/ko.json`, `messages/en.json` | `home` 트리 재구성, 태그라인, 내비 라벨 | 수정 |
| `components/layout/BarodoriLogo.tsx` (+test) | 도리 워드마크 lockup | 신규 |
| `components/layout/HeaderNav.tsx` (+test) | 로고와 우측 CTA 교체 | 수정 |
| `components/head-test/MiniHeader.tsx` | 로고 교체 | 수정 |
| `components/layout/BarodoriMark.tsx` (+test), `public/images/brand/barodori-mark.png` | 옛 심볼 | 삭제 |
| `components/marketing/Reveal.tsx` (+test) | 정지 상태에서 보이게 수정 | 수정 |
| `components/marketing/PhoneFrame.tsx` (+test) | 2.0.0 비율과 프레임, className 지원 | 수정 |
| `components/marketing/HeroV2.tsx` (+test) | 히어로 B안 | 신규 |
| `components/marketing/FeatureSections.tsx` (+test) | 홈케어 기록, 운동, 주간 리포트, 두상 비교 | 신규 |
| `components/marketing/TogetherCards.tsx` (+test) | 보호자 연동, 두상연구소 카드 | 신규 |
| `components/marketing/PricingSection.tsx` (+test) | 무료체험과 가격 카드 | 신규 |
| `components/marketing/InstallCta.tsx` | 옅은 노랑 설치 CTA | 수정 |
| `components/marketing/SafetyNotice.tsx` | 스트레스 문구 제거 | 수정 |
| `app/[locale]/(site)/page.tsx` | 홈 조립 교체 | 수정 |
| `components/marketing/Hero.tsx`, `HomeStorySections.tsx`(+test), `HomeTogetherSection.tsx`, `HomeFeatureSections.tsx`, `SecondaryPaths.tsx`, `HomePreviewSections.tsx`, `HomeCareLoop.tsx`, `ActionGuide.tsx`, `StatStrip.tsx`, `SymptomGrid.tsx`, `ArticleTeaserGrid.tsx`, `public/images/app-screens/*.png` | 옛 홈 구성 | 삭제 |

`components/marketing/GoalAchievement.tsx`는 마이페이지가 쓰므로 남긴다.

---

## Task 1: 2.0.0 자산 export

이 태스크는 Figma MCP(`get_metadata`, `use_figma`, `download_assets`)에 접근할 수 있는 세션에서 수행한다. 파일 키는 `IwydlhR7ql4UlZoHKZYYeh`다.

**Files:**
- Create: `public/images/home-v2/logo-ko.png`, `logo-en.png`, `dori-cheer.png`, `baby-celebrate.png`, `baby-stand.png`, `playmat.png`, `screen-home.png`, `screen-weekly.png`, `screen-head-report.png`, `screen-record.png`, `screen-exercise.png`, `avatar-1.png`, `avatar-2.png`, `article-thumb.png`

- [ ] **Step 1: 폰 화면 5장을 2배로 받는다**

`download_assets`를 아래 노드마다 `defaultFormat: "png"`, `defaultScale: 2`로 호출하고, 응답의 `export.url`을 받는다.

| 파일 | 노드 |
| --- | --- |
| `screen-home.png` | `1872:24378` |
| `screen-weekly.png` | `2295:30890` |
| `screen-head-report.png` | `3186:14744` |
| `screen-record.png` | `1270:15210` |
| `screen-exercise.png` | `1270:16731` |

```bash
mkdir -p public/images/home-v2
curl -L -o public/images/home-v2/screen-home.png "<export.url>"
# 나머지 4장도 같은 방식
```

- [ ] **Step 2: 로고 두 종을 받는다**

`use_figma`로 Brand 섹션 안 노드 id를 찾는다.

```js
await figma.setCurrentPageAsync(figma.root.children.find(p => p.id === '779:10438'));
const brand = await figma.getNodeByIdAsync('1507:340');
return brand.findAll(n => /^Logo \//.test(n.name)).map(n => `${n.name} id=${n.id}`);
```

`Logo / Korean`과 `Logo / English` id로 `download_assets`(`defaultScale: 2`)를 호출해 `logo-ko.png`, `logo-en.png`로 저장한다.

- [ ] **Step 3: 캐릭터와 일러스트를 받는다**

`download_assets`의 `rawImages`에서 받는다. 원본은 투명 배경 PNG다.

| 파일 | 노드와 항목 |
| --- | --- |
| `dori-cheer.png` | `2556:32892`의 rawImages 첫 번째(1448×1086) |
| `baby-celebrate.png` | `1507:397`(Baro / Scene)의 rawImages 중 1254×1254 크기 Celebrate 그림 |
| `baby-stand.png` | `1872:24378`의 rawImages 중 2202×2764 |
| `playmat.png` | `1872:24378`의 rawImages 중 1049×1499 |
| `avatar-1.png`, `avatar-2.png` | Illustrations 페이지 `1507:370`(Character) 안 아바타 2개, `defaultScale: 2` |
| `article-thumb.png` | `2099:25714`(Head Shape Lab / Exercise Guide) 안 첫 카드 썸네일 rawImage |

```bash
cd public/images/home-v2
sips -Z 1200 baby-stand.png --out baby-stand.png
sips -Z 900 playmat.png --out playmat.png
sips -Z 800 dori-cheer.png --out dori-cheer.png
sips -Z 800 baby-celebrate.png --out baby-celebrate.png
ls -la
```

Expected: 파일 14개, 각각 500KB 이하. 넘는 파일은 `sips -Z`로 폭을 더 줄인다.

- [ ] **Step 4: 규격을 확인한다**

```bash
for f in public/images/home-v2/*.png; do printf "%s " "$f"; sips -g pixelWidth -g pixelHeight "$f" | awk '/pixel/{printf "%s ",$2}'; echo; done
```

Expected: `screen-*.png`는 폭 804(주간 리포트는 804×1944, 나머지 804×1748), `logo-*.png`는 높이 240 안팎.

- [ ] **Step 5: 커밋**

```bash
git add public/images/home-v2
git commit -m "chore: 홈 리모델링용 2.0.0 앱 화면과 캐릭터 자산 추가"
```

---

## Task 2: 2.0.0 토큰 추가

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: `:root`에 토큰을 추가한다**

`--font-sans` 줄 다음에 붙인다.

```css
  /* 앱 2.0.0 Figma Foundations. 기존 토큰은 다른 페이지가 계속 쓴다. */
  --color-orange-50: #FFF7E0;
  --color-orange-100: #FFEAB2;
  --color-orange-300: #FFD04C;
  --color-orange-500: #FFBB00;
  --color-orange-700: #FE9A00;
  --color-orange-900: #FD6806;
  --color-hero-fg: #903E00;
  --color-gray-900: #262626;
  --color-gray-600: #7B7B7B;
  --color-gray-500: #9D9D9D;
  --color-gray-200: #E9E9E9;
  --color-gray-50: #FAFAFA;
  --color-cream-top: #FFF3D2;
```

- [ ] **Step 2: `@theme inline` 블록에도 같은 이름을 등록한다**

`--radius-pill: var(--radius-pill);` 줄 다음에 붙인다.

```css
  --color-orange-50: var(--color-orange-50);
  --color-orange-100: var(--color-orange-100);
  --color-orange-300: var(--color-orange-300);
  --color-orange-500: var(--color-orange-500);
  --color-orange-700: var(--color-orange-700);
  --color-orange-900: var(--color-orange-900);
  --color-hero-fg: var(--color-hero-fg);
  --color-gray-900: var(--color-gray-900);
  --color-gray-600: var(--color-gray-600);
  --color-gray-500: var(--color-gray-500);
  --color-gray-200: var(--color-gray-200);
  --color-gray-50: var(--color-gray-50);
  --color-cream-top: var(--color-cream-top);
```

- [ ] **Step 3: 빌드 검사**

Run: `npm run typecheck && npm run lint`
Expected: 오류 없음.

- [ ] **Step 4: 커밋**

```bash
git add app/globals.css
git commit -m "feat: 앱 2.0.0 색 토큰을 전역 CSS에 추가"
```

---

## Task 3: 사전에 새 홈 키 추가

옛 키(`home.hero.titlePrimary` 등, `home.storySections`, `home.installCta.eyebrow`, `nav.start`, `medical.stress`)는 아직 지우지 않는다. Task 12에서 지운다.

**Files:**
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

- [ ] **Step 1: `ko.json`의 `home`을 다음으로 바꾼다**

`storySections` 배열은 그대로 둔 채 다른 키를 추가하고 `seo`, `installCta`를 갱신한다. 최종 형태:

```json
"home": {
  "seo": {
    "title": "바로도리 - 우리 아이 맞춤 홈케어 기록 앱",
    "description": "아기 사경과 두상이 걱정될 때, 운동과 수면, 자세, 수유, 놀이를 기록하고 주간 리포트와 두상 변화로 확인하는 홈케어 앱이에요. 3일 무료체험, 끝나도 자동결제 없음."
  },
  "hero": {
    "titlePrimary": "일단 바로도리,",
    "titleSecondary": "켜는 순간 홈케어 시작",
    "subtitle": "아기 머리 기울임, 두상 걱정으로 막막한 홈케어를 바로도리와 함께해요",
    "eyebrow": "3일 무료체험, 끝나도 자동결제 없음",
    "titleLead": "우리 아이 맞춤 홈케어,",
    "titleTail": "오늘부터",
    "titleAccent": "바로도리",
    "body": "기록하고, 관리하고, 변화를 확인해요.",
    "ctaPrimary": "앱 다운로드",
    "ctaSecondary": "두상 테스트 먼저 해보기",
    "trust": "iOS와 Android, 한국어와 영어, 일본어, 스페인어 지원",
    "screens": {
      "home": "바로도리 앱 홈 화면, 도리의 홈케어를 함께해요",
      "weekly": "바로도리 주간 리포트 화면",
      "headReport": "바로도리 두상 리포트 화면"
    }
  },
  "storySections": [ ...기존 그대로... ],
  "features": [
    {
      "id": "record",
      "label": "홈케어 기록",
      "title": "맞춤형 홈케어를 한번에 기록해요",
      "body": "운동부터 수면, 자세, 수유, 놀이까지 관리해요.",
      "note": "자주 남기는 질문은 빠른 기록으로 묶어 한 번에 적어요.",
      "link": "",
      "screenAlt": "바로도리 홈케어 화면, 운동과 수면, 자세, 수유, 놀이 중 기록할 항목을 골라요"
    },
    {
      "id": "exercise",
      "label": "운동",
      "title": "아이에게 맞는 운동을 차근차근 따라해요",
      "body": "운동 방법을 확인하며 기록해요.",
      "note": "",
      "link": "",
      "screenAlt": "바로도리 운동 화면, 고개 기울이기 10회 중 1회 진행"
    },
    {
      "id": "weekly",
      "label": "인사이트",
      "title": "이번주 홈케어 기록을 확인해요",
      "body": "한 주 동안의 생활 기록을 확인해요.",
      "note": "비슷한 월령 아이들의 평균과 나란히 봐요.",
      "link": "",
      "screenAlt": "바로도리 주간 리포트, 이번주 터미타임과 수면, 수유, 놀이 기록"
    },
    {
      "id": "headReport",
      "label": "두상케어",
      "title": "두상 변화를 한눈에 비교해보세요",
      "body": "사진과 외곽선으로 변화를 쉽게 확인할 수 있어요.",
      "note": "",
      "link": "앱 설치 전에 두상 유형부터 확인해보기",
      "screenAlt": "바로도리 두상 리포트, 외곽선 비교와 사진 비교"
    }
  ],
  "together": {
    "label": "함께",
    "title": "혼자 하는 홈케어가 아니에요",
    "cards": [
      {
        "id": "guardian",
        "title": "구독 하나로 두 보호자가 함께 기록해요",
        "body": "초대 코드로 연결하면 기록과 리포트를 같이 보고, 구독도 함께 써요."
      },
      {
        "id": "lab",
        "title": "월령별 아티클과 병원 찾기",
        "body": "지금 월령에 맞는 홈케어 팁을 읽고, 가까운 의료기관을 찾아봐요."
      }
    ]
  },
  "pricing": {
    "label": "이용 요금",
    "title": "3일은 무료로, 그다음은 마음에 들 때만",
    "body": "무료체험이 끝나도 자동으로 결제되지 않아요. 구독은 직접 시작할 때만 열려요.",
    "yearly": {
      "name": "연간 구독",
      "badge": "51% OFF",
      "monthlyEquivalent": "월 2,875원",
      "total": "연 34,500원"
    },
    "monthly": {
      "name": "월간 구독",
      "price": "월 5,900원",
      "total": "월 5,900원"
    },
    "notes": ["첫 결제 전 알림, 언제든 해지", "연동된 보호자와 구독을 함께 써요"],
    "cta": "앱 다운로드"
  },
  "installCta": {
    "eyebrow": "(기존 값 유지, Task 12에서 키째 삭제)",
    "title": "오늘의 홈케어 기록을 놓치지 않도록",
    "body": "운동과 수면, 자세, 수유, 놀이를 기록하고, 주간 리포트와 두상 변화로 다시 확인해요."
  }
}
```

`installCta.eyebrow`의 옛 값은 Task 12에서 키째 지운다. `together.title`은 설계 문서에 없던 섹션 제목이며 카드 위에 한 줄로 둔다.

- [ ] **Step 2: `ko.json`의 다른 키를 갱신한다**

- `footer.tagline`: `"아기 머리 기울임과 두상이 걱정될 때, 운동과 생활 기록으로 집에서 이어가는 홈케어 앱이에요."`
- `nav.install`: `"앱 다운로드"`

- [ ] **Step 3: `en.json`에 같은 구조를 넣는다**

```json
"home": {
  "seo": {
    "title": "Barodori - Personalized home care for your baby",
    "description": "Worried about your baby's head tilt or head shape? Record exercises, sleep, posture, feeding, and play, then review weekly reports and head shape changes. 3-day free trial, no automatic billing when it ends."
  },
  "hero": {
    "titlePrimary": "Start with Barodori,",
    "titleSecondary": "home care begins when you open it",
    "subtitle": "Make head-tilt and head-shape home care less overwhelming with Barodori.",
    "eyebrow": "3-day free trial, no automatic billing when it ends",
    "titleLead": "Personalized home care for your baby,",
    "titleTail": "starting today with",
    "titleAccent": "Barodori",
    "body": "Record, manage, and see the change.",
    "ctaPrimary": "Get the app",
    "ctaSecondary": "Try the head shape test first",
    "trust": "iOS and Android, in Korean, English, Japanese, and Spanish",
    "screens": {
      "home": "Barodori home screen, start Dori's home care",
      "weekly": "Barodori weekly report screen",
      "headReport": "Barodori head shape report screen"
    }
  },
  "storySections": [ ...기존 그대로... ],
  "features": [
    { "id": "record", "label": "Home care log", "title": "Record every kind of home care in one place", "body": "From exercises to sleep, posture, feeding, and play.", "note": "Group the questions you answer often into a quick record.", "link": "", "screenAlt": "Barodori home care screen, choose exercise, sleep, posture, feeding, or play to record" },
    { "id": "exercise", "label": "Exercise", "title": "Follow exercises that fit your baby, step by step", "body": "Check the method while you record.", "note": "", "link": "", "screenAlt": "Barodori exercise screen, head tilt 1 of 10 reps" },
    { "id": "weekly", "label": "Insights", "title": "See this week's home care at a glance", "body": "Review a week of daily records.", "note": "Compare with the average for babies of a similar age.", "link": "", "screenAlt": "Barodori weekly report, this week's tummy time, sleep, feeding, and play" },
    { "id": "headReport", "label": "Head shape care", "title": "Compare head shape changes at a glance", "body": "Photos and outlines make changes easy to see.", "note": "", "link": "Check your baby's head shape type before installing", "screenAlt": "Barodori head shape report, outline and photo comparison" }
  ],
  "together": {
    "label": "Together",
    "title": "Home care is not a solo job",
    "cards": [
      { "id": "guardian", "title": "Two caregivers, one subscription", "body": "Link with an invite code to share records, reports, and the subscription." },
      { "id": "lab", "title": "Articles by month and a hospital finder", "body": "Read home care tips for your baby's age and find nearby clinics." }
    ]
  },
  "pricing": {
    "label": "Pricing",
    "title": "Three days free, then only if you like it",
    "body": "Nothing is charged when the free trial ends. A subscription starts only when you choose to.",
    "yearly": { "name": "Yearly", "badge": "51% OFF", "monthlyEquivalent": "", "total": "" },
    "monthly": { "name": "Monthly", "price": "", "total": "" },
    "notes": ["Reminder before the first charge, cancel anytime", "Share the subscription with a linked caregiver"],
    "cta": "Get the app"
  },
  "installCta": {
    "eyebrow": "(keep the existing value, removed in Task 12)",
    "title": "Keep today's home care record from slipping away",
    "body": "Record exercises, sleep, posture, feeding, and play, then review weekly reports and head shape changes."
  }
}
```

영어 가격 문자열은 빈 값으로 두고 `PricingSection`이 빈 값이면 카드 금액을 숨긴다(설계 문서 11절). `footer.tagline`은 `"Worried about your baby's head tilt or head shape? Keep home care going with exercise and daily records."`, `nav.install`은 `"Get the app"`으로 바꾼다.

- [ ] **Step 4: JSON 유효성과 타입 검사**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/ko.json','utf8'));JSON.parse(require('fs').readFileSync('messages/en.json','utf8'));console.log('ok')" && npm run typecheck`
Expected: `ok`, 타입 오류 없음.

- [ ] **Step 5: 커밋**

```bash
git add messages/ko.json messages/en.json
git commit -m "feat: 홈 리모델링 카피와 가격 문자열을 사전에 추가"
```

---

## Task 4: 도리 워드마크 로고와 헤더 CTA

**Files:**
- Create: `components/layout/BarodoriLogo.tsx`
- Create: `components/layout/BarodoriLogo.test.tsx`
- Modify: `components/layout/HeaderNav.tsx`
- Modify: `components/layout/HeaderNav.test.tsx`
- Modify: `components/layout/Header.tsx`
- Modify: `components/head-test/MiniHeader.tsx`
- Delete: `components/layout/BarodoriMark.tsx`, `components/layout/BarodoriMark.test.tsx`, `public/images/brand/barodori-mark.png`

- [ ] **Step 1: 로고 테스트를 쓴다**

```tsx
// components/layout/BarodoriLogo.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BarodoriLogo } from './BarodoriLogo'

describe('BarodoriLogo', () => {
  it('renders the Korean lockup with the brand name as alt', () => {
    render(<BarodoriLogo locale="ko" label="바로도리" />)
    const img = screen.getByAltText('바로도리')
    expect(img).toHaveAttribute('src', expect.stringContaining('logo-ko'))
  })

  it('renders the English lockup for en', () => {
    render(<BarodoriLogo locale="en" label="Barodori" />)
    expect(screen.getByAltText('Barodori')).toHaveAttribute('src', expect.stringContaining('logo-en'))
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/layout/BarodoriLogo.test.tsx`
Expected: FAIL, 모듈을 찾을 수 없음.

- [ ] **Step 3: 로고 컴포넌트를 만든다**

```tsx
// components/layout/BarodoriLogo.tsx
import Image from 'next/image'
import type { Locale } from '@/lib/i18n/config'

const SRC: Record<Locale, string> = {
  ko: '/images/home-v2/logo-ko.png',
  en: '/images/home-v2/logo-en.png',
}

/** 도리 마스코트와 워드마크 lockup. 높이는 호출부의 className으로 정한다. */
export function BarodoriLogo({
  locale,
  label,
  className = 'h-7 w-auto',
}: {
  locale: Locale
  label: string
  className?: string
}) {
  return <Image src={SRC[locale]} alt={label} width={446} height={120} priority className={className} />
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/layout/BarodoriLogo.test.tsx`
Expected: PASS 2개.

- [ ] **Step 5: 헤더 테스트를 새 동작으로 바꾼다**

`components/layout/HeaderNav.test.tsx`에서 `labels` 객체의 `install`을 `'앱 다운로드'`로 바꾸고 `start` 키를 지운다. 첫 번째와 네 번째 테스트를 바꾼다.

```tsx
  it('logged out: shows an "앱 다운로드" action linking to /install', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    const cta = await screen.findByRole('link', { name: '앱 다운로드' })
    expect(cta).toHaveAttribute('href', '/ko/install')
  })

  it('renders the Dori wordmark as the home link', async () => {
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    const logo = await screen.findByAltText('바로도리')
    expect(logo.closest('a')).toHaveAttribute('href', '/ko')
  })

  it('logged in: shows 마이페이지 and 로그아웃, not 앱 다운로드', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ authenticated: true }) })),
    )
    render(<HeaderNav locale="ko" appName="바로도리" labels={labels} />)
    expect(await screen.findByRole('link', { name: '마이페이지' })).toHaveAttribute('href', '/ko/mypage')
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '앱 다운로드' })).toBeNull()
  })
```

- [ ] **Step 6: 실패 확인**

Run: `npx vitest run components/layout/HeaderNav.test.tsx`
Expected: FAIL. `앱 다운로드` 링크 없음, `start` 타입 오류.

- [ ] **Step 7: `HeaderNav.tsx`를 고친다**

import를 바꾼다.

```tsx
import { BarodoriLogo } from '@/components/layout/BarodoriLogo'
```

`NavLabels`에서 `start: string`을 지우고 `install: string`을 추가한다. 로고 링크를 바꾼다.

```tsx
        <Link href={`/${locale}`} className="inline-flex items-center">
          <BarodoriLogo locale={locale} label={appName} className="h-7 w-auto" />
        </Link>
```

모바일 메뉴의 비로그인 링크를 바꾼다.

```tsx
            <Link
              href={`/${locale}/install`}
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl bg-[var(--color-orange-500)] px-4 py-3 text-center text-base font-bold text-[var(--color-gray-900)]"
            >
              {labels.install}
            </Link>
```

`AuthArea`의 `labels` 타입을 `Pick<NavLabels, 'logout' | 'mypage' | 'install'>`로 바꾸고 비로그인 분기를 바꾼다.

```tsx
  if (!authenticated) {
    return (
      <Link
        href={`/${locale}/install`}
        className="inline-flex h-[38px] items-center rounded-xl bg-[var(--color-orange-500)] px-4 text-sm font-semibold text-[var(--color-gray-900)]"
      >
        {labels.install}
      </Link>
    )
  }
```

- [ ] **Step 8: `MiniHeader.tsx`를 고친다**

```tsx
import Link from 'next/link'
import { BarodoriLogo } from '@/components/layout/BarodoriLogo'
import type { Locale } from '@/lib/i18n/config'

/** 테스트 화면 전용 최소 헤더. 로고 홈 링크만 둔다 (UX 스펙 2절). */
export function MiniHeader({ locale, homeLabel }: { locale: Locale; homeLabel: string }) {
  return (
    <div className="flex h-14 items-center px-5">
      <Link href={`/${locale}`} aria-label={homeLabel} className="inline-flex items-center">
        <BarodoriLogo locale={locale} label="" className="h-6 w-auto" />
      </Link>
    </div>
  )
}
```

- [ ] **Step 9: 옛 심볼을 지운다**

```bash
git rm components/layout/BarodoriMark.tsx components/layout/BarodoriMark.test.tsx public/images/brand/barodori-mark.png
grep -rn BarodoriMark components app lib
```

Expected: grep 결과 없음.

- [ ] **Step 10: 통과 확인**

Run: `npx vitest run components/layout && npm run typecheck && npm run lint`
Expected: 전부 통과.

- [ ] **Step 11: 커밋**

```bash
git add components/layout components/head-test/MiniHeader.tsx
git commit -m "feat: 헤더 로고를 도리 워드마크로 바꾸고 우측 버튼을 앱 다운로드로 교체"
```

---

## Task 5: Reveal이 정지 상태에서 보이게 수정

현재는 마운트 직후 `opacity-0`이라 관찰자가 늦으면 본문이 비어 보인다. 마운트 시점에 이미 뷰포트 안에 있거나 관찰자가 없으면 보이고, 뷰포트 아래에 있는 요소만 숨겼다가 올린다.

**Files:**
- Modify: `components/marketing/Reveal.tsx`
- Modify: `components/marketing/Reveal.test.tsx`

- [ ] **Step 1: 테스트를 바꾼다**

세 번째 테스트를 두 개로 나눈다.

```tsx
  it('stays visible when it is already inside the viewport at mount', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      },
    )
    const { container } = render(
      <Reveal>
        <p>첫 화면</p>
      </Reveal>,
    )
    expect(container.firstChild).toHaveAttribute('data-visible', 'true')
  })

  it('hides a below-the-fold element until it scrolls into view', () => {
    let callback: IntersectionObserverCallback | undefined
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      },
    )
    const spy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: 5000, bottom: 5200 } as DOMRect)
    const { container } = render(
      <Reveal>
        <p>등장</p>
      </Reveal>,
    )
    expect(container.firstChild).toHaveAttribute('data-visible', 'false')
    act(() => {
      callback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(container.firstChild).toHaveAttribute('data-visible', 'true')
    spy.mockRestore()
  })
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/marketing/Reveal.test.tsx`
Expected: "stays visible when it is already inside the viewport" FAIL (현재는 `false`).

- [ ] **Step 3: 구현을 바꾼다**

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
  // 정지 상태에서 보인다. 관찰자가 붙은 뒤 뷰포트 아래에 있는 요소만 숨겼다가 올린다.
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(false)
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
      className={`transition duration-700 ease-out motion-safe:data-[visible=false]:translate-y-3 motion-safe:data-[visible=false]:opacity-0 ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/marketing/Reveal.test.tsx`
Expected: PASS 4개.

- [ ] **Step 5: 커밋**

```bash
git add components/marketing/Reveal.tsx components/marketing/Reveal.test.tsx
git commit -m "fix: 등장 애니메이션이 정지 상태에서 본문을 숨기지 않게 한다"
```

---

## Task 6: PhoneFrame을 2.0.0 화면 규격으로

**Files:**
- Modify: `components/marketing/PhoneFrame.tsx`
- Modify: `components/marketing/PhoneFrame.test.tsx`

- [ ] **Step 1: 테스트를 추가한다**

```tsx
  it('forwards className to the outer frame', () => {
    const { container } = render(<PhoneFrame src="/x.png" alt="a" className="rotate-6" />)
    expect(container.firstChild).toHaveClass('rotate-6')
  })
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/marketing/PhoneFrame.test.tsx`
Expected: FAIL, `className` prop 없음.

- [ ] **Step 3: 구현을 바꾼다**

```tsx
import Image from 'next/image'

export type PhoneFrameProps = {
  src: string
  alt: string
  /** 긴 전체 캡처는 true. 하단을 부드럽게 페이드해 스크롤되는 앱처럼 보이게 한다. */
  tall?: boolean
  /** 바깥 프레임에 더할 클래스. 폭과 회전은 호출부가 정한다. */
  className?: string
  /** 첫 화면에 보이는 폰은 true로 두어 LCP를 앞당긴다. */
  priority?: boolean
}

export function PhoneFrame({ src, alt, tall = false, className = '', priority = false }: PhoneFrameProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[300px] rounded-[34px] bg-[#1C1C1E] p-2 shadow-[0_30px_60px_-24px_rgba(80,50,0,0.35)] ${className}`}
    >
      <div className="relative aspect-[402/874] overflow-hidden rounded-[26px] bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
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

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/marketing/PhoneFrame.test.tsx`
Expected: PASS 3개.

- [ ] **Step 5: 커밋**

```bash
git add components/marketing/PhoneFrame.tsx components/marketing/PhoneFrame.test.tsx
git commit -m "feat: 폰 목업을 2.0.0 화면 비율로 맞추고 className과 priority를 받는다"
```

---

## Task 7: HeroV2

**Files:**
- Create: `components/marketing/HeroV2.tsx`
- Create: `components/marketing/HeroV2.test.tsx`

- [ ] **Step 1: 테스트를 쓴다**

```tsx
// components/marketing/HeroV2.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import { HeroV2 } from './HeroV2'

describe('HeroV2', () => {
  const copy = koMessages.home.hero

  it('renders the headline with the accent word', () => {
    render(<HeroV2 locale="ko" copy={copy} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('우리 아이 맞춤 홈케어, 오늘부터 바로도리')
  })

  it('links the primary CTA to install and the secondary CTA to head-test', () => {
    render(<HeroV2 locale="ko" copy={copy} />)
    expect(screen.getByRole('link', { name: '앱 다운로드' })).toHaveAttribute('href', '/ko/install')
    expect(screen.getByRole('link', { name: '두상 테스트 먼저 해보기' })).toHaveAttribute('href', '/ko/head-test')
  })

  it('shows three phone screens and two decorative illustrations', () => {
    render(<HeroV2 locale="ko" copy={copy} />)
    expect(screen.getByAltText(copy.screens.home)).toBeInTheDocument()
    expect(screen.getByAltText(copy.screens.weekly)).toBeInTheDocument()
    expect(screen.getByAltText(copy.screens.headReport)).toBeInTheDocument()
    expect(screen.getAllByRole('presentation')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/marketing/HeroV2.test.tsx`
Expected: FAIL, 모듈 없음.

- [ ] **Step 3: 구현한다**

```tsx
// components/marketing/HeroV2.tsx
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

type HeroCopy = Dictionary['home']['hero']

export function HeroV2({ locale, copy }: { locale: Locale; copy: HeroCopy }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-cream-top)_0%,#FFF9EB_55%,var(--color-bg)_100%)]"
    >
      <Container className="relative z-10 flex flex-col items-center pt-14 text-center sm:pt-20">
        <p className="rounded-pill bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-hero-fg)] shadow-[0_0_5px_rgba(0,0,0,0.05)]">
          {copy.eyebrow}
        </p>
        <h1
          id="hero-title"
          className="mt-5 text-[34px] font-bold leading-[1.18] tracking-[-1px] text-[var(--color-gray-900)] sm:text-5xl lg:text-[54px]"
        >
          <span className="block">{copy.titleLead}</span>
          <span className="block">
            {copy.titleTail} <span className="text-[var(--color-orange-700)]">{copy.titleAccent}</span>
          </span>
        </h1>
        <p className="mt-5 text-base font-medium leading-relaxed text-[var(--color-gray-600)] sm:text-lg lg:text-[19px]">
          {copy.body}
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
          <TrackedLink
            href={`/${locale}/install`}
            event="cta_install_click"
            eventProps={{ surface: 'hero', platform: 'install_page', locale }}
            className="inline-flex h-14 items-center justify-center rounded-[14px] bg-[var(--color-orange-500)] px-7 text-[17px] font-bold text-[var(--color-gray-900)]"
          >
            {copy.ctaPrimary}
          </TrackedLink>
          <TrackedLink
            href={`/${locale}/head-test`}
            event="head_test_entry_click"
            eventProps={{ surface: 'hero_secondary', locale }}
            className="inline-flex h-14 items-center justify-center rounded-[14px] bg-[var(--color-orange-100)] px-7 text-[17px] font-bold text-[var(--color-hero-fg)]"
          >
            {copy.ctaSecondary}
          </TrackedLink>
        </div>
        <p className="mt-4 text-[13px] font-medium text-[var(--color-gray-500)]">{copy.trust}</p>
      </Container>

      <div className="relative mx-auto mt-8 h-[300px] w-full max-w-[1056px] sm:h-[360px]">
        <PhoneFrame
          src="/images/home-v2/screen-weekly.png"
          alt={copy.screens.weekly}
          tall
          className="absolute bottom-[-190px] left-[calc(50%-330px)] hidden w-[230px] -rotate-[7deg] sm:block"
        />
        <PhoneFrame
          src="/images/home-v2/screen-home.png"
          alt={copy.screens.home}
          priority
          className="absolute bottom-[-150px] left-1/2 z-10 w-[200px] -translate-x-1/2 sm:bottom-[-140px] sm:w-[250px]"
        />
        <PhoneFrame
          src="/images/home-v2/screen-head-report.png"
          alt={copy.screens.headReport}
          className="absolute bottom-[-190px] left-[calc(50%+100px)] hidden w-[230px] rotate-[7deg] sm:block"
        />
        <Image
          src="/images/home-v2/dori-cheer.png"
          alt=""
          role="presentation"
          width={800}
          height={600}
          className="absolute bottom-2 left-[-10px] z-20 w-[120px] sm:left-12 sm:bottom-6 sm:w-[210px]"
        />
        <Image
          src="/images/home-v2/baby-celebrate.png"
          alt=""
          role="presentation"
          width={800}
          height={800}
          className="absolute bottom-0 right-12 z-20 hidden w-[230px] sm:block"
        />
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/marketing/HeroV2.test.tsx`
Expected: PASS 3개. `getAllByRole('presentation')`이 2가 아니면 `role="presentation"`이 붙은 `Image` 두 개만 있는지 본다.

- [ ] **Step 5: 커밋**

```bash
git add components/marketing/HeroV2.tsx components/marketing/HeroV2.test.tsx
git commit -m "feat: 크림 무대와 폰 세 대로 구성한 홈 히어로 추가"
```

---

## Task 8: FeatureSections

**Files:**
- Create: `components/marketing/FeatureSections.tsx`
- Create: `components/marketing/FeatureSections.test.tsx`

- [ ] **Step 1: 테스트를 쓴다**

```tsx
// components/marketing/FeatureSections.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import { FeatureSections } from './FeatureSections'

describe('FeatureSections', () => {
  const features = koMessages.home.features

  it('renders the four section titles in order', () => {
    render(<FeatureSections locale="ko" features={features} />)
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(features.map((f) => f.title))
  })

  it('renders every screen with its alt text', () => {
    render(<FeatureSections locale="ko" features={features} />)
    for (const feature of features) {
      expect(screen.getByAltText(feature.screenAlt)).toBeInTheDocument()
    }
  })

  it('links only the head report section to the head test', () => {
    render(<FeatureSections locale="ko" features={features} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/ko/head-test')
    expect(links[0]).toHaveTextContent('앱 설치 전에 두상 유형부터 확인해보기')
  })

  it('renders the note where the copy has one', () => {
    render(<FeatureSections locale="ko" features={features} />)
    expect(screen.getByText(features[0].note)).toBeInTheDocument()
    expect(screen.getByText(features[2].note)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/marketing/FeatureSections.test.tsx`
Expected: FAIL, 모듈 없음.

- [ ] **Step 3: 구현한다**

```tsx
// components/marketing/FeatureSections.tsx
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { Reveal } from '@/components/marketing/Reveal'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

type FeatureCopy = Dictionary['home']['features'][number]

type FeatureMeta = {
  id: string
  screen: string
  tall: boolean
  /** 폰을 왼쪽에 두고 글을 오른쪽에 둔다. */
  reverse: boolean
  bg: string
  /** 운동 섹션에만 놀이매트와 아기 캐릭터 장식을 깐다. */
  playmat: boolean
  linkSurface: string
}

const META: readonly FeatureMeta[] = [
  { id: 'record', screen: '/images/home-v2/screen-record.png', tall: false, reverse: false, bg: 'bg-white', playmat: false, linkSurface: '' },
  { id: 'exercise', screen: '/images/home-v2/screen-exercise.png', tall: false, reverse: true, bg: 'bg-[var(--color-orange-50)]', playmat: true, linkSurface: '' },
  { id: 'weekly', screen: '/images/home-v2/screen-weekly.png', tall: true, reverse: false, bg: 'bg-white', playmat: false, linkSurface: '' },
  { id: 'headReport', screen: '/images/home-v2/screen-head-report.png', tall: false, reverse: true, bg: 'bg-[var(--color-orange-50)]', playmat: false, linkSurface: 'feature_head_report' },
]

export function FeatureSections({
  locale,
  features,
}: {
  locale: Locale
  features: readonly FeatureCopy[]
}) {
  return (
    <>
      {features.map((feature, index) => {
        const meta = META.find((m) => m.id === feature.id) ?? META[index] ?? META[0]
        const titleId = `feature-${feature.id}-title`
        return (
          <section key={feature.id} aria-labelledby={titleId} className={`${meta.bg} py-20 sm:py-28`}>
            <Container>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  meta.reverse ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <Reveal>
                  <p className="inline-flex rounded-pill bg-[var(--color-orange-50)] px-3 py-1.5 text-[13px] font-semibold text-[var(--color-hero-fg)]">
                    {feature.label}
                  </p>
                  <h2
                    id={titleId}
                    className="mt-4 text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-[var(--color-gray-900)] sm:text-4xl lg:text-[40px]"
                  >
                    {feature.title}
                  </h2>
                  <p className="mt-5 text-base font-medium leading-[1.55] text-[var(--color-gray-600)] sm:text-lg lg:text-[19px]">
                    {feature.body}
                  </p>
                  {feature.note && (
                    <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-gray-500)]">{feature.note}</p>
                  )}
                  {feature.link && (
                    <TrackedLink
                      href={`/${locale}/head-test`}
                      event="head_test_entry_click"
                      eventProps={{ surface: meta.linkSurface, locale }}
                      className="mt-6 inline-block border-b-2 border-[var(--color-orange-300)] pb-0.5 text-[15px] font-semibold text-[var(--color-gray-900)]"
                    >
                      {feature.link} →
                    </TrackedLink>
                  )}
                </Reveal>
                <Reveal delayMs={120} className="relative">
                  {meta.playmat && (
                    <>
                      <Image
                        src="/images/home-v2/playmat.png"
                        alt=""
                        role="presentation"
                        width={900}
                        height={1286}
                        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-[420px] opacity-40"
                      />
                      <Image
                        src="/images/home-v2/baby-stand.png"
                        alt=""
                        role="presentation"
                        width={956}
                        height={1200}
                        className="pointer-events-none absolute bottom-0 right-2 hidden w-[150px] lg:block"
                      />
                    </>
                  )}
                  <PhoneFrame src={meta.screen} alt={feature.screenAlt} tall={meta.tall} className="relative" />
                </Reveal>
              </div>
            </Container>
          </section>
        )
      })}
    </>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/marketing/FeatureSections.test.tsx`
Expected: PASS 4개.

- [ ] **Step 5: 커밋**

```bash
git add components/marketing/FeatureSections.tsx components/marketing/FeatureSections.test.tsx
git commit -m "feat: 홈케어 기록, 운동, 주간 리포트, 두상 비교 섹션 추가"
```

---

## Task 9: TogetherCards

**Files:**
- Create: `components/marketing/TogetherCards.tsx`
- Create: `components/marketing/TogetherCards.test.tsx`

- [ ] **Step 1: 테스트를 쓴다**

```tsx
// components/marketing/TogetherCards.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import { TogetherCards } from './TogetherCards'

describe('TogetherCards', () => {
  const copy = koMessages.home.together

  it('renders the section title and both cards', () => {
    render(<TogetherCards copy={copy} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(copy.title)
    for (const card of copy.cards) {
      expect(screen.getByRole('heading', { level: 3, name: card.title })).toBeInTheDocument()
      expect(screen.getByText(card.body)).toBeInTheDocument()
    }
  })

  it('has no links', () => {
    render(<TogetherCards copy={copy} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/marketing/TogetherCards.test.tsx`
Expected: FAIL, 모듈 없음.

- [ ] **Step 3: 구현한다**

```tsx
// components/marketing/TogetherCards.tsx
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/marketing/Reveal'
import type { Dictionary } from '@/lib/i18n/dictionary'

type TogetherCopy = Dictionary['home']['together']

function CardArt({ id }: { id: string }) {
  if (id === 'guardian') {
    return (
      <div className="flex -space-x-3">
        <Image src="/images/home-v2/avatar-1.png" alt="" role="presentation" width={128} height={128} className="h-14 w-14 rounded-full" />
        <Image src="/images/home-v2/avatar-2.png" alt="" role="presentation" width={128} height={128} className="h-14 w-14 rounded-full" />
      </div>
    )
  }
  return (
    <Image src="/images/home-v2/article-thumb.png" alt="" role="presentation" width={240} height={160} className="h-14 w-auto rounded-[10px]" />
  )
}

export function TogetherCards({ copy }: { copy: TogetherCopy }) {
  return (
    <section aria-labelledby="together-title" className="bg-white py-20 sm:py-28">
      <Container>
        <Reveal>
          <p className="inline-flex rounded-pill bg-[var(--color-orange-50)] px-3 py-1.5 text-[13px] font-semibold text-[var(--color-hero-fg)]">
            {copy.label}
          </p>
          <h2
            id="together-title"
            className="mt-4 text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-[var(--color-gray-900)] sm:text-4xl lg:text-[40px]"
          >
            {copy.title}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {copy.cards.map((card, index) => (
            <Reveal key={card.id} delayMs={index * 100}>
              <article className="h-full rounded-[20px] bg-[var(--color-gray-50)] p-7 shadow-[0_0_5px_rgba(0,0,0,0.05)]">
                <CardArt id={card.id} />
                <h3 className="mt-6 text-xl font-bold leading-snug text-[var(--color-gray-900)]">{card.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-gray-600)]">{card.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/marketing/TogetherCards.test.tsx`
Expected: PASS 2개.

- [ ] **Step 5: 커밋**

```bash
git add components/marketing/TogetherCards.tsx components/marketing/TogetherCards.test.tsx
git commit -m "feat: 보호자 연동과 두상연구소 카드 섹션 추가"
```

---

## Task 10: PricingSection

**Files:**
- Create: `components/marketing/PricingSection.tsx`
- Create: `components/marketing/PricingSection.test.tsx`

- [ ] **Step 1: 테스트를 쓴다**

```tsx
// components/marketing/PricingSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import koMessages from '@/messages/ko.json'
import enMessages from '@/messages/en.json'
import { PricingSection } from './PricingSection'

describe('PricingSection', () => {
  it('renders the confirmed Korean prices as given in the dictionary', () => {
    render(<PricingSection locale="ko" copy={koMessages.home.pricing} />)
    expect(screen.getByText('월 2,875원')).toBeInTheDocument()
    expect(screen.getByText('연 34,500원')).toBeInTheDocument()
    expect(screen.getByText('51% OFF')).toBeInTheDocument()
    expect(screen.getAllByText('월 5,900원')).toHaveLength(2)
  })

  it('offers only the app download link, never a subscribe button', () => {
    render(<PricingSection locale="ko" copy={koMessages.home.pricing} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/ko/install')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('hides price cards when the dictionary has no amounts', () => {
    render(<PricingSection locale="en" copy={enMessages.home.pricing} />)
    expect(screen.queryByText('51% OFF')).toBeNull()
    expect(screen.getByText(enMessages.home.pricing.title)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/marketing/PricingSection.test.tsx`
Expected: FAIL, 모듈 없음.

- [ ] **Step 3: 구현한다**

```tsx
// components/marketing/PricingSection.tsx
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/marketing/Reveal'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

type PricingCopy = Dictionary['home']['pricing']

export function PricingSection({ locale, copy }: { locale: Locale; copy: PricingCopy }) {
  const hasAmounts = Boolean(copy.yearly.total && copy.monthly.price)

  return (
    <section
      aria-labelledby="pricing-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-cream-top)_0%,#FFF9EB_60%,var(--color-bg)_100%)] py-20 sm:py-28"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <p className="inline-flex rounded-pill bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-hero-fg)] shadow-[0_0_5px_rgba(0,0,0,0.05)]">
            {copy.label}
          </p>
          <h2
            id="pricing-title"
            className="mt-4 text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-[var(--color-gray-900)] sm:text-4xl lg:text-[40px]"
          >
            {copy.title}
          </h2>
          <p className="mt-5 text-base font-medium leading-[1.55] text-[var(--color-gray-600)] sm:text-lg">
            {copy.body}
          </p>

          {hasAmounts && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="relative rounded-[16px] border-2 border-[var(--color-orange-500)] bg-[var(--color-orange-50)] p-5">
                <span className="absolute -top-3 left-4 rounded-pill bg-[var(--color-orange-900)] px-3 py-1 text-xs font-bold text-white">
                  {copy.yearly.badge}
                </span>
                <p className="text-sm font-semibold text-[var(--color-gray-900)]">{copy.yearly.name}</p>
                <p className="mt-2 text-[28px] font-bold tabular-nums leading-none text-[var(--color-gray-900)]">
                  {copy.yearly.monthlyEquivalent}
                </p>
                <p className="mt-2 text-[13px] text-[var(--color-gray-600)]">{copy.yearly.total}</p>
              </div>
              <div className="rounded-[16px] border border-[var(--color-gray-200)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--color-gray-900)]">{copy.monthly.name}</p>
                <p className="mt-2 text-[28px] font-bold tabular-nums leading-none text-[var(--color-gray-900)]">
                  {copy.monthly.price}
                </p>
                <p className="mt-2 text-[13px] text-[var(--color-gray-600)]">{copy.monthly.total}</p>
              </div>
            </div>
          )}

          <ul className="mt-5 space-y-1 text-[13px] font-medium text-[var(--color-gray-500)]">
            {copy.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>

          <TrackedLink
            href={`/${locale}/install`}
            event="cta_install_click"
            eventProps={{ surface: 'pricing', platform: 'install_page', locale }}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-[12px] bg-[var(--color-orange-500)] px-6 text-[15px] font-bold text-[var(--color-gray-900)]"
          >
            {copy.cta}
          </TrackedLink>
        </Reveal>
        <Reveal delayMs={120} className="relative hidden h-[360px] lg:block">
          <Image
            src="/images/home-v2/dori-cheer.png"
            alt=""
            role="presentation"
            width={800}
            height={600}
            className="absolute bottom-0 left-0 w-[220px]"
          />
          <Image
            src="/images/home-v2/baby-celebrate.png"
            alt=""
            role="presentation"
            width={800}
            height={800}
            className="absolute bottom-0 right-0 w-[300px]"
          />
        </Reveal>
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/marketing/PricingSection.test.tsx`
Expected: PASS 3개.

- [ ] **Step 5: 커밋**

```bash
git add components/marketing/PricingSection.tsx components/marketing/PricingSection.test.tsx
git commit -m "feat: 3일 무료체험과 연간, 월간 가격을 안내하는 섹션 추가"
```

---

## Task 11: InstallCta를 옅은 노랑으로, SafetyNotice에서 스트레스 문구 제거

**Files:**
- Modify: `components/marketing/InstallCta.tsx`
- Modify: `components/marketing/SafetyNotice.tsx`

- [ ] **Step 1: `InstallCta.tsx`를 통째로 바꾼다**

```tsx
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { StoreQrCodes } from '@/components/install/StoreQrCodes'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function InstallCta({ locale, surface }: { locale: Locale; surface: string }) {
  const dict = await getDictionary(locale)

  return (
    <section
      aria-labelledby="install-cta-title"
      className="bg-[linear-gradient(180deg,var(--color-orange-50)_0%,var(--color-bg)_100%)] py-24"
    >
      <Container className="flex flex-col items-center text-center">
        <h2
          id="install-cta-title"
          className="max-w-2xl text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-[var(--color-gray-900)] sm:text-4xl"
        >
          {dict.home.installCta.title}
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--color-gray-600)]">
          {dict.home.installCta.body}
        </p>
        <div className="mt-8">
          <StoreButtons surface={surface} locale={locale} labels={dict.store} />
        </div>
        <StoreQrCodes surface={surface} locale={locale} labels={dict.store} className="mt-10 hidden sm:flex" />
        <p className="mt-5 text-xs text-[var(--color-gray-500)]">{dict.launch.liveNotice}</p>
      </Container>
    </section>
  )
}
```

- [ ] **Step 2: `SafetyNotice.tsx`의 문구 목록을 바꾼다**

```tsx
  const copy = compact ? [dict.medical.compactBody] : [dict.medical.body, dict.medical.emergency]
```

- [ ] **Step 3: 검사**

Run: `npm run typecheck && npm run lint`
Expected: 통과. `betaForm`과 `isAppLive` import가 사라졌는지 확인한다.

- [ ] **Step 4: 커밋**

```bash
git add components/marketing/InstallCta.tsx components/marketing/SafetyNotice.tsx
git commit -m "feat: 설치 CTA를 옅은 노랑으로 바꾸고 사전예약 분기와 스트레스 안내를 제거"
```

---

## Task 12: 홈 조립 교체와 옛 구성 삭제

**Files:**
- Modify: `app/[locale]/(site)/page.tsx`
- Delete: `components/marketing/Hero.tsx`, `HomeStorySections.tsx`, `HomeStorySections.test.tsx`, `HomeTogetherSection.tsx`, `HomeFeatureSections.tsx`, `SecondaryPaths.tsx`, `HomePreviewSections.tsx`, `HomeCareLoop.tsx`, `ActionGuide.tsx`, `StatStrip.tsx`, `SymptomGrid.tsx`, `ArticleTeaserGrid.tsx`, `public/images/app-screens/*.png`
- Modify: `messages/ko.json`, `messages/en.json` (옛 키 삭제)

- [ ] **Step 1: 페이지를 바꾼다**

```tsx
import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata, TORTICOLLIS_KEYWORDS } from '@/lib/seo/metadata'
import { HeroV2 } from '@/components/marketing/HeroV2'
import { FeatureSections } from '@/components/marketing/FeatureSections'
import { TogetherCards } from '@/components/marketing/TogetherCards'
import { PricingSection } from '@/components/marketing/PricingSection'
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
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.home.seo.title,
    description: dict.home.seo.description,
    path: `/${locale}`,
    locale,
    keywords: locale === 'ko' ? TORTICOLLIS_KEYWORDS : undefined,
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
  const dict = await getDictionary(loc)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd(dict)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(mobileAppJsonLd(loc, dict)) }}
      />
      <HeroV2 locale={loc} copy={dict.home.hero} />
      <FeatureSections locale={loc} features={dict.home.features} />
      <TogetherCards copy={dict.home.together} />
      <PricingSection locale={loc} copy={dict.home.pricing} />
      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="home" />
    </>
  )
}
```

- [ ] **Step 2: 옛 컴포넌트와 자산을 지운다**

```bash
git rm components/marketing/Hero.tsx components/marketing/HomeStorySections.tsx components/marketing/HomeStorySections.test.tsx \
  components/marketing/HomeTogetherSection.tsx components/marketing/HomeFeatureSections.tsx components/marketing/SecondaryPaths.tsx \
  components/marketing/HomePreviewSections.tsx components/marketing/HomeCareLoop.tsx components/marketing/ActionGuide.tsx \
  components/marketing/StatStrip.tsx components/marketing/SymptomGrid.tsx components/marketing/ArticleTeaserGrid.tsx
git rm -r public/images/app-screens
grep -rn "app-screens\|HomeStorySections\|HomeFeatureSections\|SecondaryPaths\|HomeTogetherSection" app components lib
```

Expected: grep 결과 없음. `GoalAchievement.tsx`는 남아 있어야 한다.

- [ ] **Step 3: 옛 사전 키를 지운다**

`ko.json`과 `en.json` 양쪽에서 지운다.

- `home.hero.titlePrimary`, `home.hero.titleSecondary`, `home.hero.subtitle`
- `home.storySections` 배열 전체
- `home.installCta.eyebrow`
- `nav.start`
- `medical.stress`

- [ ] **Step 4: 검사**

Run: `node -e "for (const l of ['ko','en']) JSON.parse(require('fs').readFileSync('messages/'+l+'.json','utf8'));console.log('ok')" && npm run typecheck && npm run lint && npm test`
Expected: 전부 통과. `HeaderNav.test.tsx`의 `labels`에 `start`가 남아 있으면 지운다.

- [ ] **Step 5: 커밋**

```bash
git add -A app components messages public
git commit -m "feat: 홈을 2.0.0 구성으로 교체하고 옛 6섹션 구성과 스크린샷을 제거"
```

---

## Task 13: 검증

**Files:** 없음 (검사와 확인만)

- [ ] **Step 1: 자동 검사 전체**

Run: `npm run typecheck && npm run lint && npm run i18n:check && npm test`
Expected: 전부 통과. `i18n:check`는 `origin/main` 대비 diff에서 하드코딩 카피를 찾으므로 브랜치가 `origin/main`을 추적하는지 확인한다.

- [ ] **Step 2: 로컬 실행과 첫 프레임 확인**

```bash
npm run dev &
sleep 8
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,5200 --virtual-time-budget=3000 --screenshot=/tmp/home-v2-desktop.png "http://localhost:3000/ko"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=390,6200 --virtual-time-budget=3000 --screenshot=/tmp/home-v2-mobile.png "http://localhost:3000/ko"
```

두 스크린샷을 열어 확인한다.

- 히어로에 폰 세 대(데스크톱)와 한 대(모바일), 도리, 아기 캐릭터가 보인다.
- 아래 섹션 본문이 첫 프레임에서 전부 보인다(투명하게 남은 섹션이 없다).
- 가격 카드에 월 2,875원, 연 34,500원, 51% OFF, 월 5,900원이 보인다.
- 커뮤니티, 스트레스, AI 문구가 어디에도 없다.
- 헤더 로고가 도리 워드마크이고 우측 버튼이 앱 다운로드다.

- [ ] **Step 3: 문장 부호 규칙 검사**

```bash
grep -rn -E '[·—]' messages/ko.json components/marketing components/layout app/'[locale]'/'(site)'/page.tsx || echo "clean"
```

Expected: `clean`. 걸리는 줄이 있으면 쉼표나 "와/과"로 고친다.

- [ ] **Step 4: 영어 페이지가 깨지지 않는지 확인**

`http://localhost:3000/en`을 열어 히어로와 네 섹션이 렌더되고, 가격 섹션은 제목과 문구만 보이며 카드가 없는지 본다.

- [ ] **Step 5: PR**

```bash
git push -u origin HEAD
gh pr create --base main --title "feat: 한국어 홈을 앱 2.0.0 세계관으로 리모델링" --body "설계 문서 docs/specs/2026-09-29-home-ko-remodel-v2-design.md, 계획 docs/plans/2026-09-29-home-ko-remodel-v2.md에 따른 구현입니다. 헤더 로고와 CTA, 히어로, 4개 기능 섹션, 함께 카드, 가격, 설치 CTA를 교체하고 옛 6섹션 구성을 제거했습니다."
```

---

## 계획 자체 점검 결과

- 설계 문서 3절의 섹션 11개는 Task 4(헤더), 7(히어로), 8(기능 4개), 9(함께), 10(가격), 11(이용 안내와 설치 CTA), 3(푸터 태그라인)이 덮는다.
- 5.4절 등장 애니메이션 결함은 Task 5, 4.4절 폰 프레임은 Task 6, 8절 계측은 Task 7과 8의 `TrackedLink`가 덮는다.
- 컴포넌트 이름과 prop은 Task 7부터 12까지 `HeroV2({locale, copy})`, `FeatureSections({locale, features})`, `TogetherCards({copy})`, `PricingSection({locale, copy})`, `PhoneFrame({src, alt, tall, className, priority})`, `BarodoriLogo({locale, label, className})`으로 일치한다.
- 사전 키는 Task 3에서 추가한 것만 Task 7부터 12가 읽는다. 옛 키는 Task 12에서만 지운다.
