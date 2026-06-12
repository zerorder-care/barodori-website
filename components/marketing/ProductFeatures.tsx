import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'

const features = [
  {
    title: '오늘 할 운동',
    desc: '상담 후 정한 홈케어 운동을 오늘 루틴으로 확인해요.',
    icon: '/images/features/exercise.png',
    iconAlt: '오늘 할 홈케어 운동 아이콘',
  },
  {
    title: '시간·횟수 기록',
    desc: '스톱워치와 횟수 기록으로 오늘 한 운동을 바로 남겨요.',
    icon: '/images/steps/home-exercise.png',
    iconAlt: '시간과 횟수 기록 아이콘',
  },
  {
    title: '물리치료 방문 기록',
    desc: '병원에 다녀온 날, 받은 안내, 다음 예약을 함께 정리해요.',
    icon: '/images/steps/install-profile.png',
    iconAlt: '물리치료 방문 기록 아이콘',
  },
  {
    title: '사진·영상 리포트',
    desc: '아이 반응과 참고 자료를 모아 상담 전 흐름을 정리해요.',
    icon: '/images/features/report.png',
    iconAlt: '사진과 영상 리포트 아이콘',
  },
  {
    title: '달력으로 보는 꾸준함',
    desc: '운동한 날과 쉬어간 날을 달력에서 한눈에 확인해요.',
    icon: '/images/steps/analyze.png',
    iconAlt: '달력으로 보는 홈케어 기록 아이콘',
  },
  {
    title: '보호자 컨디션 체크',
    desc: '보호자의 스트레스 상태를 참고용 컨디션 체크로 가볍게 돌아봐요.',
    icon: '/images/features/support.png',
    iconAlt: '보호자 컨디션 체크 아이콘',
  },
] as const

export function ProductFeatures({ locale }: { locale: Locale }) {
  return (
    <section className="bg-[var(--color-bg-muted)] py-24">
      <Container>
        <div className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            핵심 기능 소개
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">홈케어 운동을 기록하고 다시 확인하는 흐름</h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            매일 한 운동, 아이 반응, 상담 전 참고 자료가 흩어지지 않도록 한곳에 모아요.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
