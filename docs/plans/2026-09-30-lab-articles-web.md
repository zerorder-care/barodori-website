# 앱 2.0.0 아티클과 FAQ 웹 런타임 연동 Implementation Plan

> **실행 안내:** 이 저장소의 작업 절차를 따르고 아래 체크리스트를 작업 단위로 수행한다. 한 번에 한 태스크만 진행한다. 각 태스크는 실패하는 테스트를 먼저 쓰고, 통과시킨 뒤, 바로 커밋한다.

**Goal:** 웹의 아티클과 FAQ가 1.4 시절 MDX 6편과 커뮤니티 공식 콘텐츠 대신 백엔드 Knowledge Lab의 익명 웹 읽기 엔드포인트를 서버에서 읽어 렌더하도록 바꾼다. 앱과 같은 원본을 같은 분류(운동 가이드, 질환 정보, 자주 묻는 질문, 월령별)로 보여주고, 게시와 철회는 웹훅 재검증으로 하루 안에 반영한다.

**Architecture:** `lib/api/knowledgeLab.ts`가 `fetch`에 `next: { revalidate: 86400, tags: ['lab-content'] }`를 붙여 백엔드 `/api/v2/knowledge-lab/web` 세 엔드포인트를 읽는다. 그 위에서 `lib/content/labArticle.ts`가 카드와 상세를 도메인 모델(`LabArticleCard`, `LabArticle`)로 바꾸고, `lib/content/categories.ts`가 네 분류와 라벨을 담는다. 페이지는 서버 컴포넌트로 목록(`articles/page.tsx`), 상세(`articles/[id]/page.tsx`), FAQ(`faq/page.tsx`)를 그리고, 본문은 `components/article/LabDocument.tsx`가 렌더 문서 세 노드를 재귀로 그린다. 게시 웹훅은 `app/api/revalidate/route.ts`가 받아 `lib/cache/revalidate.ts`의 판정을 거쳐 `revalidateTag('lab-content', 'max')`를 부른다.

**Tech Stack:** Next.js 16.2.4 App Router, React 19.2.4, TypeScript 5, Tailwind CSS v4, `react-markdown` + `remark-gfm` + `rehype-slug` + `github-slugger`, Vitest 4 + @testing-library/react(jsdom).

**설계 문서:** `docs/specs/2026-09-30-lab-articles-web-design.md`

**백엔드 계약:** `../barodori-backend/docs/specs/knowledge-lab-web-contract.md` (그 위의 소비 계약 `knowledge-lab-contract.md`와 마크다운 계약 `knowledge-lab-markdown-contract.md`가 응답 스키마의 원천이다)

**프로젝트 규칙(AGENTS.md):** "This is NOT the Next.js you know." 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 읽는다. 이 계획이 쓰는 API와 읽어야 할 파일은 다음과 같다.

| API | 읽을 문서 |
| --- | --- |
| 라우트 핸들러 | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` |
| `revalidateTag` | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md` |
| `fetch` 캐시 옵션 | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md` |
| 라우트 세그먼트 설정(`dynamic`, `fetchCache`) | `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` |
| `redirects` | `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md` |
| `next/image` | `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` |
| `next/link` | `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` |

문서에서 확인한 사항 두 가지를 그대로 따른다.

- `revalidateTag`의 한 인자 형태는 폐기 예정이다. 반드시 `revalidateTag('lab-content', 'max')`처럼 두 번째 인자를 준다(`revalidateTag.md`, "The single-argument form `revalidateTag(tag)` is deprecated").
- `next/image`의 `priority`는 Next.js 16부터 폐기되고 `preload`로 대체되었다(`image.md`, "#### `priority`"). 이 계획은 본문 이미지를 `next/image` 없이 그리지만, 다른 곳에서 이미지를 손볼 일이 생기면 `priority` 대신 `preload`를 쓴다.

**`dynamic = 'force-dynamic'` 결정:** 유지하지 않고 **제거한다.** `caching-without-cache-components.md`의 `dynamic` 절이 `'force-dynamic'`은 "Setting the option of every `fetch()` request in a layout or page to `{ cache: 'no-store', next: { revalidate: 0 } }`"와 "Setting the segment config to `export const fetchCache = 'force-no-store'`"와 같다고 명시한다. 즉 지금처럼 두면 5.1절이 요구하는 `revalidate: 86400`과 `tags: ['lab-content']`가 전부 무시되고 웹훅 재검증도 동작하지 않는다. 설계 문서 2절의 "캐시는 웹 한 곳에서 하루 단위로 잡는다"와 정면으로 어긋나므로 세 페이지에서 `export const dynamic = 'force-dynamic'` 줄을 지운다. 목록과 FAQ는 `searchParams`를 읽으므로 요청 시점 렌더가 유지되고, 상세는 `generateStaticParams` 없는 동적 세그먼트라 첫 요청에 렌더되어 태그와 함께 캐시된다. `cacheComponents`는 `next.config.ts`에 켜져 있지 않으므로 기존 캐시 모델이 그대로 적용된다.

**문장 부호 규칙:** 코드, 주석, 카피, 문서, 커밋 메시지 어디에도 가운데점, em-dash, 화살표, 원형 글자를 쓰지 않는다. 나열은 쉼표나 "와/과"로 잇는다. 원고 본문 안의 문장 부호는 원고의 것이므로 렌더러가 손대지 않는다.

**테스트 범위 주의:** `vitest.config.ts`의 include는 `lib/**/*.test.ts`, `lib/**/*.test.tsx`, `components/**/*.test.tsx`뿐이다. `app/**`는 단위 테스트가 돌지 않으므로 페이지와 라우트 핸들러는 `npm run typecheck`와 개발 서버 실측으로 검증한다. 그래서 재검증 라우트의 판정 로직은 `lib/cache/revalidate.ts`로 빼서 단위 테스트한다. 예외로 `app/sitemap.test.ts`는 이미 존재하고 돌지 않지만, 설계 13절이 다시 쓰라고 하므로 `lib/seo/labSitemap.ts`로 로직을 빼서 `lib/`에서 테스트한다.

**타입 주의:** `Dictionary` 타입은 `messages/ko.json`에서 추론된다(`lib/i18n/dictionary.ts`의 `export type Dictionary = typeof koMessages`). `messages/en.json`은 항상 `ko.json`과 같은 키 구조를 유지해야 한다. 새 키는 두 파일에 동시에 넣는다.

**백엔드 의존:** 백엔드 웹 라우트는 별도로 구현 중이라 이 작업을 시작할 때 떠 있지 않을 수 있다. 그래서 다음을 지킨다.

- API가 없거나 실패하면 예외를 던지지 않는다. 목록은 빈 배열과 `error` 문자열을, 상세는 `null`을 돌려주고 페이지는 빈 상태와 안내 문구를 그린다. 사이트는 API 없이도 빌드되고 뜬다.
- Task 1에서 `lib/api/__fixtures__/knowledgeLab.ts`를 먼저 만든다. 실제 응답과 같은 모양의 표본을 담는다. 이미지 자산 하나, 첨부 자산 하나, 기능 버튼이 될 인라인 코드 하나를 가진 `exercise_guide` 마크다운 아티클 한 편, `faq` 한 편, `monthMin: 13`과 `monthMax: null`인 월령별 한 편, `schemaVersion: 1`인 블록 아티클 한 편이다.
- 같은 Task 1에서 `scripts/mock-lab-api.mjs`를 만든다. 픽스처를 백엔드와 같은 봉투와 경로로 내려주는 로컬 목 서버다. 백엔드가 뜨기 전에는 `BARODORI_API_BASE_URL=http://127.0.0.1:4010`으로 개발 서버를 띄워 실측한다.
- Task 14의 실측은 백엔드가 배포되어 있으면 운영 API로, 아니면 목 서버로 수행하고 어느 쪽으로 했는지 PR 본문에 적는다.

**진행 순서 원칙:** 모든 커밋에서 `npm run typecheck`가 통과해야 한다. 그래서 새 사전 키와 새 분류 상수는 먼저 **추가**하고(Task 2, Task 3), 옛 사전 키와 옛 분류 상수는 마지막 정리 태스크(Task 13)에서 지운다. 새 컴포넌트는 옛 컴포넌트와 다른 이름(`LabArticleCard`, `LabArticleHeader`, `RelatedLabArticles`)으로 만들어 두 이름이 잠시 공존하게 하고, 참조가 사라진 뒤에 옛 파일을 지운다.

---

## File Structure

| 파일 | 책임 | 신규/수정/삭제 |
| --- | --- | --- |
| `lib/api/__fixtures__/knowledgeLab.ts` | 실제 응답 모양의 표본 데이터 | 신규 |
| `scripts/mock-lab-api.mjs` | 픽스처를 내려주는 로컬 목 서버 | 신규 |
| `scripts/check_i18n_hardcoded_copy.sh` | 픽스처 경로를 스캔 제외에 추가 | 수정 |
| `lib/api/knowledgeLab.ts` (+test) | 웹 읽기 엔드포인트 클라이언트, 타입, 자산 URL | 신규 |
| `messages/ko.json`, `messages/en.json` | `article`과 `faq` 키 추가, 뒤에 옛 키 제거 | 수정 |
| `lib/content/categories.ts` | 네 분류와 라벨, 옛 분류는 뒤에 제거 | 수정 |
| `lib/content/labArticle.ts` (+test) | 제목 분리, 분류와 트랙, 요약, 개월 라벨, 읽는 시간, v1 블록 변환 | 신규 |
| `components/article/LabDocument.tsx` (+test) | 렌더 문서 세 노드 재귀 렌더 | 신규 |
| `components/article/LabCallout.tsx` | 콜아웃 시각 언어 | 신규 |
| `components/article/Toc.tsx` (+test) | 렌더 문서에서 목차 생성 | 수정 |
| `components/article/LabArticleCard.tsx` (+test) | 새 모델 카드 | 신규 |
| `components/article/MonthlyTrackList.tsx` (+test) | 트랙별 월령 목록 | 신규 |
| `components/article/CategoryFilter.tsx` | 새 분류 읽기 | 수정 |
| `components/article/LabArticleHeader.tsx` | 상세 헤더 | 신규 |
| `components/article/RelatedLabArticles.tsx` | 관련 글 | 신규 |
| `app/[locale]/(site)/articles/page.tsx` | 목록 페이지 전환 | 수정 |
| `app/[locale]/(site)/articles/[id]/page.tsx` | 상세 페이지 | 신규 |
| `app/[locale]/(site)/articles/[slug]/page.tsx` | 옛 상세 | 삭제 |
| `lib/seo/metadata.ts` (+test) | 절대 URL 이미지 처리 | 수정 |
| `lib/seo/jsonLd.ts` (+test) | `heroImage` 널과 절대 URL 처리 | 수정 |
| `lib/seo/labSitemap.ts` (+test) | sitemap 항목 조립 | 신규 |
| `app/sitemap.ts`, `app/sitemap.test.ts` | 새 조립 함수 사용 | 수정 |
| `components/faq/FaqAccordion.tsx` (+test) | 카테고리 칩 제거, 상세 링크 | 수정 |
| `app/[locale]/(site)/faq/page.tsx` | Knowledge Lab FAQ 읽기 | 수정 |
| `lib/cache/revalidate.ts` (+test) | 토큰 검사와 태그 필터 | 신규 |
| `app/api/revalidate/route.ts` | 게시 웹훅 수신 | 신규 |
| `.env.example`, `README.md` | `LAB_REVALIDATE_TOKEN`과 운영 절 | 수정 |
| `next.config.ts` | 옛 슬러그 6개 308 리다이렉트 | 수정 |
| `lib/api/articles.ts`(+test), `lib/content/articles.ts`(+test), `lib/api/community.ts`(+test), `lib/content/faq.ts` | 옛 파이프라인 | 삭제 |
| `lib/api/content.ts`(+test) | FAQ 부분 제거, 뉴스룸 유지 | 수정 |
| `content/articles/`, `public/articles/` | 옛 MDX 6편과 이미지 | 삭제 |
| `components/article/ArticleCard.tsx`, `ArticleHeader.tsx`, `RelatedArticles.tsx`, `mdx/ExerciseCard.tsx` | 옛 컴포넌트 | 삭제 |
| `mdx-components.tsx` | `ExerciseCard` 매핑 제거 | 수정 |

`components/article/mdx/Callout.tsx`와 `MedicalNotice.tsx`는 남긴다. `lib/api/content.ts`의 뉴스룸 부분과 `lib/content/newsroom.ts`도 남긴다.

---

## Task 1: 픽스처, 목 서버, Knowledge Lab 클라이언트

**계획 보정(코드 리뷰 반영):** `getLabContent`는 설계 5.1이 정한 대로 `{ item, error? }`를 돌려준다. `fetchLabApi`의 catch는 원인 메시지 대신 `lab_api_network_error` 하나만 돌려준다. `labAssetUrl`은 세 식별자를 UUID로 검사하고 어긋나면 던진다. JSON 픽스처가 TypeScript 픽스처와 갈라지지 않도록 `lib/api/__fixtures__/knowledgeLab.test.ts`를 더했다. 아래 코드 블록은 이 보정을 반영한 것이고, 새로 더한 테스트(네트워크 예외, 깨진 JSON, 자산 식별자 검사, 픽스처 대조)는 저장소의 테스트 파일이 원본이다.

**Files:**
- Create: `lib/api/__fixtures__/knowledgeLab.ts`
- Create: `scripts/mock-lab-api.mjs`
- Create: `lib/api/knowledgeLab.ts`
- Create: `lib/api/knowledgeLab.test.ts`
- Create: `lib/api/__fixtures__/knowledgeLab.test.ts`
- Modify: `scripts/check_i18n_hardcoded_copy.sh`

- [ ] **Step 1: i18n 가드가 픽스처를 건너뛰게 한다**

픽스처는 사용자에게 보이는 카피가 아니라 백엔드 응답 표본이다. 가드는 이미 같은 이유로 `content/articles/*`와 `lib/content/*`를 건너뛰므로 픽스처 경로를 같은 목록에 넣는다. `scripts/check_i18n_hardcoded_copy.sh`의 `is_ignored_file`을 다음으로 바꾼다.

```bash
is_ignored_file() {
  local file="$1"
  [[ "$file" == messages/* ]] ||
    [[ "$file" == content/articles/* ]] ||
    [[ "$file" == lib/content/* ]] ||
    [[ "$file" == lib/api/__fixtures__/* ]] ||
    [[ "$file" == *.test.ts ]] ||
    [[ "$file" == *.test.tsx ]]
}
```

- [ ] **Step 2: 픽스처를 만든다**

`lib/api/__fixtures__/knowledgeLab.ts`를 만든다. 타입은 Task 1 Step 4에서 만드는 `lib/api/knowledgeLab.ts`에서 가져오므로, 실제로는 Step 4를 먼저 쓰고 이 파일을 채워도 된다. 순서는 편한 대로 하되 한 커밋에 함께 들어간다.

```ts
import type { LabCard, LabContent } from '@/lib/api/knowledgeLab'

export const EXERCISE_CONTENT_ID = '11111111-1111-4111-8111-111111111111'
export const EXERCISE_REVISION_ID = '11111111-2222-4222-8222-222222222222'
export const EXERCISE_IMAGE_ASSET_ID = '11111111-3333-4333-8333-333333333333'
export const EXERCISE_ATTACHMENT_ASSET_ID = '11111111-4444-4444-8444-444444444444'

export const FAQ_CONTENT_ID = '22222222-1111-4111-8111-111111111111'
export const FAQ_REVISION_ID = '22222222-2222-4222-8222-222222222222'

export const MONTHLY_CONTENT_ID = '33333333-1111-4111-8111-111111111111'
export const MONTHLY_REVISION_ID = '33333333-2222-4222-8222-222222222222'

export const LEGACY_CONTENT_ID = '44444444-1111-4111-8111-111111111111'
export const LEGACY_REVISION_ID = '44444444-2222-4222-8222-222222222222'

const EXERCISE_MARKDOWN = [
  '# 도리도리 운동 따라 하기',
  '',
  '아기가 깨어 있고 기분이 좋은 때에 하루 세 번 나누어 합니다.',
  '',
  '![엎드려 놀기 자세](lab-asset:11111111-3333-4333-8333-333333333333)',
  '',
  '## 준비물',
  '',
  '| 준비물 | 개수 |',
  '| --- | --- |',
  '| 수건 | 1장 |',
  '| 놀이매트 | 1개 |',
  '',
  '- [x] 기저귀 갈기',
  '- [ ] 수유 후 30분 지나기',
  '',
  '## 순서',
  '',
  '1. 아기를 매트에 눕힙니다.',
  '2. 고개를 천천히 반대쪽으로 돌립니다.',
  '',
  '오늘 한 횟수는 앱에서 `기록하기`.',
  '',
  '`사경`은 목 근육이 한쪽으로 짧아진 상태를 뜻합니다.',
  '',
  '기록지는 [운동 기록지 PDF](lab-asset:11111111-4444-4444-8444-444444444444)에서 받습니다.',
  '',
  '참고 자료는 [질병관리청 안내](https://www.kdca.go.kr)에 있습니다.',
].join('\n')

export const exerciseContent: LabContent = {
  id: EXERCISE_CONTENT_ID,
  revisionId: EXERCISE_REVISION_ID,
  releaseId: '11111111-5555-4555-8555-555555555555',
  generation: 3,
  kind: 'exercise_guide',
  locale: 'ko',
  market: 'KR',
  title: '도리도리 운동 따라 하기(부제: 하루 세 번 3분이면 충분해요)',
  summary: '아기가 편안할 때 하루 세 번, 한 번에 3분씩 목을 부드럽게 돌려 주는 방법을 정리했어요.',
  thumbnailUrl: null,
  durationSeconds: 240,
  targetTracks: ['head_shape', 'torticollis'],
  placements: [{ collection: 'head_shape_lab', order: 0, monthMin: null, monthMax: null }],
  publishedAt: '2026-09-11T02:00:00Z',
  schemaVersion: 2,
  rendererVersion: 'knowledge-markdown-v1',
  renderDocument: [
    { type: 'markdown', markdown: EXERCISE_MARKDOWN },
    {
      type: 'callout',
      icon: '\u{1F4A1}',
      children: [{ type: 'markdown', markdown: '아기가 울면 바로 멈추고 다음 기회에 다시 합니다.' }],
    },
    {
      type: 'disclosure',
      title: '자주 하는 실수',
      children: [
        { type: 'markdown', markdown: '### 너무 세게 누르기\n\n손끝에 힘을 주지 않습니다.' },
      ],
    },
  ],
  markdownAssets: [
    {
      assetVersionId: EXERCISE_IMAGE_ASSET_ID,
      filename: 'tummy-time.png',
      contentType: 'image/png',
      byteLength: 184320,
      sha256: 'a'.repeat(64),
      role: 'image',
    },
    {
      assetVersionId: EXERCISE_ATTACHMENT_ASSET_ID,
      filename: '운동 기록지.pdf',
      contentType: 'application/pdf',
      byteLength: 40960,
      sha256: 'b'.repeat(64),
      role: 'attachment',
    },
  ],
}

export const faqContent: LabContent = {
  id: FAQ_CONTENT_ID,
  revisionId: FAQ_REVISION_ID,
  releaseId: '22222222-5555-4555-8555-555555555555',
  generation: 1,
  kind: 'faq',
  locale: 'ko',
  market: 'KR',
  title: '사경 운동은 언제까지 해야 하나요?',
  summary: '담당 전문의가 정한 기간을 따릅니다. 보호자가 스스로 기간을 늘리거나 줄이지 않습니다.',
  thumbnailUrl: null,
  durationSeconds: null,
  targetTracks: ['torticollis'],
  placements: [{ collection: 'head_shape_lab', order: 5, monthMin: null, monthMax: null }],
  publishedAt: '2026-09-05T02:00:00Z',
  schemaVersion: 2,
  rendererVersion: 'knowledge-markdown-v1',
  renderDocument: [
    {
      type: 'markdown',
      markdown: '기간은 아이마다 다릅니다. 진료 때 정한 목표를 앱에 적어 두고 그대로 따릅니다.',
    },
  ],
  markdownAssets: [],
}

export const monthlyContent: LabContent = {
  id: MONTHLY_CONTENT_ID,
  revisionId: MONTHLY_REVISION_ID,
  releaseId: '33333333-5555-4555-8555-555555555555',
  generation: 1,
  kind: 'disease_info',
  locale: 'ko',
  market: 'KR',
  title: '13개월 이후의 목 관찰(부제: 걷기 시작한 뒤에 볼 것)',
  summary: null,
  thumbnailUrl: 'https://cdn.barodori.com/lab/monthly-13.png',
  durationSeconds: null,
  targetTracks: ['torticollis'],
  placements: [{ collection: 'home_monthly_information', order: 0, monthMin: 13, monthMax: null }],
  publishedAt: '2026-08-20T02:00:00Z',
  schemaVersion: 2,
  rendererVersion: 'knowledge-markdown-v1',
  renderDocument: [
    { type: 'markdown', markdown: '걷기 시작하면 앉은 자세보다 선 자세에서 목 기울기를 봅니다.' },
  ],
  markdownAssets: [],
}

export const legacyBlocksContent: LabContent = {
  id: LEGACY_CONTENT_ID,
  revisionId: LEGACY_REVISION_ID,
  releaseId: '44444444-5555-4555-8555-555555555555',
  generation: 1,
  kind: 'disease_info',
  locale: 'ko',
  market: 'KR',
  title: '사두증이란',
  summary: null,
  thumbnailUrl: null,
  durationSeconds: null,
  targetTracks: ['head_shape'],
  placements: [{ collection: 'head_shape_lab', order: 2, monthMin: null, monthMax: null }],
  publishedAt: '2026-07-01T02:00:00Z',
  schemaVersion: 1,
  blocks: [
    { type: 'heading', text: '정의' },
    { type: 'paragraph', text: '머리 뒤쪽 한 곳이 납작해진 상태를 말합니다.' },
  ],
}

export const labContentsById: Record<string, LabContent> = {
  [EXERCISE_CONTENT_ID]: exerciseContent,
  [FAQ_CONTENT_ID]: faqContent,
  [MONTHLY_CONTENT_ID]: monthlyContent,
  [LEGACY_CONTENT_ID]: legacyBlocksContent,
}

function toCard(content: LabContent): LabCard {
  const heroAsset =
    content.schemaVersion === 2
      ? content.markdownAssets.find((asset) => asset.role === 'image')
      : undefined
  return {
    id: content.id,
    revisionId: content.revisionId,
    kind: content.kind,
    title: content.title,
    summary: content.summary,
    thumbnailUrl: content.thumbnailUrl,
    durationSeconds: content.durationSeconds,
    targetTracks: content.targetTracks,
    placements: content.placements,
    publishedAt: content.publishedAt,
    heroAsset: heroAsset
      ? { assetVersionId: heroAsset.assetVersionId, contentType: heroAsset.contentType }
      : null,
  }
}

export const headShapeLabCards: LabCard[] = [exerciseContent, legacyBlocksContent, faqContent].map(toCard)
export const monthlyCards: LabCard[] = [monthlyContent].map(toCard)

export function labFixtureEnvelope<T>(data: T): { code: number; message: string; data: T } {
  return { code: 0, message: 'ok', data }
}
```

- [ ] **Step 3: 목 서버 스크립트를 만든다**

`scripts/mock-lab-api.mjs`를 만든다. 백엔드와 같은 경로, 같은 봉투, 같은 캐시 헤더로 픽스처를 내려준다. 자산 바이트는 1x1 PNG와 짧은 텍스트로 대신한다.

```js
// 백엔드 웹 라우트가 뜨기 전에 웹을 실측하기 위한 목 서버다.
// 사용: node scripts/mock-lab-api.mjs  그리고
//       BARODORI_API_BASE_URL=http://127.0.0.1:4010 npm run dev
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'

const PORT = Number(process.env.MOCK_LAB_PORT ?? 4010)
const PREFIX = '/api/v2/knowledge-lab/web'

// 픽스처는 TypeScript라 tsx 없이 읽을 수 없으므로, 목 서버는 같은 데이터를 JSON으로 들고 있는
// scripts/mock-lab-fixtures.json 을 읽는다. 이 파일은 Step 3b에서 만든다.
const fixtures = JSON.parse(await readFile(new URL('./mock-lab-fixtures.json', import.meta.url), 'utf8'))

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function envelope(data) {
  return JSON.stringify({ code: 0, message: 'ok', data })
}

function sendJson(res, data) {
  const body = envelope(data)
  res.writeHead(200, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60',
    vary: 'Accept-Encoding',
  })
  res.end(body)
}

function sendNotFound(res, reason) {
  res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ code: 1040, message: reason, data: null }))
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (!url.pathname.startsWith(PREFIX)) {
    sendNotFound(res, 'not_found')
    return
  }
  const rest = url.pathname.slice(PREFIX.length)
  const locale = url.searchParams.get('locale') ?? 'ko'
  const market = url.searchParams.get('market') ?? 'KR'

  if (rest === '/contents') {
    if (locale !== 'ko' || market !== 'KR') {
      sendJson(res, { items: [] })
      return
    }
    const collection = url.searchParams.get('collection') ?? 'head_shape_lab'
    const kind = url.searchParams.get('kind')
    const items = (collection === 'home_monthly_information' ? fixtures.monthlyCards : fixtures.headShapeLabCards)
      .filter((card) => !kind || card.kind === kind)
    sendJson(res, { items })
    return
  }

  const detail = /^\/contents\/([^/]+)$/.exec(rest)
  if (detail) {
    const content = locale === 'ko' && market === 'KR' ? fixtures.contentsById[detail[1]] : undefined
    if (!content) {
      sendNotFound(res, 'content_not_found')
      return
    }
    sendJson(res, content)
    return
  }

  const asset = /^\/contents\/([^/]+)\/revisions\/([^/]+)\/assets\/([^/]+)$/.exec(rest)
  if (asset) {
    const content = fixtures.contentsById[asset[1]]
    const found = content?.markdownAssets?.find((item) => item.assetVersionId === asset[3])
    if (!content || content.revisionId !== asset[2] || !found) {
      sendNotFound(res, 'asset_not_found')
      return
    }
    const isImage = found.role === 'image'
    const body = isImage ? PNG_1X1 : Buffer.from('mock attachment bytes\n', 'utf8')
    res.writeHead(200, {
      'content-type': found.contentType,
      'content-disposition': isImage
        ? 'inline'
        : `attachment; filename*=UTF-8''${encodeURIComponent(found.filename)}`,
      'cache-control': 'public, max-age=31536000, immutable',
      etag: `"${found.sha256}"`,
      'x-content-type-options': 'nosniff',
    })
    res.end(body)
    return
  }

  sendNotFound(res, 'not_found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`mock lab api listening on http://127.0.0.1:${PORT}${PREFIX}`)
})
```

- [ ] **Step 3b: 목 서버가 읽을 JSON 픽스처를 만든다**

`scripts/mock-lab-fixtures.json`을 만들고 Step 2 픽스처와 같은 값을 담는다. 최상위 키는 `headShapeLabCards`, `monthlyCards`, `contentsById` 세 개다. 손으로 두 벌을 유지하지 않도록, 파일 맨 앞에 다음 주석 대신 `README` 한 줄을 `README.md` 운영 절(Task 12)에 적는다. JSON에는 주석을 쓸 수 없으므로 `"_note"` 키에 `"lib/api/__fixtures__/knowledgeLab.ts 와 같은 값을 유지한다"`를 넣는다.

- [ ] **Step 4: 실패하는 클라이언트 테스트를 쓴다**

`lib/api/knowledgeLab.test.ts`를 만든다.

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EXERCISE_ATTACHMENT_ASSET_ID,
  EXERCISE_CONTENT_ID,
  EXERCISE_REVISION_ID,
  exerciseContent,
  headShapeLabCards,
  labFixtureEnvelope,
} from './__fixtures__/knowledgeLab'
import { getLabContent, labAssetUrl, listLabContents } from './knowledgeLab'

const originalEnv = process.env

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function withApiBase() {
  process.env = { ...originalEnv, BARODORI_API_BASE_URL: 'https://api.test' }
}

describe('knowledge lab client', () => {
  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it('reads the list envelope and sends the cache tag with a one day revalidate', async () => {
    withApiBase()
    const fetchMock = vi.fn(async () => jsonResponse(labFixtureEnvelope({ items: headShapeLabCards })))
    vi.stubGlobal('fetch', fetchMock)

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab', kind: 'faq' })

    expect(result.error).toBeUndefined()
    expect(result.items).toHaveLength(headShapeLabCards.length)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: unknown }]
    expect(url).toBe(
      'https://api.test/api/v2/knowledge-lab/web/contents?market=KR&locale=ko&collection=head_shape_lab&kind=faq',
    )
    expect(init.next).toEqual({ revalidate: 86400, tags: ['lab-content'] })
    expect(init.cache).toBeUndefined()
  })

  it('returns an empty list with an error string when the request fails', async () => {
    withApiBase()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ code: 1040, message: 'content_not_found' }, 404)))

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab' })

    expect(result.items).toEqual([])
    expect(result.error).toBe('lab_api_http_404')
  })

  it('returns an empty list with an error string when the envelope code is not zero', async () => {
    withApiBase()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ code: 1011, message: 'invalid_query' })))

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab' })

    expect(result.items).toEqual([])
    expect(result.error).toBe('invalid_query')
  })

  it('returns an empty list without calling fetch when no api base url is configured', async () => {
    process.env = { ...originalEnv, BARODORI_API_BASE_URL: '', NEXT_PUBLIC_API_BASE_URL: '', VERCEL_URL: '' }
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await listLabContents({ locale: 'ko', collection: 'head_shape_lab' })

    expect(result.items).toEqual([])
    expect(result.error).toBe('lab_api_base_url_missing')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reads the detail envelope', async () => {
    withApiBase()
    const fetchMock = vi.fn(async () => jsonResponse(labFixtureEnvelope(exerciseContent)))
    vi.stubGlobal('fetch', fetchMock)

    const { item, error } = await getLabContent({ locale: 'ko', id: EXERCISE_CONTENT_ID })

    expect(error).toBeUndefined()
    expect(item?.title).toBe(exerciseContent.title)
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}?market=KR&locale=ko`,
    )
  })

  it('does not call the backend for an id that is not a uuid', async () => {
    withApiBase()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await getLabContent({ locale: 'ko', id: 'tummy-time-guide' })).toEqual({ item: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns the http 404 error code when the content is missing', async () => {
    withApiBase()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ code: 1040, message: 'content_not_found' }, 404)))

    expect(await getLabContent({ locale: 'ko', id: EXERCISE_CONTENT_ID })).toEqual({
      item: null,
      error: 'lab_api_http_404',
    })
  })

  it('builds an asset url', () => {
    withApiBase()

    expect(
      labAssetUrl({
        contentId: EXERCISE_CONTENT_ID,
        revisionId: EXERCISE_REVISION_ID,
        assetVersionId: EXERCISE_ATTACHMENT_ASSET_ID,
        locale: 'ko',
      }),
    ).toBe(
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}` +
        `/revisions/${EXERCISE_REVISION_ID}/assets/${EXERCISE_ATTACHMENT_ASSET_ID}?market=KR&locale=ko`,
    )
  })

  it('returns an empty asset url when no api base url is configured', () => {
    process.env = { ...originalEnv, BARODORI_API_BASE_URL: '', NEXT_PUBLIC_API_BASE_URL: '', VERCEL_URL: '' }

    expect(
      labAssetUrl({
        contentId: EXERCISE_CONTENT_ID,
        revisionId: EXERCISE_REVISION_ID,
        assetVersionId: EXERCISE_ATTACHMENT_ASSET_ID,
        locale: 'ko',
      }),
    ).toBe('')
  })
})
```

명령: `npx vitest run lib/api/knowledgeLab.test.ts`
기대 결과: `lib/api/knowledgeLab.ts`가 없어 모듈 해석에 실패한다.

- [ ] **Step 5: 클라이언트를 구현한다**

`lib/api/knowledgeLab.ts`를 만든다. `fetchBackendApi`는 `cache: 'no-store'`를 강제하므로 쓰지 않고, 같은 봉투 검사를 하는 `fetchLabApi`를 이 파일에 둔다.

```ts
import { getApiBaseUrl, type ApiEnvelope } from '@/lib/api/client'
import type { Locale } from '@/lib/i18n/config'

export type LabKind = 'exercise_guide' | 'disease_info' | 'faq'
export type LabCollection = 'head_shape_lab' | 'home_monthly_information'
export type LabTrack = 'head_shape' | 'torticollis'
export type LabMarket = 'KR' | 'US' | 'JP'

export type LabPlacement = {
  collection: LabCollection
  order: number
  monthMin: number | null
  monthMax: number | null
}

export type LabHeroAsset = {
  assetVersionId: string
  contentType: string
}

export type LabCard = {
  id: string
  revisionId: string
  kind: LabKind
  title: string
  summary: string | null
  thumbnailUrl: string | null
  durationSeconds: number | null
  targetTracks: LabTrack[]
  placements: LabPlacement[]
  publishedAt: string
  heroAsset: LabHeroAsset | null
}

export type LabBlock = {
  type: 'paragraph' | 'heading'
  text: string
}

export type LabRenderNode =
  | { type: 'markdown'; markdown: string }
  | { type: 'disclosure'; title: string; children: LabRenderNode[] }
  | { type: 'callout'; icon: string | null; children: LabRenderNode[] }

export type LabAsset = {
  assetVersionId: string
  filename: string
  contentType: string
  byteLength: number
  sha256: string
  role: 'image' | 'attachment'
}

type LabContentBase = {
  id: string
  revisionId: string
  releaseId: string
  generation: number
  kind: LabKind
  locale: Locale | string
  market: LabMarket
  title: string
  summary: string | null
  thumbnailUrl: string | null
  durationSeconds: number | null
  targetTracks: LabTrack[]
  placements: LabPlacement[]
  publishedAt: string
}

export type LabBlocksContent = LabContentBase & {
  schemaVersion: 1
  blocks: LabBlock[]
}

export type LabMarkdownContent = LabContentBase & {
  schemaVersion: 2
  rendererVersion: string
  renderDocument: LabRenderNode[]
  markdownAssets: LabAsset[]
}

export type LabContent = LabBlocksContent | LabMarkdownContent

export type LabListResult = {
  items: LabCard[]
  error?: string
}

export type LabContentResult = {
  item: LabContent | null
  error?: string
}

/** 웹은 지금 한국 시장만 읽는다. 시장을 바꿀 일이 생기면 locale과 함께 인자로 올린다. */
const LAB_MARKET: LabMarket = 'KR'
const LAB_PATH_PREFIX = '/api/v2/knowledge-lab/web'
const LAB_REVALIDATE_SECONDS = 86400

export const LAB_CACHE_TAG = 'lab-content'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isLabContentId(value: string): boolean {
  return UUID_PATTERN.test(value)
}

type LabFetchResult<T> = { data: T } | { error: string }

async function fetchLabApi<T>(path: string): Promise<LabFetchResult<T>> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) return { error: 'lab_api_base_url_missing' }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: LAB_REVALIDATE_SECONDS, tags: [LAB_CACHE_TAG] },
    })
    if (!response.ok) return { error: `lab_api_http_${response.status}` }

    const payload = (await response.json()) as ApiEnvelope<T>
    if (payload.code !== undefined && payload.code !== 0) {
      return { error: payload.message ?? `lab_api_code_${payload.code}` }
    }
    if (payload.data === undefined || payload.data === null) return { error: 'lab_api_empty_data' }
    return { data: payload.data }
  } catch {
    // 원인 메시지는 그대로 내보내지 않는다. 호출부는 안내 문구만 고르면 된다.
    return { error: 'lab_api_network_error' }
  }
}

export async function listLabContents(params: {
  locale: Locale
  collection: LabCollection
  kind?: LabKind
}): Promise<LabListResult> {
  const search = new URLSearchParams({
    market: LAB_MARKET,
    locale: params.locale,
    collection: params.collection,
  })
  if (params.kind) search.set('kind', params.kind)

  const result = await fetchLabApi<{ items: LabCard[] }>(`${LAB_PATH_PREFIX}/contents?${search}`)
  if ('error' in result) return { items: [], error: result.error }
  return { items: result.data.items ?? [] }
}

export async function getLabContent(params: { locale: Locale; id: string }): Promise<LabContentResult> {
  // UUID가 아니면 백엔드에 물어볼 것도 없이 없는 글이다. 오류가 아니므로 error를 붙이지 않는다.
  if (!isLabContentId(params.id)) return { item: null }

  const search = new URLSearchParams({ market: LAB_MARKET, locale: params.locale })
  const result = await fetchLabApi<LabContent>(`${LAB_PATH_PREFIX}/contents/${params.id}?${search}`)
  if ('error' in result) return { item: null, error: result.error }
  return { item: result.data }
}

// 세 값은 모두 백엔드가 준 식별자다. 형식이 어긋나면 경로를 만들지 않고 즉시 멈춘다.
function requireLabId(value: string): string {
  if (!isLabContentId(value)) throw new Error('invalid lab asset id')
  return encodeURIComponent(value)
}

export function labAssetUrl(params: {
  contentId: string
  revisionId: string
  assetVersionId: string
  locale: Locale
}): string {
  const contentId = requireLabId(params.contentId)
  const revisionId = requireLabId(params.revisionId)
  const assetVersionId = requireLabId(params.assetVersionId)

  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) return ''

  const search = new URLSearchParams({ market: LAB_MARKET, locale: params.locale })
  return (
    `${apiBaseUrl}${LAB_PATH_PREFIX}/contents/${contentId}` +
    `/revisions/${revisionId}/assets/${assetVersionId}?${search}`
  )
}
```

`URLSearchParams`가 `market`, `locale`, `collection`, `kind` 순서로 직렬화하므로 테스트의 기대 URL과 순서가 맞는다.

- [ ] **Step 6: 테스트를 통과시킨다**

명령: `npx vitest run lib/api`
기대 결과: `knowledgeLab.test.ts` 12개와 `__fixtures__/knowledgeLab.test.ts` 3개를 포함해 모두 통과.

명령: `npm run typecheck`
기대 결과: 에러 없음.

- [ ] **Step 7: 목 서버가 뜨는지 확인한다**

명령: `node scripts/mock-lab-api.mjs & sleep 1; curl -s 'http://127.0.0.1:4010/api/v2/knowledge-lab/web/contents?market=KR&locale=ko&collection=head_shape_lab' | head -c 200; kill %1`
기대 결과: `{"code":0,"message":"ok","data":{"items":[` 로 시작하는 JSON.

- [ ] **Step 8: 커밋한다**

```
git add lib/api/knowledgeLab.ts lib/api/knowledgeLab.test.ts lib/api/__fixtures__/knowledgeLab.ts scripts/mock-lab-api.mjs scripts/mock-lab-fixtures.json scripts/check_i18n_hardcoded_copy.sh
git commit -m "$(cat <<'EOF'
feat: Knowledge Lab 웹 읽기 클라이언트와 픽스처, 로컬 목 서버를 추가한다

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 2: 사전 키 추가

설계 10절의 키를 넣는다. 옛 키(`article.more`, `article.end`)는 참조가 사라지는 Task 13에서 지운다. 화살표가 들어간 `article.detailCtaLink`는 문장 부호 규칙 위반이므로 이 태스크에서 함께 고친다. `article.categoryLabels`는 코드의 `articleCategoryLabels`가 담당하므로 사전에 두지 않는다.

**Files:**
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

- [ ] **Step 1: `messages/ko.json`의 `article` 트리에 키를 더한다**

`"detailCtaLink"` 값을 바꾸고, `"detailCtaLink"` 줄 뒤에 다음 키를 이어 붙인다.

```json
    "detailCta": "이 글에서 살펴본 내용을 바로도리 앱에 기록해두면, 다음 상담 전에 참고 자료로 정리하기 좋아요.",
    "detailCtaLink": "앱 설치하고 이어서 하기",
    "author": "바로도리 콘텐츠팀",
    "tocTitle": "목차",
    "relatedTitle": "관련 컨텐츠",
    "readingTime": "{minutes}분 읽기",
    "monthRange": "{min}개월",
    "monthRangeSpan": "{min}개월부터 {max}개월",
    "monthPlus": "13개월 이상",
    "trackTorticollis": "근성 및 자세성 사경",
    "trackHeadShape": "단순 두상",
    "attachment": "첨부 파일",
    "featureLink": "앱에서 이어서 하기"
```

- [ ] **Step 2: `messages/ko.json`의 `faq` 트리에 키를 더한다**

`"contactCta"` 앞에 넣는다.

```json
    "readMore": "자세히 읽기",
```

- [ ] **Step 3: `messages/en.json`에 같은 키를 같은 순서로 넣는다**

`article` 트리:

```json
    "detailCta": "Recording the points from this article in Barodori can help you organize notes before the next consultation.",
    "detailCtaLink": "Install the app and continue",
    "author": "Barodori content team",
    "tocTitle": "Contents",
    "relatedTitle": "Related content",
    "readingTime": "{minutes} min read",
    "monthRange": "{min} months",
    "monthRangeSpan": "{min} to {max} months",
    "monthPlus": "13 months and older",
    "trackTorticollis": "Muscular and positional torticollis",
    "trackHeadShape": "Head shape only",
    "attachment": "Attachment",
    "featureLink": "Continue in the app"
```

`faq` 트리:

```json
    "readMore": "Read more",
```

- [ ] **Step 4: 두 파일의 키 구조가 같은지 확인한다**

명령:

```bash
node -e "
const ko=require('./messages/ko.json'), en=require('./messages/en.json');
const walk=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'&&!Array.isArray(v)?walk(v,p+k+'.'):[p+k]);
const a=walk(ko).sort(), b=walk(en).sort();
const miss=a.filter(k=>!b.includes(k)), extra=b.filter(k=>!a.includes(k));
console.log('ko only:', miss); console.log('en only:', extra);
process.exit(miss.length||extra.length?1:0)
"
```

기대 결과: `ko only: []`와 `en only: []`를 찍고 종료 코드 0.

명령: `npm run typecheck`
기대 결과: 에러 없음. 이 시점에는 새 키를 아무도 읽지 않으므로 통과한다.

- [ ] **Step 5: 커밋한다**

```
git add messages/ko.json messages/en.json
git commit -m "$(cat <<'EOF'
feat: 아티클과 FAQ 런타임 연동에 쓸 사전 키를 추가한다

상세 CTA 링크 문구에서 화살표를 뺀다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 3: 새 네 분류

설계 6절의 네 분류를 `lib/content/categories.ts`에 더한다. 옛 `categories`, `Category`, `categoryLabels`, `isCategory`는 아직 `lib/api/articles.ts`, `lib/content/articles.ts`, `components/article/ArticleCard.tsx`, `ArticleHeader.tsx`, `CategoryFilter.tsx`, 목록 페이지가 쓰므로 그대로 두고 Task 13에서 지운다. 두 이름이 겹치지 않도록 새 것은 `article` 접두사를 쓴다.

**Files:**
- Modify: `lib/content/categories.ts`
- Create: `lib/content/categories.test.ts`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`lib/content/categories.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { articleCategories, articleCategoryLabels, isArticleCategory } from './categories'

describe('article categories', () => {
  it('lists the four lab categories in display order', () => {
    expect(articleCategories).toEqual(['exercise-guide', 'disease-info', 'faq', 'monthly'])
  })

  it('has a korean and english label for every category', () => {
    for (const category of articleCategories) {
      expect(articleCategoryLabels[category].ko.length).toBeGreaterThan(0)
      expect(articleCategoryLabels[category].en.length).toBeGreaterThan(0)
    }
  })

  it('accepts only the four values', () => {
    expect(isArticleCategory('monthly')).toBe(true)
    expect(isArticleCategory('by-month')).toBe(false)
    expect(isArticleCategory('')).toBe(false)
  })
})
```

명령: `npx vitest run lib/content/categories.test.ts`
기대 결과: `articleCategories` 등이 없어 실패한다.

- [ ] **Step 2: 새 분류를 더한다**

`lib/content/categories.ts` 끝에 붙인다.

```ts
// 앱 2.0.0 Knowledge Lab 분류. 설계 문서 6절의 네 값이다.
export const articleCategories = ['exercise-guide', 'disease-info', 'faq', 'monthly'] as const
export type ArticleCategory = typeof articleCategories[number]

export const articleCategoryLabels: Record<ArticleCategory, { ko: string; en: string }> = {
  'exercise-guide': { ko: '운동 가이드', en: 'Exercise guide' },
  'disease-info': { ko: '질환 정보', en: 'Conditions' },
  faq: { ko: '자주 묻는 질문', en: 'FAQ' },
  monthly: { ko: '월령별', en: 'By month' },
}

export function isArticleCategory(value: string): value is ArticleCategory {
  return (articleCategories as readonly string[]).includes(value)
}
```

- [ ] **Step 3: 테스트를 통과시킨다**

명령: `npx vitest run lib/content/categories.test.ts`
기대 결과: 3개 테스트 통과.

명령: `npm run typecheck`
기대 결과: 에러 없음.

- [ ] **Step 4: 커밋한다**

```
git add lib/content/categories.ts lib/content/categories.test.ts
git commit -m "$(cat <<'EOF'
feat: Knowledge Lab 네 분류와 라벨을 추가한다

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 4: 도메인 모델 `lib/content/labArticle.ts`

설계 5.2절의 매핑 규칙을 전부 담는다. 이 파일은 `lib/content/` 아래라 i18n 가드 스캔에서 제외되므로 한국어 리터럴(`부제` 라벨 등)을 그대로 쓸 수 있다.

**Files:**
- Create: `lib/content/labArticle.ts`
- Create: `lib/content/labArticle.test.ts`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`lib/content/labArticle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  exerciseContent,
  faqContent,
  headShapeLabCards,
  legacyBlocksContent,
  monthlyCards,
  monthlyContent,
} from '@/lib/api/__fixtures__/knowledgeLab'
import {
  blocksToDocument,
  documentText,
  estimateReadingMinutes,
  formatPublishedDate,
  monthLabel,
  resolveCategory,
  resolveExcerpt,
  resolveTrack,
  splitTitle,
  stripMarkdown,
  toLabArticle,
  toLabArticleCard,
} from './labArticle'

const monthLabels = {
  monthRange: '{min}개월',
  monthRangeSpan: '{min}개월부터 {max}개월',
  monthPlus: '13개월 이상',
}

describe('splitTitle', () => {
  it('splits a title that carries a parenthesised subtitle', () => {
    expect(splitTitle('도리도리 운동 따라 하기(부제: 하루 세 번 3분이면 충분해요)')).toEqual({
      title: '도리도리 운동 따라 하기',
      subtitle: '하루 세 번 3분이면 충분해요',
    })
  })

  it('accepts a parenthesis without the label', () => {
    expect(splitTitle('사두증이란(머리 뒤가 납작할 때)')).toEqual({
      title: '사두증이란',
      subtitle: '머리 뒤가 납작할 때',
    })
  })

  it('returns a null subtitle when there is no parenthesis', () => {
    expect(splitTitle('사두증이란')).toEqual({ title: '사두증이란', subtitle: null })
  })

  it('returns a null subtitle when the parenthesis is empty', () => {
    expect(splitTitle('사두증이란()')).toEqual({ title: '사두증이란', subtitle: null })
  })
})

describe('resolveCategory', () => {
  it('maps the monthly collection before looking at the kind', () => {
    expect(resolveCategory('home_monthly_information', 'disease_info')).toBe('monthly')
  })

  it('maps the head shape lab kinds', () => {
    expect(resolveCategory('head_shape_lab', 'exercise_guide')).toBe('exercise-guide')
    expect(resolveCategory('head_shape_lab', 'disease_info')).toBe('disease-info')
    expect(resolveCategory('head_shape_lab', 'faq')).toBe('faq')
  })
})

describe('resolveTrack', () => {
  it('returns both when the article targets the two tracks', () => {
    expect(resolveTrack(['head_shape', 'torticollis'])).toBe('both')
  })

  it('returns the single track', () => {
    expect(resolveTrack(['torticollis'])).toBe('torticollis')
    expect(resolveTrack(['head_shape'])).toBe('head_shape')
  })

  it('treats an empty list as both', () => {
    expect(resolveTrack([])).toBe('both')
  })
})

describe('resolveExcerpt', () => {
  it('prefers the summary', () => {
    expect(resolveExcerpt({ summary: '요약입니다.', subtitle: '부제입니다.', document: [] })).toBe('요약입니다.')
  })

  it('falls back to the subtitle when there is no summary', () => {
    expect(resolveExcerpt({ summary: null, subtitle: '부제입니다.', document: [] })).toBe('부제입니다.')
  })

  it('falls back to the first paragraph of the first markdown node', () => {
    const excerpt = resolveExcerpt({
      summary: null,
      subtitle: null,
      document: [
        { type: 'markdown', markdown: '# 제목만 있는 첫 덩어리\n\n**본문** 첫 문단입니다.\n\n둘째 문단입니다.' },
      ],
    })
    expect(excerpt).toBe('제목만 있는 첫 덩어리')
  })

  it('cuts the fallback at 120 characters', () => {
    const long = '가'.repeat(200)
    const excerpt = resolveExcerpt({ summary: null, subtitle: null, document: [{ type: 'markdown', markdown: long }] })
    expect(excerpt).toHaveLength(123)
    expect(excerpt.endsWith('...')).toBe(true)
  })

  it('returns an empty string when there is nothing to show', () => {
    expect(resolveExcerpt({ summary: '  ', subtitle: null, document: [] })).toBe('')
  })
})

describe('stripMarkdown', () => {
  it('removes markers, links and images', () => {
    expect(stripMarkdown('## **굵은** 제목 [링크](https://a.test) ![이미지](lab-asset:x) `코드`')).toBe(
      '굵은 제목 링크  코드',
    )
  })
})

describe('estimateReadingMinutes', () => {
  it('rounds the duration up to whole minutes', () => {
    expect(estimateReadingMinutes({ durationSeconds: 240, text: '' })).toBe(4)
    expect(estimateReadingMinutes({ durationSeconds: 61, text: '' })).toBe(2)
  })

  it('estimates one minute per 500 non space characters when there is no duration', () => {
    expect(estimateReadingMinutes({ durationSeconds: null, text: '가'.repeat(1200) })).toBe(3)
  })

  it('never returns less than one minute', () => {
    expect(estimateReadingMinutes({ durationSeconds: null, text: '' })).toBe(1)
    expect(estimateReadingMinutes({ durationSeconds: 0, text: '' })).toBe(1)
  })
})

describe('monthLabel', () => {
  it('returns null when there is no month placement', () => {
    expect(monthLabel(monthLabels, null, null)).toBeNull()
  })

  it('returns the open ended label when monthMax is null', () => {
    expect(monthLabel(monthLabels, 13, null)).toBe('13개월 이상')
  })

  it('returns a single month label', () => {
    expect(monthLabel(monthLabels, 4, 4)).toBe('4개월')
  })

  it('returns a span label', () => {
    expect(monthLabel(monthLabels, 4, 6)).toBe('4개월부터 6개월')
  })
})

describe('blocksToDocument', () => {
  it('turns v1 blocks into a single markdown node with headings at level two', () => {
    expect(blocksToDocument(legacyBlocksContent.schemaVersion === 1 ? legacyBlocksContent.blocks : [])).toEqual([
      { type: 'markdown', markdown: '## 정의\n\n머리 뒤쪽 한 곳이 납작해진 상태를 말합니다.' },
    ])
  })

  it('returns an empty document for empty blocks', () => {
    expect(blocksToDocument([])).toEqual([])
  })
})

describe('documentText', () => {
  it('walks callout and disclosure children', () => {
    const text = documentText([
      { type: 'markdown', markdown: '겉 문단' },
      { type: 'callout', icon: null, children: [{ type: 'markdown', markdown: '콜아웃 문단' }] },
      { type: 'disclosure', title: '접기 제목', children: [{ type: 'markdown', markdown: '접기 문단' }] },
    ])
    expect(text).toContain('겉 문단')
    expect(text).toContain('콜아웃 문단')
    expect(text).toContain('접기 제목')
    expect(text).toContain('접기 문단')
  })
})

describe('formatPublishedDate', () => {
  it('keeps the date part only', () => {
    expect(formatPublishedDate('2026-09-11T02:00:00Z')).toBe('2026-09-11')
  })
})

describe('toLabArticleCard', () => {
  it('maps a head shape lab card', () => {
    const card = toLabArticleCard(headShapeLabCards[0], { collection: 'head_shape_lab', locale: 'ko' })
    expect(card).toMatchObject({
      id: exerciseContent.id,
      revisionId: exerciseContent.revisionId,
      category: 'exercise-guide',
      kind: 'exercise_guide',
      title: '도리도리 운동 따라 하기',
      subtitle: '하루 세 번 3분이면 충분해요',
      track: 'both',
      monthMin: null,
      monthMax: null,
      readingMinutes: 4,
      locale: 'ko',
    })
    expect(card.excerpt).toBe(exerciseContent.summary)
  })

  it('uses the hero asset url when there is no thumbnail', () => {
    const card = toLabArticleCard(headShapeLabCards[0], { collection: 'head_shape_lab', locale: 'ko' })
    expect(card.heroImage).toContain(`/contents/${exerciseContent.id}/revisions/${exerciseContent.revisionId}/assets/`)
  })

  it('prefers the thumbnail url and reads the month placement', () => {
    const card = toLabArticleCard(monthlyCards[0], { collection: 'home_monthly_information', locale: 'ko' })
    expect(card).toMatchObject({
      category: 'monthly',
      track: 'torticollis',
      monthMin: 13,
      monthMax: null,
      heroImage: 'https://cdn.barodori.com/lab/monthly-13.png',
      title: '13개월 이후의 목 관찰',
      subtitle: '걷기 시작한 뒤에 볼 것',
    })
  })

  it('falls back to the subtitle when there is no summary', () => {
    const card = toLabArticleCard(monthlyCards[0], { collection: 'home_monthly_information', locale: 'ko' })
    expect(card.excerpt).toBe('걷기 시작한 뒤에 볼 것')
  })
})

describe('toLabArticle', () => {
  it('keeps the render document and the asset manifest for a markdown article', () => {
    const article = toLabArticle(exerciseContent, { collection: 'head_shape_lab', locale: 'ko' })
    expect(article.document).toHaveLength(3)
    expect(article.assets).toHaveLength(2)
    expect(article.category).toBe('exercise-guide')
  })

  it('converts a v1 blocks article to a markdown document', () => {
    const article = toLabArticle(legacyBlocksContent, { collection: 'head_shape_lab', locale: 'ko' })
    expect(article.document).toEqual([
      { type: 'markdown', markdown: '## 정의\n\n머리 뒤쪽 한 곳이 납작해진 상태를 말합니다.' },
    ])
    expect(article.assets).toEqual([])
  })

  it('picks the head shape lab placement when an article sits in both collections', () => {
    const both = {
      ...faqContent,
      placements: [
        { collection: 'home_monthly_information' as const, order: 0, monthMin: 2, monthMax: 3 },
        { collection: 'head_shape_lab' as const, order: 1, monthMin: null, monthMax: null },
      ],
    }
    expect(toLabArticle(both, { collection: null, locale: 'ko' }).category).toBe('faq')
  })

  it('reads the monthly placement when that collection is requested', () => {
    const article = toLabArticle(monthlyContent, { collection: 'home_monthly_information', locale: 'ko' })
    expect(article.monthMin).toBe(13)
    expect(article.monthMax).toBeNull()
  })
})
```

명령: `npx vitest run lib/content/labArticle.test.ts`
기대 결과: `lib/content/labArticle.ts`가 없어 모듈 해석에 실패한다.

- [ ] **Step 2: 도메인 모델을 구현한다**

`lib/content/labArticle.ts`:

```ts
import {
  labAssetUrl,
  type LabAsset,
  type LabBlock,
  type LabCard,
  type LabCollection,
  type LabContent,
  type LabKind,
  type LabPlacement,
  type LabRenderNode,
  type LabTrack,
} from '@/lib/api/knowledgeLab'
import type { ArticleCategory } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export type ArticleTrack = LabTrack | 'both'

export type LabArticleCard = {
  id: string
  revisionId: string
  category: ArticleCategory
  kind: LabKind
  title: string
  subtitle: string | null
  excerpt: string
  heroImage: string | null
  track: ArticleTrack
  monthMin: number | null
  monthMax: number | null
  publishedAt: string
  readingMinutes: number
  locale: Locale
}

export type LabArticle = LabArticleCard & {
  document: LabRenderNode[]
  assets: LabAsset[]
}

export type MonthLabels = {
  monthRange: string
  monthRangeSpan: string
  monthPlus: string
}

const EXCERPT_MAX_LENGTH = 120
const CHARACTERS_PER_MINUTE = 500

// "본제목(부제: 부제)" 형태에서 마지막 괄호를 부제로 본다. 괄호 안 라벨은 있어도 되고 없어도 된다.
const TITLE_SUBTITLE_PATTERN = /^(.*\S)\s*\(\s*(?:부제\s*[:：]\s*)?([^()]*)\)\s*$/

export function splitTitle(raw: string): { title: string; subtitle: string | null } {
  const trimmed = raw.trim()
  const matched = TITLE_SUBTITLE_PATTERN.exec(trimmed)
  if (!matched) return { title: trimmed, subtitle: null }
  const subtitle = matched[2].trim()
  return { title: matched[1].trim(), subtitle: subtitle.length > 0 ? subtitle : null }
}

export function resolveCategory(collection: LabCollection, kind: LabKind): ArticleCategory {
  if (collection === 'home_monthly_information') return 'monthly'
  if (kind === 'exercise_guide') return 'exercise-guide'
  if (kind === 'disease_info') return 'disease-info'
  return 'faq'
}

export function resolveTrack(targetTracks: LabTrack[]): ArticleTrack {
  if (targetTracks.length === 1) return targetTracks[0]
  return 'both'
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s+)?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function firstParagraph(document: LabRenderNode[]): string {
  for (const node of document) {
    if (node.type !== 'markdown') continue
    for (const chunk of node.markdown.split(/\n{2,}/)) {
      const text = stripMarkdown(chunk)
      if (text.length > 0) return text
    }
  }
  return ''
}

export function truncate(text: string, max = EXCERPT_MAX_LENGTH): string {
  return text.length <= max ? text : `${text.slice(0, max)}...`
}

export function resolveExcerpt(input: {
  summary: string | null
  subtitle: string | null
  document: LabRenderNode[]
}): string {
  const summary = input.summary?.trim()
  if (summary) return summary
  const subtitle = input.subtitle?.trim()
  if (subtitle) return subtitle
  return truncate(firstParagraph(input.document))
}

export function estimateReadingMinutes(input: { durationSeconds: number | null; text: string }): number {
  if (input.durationSeconds && input.durationSeconds > 0) {
    return Math.max(1, Math.ceil(input.durationSeconds / 60))
  }
  const compactLength = input.text.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(compactLength / CHARACTERS_PER_MINUTE))
}

export function documentText(document: LabRenderNode[]): string {
  const parts: string[] = []
  const walk = (nodes: LabRenderNode[]) => {
    for (const node of nodes) {
      if (node.type === 'markdown') {
        parts.push(stripMarkdown(node.markdown))
        continue
      }
      if (node.type === 'disclosure') parts.push(node.title)
      walk(node.children)
    }
  }
  walk(document)
  return parts.join('\n')
}

export function blocksToDocument(blocks: LabBlock[]): LabRenderNode[] {
  const markdown = blocks
    .map((block) => {
      const text = block.text.trim()
      if (text.length === 0) return ''
      return block.type === 'heading' ? `## ${text}` : text
    })
    .filter((part) => part.length > 0)
    .join('\n\n')
  return markdown.length > 0 ? [{ type: 'markdown', markdown }] : []
}

export function toDocument(content: LabContent): LabRenderNode[] {
  return content.schemaVersion === 2 ? content.renderDocument : blocksToDocument(content.blocks)
}

export function monthLabel(labels: MonthLabels, monthMin: number | null, monthMax: number | null): string | null {
  if (monthMin === null) return null
  if (monthMax === null) return labels.monthPlus
  if (monthMax === monthMin) return labels.monthRange.replace('{min}', String(monthMin))
  return labels.monthRangeSpan.replace('{min}', String(monthMin)).replace('{max}', String(monthMax))
}

export function formatPublishedDate(publishedAt: string): string {
  return publishedAt.slice(0, 10)
}

/**
 * 요청한 컬렉션의 배치를 고른다. 컬렉션을 지정하지 않으면(상세 페이지) 두상연구소 배치를 먼저 본다.
 * 한 콘텐츠는 배치를 최대 두 개 가진다.
 */
export function placementFor(
  placements: LabPlacement[],
  collection: LabCollection | null,
): LabPlacement | null {
  if (collection) return placements.find((placement) => placement.collection === collection) ?? null
  return (
    placements.find((placement) => placement.collection === 'head_shape_lab') ??
    placements[0] ??
    null
  )
}

type MapOptions = {
  collection: LabCollection | null
  locale: Locale
}

export function toLabArticleCard(card: LabCard, options: MapOptions): LabArticleCard {
  const placement = placementFor(card.placements, options.collection)
  const collection = placement?.collection ?? 'head_shape_lab'
  const { title, subtitle } = splitTitle(card.title)
  const heroImage =
    card.thumbnailUrl ??
    (card.heroAsset
      ? labAssetUrl({
          contentId: card.id,
          revisionId: card.revisionId,
          assetVersionId: card.heroAsset.assetVersionId,
          locale: options.locale,
        })
      : null)

  return {
    id: card.id,
    revisionId: card.revisionId,
    category: resolveCategory(collection, card.kind),
    kind: card.kind,
    title,
    subtitle,
    excerpt: resolveExcerpt({ summary: card.summary, subtitle, document: [] }),
    heroImage: heroImage && heroImage.length > 0 ? heroImage : null,
    track: resolveTrack(card.targetTracks),
    monthMin: placement?.monthMin ?? null,
    monthMax: placement?.monthMax ?? null,
    publishedAt: card.publishedAt,
    readingMinutes: estimateReadingMinutes({
      durationSeconds: card.durationSeconds,
      text: `${card.title} ${card.summary ?? ''}`,
    }),
    locale: options.locale,
  }
}

export function toLabArticle(content: LabContent, options: MapOptions): LabArticle {
  const placement = placementFor(content.placements, options.collection)
  const collection = placement?.collection ?? 'head_shape_lab'
  const { title, subtitle } = splitTitle(content.title)
  const document = toDocument(content)
  const assets = content.schemaVersion === 2 ? content.markdownAssets : []
  const firstImage = assets.find((asset) => asset.role === 'image')
  const heroImage =
    content.thumbnailUrl ??
    (firstImage
      ? labAssetUrl({
          contentId: content.id,
          revisionId: content.revisionId,
          assetVersionId: firstImage.assetVersionId,
          locale: options.locale,
        })
      : null)

  return {
    id: content.id,
    revisionId: content.revisionId,
    category: resolveCategory(collection, content.kind),
    kind: content.kind,
    title,
    subtitle,
    excerpt: resolveExcerpt({ summary: content.summary, subtitle, document }),
    heroImage: heroImage && heroImage.length > 0 ? heroImage : null,
    track: resolveTrack(content.targetTracks),
    monthMin: placement?.monthMin ?? null,
    monthMax: placement?.monthMax ?? null,
    publishedAt: content.publishedAt,
    readingMinutes: estimateReadingMinutes({
      durationSeconds: content.durationSeconds,
      text: `${content.summary ?? ''}\n${documentText(document)}`,
    }),
    locale: options.locale,
    document,
    assets,
  }
}

/** 목록 카드에서 검색어를 거른다. 본제목, 부제, 요약을 본다. */
export function matchesQuery(card: LabArticleCard, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (normalized.length === 0) return true
  return `${card.title} ${card.subtitle ?? ''} ${card.excerpt}`.toLowerCase().includes(normalized)
}
```

- [ ] **Step 3: 테스트를 통과시킨다**

명령: `npx vitest run lib/content/labArticle.test.ts`
기대 결과: 위 테스트 전부 통과. `toLabArticleCard`가 자산 URL을 만들려면 `BARODORI_API_BASE_URL`이 있어야 하므로, 자산 URL을 보는 두 테스트는 `vitest.setup.ts`가 아니라 테스트 파일 안에서 환경 변수를 세팅한다. 실패하면 테스트 파일 맨 위에 다음을 넣는다.

```ts
import { beforeAll } from 'vitest'

beforeAll(() => {
  process.env.BARODORI_API_BASE_URL = 'https://api.test'
})
```

명령: `npm run typecheck`
기대 결과: 에러 없음.

- [ ] **Step 4: 커밋한다**

```
git add lib/content/labArticle.ts lib/content/labArticle.test.ts
git commit -m "$(cat <<'EOF'
feat: Knowledge Lab 응답을 아티클 도메인 모델로 옮기는 매핑을 추가한다

제목 분리, 분류와 트랙 판정, 요약 규칙, 개월 라벨, 읽는 시간 추정,
v1 블록의 마크다운 변환을 한곳에 둔다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 5: 본문 렌더러 `LabDocument`

설계 8절이다. `react-markdown`은 아직 설치되어 있지 않고, `remark-gfm@4.0.1`과 `rehype-slug@6.0.0`은 이미 `package.json`에 있다. `github-slugger@2.0.0`은 `rehype-slug`의 의존성으로만 들어와 있으므로 Task 6에서 직접 쓰기 위해 직접 의존성으로 올린다.

`next-mdx-remote`는 MDX 문법으로 해석해 중괄호나 꺾쇠에서 깨질 수 있으므로 이 본문에는 쓰지 않는다. `rehype-raw`도 쓰지 않는다. 백엔드가 인라인 HTML을 이미 노드로 바꾸어 내리므로 남는 HTML은 없어야 하고, 남는지는 Task 14의 실측으로 확인한다.

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `components/article/LabCallout.tsx`
- Create: `components/article/LabDocument.tsx`
- Create: `components/article/LabDocument.test.tsx`

- [ ] **Step 1: 의존성을 설치한다**

명령: `npm install react-markdown github-slugger`
기대 결과: `package.json`의 `dependencies`에 `react-markdown`(10.x)과 `github-slugger`(2.x)가 들어간다.

- [ ] **Step 2: 실패하는 테스트를 쓴다**

`components/article/LabDocument.test.tsx`:

```tsx
import { beforeAll, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  EXERCISE_ATTACHMENT_ASSET_ID,
  EXERCISE_CONTENT_ID,
  EXERCISE_IMAGE_ASSET_ID,
  EXERCISE_REVISION_ID,
  exerciseContent,
} from '@/lib/api/__fixtures__/knowledgeLab'
import { LabDocument, isFeatureLinkText } from './LabDocument'

beforeAll(() => {
  process.env.BARODORI_API_BASE_URL = 'https://api.test'
})

const labels = { attachment: '첨부 파일', featureLink: '앱에서 이어서 하기' }

function renderExercise() {
  const assets = exerciseContent.schemaVersion === 2 ? exerciseContent.markdownAssets : []
  const document = exerciseContent.schemaVersion === 2 ? exerciseContent.renderDocument : []
  return render(
    <LabDocument
      document={document}
      assets={assets}
      contentId={EXERCISE_CONTENT_ID}
      revisionId={EXERCISE_REVISION_ID}
      locale="ko"
      title="도리도리 운동 따라 하기"
      labels={labels}
    />,
  )
}

describe('isFeatureLinkText', () => {
  it('accepts the app feature endings', () => {
    expect(isFeatureLinkText('기록하기')).toBe(true)
    expect(isFeatureLinkText('두상 리포트 보기')).toBe(true)
    expect(isFeatureLinkText('운동 시작하기')).toBe(true)
  })

  it('rejects medical terms', () => {
    expect(isFeatureLinkText('사경')).toBe(false)
    expect(isFeatureLinkText('사두증')).toBe(false)
  })
})

describe('LabDocument', () => {
  it('renders the three node kinds', () => {
    renderExercise()
    expect(screen.getByText('아기가 울면 바로 멈추고 다음 기회에 다시 합니다.')).toBeInTheDocument()
    expect(screen.getByText('자주 하는 실수')).toBeInTheDocument()
    expect(screen.getByRole('note')).toBeInTheDocument()
    expect(screen.getByText('준비물')).toBeInTheDocument()
  })

  it('lifts a level one heading to level two so the page keeps a single h1', () => {
    renderExercise()
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: '도리도리 운동 따라 하기' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '준비물' })).toBeInTheDocument()
  })

  it('rewrites a lab-asset image to the backend asset url', () => {
    renderExercise()
    const image = screen.getByAltText('엎드려 놀기 자세')
    expect(image).toHaveAttribute(
      'src',
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}` +
        `/revisions/${EXERCISE_REVISION_ID}/assets/${EXERCISE_IMAGE_ASSET_ID}?market=KR&locale=ko`,
    )
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it('renders an attachment link with its file name', () => {
    renderExercise()
    const link = screen.getByRole('link', { name: /운동 기록지 PDF/ })
    expect(link).toHaveAttribute(
      'href',
      `https://api.test/api/v2/knowledge-lab/web/contents/${EXERCISE_CONTENT_ID}` +
        `/revisions/${EXERCISE_REVISION_ID}/assets/${EXERCISE_ATTACHMENT_ASSET_ID}?market=KR&locale=ko`,
    )
    expect(link).toHaveTextContent('운동 기록지.pdf')
    expect(link).toHaveTextContent('첨부 파일')
  })

  it('opens an external https link in a new tab', () => {
    renderExercise()
    const link = screen.getByRole('link', { name: '질병관리청 안내' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('turns a feature inline code into an install link and leaves a medical term as code', () => {
    renderExercise()
    const button = screen.getByRole('link', { name: /기록하기/ })
    expect(button).toHaveAttribute('href', '/ko/install')
    expect(button).toHaveTextContent('앱에서 이어서 하기')
    expect(screen.getByText('사경', { selector: 'code' })).toBeInTheDocument()
  })

  it('renders a gfm table', () => {
    renderExercise()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '준비물' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '놀이매트' })).toBeInTheDocument()
  })

  it('falls back to the article title when the image alt is empty', () => {
    render(
      <LabDocument
        document={[{ type: 'markdown', markdown: `![](lab-asset:${EXERCISE_IMAGE_ASSET_ID})` }]}
        assets={[]}
        contentId={EXERCISE_CONTENT_ID}
        revisionId={EXERCISE_REVISION_ID}
        locale="ko"
        title="대체 텍스트 없는 글"
        labels={labels}
      />,
    )
    expect(screen.getByAltText('대체 텍스트 없는 글')).toBeInTheDocument()
  })
})
```

명령: `npx vitest run components/article/LabDocument.test.tsx`
기대 결과: `./LabDocument`가 없어 모듈 해석에 실패한다.

- [ ] **Step 3: 콜아웃 컴포넌트를 만든다**

`components/article/LabCallout.tsx`. 기존 `components/article/mdx/Callout.tsx`의 `info` 변형과 같은 시각 언어를 쓰고 아이콘만 앞에 둔다.

```tsx
import type { ReactNode } from 'react'

export function LabCallout({ icon, children }: { icon: string | null; children: ReactNode }) {
  return (
    <aside
      role="note"
      className="my-6 flex gap-3 rounded-md border-l-4 border-[var(--color-primary)] bg-[var(--color-primary-light)] p-4 text-[var(--color-text-primary)]"
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0 text-lg leading-7">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </aside>
  )
}
```

- [ ] **Step 4: 렌더러를 구현한다**

`components/article/LabDocument.tsx`:

```tsx
import type { ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { LabCallout } from '@/components/article/LabCallout'
import { labAssetUrl, type LabAsset, type LabRenderNode } from '@/lib/api/knowledgeLab'
import type { Locale } from '@/lib/i18n/config'

export type LabDocumentLabels = {
  attachment: string
  featureLink: string
}

type LabDocumentProps = {
  document: LabRenderNode[]
  assets: LabAsset[]
  contentId: string
  revisionId: string
  locale: Locale
  title: string
  labels: LabDocumentLabels
}

const LAB_ASSET_SCHEME = 'lab-asset:'

/**
 * 앱 기능 버튼 후보를 가려내는 어미 목록이다. 사용자에게 보이는 카피가 아니라 원고 인라인 코드를
 * 분류하는 판별 토큰이므로 사전에 두지 않는다.
 */
const FEATURE_LINK_SUFFIXES = [
  '시작하기', // i18n:allow-hardcoded-copy
  '하러가기', // i18n:allow-hardcoded-copy
  '알아보기', // i18n:allow-hardcoded-copy
  '찾아보기', // i18n:allow-hardcoded-copy
  '찾기', // i18n:allow-hardcoded-copy
  '보기', // i18n:allow-hardcoded-copy
  '세팅하기', // i18n:allow-hardcoded-copy
  '기록하기', // i18n:allow-hardcoded-copy
]

export function isFeatureLinkText(text: string): boolean {
  const trimmed = text.trim()
  return FEATURE_LINK_SUFFIXES.some((suffix) => trimmed.endsWith(suffix))
}

function labAssetIdFrom(value: string | undefined): string | null {
  if (!value || !value.startsWith(LAB_ASSET_SCHEME)) return null
  const id = value.slice(LAB_ASSET_SCHEME.length).trim()
  return id.length > 0 ? id : null
}

function toPlainText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(toPlainText).join('')
  return ''
}

function buildComponents(props: LabDocumentProps): Components {
  const { assets, contentId, revisionId, locale, title, labels } = props

  const assetHref = (assetVersionId: string) =>
    labAssetUrl({ contentId, revisionId, assetVersionId, locale })

  return {
    // 상세 페이지의 h1은 본제목 하나뿐이므로 본문의 #는 ##로 올린다.
    h1: ({ children, ...rest }) => (
      <h2 {...rest} className="mt-12 mb-3 text-2xl font-bold tracking-tight">
        {children}
      </h2>
    ),
    h2: ({ children, ...rest }) => (
      <h2 {...rest} className="mt-12 mb-3 text-2xl font-bold tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children, ...rest }) => (
      <h3 {...rest} className="mt-8 mb-2 text-lg font-semibold tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children, ...rest }) => (
      <h4 {...rest} className="mt-6 mb-2 text-base font-semibold">
        {children}
      </h4>
    ),
    p: ({ children }) => <p className="my-5 leading-[1.9] text-[var(--color-text-primary)]">{children}</p>,
    ul: ({ children }) => (
      <ul className="my-5 ml-5 list-disc space-y-1.5 leading-[1.85] marker:text-[var(--color-primary)]">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-5 ml-5 list-decimal space-y-1.5 leading-[1.85] marker:text-[var(--color-text-secondary)]">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-[var(--color-border)] pl-4 text-[var(--color-text-secondary)]">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-[var(--color-border)]" />,
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="border border-[var(--color-border)] px-3 py-2 align-top">{children}</td>,
    img: ({ src, alt }) => {
      const raw = typeof src === 'string' ? src : undefined
      const assetId = labAssetIdFrom(raw)
      const resolved = assetId ? assetHref(assetId) : (raw ?? '')
      if (!resolved) return null
      return (
        // 앱 자산의 크기를 알 수 없어 next/image의 고정 폭 방식을 쓰지 않는다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt && alt.trim().length > 0 ? alt : title}
          loading="lazy"
          className="my-6 block h-auto w-full rounded-lg border border-[var(--color-border)]"
        />
      )
    },
    a: ({ href, children }) => {
      const assetId = labAssetIdFrom(href)
      if (assetId) {
        const asset = assets.find((item) => item.assetVersionId === assetId)
        return (
          <a
            href={assetHref(assetId)}
            className="my-4 inline-flex flex-wrap items-center gap-2 rounded-[8px] border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            <span>{children}</span>
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">
              {asset ? `${labels.attachment}, ${asset.filename}` : labels.attachment}
            </span>
          </a>
        )
      }
      if (href?.startsWith('https://')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-primary-dark)] underline"
          >
            {children}
          </a>
        )
      }
      return (
        <a href={href} className="font-medium text-[var(--color-primary-dark)] underline">
          {children}
        </a>
      )
    },
    // react-markdown 10에는 inline 플래그가 없다. 펜스 코드 블록만 className을 받으므로
    // pre를 풀고 code에서 갈라 쓴다. 언어 표시가 없는 펜스 블록은 인라인으로 취급된다.
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      if (className) {
        return (
          <pre className="my-6 overflow-x-auto rounded-lg bg-[var(--color-bg-muted)] p-4 text-sm">
            <code className={className}>{children}</code>
          </pre>
        )
      }
      const text = toPlainText(children)
      if (isFeatureLinkText(text)) {
        return (
          <TrackedLink
            href={`/${locale}/install`}
            event="cta_install_click"
            eventProps={{ surface: 'article_feature_link', contentId, locale, live: true }}
            className="mx-0.5 inline-flex items-center gap-2 rounded-[8px] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-bold text-[var(--color-text-primary)]"
          >
            <span>{text}</span>
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">{labels.featureLink}</span>
          </TrackedLink>
        )
      }
      return (
        <code className="rounded bg-[var(--color-bg-muted)] px-1.5 py-0.5 text-[0.95em]">{children}</code>
      )
    },
  }
}

function renderNodes(nodes: LabRenderNode[], props: LabDocumentProps, keyPrefix: string): ReactNode[] {
  const components = buildComponents(props)
  return nodes.map((node, index) => {
    const key = `${keyPrefix}${node.type}-${index}`
    if (node.type === 'markdown') {
      return (
        <ReactMarkdown
          key={key}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={components}
        >
          {node.markdown}
        </ReactMarkdown>
      )
    }
    if (node.type === 'callout') {
      return (
        <LabCallout key={key} icon={node.icon}>
          {renderNodes(node.children, props, `${key}-`)}
        </LabCallout>
      )
    }
    return (
      <details key={key} className="my-6 rounded-lg border border-[var(--color-border)] px-4 py-3">
        <summary className="cursor-pointer font-semibold">{node.title}</summary>
        <div className="mt-2">{renderNodes(node.children, props, `${key}-`)}</div>
      </details>
    )
  })
}

export function LabDocument(props: LabDocumentProps) {
  return <div className="text-[15px] sm:text-base">{renderNodes(props.document, props, '')}</div>
}
```

첨부 링크에 `download` 속성은 붙이지 않는다. 다른 출처의 URL에서는 브라우저가 무시하고, 백엔드가 `Content-Disposition: attachment`를 내려 주므로 그쪽이 실제 동작을 결정한다.

- [ ] **Step 5: 테스트를 통과시킨다**

명령: `npx vitest run components/article/LabDocument.test.tsx`
기대 결과: 10개 테스트 통과.

명령: `npm run lint`
기대 결과: 에러 없음. `no-img-element` 경고가 남으면 해당 줄의 `eslint-disable-next-line` 위치를 JSX 바로 앞으로 옮긴다.

- [ ] **Step 6: 커밋한다**

```
git add package.json package-lock.json components/article/LabCallout.tsx components/article/LabDocument.tsx components/article/LabDocument.test.tsx
git commit -m "$(cat <<'EOF'
feat: Knowledge Lab 렌더 문서를 그리는 LabDocument를 추가한다

마크다운 조각은 react-markdown과 remark-gfm, rehype-slug로 그리고
콜아웃과 접기는 전용 컴포넌트로 그린다. lab-asset 이미지와 첨부는
백엔드 자산 URL로 바꾸고, 기능 어미로 끝나는 인라인 코드는 설치
페이지로 가는 버튼이 된다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 6: 목차 `Toc`를 렌더 문서 기준으로 다시 쓴다

설계 7.2절이다. 지금 `Toc`는 MDX 원문 문자열을 정규식으로 훑고 자체 `slugify`를 쓴다. 새 본문은 렌더 문서이고 id는 `rehype-slug`가 붙이므로, 목차도 같은 `github-slugger`로 id를 만들어야 링크가 맞는다. `rehype-slug`는 `ReactMarkdown` 실행마다 새 슬러거를 쓰므로 목차도 마크다운 노드마다 새 슬러거를 만든다. 중복 제목에 붙는 번호가 그래야 일치한다.

**Files:**
- Modify: `components/article/Toc.tsx`
- Create: `components/article/Toc.test.tsx`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`components/article/Toc.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { LabRenderNode } from '@/lib/api/knowledgeLab'
import { Toc, collectHeadings } from './Toc'

const labels = { tocTitle: '목차' }

describe('collectHeadings', () => {
  it('collects level two and three headings in document order', () => {
    const document: LabRenderNode[] = [
      { type: 'markdown', markdown: '# 큰 제목\n\n본문\n\n## 준비물\n\n### 수건\n\n#### 너무 깊은 제목' },
    ]
    expect(collectHeadings(document)).toEqual([
      { level: 2, text: '큰 제목', id: '큰-제목' },
      { level: 2, text: '준비물', id: '준비물' },
      { level: 3, text: '수건', id: '수건' },
    ])
  })

  it('skips headings inside a disclosure node', () => {
    const document: LabRenderNode[] = [
      { type: 'markdown', markdown: '## 겉 제목' },
      { type: 'disclosure', title: '접기', children: [{ type: 'markdown', markdown: '## 접힌 제목' }] },
    ]
    expect(collectHeadings(document).map((heading) => heading.text)).toEqual(['겉 제목'])
  })

  it('collects headings inside a callout node', () => {
    const document: LabRenderNode[] = [
      { type: 'callout', icon: null, children: [{ type: 'markdown', markdown: '## 콜아웃 제목' }] },
    ]
    expect(collectHeadings(document).map((heading) => heading.text)).toEqual(['콜아웃 제목'])
  })

  it('ignores hash lines inside a fenced code block', () => {
    const document: LabRenderNode[] = [
      { type: 'markdown', markdown: '## 진짜 제목\n\n```bash\n## 주석입니다\n```' },
    ]
    expect(collectHeadings(document).map((heading) => heading.text)).toEqual(['진짜 제목'])
  })

  it('strips inline markdown from the heading text', () => {
    const document: LabRenderNode[] = [{ type: 'markdown', markdown: '## **굵은** 제목' }]
    expect(collectHeadings(document)[0]).toEqual({ level: 2, text: '굵은 제목', id: '굵은-제목' })
  })

  it('numbers duplicate headings the same way rehype-slug does inside one markdown node', () => {
    const document: LabRenderNode[] = [{ type: 'markdown', markdown: '## 순서\n\n## 순서' }]
    expect(collectHeadings(document).map((heading) => heading.id)).toEqual(['순서', '순서-1'])
  })
})

describe('Toc', () => {
  it('renders nothing when there are fewer than two headings', () => {
    const { container } = render(<Toc document={[{ type: 'markdown', markdown: '## 하나뿐' }]} labels={labels} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders anchors for every heading', () => {
    render(
      <Toc document={[{ type: 'markdown', markdown: '## 준비물\n\n### 수건' }]} labels={labels} />,
    )
    expect(screen.getByRole('navigation', { name: '목차' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '준비물' })).toHaveAttribute('href', '#준비물')
    expect(screen.getByRole('link', { name: '수건' })).toHaveAttribute('href', '#수건')
  })
})
```

명령: `npx vitest run components/article/Toc.test.tsx`
기대 결과: `collectHeadings` export가 없어 실패한다.

- [ ] **Step 2: `Toc`를 다시 쓴다**

`components/article/Toc.tsx` 전체를 바꾼다.

```tsx
import GithubSlugger from 'github-slugger'
import type { LabRenderNode } from '@/lib/api/knowledgeLab'
import { stripMarkdown } from '@/lib/content/labArticle'

export type TocHeading = {
  level: 2 | 3
  text: string
  id: string
}

const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/
const FENCE_PATTERN = /^(```|~~~)/

/**
 * 렌더 문서에서 목차 항목을 모은다. 접기 노드 안의 제목은 넣지 않는다.
 * id는 본문과 같은 github-slugger 규칙으로 만들고, rehype-slug가 ReactMarkdown 실행마다
 * 새 슬러거를 쓰므로 마크다운 노드마다 슬러거를 새로 만든다.
 */
export function collectHeadings(document: LabRenderNode[]): TocHeading[] {
  const headings: TocHeading[] = []

  const walk = (nodes: LabRenderNode[]) => {
    for (const node of nodes) {
      if (node.type === 'disclosure') continue
      if (node.type === 'callout') {
        walk(node.children)
        continue
      }

      const slugger = new GithubSlugger()
      let insideFence = false
      for (const rawLine of node.markdown.split('\n')) {
        const line = rawLine.trim()
        if (FENCE_PATTERN.test(line)) {
          insideFence = !insideFence
          continue
        }
        if (insideFence) continue

        const matched = HEADING_PATTERN.exec(line)
        if (!matched) continue
        const text = stripMarkdown(matched[2])
        if (text.length === 0) continue

        // 모든 제목을 슬러거에 통과시켜야 중복 번호가 본문과 같아진다.
        const id = slugger.slug(text)
        // 렌더러가 #를 ##로 올리므로 목차도 같은 단계로 본다.
        const level = matched[1].length === 1 ? 2 : matched[1].length
        if (level !== 2 && level !== 3) continue
        headings.push({ level, text, id })
      }
    }
  }

  walk(document)
  return headings
}

export function Toc({
  document,
  labels,
}: {
  document: LabRenderNode[]
  labels: { tocTitle: string }
}) {
  const headings = collectHeadings(document)
  if (headings.length < 2) return null

  return (
    <nav aria-label={labels.tocTitle} className="mb-8 rounded-lg bg-[var(--color-bg-muted)] p-4 text-sm">
      <p className="font-semibold">{labels.tocTitle}</p>
      <ul className="mt-2 space-y-1">
        {headings.map((heading) => (
          <li key={`${heading.level}-${heading.id}`} className={heading.level === 3 ? 'ml-4' : ''}>
            <a
              href={`#${heading.id}`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

`Toc`가 옛 `markdown` prop을 받지 않게 되므로 옛 상세 페이지 `app/[locale]/(site)/articles/[slug]/page.tsx`가 타입 에러를 낸다. 같은 커밋에서 그 페이지의 `<Toc markdown={article.body} />` 줄을 지운다. 그 페이지는 Task 9에서 통째로 삭제되므로 목차가 잠시 빠지는 것은 문제가 되지 않는다.

- [ ] **Step 3: 테스트를 통과시킨다**

명령: `npx vitest run components/article/Toc.test.tsx`
기대 결과: 8개 테스트 통과. `github-slugger`가 한글 제목을 그대로 두고 공백만 하이픈으로 바꾸는지 기대값과 다르면, 기대값을 실제 출력으로 맞추고 본문과 목차가 같은 규칙을 쓴다는 점만 지킨다.

명령: `npm run typecheck`
기대 결과: 에러 없음.

- [ ] **Step 4: 커밋한다**

```
git add components/article/Toc.tsx components/article/Toc.test.tsx "app/[locale]/(site)/articles/[slug]/page.tsx"
git commit -m "$(cat <<'EOF'
refactor: 목차를 렌더 문서와 github-slugger 기준으로 다시 만든다

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 7: 목록 조각 컴포넌트

설계 7.1절의 카드와 월령별 목록, 분류 필터다. 옛 `ArticleCard`는 아직 옛 목록 페이지가 쓰므로 남겨 두고 새 이름으로 만든다. 옛 파일은 Task 9에서 지운다.

**Files:**
- Create: `components/article/LabArticleCard.tsx`
- Create: `components/article/LabArticleCard.test.tsx`
- Create: `components/article/MonthlyTrackList.tsx`
- Create: `components/article/MonthlyTrackList.test.tsx`
- Modify: `components/article/CategoryFilter.tsx`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`components/article/LabArticleCard.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'
import { LabArticleCard } from './LabArticleCard'

const card: LabArticleCardModel = {
  id: '11111111-1111-4111-8111-111111111111',
  revisionId: '11111111-2222-4222-8222-222222222222',
  category: 'exercise-guide',
  kind: 'exercise_guide',
  title: '도리도리 운동 따라 하기',
  subtitle: '하루 세 번 3분이면 충분해요',
  excerpt: '아기가 편안할 때 하루 세 번 목을 부드럽게 돌려 주는 방법이에요.',
  heroImage: 'https://api.test/asset.png',
  track: 'both',
  monthMin: null,
  monthMax: null,
  publishedAt: '2026-09-11T02:00:00Z',
  readingMinutes: 4,
  locale: 'ko',
}

describe('LabArticleCard', () => {
  it('links to the detail page by content id', () => {
    render(<LabArticleCard card={card} readingTimeLabel="{minutes}분 읽기" />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/ko/articles/11111111-1111-4111-8111-111111111111',
    )
  })

  it('shows the category badge, the main title and the excerpt', () => {
    render(<LabArticleCard card={card} readingTimeLabel="{minutes}분 읽기" />)
    expect(screen.getByText('운동 가이드')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '도리도리 운동 따라 하기' })).toBeInTheDocument()
    expect(screen.getByText(card.excerpt)).toBeInTheDocument()
  })

  it('joins the date and the reading time with a comma and no middle dot', () => {
    render(<LabArticleCard card={card} readingTimeLabel="{minutes}분 읽기" />)
    const meta = screen.getByText('2026-09-11, 4분 읽기')
    expect(meta).toBeInTheDocument()
    expect(meta.textContent).not.toContain('·')
  })

  it('renders a tinted placeholder instead of an image when there is no hero image', () => {
    const { container } = render(
      <LabArticleCard card={{ ...card, heroImage: null }} readingTimeLabel="{minutes}분 읽기" />,
    )
    expect(container.querySelector('img')).toBeNull()
  })
})
```

`components/article/MonthlyTrackList.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'
import { MonthlyTrackList } from './MonthlyTrackList'

const labels = {
  trackTorticollis: '근성 및 자세성 사경',
  trackHeadShape: '단순 두상',
  monthRange: '{min}개월',
  monthRangeSpan: '{min}개월부터 {max}개월',
  monthPlus: '13개월 이상',
}

function card(overrides: Partial<LabArticleCardModel>): LabArticleCardModel {
  return {
    id: 'id-1',
    revisionId: 'rev-1',
    category: 'monthly',
    kind: 'disease_info',
    title: '제목',
    subtitle: null,
    excerpt: '요약',
    heroImage: null,
    track: 'torticollis',
    monthMin: 1,
    monthMax: 1,
    publishedAt: '2026-08-01T00:00:00Z',
    readingMinutes: 1,
    locale: 'ko',
    ...overrides,
  }
}

describe('MonthlyTrackList', () => {
  it('renders only the groups that have articles', () => {
    render(<MonthlyTrackList cards={[card({})]} labels={labels} />)
    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent)
    expect(headings).toEqual(['근성 및 자세성 사경'])
  })

  it('puts the torticollis group before the head shape group', () => {
    render(<MonthlyTrackList cards={[card({ id: 'both-1', track: 'both', title: '공통 글' })]} labels={labels} />)
    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent)
    expect(headings).toEqual(['근성 및 자세성 사경', '단순 두상'])
  })

  it('shows an article targeting both tracks in both groups', () => {
    render(<MonthlyTrackList cards={[card({ id: 'both-1', track: 'both', title: '공통 글' })]} labels={labels} />)
    expect(screen.getAllByText('공통 글')).toHaveLength(2)
  })

  it('sorts rows by the starting month', () => {
    render(
      <MonthlyTrackList
        cards={[
          card({ id: 'a', title: '넷째 달', monthMin: 4, monthMax: 4 }),
          card({ id: 'b', title: '첫째 달', monthMin: 1, monthMax: 1 }),
        ]}
        labels={labels}
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(within(rows[0]).getByText('첫째 달')).toBeInTheDocument()
    expect(within(rows[1]).getByText('넷째 달')).toBeInTheDocument()
  })

  it('labels an open ended month range as thirteen months and older', () => {
    render(<MonthlyTrackList cards={[card({ monthMin: 13, monthMax: null })]} labels={labels} />)
    expect(screen.getByText('13개월 이상')).toBeInTheDocument()
  })

  it('labels a month span', () => {
    render(<MonthlyTrackList cards={[card({ monthMin: 4, monthMax: 6 })]} labels={labels} />)
    expect(screen.getByText('4개월부터 6개월')).toBeInTheDocument()
  })

  it('shows the subtitle next to the title', () => {
    render(<MonthlyTrackList cards={[card({ title: '본제목', subtitle: '부제목' })]} labels={labels} />)
    expect(screen.getByText('부제목')).toBeInTheDocument()
  })

  it('renders nothing when there are no cards', () => {
    const { container } = render(<MonthlyTrackList cards={[]} labels={labels} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

명령: `npx vitest run components/article/LabArticleCard.test.tsx components/article/MonthlyTrackList.test.tsx`
기대 결과: 두 모듈이 없어 실패한다.

- [ ] **Step 2: `LabArticleCard`를 만든다**

```tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { articleCategoryLabels, type ArticleCategory } from '@/lib/content/categories'
import { formatPublishedDate, type LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'

// 대표 이미지가 없을 때 이미지 영역에 두는 분류별 옅은 배경이다.
const HERO_FALLBACK_CLASS: Record<ArticleCategory, string> = {
  'exercise-guide': 'bg-[var(--color-primary-light)]',
  'disease-info': 'bg-amber-50',
  faq: 'bg-[var(--color-bg-muted)]',
  monthly: 'bg-sky-50',
}

export function LabArticleCard({
  card,
  readingTimeLabel,
}: {
  card: LabArticleCardModel
  readingTimeLabel: string
}) {
  const meta = `${formatPublishedDate(card.publishedAt)}, ${readingTimeLabel.replace(
    '{minutes}',
    String(card.readingMinutes),
  )}`

  return (
    <Link
      href={`/${card.locale}/articles/${card.id}`}
      className="group block overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white transition hover:shadow-md"
    >
      <div
        className={`relative aspect-[16/9] border-b border-[var(--color-border)] ${HERO_FALLBACK_CLASS[card.category]}`}
      >
        {card.heroImage && (
          // 백엔드 자산은 크기를 알 수 없어 next/image를 쓰지 않는다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.heroImage}
            alt={card.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="p-6">
        <Badge>{articleCategoryLabels[card.category][card.locale]}</Badge>
        <h3 className="mt-4 line-clamp-2 min-h-12 text-lg font-bold leading-snug group-hover:underline">
          {card.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{card.excerpt}</p>
        <p className="mt-5 text-xs text-[var(--color-text-secondary)]">{meta}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: `MonthlyTrackList`를 만든다**

```tsx
import Link from 'next/link'
import { monthLabel, type LabArticleCard as LabArticleCardModel, type MonthLabels } from '@/lib/content/labArticle'

export type MonthlyTrackLabels = MonthLabels & {
  trackTorticollis: string
  trackHeadShape: string
}

type Group = {
  key: 'torticollis' | 'head_shape'
  title: string
  cards: LabArticleCardModel[]
}

function sortByMonth(cards: LabArticleCardModel[]): LabArticleCardModel[] {
  return [...cards].sort((a, b) => {
    const left = a.monthMin ?? Number.MAX_SAFE_INTEGER
    const right = b.monthMin ?? Number.MAX_SAFE_INTEGER
    if (left !== right) return left - right
    return a.title.localeCompare(b.title)
  })
}

export function MonthlyTrackList({
  cards,
  labels,
}: {
  cards: LabArticleCardModel[]
  labels: MonthlyTrackLabels
}) {
  if (cards.length === 0) return null

  const groups: Group[] = [
    {
      key: 'torticollis',
      title: labels.trackTorticollis,
      cards: sortByMonth(cards.filter((card) => card.track === 'torticollis' || card.track === 'both')),
    },
    {
      key: 'head_shape',
      title: labels.trackHeadShape,
      cards: sortByMonth(cards.filter((card) => card.track === 'head_shape' || card.track === 'both')),
    },
  ].filter((group) => group.cards.length > 0)

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="text-lg font-bold">{group.title}</h3>
          <ul className="mt-4 divide-y divide-[var(--color-border)] rounded-[8px] border border-[var(--color-border)] bg-white">
            {group.cards.map((card) => {
              const month = monthLabel(labels, card.monthMin, card.monthMax)
              return (
                <li key={`${group.key}-${card.id}`}>
                  <Link
                    href={`/${card.locale}/articles/${card.id}`}
                    className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    {month && (
                      <span className="shrink-0 rounded-pill bg-[var(--color-bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                        {month}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{card.title}</span>
                      {card.subtitle && (
                        <span className="mt-0.5 block truncate text-sm text-[var(--color-text-secondary)]">
                          {card.subtitle}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: `CategoryFilter`가 새 분류를 읽게 한다**

`components/article/CategoryFilter.tsx`에서 import와 두 곳의 참조만 바꾼다.

```tsx
import {
  allCategoryLabels,
  articleCategories,
  articleCategoryLabels,
  type ArticleCategory,
} from '@/lib/content/categories'
```

`const current = params.get('cat') as ArticleCategory | null`로 바꾸고, `categories.map`을 `articleCategories.map`으로, `categoryLabels[c][locale]`을 `articleCategoryLabels[c][locale]`로 바꾼다. 나머지 마크업은 그대로 둔다.

- [ ] **Step 5: 테스트를 통과시킨다**

명령: `npx vitest run components/article`
기대 결과: `LabArticleCard` 4개, `MonthlyTrackList` 8개, `Toc` 8개, `LabDocument` 10개 모두 통과.

명령: `npm run typecheck`
기대 결과: 에러 없음. 옛 목록 페이지는 여전히 옛 `ArticleCard`를 쓰므로 영향이 없다.

- [ ] **Step 6: 커밋한다**

```
git add components/article/LabArticleCard.tsx components/article/LabArticleCard.test.tsx components/article/MonthlyTrackList.tsx components/article/MonthlyTrackList.test.tsx components/article/CategoryFilter.tsx
git commit -m "$(cat <<'EOF'
feat: 새 분류를 쓰는 아티클 카드와 월령별 트랙 목록을 추가한다

카드 메타의 가운데점 구분자를 쉼표로 바꾸고, 분류 필터는 네 분류를 읽는다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 8: 아티클 목록 페이지 전환

설계 7.1절이다. 두 컬렉션을 병렬로 읽고, 두상연구소는 카드 격자로, 월령별은 트랙별 목록으로 그린다. 페이지네이션 `offset`은 없앤다. 전체가 50여 편이라 한 번에 내려도 된다.

`export const dynamic = 'force-dynamic'`을 지운다. 계획 머리말의 결정대로, 그대로 두면 `fetch` 캐시 옵션이 전부 무시된다. 이 페이지는 `searchParams`를 읽으므로 요청 시점 렌더가 유지된다.

**Files:**
- Modify: `app/[locale]/(site)/articles/page.tsx`

- [ ] **Step 1: 목록 페이지를 다시 쓴다**

`app/[locale]/(site)/articles/page.tsx` 전체를 바꾼다.

```tsx
import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata, TORTICOLLIS_KEYWORDS } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { CategoryFilter } from '@/components/article/CategoryFilter'
import { LabArticleCard } from '@/components/article/LabArticleCard'
import { MonthlyTrackList } from '@/components/article/MonthlyTrackList'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { listLabContents } from '@/lib/api/knowledgeLab'
import { articleCategoryLabels, isArticleCategory, type ArticleCategory } from '@/lib/content/categories'
import { matchesQuery, toLabArticleCard } from '@/lib/content/labArticle'
import type { Locale } from '@/lib/i18n/config'

const RECOMMENDED_COUNT = 3

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.article.listSeo.title,
    description: dict.article.listSeo.description,
    path: `/${locale}/articles`,
    locale,
    keywords: locale === 'ko' ? TORTICOLLIS_KEYWORDS : undefined,
  })
}

export default async function ArticlesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string; q?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const dict = await getDictionary(loc)

  const category: ArticleCategory | undefined = sp.cat && isArticleCategory(sp.cat) ? sp.cat : undefined
  const query = typeof sp.q === 'string' ? sp.q.trim() : ''

  const [labResult, monthlyResult] = await Promise.all([
    listLabContents({ locale: loc, collection: 'head_shape_lab' }),
    listLabContents({ locale: loc, collection: 'home_monthly_information' }),
  ])
  const error = labResult.error ?? monthlyResult.error

  const labCards = labResult.items.map((item) =>
    toLabArticleCard(item, { collection: 'head_shape_lab', locale: loc }),
  )
  const monthlyCards = monthlyResult.items.map((item) =>
    toLabArticleCard(item, { collection: 'home_monthly_information', locale: loc }),
  )

  // 백엔드 정렬이 배치 순서를 먼저 보므로 앞 3편이 노션에서 상단 노출로 지정한 글이다.
  const showRecommended = !category && query.length === 0
  const recommended = showRecommended ? labCards.slice(0, RECOMMENDED_COUNT) : []

  const gridCards =
    category === 'monthly'
      ? []
      : labCards.filter((card) => !category || card.category === category).filter((card) => matchesQuery(card, query))
  const monthlyRows =
    category && category !== 'monthly' ? [] : monthlyCards.filter((card) => matchesQuery(card, query))
  const isEmpty = gridCards.length === 0 && monthlyRows.length === 0

  const monthLabels = {
    trackTorticollis: dict.article.trackTorticollis,
    trackHeadShape: dict.article.trackHeadShape,
    monthRange: dict.article.monthRange,
    monthRangeSpan: dict.article.monthRangeSpan,
    monthPlus: dict.article.monthPlus,
  }

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <h1 className="text-3xl font-bold leading-snug tracking-tight sm:text-[40px]">{dict.article.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-loose text-[var(--color-text-secondary)] sm:text-base">
            {dict.article.description}
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="flex flex-col gap-4 border-y border-[var(--color-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter locale={loc} />
          <form
            action={`/${loc}/articles`}
            className="flex min-h-12 min-w-0 items-center rounded-[8px] border border-[var(--color-border)] bg-white px-4 lg:w-72"
          >
            {category && <input type="hidden" name="cat" value={category} />}
            <label htmlFor="article-search" className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">
              {dict.article.searchLabel}
            </label>
            <input
              id="article-search"
              name="q"
              defaultValue={query}
              placeholder={dict.article.searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
        </div>

        {recommended.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">{dict.article.recommendedEyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{dict.article.recommendedTitle}</h2>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {dict.article.recommendedDescription}
              </p>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {recommended.map((card) => (
                <LabArticleCard key={card.id} card={card} readingTimeLabel={dict.article.readingTime} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-bold">{dict.article.allTitle}</h2>
          {error && (
            <p className="mt-6 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
              {dict.article.loadError}
            </p>
          )}
          {isEmpty ? (
            <p className="mt-8 rounded-[8px] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
              {query ? dict.article.emptyWithQuery.replace('{query}', query) : dict.article.empty}
            </p>
          ) : (
            <>
              {gridCards.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {gridCards.map((card) => (
                    <LabArticleCard key={card.id} card={card} readingTimeLabel={dict.article.readingTime} />
                  ))}
                </div>
              )}
              {monthlyRows.length > 0 && (
                <section className="mt-14">
                  <h2 className="text-xl font-bold">{articleCategoryLabels.monthly[loc]}</h2>
                  <div className="mt-6">
                    <MonthlyTrackList cards={monthlyRows} labels={monthLabels} />
                  </div>
                </section>
              )}
            </>
          )}
        </section>
      </Container>

      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="articles_footer" />
    </>
  )
}
```

- [ ] **Step 2: 타입과 린트를 확인한다**

명령: `npm run typecheck`
기대 결과: 에러 없음. 이 커밋에서 옛 `ArticleCard`와 `lib/api/articles.ts`는 아무도 쓰지 않게 되지만 파일은 남아 있으므로 컴파일은 통과한다.

명령: `npm run lint`
기대 결과: 에러 없음.

- [ ] **Step 3: 목 서버로 화면을 확인한다**

명령:

```bash
node scripts/mock-lab-api.mjs &
BARODORI_API_BASE_URL=http://127.0.0.1:4010 npm run dev
```

브라우저에서 `http://localhost:3000/ko/articles`를 연다.
기대 결과: 추천 3편, 전체 카드 격자, 월령별 트랙 목록이 보이고 카드 메타가 `2026-09-11, 4분 읽기` 형태다. 확인 뒤 두 프로세스를 종료한다.

- [ ] **Step 4: 커밋한다**

```
git add "app/[locale]/(site)/articles/page.tsx"
git commit -m "$(cat <<'EOF'
feat: 아티클 목록을 Knowledge Lab 두 컬렉션에서 읽는다

추천 3편과 네 분류 카드, 월령별 트랙 목록을 보여주고 offset
페이지네이션을 없앤다. force-dynamic은 fetch 캐시 옵션을 무시하게
만들므로 제거한다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 9: 아티클 상세 페이지 `[id]`

**계획 보정(코드 리뷰 반영):** Task 1에서 `getLabContent`가 `{ item, error? }`를 돌려주도록 바뀌었다. 아래 코드는 그 결과를 분해해 쓰고, 상세 페이지는 404일 때만 `notFound()`를 부르며 그 밖의 실패는 던진다.

설계 7.2절이다. 폴더를 `[slug]`에서 `[id]`로 옮기고 `generateStaticParams`를 없앤다. 하단 홈 기능 링크는 홈에 `#home-features` 앵커가 없으므로 설치 페이지 링크로 바꾸고 이벤트를 `cta_install_click`에 `surface: 'article_body'`로 통일한다.

메타데이터와 JSON-LD가 백엔드 자산의 절대 URL을 받게 되므로 `lib/seo/metadata.ts`와 `lib/seo/jsonLd.ts`가 절대 URL 앞에 사이트 주소를 덧붙이지 않도록 먼저 고친다.

**Files:**
- Modify: `lib/seo/metadata.ts`, `lib/seo/metadata.test.ts`
- Modify: `lib/seo/jsonLd.ts`, `lib/seo/jsonLd.test.ts`
- Create: `components/article/LabArticleHeader.tsx`
- Create: `components/article/RelatedLabArticles.tsx`
- Create: `app/[locale]/(site)/articles/[id]/page.tsx`
- Delete: `app/[locale]/(site)/articles/[slug]/page.tsx`
- Delete: `components/article/ArticleCard.tsx`, `components/article/ArticleHeader.tsx`, `components/article/RelatedArticles.tsx`

- [ ] **Step 1: 절대 URL 이미지에 대한 실패하는 테스트를 쓴다**

`lib/seo/metadata.test.ts`에 추가한다.

```ts
it('keeps an absolute image url as it is', () => {
  const metadata = buildMetadata({
    title: '제목',
    description: '설명',
    path: '/ko/articles/11111111-1111-4111-8111-111111111111',
    locale: 'ko',
    image: 'https://api.barodori.com/api/v2/knowledge-lab/web/contents/a/revisions/b/assets/c',
  })
  expect(metadata.openGraph?.images).toEqual([
    { url: 'https://api.barodori.com/api/v2/knowledge-lab/web/contents/a/revisions/b/assets/c' },
  ])
})

it('still prefixes a site relative image path', () => {
  const metadata = buildMetadata({ title: '제목', description: '설명', path: '/ko', locale: 'ko', image: '/og/x.png' })
  expect(metadata.openGraph?.images).toEqual([{ url: 'https://www.barodori.com/og/x.png' }])
})
```

`lib/seo/jsonLd.test.ts`에 추가한다.

```ts
it('keeps an absolute hero image url and drops the image when there is none', () => {
  const withAbsolute = articleJsonLd({
    title: '제목',
    excerpt: '요약',
    slug: '11111111-1111-4111-8111-111111111111',
    locale: 'ko',
    author: '바로도리 콘텐츠팀',
    publishedAt: '2026-09-11T02:00:00Z',
    updatedAt: '2026-09-11T02:00:00Z',
    heroImage: 'https://api.barodori.com/asset.png',
  })
  expect(withAbsolute.image).toBe('https://api.barodori.com/asset.png')

  const withoutImage = articleJsonLd({
    title: '제목',
    excerpt: '요약',
    slug: '11111111-1111-4111-8111-111111111111',
    locale: 'ko',
    author: '바로도리 콘텐츠팀',
    publishedAt: '2026-09-11T02:00:00Z',
    updatedAt: '2026-09-11T02:00:00Z',
    heroImage: null,
  })
  expect(withoutImage.image).toBeUndefined()
})
```

명령: `npx vitest run lib/seo`
기대 결과: 새 테스트 3개가 실패한다.

- [ ] **Step 2: SEO 헬퍼를 고친다**

`lib/seo/metadata.ts`에 헬퍼를 넣고 `ogUrl` 계산을 바꾼다.

```ts
function toAbsoluteUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `${SITE_URL}${value}`
}
```

```ts
  const ogUrl = toAbsoluteUrl(image ?? DEFAULT_OG)
```

`lib/seo/jsonLd.ts`의 `articleJsonLd`를 바꾼다.

```ts
export function articleJsonLd(input: {
  title: string
  excerpt: string
  slug: string
  locale: Locale
  author: string
  publishedAt: string
  updatedAt: string
  heroImage: string | null
}) {
  const url = `${SITE_URL}/${input.locale}/articles/${input.slug}`
  const image = input.heroImage
    ? /^https?:\/\//i.test(input.heroImage)
      ? input.heroImage
      : `${SITE_URL}${input.heroImage}`
    : undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.excerpt,
    image,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { '@type': 'Person', name: input.author },
    inLanguage: input.locale,
    mainEntityOfPage: url,
  } as const
}
```

명령: `npx vitest run lib/seo`
기대 결과: 전부 통과.

- [ ] **Step 3: 상세 헤더와 관련 글 컴포넌트를 만든다**

`components/article/LabArticleHeader.tsx`:

```tsx
import { Badge } from '@/components/ui/Badge'
import { articleCategoryLabels } from '@/lib/content/categories'
import { formatPublishedDate, monthLabel, type LabArticle, type MonthLabels } from '@/lib/content/labArticle'

export type LabArticleHeaderLabels = MonthLabels & {
  author: string
  readingTime: string
}

export function LabArticleHeader({ article, labels }: { article: LabArticle; labels: LabArticleHeaderLabels }) {
  const month = monthLabel(labels, article.monthMin, article.monthMax)

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{articleCategoryLabels[article.category][article.locale]}</Badge>
        {month && <Badge tone="neutral">{month}</Badge>}
      </div>
      <h1 className="mt-3 text-3xl font-bold leading-snug tracking-tight sm:text-4xl">{article.title}</h1>
      {article.subtitle && (
        <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          {article.subtitle}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
        <span>{labels.author}</span>
        <span>{formatPublishedDate(article.publishedAt)}</span>
        <span>{labels.readingTime.replace('{minutes}', String(article.readingMinutes))}</span>
      </div>
      {article.heroImage && (
        <div className="relative mt-8 overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.heroImage} alt={article.title} className="block h-auto w-full object-cover" />
        </div>
      )}
    </header>
  )
}
```

`components/article/RelatedLabArticles.tsx`:

```tsx
import { LabArticleCard } from '@/components/article/LabArticleCard'
import type { LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'

export function RelatedLabArticles({
  cards,
  title,
  readingTimeLabel,
}: {
  cards: LabArticleCardModel[]
  title: string
  readingTimeLabel: string
}) {
  if (cards.length === 0) return null
  return (
    <section className="mt-12 border-t border-[var(--color-border)] pt-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <LabArticleCard key={card.id} card={card} readingTimeLabel={readingTimeLabel} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 상세 페이지를 만든다**

`app/[locale]/(site)/articles/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { ArticleViewTracker } from '@/components/article/ArticleViewTracker'
import { LabArticleHeader } from '@/components/article/LabArticleHeader'
import { LabDocument } from '@/components/article/LabDocument'
import { RelatedLabArticles } from '@/components/article/RelatedLabArticles'
import { Toc } from '@/components/article/Toc'
import { MedicalNotice } from '@/components/article/mdx/MedicalNotice'
import { InstallCta } from '@/components/marketing/InstallCta'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { getLabContent, listLabContents } from '@/lib/api/knowledgeLab'
import {
  toLabArticle,
  toLabArticleCard,
  type LabArticle,
  type LabArticleCard as LabArticleCardModel,
} from '@/lib/content/labArticle'
import { articleJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import type { Locale } from '@/lib/i18n/config'

const RELATED_COUNT = 2

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const { item } = await getLabContent({ locale, id })
  if (!item) return {}
  const article = toLabArticle(item, { collection: null, locale })
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/${locale}/articles/${id}`,
    locale,
    image: article.heroImage ?? undefined,
  })
}

async function loadRelated(article: LabArticle, locale: Locale): Promise<LabArticleCardModel[]> {
  if (article.category === 'monthly') {
    const { items } = await listLabContents({ locale, collection: 'home_monthly_information' })
    const neighbours = items
      .map((item) => toLabArticleCard(item, { collection: 'home_monthly_information', locale }))
      .filter((card) => card.id !== article.id)
      .filter((card) => article.track === 'both' || card.track === 'both' || card.track === article.track)
    const anchor = article.monthMin ?? 0
    return neighbours
      .sort((a, b) => Math.abs((a.monthMin ?? 0) - anchor) - Math.abs((b.monthMin ?? 0) - anchor))
      .slice(0, RELATED_COUNT)
  }

  const { items } = await listLabContents({ locale, collection: 'head_shape_lab', kind: article.kind })
  return items
    .map((item) => toLabArticleCard(item, { collection: 'head_shape_lab', locale }))
    .filter((card) => card.id !== article.id)
    .slice(0, RELATED_COUNT)
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const { item, error } = await getLabContent({ locale: loc, id })
  if (!item) {
    // 404는 정말로 없는 글이다. 그 밖의 실패는 캐시에 빈 페이지가 굳지 않도록 던진다.
    if (error && error !== 'lab_api_http_404') throw new Error(error)
    notFound()
  }

  const dict = await getDictionary(loc)
  const article = toLabArticle(item, { collection: null, locale: loc })
  const related = await loadRelated(article, loc)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              title: article.title,
              excerpt: article.excerpt,
              slug: article.id,
              locale: loc,
              author: dict.article.author,
              publishedAt: article.publishedAt,
              updatedAt: article.publishedAt,
              heroImage: article.heroImage,
            }),
          ),
        }}
      />
      <Container className="py-12">
        <article className="mx-auto max-w-3xl">
          <ArticleViewTracker slug={article.id} category={article.category} locale={loc} />
          <LabArticleHeader
            article={article}
            labels={{
              author: dict.article.author,
              readingTime: dict.article.readingTime,
              monthRange: dict.article.monthRange,
              monthRangeSpan: dict.article.monthRangeSpan,
              monthPlus: dict.article.monthPlus,
            }}
          />
          <Toc document={article.document} labels={{ tocTitle: dict.article.tocTitle }} />
          <LabDocument
            document={article.document}
            assets={article.assets}
            contentId={article.id}
            revisionId={article.revisionId}
            locale={loc}
            title={article.title}
            labels={{ attachment: dict.article.attachment, featureLink: dict.article.featureLink }}
          />
          <aside className="my-8 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary-light)] p-5 text-sm leading-relaxed">
            <p>
              {dict.article.detailCta}{' '}
              <TrackedLink
                href={`/${loc}/install`}
                event="cta_install_click"
                eventProps={{ surface: 'article_body', contentId: article.id, locale: loc, live: true }}
                className="font-semibold text-[var(--color-primary-dark)] underline"
              >
                {dict.article.detailCtaLink}
              </TrackedLink>
            </p>
          </aside>
          <MedicalNotice locale={loc} />
          <RelatedLabArticles
            cards={related}
            title={dict.article.relatedTitle}
            readingTimeLabel={dict.article.readingTime}
          />
        </article>
      </Container>
      <InstallCta locale={loc} surface={`article:${article.id}`} />
    </>
  )
}
```

`ArticleViewTracker`는 그대로 둔다. 설계 11절이 `article_view`를 그대로 쓰라고 했으므로 이벤트 속성 이름 `slug`를 유지하고 값만 콘텐츠 UUID가 된다. 앰플리튜드의 기존 차트가 깨지지 않는다.

- [ ] **Step 5: 옛 상세 라우트와 옛 컴포넌트를 지운다**

```bash
git rm -r "app/[locale]/(site)/articles/[slug]"
git rm components/article/ArticleCard.tsx components/article/ArticleHeader.tsx components/article/RelatedArticles.tsx
```

- [ ] **Step 6: 타입과 테스트를 확인한다**

명령: `npm run typecheck`
기대 결과: 에러 없음. 이 시점에 `lib/api/articles.ts`를 쓰는 곳은 `app/sitemap.ts`와 `app/sitemap.test.ts`뿐이다.

명령: `npx vitest run`
기대 결과: 전부 통과.

명령: `npm run lint`
기대 결과: 에러 없음.

- [ ] **Step 7: 목 서버로 세 종류 상세를 연다**

`node scripts/mock-lab-api.mjs`와 `BARODORI_API_BASE_URL=http://127.0.0.1:4010 npm run dev`를 띄우고 다음 세 주소를 연다.

- `http://localhost:3000/ko/articles/11111111-1111-4111-8111-111111111111` 운동 가이드
- `http://localhost:3000/ko/articles/22222222-1111-4111-8111-111111111111` 자주 묻는 질문
- `http://localhost:3000/ko/articles/33333333-1111-4111-8111-111111111111` 월령별

기대 결과: 목차, 이미지, 표, 콜아웃, 접기, 기능 버튼, 첨부 링크가 보이고 h1은 본제목 하나다.

- [ ] **Step 8: 커밋한다**

```
git add "app/[locale]/(site)/articles/[id]/page.tsx" components/article/LabArticleHeader.tsx components/article/RelatedLabArticles.tsx lib/seo/metadata.ts lib/seo/metadata.test.ts lib/seo/jsonLd.ts lib/seo/jsonLd.test.ts
git commit -m "$(cat <<'EOF'
feat: 아티클 상세를 콘텐츠 UUID 경로에서 Knowledge Lab 본문으로 그린다

옛 슬러그 라우트와 MDX 기반 헤더, 카드, 관련 글 컴포넌트를 지운다.
하단 링크는 사라진 홈 앵커 대신 설치 페이지로 보내고 이벤트를
cta_install_click으로 통일한다. 메타데이터와 JSON-LD는 백엔드 자산의
절대 URL을 그대로 쓴다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 10: sitemap과 옛 아티클 파이프라인 제거

설계 7.4절과 9절이다. sitemap은 두 컬렉션을 읽어 모든 글의 상세 URL을 넣고 `lastModified`는 `publishedAt`이다. 조립 로직은 `lib/seo/labSitemap.ts`로 빼서 `lib/`에서 단위 테스트한다. `app/sitemap.ts`가 마지막 사용처였던 옛 아티클 모듈을 같은 커밋에서 지운다.

**Files:**
- Create: `lib/seo/labSitemap.ts`
- Create: `lib/seo/labSitemap.test.ts`
- Modify: `app/sitemap.ts`, `app/sitemap.test.ts`
- Delete: `lib/api/articles.ts`, `lib/api/articles.test.ts`, `lib/content/articles.ts`, `lib/content/articles.test.ts`, `lib/api/community.ts`, `lib/api/community.test.ts`, `content/articles/`, `public/articles/`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`lib/seo/labSitemap.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { headShapeLabCards, monthlyCards } from '@/lib/api/__fixtures__/knowledgeLab'
import { buildArticleSitemapEntries } from './labSitemap'

const SITE_URL = 'https://www.barodori.com'

describe('buildArticleSitemapEntries', () => {
  it('lists every article detail url with the published date as lastModified', () => {
    const entries = buildArticleSitemapEntries(SITE_URL, [...headShapeLabCards, ...monthlyCards])
    expect(entries).toHaveLength(headShapeLabCards.length + monthlyCards.length)
    expect(entries[0]).toMatchObject({
      url: `${SITE_URL}/ko/articles/${headShapeLabCards[0].id}`,
      lastModified: headShapeLabCards[0].publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  })

  it('lists an article that sits in both collections once', () => {
    const duplicated = [...headShapeLabCards, headShapeLabCards[0]]
    expect(buildArticleSitemapEntries(SITE_URL, duplicated)).toHaveLength(headShapeLabCards.length)
  })

  it('returns an empty list when the api gave nothing', () => {
    expect(buildArticleSitemapEntries(SITE_URL, [])).toEqual([])
  })
})
```

명령: `npx vitest run lib/seo/labSitemap.test.ts`
기대 결과: 모듈이 없어 실패한다.

- [ ] **Step 2: 조립 함수를 만든다**

`lib/seo/labSitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { listLabContents, type LabCard } from '@/lib/api/knowledgeLab'
import { defaultLocale } from '@/lib/i18n/config'

/** 한 콘텐츠가 두 컬렉션에 배치될 수 있으므로 id로 한 번만 넣는다. */
export function buildArticleSitemapEntries(siteUrl: string, cards: LabCard[]): MetadataRoute.Sitemap {
  const seen = new Set<string>()
  const entries: MetadataRoute.Sitemap = []

  for (const card of cards) {
    if (seen.has(card.id)) continue
    seen.add(card.id)
    const url = `${siteUrl}/${defaultLocale}/articles/${card.id}`
    entries.push({
      url,
      lastModified: card.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: { [defaultLocale]: url } },
    })
  }

  return entries
}

/** 두 컬렉션을 병렬로 읽는다. 실패하면 빈 배열이라 sitemap은 정적 경로만 남는다. */
export async function loadArticleSitemapCards(): Promise<LabCard[]> {
  const [lab, monthly] = await Promise.all([
    listLabContents({ locale: defaultLocale, collection: 'head_shape_lab' }),
    listLabContents({ locale: defaultLocale, collection: 'home_monthly_information' }),
  ])
  return [...lab.items, ...monthly.items]
}
```

- [ ] **Step 3: `app/sitemap.ts`를 바꾼다**

`listArticlePosts` import를 지우고 다음으로 바꾼다.

```ts
import { buildArticleSitemapEntries, loadArticleSitemapCards } from '@/lib/seo/labSitemap'
```

본문 끝을 바꾼다.

```ts
  const cards = await loadArticleSitemapCards()
  return [...staticRoutes, ...buildArticleSitemapEntries(SITE_URL, cards)]
```

`app/sitemap.test.ts`의 목을 바꾼다.

```ts
vi.mock('@/lib/seo/labSitemap', () => ({
  buildArticleSitemapEntries: () => [],
  loadArticleSitemapCards: vi.fn(async () => []),
}))
```

- [ ] **Step 4: 옛 파이프라인을 지운다**

```bash
git rm lib/api/articles.ts lib/api/articles.test.ts lib/content/articles.ts lib/content/articles.test.ts lib/api/community.ts lib/api/community.test.ts
git rm -r content/articles public/articles
```

- [ ] **Step 5: 테스트를 통과시킨다**

명령: `npx vitest run`
기대 결과: 전부 통과. `lib/content/articles.test.ts`와 `lib/api/articles.test.ts`가 사라지므로 테스트 수가 줄어든다.

명령: `npm run typecheck`
기대 결과: 에러 없음. `gray-matter`와 `reading-time`은 이제 쓰이지 않지만 `package.json`에서 빼는 것은 설계 14절대로 후속으로 남긴다.

명령: `npm run lint`
기대 결과: 에러 없음.

- [ ] **Step 6: 커밋한다**

```
git add lib/seo/labSitemap.ts lib/seo/labSitemap.test.ts app/sitemap.ts app/sitemap.test.ts
git commit -m "$(cat <<'EOF'
feat: sitemap이 Knowledge Lab 두 컬렉션의 상세 URL을 싣는다

옛 MDX 아티클 6편과 커뮤니티 공식 콘텐츠 연동, 관련 로더와 테스트,
아티클 이미지 폴더를 지운다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 11: FAQ 페이지와 `FaqAccordion`

설계 7.3절이다. FAQ는 Knowledge Lab의 `kind=faq` 9편을 읽는다. 질문은 본제목, 답변은 요약이 있으면 요약, 없으면 부제다. 카테고리 칩은 없애고 검색 폼은 남긴다. 카카오 문의 영역은 그대로 둔다.

**Files:**
- Modify: `components/faq/FaqAccordion.tsx`
- Create: `components/faq/FaqAccordion.test.tsx`
- Modify: `app/[locale]/(site)/faq/page.tsx`
- Modify: `lib/api/content.ts`, `lib/api/content.test.ts`
- Delete: `lib/content/faq.ts`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`components/faq/FaqAccordion.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { FaqAccordion, type FaqItem } from './FaqAccordion'

const labels = {
  searchLabel: '검색',
  searchPlaceholder: '질문을 검색하세요',
  loadError: 'FAQ 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
  empty: '등록된 질문이 없어요.',
  emptyWithQuery: "'{query}'에 대한 결과가 없어요.",
  readMore: '자세히 읽기',
}

const items: FaqItem[] = [
  {
    id: '22222222-1111-4111-8111-111111111111',
    question: '사경 운동은 언제까지 해야 하나요?',
    answer: '담당 전문의가 정한 기간을 따릅니다.',
    href: '/ko/articles/22222222-1111-4111-8111-111111111111',
  },
  {
    id: '22222222-1111-4111-8111-222222222222',
    question: '터미타임은 하루 몇 분이 좋나요?',
    answer: '아이가 힘들어하지 않는 범위에서 나누어 합니다.',
    href: '/ko/articles/22222222-1111-4111-8111-222222222222',
  },
]

describe('FaqAccordion', () => {
  it('renders every question with its answer', () => {
    render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    expect(screen.getByText('사경 운동은 언제까지 해야 하나요?')).toBeInTheDocument()
    expect(screen.getByText('아이가 힘들어하지 않는 범위에서 나누어 합니다.')).toBeInTheDocument()
  })

  it('links each item to its detail page', () => {
    render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    const link = screen.getAllByRole('link', { name: '자세히 읽기' })[0]
    expect(link).toHaveAttribute('href', items[0].href)
  })

  it('does not render category chips', () => {
    render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    expect(screen.queryByText('전체')).toBeNull()
  })

  it('keeps the search form pointed at the faq page', () => {
    const { container } = render(<FaqAccordion locale="en" items={items} query="tummy" labels={labels} />)
    expect(container.querySelector('form')).toHaveAttribute('action', '/en/faq')
    expect(screen.getByRole('textbox')).toHaveValue('tummy')
  })

  it('shows the plain empty state', () => {
    render(<FaqAccordion locale="ko" items={[]} query="" labels={labels} />)
    expect(screen.getByText('등록된 질문이 없어요.')).toBeInTheDocument()
  })

  it('shows the query empty state with the query filled in', () => {
    render(<FaqAccordion locale="ko" items={[]} query="사두" labels={labels} />)
    expect(screen.getByText("'사두'에 대한 결과가 없어요.")).toBeInTheDocument()
  })

  it('shows the load error notice', () => {
    render(<FaqAccordion locale="ko" items={items} query="" error="lab_api_http_500" labels={labels} />)
    expect(screen.getByText(labels.loadError)).toBeInTheDocument()
  })

  it('opens the first item by default', () => {
    const { container } = render(<FaqAccordion locale="ko" items={items} query="" labels={labels} />)
    const details = container.querySelectorAll('details')
    expect(details[0]).toHaveAttribute('open')
    expect(within(details[0] as HTMLElement).getByText(items[0].answer)).toBeInTheDocument()
  })
})
```

명령: `npx vitest run components/faq/FaqAccordion.test.tsx`
기대 결과: `FaqItem` export가 없어 실패한다.

- [ ] **Step 2: `FaqAccordion`을 다시 쓴다**

`components/faq/FaqAccordion.tsx` 전체를 바꾼다.

```tsx
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'

export type FaqItem = {
  id: string
  question: string
  answer: string
  href: string
}

export type FaqAccordionLabels = {
  searchLabel: string
  searchPlaceholder: string
  loadError: string
  empty: string
  emptyWithQuery: string
  readMore: string
}

export function FaqAccordion({
  locale,
  items,
  query,
  error,
  labels,
}: {
  locale: Locale
  items: FaqItem[]
  query: string
  error?: string
  labels: FaqAccordionLabels
}) {
  return (
    <div>
      <div className="rounded-[8px] border border-[var(--color-border)] bg-white p-5">
        <form
          action={`/${locale}/faq`}
          className="flex min-h-14 items-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-5"
        >
          <label htmlFor="faq-search" className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            {labels.searchLabel}
          </label>
          <input
            id="faq-search"
            name="q"
            defaultValue={query}
            placeholder={labels.searchPlaceholder}
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>
      </div>
      {error && (
        <p className="mt-5 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
          {labels.loadError}
        </p>
      )}
      {items.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
          {query ? labels.emptyWithQuery.replace('{query}', query) : labels.empty}
        </p>
      ) : (
        <div className="mt-8 divide-y divide-[var(--color-border)] rounded-[8px] border border-[var(--color-border)] bg-white">
          {items.map((item, index) => (
            <details key={item.id} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left">
                <span className="font-bold">{item.question}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xl text-[var(--color-text-secondary)] group-open:hidden">
                  +
                </span>
                <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-bg-muted)] text-xl text-[var(--color-text-secondary)] group-open:grid">
                  -
                </span>
              </summary>
              <div className="px-5 pb-6">
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.answer}</p>
                <Link
                  href={item.href}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--color-primary-dark)] underline"
                >
                  {labels.readMore}
                </Link>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: FAQ 페이지를 바꾼다**

`app/[locale]/(site)/faq/page.tsx`에서 `export const dynamic = 'force-dynamic'` 줄과 `getFaqContent` import를 지우고, 데이터 읽기와 `FaqAccordion` 호출을 바꾼다.

```tsx
import { FaqAccordion, type FaqItem } from '@/components/faq/FaqAccordion'
import { listLabContents } from '@/lib/api/knowledgeLab'
import { matchesQuery, toLabArticleCard } from '@/lib/content/labArticle'
```

```tsx
  const { items, error } = await listLabContents({ locale: loc, collection: 'head_shape_lab', kind: 'faq' })
  const faqItems: FaqItem[] = items
    .map((item) => toLabArticleCard(item, { collection: 'head_shape_lab', locale: loc }))
    .filter((card) => matchesQuery(card, query))
    .map((card) => ({
      id: card.id,
      question: card.title,
      answer: card.excerpt,
      href: `/${loc}/articles/${card.id}`,
    }))
```

```tsx
        <FaqAccordion
          locale={loc}
          items={faqItems}
          query={query}
          error={error}
          labels={{
            searchLabel: dict.faq.searchLabel,
            searchPlaceholder: dict.faq.searchPlaceholder,
            loadError: dict.faq.loadError,
            empty: dict.faq.empty,
            emptyWithQuery: dict.faq.emptyWithQuery,
            readMore: dict.faq.readMore,
          }}
        />
```

`category` 관련 지역 변수와 `normalizeSearchParam(search.category)` 줄을 지운다. `searchParams`에서 `q`만 읽는다. 카카오 문의 영역은 그대로 둔다.

- [ ] **Step 4: `lib/api/content.ts`에서 FAQ 부분을 걷어낸다**

지우는 것: `getFaqContent`, `buildFallbackFaqContent`, `buildFallbackFaqCategoryOptions`, `mapFaqItem`, `sanitizeFaqAnswer`, `buildFaqCategories`, `getSortOrder`, `SAFE_WORKOUT_GUIDANCE_ANSWER`, 타입 `FaqCategoryOption`, `FaqContentParams`, `FaqContentResult`, `PublicFaqCategory`, `PublicFaqCategoryListResponse`, `PublicFaqItem`, `PublicFaqListResponse`, 그리고 `@/lib/content/faq`와 `defaultLocale` import. 뉴스룸 부분은 전부 남긴다. `Locale` import가 더 이상 쓰이지 않으면 함께 지운다.

`lib/api/content.test.ts`에서 `replaces unsafe automatic workout guidance from the FAQ API` 테스트를 지우고 `getFaqContent` import도 지운다.

```bash
git rm lib/content/faq.ts
```

- [ ] **Step 5: 테스트를 통과시킨다**

명령: `npx vitest run components/faq/FaqAccordion.test.tsx lib/api/content.test.ts`
기대 결과: `FaqAccordion` 8개 통과, `content` 2개 통과.

명령: `npm run typecheck`
기대 결과: 에러 없음.

- [ ] **Step 6: 목 서버로 FAQ를 연다**

`http://localhost:3000/ko/faq`를 연다.
기대 결과: 픽스처의 FAQ 한 편이 아코디언으로 뜨고 `자세히 읽기`가 상세로 간다. 카테고리 칩이 없다.

- [ ] **Step 7: 커밋한다**

```
git add components/faq/FaqAccordion.tsx components/faq/FaqAccordion.test.tsx "app/[locale]/(site)/faq/page.tsx" lib/api/content.ts lib/api/content.test.ts
git commit -m "$(cat <<'EOF'
feat: FAQ 페이지가 Knowledge Lab의 자주 묻는 질문을 읽는다

카테고리 칩과 옛 FAQ API 연동, 폴백 파일을 지우고 각 항목에서
상세로 가는 자세히 읽기 링크를 둔다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 12: 캐시 무효화 웹훅

설계 5.3절이다. 백엔드 계약 5절이 보내는 요청을 받는다. `POST {WEBSITE_REVALIDATE_URL}`, 헤더 `Authorization: Bearer {WEBSITE_REVALIDATE_TOKEN}`, 본문 `{"tags": ["lab-content"], "contentId": "...", "market": "KR", "locale": "ko", "action": "publish|withdraw"}`이다. 웹은 태그만 보고 나머지 필드는 무시한다.

라우트 핸들러를 쓰기 전에 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`와 `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`를 읽는다. `route.md`에 따르면 정의하지 않은 메서드는 Next가 `Allow` 헤더와 함께 막아 주므로 `POST`만 export하면 된다. `revalidateTag.md`에 따라 두 번째 인자 `'max'`를 반드시 준다.

`app/**`는 vitest 대상이 아니므로 판정 로직을 `lib/cache/revalidate.ts`로 빼서 테스트한다.

**Files:**
- Create: `lib/cache/revalidate.ts`
- Create: `lib/cache/revalidate.test.ts`
- Create: `app/api/revalidate/route.ts`
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`lib/cache/revalidate.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { decideRevalidate } from './revalidate'

const TOKEN = 'secret-token'

describe('decideRevalidate', () => {
  it('reports a missing configuration with 503', () => {
    expect(decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: undefined, body: null })).toEqual({
      status: 503,
      body: { error: 'revalidate_token_not_configured' },
    })
    expect(decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: '  ', body: null })).toMatchObject({
      status: 503,
    })
  })

  it('rejects a wrong or missing token with 401', () => {
    expect(decideRevalidate({ authorization: null, token: TOKEN, body: null })).toEqual({
      status: 401,
      body: { error: 'unauthorized' },
    })
    expect(decideRevalidate({ authorization: 'Bearer nope', token: TOKEN, body: null })).toMatchObject({ status: 401 })
    expect(decideRevalidate({ authorization: TOKEN, token: TOKEN, body: null })).toMatchObject({ status: 401 })
  })

  it('accepts the lab content tag', () => {
    expect(
      decideRevalidate({
        authorization: `Bearer ${TOKEN}`,
        token: TOKEN,
        body: { tags: ['lab-content'], contentId: 'x', market: 'KR', locale: 'ko', action: 'publish' },
      }),
    ).toEqual({ status: 200, body: { revalidated: true, tags: ['lab-content'] } })
  })

  it('falls back to the lab content tag when the body has no tags', () => {
    expect(decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: TOKEN, body: {} })).toEqual({
      status: 200,
      body: { revalidated: true, tags: ['lab-content'] },
    })
  })

  it('ignores tags that are not allowed', () => {
    expect(
      decideRevalidate({
        authorization: `Bearer ${TOKEN}`,
        token: TOKEN,
        body: { tags: ['lab-content', 'everything', 123] },
      }),
    ).toEqual({ status: 200, body: { revalidated: true, tags: ['lab-content'] } })
  })

  it('revalidates nothing when every tag was rejected', () => {
    expect(
      decideRevalidate({ authorization: `Bearer ${TOKEN}`, token: TOKEN, body: { tags: ['everything'] } }),
    ).toEqual({ status: 200, body: { revalidated: true, tags: [] } })
  })
})
```

명령: `npx vitest run lib/cache/revalidate.test.ts`
기대 결과: 모듈이 없어 실패한다.

- [ ] **Step 2: 판정 로직을 만든다**

`lib/cache/revalidate.ts`:

```ts
import { LAB_CACHE_TAG } from '@/lib/api/knowledgeLab'

const ALLOWED_TAGS: readonly string[] = [LAB_CACHE_TAG]

export type RevalidateDecision =
  | { status: 503; body: { error: 'revalidate_token_not_configured' } }
  | { status: 401; body: { error: 'unauthorized' } }
  | { status: 200; body: { revalidated: true; tags: string[] } }

export function decideRevalidate(input: {
  authorization: string | null
  token: string | undefined
  body: unknown
}): RevalidateDecision {
  const token = input.token?.trim()
  if (!token) return { status: 503, body: { error: 'revalidate_token_not_configured' } }
  if (input.authorization !== `Bearer ${token}`) return { status: 401, body: { error: 'unauthorized' } }

  return { status: 200, body: { revalidated: true, tags: allowedTagsFrom(input.body) } }
}

function allowedTagsFrom(body: unknown): string[] {
  if (!body || typeof body !== 'object') return [...ALLOWED_TAGS]
  const raw = (body as { tags?: unknown }).tags
  if (raw === undefined) return [...ALLOWED_TAGS]
  if (!Array.isArray(raw)) return []
  return ALLOWED_TAGS.filter((tag) => raw.includes(tag))
}
```

- [ ] **Step 3: 라우트 핸들러를 만든다**

`app/api/revalidate/route.ts`:

```ts
import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { decideRevalidate } from '@/lib/cache/revalidate'

export async function POST(request: NextRequest) {
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    body = null
  }

  const decision = decideRevalidate({
    authorization: request.headers.get('authorization'),
    token: process.env.LAB_REVALIDATE_TOKEN,
    body,
  })

  if (decision.status === 200) {
    for (const tag of decision.body.tags) {
      // 두 번째 인자 없는 형태는 폐기 예정이라 'max'를 준다. 태그가 stale로 표시되고
      // 다음 방문에서 백그라운드로 새 값을 받는다.
      revalidateTag(tag, 'max')
    }
  }

  return NextResponse.json(decision.body, { status: decision.status })
}
```

- [ ] **Step 4: 환경 변수와 README를 적는다**

`.env.example`의 `BARODORI_API_BASE_URL` 줄 아래에 붙인다.

```
LAB_REVALIDATE_TOKEN=
```

`README.md`의 `## 환경변수` 절 뒤에 절을 하나 더한다.

````markdown
## 운영

아티클과 FAQ는 백엔드 Knowledge Lab의 공개 읽기 엔드포인트를 서버에서 읽고, 응답을 하루 동안 `lab-content` 태그로 캐시합니다. 백엔드가 게시나 철회를 커밋하면 웹훅으로 캐시를 비웁니다.

- 배포 환경에 `LAB_REVALIDATE_TOKEN`을 등록하고, 백엔드의 `WEBSITE_REVALIDATE_URL`(`https://www.barodori.com/api/revalidate`)과 `WEBSITE_REVALIDATE_TOKEN`에 같은 값을 넣습니다.
- 손으로 비울 때는 다음처럼 부릅니다.

```bash
curl -X POST https://www.barodori.com/api/revalidate \
  -H "Authorization: Bearer $LAB_REVALIDATE_TOKEN" \
  -H "content-type: application/json" \
  -d '{"tags":["lab-content"]}'
```

응답 `{"revalidated":true,"tags":["lab-content"]}`가 오면 다음 방문부터 새 글이 보입니다. 토큰이 설정되지 않았으면 503, 토큰이 틀리면 401이 옵니다.

백엔드가 아직 뜨지 않은 상태에서 웹을 돌려 보려면 픽스처를 내려주는 목 서버를 씁니다. `scripts/mock-lab-fixtures.json`은 `lib/api/__fixtures__/knowledgeLab.ts`와 같은 값을 유지합니다.

```bash
node scripts/mock-lab-api.mjs
BARODORI_API_BASE_URL=http://127.0.0.1:4010 npm run dev
```
````

`README.md`의 스택 절에서 `MDX 기반 아티클 (content/articles/{locale}/*.mdx)` 줄을 `백엔드 Knowledge Lab 런타임 연동 아티클과 FAQ`로 바꾸고, `## 콘텐츠 추가` 절을 지운다. 그 절이 설명하던 MDX 추가 절차는 더 이상 없다. 같은 파일 20행의 `http://localhost:3000 → /ko 로 리다이렉트.`도 화살표를 빼고 `http://localhost:3000 은 /ko 로 리다이렉트합니다.`로 바꾼다. 설계 문서와 별개로 문장 부호 규칙을 지키기 위해서다.

- [ ] **Step 5: 테스트를 통과시킨다**

명령: `npx vitest run lib/cache/revalidate.test.ts`
기대 결과: 6개 테스트 통과.

명령: `npm run typecheck`
기대 결과: 에러 없음.

- [ ] **Step 6: 라우트를 실제로 불러 본다**

개발 서버를 `LAB_REVALIDATE_TOKEN=dev-token npm run dev`로 띄우고 다음을 부른다.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/revalidate \
  -H 'content-type: application/json' -d '{"tags":["lab-content"]}'
curl -s -X POST http://localhost:3000/api/revalidate \
  -H 'Authorization: Bearer dev-token' -H 'content-type: application/json' \
  -d '{"tags":["lab-content"],"action":"publish"}'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/api/revalidate
```

기대 결과: 차례로 `401`, `{"revalidated":true,"tags":["lab-content"]}`, `405`.

- [ ] **Step 7: 커밋한다**

```
git add lib/cache/revalidate.ts lib/cache/revalidate.test.ts app/api/revalidate/route.ts .env.example README.md
git commit -m "$(cat <<'EOF'
feat: 게시 웹훅이 lab-content 태그를 무효화하는 라우트를 추가한다

토큰 검사와 허용 태그 필터는 lib/cache/revalidate.ts에 두어 단위
테스트한다. README에 운영 절과 목 서버 사용법을 적는다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 13: 옛 슬러그 리다이렉트와 남은 정리

설계 6절의 리다이렉트와 9절, 10절의 나머지 삭제다. `next.config.ts`를 고치기 전에 `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md`를 읽는다. `permanent: true`가 308을 쓰고 리다이렉트가 파일 시스템보다 먼저 검사된다는 점을 확인한다. 리터럴 슬러그 6개만 걸리므로 `/[locale]/articles/<UUID>`에는 영향이 없다.

**Files:**
- Modify: `next.config.ts`
- Modify: `lib/content/categories.ts`
- Modify: `mdx-components.tsx`
- Modify: `messages/ko.json`, `messages/en.json`
- Delete: `components/article/mdx/ExerciseCard.tsx`

- [ ] **Step 1: 리다이렉트를 넣는다**

`next.config.ts`:

```ts
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

// 1.4 시절 MDX 아티클 6편의 주소다. 개별 대응 글이 없으므로 목록으로 영구 이동한다.
const LEGACY_ARTICLE_SLUGS = [
  'torticollis-symptoms',
  'tummy-time-guide',
  'baby-head-shape-asymmetry-record',
  'torticollis-stretching-safety-record',
  'baby-neck-turning-one-side',
  'baby-torticollis-homecare-record',
]

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return LEGACY_ARTICLE_SLUGS.map((slug) => ({
      source: `/:locale(ko|en)/articles/${slug}`,
      destination: '/ko/articles',
      permanent: true,
    }))
  },
}

// Turbopack의 @next/mdx 로더는 직렬화 가능한 옵션만 받음 -> plugin 함수는 string 이름으로 전달
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug'],
  },
})

export default withMDX(nextConfig)
```

기존 주석의 화살표 문자는 문장 부호 규칙에 맞게 `->`로 바꾼다.

- [ ] **Step 2: 옛 분류 export를 지운다**

`lib/content/categories.ts`에서 `categories`, `Category`, `categoryLabels`, `isCategory`를 지운다. `allCategoryLabels`는 `CategoryFilter`가 쓰므로 남긴다. 최종 파일은 다음과 같다.

```ts
export const allCategoryLabels = { ko: '전체', en: 'All' } as const

// 앱 2.0.0 Knowledge Lab 분류. 설계 문서 6절의 네 값이다.
export const articleCategories = ['exercise-guide', 'disease-info', 'faq', 'monthly'] as const
export type ArticleCategory = typeof articleCategories[number]

export const articleCategoryLabels: Record<ArticleCategory, { ko: string; en: string }> = {
  'exercise-guide': { ko: '운동 가이드', en: 'Exercise guide' },
  'disease-info': { ko: '질환 정보', en: 'Conditions' },
  faq: { ko: '자주 묻는 질문', en: 'FAQ' },
  monthly: { ko: '월령별', en: 'By month' },
}

export function isArticleCategory(value: string): value is ArticleCategory {
  return (articleCategories as readonly string[]).includes(value)
}
```

- [ ] **Step 3: `ExerciseCard`와 mdx 매핑을 지운다**

```bash
git rm components/article/mdx/ExerciseCard.tsx
```

`mdx-components.tsx`에서 `ExerciseCard` import와 매핑 한 줄을 지운다. `Callout`과 `MedicalNotice`는 남긴다. 나머지 엘리먼트 매핑도 남긴다. 뉴스룸과 법적 고지 MDX가 계속 쓴다.

- [ ] **Step 4: 안 쓰는 사전 키를 지운다**

`messages/ko.json`과 `messages/en.json`의 `article` 트리에서 `more`와 `end`를 지운다. 목록 페이지에서 페이지네이션이 사라져 참조가 없다. `recommendedEyebrow`, `recommendedTitle`, `recommendedDescription`은 추천 영역이 남아 있으므로 지우지 않는다. FAQ 트리는 카테고리 칩 관련 키를 애초에 두지 않았으므로 지울 것이 없다.

- [ ] **Step 5: 남은 참조가 없는지 확인한다**

명령:

```bash
grep -rn -e "categoryLabels\[" -e "isCategory" -e "ExerciseCard" -e "article.more" -e "article.end" app components lib mdx-components.tsx messages || echo "no leftovers"
```

기대 결과: `articleCategoryLabels[` 사용만 나오고 옛 이름은 나오지 않는다.

명령: `npm run typecheck`
기대 결과: 에러 없음.

명령: `npx vitest run`
기대 결과: 전부 통과.

- [ ] **Step 6: 리다이렉트를 확인한다**

개발 서버를 띄우고 부른다.

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3000/ko/articles/tummy-time-guide
```

기대 결과: `308 http://localhost:3000/ko/articles`.

- [ ] **Step 7: 커밋한다**

```
git add next.config.ts lib/content/categories.ts mdx-components.tsx messages/ko.json messages/en.json
git commit -m "$(cat <<'EOF'
chore: 옛 아티클 슬러그 6개를 목록으로 영구 이동하고 남은 옛 자원을 지운다

옛 네 분류 상수, ExerciseCard와 그 mdx 매핑, 페이지네이션 사전 키를
지운다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

---

## Task 14: 실측 검증과 PR

설계 13절의 실측과 15절의 성공 기준을 확인한다.

**Files:** 없음. 검증과 PR만 한다.

- [ ] **Step 1: 정적 검사 네 가지를 돌린다**

명령: `npm run typecheck`
기대 결과: 에러 없음.

명령: `npm run lint`
기대 결과: 에러 없음.

명령: `npm run i18n:check`
기대 결과: `i18n guard: no hardcoded Korean copy candidates found.`
`ripgrep (rg) is not installed.`로 실패하면 `brew install ripgrep`으로 설치한다. 설치할 수 없는 환경이면 앞선 세션에서 쓴 perl 대체 검사를 써도 된다. 아래 한 줄이 같은 일을 한다.

```bash
git diff --unified=0 --diff-filter=ACMR "$(git merge-base HEAD origin/main)" -- ':(glob)app/**/*.ts' ':(glob)app/**/*.tsx' ':(glob)components/**/*.ts' ':(glob)components/**/*.tsx' ':(glob)lib/**/*.ts' \
  | perl -ne 'if (/^\+\+\+ b\/(.*)/) { $f=$1; $f="" if $f =~ m{^(messages/|content/articles/|lib/content/|lib/api/__fixtures__/)} || $f =~ /\.test\.tsx?$/; next }
              next unless $f && /^\+/ && !/^\+\+\+/;
              next if /i18n:allow-hardcoded-copy/;
              next if /^\+\s*(\/\/|\/\*|\*|\{\/\*)/;
              print "$f: $_" if /\p{Hangul}/' \
  || echo "i18n guard: no hardcoded Korean copy candidates found."
```

명령: `npx vitest run`
기대 결과: 전부 통과하고 실패 0.

- [ ] **Step 2: 추가한 줄에 금지 문장 부호가 없는지 훑는다**

명령:

```bash
git diff origin/main...HEAD -U0 | grep -E '^\+' | grep -v '^\+\+\+' | grep -P '[·—→←⇒①-⑳Ⓐ-Ⓩ]' || echo "no banned punctuation in added lines"
```

기대 결과: `no banned punctuation in added lines`. 걸리는 줄이 있으면 쉼표나 "와/과"로 바꾼다. 원고 본문이 아니라 우리가 쓴 줄만 대상이다.

- [ ] **Step 3: 백엔드가 떠 있는지 확인한다**

명령:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://api.barodori.com/api/v2/knowledge-lab/web/contents?market=KR&locale=ko&collection=head_shape_lab"
```

`200`이면 운영 API로 Step 4를 진행한다. `404`나 다른 값이면 백엔드가 아직 배포되지 않은 것이므로 목 서버로 진행하고, PR 본문에 그 사실을 적는다.

- [ ] **Step 4: 개발 서버를 띄우고 여섯 화면을 확인한다**

운영 API를 쓸 때:

```bash
BARODORI_API_BASE_URL=https://api.barodori.com npm run dev
```

목 서버를 쓸 때:

```bash
node scripts/mock-lab-api.mjs &
BARODORI_API_BASE_URL=http://127.0.0.1:4010 npm run dev
```

다음을 열고 화면을 저장한다.

| 화면 | 주소 | 확인할 것 |
| --- | --- | --- |
| 목록 | `/ko/articles` | 추천 3편, 네 분류 필터, 두상연구소 카드 격자, 월령별 두 트랙 목록, 카드 메타의 쉼표 구분자 |
| 상세 운동 가이드 | `/ko/articles/<운동 가이드 UUID>` | 목차, 백엔드 자산 이미지, 표, 콜아웃, 접기, 기능 버튼, 첨부 링크, h1 하나 |
| 상세 자주 묻는 질문 | `/ko/articles/<FAQ UUID>` | 헤더 배지가 자주 묻는 질문, 본문과 관련 글 |
| 상세 월령별 | `/ko/articles/<월령별 UUID>` | 개월 배지, 같은 트랙 이웃 개월 관련 글 |
| FAQ | `/ko/faq` | 질문 목록, 자세히 읽기 링크, 카테고리 칩 없음 |
| 영어 | `/en/articles` | 빈 상태 문구. `market=KR`에 영어 게시본이 없으므로 비어 있는 것이 정상이다 |

운영 API로 확인할 때는 성공 기준도 함께 본다. 두상연구소 27편(운동 가이드 10, 질환 정보 5, 자주 묻는 질문 9, 상단 3)과 월령별 26편이 오는지, 추천 영역에 노션에서 상단 노출로 지정한 3편이 오는지 센다.

브라우저 개발자 도구 네트워크 탭에서 이미지 요청이 `/api/v2/knowledge-lab/web/contents/.../assets/...`로 나가고 `Content-Disposition: inline`으로 열리는지 본다. 본문에 원시 HTML이 문자열로 남아 보이면 백엔드 계약과 다른 응답이므로 그 콘텐츠 ID를 적어 백엔드 쪽에 알린다.

- [ ] **Step 5: 옛 슬러그 리다이렉트를 확인한다**

명령:

```bash
for slug in torticollis-symptoms tummy-time-guide baby-head-shape-asymmetry-record torticollis-stretching-safety-record baby-neck-turning-one-side baby-torticollis-homecare-record; do
  curl -s -o /dev/null -w "$slug %{http_code} %{redirect_url}\n" "http://localhost:3000/ko/articles/$slug"
done
```

기대 결과: 여섯 줄 모두 `308 http://localhost:3000/ko/articles`.

- [ ] **Step 6: 빌드를 확인한다**

명령: `npm run build`
기대 결과: 성공. `prebuild`의 `scripts/fetch_model.mjs`가 블롭 토큰을 요구하므로 `BLOB_READ_WRITE_TOKEN`이 없는 환경에서는 실패한다. 그 경우 이 단계를 건너뛰고 PR 본문에 적는다. Vercel 프리뷰 배포가 같은 검증을 대신한다.

- [ ] **Step 7: PR을 연다**

```bash
git push -u origin docs/lab-articles-web-design
gh pr create --base main --title "feat: 아티클과 FAQ를 Knowledge Lab 웹 엔드포인트에 런타임 연동한다" --body "$(cat <<'EOF'
## 무엇을 했나

웹의 아티클과 FAQ가 1.4 시절 MDX 6편과 커뮤니티 공식 콘텐츠 대신 백엔드 Knowledge Lab의 익명 웹 읽기 엔드포인트를 읽는다. 앱과 같은 원본을 운동 가이드, 질환 정보, 자주 묻는 질문, 월령별 네 분류로 보여준다.

- `lib/api/knowledgeLab.ts`가 목록, 상세, 자산 URL을 담당하고 모든 요청에 `next: { revalidate: 86400, tags: ['lab-content'] }`를 붙인다.
- `lib/content/labArticle.ts`가 제목 분리, 분류와 트랙 판정, 요약 규칙, 개월 라벨, 읽는 시간, v1 블록 변환을 맡는다.
- `components/article/LabDocument.tsx`가 마크다운 조각과 콜아웃, 접기를 그린다. `lab-asset` 이미지와 첨부는 백엔드 자산 URL로 바꾸고, 기능 어미로 끝나는 인라인 코드는 설치 페이지 버튼이 된다.
- 상세 주소가 `/[locale]/articles/<콘텐츠 UUID>`로 바뀌고 옛 슬러그 6개는 목록으로 308 이동한다.
- `POST /api/revalidate`가 토큰을 검사하고 `revalidateTag('lab-content', 'max')`를 부른다.

## 결정 두 가지

- 세 페이지에서 `export const dynamic = 'force-dynamic'`을 지웠다. Next 16 문서의 `caching-without-cache-components.md`에 따르면 그 설정은 모든 `fetch`를 `{ cache: 'no-store', next: { revalidate: 0 } }`로 만들어 하루 캐시와 태그 무효화를 무력화한다. 목록과 FAQ는 `searchParams`를 읽어 여전히 요청 시점에 렌더된다.
- `listLabContents`는 설계 5.1절의 시그니처와 달리 `{ items, error }`를 돌려준다. 같은 절이 "호출부가 error 문자열을 받아 안내 문구를 보여준다"고 요구하기 때문이다.

## 검증

- `npm run typecheck`, `npm run lint`, `npm run i18n:check`, `npx vitest run` 전부 통과
- 개발 서버로 목록, 운동 가이드 상세, 자주 묻는 질문 상세, 월령별 상세, FAQ, 영어 목록 확인
- 옛 슬러그 6개 308 확인

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01DbRBNTDCdvN3WkgH1JTgoq
EOF
)"
```

실측을 목 서버로 했다면 PR 본문의 검증 절에 "백엔드 웹 라우트가 아직 배포되지 않아 `scripts/mock-lab-api.mjs`로 확인했다. 배포 뒤 운영 API로 다시 확인한다."를 덧붙인다. `npm run build`를 건너뛰었다면 그것도 적는다.

---

## 셀프 리뷰

### 설계 문서 절과 태스크 대응

| 설계 절 | 내용 | 태스크 |
| --- | --- | --- |
| 5.1 | `lib/api/knowledgeLab.ts` 클라이언트, 캐시 옵션, 실패 처리, UUID 검증 | Task 1 |
| 5.2 | `lib/content/labArticle.ts` 도메인 모델과 매핑 규칙 | Task 4 |
| 5.3 | `app/api/revalidate/route.ts`와 토큰, 태그 필터 | Task 12 |
| 6 | 네 분류와 라벨, 목록 URL, 상세 URL, 옛 슬러그 리다이렉트, `CategoryFilter` | Task 3, Task 7, Task 8, Task 9, Task 13 |
| 7.1 | 아티클 목록, 추천 3편, 월령별 트랙 목록, 검색, 카드 메타 | Task 7, Task 8 |
| 7.2 | 아티클 상세 `[id]`, 헤더, 목차, 관련 글, 설치 링크, 메타데이터와 JSON-LD | Task 6, Task 9 |
| 7.3 | FAQ 페이지와 `FaqAccordion` | Task 11 |
| 7.4 | sitemap | Task 10 |
| 8 | `LabDocument` 세 노드, 이미지와 첨부, 기능 버튼, 제목 id | Task 5 |
| 9 | 삭제 목록 | Task 9, Task 10, Task 11, Task 13 |
| 10 | 사전 변경 | Task 2(추가), Task 13(제거) |
| 11 | 계측 | Task 5(`article_feature_link`), Task 9(`article_view`, `article_body`, `article:<id>`) |
| 12 | 접근성과 SEO, h1 하나, `#`를 `##`로 | Task 5, Task 6, Task 9 |
| 13 | 테스트 | Task 1, 3, 4, 5, 6, 7, 10, 11, 12, 14 |
| 14 | 범위 밖 | 계획에 넣지 않음. MDX 의존성(`@mdx-js/*`, `next-mdx-remote`, `gray-matter`, `reading-time`)은 남긴다 |
| 15 | 성공 기준 | Task 14 |

### 이름 일관성

- 클라이언트 타입: `LabCard`, `LabContent`, `LabRenderNode`, `LabAsset`, `LabListResult`. Task 1에서 정의하고 Task 4, 5, 6, 10이 같은 이름으로 읽는다.
- 도메인 타입: `LabArticleCard`, `LabArticle`, `ArticleTrack`, `MonthLabels`. Task 4에서 정의하고 Task 7, 8, 9, 11이 쓴다. 컴포넌트 `LabArticleCard`와 타입 이름이 같으므로 컴포넌트 파일에서는 `type LabArticleCard as LabArticleCardModel`로 가져온다. Task 7, 9, 11의 코드가 모두 그렇게 되어 있다.
- 분류: `ArticleCategory`, `articleCategories`, `articleCategoryLabels`, `isArticleCategory`. 설계 6절의 표는 `categoryLabels`라고 적었지만, 옛 `categoryLabels`와 한 파일에서 잠시 공존해야 해서 `article` 접두사를 붙였다. Task 13 이후에도 이 이름을 유지한다.
- 캐시 태그: `LAB_CACHE_TAG = 'lab-content'`를 `lib/api/knowledgeLab.ts`에 한 번만 정의하고 `lib/cache/revalidate.ts`가 가져다 쓴다.
- 계측: `cta_install_click`에 `surface`가 세 값이다. 본문 기능 버튼 `article_feature_link`(Task 5), 상세 하단 안내 링크 `article_body`(Task 9), 상세 하단 설치 CTA `article:<id>`(Task 9, `InstallCta`가 그대로 받는다).

### 플레이스홀더 점검

- 모든 코드 블록에 생략 없는 본문이 들어 있다. `...`로 남긴 구현은 없다.
- UUID는 Task 1 픽스처의 상수 네 쌍으로 고정했고, Task 9와 Task 14가 같은 값을 쓴다.
- 커밋 메시지 12개가 모두 Korean 접두사와 두 줄 트레일러를 갖는다.
- 검증 명령마다 기대 결과를 적었다.

### 알려진 제약

- `react-markdown` 10에는 `inline` 플래그가 없어 언어 표시가 없는 펜스 코드 블록은 인라인 코드로 그려진다. 백엔드 원고는 산문이라 펜스 블록이 드물고, Task 14의 실측에서 실제로 나오는지 확인한다. 나온다면 후속으로 `pre` 렌더러에 컨텍스트 플래그를 둔다.
- 목 서버 픽스처가 `lib/api/__fixtures__/knowledgeLab.ts`와 `scripts/mock-lab-fixtures.json` 두 벌이다. 한쪽만 고치면 어긋난다. README 운영 절에 같은 값을 유지하라고 적어 둔다.
- 상세 페이지의 분류는 두 컬렉션에 모두 배치된 콘텐츠일 때 두상연구소 배치를 먼저 본다. 설계 문서가 이 경우를 정하지 않아 `placementFor`가 그렇게 정하고 Task 4의 테스트가 그 동작을 고정한다.
