import Image from 'next/image'
import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { GoalCardMockup } from '@/components/marketing/GoalAchievement'

const featureSections = [
  {
    eyebrow: '오늘 목표',
    title: '오늘 할 홈케어 운동을 먼저 확인해요',
    desc: '병원에서 안내받은 운동을 오늘 목표로 세워두고, 무엇을 먼저 하면 되는지 한 화면에서 확인해요.',
    bullets: ['오늘의 목표 운동', '완료 현황', '바로 기록하기'],
    visual: 'phone',
  },
  {
    eyebrow: '운동 기록',
    title: '시간과 횟수, 아이 반응을 바로 남겨요',
    desc: '운동을 마친 뒤 따로 적어두지 않아도, 한 번 할 때마다 시간과 횟수, 짧은 메모를 기록으로 남겨요.',
    bullets: ['시간 기록', '횟수 기록', '반응 메모'],
    visual: 'record',
  },
  {
    eyebrow: '리포트 확인',
    title: '쌓인 기록은 리포트로 다시 봐요',
    desc: '목표 달성, 연속 운동, 주간 흐름을 모아 상담 전 차분히 돌아볼 수 있게 정리해요.',
    bullets: ['목표 달성률', '연속 운동', '주간 흐름'],
    visual: 'report',
  },
] as const

export function HomeFeatureSections() {
  return (
    <section id="home-features" className="bg-white pb-16 pt-4 sm:py-24" aria-labelledby="home-features-title">
      <div className="space-y-16 sm:mt-14 sm:space-y-20">
        {featureSections.map((feature, index) => (
          <FeatureBlock
            key={feature.title}
            eyebrow={feature.eyebrow}
            title={feature.title}
            desc={feature.desc}
            bullets={feature.bullets}
            reverse={index % 2 === 1}
            visual={<FeatureVisual type={feature.visual} />}
          />
        ))}
      </div>
    </section>
  )
}

function FeatureBlock({
  eyebrow,
  title,
  desc,
  bullets,
  visual,
  reverse,
}: {
  eyebrow: string
  title: string
  desc: string
  bullets: readonly string[]
  visual: ReactNode
  reverse?: boolean
}) {
  return (
    <Container>
      <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--color-primary-dark)] sm:text-lg">{eyebrow}</p>
          <h3 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">{title}</h3>
          <p className="mt-5 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">{desc}</p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">
            {bullets.map((bullet) => (
              <li key={bullet} className="rounded-pill bg-[var(--color-primary-light)] px-3 py-1">
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div>{visual}</div>
      </div>
    </Container>
  )
}

function FeatureVisual({ type }: { type: (typeof featureSections)[number]['visual'] }) {
  if (type === 'phone') return <PhoneScreenshot />
  if (type === 'report') return <GoalCardMockup />
  return <RecordMockup />
}

function PhoneScreenshot() {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[32px] bg-[#111827] p-2 shadow-[0_28px_60px_-32px_rgba(0,0,0,0.45)]">
      <div className="relative aspect-[900/1776] overflow-hidden rounded-[24px] bg-white">
        <Image
          src="/images/hero-phone.png"
          alt="바로도리 앱에서 오늘 홈케어 목표와 주간 리포트를 확인하는 화면"
          fill
          sizes="(max-width: 640px) 70vw, 280px"
          className="object-cover"
        />
      </div>
    </div>
  )
}

function RecordMockup() {
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-[12px] bg-[var(--color-primary-light)]">
            <Image src="/images/icons/record.png" alt="" fill sizes="56px" className="object-contain p-2" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">오늘 운동 기록</p>
            <p className="mt-1 text-lg font-bold">목 돌리기 스트레칭</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] bg-[var(--color-bg-muted)] p-4">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">운동 시간</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-primary-dark)]">02:30</p>
          </div>
          <div className="rounded-[12px] bg-[var(--color-bg-muted)] p-4">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">횟수</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-primary-dark)]">12회</p>
          </div>
        </div>

        <div className="mt-4 rounded-[12px] border border-[var(--color-border)] p-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">아이 반응 메모</p>
          <p className="mt-2 text-sm leading-relaxed">오른쪽은 편하게 따라왔고, 왼쪽은 조금 천천히 진행했어요.</p>
        </div>
      </div>
    </div>
  )
}
