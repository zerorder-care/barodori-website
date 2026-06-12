import Image from 'next/image'
import { Container } from '@/components/ui/Container'

const steps = [
  {
    title: '오늘 홈케어 확인',
    desc: '담당 전문의·치료사와 상담 후 정한 오늘의 운동을 확인해요.',
    image: '/images/steps/install-profile.png',
    imageAlt: '오늘 홈케어 확인 일러스트',
  },
  {
    title: '시간·횟수 바로 기록',
    desc: '스톱워치와 횟수 기록으로 오늘 한 운동을 남겨요.',
    image: '/images/steps/home-exercise.png',
    imageAlt: '시간과 횟수 기록 일러스트',
  },
  {
    title: '아이 반응과 사진·영상 메모',
    desc: '운동 중 반응과 참고 자료를 짧게 정리해요.',
    image: '/images/steps/measure.png',
    imageAlt: '아이 반응과 사진 영상 메모 일러스트',
  },
  {
    title: '달력·리포트로 다시 보기',
    desc: '운동한 날과 쉬어간 날, 상담 전 흐름을 차분히 확인해요.',
    image: '/images/steps/analyze.png',
    imageAlt: '달력과 리포트 확인 일러스트',
  },
] as const

export function ActionGuide() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            이용 방법
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">오늘의 홈케어를 기록으로 남기는 방법</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">큰 준비보다 오늘 한 일을 놓치지 않는 흐름이 먼저입니다.</p>
        </div>
        <ol className="mt-12 grid gap-6 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-[8px] border border-[var(--color-border)] bg-[#f7f7f7] p-7 text-center">
              {i < steps.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-2xl text-[#9b9b9b] lg:block">
                  →
                </span>
              )}
              <p className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">Step {String(i + 1).padStart(2, '0')}</p>
              <div className="relative mx-auto mt-5 h-24 w-24 overflow-hidden rounded-full bg-white">
                <Image src={step.image} alt={step.imageAlt} fill sizes="96px" className="object-contain p-1" />
              </div>
              <h3 className="mt-5 text-lg font-bold leading-snug">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
