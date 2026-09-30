# 한국어 홈 리모델링 (앱 2.0.0 세계관 정렬) 설계 문서

- 날짜: 2026-09-29
- 대상: 한국어 홈(`app/[locale]/(site)/page.tsx`)과 마케팅 섹션(`components/marketing/*`), 전역 헤더 로고, 설치 CTA
- 상태: 구성 합의 완료, 구현 계획 단계로 넘어간다
- 시안: 히어로 B안(크림 무대와 폰 세 대), 팀 검토로 확정
- 입력 자산: Figma `바로도리 v2.0.0 디자인`(파일 키 `IwydlhR7ql4UlZoHKZYYeh`), 노션 `2.0.0 스토어 제출 체크리스트`

## 1. 배경과 목표

현재 홈은 2026년 6월에 짠 6섹션 구성이고, 그 내용은 1.4 앱을 설명한다. AI 운동량 추천, 커뮤니티 피드, 보호자 스트레스 측정은 앱 2.0.0에서 코드째 제거됐고, 홈케어 기록과 인사이트, 두상연구소는 한 줄도 없다. 헤더 로고도 앱의 도리 마스코트가 아닌 파란 원 심볼이라 스토어 아이콘과 다른 브랜드처럼 보인다.

이번 작업의 목표는 웹 첫 화면을 앱 2.0.0과 같은 세계관으로 맞추는 것이다. 스토어 첫 스크린샷, 앱 첫 화면, 웹 첫 화면이 한 흐름으로 읽히게 한다. 유료화 정보(3일 무료체험, 월 5,900원, 연 34,500원)를 처음으로 웹에 싣는다.

지키는 것도 분명하다. 캡슐형 스티키 헤더 구조, i18n 사전과 SEO 메타와 JSON-LD 구조, 두상 테스트 플로우, Pretendard와 토큰 파일, 등장 애니메이션 컴포넌트는 그대로 두고 그 위에 새 옷만 입힌다.

## 2. 확정된 페이지 구조

```
Header (도리 워드마크 로고, 우측 버튼은 "앱 다운로드")
  ↓
1 Hero               B안: 크림 그라데이션, 폰 세 대, 도리와 아기 캐릭터
2 홈케어 기록          흰 배경, 카테고리 선택 화면
3 운동                옅은 노랑 배경, 운동 세션 화면, 놀이매트 장식
4 주간 리포트          흰 배경, 주간 리포트 화면
5 두상 비교            옅은 노랑 배경, 두상 리포트 화면, 두상 테스트 링크
6 함께                흰 배경, 보호자 연동과 두상연구소 카드 두 장
7 가격                크림 그라데이션, 무료체험과 연간, 월간 카드
8 이용 안내            SafetyNotice 유지, 스트레스 문구 제거
9 설치 CTA            옅은 노랑 그라데이션, 스토어 버튼과 QR
  ↓
Footer (사업자 정보와 면책 유지, 태그라인만 교체)
```

홈 본문에서 빠지는 것은 옛 6섹션 전부와 그 스크린샷 6장, 그리고 짙은 회색 설치 CTA 블록이다. 커뮤니티, 스트레스 측정, AI 운동량 추천은 어떤 형태로도 남기지 않는다.

## 3. 섹션별 상세

카피는 앱스토어 스크린샷의 검수 문구를 그대로 쓴다. 6번 함께와 7번 가격만 새로 쓴다. 문장 부호 규칙은 4절을 따른다.

### 3.1 헤더

| 영역 | 변경 |
| --- | --- |
| 로고 | 파란 원 심볼과 텍스트 lockup을 도리 마스코트와 한국어 워드마크 lockup 이미지로 교체한다. 높이 28px. |
| 내비 | 현행 유지. 두상 테스트, 바로도리 컨텐츠, 자주 묻는 질문 |
| 언어 전환 | 현행 유지. KO/EN |
| 우측 버튼 | "시작하기"(로그인)를 "앱 다운로드"(`/{locale}/install`)로 바꾼다. 앱이 출시된 지금 첫 행동은 로그인이 아니라 설치다. |
| 로그인 후 | 현행 유지. 마이페이지, 로그아웃 |

로그인 진입은 마이페이지 링크와 설치 페이지에서 계속 닿을 수 있으므로 헤더에서 뺀다.

### 3.2 히어로 (B안)

- 배경: `#FFF3D2`에서 `#FFF9EB`를 거쳐 흰색으로 내려오는 세로 그라데이션. 페이월 화면의 톤이다.
- 눈썹: "3일 무료체험, 끝나도 자동결제 없음". 흰 배경 알약, 글자색 `#903E00`.
- 제목: "우리 아이 맞춤 홈케어, / 오늘부터 바로도리". "바로도리"만 orange 700(`#FE9A00`).
- 본문: "기록하고, 관리하고, 변화를 확인해요."
- 주 CTA: "앱 다운로드", orange 500 배경에 gray 900 글자, 높이 56px. 설치 페이지로 이동.
- 보조 CTA: "두상 테스트 먼저 해보기", orange 100 배경에 `#903E00` 글자. `/{locale}/head-test`로 이동.
- 신뢰 문구: "iOS와 Android, 한국어와 영어, 일본어, 스페인어 지원". gray 500, 13px.
- 무대: 폰 세 대. 가운데 홈 화면이 앞에 크게, 왼쪽 주간 리포트와 오른쪽 두상 리포트가 각각 7도 기울어 뒤에 선다. 왼쪽 아래 도리(하트 든 포즈), 오른쪽 아래 아기 캐릭터(축하 포즈). 무대 아래 여백에서 폰 하단이 잘려 다음 섹션으로 이어진다.
- 모바일: 제목과 CTA 아래에 홈 화면 폰 한 대만 남기고 도리가 왼쪽 아래에서 고개를 내민다. 아기 캐릭터와 나머지 폰은 숨긴다.

히어로는 `100vh`로 키우지 않는다. 데스크톱 기준 높이 약 680px이고 폰 무대가 자연스럽게 잘리는 구성이다.

### 3.3 홈케어 기록

- 라벨: `홈케어 기록`
- 제목: **맞춤형 홈케어를 한번에 기록해요**
- 본문: 운동부터 수면, 자세, 수유, 놀이까지 관리해요.
- 보조 문장: 자주 남기는 질문은 빠른 기록으로 묶어 한 번에 적어요.
- 화면: 홈케어 카테고리 선택(`1270:15210`)
- 배경: 흰색. 텍스트 왼쪽, 폰 오른쪽.
- alt: "바로도리 홈케어 화면, 운동과 수면, 자세, 수유, 놀이 중 기록할 항목을 골라요"

### 3.4 운동

- 라벨: `운동`
- 제목: **아이에게 맞는 운동을 차근차근 따라해요**
- 본문: 운동 방법을 확인하며 기록해요.
- 화면: 운동 세션 횟수 진행 화면(`1270:16731`)
- 배경: orange 50(`#FFF7E0`). 폰 왼쪽, 텍스트 오른쪽. 폰 뒤에 앱 홈의 놀이매트 일러스트를 낮은 불투명도로 깔고 아기 캐릭터(서 있는 포즈)를 폰 옆에 세운다. 히어로 A안의 재료를 여기서 쓴다.
- alt: "바로도리 운동 화면, 고개 기울이기 10회 중 1회 진행"

### 3.5 주간 리포트

- 라벨: `인사이트`
- 제목: **이번주 홈케어 기록을 확인해요**
- 본문: 한 주 동안의 생활 기록을 확인해요.
- 보조 문장: 비슷한 월령 아이들의 평균과 나란히 봐요.
- 화면: 주간 리포트(`2295:30890`). 캡처는 "도리의 친구들은 지금" 카드가 프레임 안에 보이도록 위에서 자른다.
- 배경: 흰색. 텍스트 왼쪽, 폰 오른쪽.
- alt: "바로도리 주간 리포트, 이번주 터미타임과 수면, 수유, 놀이 기록"

### 3.6 두상 비교

- 라벨: `두상케어`
- 제목: **두상 변화를 한눈에 비교해보세요**
- 본문: 사진과 외곽선으로 변화를 쉽게 확인할 수 있어요.
- 링크: "앱 설치 전에 두상 유형부터 확인해보기 →" (`/{locale}/head-test`). 웹에서 앱으로 넘어가는 자체 퍼널이라 이 섹션에만 링크를 둔다.
- 화면: 두상 리포트 비교(`3186:14744`)
- 배경: orange 50. 폰 왼쪽, 텍스트 오른쪽.
- alt: "바로도리 두상 리포트, 외곽선 비교와 사진 비교"

### 3.7 함께

카드 두 장을 나란히 둔다. 흰 배경, 카드는 gray 50 바탕에 테두리 없이 `shadow/card`.

| 카드 | 제목 | 본문 | 그림 |
| --- | --- | --- | --- |
| 보호자 연동 | 구독 하나로 두 보호자가 함께 기록해요 | 초대 코드로 연결하면 기록과 리포트를 같이 보고, 구독도 함께 써요. | 보호자 아바타 스티커 두 개 |
| 두상연구소 | 월령별 아티클과 병원 찾기 | 지금 월령에 맞는 홈케어 팁을 읽고, 가까운 의료기관을 찾아봐요. | 두상연구소 아티클 썸네일 |

이 섹션에는 링크를 두지 않는다. 앱 안 기능 소개다.

### 3.8 가격

- 배경: 히어로와 같은 크림 그라데이션. 오른쪽에 페이월의 도리와 아기 일러스트.
- 라벨: `이용 요금`
- 제목: **3일은 무료로, 그다음은 마음에 들 때만**
- 본문: 무료체험이 끝나도 자동으로 결제되지 않아요. 구독은 직접 시작할 때만 열려요.
- 카드 두 장:
  - 연간 구독. 배지 "51% OFF". 큰 글자 "월 2,875원", 작은 글자 "연 34,500원". 기본 선택 상태로 orange 500 테두리와 orange 50 바탕.
  - 월간 구독. 큰 글자 "월 5,900원", 작은 글자 "월 5,900원". 흰 바탕에 gray 200 테두리.
- 하단 문구 두 줄: "첫 결제 전 알림, 언제든 해지", "연동된 보호자와 구독을 함께 써요".
- 이 섹션의 CTA는 "앱 다운로드" 하나. 웹에서 결제하지 않으므로 구독 버튼을 두지 않는다.

가격 표기는 전부 `messages/ko.json`에 문자열로 둔다. 금액이 바뀌면 사전만 고친다.

### 3.9 이용 안내

`SafetyNotice`를 그대로 쓰되 홈에서는 `dict.medical.body`와 `dict.medical.emergency` 두 줄만 노출한다. 스트레스 측정 문구(`dict.medical.stress`)는 기능이 없어졌으므로 홈에서 빼고, 사전 키는 다른 페이지가 참조하지 않는지 확인한 뒤 삭제한다.

### 3.10 설치 CTA

짙은 회색 블록을 버리고 orange 50에서 흰색으로 내려오는 옅은 노랑 그라데이션으로 바꾼다. 눈썹 "기록, 관리, 확인"은 빼고 제목과 본문, 스토어 버튼, QR만 남긴다.

- 제목: **오늘의 홈케어 기록을 놓치지 않도록**
- 본문: 운동과 수면, 자세, 수유, 놀이를 기록하고, 주간 리포트와 두상 변화로 다시 확인해요.

앱은 출시됐으므로 `live` 분기의 사전예약 경로(`betaForm`)는 컴포넌트에서 제거한다.

### 3.11 푸터

사업자 정보, 개인정보처리방침과 이용약관 링크, 고객센터, 의료 면책은 그대로 둔다. 태그라인만 바꾼다.

- 태그라인: 아기 머리 기울임과 두상이 걱정될 때, 운동과 생활 기록으로 집에서 이어가는 홈케어 앱이에요.

## 4. 비주얼 시스템

### 4.1 토큰

앱 레포 `DESIGN.md`와 Figma Foundations의 값을 `app/globals.css`에 추가한다. 기존 토큰은 지우지 않고 다른 페이지가 계속 쓴다.

| 토큰 | 값 | 쓰임 |
| --- | --- | --- |
| `--color-orange-50` | `#FFF7E0` | 섹션 교대 배경, 가격 카드 선택 바탕 |
| `--color-orange-100` | `#FFEAB2` | 보조 버튼 바탕 |
| `--color-orange-500` | `#FFBB00` | 기본 버튼, 선택 테두리 |
| `--color-orange-700` | `#FE9A00` | 제목 강조 글자 |
| `--color-orange-900` | `#FD6806` | 배지, 가격 강조 |
| `--color-hero-fg` | `#903E00` | 노랑 바탕 위 보조 글자 |
| `--color-gray-900` | `#262626` | 제목, 기본 버튼 글자 |
| `--color-gray-600` | `#7B7B7B` | 본문 |
| `--color-gray-500` | `#9D9D9D` | 신뢰 문구, 캡션 |
| `--color-gray-200` | `#E9E9E9` | 테두리 |
| `--color-cream-top` | `#FFF3D2` | 히어로와 가격 그라데이션 시작색 |

기존 `--color-primary-dark`(`#B77900`)로 칠하던 라벨과 칩은 이번 섹션에서 `--color-hero-fg`로 바꾼다. `#111827` 계열 제목은 새 섹션에서 `--color-gray-900`을 쓴다.

### 4.2 타이포

| 요소 | 스타일 |
| --- | --- |
| 히어로 제목 | Bold, 34px에서 54px까지(`text-[34px] sm:text-5xl lg:text-[54px]`), 자간 -1px, 행간 1.18 |
| 섹션 제목 h2 | Bold, 28px에서 40px까지, 자간 -0.5px, 행간 1.2 |
| 본문 lead | Medium, 16px에서 19px까지, 행간 1.55, gray 600 |
| 라벨 | SemiBold 13px 알약, orange 50 바탕에 `#903E00` 글자 |
| 가격 큰 글자 | Bold 28px, `tabular-nums` |
| 신뢰 문구 | Medium 13px, gray 500 |

### 4.3 버튼

| 종류 | 스타일 | 쓰임 |
| --- | --- | --- |
| 기본 | orange 500 바탕, gray 900 글자, radius 12px, 높이 44px(히어로는 56px, radius 14px) | 앱 다운로드 |
| 보조 | orange 100 바탕, `#903E00` 글자 | 두상 테스트 먼저 해보기 |
| 텍스트 링크 | gray 900 글자, orange 300 밑줄 2px | 섹션 안 링크 |

### 4.4 폰 프레임

기존 `PhoneFrame`의 다크 프레임을 유지하되 프레임 색을 `#1C1C1E`, 바깥 radius 34px, 안쪽 radius 26px로 맞춘다. 화면 비율은 2.0.0 캡처 기준 `402/874`로 바꾼다. `tall` 페이드는 주간 리포트 한 곳만 쓴다.

### 4.5 문장 부호 규칙

원형 글자 배지(A, B, C 같은 목차 기호), 가운데점과 em-dash를 쓰지 않는다. 나열은 쉼표나 "와/과"로 잇는다. 라벨 앞에 점 아이콘을 두지 않는다. 카피와 코드 주석, 이 문서 모두에 적용한다.

## 5. 컴포넌트 아키텍처

### 5.1 새로 만드는 것

- `components/marketing/HeroV2.tsx`(서버): 3.2절 구성. 폰 세 대는 `PhoneFrame` 재사용. 도리와 아기는 `next/image`.
- `components/marketing/FeatureSections.tsx`(서버): 3.3절부터 3.6절까지 네 섹션. 사전의 `home.features[]`를 map. 각 항목은 `label, title, body, note?, link?, screenAlt`. 레이아웃 방향과 배경, 화면 파일은 컴포넌트 안 메타 배열이 id로 짝을 맞춘다(기존 `HomeStorySections` 패턴). 링크는 `link`가 있는 항목만 렌더한다.
- `components/marketing/TogetherCards.tsx`(서버): 3.7절 카드 두 장.
- `components/marketing/PricingSection.tsx`(서버): 3.8절. 가격 문자열은 사전에서 받는다.
- `components/layout/BarodoriLogo.tsx`: 도리 워드마크 lockup 이미지. `BarodoriMark`를 대체한다.

### 5.2 고치는 것

- `app/[locale]/(site)/page.tsx`: 렌더 순서를 `HeroV2 → FeatureSections → TogetherCards → PricingSection → SafetyNotice(home) → InstallCta`로 바꾼다.
- `components/layout/HeaderNav.tsx`: 로고를 `BarodoriLogo`로, 우측 버튼을 "앱 다운로드"(설치 페이지)로 바꾼다. 로그인 상태일 때의 마이페이지와 로그아웃은 유지한다.
- `components/marketing/InstallCta.tsx`: 배경과 카피를 3.10절대로 바꾸고 `betaForm` 분기를 제거한다.
- `components/marketing/SafetyNotice.tsx`: `variant="home"`을 추가해 두 줄만 노출한다.
- `components/marketing/PhoneFrame.tsx`: 4.4절 값으로 갱신한다.
- `components/marketing/Reveal.tsx`: 아래 5.4절.
- `components/layout/Footer.tsx`: 태그라인 키만 바뀐다. 구조 변경 없음.

### 5.3 지우는 것

참조를 `grep`으로 확인한 결과다. 홈 외의 페이지가 쓰는 파일은 남긴다.

- `components/marketing/HomeStorySections.tsx`와 테스트, `Hero.tsx`
- 홈에서 import가 끊긴 뒤 어디서도 참조하지 않는 `HomeTogetherSection.tsx`, `HomeFeatureSections.tsx`, `SecondaryPaths.tsx`, `HomePreviewSections.tsx`, `HomeCareLoop.tsx`, `ActionGuide.tsx`, `StatStrip.tsx`, `SymptomGrid.tsx`, `ArticleTeaserGrid.tsx`
- `GoalAchievement.tsx`는 마이페이지가 쓰므로 남긴다.
- `components/layout/BarodoriMark.tsx`와 테스트, `public/images/brand/barodori-mark.png`. 두상 테스트의 `MiniHeader.tsx`도 같은 심볼을 쓰므로 `BarodoriLogo`로 함께 바꾼 뒤 지운다.
- `public/images/app-screens/*.png` 6장

### 5.4 등장 애니메이션의 결함 수정

헤드리스 브라우저로 현재 홈을 찍어 보니 본문 섹션이 전부 투명한 채 남았다. `Reveal`이 마운트 직후부터 `opacity-0`을 걸고 `IntersectionObserver`가 발화해야만 보이기 때문이다. 크롤러 프리뷰나 관찰자가 늦게 도는 환경에서 본문이 비어 보이는 결함이다.

수정 원칙은 "정지 상태에서 보인다"이다. 초기 상태를 보이게 두고, 관찰자가 붙은 뒤에만 뷰포트 밖 요소를 숨겼다가 진입 시 올린다. 마운트 시점에 이미 뷰포트 안에 있는 요소는 숨기지 않는다. `prefers-reduced-motion` 처리는 유지한다.

## 6. i18n

`messages/ko.json`의 `home` 트리를 다시 짠다. `Dictionary` 타입이 `ko.json`에서 나오므로 `en.json`도 같은 키 구조를 갖춰야 한다. 영어 문구는 이번에 새로 번역해 넣되, 영어 페이지의 시각 QA와 카피 검수는 범위 밖이다.

```
home.seo.{title, description}                  # 2.0.0 문구로 갱신
home.hero.{eyebrow, title, titleAccent, body, ctaPrimary, ctaSecondary, trust}
home.features[]{id, label, title, body, note?, link?, screenAlt}
home.together.{label, title, cards[]{id, title, body}}
home.pricing.{label, title, body, trialNote, yearly{name, badge, monthlyEquivalent, total}, monthly{name, price, total}, notes[], cta}
home.installCta.{title, body}
footer.tagline                                  # 교체
medical.stress                                  # 삭제
nav.start                                       # "앱 다운로드"로 교체, 키는 nav.install 재사용
```

`home.storySections`와 `home.hero.titlePrimary`, `titleSecondary`, `subtitle`, `installCta.eyebrow`는 삭제한다.

## 7. 에셋

`public/images/home-v2/`에 둔다. 전부 Figma `IwydlhR7ql4UlZoHKZYYeh`에서 뽑는다.

| 파일 | 원본 노드 | 규격 |
| --- | --- | --- |
| `logo-ko.png` | Brand `1507:340` 안 Logo / Korean | 원본 446×120 |
| `dori-cheer.png` | 페이월 `2556:32892`의 도리 raw 이미지 | 1448×1086, 투명 배경 |
| `baby-celebrate.png` | Baro / Scene / Celebrate | 1254×1254, 투명 배경 |
| `baby-stand.png` | 홈 `1872:24378`의 아기 raw 이미지 | 2202×2764, 투명 배경, 1200px로 축소 |
| `playmat.png` | 홈 `1872:24378`의 놀이매트 raw 이미지 | 1049×1499 |
| `screen-home.png` | `1872:24378` | 2배 export, 804×1748 |
| `screen-weekly.png` | `2295:30890` | 2배 export, 804×1944 |
| `screen-head-report.png` | `3186:14744` | 2배 export, 804×1748 |
| `screen-record.png` | `1270:15210` | 2배 export, 804×1748 |
| `screen-exercise.png` | `1270:16731` | 2배 export, 804×1748 |
| `avatar-*.png` 2종 | Illustrations 페이지 Character 섹션 | 2배 export |
| `article-thumb.png` | 두상연구소 `2099:25714` 카드 썸네일 | 2배 export |

`get_screenshot`은 1배로만 내려주므로 폰 화면은 `download_assets`의 `defaultScale: 2`로 받는다. 원본 PNG는 `next/image`가 변환하므로 별도 압축은 하지 않되, 500KB를 넘는 파일은 sips로 폭을 줄인다.

## 8. 계측

기존 `cta_install_click` 이벤트와 `surface` 파라미터를 그대로 쓴다. 새 surface 값은 `hero`, `pricing`, `install_cta`, `header`다. 두상 테스트 링크 클릭은 `head_test_entry_click`을 새로 추가하고 `surface`에 `hero_secondary`와 `feature_head_report`를 실어 어느 진입이 효과적인지 본다. Amplitude 프로젝트는 웹 전용 `barodori_website`(809668)다.

## 9. 접근성과 모션

- 섹션마다 `aria-labelledby`로 h2를 연결한다. 라벨 알약은 장식이다.
- 폰 화면 `alt`는 3절의 문구를 쓴다. 도리와 아기 일러스트는 장식이므로 `alt=""`.
- 색 대비: gray 600 본문은 흰색과 orange 50 위에서 AA를 넘는다. `#903E00` 라벨은 orange 50과 orange 100 위에서 AA를 넘는다. 히어로 제목의 orange 700 강조 글자는 큰 글자 기준(24px 이상)에서만 쓴다.
- 등장 애니메이션은 5.4절 원칙대로 정지 상태에서 보이고, `prefers-reduced-motion`에서는 변형 없이 표시한다.

## 10. 테스트

- `FeatureSections.test.tsx`: 네 섹션 제목 렌더, 두상 비교에만 링크가 있고 나머지는 링크가 없음, 각 화면 alt 존재.
- `PricingSection.test.tsx`: 사전의 금액 문자열이 그대로 렌더되고, 구독 버튼이 없음.
- `HeaderNav.test.tsx`: 로고 alt가 "바로도리", 우측 버튼이 설치 페이지를 가리킴, 로그인 상태에서 마이페이지와 로그아웃 유지.
- `Reveal.test.tsx`: 마운트 직후 콘텐츠가 숨겨지지 않음, `IntersectionObserver`가 없는 환경에서 보임.
- `InstallCta` 렌더 스냅샷 대신 스토어 버튼 두 개와 QR 존재만 확인.
- `npm run typecheck`, `npm run lint`, `npm run i18n:check`, `npm test` 통과.

## 11. 범위 밖

- 영어 홈의 시각 QA와 카피 검수. 키 구조만 맞춘다.
- 설치 페이지 본문, 아티클과 자주 묻는 질문, 두상 테스트 플로우 내부.
- 미국과 일본 가격 표기. 영어 페이지 가격 섹션은 이번에 숫자 없이 "3일 무료체험" 문구만 둔다.
- 스크롤 고정형 연출. 정적 스택과 페이드업만 쓴다.
- 커뮤니티, 뉴스룸, 후기 라우트 재공개.

## 12. 성공 기준

- 홈이 `Header → HeroV2 → FeatureSections(4) → TogetherCards → PricingSection → SafetyNotice → InstallCta → Footer` 순으로 렌더된다.
- 헤더 로고가 도리 워드마크이고 우측 버튼이 설치 페이지로 간다.
- 히어로가 B안과 같이 폰 세 대와 도리, 아기 캐릭터를 보여주고, 모바일에서는 폰 한 대만 남는다.
- 가격 섹션에 연 34,500원(월 2,875원, 51% OFF)과 월 5,900원이 표시되고, 웹에는 구독 버튼이 없다.
- 홈 본문 어디에도 커뮤니티, 스트레스, AI 추천 문구와 옛 스크린샷이 없다.
- 헤드리스 브라우저로 찍은 첫 프레임에서 모든 섹션 본문이 보인다.
- 홈 본문과 카피에 원형 글자 배지, 가운데점, em-dash가 없다.
- 타입체크, 린트, i18n 검사, 테스트가 모두 통과한다.
