# 바로도리 제품 웹사이트

영아 사경/사두 케어 앱 바로도리(Barodori)의 제품 소개 + 사경 아티클 사이트. (https://barodori.com)

## 스택
- Next.js 16 App Router를 서버 렌더링으로 씁니다. 아티클과 FAQ는 요청 시점에 백엔드 Knowledge Lab을 읽고 그 응답을 하루 동안 캐시합니다.
- React 19, TypeScript 5
- Tailwind v4 + Pretendard
- GA4 + Amplitude

## 개발

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 은 /ko 로 리다이렉트합니다.

## 스크립트

- `npm run dev` 개발 서버
- `npm run build` 프로덕션 빌드
- `npm run start` 빌드 결과 서빙
- `npm run lint` ESLint
- `npm run typecheck` TypeScript 검사
- `npm run test` Vitest 단위 테스트

## 환경변수
`.env.example` 참고. 모든 키는 미설정 가능하며, 그에 따라 동작이 달라집니다 (스토어 링크 미설정 시 "출시 예정" 상태 등).

소셜 로그인은 Firebase Web 설정(`NEXT_PUBLIC_FIREBASE_*`)이 필요합니다. 카카오/네이버는 서버 라우트에서 OAuth code를 교환하므로 `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`도 배포 환경에 등록해야 합니다.

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

응답 `{"revalidated":true,"tags":["lab-content"]}`가 오면 다음 방문부터 새 글이 보입니다. 토큰이 설정되지 않았으면 503, 토큰이 틀리면 401이 옵니다. 허용 목록에 없는 태그만 보내면 비울 것이 없으므로 400과 `{"error":"no_allowed_tags"}`가 옵니다.

백엔드가 아직 뜨지 않은 상태에서 웹을 돌려 보려면 픽스처를 내려주는 목 서버를 씁니다. `scripts/mock-lab-fixtures.json`은 `lib/api/__fixtures__/knowledgeLab.ts`와 같은 값을 유지합니다.

```bash
node scripts/mock-lab-api.mjs
BARODORI_API_BASE_URL=http://127.0.0.1:4010 npm run dev
```

## 설계 문서
- 설계 spec: `docs/specs/2026-05-04-barodori-website-mvp-design.md`
- 구현 플랜: `docs/plans/2026-05-04-barodori-website-mvp.md`
