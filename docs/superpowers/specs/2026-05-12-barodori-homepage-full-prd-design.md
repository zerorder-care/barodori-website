# 바로도리 공식 홈페이지 확장 설계

**작성일**: 2026-05-12  
**대상 레포**: `barodori-website`  
**관련 백엔드**: `../barodori-backend/app/modules/community/*`, `../barodori-backend/app/modules/content/*`, `../barodori-backend/app/modules/admin/*`  
**상세 개발 문서**: `docs/superpowers/plans/2026-05-13-content-module-api-development.md`  
**범위**: PRD 기반 공식 홈페이지 IA, 화면 스캐폴딩, 추후 API 연동 계약

## 1. 목표

바로도리 공식 홈페이지를 앱 다운로드 전환, 사경/사두 정보 탐색, 보호자 신뢰 형성, 커뮤니티 맛보기까지 연결되는 모바일 우선 반응형 사이트로 확장한다.

이번 웹 레포 작업은 프론트 단독으로 가능한 영역을 우선 구현한다. 뉴스룸과 FAQ는 앱과 웹에서 함께 쓸 수 있는 운영 콘텐츠이므로 백엔드에서는 `content` 단일 모듈이 소유하고, 어드민은 관리 진입점만 제공한다.

## 2. 라우팅

기존 Next.js 16 App Router 구조를 유지한다. `params`와 `searchParams`는 Promise로 처리한다.

| Route | 목적 | 1차 구현 |
|---|---|---|
| `/{locale}` | 홈 | PRD 섹션 확장 |
| `/{locale}/product` | 서비스 소개 | 기존 제품 페이지 확장 |
| `/{locale}/reviews` | 후기 | 정적 후기/전문가/미디어 섹션 |
| `/{locale}/community` | 커뮤니티 목록 | 목업 데이터 + 탭/검색/정렬 |
| `/{locale}/community/[postId]` | 커뮤니티 상세 | 목업 상세 + 댓글 보기 |
| `/{locale}/articles` | 아티클 목록 | 기존 MDX 목록 + 추천/검색 확장 |
| `/{locale}/articles/[slug]` | 아티클 상세 | 기존 MDX 상세 유지 |
| `/{locale}/newsroom` | 뉴스룸 | 목업 데이터 + 카테고리/검색 |
| `/{locale}/faq` | 자주 묻는 질문 | 목업 데이터 + 검색/아코디언 |
| `/{locale}/login` | 로그인/회원가입 | 소셜 로그인 UI 스텁 |
| `/{locale}/mypage` | 마이페이지 | 로그인 전환 전 안내형 스텁 |
| `/{locale}/install` | 앱 설치 | 기존 베타/스토어 분기 유지 |
| `not-found.tsx` | 404 | 브랜드 톤 에러 페이지 |
| `error.tsx` | 500/예상 외 오류 | 재시도/홈 이동 |

## 3. 공통 레이아웃

### Header

- 메뉴: 서비스 소개, 후기, 커뮤니티, 아티클, 뉴스룸, 자주 묻는 질문
- 우측: 로그인, CTA
- 현재 앱 출시 상태는 `lib/install/storeLinks.ts`의 env 기반 `isAppLive()`로 판단한다.
- 베타 단계: `베타 신청`을 활성 CTA로 사용하고 앱 다운로드는 출시 예정 안내로 처리한다.
- 정식 출시 후: `NEXT_PUBLIC_IOS_APP_URL`, `NEXT_PUBLIC_ANDROID_APP_URL`이 모두 설정되면 앱 다운로드 CTA로 전환한다.
- CTA 분기는 PRD의 "베타 단계: 베타 신청 활성 / 앱 다운로드 출시 예정", "정식 출시 후: 앱 다운로드 활성" 정책과 동일하다.
- 모바일: 햄버거 메뉴 안에 GNB, 로그인, CTA, 언어 전환을 포함한다.

### Footer

- 회사 정보, 법적 링크, 고객센터, SNS 링크 슬롯을 제공한다.
- 사업자등록번호 등 미확정 값은 화면에서 `확인 중`처럼 운영상 안전한 표현으로 둔다.

### Kakao Floating CTA

- 모든 페이지 우측 하단 고정.
- `NEXT_PUBLIC_KAKAO_CHANNEL_URL`이 있으면 외부 채널로 연결한다.
- env가 없으면 FAQ 또는 install 흐름으로 대체하거나 비활성 안내를 노출한다.

## 4. 데이터 전략

### 4.1 지금 가능한 구현

1차 구현에서는 아래 정적 TypeScript 데이터 파일을 둔다. 현재 웹 레포에는 4개 파일이 추가되어 있으며, API 연동 시 데이터 fetcher로 교체한다.

```
lib/content/reviews.ts
lib/content/community.ts
lib/content/newsroom.ts
lib/content/faq.ts
```

각 페이지는 필터/검색/정렬을 클라이언트 컴포넌트에서 처리한다. 이 구조는 API 연동 시 데이터 소스만 교체할 수 있다.

현재 정적 데이터 커버리지:

- `reviews.ts`: 보호자 후기, 전문가 추천, 미디어 멘션
- `community.ts`: 목록/상세/댓글 목업
- `newsroom.ts`: 공지/보도자료/제휴 목업
- `faq.ts`: 서비스 일반, 측정·진단, 비용·결제, 개인정보·보안, 기술 문제 카테고리와 질문

### 4.2 백엔드 확인 결과와 모듈 방향

관리자 API:

- `GET /admin/community/posts`
- `GET /admin/community/posts/{post_id}`
- `POST /admin/community/posts`
- `PATCH /admin/community/posts/{post_id}`
- `GET /admin/community/reports`

앱 커뮤니티 API:

- `GET /community/posts`
- `GET /community/posts/{post_id}`
- `GET /posts/{post_id}/comments`
- `POST /community/posts/search`

현재 앱 커뮤니티 API는 `CurrentUserDep`가 필요하므로 PRD의 "비회원도 글 열람 가능"과 바로 맞지 않는다. 홈페이지 공개 커뮤니티를 실제 데이터로 운영하려면 공개 읽기 전용 엔드포인트가 필요하다.

공개 커뮤니티 API는 기존 인증 route와 충돌하지 않도록 `/api/v1/community/public/posts` 하위에 둔다. 구현 단계와 응답 정책은 상세 개발 문서의 "Community Public Route" 섹션을 따른다.

뉴스룸과 FAQ는 현재 별도 모듈이 없다. `faq`와 `newsroom`을 각각 독립 모듈로 만들기에는 규모가 작고, `homepage` 모듈은 소비자 채널에 종속되며, `admin` 모듈에 소유시키면 앱/웹 공개 조회 도메인이 운영자 모듈에 묶인다. 따라서 `content` 단일 모듈을 추가해 FAQ와 뉴스룸의 모델/레포지토리/서비스/스키마/공개 조회를 소유하게 한다.

어드민 관리 API는 `admin` prefix로 노출하되, 도메인 로직은 `content` 서비스에 위임한다. 결합 방향은 `admin -> content` 단방향으로 제한한다.

### 4.3 필요한 API 제안

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/v1/community/public/posts` | 공개 게시글 목록. `category`, `sort`, `q`, `offset`, `limit` |
| `GET` | `/api/v1/community/public/posts/{post_id}` | 공개 상세. 비공개/숨김 글 제외 |
| `GET` | `/api/v1/community/public/posts/{post_id}/comments` | 공개 댓글 목록. 숨김/차단 정책 반영 |
| `GET` | `/api/v1/content/newsroom` | 공개 뉴스룸 목록. `category`, `q`, `page`, `pageSize` |
| `GET` | `/api/v1/content/newsroom/{post_id}` | 공개 뉴스룸 상세 |
| `GET` | `/api/v1/content/faqs` | 공개 FAQ 목록. `category`, `q` |
| `GET` | `/api/v1/content/faq-categories` | 앱/웹 공통 FAQ 카테고리 |
| `GET` | `/api/v1/admin/content/newsroom` | 뉴스룸 관리 목록 |
| `POST` | `/api/v1/admin/content/newsroom` | 뉴스룸 작성 |
| `PATCH` | `/api/v1/admin/content/newsroom/{post_id}` | 뉴스룸 수정/게시 상태 변경 |
| `DELETE` | `/api/v1/admin/content/newsroom/{post_id}` | 뉴스룸 삭제 또는 숨김 |
| `GET` | `/api/v1/admin/content/faqs` | FAQ 관리 목록 |
| `POST` | `/api/v1/admin/content/faqs` | FAQ 작성 |
| `PATCH` | `/api/v1/admin/content/faqs/{faq_id}` | FAQ 수정/게시 상태 변경 |
| `DELETE` | `/api/v1/admin/content/faqs/{faq_id}` | FAQ 삭제 또는 숨김 |

공개 API는 개인화 필드(`is_liked`, `is_mine`)를 제외하고, 익명/비공개/신고 숨김 정책과 게시 상태 필터링을 서버에서 처리해야 한다.

권장 백엔드 구조:

```
app/modules/content/
  models/
    newsroom.py
    faq.py
  repositories/
    newsroom.py
    faq.py
  services/
    newsroom.py
    faq.py
  schemas/
    newsroom.py
    faq.py
  routes/v1/
    newsroom.py
    faqs.py

app/modules/admin/routes/v1/
  content_newsroom.py
  content_faqs.py
```

`admin` route는 인증/권한/감사 로그/관리자 rate limit을 담당하고, 실제 CRUD 규칙과 조회 정책은 `content` service가 소유한다.

## 5. 인증

홈페이지 로그인은 소셜 로그인만 지원한다. 이번 1차 프론트에서는 UI와 복귀 흐름 슬롯만 만든다.

1차 UI 스텁 버튼:

- 카카오톡
- Google
- Naver
- Apple

필요한 추후 계약:

- OAuth provider redirect URL
- 앱 계정과 웹 세션 통합 방식
- 온보딩 완료 여부와 웹 로그인 후 재온보딩 정책
- 마이페이지의 내 정보/아이 정보 조회 및 수정 API

## 6. 출시 단계 CTA

현재 날짜 기준 운영 PRD에는 정식 출시일이 2025-06-01로 되어 있지만 기존 웹 구현은 `2026-05-20 베타 출시 예정` 문구를 사용한다. PRD 문구와 실제 운영 일정이 충돌하므로, 화면 문구는 설정 파일로 모아두고 최종 일정 확정 시 한 번에 교체한다.

권장 env:

```
NEXT_PUBLIC_IOS_APP_URL=
NEXT_PUBLIC_ANDROID_APP_URL=
NEXT_PUBLIC_BETA_FORM_URL=
NEXT_PUBLIC_KAKAO_CHANNEL_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_NAVER_BLOG_URL=
NEXT_PUBLIC_YOUTUBE_URL=
```

## 7. SEO와 의료 표현

- 아티클은 기존 MDX SEO 구조를 유지한다.
- 후기와 메인 카피는 치료 효과 단정 표현을 피한다.
- 모든 주요 페이지 하단 또는 본문 인접 영역에 "의료기관 진단을 대체하지 않는다"는 안내를 유지한다.
- 커뮤니티/후기 목업은 실제 사용자 동의 전까지 예시 데이터임을 내부 운영 단계에서 구분한다.

## 8. 구현 순서

1. 공통 레이아웃: Header, Footer, Kakao floating CTA
2. 정적 콘텐츠 모델: 후기, 커뮤니티, 뉴스룸, FAQ
3. 신규 페이지: reviews, community, newsroom, faq, login, mypage
4. 기존 홈/제품/아티클 확장
5. 에러 페이지
6. typecheck, tests, build, 브라우저 QA
