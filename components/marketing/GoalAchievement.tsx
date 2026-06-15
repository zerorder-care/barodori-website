import { Container } from '@/components/ui/Container'

const goals = [
  { name: '고개 돌리기', done: 60, target: 60 },
  { name: '고개 기울이기', done: 45, target: 60 },
  { name: '터미타임', done: 12, target: 15 },
] as const

const week = [
  { label: '월', done: true },
  { label: '화', done: true },
  { label: '수', done: true },
  { label: '목', done: true },
  { label: '금', done: true },
  { label: '토', done: true },
  { label: '일', done: false, today: true },
] as const

const highlights = [
  {
    title: '병원에서 받은 운동을 오늘 목표로',
    desc: '보호자가 안내받은 운동을 하루 목표로 정해두고 시작합니다.',
  },
  {
    title: '한 번 할 때마다 기록으로',
    desc: '횟수와 시간, 아이 반응을 남겨 집에서 한 운동을 놓치지 않습니다.',
  },
  {
    title: '리포트로 꾸준함 확인',
    desc: '주간 달성률과 연속 기록을 보며 다음 상담 전 흐름을 정리합니다.',
  },
] as const

export function GoalAchievement() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            기록 · 리포트
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">기록이 쌓이면 리포트가 됩니다</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            운동 목표, 오늘 기록, 주간 흐름을 한 화면에서 확인합니다.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,420px)]">
          <ul className="grid gap-8">
            {highlights.map((item, index) => (
              <li key={item.title} className="flex gap-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary-dark)]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <GoalCardMockup />
        </div>
      </Container>
    </section>
  )
}

export function GoalCardMockup() {
  const allDone = goals.every((g) => g.done >= g.target)
  const achievedCount = goals.filter((g) => g.done >= g.target).length
  const streak = week.filter((d) => d.done).length

  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-[420px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
    >
      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold">오늘 목표</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">운동별 목표 대비 횟수</p>
          </div>
          <span className="rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            목표 설정
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {goals.map((goal) => {
            const ratio = Math.min(goal.done / goal.target, 1)
            const done = goal.done >= goal.target
            return (
              <div key={goal.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {done && <CheckIcon className="h-4 w-4 text-[var(--color-success)]" />}
                    {goal.name}
                  </span>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {goal.done} / {goal.target}회
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-pill bg-[#f0f0f0]">
                  <div
                    className="h-full rounded-pill"
                    style={{
                      width: `${ratio * 100}%`,
                      backgroundColor: done ? 'var(--color-success)' : 'var(--color-primary)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-5 rounded-[12px] bg-[var(--color-primary-light)] px-4 py-3 text-center text-sm font-bold text-[var(--color-primary-dark)]">
          {allDone
            ? '오늘 운동 목표를 모두 달성했어요'
            : `운동별 목표 ${goals.length}개 중 ${achievedCount}개 달성`}
        </p>
      </div>

      <div className="mt-4 rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">이번 주 운동</p>
          <span className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary-dark)]">
            연속 운동 {streak}일
          </span>
        </div>
        <div className="mt-4 flex justify-between">
          {week.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-1.5">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                  day.done
                    ? 'bg-[var(--color-primary)] text-white'
                    : day.today
                      ? 'border-2 border-dashed border-[var(--color-primary)] text-[var(--color-primary-dark)]'
                      : 'bg-[#f0f0f0] text-[var(--color-text-secondary)]'
                }`}
              >
                {day.done ? <CheckIcon className="h-4 w-4" /> : day.label}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-[16px] border border-[var(--color-border)] bg-white p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">주간 달성률</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-primary-dark)]">86%</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">상담 전 메모</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-primary-dark)]">4개</p>
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 10.5 8.5 15 16 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
