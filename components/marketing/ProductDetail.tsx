import Image from 'next/image'
import { Container } from '@/components/ui/Container'

const sections = [
  {
    title: '사진 기반 상태 기록',
    desc: '가이드에 맞춰 촬영하면 기울기, 가동범위, 두상 변화 흐름을 기록합니다. 보호자가 놓치기 쉬운 변화를 참고 지표로 살펴볼 수 있도록 돕습니다.',
    image: '/images/features/measurement.png',
  },
  {
    title: '참고 운동 루틴',
    desc: '아이 정보와 보호자 기록을 참고해 기울이기, 회전, 도리도리, 터미타임 루틴을 코스형으로 안내합니다.',
    image: '/images/features/exercise.png',
  },
  {
    title: '운동 보조 기능',
    desc: '스테레오 음원과 음성 가이드로 아이가 고개를 돌릴 수 있도록 유도하고, 보호자가 루틴을 놓치지 않도록 돕습니다.',
    image: '/images/steps/home-exercise.png',
  },
  {
    title: '기록 및 리포트',
    desc: '운동 수행 기록과 상태 기록을 모아 변화 흐름을 확인합니다. 진료 상담 전 보호자가 상황을 정리하는 데 참고할 수 있습니다.',
    image: '/images/features/report.png',
  },
  {
    title: '보호자 지원 기능',
    desc: '부모 커뮤니티, 챗봇 기반 정보, 보호자 대상 콘텐츠를 통해 집에서 혼자 관리한다는 부담을 덜어줍니다.',
    image: '/images/features/support.png',
  },
] as const

export function ProductDetail() {
  return (
    <section className="bg-[var(--color-bg-muted)] py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            핵심 기능 소개
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">가정 관리의 흐름을 한 안에서</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            상태 기록부터 운동 루틴, 보조 음원, 리포트, 보호자 지원까지 다섯 가지 핵심 기능을 제공해요
          </p>
        </div>
      </Container>
      <div className="mt-12 space-y-20">
        {sections.map((s, i) => (
          <Container key={s.title}>
            <div className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                Feature {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-4 text-3xl font-bold">{s.title}</h3>
              <p className="mt-5 leading-relaxed text-[var(--color-text-secondary)]">{s.desc}</p>
              <ul className="mt-6 space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li>• 아이 상태 변화를 기록으로 확인</li>
                <li>• 보호자가 따라가기 쉬운 단계형 안내</li>
                <li>• 기록과 리포트로 변화 흐름 확인</li>
              </ul>
            </div>
            <div className="grid min-h-[320px] place-items-center rounded-[16px] border border-[var(--color-border)] bg-white p-8 shadow-sm">
              <div className="relative aspect-square w-full max-w-[220px]">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  sizes="(max-width: 640px) 60vw, 220px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          </Container>
        ))}
      </div>
    </section>
  )
}
