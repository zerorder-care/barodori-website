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
