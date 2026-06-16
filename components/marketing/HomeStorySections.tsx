import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { Reveal } from '@/components/marketing/Reveal'

type StorySection = {
  id: string
  title: ReactNode
  body: ReactNode
  chips: readonly string[]
  screen: { src: string; alt: string; tall?: boolean }
  bg: string
}

const sections: readonly StorySection[] = [
  {
    id: 'home',
    title: 'AI가 적정 운동량을 추천해줘요',
    body: '한눈에 달성율을 확인하고, 적정 운동량을 진행할 수 있어요. 막막해하지 않아도 돼요.',
    chips: ['오늘의 운동기록', '이번 주 목표', '스트레스 체크'],
    screen: {
      src: '/images/app-screens/home.png',
      alt: '바로도리 홈 화면 — 오늘의 운동 기록과 이번 주 목표를 한눈에 보여줘요',
    },
    bg: 'bg-white',
  },
  {
    id: 'exercise',
    title: '도리랑 같이 운동해요',
    body: '운동하는 동안엔 아이만 봐요. 우리 아이에만 집중할 수 있어요.',
    chips: ['스톱워치', '동요 재생', '끝나고 횟수 기록'],
    screen: {
      src: '/images/app-screens/exercise-timer.png',
      alt: '바로도리 운동 화면 — 도리 캐릭터와 운동 타이머, 동요 재생',
    },
    bg: 'bg-[var(--color-primary-light)]',
  },
  {
    id: 'record',
    title: (
      <>
        상세 리포트로
        <br />
        운동을 더 알차게
      </>
    ),
    body: (
      <>
        세심한 케어를 위한 가장 확실한 기록,
        <br />
        아이의 행복한 웃음으로 이어져요.
      </>
    ),
    chips: ['좌·우 횟수', '오늘의 메모', '사진·영상'],
    screen: {
      src: '/images/app-screens/session-report.png',
      alt: '바로도리 운동 리포트 — 운동별 좌우 횟수와 메모, 사진 기록',
      tall: true,
    },
    bg: 'bg-white',
  },
  {
    id: 'flow',
    title: (
      <>
      쌓인 기록은
        <br />
        빠른 졸업으로 이어저요
      </>
    ),
    body: (
      <>
        운동한 날, 물리치료 다녀온 날이 달력에 색으로 남아요.
        <br />
        이번 주 목표는 얼마나 채웠는지, 무슨 운동을 많이 했는지 한눈에
        정리해드려요.
      </>
    ),
    chips: ['예약·운동 달력', '주간 목표 달성률', '운동별 비중'],
    screen: {
      src: '/images/app-screens/calendar-report.png',
      alt: '바로도리 달력과 주간 리포트 — 운동·물리치료 기록과 목표 달성률',
      tall: true,
    },
    bg: 'bg-[var(--color-bg-muted)]',
  },
  {
    id: 'community',
    title: '혼자가 아니라는 걸, 여기서 느껴요',
    body: '같은 길을 가는 사람들의 진짜 이야기가 매일 올라와요.',
    chips: ['도리 이야기', '도리 운동일지', '댓글로 응원'],
    screen: {
      src: '/images/app-screens/community.png',
      alt: '바로도리 커뮤니티 — 보호자들이 운동 기록과 경험을 나누는 피드',
      tall: true,
    },
    bg: 'bg-white',
  },
  {
    id: 'parent',
    title: '스트레스 측정을 통해 보호자님도 살펴볼게요',
    body: (
      <>
        긴 싸움에서는 엄마가 지치지 않는 게 제일 중요해요.
        <br />
        스트레스 관리를 통해 바로도리는 늘 보호자님을 응원해요.
      </>
    ),
    chips: ['1분 셀프 체크', '4단계 안내', '기록으로 흐름 보기'],
    screen: {
      src: '/images/app-screens/parent-check.png',
      alt: '바로도리 보호자 컨디션 셀프 체크 — 1분 카메라로 오늘 상태를 4단계로 안내',
    },
    bg: 'bg-[var(--color-primary-light)]',
  },
]

export function HomeStorySections() {
  return (
    <>
      {sections.map((section, index) => (
        <section
          key={section.id}
          aria-labelledby={`story-${section.id}-title`}
          className={`${section.bg} py-20 sm:py-28`}
        >
          <Container>
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <Reveal>
                <h2
                  id={`story-${section.id}-title`}
                  className="text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl"
                >
                  {section.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
                  {section.body}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">
                  {section.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-pill border border-[#FDE68A] bg-white px-3 py-1"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delayMs={120}>
                <PhoneFrame
                  src={section.screen.src}
                  alt={section.screen.alt}
                  tall={section.screen.tall}
                />
              </Reveal>
            </div>
          </Container>
        </section>
      ))}
    </>
  )
}
