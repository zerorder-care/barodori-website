# 헤더 리디자인 — 설계 문서

- 날짜: 2026-06-15
- 대상: 전역 사이트 헤더 (`components/layout/Header.tsx`, `HeaderNav.tsx`, `LocaleSwitcher.tsx`)
- 상태: 합의 완료 → 구현 계획 단계로

## 1. 배경 & 목표

현재 헤더는 두 가지 문제를 안고 있다.

1. **비주얼이 약하다.** 로고가 "노란 박스 안 텍스트"라 브랜드감이 약하고, 전반적으로 밋밋하다.
2. **CTA 영역이 낡았다.** 우측 "오픈 소식 받기" 버튼은 outdated된 외부 베타 폼으로 연결되고, 옆의 "홈케어 운동 기록 앱"은 클릭도 안 되는 죽은 정적 라벨이다. 둘 다 "앱 출시 전 + 사전예약 수집"이라는 옛 전제의 잔재다.

확정된 전제:
- **앱은 아직 스토어에 출시되지 않았다.**
- **사전예약(베타 신청)은 더 이상 수집하지 않는다.**
- 로그인은 **소셜 로그인 전용**(카카오·구글·네이버)이라 "로그인 = 회원가입"이 동일 동작이다.

목표: 구조를 정리(낡은 CTA 제거 + 액션 단일화)하고, 비주얼을 격상한다.

## 2. 확정된 구조 (정보 설계)

| 영역 | 변경 |
|------|------|
| 로고 | 노란 박스 텍스트 → **브랜드 심볼(파란 원+흰 곡선) + "바로도리" 워드마크** lockup |
| 내비 | 현행 유지: 기능 소개 · 커뮤니티 · 홈케어 노트 · 소식 · 자주 묻는 질문 (후기는 계속 숨김) |
| 언어 전환 | KO/EN 유지 |
| 우측 액션 | "오픈 소식 받기" 버튼 + "홈케어 운동 기록 앱" 라벨 + QR 설치 모달 **모두 제거** → **"시작하기" 단일 버튼**(→ `/login`)으로 통합 |
| 로그인 후 | 현행 유지: 마이페이지 · 로그아웃 |

핵심: 소셜 로그인은 로그인·가입이 같은 동작이므로 버튼은 **하나**. 라벨은 신규·기존을 모두 포괄하는 **"시작하기"**.

## 3. 비주얼 방향 — "A+C 하이브리드"

라인 미니멀(A) + 플로팅 캡슐(C)의 조합.

- **컨테이너**: 본문 위에 떠 있는 **둥근 캡슐 바**. sticky, 상단에 약간의 여백을 두고 떠 있음. 양옆도 살짝 떠 있는 느낌.
- **배경**: 캡슐은 반투명 흰색 + `backdrop-blur`. 캡슐 바깥(여백)은 투명 → 본문이 비쳐 floating 느낌.
- **그림자**: 상단 진입 시 옅은 그림자, **스크롤 시 그림자가 진해짐**(반투명도 살짝 더 불투명). 점진적 향상이며 없어도 동작에 지장 없음.
- **로고**: 심볼(26~28px) + "바로도리"(Pretendard 700, ~17px, near-black) 가로 lockup. 홈 링크.
- **내비**: 비활성 회색(`--color-text-secondary` #71717B, weight 500), **활성 = near-black(#111827, weight 600) + 하단 2px 옐로우 인디케이터**(`::after`, `--color-primary` #FFB700).
- **언어 전환**: KO/EN 미니멀(현재 KO 굵게/EN 흐리게 유지).
- **CTA**: "시작하기" **솔리드 옐로우** 버튼(bg `--color-primary`, text #111827, radius 12px, height 38px, weight 600).

### 색/토큰 (기존 토큰 재사용)
- primary `#FFB700`, primary-light `#FFF5DB`, text-primary `#111827`, text-secondary `#71717B`, border `#E4E4E7`
- 심볼 블루는 브랜드 자산 고유색(약 `#A9C3EA`) — 심볼 SVG 내부에 인라인.

## 4. 컴포넌트별 스펙

### 4.1 브랜드 심볼 — 신규 인라인 SVG
- 새 컴포넌트(예: `components/layout/BarodoriMark.tsx`)로 분리. 파란 원 + 흰 곡선 아크.
- 기준 path(목업에서 사용, 최종은 정식 벡터로 교체 가능):
  ```
  <circle cx=20 cy=20 r=16.5 fill=#A9C3EA stroke=#111827 stroke-width=3 />
  <path d="M12.5 25.5 C 16 19.5, 23.5 17.5, 28.5 15.5" stroke=#fff stroke-width=3.4 stroke-linecap=round fill=none />
  ```
- 414KB짜리 파비콘 SVG(`public/favicons/barodori-icon-48.svg`)는 raster 임베드라 헤더에 쓰지 않는다. 가벼운 인라인 벡터를 쓰고, 정식 벡터가 준비되면 교체.

### 4.2 데스크톱 헤더 (`HeaderNav.tsx`)
- 래퍼: `sticky top-0 z-40`, 상단 패딩으로 떠 있는 여백(예: pt-3). 배경 투명.
- 캡슐: 가운데 정렬, `max-width` 현행 1056px 유지, 좌우 페이지 패딩(px-5/sm:px-6). 반투명 흰색 + blur, border 1px(`--color-border`), radius 16px, 그림자.
- 좌: 로고 lockup. 중: 내비(lg 이상 노출). 우: 언어 전환 + 시작하기/계정.
- `isActive` 로직 그대로 사용. `reviews`는 계속 `navKeys`에서 주석 처리.
- **제거**: `HeaderCta` 컴포넌트 전체(베타 폼 분기 + 상태 라벨 + `QrInstallModal` 사용), `isAppLive`/`getExternalLinks`/`launchCopy` import(헤더 한정).
- **스크롤 그림자**: 이미 `'use client'`이므로 scroll 위치를 보는 작은 `useEffect`로 `scrolled` 상태를 토글(>8px 등). 선택적 향상.

### 4.3 우측 액션 (로그인 상태 분기)
- 비로그인: **"시작하기"** 솔리드 옐로우 버튼 → `/${locale}/login`.
- 로그인: **마이페이지 · 로그아웃**(현행 `AuthLinks` 로직·동작 유지, 스타일만 톤 정리).
- 기존 "로그인" 텍스트 링크는 "시작하기" 버튼이 흡수.

### 4.4 언어 전환 (`LocaleSwitcher.tsx`)
- 기능 그대로. 캡슐 톤에 맞춰 비활성 색만 미세 조정(선택).

### 4.5 모바일 (`HeaderNav.tsx` 패널)
- 캡슐 안: 로고 + 햄버거(원형 테두리 버튼). 열림 시 `×`.
- 열림: 캡슐 아래로 **둥근 카드 패널**이 떨어짐(흰색, border, radius 16px, 그림자).
  - 내비 5개. 활성 항목은 **옐로우 배경 행**(`#FFF5DB`).
  - divider.
  - KO/EN + (로그인 시 마이페이지·로그아웃 진입).
  - 맨 아래 **폭 꽉 찬 "시작하기" 솔리드 버튼**.
- 기존 open/close 토글, 링크 클릭 시 닫힘, 로그아웃 동작 유지.

## 5. i18n
- `messages/ko.json`, `messages/en.json`의 `nav`에 **`start`** 키 추가: KO `"시작하기"`, EN `"Get started"`.
- 헤더에서 더 이상 쓰지 않는 라벨(`install`)·`launchCopy`는 메시지/설정 파일에서 **삭제하지 않는다**(`/install` 등 다른 곳에서 사용 가능). 헤더에서의 참조만 제거.

## 6. 유지되는 동작 (회귀 방지 체크리스트)
- `/api/auth/session` 폴링으로 로그인 상태 표시, 경로 변경 시 재확인.
- 로그아웃 시 세션 삭제 + 마이페이지에 있었다면 `/login`으로, `router.refresh()`.
- `LocaleSwitcher` 경로 보존 로케일 스왑.
- sticky 고정, 모바일 햄버거 토글, 접근성 속성(`aria-expanded`, `aria-label`).
- `app/globals.css`의 `scroll-padding-top`을 캡슐 총 높이(여백+캡슐 ≈ 80px)에 맞게 **72px → 약 88px로 상향**(앵커 이동 시 캡슐에 가리지 않도록).

## 7. 영향 받는 파일
- `components/layout/HeaderNav.tsx` — 핵심 리라이트(컨테이너·로고·내비·우측·모바일·CTA 제거).
- `components/layout/BarodoriMark.tsx` — 신규(심볼).
- `components/layout/LocaleSwitcher.tsx` — 미세 톤 조정(선택).
- `components/layout/Header.tsx` — props 시그니처 변동 시만(현재는 거의 그대로).
- `messages/ko.json`, `messages/en.json` — `nav.start` 추가.
- `app/globals.css` — `scroll-padding-top` 상향.
- `components/install/QrInstallModal.tsx` — **삭제하지 않음**(헤더 렌더만 제거, 추후 재사용 대비).

## 8. 범위 밖 (Out of scope)
- 앱 출시 시점의 "다운로드/QR 설치" CTA 재도입 — 출시될 때 별도로.
- 포지셔닝 카피 정리("영유아 사경·사두 재활" vs "홈케어 운동 기록") — 헤더 무관.
- 후기(reviews) 메뉴 노출 — 데이터 연동 시 별도.
- 헤더 외 페이지 레이아웃.

## 9. 성공 기준
- 헤더에 outdated 링크/죽은 라벨이 없다.
- 우측 액션은 "시작하기" 단일 버튼이며 `/login`으로 연결되고, 로그인 시 마이페이지·로그아웃으로 전환된다.
- 데스크톱·모바일 모두 플로팅 캡슐 톤으로 일관되며, 활성 메뉴가 옐로우로 표시된다.
- 기존 로그인/로그아웃/로케일/모바일 토글 동작이 그대로 작동한다.
- 타입체크·린트·기존 테스트 통과.
