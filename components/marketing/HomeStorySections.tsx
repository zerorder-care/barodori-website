import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { Reveal } from '@/components/marketing/Reveal'

type StorySection = {
  id: string
  title: string
  body: string
  chips: readonly string[]
  screen: { src: string; alt: string; tall?: boolean }
  bg: string
}

const sections: readonly StorySection[] = [
  {
    id: 'home',
    title: '앱을 열면, 오늘 뭘 할지 바로 보여요',
    body: '오늘 운동 기록과 이번 주 목표, 다른 보호자들의 이야기까지 한 화면에 담았어요. 복잡하게 헤매지 않아도 돼요.',
    chips: ['오늘의 운동기록', '이번 주 목표', '스트레스 체크'],
    screen: {
      src: '/images/app-screens/home.png',
      alt: '바로도리 홈 화면 — 오늘의 운동 기록과 이번 주 목표를 한눈에 보여줘요',
    },
    bg: 'bg-white',
  },
  {
    id: 'exercise',
    title: '동요 틀고, 도리랑 같이 운동해요',
    body: '시작 버튼을 누르면 시간이 흐르고 동요가 흘러나와요. 몇 번 했는지는 끝나고 바로 적으면 되니까, 운동하는 동안엔 아이만 봐요.',
    chips: ['스톱워치', '동요 재생', '끝나고 횟수 기록'],
    screen: {
      src: '/images/app-screens/exercise-timer.png',
      alt: '바로도리 운동 화면 — 도리 캐릭터와 운동 타이머, 동요 재생',
    },
    bg: 'bg-[var(--color-primary-light)]',
  },
  {
    id: 'record',
    title: '방금 한 운동이, 좌우 횟수까지 그대로 남아요',
    body: '도리도리 좌 12번·우 10번, 터미타임 4분 30초. 숫자만이 아니라 ‘오른쪽은 잘 따라왔어요’ 같은 메모와 사진도 같이 담겨요. 다음 진료 때 그대로 보여드리면 돼요.',
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
    title: '쌓인 기록이, 이번 주 흐름을 보여줘요',
    body: '운동한 날, 물리치료 다녀온 날이 달력에 색으로 남아요. 이번 주 목표는 얼마나 채웠는지, 무슨 운동을 많이 했는지 한눈에 정리돼요.',
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
    body: '터미타임을 어떻게 나눴는지, 고개 돌리기를 며칠 만에 따라왔는지. 먼저 지나온 보호자들의 진짜 이야기가 매일 올라와요.',
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
    title: '아이를 돌본 만큼, 보호자님도 살펴요',
    body: '1분만 카메라를 보면 오늘 마음이 좋아요·괜찮아요·조금 지쳐있어요·힘들어요 중 어디쯤인지 알려드려요. 잘 돌보려면, 보호자님부터 괜찮아야 하니까요.',
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
