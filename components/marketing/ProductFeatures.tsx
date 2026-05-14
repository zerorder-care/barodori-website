import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'

const features = [
  {
    title: 'AI 기반 상태 측정',
    desc: '기울기, 가동범위, 두상 변화를 눈대중이 아닌 기록으로 확인',
    icon: '/images/features/measurement.png',
    iconAlt: 'AI 상태 측정 아이콘',
  },
  {
    title: '맞춤형 운동 프로그램',
    desc: '사경 유형과 월령에 맞춘 코스형 가정 운동 루틴',
    icon: '/images/features/exercise.png',
    iconAlt: '맞춤 운동 프로그램 아이콘',
  },
  {
    title: '운동 기록 및 리포트',
    desc: '하루 운동과 측정 기록을 쌓아 아이의 변화를 차분하게 추적',
    icon: '/images/features/report.png',
    iconAlt: '운동 기록 리포트 아이콘',
  },
  {
    title: '보호자 지원',
    desc: '커뮤니티, 챗봇, 정보 콘텐츠로 보호자의 막막함을 덜어주는 구조',
    icon: '/images/features/support.png',
    iconAlt: '보호자 지원 아이콘',
  },
] as const

export function ProductFeatures({ locale }: { locale: Locale }) {
  return (
    <section className="bg-[var(--color-bg-muted)] py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            핵심 기능 소개
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">우리 아이의 회복, 이렇게 도와드려요</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            AI 측정부터 맞춤 운동, 기록 관리까지 가정 재활의 모든 과정을 한 번에
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, index) => (
            <article key={f.title} className="min-h-[360px] rounded-[8px] border border-[var(--color-border)] bg-white p-7">
              <div className="relative h-16 w-16 overflow-hidden rounded-[8px] bg-[#f2f2f2]">
                <Image src={f.icon} alt={f.iconAlt} fill sizes="64px" className="object-contain p-1" />
              </div>
              <p className="mt-8 text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                Feature {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 text-xl font-bold">{f.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{f.desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/product`}
            className="inline-flex min-h-11 items-center rounded-[8px] border border-[var(--color-text-primary)] px-6 text-sm font-semibold"
          >
            제품 자세히 보기 →
          </Link>
        </div>
      </Container>
    </section>
  )
}
