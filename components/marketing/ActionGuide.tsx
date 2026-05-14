import Image from 'next/image'
import { Container } from '@/components/ui/Container'

const steps = [
  {
    title: '앱 설치 및 아이 정보 등록',
    desc: '앱을 다운로드하고 우리 아이 정보를 등록해요',
    image: '/images/steps/install-profile.png',
    imageAlt: '앱 설치와 아이 정보 등록 일러스트',
  },
  {
    title: '아이 상태 기록하기',
    desc: '가이드에 따라 사진을 촬영해 상태 변화를 기록해요',
    image: '/images/steps/measure.png',
    imageAlt: '아이 상태 기록 일러스트',
  },
  {
    title: '보조 리포트와 운동 루틴 확인',
    desc: '기록을 바탕으로 참고 리포트와 운동 루틴을 확인해요',
    image: '/images/steps/analyze.png',
    imageAlt: '보조 리포트 확인 일러스트',
  },
  {
    title: '가정에서 운동 루틴 진행',
    desc: '음성 가이드와 함께 루틴을 진행해요',
    image: '/images/steps/home-exercise.png',
    imageAlt: '가정 운동 루틴 진행 일러스트',
  },
] as const

export function ActionGuide() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            이용 방법
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">단 4단계로 시작하는 가정 관리</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">앱 설치부터 운동까지, 어렵지 않아요</p>
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
