# 앱 2.0.0 아티클과 FAQ를 웹에 런타임으로 연동하는 설계

2026-09-30. 백엔드 레포의 계약 문서 `docs/specs/knowledge-lab-web-contract.md`와 짝을 이룬다. 이 문서는 웹사이트 쪽 설계와 두 레포에 걸친 결정을 담고, 백엔드 문서는 API 계약만 담는다.

## 1. 배경과 목표

앱 2.0.0의 두상연구소(운동 가이드, 질환 정보, 자주 묻는 질문)와 월령별 아티클은 백엔드 Knowledge Lab에 게시되어 있고 운영 DB에 전부 올라가 있다. 웹사이트의 아티클 페이지는 1.4 시절에 쓴 MDX 6편과 비어 있는 커뮤니티 공식 콘텐츠 API를 합쳐 보여주고, FAQ 페이지는 백엔드 FAQ API를 읽는데 남은 항목이 1.4 시절 답변 하나뿐이다.

목표는 웹의 아티클과 FAQ가 앱과 같은 원본을 읽게 하는 것이다. 앱의 소비 API는 로그인 토큰과 아기 ID를 요구하고 응답을 `private, no-store`로 내리므로 웹이 그대로 쓸 수 없다. 그래서 백엔드에 익명 웹용 읽기 엔드포인트를 추가하고, 웹은 그 엔드포인트를 서버에서 호출해 렌더한다.

## 2. 확정된 결정

- 런타임 연동. 노션 원고를 MDX로 옮기지 않고 백엔드 공개 엔드포인트를 서버 컴포넌트가 읽는다.
- 게시 범위는 Knowledge Lab에 게시된 전부다. 운동 가이드 10편, 질환 정보 5편, 두상 상단 3편, 자주 묻는 질문 9편, 월령별 26편.
- 분류는 앱 구조를 따른다. 운동 가이드, 질환 정보, 자주 묻는 질문, 월령별.
- 기존 MDX 아티클 6편과 커뮤니티 공식 콘텐츠 연동, FAQ 폴백 파일과 옛 FAQ API 연동은 제거한다. 옛 아티클 URL 6개는 목록으로 영구 리다이렉트한다.
- FAQ 페이지는 Knowledge Lab의 FAQ 9편을 아코디언으로 보여주고 상세로 연결한다.
- 캐시는 웹 한 곳에서 하루 단위로 잡고, 백엔드가 게시나 철회를 커밋한 뒤 웹훅으로 무효화한다.

## 3. 전체 흐름

```
운영자 대시보드 ── 게시/철회 ──> 백엔드 LabService
                                    │ commit 후 웹훅 POST
                                    v
                            웹 /api/revalidate ── revalidateTag('lab-content', 'max')

방문자 ──> 웹 서버 컴포넌트 ── fetch(revalidate 86400, tags lab-content) ──> 백엔드 /api/v2/knowledge-lab/web/...
                 │                                                          (public, max-age 60)
                 └── <img src=백엔드 자산 URL> ──────────────────────────────> 자산 바이트 (immutable 1년)
```

시장은 KR, 언어는 페이지 locale을 그대로 넘긴다. 영어 페이지는 `locale=en`으로 읽고 비어 있으면 빈 상태를 보여준다.

## 4. 백엔드 계약 요약

자세한 규칙은 백엔드 계약 문서에 있다. 웹이 의존하는 것만 적는다.

| 엔드포인트 | 용도 | 응답 |
| --- | --- | --- |
| `GET /api/v2/knowledge-lab/web/contents?market=KR&locale=ko&collection=head_shape_lab&kind=` | 카드 목록 | `{ items: WebContentCard[] }` |
| `GET /api/v2/knowledge-lab/web/contents/{id}?market=KR&locale=ko` | 상세 | 앱과 같은 `PublicContent` 또는 `MarkdownPublicContent` |
| `GET /api/v2/knowledge-lab/web/contents/{id}/revisions/{rid}/assets/{aid}?market=KR&locale=ko` | 이미지와 첨부 바이트 | 이미지는 inline, 첨부는 attachment |

`WebContentCard`는 `{ id, revisionId, kind, title, summary, thumbnailUrl, durationSeconds, targetTracks, placements, publishedAt, heroAsset }`이고 `heroAsset`은 `{ assetVersionId, contentType }` 또는 null이다. 본문은 목록에 없다.

정렬은 앱과 같다. 두상연구소는 배치 순서, 게시일 내림차순, ID 순이고 두상 대상 글이 사경 전용 글보다 먼저 온다. 월령별은 `monthMin` 오름차순, 그 안에서 같은 규칙이다. 월령별은 앱과 달리 아기 월령으로 한 편만 고르지 않고 전부 내린다.

봉투는 기존과 같은 `{ code, message, data }`이고 성공은 `code: 0`이다.

## 5. 웹 데이터 계층

### 5.1 클라이언트 `lib/api/knowledgeLab.ts`

`fetchBackendApi`는 `cache: 'no-store'`를 강제하므로 쓰지 않고, 같은 봉투 검사를 하는 `fetchLabApi`를 이 파일 안에 둔다.

```ts
export type LabKind = 'exercise_guide' | 'disease_info' | 'faq'
export type LabCollection = 'head_shape_lab' | 'home_monthly_information'
export type LabTrack = 'head_shape' | 'torticollis'

export async function listLabContents(params: { locale: Locale; collection: LabCollection; kind?: LabKind }): Promise<{ items: LabCard[]; error?: string }>
export async function getLabContent(params: { locale: Locale; id: string }): Promise<{ item: LabContent | null; error?: string }>
export function labAssetUrl(params: { contentId: string; revisionId: string; assetVersionId: string; locale: Locale }): string
```

- 모든 fetch는 `{ next: { revalidate: 86400, tags: ['lab-content'] } }`로 부른다.
- 아티클 목록, 상세, FAQ 페이지의 `export const dynamic = 'force-dynamic'`은 지운다. 이 Next 16에서는 그 설정이 페이지 안의 모든 fetch를 `no-store`로 바꾸어 하루 캐시와 태그 무효화를 무력화한다(`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`). 목록과 FAQ는 `searchParams`를 읽으므로 요청 시점 렌더가 유지되고, 상세는 첫 요청에 렌더되어 태그와 함께 캐시된다.
- `searchParams`를 읽는 페이지, 곧 목록과 FAQ는 캐시 경계를 두 가지로 보강한다. 첫째, 데이터 요청을 `await searchParams`보다 앞에서 시작한다. `listLabContents`는 locale만 있으면 되므로 `params`를 읽고 locale을 검증한 직후에 부르고, 분류와 검색어는 내려받은 목록을 서버에서 거르는 데만 쓴다. 둘째, 세그먼트에 `export const fetchCache = 'default-cache'`를 두어 순서가 흐트러져도 fetch가 자기 캐시 옵션을 그대로 쓰게 한다. 상세 페이지는 `searchParams`를 읽지 않아 fetch가 요청 시점 API보다 앞에 오므로 두 조치가 필요 없다.
- 보강인 이유는 이렇다. 같은 Next 문서의 `fetchCache` 절은 기본값 `'auto'`가 요청 시점 API보다 뒤에서 발견된 fetch를 캐시하지 않는다고 설명하지만, Next.js 16.2.4에서 실측하니 그렇지 않았다. 목 API 앞에 요청 수를 세는 프록시를 두고 `next build`와 `next start`로 확인한 결과, `await searchParams` 뒤에서 부르는 순서에서도 첫 요청만 상위 API를 부르고 이후 요청은 캐시에서 나왔다. 즉 하루 캐시와 태그 무효화는 `force-dynamic`만 지우면 동작한다. 위 두 조치는 문서가 경고하는 경계에 기대지 않으려는 것이고, 앞당긴 fetch는 덤으로 빌드 시점에 목록을 미리 받아 둔다.
- 시장은 `KR` 상수다. 시장을 바꿀 일이 생기면 locale과 함께 인자로 올린다.
- 목록과 상세가 실패하면 예외를 던지지 않고 빈 배열이나 null과 함께 `error` 문자열을 돌려주며, 호출부가 그 값으로 안내 문구를 보여준다. 지금 `listArticlePosts`가 하는 방식과 같다.
- ID는 UUID 형식만 백엔드에 넘긴다. 형식이 아니면 백엔드를 부르지 않고 null을 돌려준다.

### 5.2 도메인 모델 `lib/content/labArticle.ts`

`Article` 타입과 MDX 로더를 지우고 다음으로 바꾼다.

```ts
export type ArticleCategory = 'exercise-guide' | 'disease-info' | 'faq' | 'monthly'

export type LabArticleCard = {
  id: string
  revisionId: string
  category: ArticleCategory
  kind: LabKind
  title: string
  subtitle: string | null
  excerpt: string
  heroImage: string | null
  track: LabTrack | 'both'
  monthMin: number | null
  monthMax: number | null
  publishedAt: string
  readingMinutes: number
  locale: Locale
}

export type LabArticle = LabArticleCard & {
  document: RenderNode[]
  assets: LabAsset[]
}
```

- 카테고리는 `collection`이 월령별이면 `monthly`, 아니면 `kind`에서 정한다.
- 제목 `"본제목(부제: 부제)"`는 `splitTitle`이 본제목과 부제로 가른다. 괄호가 없으면 부제는 null이다. 목록 카드와 상세 헤더, 메타데이터 title은 본제목만 쓴다.
- `excerpt`는 `summary`가 있으면 그것, 없으면 부제, 둘 다 없으면 본문 첫 마크다운 노드의 첫 문단에서 마크다운 기호를 벗겨 120자로 자른 것이다.
- `heroImage`는 `thumbnailUrl`이 있으면 그것, 없으면 `heroAsset`으로 만든 자산 URL, 둘 다 없으면 null이다. 카드는 null이면 이미지 영역에 분류별 옅은 배경만 둔다.
- `track`은 `targetTracks`에 두 값이 다 있으면 `both`다.
- `readingMinutes`는 `durationSeconds`가 있으면 올림한 분, 없으면 요약과 본문 길이로 추정한다(공백 제거 500자당 1분, 최소 1).
- v1 블록 형식(`schemaVersion: 1`)은 `blocks`를 문단과 제목 마크다운 노드 하나로 바꿔 같은 렌더러에 태운다.

### 5.3 캐시 무효화 `app/api/revalidate/route.ts`

- `POST`만 받는다. `Authorization: Bearer <LAB_REVALIDATE_TOKEN>`이 맞지 않으면 401.
- 본문은 `{ tags?: string[] }`이며 허용 태그는 `lab-content` 하나다. 다른 값은 무시한다.
- `revalidateTag('lab-content', 'max')`를 부르고 `{ revalidated: true, tags: ['lab-content'] }`를 돌려준다.
- 토큰 환경 변수가 비어 있으면 503으로 응답해 설정 누락을 드러낸다.
- 운영자가 손으로 비울 때는 같은 엔드포인트를 curl로 부른다. 방법은 README의 운영 절에 적는다.

## 6. 분류, URL, 리다이렉트

`lib/content/categories.ts`를 새 네 분류로 바꾼다.

| 값 | ko | en | 원천 |
| --- | --- | --- | --- |
| `exercise-guide` | 운동 가이드 | Exercise guide | head_shape_lab, kind exercise_guide |
| `disease-info` | 질환 정보 | Conditions | head_shape_lab, kind disease_info |
| `faq` | 자주 묻는 질문 | FAQ | head_shape_lab, kind faq |
| `monthly` | 월령별 | By month | home_monthly_information |

- 목록 URL은 지금처럼 `/[locale]/articles?cat=<값>&q=<검색어>`다. 페이지네이션 `offset`은 없앤다. 전체가 50여 편이라 한 번에 내려도 된다.
- 상세 URL은 `/[locale]/articles/<콘텐츠 UUID>`다. 읽기 쉬운 슬러그는 백엔드에 필드가 없어 이번 범위에서 만들지 않는다.
- 옛 슬러그 6개(`torticollis-symptoms`, `tummy-time-guide`, `baby-head-shape-asymmetry-record`, `torticollis-stretching-safety-record`, `baby-neck-turning-one-side`, `baby-torticollis-homecare-record`)는 `next.config.ts`의 `redirects`로 `/ko/articles`에 308 영구 리다이렉트한다.
- `CategoryFilter`는 그대로 쓰되 새 분류 목록을 읽는다.

## 7. 페이지

### 7.1 아티클 목록 `app/[locale]/(site)/articles/page.tsx`

- 두 컬렉션을 병렬로 읽는다. `cat`이 없으면 전부, 있으면 그 분류만 보여준다. `q`는 본제목, 부제, 요약에 대해 서버에서 부분 일치로 거른다.
- 추천 영역은 두상연구소 목록의 앞 3편이다. 백엔드 정렬이 배치 순서를 먼저 보므로 노션에서 "상단에 노출"로 지정한 3편이 온다. 분류나 검색어가 걸려 있으면 추천 영역은 숨긴다.
- 월령별은 카드 격자 대신 트랙별 목록으로 보여준다. "근성 및 자세성 사경"과 "단순 두상" 두 묶음 아래 1개월부터 13개월 이상까지 개월 배지와 제목, 부제를 한 줄씩 둔다. 개월 배지는 `monthMin`과 `monthMax`로 만들며 `monthMax`가 null이면 "13개월 이상"이다.
- 카드에는 분류 배지, 본제목, 요약, 게시일과 읽는 시간을 둔다. 지금 `ArticleCard`의 가운데점 구분자는 쉼표나 공백으로 바꾼다.
- 빈 상태와 오류 안내 문구는 지금 사전 키를 그대로 쓴다.

### 7.2 아티클 상세 `app/[locale]/(site)/articles/[id]/page.tsx`

- 폴더 이름을 `[slug]`에서 `[id]`로 바꾼다. `generateStaticParams`는 없앤다(전부 런타임).
- 헤더에 분류 배지, 본제목, 부제, 게시일, 읽는 시간, 월령별이면 개월 배지를 둔다. 작성자 표기는 "바로도리 콘텐츠팀" 고정이다.
- 목차 `Toc`는 렌더 문서의 마크다운 노드에서 `##`와 `###` 제목을 모아 만든다. 접기 노드 안의 제목은 목차에 넣지 않는다.
- 본문은 8절의 `LabDocument`가 그린다.
- 관련 글은 같은 분류에서 자기 자신을 뺀 앞 2편이다. 월령별이면 같은 트랙의 이웃 개월 2편이다.
- 상세 하단의 홈 기능 링크(`article_to_home_features_click`)는 홈에 `#home-features` 앵커가 더 이상 없으므로 설치 페이지 링크로 바꾸고 이벤트는 `cta_install_click`에 `surface: 'article_body'`로 통일한다.
- 의료 안내 `MedicalNotice`와 설치 CTA는 그대로 둔다.
- 메타데이터 title은 본제목, description은 `excerpt`, OG 이미지는 `heroImage`가 있을 때만 넣는다. JSON-LD `articleJsonLd`는 지금 필드를 그대로 채운다.

### 7.3 FAQ `app/[locale]/(site)/faq/page.tsx`

- `getFaqContent`를 지우고 `listLabContents({ collection: 'head_shape_lab', kind: 'faq' })`를 읽는다.
- 항목은 질문이 본제목, 답변이 `excerpt`(요약이 있으면 요약, 없으면 부제)다. 답변 아래에 "자세히 읽기" 링크로 상세에 연결한다.
- 카테고리 칩은 없앤다. 검색 폼은 남기고 질문과 답변에 대해 부분 일치로 거른다.
- `FaqAccordion`은 카테고리 props를 지우고 항목에 `href`를 받는다. 기존 `FaqItem` 타입은 `{ id, question, answer, href }`로 바꾼다.
- 카카오 문의 영역은 그대로 둔다.

### 7.4 sitemap

`app/sitemap.ts`는 두 컬렉션을 읽어 모든 글의 상세 URL을 넣는다. `lastModified`는 `publishedAt`이다.

## 8. 본문 렌더러 `components/article/LabDocument.tsx`

백엔드 렌더 문서는 세 종류 노드다. 마크다운 조각 `{ type: 'markdown', markdown }`, 콜아웃 `{ type: 'callout', icon, children }`, 접기 `{ type: 'disclosure', title, children }`. 서버 컴포넌트가 재귀로 그린다.

- 마크다운 조각은 `react-markdown`에 `remark-gfm`을 붙여 그린다. 표, 취소선, 할 일 목록을 지원해야 하므로 GFM이 필요하다. 원시 HTML은 켜지 않는다(`rehype-raw` 사용 금지). 백엔드가 인라인 HTML을 이미 노드로 바꾸어 내리므로 남는 HTML은 없어야 하며, 남는 경우는 구현 첫 단계의 실측 응답으로 확인한다.
- `next-mdx-remote`는 MDX 문법으로 해석해 중괄호나 꺾쇠에 깨질 수 있어 이 본문에는 쓰지 않는다. 기존 MDX 의존성은 이 작업에서 제거하지 않고 후속으로 넘긴다.
- 콜아웃은 기존 `Callout` 컴포넌트의 시각 언어를 따르는 `LabCallout`으로 그리고 `icon`을 앞에 둔다.
- 접기는 `<details><summary>`로 그린다.
- 이미지 `![alt](lab-asset:<id>)`는 `labAssetUrl`로 바꿔 `<img>`로 그린다. 앱 자산 크기를 알 수 없어 `next/image`의 고정 폭 방식은 쓰지 않고, 폭 100%에 `loading="lazy"`를 준다. alt가 비어 있으면 본제목을 넣는다.
- 링크 `[텍스트](lab-asset:<id>)`는 첨부 다운로드 링크로 그리고 파일 이름을 자산 목록에서 찾아 옆에 적는다. 외부 https 링크는 새 창으로 연다.
- 인라인 코드는 앱 기능 버튼 후보다. 텍스트가 `시작하기`, `하러가기`, `알아보기`, `찾아보기`, `찾기`, `보기`, `세팅하기`, `기록하기` 중 하나로 끝나면 설치 페이지로 가는 버튼(`TrackedLink`, `cta_install_click`, `surface: 'article_feature_link'`)으로 그리고, 아니면 `<code>`로 둔다. 의학 용어 인라인 코드가 그대로 남는 이유다.
- 제목은 `rehype-slug`와 같은 규칙으로 id를 붙여 목차와 맞춘다. `react-markdown`에 `rehype-slug`를 붙이면 된다.

렌더러 결과에는 가운데점이나 em-dash를 새로 넣지 않는다. 원고 안의 문장 부호는 원고의 것이므로 손대지 않는다.

## 9. 삭제 목록

- `content/articles/` 전체, `public/articles/` 전체
- `lib/content/articles.ts`, `lib/content/faq.ts`, `lib/api/articles.ts`, `lib/api/community.ts`(이미 호출부 없음)
- `lib/api/content.ts`의 FAQ 부분(`getFaqContent`, `sanitizeFaqAnswer`, FAQ 타입). 뉴스룸 부분은 남긴다.
- `components/article/mdx/ExerciseCard.tsx`, `mdx-components.tsx`에서 아티클 전용 매핑. `Callout`과 `MedicalNotice`는 남긴다.
- 사전에서 FAQ 카테고리 칩 관련 키와 아티클 `more`, `end`, `recommended*` 중 안 쓰게 되는 키
- `app/sitemap.test.ts`와 `lib/api/content.test.ts`의 FAQ 테스트는 새 구조에 맞게 다시 쓴다.

## 10. 사전 변경

- `article.categoryLabels`는 코드의 `categoryLabels`가 담당하므로 사전에 두지 않는다.
- 추가: `article.subtitleLabel`은 필요 없고, `article.monthRange` `"{min}개월"`, `article.monthRangeSpan` `"{min}개월부터 {max}개월"`, `article.monthPlus` `"13개월 이상"`, `article.trackTorticollis` `"근성 및 자세성 사경"`, `article.trackHeadShape` `"단순 두상"`, `article.author` `"바로도리 콘텐츠팀"`, `article.attachment` `"첨부 파일"`, `article.featureLink` `"앱에서 이어서 하기"`(버튼 보조 문구), `faq.readMore` `"자세히 읽기"`.
- 영어 값도 같은 키로 채운다.

## 11. 계측

- 목록 카드 클릭과 상세 진입은 지금 `ArticleViewTracker`가 보내는 `article_view`를 그대로 쓰되 `category`에 새 분류 값을 넣는다.
- 본문 기능 버튼은 `cta_install_click`에 `{ surface: 'article_feature_link', contentId, locale, live: true }`.
- 상세 하단 설치 CTA는 기존 `InstallCta`의 `surface: article:<id>`를 유지한다.

## 12. 접근성과 SEO

- 상세는 h1 하나(본제목), 부제는 `<p>`. 본문 제목은 `##`부터 시작하도록 렌더러가 `#`를 `##`로 올린다.
- 접기 노드는 네이티브 `details`라 키보드로 열 수 있다.
- 이미지 alt 규칙은 8절과 같다.
- `robots`는 변경 없음. sitemap은 7.4절.

## 13. 테스트

- `lib/api/knowledgeLab.test.ts`: 봉투 파싱, 실패 시 빈 값, UUID 검증, 자산 URL 조립.
- `lib/content/labArticle.test.ts`: 제목 분리, excerpt 규칙, 카테고리와 트랙 결정, 개월 배지 문자열, 읽는 시간 추정.
- `components/article/LabDocument.test.tsx`: 세 노드 렌더, 이미지 URL 치환, 첨부 링크, 기능 버튼 판별, GFM 표.
- `components/faq/FaqAccordion.test.tsx`: 항목과 링크 렌더, 빈 상태.
- `app/api/revalidate` 는 `lib/` 밖이라 vitest 대상이 아니므로 로직을 `lib/cache/revalidate.ts`로 빼서 토큰 검사와 태그 필터를 단위 테스트한다.
- 실측 검증: 개발 서버로 목록, 상세 세 종류(운동 가이드, FAQ, 월령별), 영어 페이지, FAQ를 열어 스크린샷으로 확인한다. 이미지가 백엔드 자산 URL로 뜨는지, 접기와 콜아웃이 그려지는지 본다.

## 14. 범위 밖과 후속

- 읽기 쉬운 슬러그와 옛 글 개별 리다이렉트
- 병원 찾기 데이터의 웹 노출
- 영어 아티클 편집(현재 US 파일럿 10편은 `market=US`라 KR 웹에서 보이지 않는다)
- MDX 관련 의존성 제거
- 아티클 페이지 자체의 2.0.0 디자인 정렬(이번에는 데이터 원천 교체와 새 분류 구조에 집중하고 시각 언어는 현재 아티클 페이지를 유지한다)

## 15. 성공 기준

- `/ko/articles`가 운영 API에서 두상연구소 27편(운동 가이드 10, 질환 정보 5, FAQ 9, 상단 3)과 월령별 26편을 보여주고, 추천 영역에 노션 지정 3편이 온다.
- 상세에서 이미지, 콜아웃, 접기, 표, 기능 버튼이 렌더되고 백엔드 자산이 inline으로 열린다.
- `/ko/faq`에 9개 질문이 뜨고 각 항목이 상세로 연결된다.
- 옛 슬러그 6개가 목록으로 영구 리다이렉트된다.
- `POST /api/revalidate`가 토큰 검사 후 태그를 무효화하고, 백엔드 게시 뒤 다음 방문에서 새 글이 보인다.
- typecheck, lint, i18n 검사, vitest 전부 통과. 홈과 다른 페이지의 기존 테스트가 깨지지 않는다.
