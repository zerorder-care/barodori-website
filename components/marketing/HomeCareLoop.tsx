import Image from 'next/image'
import { Container } from '@/components/ui/Container'

const steps = [
  {
    title: '운동 목표 세우기',
    desc: '병원에서 안내받은 운동을 오늘 할 목표로 정해두고 시작해요.',
    icon: '/images/icons/exercise.png',
    alt: '운동 목표를 세우는 아이콘',
  },
  {
    title: '집에서 한 운동 기록하기',
    desc: '시간과 횟수, 아이 반응을 바로 남겨 홈케어 흐름을 놓치지 않아요.',
    icon: '/images/icons/record.png',
    alt: '집에서 한 운동을 기록하는 아이콘',
  },
  {
    title: '리포트로 꾸준히 추적하기',
    desc: '목표 달성, 연속 운동, 주간 흐름을 리포트로 확인해요.',
    icon: '/images/icons/report.png',
    alt: '운동 리포트를 확인하는 아이콘',
  },
] as const

export function HomeCareLoop() {
  return (
    <section id="homecare-loop" className="bg-white pb-20 pt-24 sm:py-24" aria-labelledby="homecare-loop-title">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-sm font-bold text-[var(--color-primary-dark)]">홈케어 루프</p>
            <h2 id="homecare-loop-title" className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              병원에서 배운 운동을
              <br />
              집에서도 이어가게
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            바로도리는 운동 방법을 판단하지 않습니다. 보호자가 안내받은 운동을 목표로 세우고, 집에서 한 기록을 모아 꾸준히 이어가도록 돕습니다.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-white">
                  <Image src={step.icon} alt={step.alt} fill sizes="56px" className="object-contain p-1" />
                </div>
                <p className="text-sm font-bold text-[var(--color-primary-dark)]">0{index + 1}</p>
              </div>
              <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
