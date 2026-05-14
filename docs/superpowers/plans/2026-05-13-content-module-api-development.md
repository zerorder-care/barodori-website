# Content Module API 개발 문서

**작성일**: 2026-05-13  
**대상 백엔드**: `../barodori-backend`  
**관련 프론트**: `barodori-website`  
**목표**: 뉴스룸과 FAQ를 앱/웹 공통 운영 콘텐츠로 관리하고 공개 조회할 수 있는 `content` 모듈을 추가한다.

## 1. 결정 사항

### 1.1 모듈 소유권

뉴스룸과 FAQ는 `content` 모듈이 소유한다.

이유:

- `faq`, `newsroom`을 각각 모듈로 만들기에는 현재 규모가 작다.
- `homepage` 모듈은 소비 채널에 종속된다.
- `admin` 모듈이 소유하면 앱/웹 공개 조회 도메인이 운영자 모듈에 묶인다.
- FAQ는 앱에서도 쓰일 수 있으므로 홈페이지 전용 도메인으로 보면 안 된다.

### 1.2 Admin 결합 방향

`admin -> content` 단방향 결합만 허용한다.

- `content`는 admin을 import하지 않는다.
- admin route는 인증, 권한, rate limit, 감사 로그를 담당한다.
- 실제 CRUD 규칙, 공개 게시 정책, 정렬, 필터링은 `content` service가 소유한다.

### 1.3 URL 정책

공개 조회:

```txt
GET /api/v1/content/newsroom
GET /api/v1/content/newsroom/{post_id}
GET /api/v1/content/faqs
GET /api/v1/content/faq-categories
```

관리 API:

```txt
GET    /api/v1/admin/content/newsroom
POST   /api/v1/admin/content/newsroom
PATCH  /api/v1/admin/content/newsroom/{post_id}
DELETE /api/v1/admin/content/newsroom/{post_id}

GET    /api/v1/admin/content/faqs
POST   /api/v1/admin/content/faqs
PATCH  /api/v1/admin/content/faqs/{faq_id}
DELETE /api/v1/admin/content/faqs/{faq_id}
```

커뮤니티 공개 조회는 기존 `community` 모듈이 소유한다.

```txt
GET /api/v1/community/public/posts
GET /api/v1/community/public/posts/{post_id}
GET /api/v1/community/public/posts/{post_id}/comments
```

기존 인증 커뮤니티 API(`/api/v1/community/posts`)와 공개 API(`/api/v1/community/public/posts`)는 같은 `community` prefix를 쓰지만 route segment가 다르므로 FastAPI 라우터 충돌은 없다. 단, 구현 시 공개 route를 별도 파일로 분리해 `CurrentUserDep`가 섞이지 않게 한다.

## 2. 백엔드 파일 구조

```txt
app/modules/content/
  __init__.py
  AGENTS.md
  routers.py
  models/
    __init__.py
    newsroom.py
    faq.py
  repositories/
    __init__.py
    newsroom.py
    faq.py
  services/
    __init__.py
    newsroom.py
    faq.py
  schemas/
    __init__.py
    newsroom.py
    faq.py
  dependencies/
    __init__.py
    repositories.py
    services.py
  routes/v1/
    __init__.py
    newsroom.py
    faqs.py

app/modules/admin/routes/v1/
  content_newsroom.py
  content_faqs.py
```

`app/core/routers.py`에 `content_router_v1`을 include한다.

`app/modules/admin/routers.py`에는 뉴스룸 route를 `prefix="/content/newsroom"`로 include한다.

FAQ route는 FAQ item과 FAQ category를 같은 파일에서 다루되, 최종 URL을 아래처럼 유지하기 위해 `prefix="/content"`로 include한다.

- `/api/v1/admin/content/faqs`
- `/api/v1/admin/content/faq-categories`

커뮤니티 공개 조회 추가 파일:

```txt
app/modules/community/routes/v1/
  public_posts.py
```

`app/modules/community/routers.py`에서 `public_posts.router`를 `prefix="/public/posts"`로 include한다.

## 3. 데이터 모델

### 3.1 NewsroomPost

테이블명: `newsroom_post`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | UUID PK | 게시물 ID |
| `category` | str(30) | `notice`, `press`, `partnership`, `event` |
| `title` | str(200) | 제목 |
| `excerpt` | str(500) | 목록 요약 |
| `content` | JSON nullable | 상세 본문 rich text block |
| `thumbnail_image` | str(500) nullable | 썸네일 S3 key 또는 URL |
| `external_url` | str(500) nullable | 외부 원문 링크 |
| `is_published` | bool | 공개 여부 |
| `published_at` | datetime nullable | 공개 일시 |
| `created_at` | datetime | BaseModel |
| `updated_at` | datetime | BaseModel |
| `deleted_at` | datetime nullable | SoftDeleteMixin |

인덱스:

- `(is_published, published_at)`
- `(category, published_at)`
- `(deleted_at)`

정책:

- 공개 조회는 `is_published=True`, `published_at <= now`, `deleted_at is null`만 반환한다.
- `external_url`이 있더라도 홈페이지 상세 페이지를 만들 수 있도록 `content`는 nullable로 둔다.
- 삭제는 기본 soft delete로 처리한다.
- `category`는 DB enum이 아니라 string으로 저장하되, Pydantic schema에서 `NewsroomCategory` enum으로 검증한다.

### 3.2 FaqCategory

테이블명: `faq_category`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | UUID PK | 카테고리 ID |
| `slug` | str(50) unique | `general`, `measurement`, `payment`, `privacy`, `technical` |
| `label` | str(80) | 표시명 |
| `sort_order` | int | 정렬 |
| `is_active` | bool | 사용 여부 |
| `created_at` | datetime | BaseModel |
| `updated_at` | datetime | BaseModel |

### 3.3 FaqItem

테이블명: `faq_item`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | UUID PK | FAQ ID |
| `category_id` | UUID FK | `faq_category.id` |
| `question` | str(300) | 질문 |
| `answer` | Text | 답변 |
| `sort_order` | int | 카테고리 내 정렬 |
| `is_published` | bool | 공개 여부 |
| `created_at` | datetime | BaseModel |
| `updated_at` | datetime | BaseModel |
| `deleted_at` | datetime nullable | SoftDeleteMixin |

인덱스:

- `(category_id, sort_order)`
- `(is_published, sort_order)`
- `(deleted_at)`

정책:

- 공개 조회는 `is_published=True`, category `is_active=True`, `deleted_at is null`만 반환한다.
- FAQ는 앱과 웹 공통 데이터이므로 앱 UI에서 필요한 카테고리 순서와 질문 순서를 API에서 보장한다.

## 4. API 계약

응답은 기존 `app.core.api.Response[T]` 래퍼와 camelCase alias 정책을 따른다.

카테고리 라벨 소유권:

- Newsroom category 라벨은 백엔드 응답이 함께 제공한다.
- FAQ category 라벨도 백엔드 응답이 제공한다.
- 프론트는 enum string을 한글 라벨로 다시 매핑하지 않는다.

공개 응답 원칙:

- 공개 category endpoint는 공개 가능한 active 데이터만 내려주므로 `isActive`를 포함하지 않는다.
- Admin category endpoint는 운영 상태 제어가 필요하므로 `isActive`를 포함한다.

### 4.1 공개 뉴스룸 목록

```txt
GET /api/v1/content/newsroom
```

Query:

| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `category` | str optional | 없음 | `notice`, `press`, `partnership`, `event` |
| `q` | str optional | 없음 | 제목/요약 검색 |
| `page` | int | 1 | 1부터 시작, route Query에서 `ge=1` 검증 |
| `pageSize` | int | 9 | `1 <= pageSize <= 50`, route Query에서 검증 |

Response data:

```json
{
  "posts": [
    {
      "id": "uuid",
      "category": { "value": "notice", "label": "공지" },
      "title": "바로도리 베타 서포터즈 모집 안내",
      "excerpt": "정식 출시 전 바로도리를 먼저 사용해보세요.",
      "thumbnailImage": null,
      "externalUrl": null,
      "publishedAt": "2026-05-12T00:00:00+09:00"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 9
}
```

### 4.2 공개 뉴스룸 상세

```txt
GET /api/v1/content/newsroom/{post_id}
```

Response data:

```json
{
  "id": "uuid",
  "category": { "value": "notice", "label": "공지" },
  "title": "바로도리 베타 서포터즈 모집 안내",
  "excerpt": "정식 출시 전 바로도리를 먼저 사용해보세요.",
  "content": [
    { "type": "text", "content": "본문" }
  ],
  "thumbnailImage": null,
  "externalUrl": null,
  "publishedAt": "2026-05-12T00:00:00+09:00"
}
```

### 4.3 공개 FAQ 카테고리

```txt
GET /api/v1/content/faq-categories
```

Response data:

```json
{
  "categories": [
    { "id": "uuid", "slug": "general", "label": "서비스 일반", "sortOrder": 10 }
  ]
}
```

이 endpoint는 `is_active=True`인 카테고리만 `sortOrder` 오름차순으로 반환한다. `isActive` 필드는 public 응답에 포함하지 않는다.

### 4.4 공개 FAQ 목록

```txt
GET /api/v1/content/faqs
```

Query:

| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `category` | str optional | 없음 | category slug |
| `q` | str optional | 없음 | 질문/답변 검색 |

Response data:

```json
{
  "faqs": [
    {
      "id": "uuid",
      "category": { "id": "uuid", "slug": "general", "label": "서비스 일반", "sortOrder": 10 },
      "question": "바로도리는 어떤 서비스인가요?",
      "answer": "영유아 사경·사두 관리에 어려움을 느끼는 보호자를 돕는 앱입니다.",
      "sortOrder": 10
    }
  ]
}
```

FAQ 목록은 평면 배열로 반환한다. 그룹핑, 검색 결과 표시, 아코디언 open/close 상태는 클라이언트 책임이다. 서버는 `category.sortOrder ASC`, `faq.sortOrder ASC`, `createdAt ASC` 정렬을 보장한다.

### 4.5 Admin 뉴스룸

```txt
GET    /api/v1/admin/content/newsroom
POST   /api/v1/admin/content/newsroom
PATCH  /api/v1/admin/content/newsroom/{post_id}
DELETE /api/v1/admin/content/newsroom/{post_id}
```

Create request:

```json
{
  "category": "notice",
  "title": "바로도리 베타 서포터즈 모집 안내",
  "excerpt": "정식 출시 전 바로도리를 먼저 사용해보세요.",
  "content": [{ "type": "text", "content": "본문" }],
  "thumbnailImage": null,
  "externalUrl": null,
  "isPublished": true,
  "publishedAt": "2026-05-12T00:00:00+09:00"
}
```

Patch request는 모든 필드를 optional로 받는다.

Admin 목록 query:

| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `category` | str optional | 없음 | 카테고리 필터 |
| `q` | str optional | 없음 | 제목/요약 검색 |
| `isPublished` | bool optional | 없음 | 게시 상태 필터 |
| `page` | int | 1 | route Query에서 `ge=1` 검증 |
| `pageSize` | int | 20 | `1 <= pageSize <= 100`, route Query에서 검증 |

감사 로그:

- `content.newsroom.create`
- `content.newsroom.update`
- `content.newsroom.delete`

### 4.6 Admin FAQ

```txt
GET    /api/v1/admin/content/faqs
POST   /api/v1/admin/content/faqs
PATCH  /api/v1/admin/content/faqs/{faq_id}
DELETE /api/v1/admin/content/faqs/{faq_id}
```

Create request:

```json
{
  "categoryId": "uuid",
  "question": "바로도리는 어떤 서비스인가요?",
  "answer": "영유아 사경·사두 관리에 어려움을 느끼는 보호자를 돕는 앱입니다.",
  "sortOrder": 10,
  "isPublished": true
}
```

Admin FAQ 목록 query:

| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `categoryId` | UUID optional | 없음 | 카테고리 필터 |
| `q` | str optional | 없음 | 질문/답변 검색 |
| `isPublished` | bool optional | 없음 | 게시 상태 필터 |
| `page` | int | 1 | route Query에서 `ge=1` 검증 |
| `pageSize` | int | 20 | `1 <= pageSize <= 100`, route Query에서 검증 |

카테고리 관리는 같은 admin prefix 아래에 둔다.

```txt
GET    /api/v1/admin/content/faq-categories
POST   /api/v1/admin/content/faq-categories
PATCH  /api/v1/admin/content/faq-categories/{category_id}
```

Admin category response에는 `isActive`를 포함한다.

Admin FAQ 목록은 공개 목록과 달리 draft와 inactive category의 FAQ도 필터 조건에 따라 조회할 수 있다.

감사 로그:

- `content.faq.create`
- `content.faq.update`
- `content.faq.delete`
- `content.faq_category.create`
- `content.faq_category.update`

## 5. 구현 단계

### Step 1. content 모듈 뼈대 추가

- `app/modules/content/AGENTS.md` 작성
- `models`, `repositories`, `services`, `schemas`, `dependencies`, `routes/v1` 디렉터리 생성
- `routers.py` 작성: `prefix="/content"`로 공개 route include
- `app/core/routers.py`에 `content_router_v1` include

### Step 2. 모델과 migration

- `NewsroomPost`, `FaqCategory`, `FaqItem` 모델 추가
- Alembic migration 생성
- FAQ 기본 카테고리 seed는 migration 또는 별도 운영 스크립트 중 하나로 결정
- downgrade는 FK 순서를 지켜 `faq_item` -> `faq_category` -> `newsroom_post` 순서로 drop한다.

기본 FAQ 카테고리:

```txt
general       서비스 일반
measurement   측정·진단
payment       비용·결제
privacy       개인정보·보안
technical     기술 문제
```

### Step 3. Repository

Newsroom repository:

- `list_public(category, q, page, page_size)`
- `get_public(post_id)`
- `list_admin(category, q, is_published, page, page_size)`
- `create`, `patch`, `soft_delete`

FAQ repository:

- `list_public_categories()`
- `list_public(category_slug, q)`
- `list_admin(category_id, q, is_published)`
- `create`, `patch`, `soft_delete`
- category CRUD

### Step 4. Service

Service에서 정책을 고정한다.

- 공개 조회는 publish 상태와 soft delete를 반드시 필터링
- admin 조회는 draft 포함 가능
- `published_at`이 미래면 공개 목록에서 제외
- FAQ 카테고리가 비활성인 경우 공개 FAQ에서 제외
- 검색어는 MVP에서 `ILIKE`로 시작하고, 필요해지면 pg_trgm을 붙인다.
- Newsroom category 검증은 schema enum에서 1차 처리하고, service에서도 unknown category를 저장하지 않는다.
- Public FAQ 응답은 평면 배열이며 service가 정렬 순서를 보장한다.

### Step 5. 공개 Route

- `app/modules/content/routes/v1/newsroom.py`
- `app/modules/content/routes/v1/faqs.py`

인증 없이 접근 가능하다.

Rate limit은 모듈 router 레벨에서 public read 기준으로 둔다.

```python
router_v1 = APIRouter(
    prefix="/content",
    dependencies=[Depends(ConfigurableRateLimiter(times=100, seconds=60))],
)
```

Query validation은 route의 `Query(...)`와 Pydantic schema에서 처리한다. service는 이미 검증된 값을 받아 정책 필터링과 정렬에 집중한다.

### Step 6. Admin Route

- `app/modules/admin/routes/v1/content_newsroom.py`
- `app/modules/admin/routes/v1/content_faqs.py`
- `app/modules/admin/routers.py`에 include

```python
router_v1.include_router(
    content_newsroom.router,
    prefix="/content/newsroom",
    tags=["Admin Content Newsroom"],
    dependencies=_admin_only_dependencies,
)
```

admin route는 content service dependency를 import해서 호출한다.

감사 로그에는 actor, action, target_resource, target_id, before/after 또는 extra_data를 기록한다.

Admin route는 기존 `_admin_only_dependencies`를 그대로 사용하므로 `require_role(AdminRole.ADMIN)`와 `ConfigurableRateLimiter(times=60, seconds=60)`가 적용된다.

### Step 7. Community Public Route

`content` 모듈 작업과 별개로 홈페이지 커뮤니티 공개 열람을 위해 `community` 모듈에 public route를 추가한다.

파일:

```txt
app/modules/community/routes/v1/public_posts.py
```

Router include:

```python
router_v1.include_router(
    public_posts.router,
    prefix="/public/posts",
    tags=["Community Public Posts"],
)
```

API:

```txt
GET /api/v1/community/public/posts
GET /api/v1/community/public/posts/{post_id}
GET /api/v1/community/public/posts/{post_id}/comments
```

정책:

- `CurrentUserDep`를 사용하지 않는다.
- 비공개, 삭제, 비활성, 신고 숨김 게시글은 제외한다.
- 개인화 필드(`isLiked`, `isMine`)는 응답하지 않는다.
- 익명 글은 기존 익명 표시 정책을 따른다.
- 차단 사용자 필터는 비로그인 공개 조회에서는 적용하지 않는다.
- 상세 조회 view count 증가 여부는 운영 결정 전까지 적용하지 않는다.

기존 인증 route와의 충돌 방지:

- 기존 route: `/community/posts`, `/community/posts/{post_id}`
- 공개 route: `/community/public/posts`, `/community/public/posts/{post_id}`
- include prefix가 다르므로 충돌하지 않는다.

### Step 8. 프론트 연동

현재 프론트 정적 데이터:

```txt
lib/content/newsroom.ts
lib/content/faq.ts
```

API 연동 시 교체 대상:

- `/ko/newsroom`: `GET /api/v1/content/newsroom`
- `/ko/faq`: `GET /api/v1/content/faq-categories`, `GET /api/v1/content/faqs`
- 홈 뉴스룸 미리보기: `GET /api/v1/content/newsroom?pageSize=3`
- `/ko/community`: `GET /api/v1/community/public/posts`
- `/ko/community/[postId]`: `GET /api/v1/community/public/posts/{post_id}`, `GET /api/v1/community/public/posts/{post_id}/comments`

프론트에서 API 응답이 비어 있으면 현재와 동일한 empty state를 유지한다.

## 6. 테스트 계획

### Unit

- `NewsroomService`
  - draft는 public list에 노출되지 않는다.
  - 미래 `published_at`은 public list에 노출되지 않는다.
  - soft deleted post는 public/admin 기본 목록에서 제외된다.
  - category/q 필터가 같이 적용된다.

- `FaqService`
  - 비공개 FAQ는 public list에 노출되지 않는다.
  - 비활성 category의 FAQ는 public list에 노출되지 않는다.
  - category sort와 item sort가 보장된다.
  - 검색은 question/answer 양쪽에 적용된다.

### API

- Public
  - `GET /api/v1/content/newsroom` 200
  - `GET /api/v1/content/newsroom/{post_id}` 404 for draft/deleted/future post
  - `GET /api/v1/content/faqs` 200
  - `GET /api/v1/content/faq-categories` 200
  - `GET /api/v1/community/public/posts` 200 without auth
  - `GET /api/v1/community/public/posts/{post_id}` 404 for private/deleted/inactive post
  - `GET /api/v1/community/public/posts/{post_id}/comments` 200 without auth

- Admin
  - 인증 없으면 401
  - ADMIN이 아니면 403
  - create/update/delete 성공 시 감사 로그 생성
  - patch request partial update 동작

### Migration

- migration upgrade/downgrade
- 기본 FAQ 카테고리 생성 전략을 택했다면 중복 실행 안전성 확인
- downgrade는 FK 때문에 `faq_item`을 먼저 drop하고, 이후 `faq_category`, `newsroom_post`를 drop한다.

권장 명령:

```bash
uv run pytest tests/modules/content -q
uv run pytest tests/modules/community/test_public_posts_api.py -q
uv run alembic upgrade head
```

현재 구현 검증:

- `uv run pytest tests/modules/content/test_content_api.py tests/modules/community/test_public_posts_api.py -q` 통과
- `uv run pytest tests/modules/content -q` 통과
- `uv run pytest tests/modules/community -q` 통과
- `uv run alembic heads` 결과 `p3q4r5s6t7u8 (head)` 확인

## 7. 비범위

- WYSIWYG 에디터 UI
- 이미지 presigned upload API
- 다국어 콘텐츠 관리
- 앱 내 FAQ 캐시/동기화 정책
- 뉴스룸 상세 웹뷰 디자인
- 검색 고도화(pg_trgm ranking, highlight)
- CDN cache, ETag, 앱 캐시 TTL 적용
- hard delete 관리자 권한

## 8. 열어둘 결정

1. 뉴스룸/FAQ 본문을 rich text JSON으로 통일할지, FAQ answer는 plain text로 유지할지
2. FAQ 카테고리 seed를 migration에 넣을지 운영 API로만 만들지
3. 뉴스룸 썸네일 업로드를 기존 admin media 흐름과 공유할지 content 전용으로 둘지
4. 공개 커뮤니티 상세 조회에서 view count를 증가시킬지 여부
