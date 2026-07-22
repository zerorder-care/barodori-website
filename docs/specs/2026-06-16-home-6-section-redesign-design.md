# 홈 6섹션 재구성 — 설계 문서

- 날짜: 2026-06-16
- 대상: 홈(`app/[locale]/page.tsx`)과 마케팅 섹션(`components/marketing/*`)
- 상태: 합의 완료 → 구현 계획 단계로
- 입력 자산: `~/Downloads/'바로도리' 주요화면_6장 (수정)/` 6장 스크린샷

## 1. 배경 & 목표

앱의 **주요 화면 6장**을 받아, 홈을 "기능 나열"이 아니라 **하루의 동선**을 따라 스크롤하는 6섹션 내러티브로 다시 짠다.

현재 홈은 `Hero → HomeTogetherSection("바로도리와 함께") → HomeFeatureSections(기능 3블록) → SecondaryPaths`. 기능 3블록(오늘 목표·운동 기록·리포트)은 이번 6장과 내용이 겹친다. 그래서 **가운데를 6섹션으로 교체**하고 홈 전체를 6장 중심으로 재구성한다.

확정된 방향(합의):
- **구조**: 홈 전체를 6섹션 중심으로 재구성. Hero는 유지, 마무리는 설치 CTA.
- **비주얼**: 실제 스크린샷을 폰 목업에 넣어 카피 옆 배치.
- **스크롤**: 정적 섹션 스택 + 등장 시 부드러운 페이드업(`prefers-reduced-motion` 존중).
- **긴 스크린샷 3장**: 폰 프레임 안에서 윗부분을 보여주고 **하단을 부드럽게 페이드**해 "스크롤되는 앱" 느낌(옵션 b).
- **커뮤니티(⑤)**: 링크/CTA 없이 "앱 안 기능" 스크린샷 소개만.
- **스트레스(⑥)**: 포함하되 "셀프 체크·참고" 톤으로 완화하고 의료 면책 노출.
- **톤**: 해요체, 사람이 쓴 따뜻한 톤, AI·번역투 배제.

## 2. 확정된 구조 (정보 설계)

```
Hero (현행 유지)
  ↓
HomeStorySections  ← 신규: 6섹션
   ① 오늘의 홈      home.png
   ② 같이 운동      exercise-timer.png
   ③ 그대로 기록    session-report.png   (긴 캡처 → 하단 페이드)
   ④ 쌓이는 흐름    calendar-report.png  (긴 캡처 → 하단 페이드)
   ⑤ 혼자가 아니에요 community.png        (긴 캡처 → 하단 페이드, 링크 없음)
   ⑥ 보호자님도     parent-check.png
  ↓
SafetyNotice (의료/스트레스 면책 — 신규로 홈에 포함)
  ↓
InstallCta (현행 재사용, 마무리 CTA)
```

- **제거(홈 본문에서)**: `HomeTogetherSection`, `HomeFeatureSections`, `SecondaryPaths` 의 홈 렌더. (파일은 삭제하지 않고 import만 제거 — 추후 정리/재사용 대비. `HomeFeatureSections`가 쓰던 `GoalAchievement`도 그대로 둠.)
- **articles 경로**: 본문 `SecondaryPaths`가 빠지지만 `/articles`(홈케어 노트)는 헤더 내비·푸터로 도달 가능하므로 홈 본문 링크는 생략.
- **Hero**: 카피·구조 현행 유지(최근 커밋에서 이미 톤 정리됨). 변경 시 별도 작업.

## 3. 6섹션 상세 (라벨 · 제목 · 본문 · 칩 · 비주얼)

레이아웃은 텍스트↔폰 **좌우 교차**(짝수 섹션 reverse). 카피는 컴포넌트 내 데이터 배열로 인라인(기존 `HomeFeatureSections` 패턴과 동일, 한국어 전용).

### ① 오늘의 홈 — `home.png` (single)
- 라벨: `오늘의 홈`
- 제목: **앱을 열면, 오늘 뭘 할지 바로 보여요**
- 본문: 오늘 운동 기록과 이번 주 목표, 다른 보호자들의 이야기까지 한 화면에 담았어요. 복잡하게 헤매지 않아도 돼요.
- 칩: `오늘의 운동기록` · `이번 주 목표` · `스트레스 체크`
- 배경: 흰색 / 톤: 따뜻한 첫인사(안내자)
- alt: "바로도리 홈 화면 — 오늘의 운동 기록과 이번 주 목표를 한눈에 보여줘요"

### ② 같이 운동 — `exercise-timer.png` (single)
- 라벨: `운동하기`
- 제목: **동요 틀고, 도리랑 같이 운동해요**
- 본문: 시작 버튼을 누르면 시간이 흐르고 동요가 흘러나와요. 몇 번 했는지는 끝나고 바로 적으면 되니까, 운동하는 동안엔 아이만 봐요.
- 칩: `스톱워치` · `동요 재생` · `끝나고 횟수 기록`
- 배경: 앰버 틴트(감성 비트) / 톤: 놀이처럼 가볍게
- 비주얼 포인트: 도리 마스코트가 주인공
- alt: "바로도리 운동 화면 — 도리 캐릭터와 운동 타이머, 동요 재생"

### ③ 그대로 기록 — `session-report.png` (tall → 하단 페이드)
- 라벨: `기록`
- 제목: **방금 한 운동이, 좌우 횟수까지 그대로 남아요**
- 본문: 도리도리 좌 12번·우 10번, 터미타임 4분 30초. 숫자만이 아니라 '오른쪽은 잘 따라왔어요' 같은 메모와 사진도 같이 담겨요. 다음 진료 때 그대로 보여드리면 돼요.
- 칩: `좌·우 횟수` · `오늘의 메모` · `사진·영상`
- 배경: 흰색 / 톤: 차분·신뢰. "진료 보조 기록"(의료기기 아님) 뉘앙스 유지
- alt: "바로도리 운동 리포트 — 운동별 좌우 횟수와 메모, 사진 기록"

### ④ 쌓이는 흐름 — `calendar-report.png` (tall → 하단 페이드)
- 라벨: `흐름`
- 제목: **쌓인 기록이, 이번 주 흐름을 보여줘요**
- 본문: 운동한 날, 물리치료 다녀온 날이 달력에 색으로 남아요. 이번 주 목표는 얼마나 채웠는지, 무슨 운동을 많이 했는지 한눈에 정리돼요.
- 칩: `예약·운동 달력` · `주간 목표 달성률` · `운동별 비중`
- 배경: `#FFFDF7`(muted) / 톤: 뿌듯함·큰 그림
- alt: "바로도리 달력과 주간 리포트 — 운동·물리치료 기록과 목표 달성률"

### ⑤ 혼자가 아니에요 — `community.png` (tall → 하단 페이드, **링크 없음**)
- 라벨: `함께`
- 제목: **혼자가 아니라는 걸, 여기서 느껴요**
- 본문: 터미타임을 어떻게 나눴는지, 고개 돌리기를 며칠 만에 따라왔는지. 먼저 지나온 보호자들의 진짜 이야기가 매일 올라와요.
- 칩: `도리 이야기` · `도리 운동일지` · `댓글로 응원`
- 배경: 흰색 / 톤: 따뜻한 연대·공감
- **주의**: 웹 `/community` 라우트는 임시 제외 상태. 이 섹션은 **앱 안 기능 스크린샷 소개만**, 클릭 링크/CTA 없음.
- alt: "바로도리 커뮤니티 — 보호자들이 운동 기록과 경험을 나누는 피드"

### ⑥ 보호자님도 — `parent-check.png` (single)
- 라벨: `보호자님`
- 제목: **아이를 돌본 만큼, 보호자님도 살펴요**
- 본문: 1분만 카메라를 보면 오늘 마음이 좋아요·괜찮아요·조금 지쳐있어요·힘들어요 중 어디쯤인지 알려드려요. 잘 돌보려면, 보호자님부터 괜찮아야 하니까요.
- 칩: `1분 셀프 체크` · `4단계 안내` · `기록으로 흐름 보기`
- 배경: 앰버 틴트(감성 마무리) / 톤: 가장 감성적인 클로징
- **주의**: '측정'을 의료적으로 단정하지 않기("셀프 체크·참고"). 섹션 직후 `SafetyNotice`가 `dict.medical.stress`("보호자 컨디션 체크 결과는 참고용…")를 노출.
- alt: "바로도리 보호자 컨디션 셀프 체크 — 1분 카메라로 오늘 상태를 4단계로 안내"

## 4. 공통 타이포 시스템 (Pretendard / 기존 토큰)

| 요소 | 스타일 | 비고 |
|---|---|---|
| 라벨(eyebrow) | SemiBold · 14px · `#B77900` on `#FFF5DB` pill | 섹션 기능 태그 |
| 제목 h2 | Bold · 30 → 40 → 48px(`text-3xl sm:text-4xl lg:text-5xl`) · `leading-tight` · `#111827` | `keep-all`, 항상 1문장 |
| 본문 lead | Regular · 16 → 18px · `leading-relaxed` · `#71717B` | 1–2문장 |
| 칩(chips) | SemiBold · 14px · `#B77900` on `#FFF5DB` `rounded-pill` | 화면 속 실제 라벨 3개 |
| 숫자 강조(선택) | Bold · 40 → 56px · `#B77900` · `tabular-nums` | ④ `78%`, ③ `30회` 등 |

- 색·토큰은 전부 기존 재사용: primary `#FFB700`, primary-light `#FFF5DB`, primary-dark `#B77900`, text `#111827`/`#71717B`, border `#E4E4E7`, bg-muted `#FFFDF7`.
- 앰버 틴트 배경(②⑥): `#FFF5DB` 기반의 옅은 단색 또는 그라데이션.

## 5. 컴포넌트 아키텍처

### 5.1 `components/marketing/HomeStorySections.tsx` (신규, 서버 컴포넌트)
- 6섹션 데이터 배열(`label, title, body, chips[], screen{src, alt, tall}, bg, reverse`)을 map.
- 각 섹션: `Container` 안 `lg:grid-cols-2` 좌우 교차. 텍스트 측은 라벨 pill + h2 + lead + 칩 묶음.
- 섹션 래퍼에 배경 리듬 적용(흰색 / 앰버틴트 / muted).
- 각 섹션을 `<Reveal>`로 감싸 등장 애니메이션(아래 5.3).

### 5.2 `components/marketing/PhoneFrame.tsx` (신규)
- 기존 `PhoneScreenshot` 톤 재사용: 다크 프레임(`#111827`, `rounded-[32px] p-2`, soft shadow), 내부 흰색 `rounded-[24px]`, `max-w-[300px]` 가운데 정렬.
- 내부 뷰포트 비율 고정: `aspect-[786/1704]`, `<Image fill className="object-cover object-top">`.
- `tall` prop true(③④⑤)일 때 하단 그라데이션 오버레이 추가: 프레임 하단 ~18%에 `absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-white`(내부 프레임 바닥색과 동일) → 잘린 긴 화면이 "스크롤되는" 느낌으로 자연스럽게 사라짐.
- `next/image` 사용, `sizes="(max-width:640px) 70vw, 300px"`.

### 5.3 `components/marketing/Reveal.tsx` (신규, `'use client'`)
- `IntersectionObserver`로 뷰포트 진입 시 `data-visible="true"` 토글, 1회 후 unobserve.
- 초기 숨김은 **`motion-safe`로만** 적용(예: `motion-safe:opacity-0 motion-safe:translate-y-3`), 진입 시 `data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0`, `transition`.
- `prefers-reduced-motion: reduce` 사용자/모션 비활성 환경에선 변형 없이 즉시 표시. 접근성: 콘텐츠가 영구히 숨겨지지 않도록 마운트 후에만 숨김 상태를 적용(JS 미동작 시 보이게).
- `delay` prop(선택)으로 텍스트→폰 가벼운 스태거.

### 5.4 `app/[locale]/page.tsx` 수정
- import 교체: `HomeTogetherSection`/`HomeFeatureSections`/`SecondaryPaths` 제거, `HomeStorySections`·`SafetyNotice`·`InstallCta` 추가.
- 렌더: `<Hero /> → <HomeStorySections /> → <SafetyNotice locale={loc} /> → <InstallCta locale={loc} surface="home" />`.
- `SafetyNotice`는 `async` 서버 컴포넌트(현행)라 그대로 await 렌더 가능.

## 6. 에셋 (스크린샷)

`public/images/app-screens/`(빈 폴더 존재)로 6장을 복사·리네임:

| 섹션 | 원본 | 대상 파일 | 픽셀 | 유형 |
|---|---|---|---|---|
| ① | page-home.png | `home.png` | 786×1704 | single |
| ② | onboarding-stopwatch (수정).png | `exercise-timer.png` | 786×1710 | single |
| ③ | flow-report-detail.png | `session-report.png` | 786×2360 | **tall** |
| ④ | page-calendar-month-list (수정).png | `calendar-report.png` | 786×2682 | **tall** |
| ⑤ | community-feed-latest.png | `community.png` | 786×2800 | **tall** |
| ⑥ | page-parent-stress-prepare.png | `parent-check.png` | 786×1704 | single |

- 6장 모두 가로 786px로 폰 목업(~300px 표시)에 충분.
- `community.png`(원본 ~1.4MB)는 용량이 크니 최적화 권장(`next/image`가 변환하지만 원본도 압축하면 좋음). 그 외는 100~190KB로 양호.
- 향후 한 화면 버전을 재export하면 `tall` 플래그를 false로 바꾸기만 하면 됨.

## 7. 톤 가이드라인 (전 섹션 공통)

최근 커밋("사람이 쓴 톤으로 다듬는다", "brand warmth")과 동일 기조:
- **해요체**, 짧고 숨 쉬는 리듬, 문장 길이 변주 — 기계적 병렬 금지.
- **구체 명사**로 말하기(도리도리·터미타임·좌/우·동요·보호자님) → 추상적 광고어 배제.
- `~을 통해 / ~을 위한 / ~것입니다` 등 **AI·번역투 제거**, 감정은 한 줄로만 얹기.
- 마무리는 항상 **보호자 중심**의 따뜻함.

## 8. 안전 · 면책

- ③ 리포트: "진료를 대신하지 않는 기록/참고" 뉘앙스 유지(단정 금지).
- ⑥ 스트레스: "측정"의 의료적 단정 회피, "셀프 체크·참고". 직후 `SafetyNotice`로 `dict.medical` 문구 노출(특히 `stress`).
- 새 의료 주장·수치 표현은 추가하지 않음.

## 9. 접근성 & 모션

- 섹션마다 `aria-labelledby`로 h2 연결, 라벨 pill은 장식.
- 폰 이미지 `alt`는 3장 상세의 문구 사용(정보성).
- 페이드업은 `motion-safe`에서만, `prefers-reduced-motion`에서 비활성·즉시 표시.
- 색 대비: 본문 `#71717B` on 흰색/뮤트/앰버틴트 모두 WCAG AA 본문 기준 충족 확인.
- 칩 텍스트(`#B77900` on `#FFF5DB`) 대비 확인.

## 10. 영향 받는 파일

- `app/[locale]/page.tsx` — 홈 구성 교체.
- `components/marketing/HomeStorySections.tsx` — 신규(6섹션).
- `components/marketing/PhoneFrame.tsx` — 신규(폰 목업 + tall 페이드).
- `components/marketing/Reveal.tsx` — 신규(등장 애니메이션).
- `public/images/app-screens/*.png` — 6장 추가.
- (삭제하지 않음) `HomeTogetherSection.tsx`·`HomeFeatureSections.tsx`·`SecondaryPaths.tsx`·`GoalAchievement.tsx` — 홈 import만 제거.

## 11. 범위 밖 (Out of scope)

- Hero 카피/구조 변경.
- 6섹션 영어(EN) 번역 — 기존 마케팅 컴포넌트가 한국어 인라인이라 동일 전제 유지(추후 i18n 별도).
- 스크롤 고정(스티키) 스토리텔링 연출 — 이번엔 정적 스택만.
- 커뮤니티/뉴스룸 웹 라우트 재공개.
- 한 화면 버전 스크린샷 재export(현 자산으로 진행, tall 페이드로 대응).
- 제거되는 옛 마케팅 컴포넌트 파일의 물리 삭제.

## 12. 성공 기준

- 홈이 `Hero → 6섹션 → SafetyNotice → InstallCta` 순으로 렌더된다.
- 6섹션이 정해진 라벨·제목·본문·칩과 좌우 교차 레이아웃으로 표시된다.
- 6장 스크린샷이 폰 목업에 들어가고, 긴 3장(③④⑤)은 하단 페이드로 자연스럽게 마무리된다.
- 스크롤 시 섹션이 부드럽게 페이드업하며, `prefers-reduced-motion`에선 즉시 표시된다.
- 커뮤니티 섹션엔 외부/내부 링크가 없다.
- 스트레스 섹션 뒤 의료 면책이 노출된다.
- 타입체크·린트·기존 테스트 통과.
